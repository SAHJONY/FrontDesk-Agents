// Autonomous worldwide lead-sweep engine.
//
// Walks a rotating grid of (metro × industry) cells across the globe. Each run
// processes a small batch of cells (so it fits inside a serverless invocation),
// discovers businesses that have NO website or an OUTDATED one (via
// discoverProspects → Google Places + site audit), dedupes against the CRM, and
// persists the qualifying prospects as scored leads. A persisted cursor advances
// every run and wraps around, so coverage expands across the whole world over
// time without ever re-billing the same cell twice in a cycle.

import { discoverProspects, type Prospect } from "@/lib/leads-find";
import { placesConfigured } from "@/lib/leads-find";
import { addLeadDedup, listLeads, getState, setState, type Lead } from "@/lib/store";

const STATE_FILE = "lead-sweep-state.json";

// Worldwide metro coverage — major business hubs across every inhabited
// continent. The sweep rotates through these so leads come from everywhere,
// not just one country. Extend freely; the cursor math adapts automatically.
export const METROS: string[] = [
  // North America
  "New York, USA", "Los Angeles, USA", "Chicago, USA", "Houston, USA", "Miami, USA",
  "Toronto, Canada", "Mexico City, Mexico", "Monterrey, Mexico",
  // South America
  "São Paulo, Brazil", "Buenos Aires, Argentina", "Bogotá, Colombia", "Lima, Peru", "Santiago, Chile",
  // Europe
  "London, UK", "Manchester, UK", "Madrid, Spain", "Barcelona, Spain", "Paris, France",
  "Berlin, Germany", "Rome, Italy", "Milan, Italy", "Amsterdam, Netherlands", "Lisbon, Portugal", "Warsaw, Poland",
  // Middle East & Africa
  "Dubai, UAE", "Riyadh, Saudi Arabia", "Istanbul, Turkey", "Cairo, Egypt",
  "Lagos, Nigeria", "Nairobi, Kenya", "Johannesburg, South Africa", "Cape Town, South Africa",
  // Asia
  "Mumbai, India", "Delhi, India", "Bengaluru, India", "Singapore", "Bangkok, Thailand",
  "Jakarta, Indonesia", "Manila, Philippines", "Kuala Lumpur, Malaysia", "Ho Chi Minh City, Vietnam",
  "Tokyo, Japan", "Seoul, South Korea",
  // Oceania
  "Sydney, Australia", "Melbourne, Australia", "Auckland, New Zealand",
];

// High-value local-service verticals: businesses that live or die on phone
// calls + bookings, and most need (or need to replace) a website.
export const INDUSTRIES: string[] = [
  "dentist", "law firm", "plumber", "HVAC contractor", "roofing contractor",
  "electrician", "auto repair shop", "real estate agency", "hair salon",
  "med spa", "chiropractor", "landscaping company", "pest control",
  "restaurant", "veterinary clinic", "accounting firm", "insurance agency",
];

export type SweepState = {
  cursor: number; // flattened index into the (metro × industry) grid
  runs: number;
  lastRunAt: string | null;
  totalScanned: number; // businesses examined on Google
  totalFound: number; // qualifying prospects discovered
  totalSaved: number; // new leads actually persisted (post-dedup)
  recent: SweepCellResult[]; // last few cells, for the admin dashboard
};

export type SweepCellResult = {
  at: string;
  location: string;
  industry: string;
  scanned: number;
  found: number;
  saved: number;
  topProspects: { name: string; location: string; needsSite: boolean; outdated: boolean; score: number; note: string }[];
};

export type SweepRunResult = {
  ok: boolean;
  ranCells: number;
  scanned: number;
  found: number;
  saved: number;
  cells: SweepCellResult[];
  cursor: number;
  gridSize: number;
  error?: string;
};

const DEFAULT_STATE: SweepState = { cursor: 0, runs: 0, lastRunAt: null, totalScanned: 0, totalFound: 0, totalSaved: 0, recent: [] };

export function gridSize(): number {
  return METROS.length * INDUSTRIES.length;
}

