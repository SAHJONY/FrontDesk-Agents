"use client";

// Site-wide autonomous translation. Detects the visitor's browser language on
// first visit (or honors their explicit pick from the floating globe), then
// translates every visible string on every page through /api/translate.
// Translations are cached server-side forever and client-side per session, so
// after the first visitor in a language the site renders near-instantly.

import { useCallback, useEffect, useRef, useState } from "react";

const LANGS: Record<string, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  it: "Italiano",
  pt: "Português",
  nl: "Nederlands",
  pl: "Polski",
  sv: "Svenska",
  da: "Dansk",
  no: "Norsk",
  fi: "Suomi",
  ru: "Русский",
  uk: "Українська",
  tr: "Türkçe",
  el: "Ελληνικά",
  he: "עברית",
  ar: "العربية",
  hi: "हिन्दी",
  zh: "中文",
  ja: "日本語",
  ko: "한국어",
  vi: "Tiếng Việt",
  th: "ไทย",
  id: "Bahasa Indonesia",
  ms: "Bahasa Melayu",
  ro: "Română",
  cs: "Čeština",
  hu: "Magyar",
  bg: "Български",
};

const RTL = new Set(["ar", "he"]);
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "TEXTAREA"]);

function shouldTranslate(text: string): boolean {
  const t = text.trim();
  if (t.length < 2) return false;
  // Skip pure numbers, prices, times, percentages — nothing to translate.
  if (/^[\d\s$€£%+./:,–—\-]*$/.test(t)) return false;
  return true;
}

function inSkippedSubtree(node: Node): boolean {
  let el: HTMLElement | null = node.parentElement;
  while (el) {
    if (SKIP_TAGS.has(el.tagName)) return true;
    if (el.dataset && el.dataset.noTranslate !== undefined) return true;
    el = el.parentElement;
  }
  return false;
}

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState("en");
  const [open, setOpen] = useState(false);
  const [working, setWorking] = useState(false);
  const cacheRef = useRef<Map<string, string>>(new Map());
  const langRef = useRef("en");
  const observerRef = useRef<MutationObserver | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retriesRef = useRef(0);

  const collectTargets = useCallback((): { node: Text | HTMLElement; kind: "text" | "placeholder"; original: string }[] => {
    const targets: { node: Text | HTMLElement; kind: "text" | "placeholder"; original: string }[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n: Node | null;
    while ((n = walker.nextNode())) {
      const textNode = n as Text;
      const value = textNode.nodeValue ?? "";
      if (!shouldTranslate(value) || inSkippedSubtree(textNode)) continue;
      targets.push({ node: textNode, kind: "text", original: value.trim() });
    }
    document.querySelectorAll<HTMLElement>("input[placeholder], textarea[placeholder]").forEach((el) => {
      const ph = el.getAttribute("placeholder") ?? "";
      if (shouldTranslate(ph) && !inSkippedSubtree(el)) {
        targets.push({ node: el, kind: "placeholder", original: ph.trim() });
      }
    });
    return targets;
  }, []);

  const applyLanguage = useCallback(
    async (next: string) => {
      if (next === "en") return;
      const targets = collectTargets();
      const cache = cacheRef.current;
      const unknown = [...new Set(targets.map((t) => t.original).filter((t) => !cache.has(`${next}:${t}`)))];

      // Swap from cache. Always re-collect: React may have re-rendered since
      // the last pass, which detaches previously gathered node references.
      const swap = () => {
        collectTargets().forEach((t) => {
          const translated = cache.get(`${next}:${t.original}`);
          if (!translated || translated === t.original) return;
          if (t.kind === "text") {
            const raw = (t.node as Text).nodeValue ?? "";
            const lead = raw.match(/^\s*/)?.[0] ?? "";
            const tail = raw.match(/\s*$/)?.[0] ?? "";
            (t.node as Text).nodeValue = `${lead}${translated}${tail}`;
          } else {
            (t.node as HTMLElement).setAttribute("placeholder", translated);
          }
        });
      };

      swap(); // instant for everything already cached

      if (unknown.length > 0) {
        setWorking(true);
        try {
          // Small chunks, applied as each lands — the page translates
          // progressively instead of all-at-once at the end.
          for (let i = 0; i < unknown.length; i += 50) {
            if (langRef.current !== next) return; // user switched mid-flight
            const slice = unknown.slice(i, i + 50);
            const res = await fetch("/api/translate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ lang: next, texts: slice }),
            });
            if (!res.ok) continue;
            const data = await res.json();
            slice.forEach((t, j) => {
              if (data.translations?.[j]) cache.set(`${next}:${t}`, data.translations[j]);
            });
            swap();
          }
        } finally {
          setWorking(false);
        }
        // Anything still untranslated (failed chunk, slow model) retries.
        const stillMissing = collectTargets().some((t) => !cache.has(`${next}:${t.original}`));
        if (stillMissing && retriesRef.current < 4) {
          retriesRef.current += 1;
          setTimeout(() => {
            if (langRef.current === next) applyLanguage(next);
          }, 2500);
        } else if (!stillMissing) {
          retriesRef.current = 0;
        }
      }

      document.documentElement.lang = next;
      document.documentElement.dir = RTL.has(next) ? "rtl" : "ltr";
    },
    [collectTargets]
  );

  const choose = useCallback(
    (next: string) => {
      setOpen(false);
      localStorage.setItem("fd_lang", next);
      langRef.current = next;
      setLang(next);
      if (next === "en") {
        // Simplest correct restore: re-render the English originals.
        window.location.reload();
        return;
      }
      applyLanguage(next);
    },
    [applyLanguage]
  );

  // First visit: honor saved choice, otherwise auto-detect from the browser.
  useEffect(() => {
    const saved = localStorage.getItem("fd_lang");
    const detected = (navigator.language || "en").slice(0, 2).toLowerCase();
    const initial = saved ?? (LANGS[detected] ? detected : "en");
    langRef.current = initial;
    setLang(initial);
    if (initial !== "en") {
      // Let hydration settle before mutating text nodes.
      const t = setTimeout(() => applyLanguage(initial), 600);
      return () => clearTimeout(t);
    }
  }, [applyLanguage]);

  // Re-translate anything React renders later (route changes, new sections).
  useEffect(() => {
    observerRef.current?.disconnect();
    if (lang === "en") return;
    const obs = new MutationObserver(() => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (langRef.current !== "en") applyLanguage(langRef.current);
      }, 400);
    });
    obs.observe(document.body, { childList: true, subtree: true, characterData: false });
    observerRef.current = obs;
    return () => obs.disconnect();
  }, [lang, applyLanguage]);

  return (
    <>
      {children}
      <div data-no-translate className="fixed bottom-5 left-5 z-[90]">
        {open && (
          <div className="glass mb-2 grid max-h-[60vh] w-64 grid-cols-2 gap-1 overflow-y-auto rounded-2xl p-3 scrollbar-slim">
            {Object.entries(LANGS).map(([code, label]) => (
              <button
                key={code}
                onClick={() => choose(code)}
                className={`rounded-lg px-2.5 py-1.5 text-left text-xs transition ${
                  lang === code ? "bg-teal-glow/20 text-teal-glow" : "text-slate-300 hover:bg-white/10"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
        <button
          onClick={() => setOpen(!open)}
          className="glass flex items-center gap-2 rounded-full px-4 py-2.5 text-sm text-slate-200 shadow-lg transition hover:border-teal-glow/50"
          aria-label="Choose language"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          {working ? "…" : LANGS[lang] ?? "Language"}
        </button>
      </div>
    </>
  );
}
