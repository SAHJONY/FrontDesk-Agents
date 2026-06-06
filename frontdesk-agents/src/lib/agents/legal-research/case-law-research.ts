// Case Law Research Agent
// Searches and analyzes case precedents for family court, immigration court, and bankruptcy court

import { CourtType, CaseLawEntry, CaseLawSearchResult } from './types'

// Simulated case law database — in production, connect to Westlaw, LexisNexis, or CourtListener API
const CASE_DATABASE: CaseLawEntry[] = [
  // === FAMILY LAW PRECEDENTS ===
  {
    caseName: 'In re Marriage of Smith',
    citation: '350 Cal.Rptr.3d 201 (Cal. Ct. App. 2023)',
    court: 'California Court of Appeal, Fourth District',
    year: 2023,
    outcome: 'affirmed',
    legalIssue: 'Child custody modification based on relocation request',
    rulingSummary: "A parent seeking to relocate with a child must demonstrate the move serves the child best interests, considering distance, impact on relationship with other parent, and stability. The trial court's custody modification was upheld where it found relocation benefits outweighed disruption.",
    keyPrecedent: 'Moved-away parent burden: demonstrate best interests by preponderance',
    appliedTest: 'Best interests of child standard with relocation factors',
    relevantStatute: 'Family Code § 3102',
    jurisdiction: 'California',
    applicability: 'Controls California custody relocation disputes. Applicable when primary custodian seeks to move more than 50 miles.',
  },
  {
    caseName: 'Doe v. Doe',
    citation: '487 P.3d 445 (Wash. 2021)',
    court: 'Washington Supreme Court',
    year: 2021,
    outcome: 'affirmed',
    legalIssue: 'Military deployment impact on child support obligation',
    rulingSummary: "Servicemember parent's deployment does not automatically justify child support modification. Courts must evaluate actual change in circumstances and ability to pay, not merely the deployment status alone. Temporary duty pay does not count as \"income\" for support calculations.",
    keyPrecedent: 'Deployment alone insufficient for support modification',
    appliedTest: 'Material change in circumstances test',
    relevantStatute: '50 U.S.C. § 3932',
    jurisdiction: 'Washington',
    applicability: 'Federal servicemember protection in family court. Prevents automatic support reduction based on deployment.',
  },
  {
    caseName: 'In re Custody of Peterson',
    citation: '234 Mich.App. 478 (1999)',
    court: 'Michigan Court of Appeals',
    year: 1999,
    outcome: 'reversed',
    legalIssue: 'Domestic violence impact on custody determination',
    rulingSummary: "A parent's history of domestic violence creates a rebuttable presumption against awarding custody. The presumption can only be overcome by clear and convincing evidence that the violent parent is the better choice for the child. Supervised visitation required where DV proven.",
    keyPrecedent: 'DV creates rebuttable presumption against custody for perpetrator',
    appliedTest: 'Clear and convincing evidence standard for overcoming DV presumption',
    relevantStatute: 'Mich. Comp. Laws § 722.23',
    jurisdiction: 'Michigan',
    applicability: 'Governs custody disputes where domestic violence is alleged. Requires attorney to present DV evidence clearly.',
  },
  {
    caseName: 'Estrada v. Estrada',
    citation: '83 Cal.Rptr.2d 393 (Cal. Ct. App. 2002)',
    court: 'California Court of Appeal',
    year: 2002,
    outcome: 'affirmed',
    legalIssue: 'Spousal support modification after long-term marriage',
    rulingSummary: 'In marriages exceeding 10 years, courts presume jurisdiction over spousal support until party remarries or obtains separate order. Support may be modified based on change of circumstances including cohabitation, remarriage of supported spouse, or retirement of paying spouse.',
    keyPrecedent: '10-year marriage creates ongoing support jurisdiction',
    appliedTest: 'Change of circumstances + formulaic support guidelines',
    relevantStatute: 'Family Code § 4336',
    jurisdiction: 'California',
    applicability: 'Long-term marriage spousal support modification. Critical in divorces over 10 years where support may continue indefinitely.',
  },
  // === IMMIGRATION LAW PRECEDENTS ===
  {
    caseName: 'Matter of M-S-',
    citation: '28 I&N Dec. 319 (BIA 2023)',
    court: 'Board of Immigration Appeals',
    year: 2023,
    outcome: 'affirmed',
    legalIssue: 'Asylum eligibility for gang-related persecution',
    rulingSummary: "Applicant must demonstrate past persecution or well-founded fear of persecution on account of a protected ground. Membership in a particular social group (former gang members) can qualify if the group is particular and the government is unable or unwilling to protect. Gang targeting based on voluntary association may not qualify without more.",
    keyPrecedent: 'Former gang membership as particular social group requires specific definition',
    appliedTest: 'Nexus + particularity + government inability test',
    relevantStatute: '8 U.S.C. § 1101(a)(42)',
    jurisdiction: 'Federal',
    applicability: 'Governs asylum claims based on gang violence. Must define social group narrowly and demonstrate government inability to protect.',
  },
  {
    caseName: 'Matter of Z-Y-Z-',
    citation: '28 I&N Dec. 371 (BIA 2021)',
    court: 'Board of Immigration Appeals',
    year: 2021,
    outcome: 'affirmed',
    legalIssue: 'Withholding of removal vs. asylum - fear of torture standard',
    rulingSummary: 'Torture standard under CAT is higher than persecution under asylum. Applicant must show government officials (or those acting under color of law) inflicted torture with intent. Mental torture requires severe pain and specific intent to cause suffering. Fear of generalized violence insufficient without government involvement.',
    keyPrecedent: 'CAT protection requires government involvement in torture',
    appliedTest: 'Intent + severity + government attribution test for torture',
    relevantStatute: '8 C.F.R. § 1208.18',
    jurisdiction: 'Federal',
    applicability: 'Critical for CAT protection claims. Distinguishes torture from persecution and requires specific government action.',
  },
  {
    caseName: 'Perez v. Mukasey',
    citation: '509 F.3d 44 (1st Cir. 2007)',
    court: 'First Circuit Court of Appeals',
    year: 2007,
    outcome: 'reversed',
    legalIssue: 'Cancellation of removal - extraordinary and extremely unusual hardship',
    rulingSummary: 'The "extraordinary and extremely unusual hardship" standard for cancellation of removal is demanding. Hardship to US citizen children must be beyond the normal consequences of deportation. Separation from parent combined with country conditions may qualify, but routine hardship claims fail.',
    keyPrecedent: 'Hardship must be extraordinary - normal deportation consequences insufficient',
    appliedTest: 'Extreme and unusual hardship to qualifying relative',
    relevantStatute: 'INA § 240A',
    jurisdiction: 'Massachusetts (1st Circuit)',
    applicability: 'Governs cancellation of removal cases. Use when client has US citizen children who would face extreme hardship from separation.',
  },
  {
    caseName: 'Matter of R-D-K-',
    citation: '27 I&N Dec. 446 (BIA 2018)',
    court: 'Board of Immigration Appeals',
    year: 2018,
    outcome: 'affirmed',
    legalIssue: 'Credibility determination in asylum proceeding',
    rulingSummary: 'An immigration judge may deny asylum based on inconsistent statements without an adverse credibility finding if the inconsistencies go to the heart of the claim. Inconsistencies in dates, locations, and identity should be explained with corroborating evidence. Applicant bears burden to prove eligibility.',
    keyPrecedent: 'Inconsistencies at heart of claim allow denial without formal adverse credibility',
    appliedTest: 'Corroboration requirement when inconsistencies exist',
    relevantStatute: '8 U.S.C. § 1158',
    jurisdiction: 'Federal',
    applicability: 'Critical for asylum interviews and hearings. Consistent storytelling with corroboration is essential.',
  },
  // === BANKRUPTCY LAW PRECEDENTS ===
  {
    caseName: 'In re Warner',
    citation: '639 B.R. 634 (Bankr. S.D.N.Y. 2021)',
    court: 'US Bankruptcy Court, SDNY',
    year: 2021,
    outcome: 'affirmed',
    legalIssue: 'Chapter 13 plan confirmation - good faith requirement',
    rulingSummary: 'Courts evaluate good faith in Chapter 13 plan confirmation by examining totality of circumstances including duration of bankruptcy, income accuracy, pre-bankruptcy planning, and whether debt was incurred in anticipation of bankruptcy. Some student loan debt included in disposable income calculation.',
    keyPrecedent: 'Totality of circumstances test for Chapter 13 good faith',
    appliedTest: 'Good faith totality test including pre-bankruptcy conduct',
    relevantStatute: '11 U.S.C. § 1325(a)(3)',
    jurisdiction: 'New York',
    applicability: 'Essential for Chapter 13 confirmation. Must show good faith through accurate schedules and reasonable plan.',
  },
  {
    caseName: 'In re Hsu',
    citation: '743 F.3d 1217 (9th Cir. 2014)',
    court: 'Ninth Circuit Court of Appeals',
    year: 2014,
    outcome: 'reversed',
    legalIssue: 'Chapter 7 discharge - substantial abuse under means test',
    rulingSummary: 'A debtor whose income exceeds the state median may still file Chapter 7 if special circumstances demonstrate necessity. The means test is a mechanical formula but courts may consider the totality of the financial situation. Medical debt and business failure are recognized special circumstances.',
    keyPrecedent: 'Means test is mechanical but special circumstances can override',
    appliedTest: 'Income + expenses + special circumstances = abuse determination',
    relevantStatute: '11 U.S.C. § 707(b)(2)',
    jurisdiction: 'California (9th Circuit)',
    applicability: 'Critical for high-income clients facing Chapter 7 dismissal. Medical debt and business failure are recognized exceptions.',
  },
  {
    caseName: 'In re Geiger',
    citation: '523 B.R. 605 (Bankr. E.D.N.C. 2005)',
    court: 'US Bankruptcy Court, EDNC',
    year: 2005,
    outcome: 'affirmed',
    legalIssue: 'Avoidance of preferential transfers to family members',
    rulingSummary: "Transfers to insiders (including family members) within one year of bankruptcy are presumed preferential and may be avoided if the trustee can demonstrate the debtor was insolvent at the time. Transfers within 90 days for contemporaneous exchange are protected. Loans to family require contemporaneous documentation.",
    keyPrecedent: 'Insider transfers within 1 year are preferential - contemporaneous exchange exception narrow',
    appliedTest: 'Insolvency + timeline + exchange contemporaneity test',
    relevantStatute: '11 U.S.C. § 547(b)',
    jurisdiction: 'North Carolina',
    applicability: 'Prevents prepetition loans to family from being recovered by trustee. Require contemporaneous documentation.',
  },
  {
    caseName: 'In re Touchstone',
    citation: '617 B.R. 540 (Bankr. D.S.C. 2020)',
    court: 'US Bankruptcy Court, DSC',
    year: 2020,
    outcome: 'affirmed',
    legalIssue: 'Chapter 11 discharge - absolute priority rule in individual cases',
    rulingSummary: "In individual Chapter 11 cases, the absolute priority rule requires that if unsecured creditors are not paid in full, the debtor cannot retain property whose value exceeds what is paid to creditors. Post-confirmation earnings continue to be property of the estate until the case is closed.",
    keyPrecedent: 'Absolute priority rule applies to individual Chapter 11 debtors',
    appliedTest: 'Unsecured creditors paid in full OR property surrendered test',
    relevantStatute: '11 U.S.C. § 1129(b)(2)(B)',
    jurisdiction: 'South Carolina',
    applicability: 'Governs individual Chapter 11 plans. Wealthy individuals must pay creditors or surrender equity.',
  },
]

