// Court Procedures Agent
// Provides jurisdiction-specific court rules and procedural guidance for family, immigration, and bankruptcy courts

import { CourtType, CourtProceduresResult, CourtProcedureRule } from './types'

// Simulated court procedures database — in production, connect to court website APIs
const COURT_PROCEDURES: Record<string, {
  courtType: CourtType
  district: string
  localRules: CourtProcedureRule[]
  filingRequirements: string[]
  hearingProcedures: string[]
  criticalDeadlines: { event: string; daysBefore: number; rule: string }[]
  judgeSpecificNotes: { judgeName: string; note: string }[]
}> = {
  'Los Angeles Superior Court - Family': {
    courtType: 'family',
    district: 'California - Los Angeles',
    localRules: [
      {
        ruleNumber: 'LASC LR 5.1',
        title: 'Mandatory Declaration of Disclosure',
        description: 'Both parties must serve preliminary and final declarations of disclosure. Preliminary within 60 days of filing, final before trial.',
        requirements: ['Income declaration (DE-165)', 'Asset declaration (FL-142)', 'Debt declaration', 'Tax returns 2 years'],
        deadlines: ['Preliminary: 60 days after filing', 'Final: 14 days before trial'],
        commonMistakes: ['Serving incomplete declarations', 'Failing to update for changed circumstances', 'Not producing supporting documents'],
        strategicNotes: ['Complete disclosures early to facilitate settlement', 'Objections to inadequate disclosure must be filed within 30 days'],
      },
      {
        ruleNumber: 'LASC LR 5.2',
        title: 'Child Custody Investigation and Evaluation',
        description: 'When custody dispute exists, court may order custody evaluation. Parties may also stipulate to private evaluator.',
        requirements: ['At least one party requests evaluation', 'Child currently subject to dispute', 'No existing custody order within 6 months unless changed circumstances'],
        deadlines: ['Request at initial hearing or by motion', 'Evaluation completed within 90 days', 'Report due 30 days before trial'],
        commonMistakes: ['Not preparing children for evaluation process', 'Communicating with evaluator directly', 'Filing competing custody declarations without evidence'],
        strategicNotes: ['Present evidence of current parenting plan strengths', 'Document any safety concerns in declaration early'],
      },
      {
        ruleNumber: 'LASC LR 7.1',
        title: 'Mandatory Settlement Conference',
        description: 'All family law cases must attend settlement conference before trial date. Parties must submit settlement conference statements.',
        requirements: ['Settlement conference statement (FL-330)', 'All discovery responses', 'Preliminary declarations of disclosure', 'Proposed settlement terms'],
        deadlines: ['Statement due 10 days before settlement conference', 'All discovery complete 15 days before'],
        commonMistakes: ['Incomplete settlement statements', 'Failure to list all assets', 'Not considering tax consequences of settlement'],
        strategicNotes: ['Settlement conference is confidential — anything said cannot be used at trial', 'Be prepared with authority to settle or full settlement terms'],
      },
    ],
    filingRequirements: [
      'Petition and Summons (FL-100/FL-110)',
      'Declaration for Default or Notice of Appearance (FL-165)',
      'Child Custody and Visitation Order (FL-341)',
      'Property Declaration (FL-142) — separate from financial disclosures',
      'Income and Expense Declaration (DE-165)',
      'Proof of Service of Summons (POS-020)',
    ],
    hearingProcedures: [
      'Arrive 30 minutes early — check in with courtroom clerk',
      'Bring original plus 2 copies of all documents',
      'Move to correct courtroom when called — attorneys may wait in hallway',
      'Address the judge as "Your Honor" — speak clearly into microphone',
      'Stand when judge enters or speaks to you directly',
    ],
    criticalDeadlines: [
      { event: 'Response to Petition', daysBefore: 30, rule: 'Family Code § 2020.210' },
      { event: 'Preliminary Declaration of Disclosure', daysBefore: 60, rule: 'Family Code § 2104' },
      { event: 'Marital Settlement Agreement filing', daysBefore: 45, rule: 'LASC LR 5.5' },
      { event: 'Trial readiness conference', daysBefore: 5, rule: 'LASC LR 7.2' },
    ],
    judgeSpecificNotes: [
      { judgeName: 'Hon. Sarah M. Bennett', note: 'Requires detailed parenting plans with holiday schedules. Favors mediation before contested hearings.' },
      { judgeName: 'Hon. Robert Charrow', note: 'Tough on incomplete disclosures — sanctions may include evidence preclusion.' },
      { judgeName: 'Hon. Mark J. Yoshida', note: 'Allows telephone appearances for status conferences if requested in advance.' },
    ],
  },
  'EOIR - NYC Immigration Court': {
    courtType: 'immigration',
    district: 'New York',
    localRules: [
      {
        ruleNumber: '8 C.F.R. § 1003.23',
        title: 'Motions Practice',
        description: 'All motions must be in writing with supporting brief. Service on all parties required. Oppositions due within 30 days.',
        requirements: ['Written motion with legal basis', 'Certificate of service', 'Proposed order', 'Evidence attachment if needed'],
        deadlines: ['Motion filed with court', 'Opposition due 30 days from service', 'Reply due 15 days after opposition'],
        commonMistakes: ['Filing without certificate of service', 'Not serving opposing counsel', 'Missing legal authority in brief'],
        strategicNotes: ['Always request a hearing date when filing motion to reopen', 'Check court online system for hearing dates before filing'],
      },
      {
        ruleNumber: 'EOIR Practice Manual § 4.5',
        title: ' asylum application deadlines',
        description: 'One-year filing deadline from arrival. Exceptions for changed conditions or extraordinary circumstances. Late filing requires explanation.',
        requirements: ['I-589 Asylum Application', 'Supporting declarations', 'Corroborating evidence', 'Translation certification for foreign documents'],
        deadlines: ['File within 1 year of arrival (subject to exceptions)', 'Work permit (EAD) application separate — file with USCIS' ],
        commonMistakes: ['Missing the one-year deadline', 'Incomplete I-589 with blanks', 'Not including certified translations', 'Filing with wrong court location'],
        strategicNotes: ['Keep copy of I-589 with date stamp from lockbox', 'One-year clock may restart if entering without inspection', ' asylum office interview comes before immigration court for some cases'],
      },
      {
        ruleNumber: 'EOIR Practice Manual § 5.2',
        title: 'Master CalendarHearings',
        description: 'Initial hearings set for case management. Respondent must appear in person or through counsel. Bond hearings may be requested.',
        requirements: ['Respondent presence or representation by attorney', 'Documents establishing identity and residence', 'Any applications to be filed'],
        deadlines: ['Appear on date scheduled', 'Application for relief due by deadline set at master calendar'],
        commonMistakes: ['Missing master calendar date', 'Not having interpreter arranged', 'Failure to file application before individual hearing date'],
        strategicNotes: ['Always request continuation in writing if needed — verbal requests often denied', 'Check ICE counsel contact information before each hearing'],
      },
    ],
    filingRequirements: [
      'Form EOIR-33 (change of address) within 10 days of moving',
      'Form EOIR-28 (attorney appearance) with representation',
      'I-589 Asylum Application with certified translations',
      'BIA Form with filing fee or fee waiver request',
      'Motion to Reopen with new evidence if applicable',
    ],
    hearingProcedures: [
      'Check in at window 1 with your A-number and case number',
      'Wait in gallery until case is called — hearings may be delayed',
      'Immigration judges speak quickly — ask for clarification if needed',
      'Stand when judge enters, when addressing the court, and when making objections',
      'Speak clearly into the microphone — court reporter is recording',
    ],
    criticalDeadlines: [
      { event: 'File I-589 asylum application', daysBefore: 365, rule: 'INA § 208(a)(2)(B)' },
      { event: 'Change of address notification', daysBefore: 10, rule: '8 C.F.R. § 1003.15' },
      { event: 'Opposition to government motion', daysBefore: 14, rule: '8 C.F.R. § 1003.23(b)(1)' },
      { event: 'Respond to Request for Evidence', daysBefore: 15, rule: '8 C.F.R. § 1003.31' },
    ],
    judgeSpecificNotes: [
      { judgeName: 'Hon. Robert J. Martinez', note: 'Appears to favor applicants who present organized, well-documented cases. Responds well to legal memoranda.' },
      { judgeName: 'Hon. Maria H. Sanchez', note: 'Grants more continuances than other judges — use this for case preparation.' },
    ],
  },
  'US Bankruptcy Court - SDNY': {
    courtType: 'bankruptcy',
    district: 'New York - Southern District',
    localRules: [
      {
        ruleNumber: 'S.D.N.Y. Bankr. LBR 1007-1',
        title: 'Schedules and Statements — Required Filings',
        description: 'Debtors must file complete schedules, statements, and Chapter 13 plan. All documents must be typed or printed clearly.',
        requirements: ['Schedules A-J (assets, liabilities)', 'Statement of Financial Affairs (SOFA)', 'Chapter 13 Plan', 'Credit counseling certificate', 'Pay stubs last 60 days'],
        deadlines: ['File within 14 days of petition', 'Chapter 13 plan within 15 days of §341 meeting', 'Amendments require court approval if materially different'],
        commonMistakes: ['Leaving schedule items blank (use "none" not N/A)', 'Incorrect property valuations', 'Missing creditor account numbers', 'Not listing all income sources'],
        strategicNotes: ['Get accurate property values — trustee will obtain independent appraisal', 'List all secured creditors even if you intend to surrender property'],
      },
      {
        ruleNumber: 'S.D.N.Y. Bankr. LBR 3015-1',
        title: 'Chapter 13 Plan Requirements',
        description: 'Chapter 13 plan must commit all disposable income to plan. Plan length based on median income test: 36 months if below median, up to 60 months if above.',
        requirements: ['Plan with monthly payment amount', 'Proof of income (pay stubs, tax returns)', 'Plan must provide 100% to priority claims', 'Secured creditor treatment must be specified'],
        deadlines: ['Plan filed within 15 days of §341 meeting', 'Amended plan at least 7 days before confirmation hearing'],
        commonMistakes: ['Underestimating disposable income', 'Not accounting for above-median plan length requirement', 'Missing the 100% priority payment requirement'],
        strategicNotes: ['Calculate disposable income carefully — trustees often file objections to plans with inaccurate numbers', 'If you have tax priority claims, pay them in full through the plan'],
      },
      {
        ruleNumber: 'S.D.N.Y. Bankr. LBR 4001-1',
        title: 'Automatic Stay and Relief from Stay',
        description: 'Automatic stay prohibits creditor collection. Secured creditors may seek relief from stay to foreclose. Debtors may request co-debtor stay protection.',
        requirements: ['Motion for relief from stay with supporting declaration', 'Proof of default and security interest', 'Proof of service on debtor and trustee'],
        deadlines: ['Creditor motion for relief may be heard within 30 days', 'Debtor opposition due 14 days after service'],
        commonMistakes: ['Not serving trustee with all motions', 'Filing inadequate declaration about property value', 'Not appearing at relief hearing'],
        strategicNotes: ['Negotiate with secured creditor before hearing — many lift stay motions settle', 'If you intend to cure default, propose specific terms in your opposition'],
      },
    ],
    filingRequirements: [
      'Petition with all schedules (Schedule A-J)',
      'Statement of Financial Affairs',
      'Chapter 13 Plan (if Chapter 13)',
      'Proof of credit counseling completion',
      'Pay advices for last 60 days (all household income)',
      'Tax returns last 4 years',
    ],
    hearingProcedures: [
      'Confirm hearing date with court website — hearings can change',
      'Dress professionally — trustee hearings are formal',
      'Bring government-issued photo ID',
      'Stand when trustee or judge speaks to you',
      'Answer questions directly and completely — do not volunteer information',
    ],
    criticalDeadlines: [
      { event: 'File Schedules and Plan', daysBefore: 14, rule: 'Bankr. R. 1007(c)' },
      { event: '341 Meeting of Creditors', daysBefore: 21, rule: 'Bankr. R. 2003(a)' },
      { event: 'File opposition to claim objection', daysBefore: 14, rule: 'S.D.N.Y. LBR 3007-1' },
      { event: 'Chapter 13 plan confirmation hearing', daysBefore: 45, rule: 'Bankr. R. 3015' },
    ],
    judgeSpecificNotes: [
      { judgeName: 'Hon. William T. Sherwood', note: 'Detailed review of plans. Requires specific treatment for each secured creditor. Dislikes vague plan language.' },
      { judgeName: 'Hon. Cecelia G. Morris', note: 'More flexible on plans that demonstrate good faith. Will approve plans with minor technical errors if intent is clear.' },
    ],
  },
}