// Decode a flat cursor into a (metro, industry) pair. Stepping the cursor by 1
// advances the industry; metros change every INDUSTRIES.length steps — so a
// single run's batch stays within one or two cities (locality bias), while the
// world is still fully covered as the cursor wraps.
function cellAt(index: number): { location: string; industry: string } {
  const g = gridSize();
  const i = ((index % g) + g) % g;
  return { location: METROS[Math.floor(i / INDUSTRIES.length)], industry: INDUSTRIES[i % INDUSTRIES.length] };
}

export async function getSweepState(): Promise<SweepState> {
  const s = await getState<SweepState>(STATE_FILE, DEFAULT_STATE);
  return { ...DEFAULT_STATE, ...s };
}

export function prospectNote(p: Prospect): string {
  if (p.needsSite) return "No website — prime rebuild target";
  const why = p.auditReasons.slice(0, 2).join("; ");
  return `Outdated site (${p.staleness}/100)${why ? ": " + why : ""}`;
}

/**
 * Run one batch of the worldwide sweep.
 * @param cells how many (metro × industry) cells to process this invocation
 * @param maxPagesPerCell Google Places pages per cell (≈20 businesses/page)
 * @param now injectable timestamp for deterministic copyright-age math
 */
export async function runSweep(opts: { cells?: number; maxPagesPerCell?: number; now?: number } = {}): Promise<SweepRunResult> {
  const cells = Math.max(1, Math.min(8, opts.cells ?? 3));
  const maxPagesPerCell = Math.max(1, Math.min(3, opts.maxPagesPerCell ?? 2));

  if (!(await placesConfigured())) {
    return { ok: false, ranCells: 0, scanned: 0, found: 0, saved: 0, cells: [], cursor: 0, gridSize: gridSize(), error: "GOOGLE_PLACES_API_KEY not set" };
  }

  const state = await getSweepState();
  // Load existing leads ONCE; dedupe in-memory across the whole batch so two
  // cells in the same run can't both insert the same business.
  const existing: Lead[] = await listLeads();
  const seenPlace = new Set(existing.map((l) => l.placeId).filter(Boolean) as string[]);

  const cellResults: SweepCellResult[] = [];
  let scanned = 0, found = 0, saved = 0;
  const stamp = opts.now ? new Date(opts.now).toISOString() : new Date().toISOString();

  for (let n = 0; n < cells; n++) {
    const { location, industry } = cellAt(state.cursor + n);
    const res = await discoverProspects({ keyword: industry, locationText: location, maxPages: maxPagesPerCell, now: opts.now });
    scanned += res.scanned;
    const qualifying = res.prospects;
    found += qualifying.length;

    let cellSaved = 0;
    for (const p of qualifying) {
      if (p.placeId && seenPlace.has(p.placeId)) continue;
      const lead = await addLeadDedup({
        business: p.name,
        phone: p.phone || undefined,
        email: p.email || undefined,
        industry,
        source: "worldwide-sweep",
        website: p.website || undefined,
        address: p.address || undefined,
        location,
        placeId: p.placeId || undefined,
        score: p.score,
        tier: p.tier,
        needsSite: p.needsSite,
        outdated: p.outdated,
        note: prospectNote(p),
      });
      if (lead) {
        cellSaved++;
        if (p.placeId) seenPlace.add(p.placeId);
      }
    }
    saved += cellSaved;

    cellResults.push({
      at: stamp,
      location,
      industry,
      scanned: res.scanned,
      found: qualifying.length,
      saved: cellSaved,
      topProspects: qualifying.slice(0, 5).map((p) => ({
        name: p.name,
        location,
        needsSite: p.needsSite,
        outdated: p.outdated,
        score: p.score,
        note: prospectNote(p),
      })),
    });
  }

  const next: SweepState = {
    cursor: (state.cursor + cells) % gridSize(),
    runs: state.runs + 1,
    lastRunAt: stamp,
    totalScanned: state.totalScanned + scanned,
    totalFound: state.totalFound + found,
    totalSaved: state.totalSaved + saved,
    recent: [...cellResults, ...state.recent].slice(0, 30),
  };
  await setState(STATE_FILE, next);

  return { ok: true, ranCells: cells, scanned, found, saved, cells: cellResults, cursor: next.cursor, gridSize: gridSize() };
}