function matchCaseLawEntries(query: string, courtType: CourtType): CaseLawEntry[] {
  const queryLower = query.toLowerCase()
  const keywords = queryLower.split(/\s+/).filter(w => w.length > 2)

  const courtMap: Record<CourtType, string[]> = {
    family: ['family', 'custody', 'divorce', 'support', 'marriage', 'parenting', 'spousal', 'domestic'],
    immigration: ['asylum', 'immigration', 'deportation', 'removal', 'visa', 'citizen', 'noncitizen', 'BIA', 'ICE'],
    bankruptcy: ['bankruptcy', 'chapter 7', 'chapter 13', 'chapter 11', 'discharge', 'trustee', 'creditor', 'insolvent'],
    ip: ['trademark', 'patent', 'copyright', 'intellectual property', 'USPTO', 'infringement', 'cease and desist'],
  }

  const relevantCourts = courtMap[courtType]

  return CASE_DATABASE
    .map(entry => {
      let score = 0

      // Court type match
      const jurisdictionLower = entry.jurisdiction.toLowerCase()
      if (relevantCourts.some(c => jurisdictionLower.includes(c) || entry.legalIssue.toLowerCase().includes(c))) {
        score += 5
      }

      // Keyword matching
      for (const kw of keywords) {
        if (entry.legalIssue.toLowerCase().includes(kw)) score += 3
        if (entry.caseName.toLowerCase().includes(kw)) score += 2
        if (entry.rulingSummary.toLowerCase().includes(kw)) score += 2
        if (entry.keyPrecedent.toLowerCase().includes(kw)) score += 4
        if (entry.relevantStatute.toLowerCase().includes(kw)) score += 2
      }

      return { entry, score }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ entry }) => entry)
}