const DEFAULT_PROCEDURES: Record<CourtType, CourtProceduresResult> = {
  family: {
    court: 'Superior Court - Family Division',
    district: 'Various',
    courtType: 'family',
    localRules: [
      {
        ruleNumber: 'Generic Fam. Ct. R. 4.2',
        title: 'Mandatory Financial Disclosure',
        description: 'Both parties must exchange preliminary financial disclosures. Failure to disclose may result in sanctions or preclusion of evidence at trial.',
        requirements: ['Income declaration', 'All assets and liabilities', 'Recent tax returns'],
        deadlines: ['Preliminary: 60 days', 'Final: 30 days before trial'],
        commonMistakes: ['Listing "unknown" for assets rather than investigating', 'Not disclosing separate property'],
        strategicNotes: ['Use discovery to obtain complete financial information early'],
      },
    ],
    filingRequirements: ['Petition', 'Summons', 'Custody declaration (FL-341)', 'Income declaration'],
    hearingProcedures: ['Arrive early', 'Bring copies', 'Address judge formally'],
    criticalDeadlines: [
      { event: 'Response to Petition', daysBefore: 30, rule: 'State Rules of Civil Procedure' },
    ],
    judgeSpecificNotes: [],
  },
  immigration: {
    court: 'Immigration Court - EOIR',
    district: 'Various',
    courtType: 'immigration',
    localRules: [
      {
        ruleNumber: '8 C.F.R. § 1003.31',
        title: 'Filing Deadlines and Extensions',
        description: 'All filings must be timely. Extensions only granted for good cause shown. Late filings may result in dismissal or default.',
        requirements: ['Written motion for extension before deadline', 'Good cause explanation', 'Certificate of service'],
        deadlines: ['File before deadline', 'Request extension before deadline'],
        commonMistakes: ['Asking for extension after deadline', 'Not serving opposing counsel'],
        strategicNotes: ['Always check the immigration court online system (ECAS) before hearings'],
      },
    ],
    filingRequirements: ['Form EOIR-33 (address change)', 'I-589 asylum application', 'EOIR-28 (attorney representation)'],
    hearingProcedures: ['Check in with A-number', 'Wait for case call', 'Speak clearly into microphone'],
    criticalDeadlines: [
      { event: 'File asylum application within 1 year of arrival', daysBefore: 365, rule: 'INA § 208(a)(2)(B)' },
    ],
    judgeSpecificNotes: [],
  },
  bankruptcy: {
    court: 'US Bankruptcy Court',
    district: 'Various',
    courtType: 'bankruptcy',
    localRules: [
      {
        ruleNumber: 'Bankr. R. 1007-1',
        title: 'Required Filings and Deadlines',
        description: 'Debtors must file complete schedules and Chapter 13 plan within required timeframes. Incomplete filings may result in case dismissal.',
        requirements: ['All schedules complete', 'Chapter 13 plan', 'Credit counseling certificate'],
        deadlines: ['Schedules: 14 days after petition', 'Plan: 15 days after §341 meeting'],
        commonMistakes: ['Incomplete schedules', 'Incorrect valuations', 'Missing creditor account numbers'],
        strategicNotes: ['Accurate and complete schedules prevent trustee objections and delays'],
      },
    ],
    filingRequirements: ['Petition', 'Schedules A-J', 'SOFA', 'Chapter 13 Plan', 'Credit counseling certificate'],
    hearingProcedures: ['Dress professionally', 'Bring ID', 'Answer trustee questions directly'],
    criticalDeadlines: [
      { event: 'File Chapter 13 Plan', daysBefore: 15, rule: 'Bankr. R. 3015' },
    ],
    judgeSpecificNotes: [],
  },
  ip: {
    court: 'USPTO - Trademark Trial and Appeal Board',
    district: 'Federal',
    courtType: 'ip',
    localRules: [
      {
        ruleNumber: 'TBMP § 201',
        title: 'TEAS Application Filing',
        description: 'Trademark applications must be filed via USPTO TEAS system. Descriptions must use acceptable ID manual terminology.',
        requirements: ['Mark identification', 'Goods/services classification', 'Basis for filing (use or intent-to-use)', 'Filing fee per class'],
        deadlines: ['Application filed before any use in commerce', 'Statement of Use required within 12 months (ITU)'],
        commonMistakes: ['Using generic goods descriptions', 'Incorrect Nice classification', 'Missing filing basis'],
        strategicNotes: ['Conduct comprehensive search before filing to avoid conflicts'],
      },
    ],
    filingRequirements: ['TEAS application', 'Drawing page (if design mark)', 'Specimen (if based on use)', 'Filing fee'],
    hearingProcedures: ['USPTO handles ex parte matters electronically', 'TTAB handles opposition/cancellation proceedings', 'File所有的 documents via ESTTA'],
    criticalDeadlines: [
      { event: 'Response to Office Action', daysBefore: 90, rule: 'USPTO TBMP § 1105' },
      { event: 'Statement of Use (ITU)', daysBefore: 365, rule: '15 U.S.C. § 1051(d)' },
    ],
    judgeSpecificNotes: [],
  },
}