function getGoverningStatutes(courtType: CourtType): string[] {
  const statuteMap: Record<CourtType, string[]> = {
    family: [
      'Family Code § 3102 (custody modification)',
      'Family Code § 4336 (spousal support jurisdiction)',
      'Mich. Comp. Laws § 722.23 (best interests factors)',
      '50 U.S.C. § 3932 (servicemember protection)',
    ],
    immigration: [
      '8 U.S.C. § 1101(a)(42) (asylum definition)',
      '8 U.S.C. § 1158 (asylum eligibility)',
      '8 C.F.R. § 1208.18 (CAT protection)',
      'INA § 240A (cancellation of removal)',
    ],
    bankruptcy: [
      '11 U.S.C. § 707(b)(2) (means test)',
      '11 U.S.C. § 1325(a)(3) (Chapter 13 good faith)',
      '11 U.S.C. § 547(b) (preference avoidance)',
      '11 U.S.C. § 1129(b)(2)(B) (absolute priority rule)',
    ],
    ip: [
      '15 U.S.C. § 1051 (Trademark Act - registration)',
      '15 U.S.C. § 1114 (trademark infringement remedies)',
      '15 U.S.C. § 1125 (false designation of origin)',
      '17 U.S.C. § 501 (copyright infringement)',
    ],
  }
  return statuteMap[courtType]
}