export class CourtProceduresAgent {
  /**
   * Get court procedures for a specific court location.
   */
  public getProcedures(courtName: string, courtType: CourtType): CourtProceduresResult {
    const key = Object.keys(COURT_PROCEDURES).find(k =>
      k.toLowerCase().includes(courtName.toLowerCase())
    ) || Object.keys(COURT_PROCEDURES).find(k =>
      COURT_PROCEDURES[k].courtType === courtType && COURT_PROCEDURES[k].district.toLowerCase().includes(courtName.toLowerCase())
    )

    if (key) {
      const data = COURT_PROCEDURES[key]
      return {
        court: key.split(' - ')[0],
        district: data.district,
        courtType: data.courtType,
        localRules: data.localRules,
        filingRequirements: data.filingRequirements,
        hearingProcedures: data.hearingProcedures,
        criticalDeadlines: data.criticalDeadlines,
        judgeSpecificNotes: data.judgeSpecificNotes,
      }
    }

    return DEFAULT_PROCEDURES[courtType]
  }

  /**
   * Get procedures for a judge in a specific court type.
   */
  public getJudgeProcedures(judgeName: string, courtType: CourtType): {
    judge: string
    notes: string[]
    proceduralAlerts: string[]
  } {
    const courtEntries = Object.values(COURT_PROCEDURES).filter(p => p.courtType === courtType)
    const judgeNotes = courtEntries
      .flatMap(c => c.judgeSpecificNotes)
      .filter(n => n.judgeName.toLowerCase().includes(judgeName.toLowerCase()))

    if (judgeNotes.length > 0) {
      return {
        judge: judgeName,
        notes: judgeNotes.map(n => n.note),
        proceduralAlerts: judgeNotes.map(n => `Note: ${n.note}`),
      }
    }

    return {
      judge: judgeName,
      notes: ['No specific judge notes found — follow standard court procedures'],
      proceduralAlerts: ['General court procedures apply — verify requirements with clerk'],
    }
  }