export class CaseLawResearchAgent {
  /**
   * Search case precedents for a given issue and court type.
   */
  public search(query: string, courtType: CourtType): CaseLawSearchResult {
    const results = matchCaseLawEntries(query, courtType)
    const mostRecentYear = results.length > 0
      ? Math.max(...results.map(r => r.year))
      : new Date().getFullYear()

    return {
      query,
      court: courtType,
      results: results.slice(0, 10),
      totalFound: results.length,
      mostRecentYear,
      governingStatutes: getGoverningStatutes(courtType),
    }
  }

  /**
   * Get all precedents for a specific legal issue across all court types.
   */
  public getPrecedentsForIssue(legalIssue: string): CaseLawSearchResult[] {
    const courtTypes: CourtType[] = ['family', 'immigration', 'bankruptcy']
    return courtTypes.map(ct => this.search(legalIssue, ct))
  }

  /**
   * Get the most recent case law updates for a court type.
   */
  public getRecentUpdates(courtType: CourtType, limit = 5): CaseLawEntry[] {
    return CASE_DATABASE
      .filter(entry => {
        const issue = entry.legalIssue.toLowerCase()
        const courtMap: Record<CourtType, string[]> = {
          family: ['family', 'custody', 'divorce', 'support', 'marriage'],
          immigration: ['asylum', 'immigration', 'deportation', 'removal'],
          bankruptcy: ['bankruptcy', 'chapter', 'discharge', 'trustee'],
          ip: ['trademark', 'copyright', 'patent', 'intellectual property', 'USPTO'],
        }
        return courtMap[courtType].some(c => issue.includes(c))
      })
      .sort((a, b) => b.year - a.year)
      .slice(0, limit)
  }

  /**
   * Analyze which cases support or undercut a legal theory.
   */
  public analyzeLegalTheory(theory: string, courtType: CourtType): {
    supportingCases: CaseLawEntry[]
    opposingCases: CaseLawEntry[]
    netPosition: string
  } {
    const results = matchCaseLawEntries(theory, courtType)
    const supporting = results.filter(r => r.outcome === 'affirmed')
    const opposing = results.filter(r => ['reversed', 'vacated'].includes(r.outcome))

    let netPosition: string
    if (supporting.length > opposing.length * 2) {
      netPosition = 'Favorable — majority of precedents support this theory'
    } else if (opposing.length > supporting.length * 2) {
      netPosition = 'Unfavorable — precedents tend to undermine this theory'
    } else {
      netPosition = 'Mixed — precedents cut both ways; outcome depends on specific facts'
    }

    return { supportingCases: supporting, opposingCases: opposing, netPosition }
  }
}

export const caseLawResearchAgent = new CaseLawResearchAgent()