  /**
   * Get critical deadlines for a specific court type.
   */
  public getDeadlines(courtName: string, courtType: CourtType): {
    event: string
    daysBefore: number
    rule: string
    explanation: string
  }[] {
    const procedures = this.getProcedures(courtName, courtType)
    return procedures.criticalDeadlines.map(d => ({
      ...d,
      explanation: `You must ${d.event.toLowerCase()} ${d.daysBefore} days before the relevant hearing or filing deadline per ${d.rule}.`,
    }))
  }

  /**
   * Get the filing requirements for a court type.
   */
  public getFilingRequirements(courtType: CourtType): {
    required: string[]
    commonMistakes: string[]
    tips: string[]
  } {
    const defaults = DEFAULT_PROCEDURES[courtType]
    const tips: Record<CourtType, string[]> = {
      family: [
        'File all documents in duplicate — judge gets one copy, keep one',
        'Get file-stamped copies of everything you file',
        'Verify service on all parties before hearing',
      ],
      immigration: [
        'Keep your A-number and case number written down — you will need it at every hearing',
        'Check the EOIR court locator for your hearing date before traveling',
        'Bring certified translations of all foreign language documents',
      ],
      bankruptcy: [
        'Get property valuations before filing — trustee will verify',
        'List ALL creditors including those you intend to reaffirm or surrender',
        'File amended schedules immediately when you discover errors',
      ],
      ip: [
        'Search USPTO TESS database before filing — conflicts are costly',
        'Use TEAS+ for lower per-class fees when descriptions follow ID manual',
        'Monitor published marks for conflicts using trademark watch services',
      ],
    }

    return {
      required: defaults.filingRequirements,
      commonMistakes: defaults.localRules.flatMap(r => r.commonMistakes),
      tips: tips[courtType],
    }
  }
}

export const courtProceduresAgent = new CourtProceduresAgent()