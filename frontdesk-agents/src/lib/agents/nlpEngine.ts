// AI Agentic Receptionist - NLP Engine
// Handles intent detection, entity extraction, sentiment analysis, and response generation

import {
  InteractionContext,
  AIResponse,
  SentimentResult,
  LegalCitation,
  LegalTerm,
  ExtractedClause,
  LegalAnalysisResult,
} from './types'

// ============================================================
// INTENT PATTERNS (general receptionist intents)
// ============================================================

const intentPatterns: { [key: string]: RegExp } = {
  greeting: /^(hi|hello|hey|good morning|good afternoon|good evening|greetings|howdy|how are you|what's up)/i,
  appointment: /schedule|book|appointment|reserve|visit|checking in|consultation|meeting/i,
  information: /what is|can you tell me|how does|explain|information|details|learn more|interested in/i,
  pricing: /cost|price|fee|charge|rate|pricing|worth|expensive|cheap|afford|budget/i,
  location: /where|address|location|directions|map|near me|closest|find you|get there/i,
  hours: /hours|open|closed|available|when|operating|schedule|timing|time zone/i,
  complaint: /complaint|unsatisfied|angry|frustrated|problem|issue|bad|poor|terrible|disappointed|not happy/i,
  escalation: /supervisor|manager|speak to someone|human|real person|real agent|representative|escalate/i,
  thank: /thank you|thanks|thx|appreciate|grateful|thankyou|many thanks/i,
  goodbye: /goodbye|bye|see you|later|good night|take care|have a nice day/i,
}

// ============================================================
// ENTITY PATTERNS
// ============================================================

const entityPatterns: { [key: string]: RegExp } = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\b/,
  phone: /\b(?:\\+?1[-.\t]?)?(?:\/?(?:\b[0-9]{3}\b)?[-.\t]?)?[0-9]{3}[-.\t]?[0-9]{4}\b/,
  date: /\b(?:[0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4}|january|february|march|april|may|june|july|august|september|october|november|december)[a-z]*\b/i,
  time: /\b(?:[0-9]{1,2}:[0-9]{2}(?::[0-9]{2})?\b(?:am|pm)?|\b(?:noon|midnight|eight am|three pm)\b)/i,
  name: /\b(?:mr\"|mrs\"|ms\"|dr\"|prof\"|sir|ma'am)\b [A-Z][a-z]+/i,
}

// ============================================================
// SENTIMENT KEYWORDS
// ============================================================

const sentimentKeywords = {
  positive: ['happy', 'great', 'excellent', 'wonderful', 'fantastic', 'amazing', 'love', 'good', 'best', 'perfect', 'beautiful', 'awesome', 'pleased', 'delighted', 'helpful', 'thankful', 'grateful'],
  negative: ['bad', 'terrible', 'awful', 'horrible', 'poor', 'disappointing', 'frustrating', 'annoying', 'upset', 'angry', 'sad', 'unhappy', 'worried', 'concerned', 'difficult', 'problem', 'issue'],
  frustrated: ['stuck', 'cannot', "can't", 'unacceptable', 'ridiculous', 'furious', 'losing patience', 'fed up', 'waste', 'worthless', 'never', 'completely', 'absolutely', 'impossible', 'escalate', 'speak to someone'],
}

// ============================================================
// LEGAL CITATION PATTERNS
// ============================================================

/**
 * Comprehensive legal citation regex patterns.
 * Covers US federal statutes, state codes, case law (v. format), regulations, constitutions, court rules, treaties, and municipal ordinances.
 */
const legalCitationPatterns: {
  /** Human-readable label */
  label: string
  /** Type classification */
  type: LegalCitation['type']
  /** Regex pattern */
  pattern: RegExp
  /** Minimum confidence when matched */
  baseConfidence: number
}[] = [
  // ---- US CODE (Title § section) ----
  // e.g. "42 U.S.C. § 1983", "15 USC 1692(a)", "42 U.S.C.A. § 12101"
  {
    label: 'US Code - Title and Section',
    type: 'statute',
    pattern: /\b([A-Z]{1,3})(?:\/?\/? ?U ?S ?C ?| ?U ?S ?C ?| ?U ?S ?)(?: ?§| ?section)? ?[0-9]+(?:[a-z]? ?[0-9]+(?:\/? ?[a-z])?)*/gi,
    baseConfidence: 0.9,
  },
  // ---- CFR (Code of Federal Regulations) ----
  // e.g. "29 C.F.R. § 1614.203", "40 CFR 60.18"
  {
    label: 'CFR - Code of Federal Regulations',
    type: 'regulation',
    pattern: /\b([0-9]+) ?C ?F ?R ?(?:\/? ?§| ?section)? ?[0-9]+(?:\/[0-9]+)*/gi,
    baseConfidence: 0.85,
  },
  // ---- Public Laws / Statutes at Large ----
  // e.g. "Pub. L. No. 99-500", "Stat. 1275"
  {
    label: 'Public Law / Statute at Large',
    type: 'statute',
    pattern: /\b(?:Pub ?L ?(?: ?No ?)? ?)?[0-9]+[\"\/-][0-9]+\b/gi,
    baseConfidence: 0.8,
  },
  // ---- State Code citations ----
  // e.g. "Cal. Civ. Code § 1710", "Tex. Bus. Orgs. Code Ann. § 21.555"
  {
    label: 'State Code',
    type: 'statute',
    pattern: /\b([A-Z][a-z]+(?:\/? ?[A-Z][a-z]*)*) ?(?:Code|Laws|Statutes|Rev ?Stat ?|Acts?)(?: ?Ann ?)?(?: ?(?:§|§§|section|sections) ?[0-9]+(?:\/? ?[a-z]? ?[0-9]+)*)*/gi,
    baseConfidence: 0.85,
  },
  // ---- Case Law: Party v. Party ----
  // e.g. "Smith v. Jones", "Doe v. University of Michigan", "Marbury v. Madison"
  {
    label: 'Case Law (v. format)',
    type: 'case_law',
    pattern: /\b([A-Z][a-zA-Z'-]+(?:\/? ?[A-Z][a-z]+)*) ?v ?(?: ?[A-Z][a-zA-Z'-]+(?:\/? ?[A-Z][a-z]+)*)(?: ?[0-9]{4}| ?,? ?[A-Z][a-z]+)?/gi,
    baseConfidence: 0.85,
  },
  // ---- Federal Rules of Civil/Criminal Procedure ----
  // e.g. "Fed. R. Civ. P. 12(b)", "FRCP 16"
  {
    label: 'Federal Rules of Procedure',
    type: 'court_rule',
    pattern: /\bFed ?R ?\/? ?(?: ?\/? ?)?(?:Civil|Crim|Evidence|Bankr) ?R ?\/? ?\/? ?P ?\/? ?[0-9]+(?:\/[a-z])?/gi,
    baseConfidence: 0.9,
  },
  // ---- State Rules of Court ----
  // e.g. "Cal. Rules of Court, rule 3.1113"
  {
    label: 'State Rules of Court',
    type: 'court_rule',
    pattern: /\b([A-Z][a-z]+) ?Rules? ?of ?Court,? ?(?:rule ?)?[0-9]+(?:\/? ?[a-z]? ?[0-9]+)*/gi,
    baseConfidence: 0.8,
  },
  // ---- US Constitution ----
  // e.g. "U.S. Const. amend. XIV, § 1", "First Amendment"
  {
    label: 'US Constitution',
    type: 'constitution',
    pattern: /\b(?:U ?S ?(?: ?Const ?| ?C ?)|US Const ?) ?(?:amend(?:ment)? ?[IVXLC]+(?:\/? ?§| ?section ?[0-9]+)?|\b(?:First|Second|Third|Fourth|Fifth|Sixth|Seventh|Eighth|Ninth|Tenth|Eleventh|Twelfth|Thirteenth|Fourteenth|Fifteenth|Sixteenth|Seventeenth|Eighteenth|Nineteenth|Twentieth|Twenty-first|Twenty-second|Twenty-third|Twenty-fourth|Twenty-fifth) ?Amend(?:ment)?\b)/gi,
    baseConfidence: 0.9,
  },
  // ---- State Constitution ----
  // e.g. "Cal. Const., art. I, § 1"
  {
    label: 'State Constitution',
    type: 'constitution',
    pattern: /\b([A-Z][a-z]+) ?Const ?,? ?(?:art(?:icle)? ?[IVXLC0-9]+)?(?:\/? ?§ ?[0-9]+)?/gi,
    baseConfidence: 0.8,
  },
  // ---- Executive Orders ----
  // e.g. "Exec. Order 12834"
  {
    label: 'Executive Order',
    type: 'regulation',
    pattern: /\bExec ?\/? ?O ?\/? ?r ?\/? ?d ?\/? ?e ?\/? ?r ?\/? ? ?[0-9]+/gi,
    baseConfidence: 0.85,
  },
  // ---- Uniform Acts / Model Laws ----
  // e.g. "Uniform Commercial Code § 2-202", "UCC 2-202"
  {
    label: 'Uniform / Model Act',
    type: 'statute',
    pattern: /\b(?:(?:Uniform|Model) ?\/? ?(?:Commercial|Consumer|Business|Probate|Family) ?\/? ?(?:Code|Act)\b|UCC)\/? ?(?:§|section)? ?[0-9]+(?:\/? ?[a-z]? ?[0-9]+)*/gi,
    baseConfidence: 0.8,
  },
  // ---- IRS / Tax Code ----
  // e.g. "26 U.S.C. § 61", "IRC § 501(c)(3)"
  {
    label: 'Internal Revenue Code',
    type: 'statute',
    pattern: /\b(?:IRC|Internal ?Revenue ?Code|I ?R ?C ?|26 ?U ?S ?C ?)\/? ?(?:§|section)? ?[0-9]+(?:\/?[a-z]\/?[0-9]+)*/gi,
    baseConfidence: 0.85,
  },
  // ---- Municipal Ordinance ----
  // e.g. "NYC Admin. Code § 8-101", "L.A. Mun. Code § 12.04"
  {
    label: 'Municipal Ordinance',
    type: 'ordinance',
    pattern: /\b([A-Z][a-z]+(?:\/?\/? ?[A-Z][a-z]*)*) ?(?:\/? ?Admin ?|Municipal|Code|Ordinance)\/? ?(?:§|section)? ?[0-9]+(?:\/? ?[a-z]? ?[0-9]+)*/gi,
    baseConfidence: 0.75,
  },
  // ---- Court of Appeals decisions (circuit) ----
  // e.g. "517 F.3d 544 (9th Cir. 2008)"
  {
    label: 'Federal Circuit Court Reporter',
    type: 'case_law',
    pattern: /\b[0-9]+ ?F ?\/? ?(?:\/? ?2d|3d|4th)? ?[0-9]+ ?[0-9]+ ?(?: ?\/? ?[0-9]+)? ?(?: ?\/? ?[(][A-Z][a-z]+ ?[0-9]* ?[)]\/? ?)?/gi,
    baseConfidence: 0.8,
  },
  // ---- Tax Court / Board Decisions ----
  // e.g. "T.C. Memo 2009-157", "B.I.A. Dec. 1234"
  {
    label: 'Tax Court / Board Decision',
    type: 'case_law',
    pattern: /\b(?:T ?\/? ?C ?\/? ?(?:\/? ?(?:Memo|Rule|T ?C ?))\/? ?|Board|BIA)\/? ?(?:Dec\/? ?|Memo\/? ?)? ?[0-9]+(?:\/? ?[a-z]? ?[0-9]+)*/gi,
    baseConfidence: 0.8,
  },
  // ---- Treaties / International Agreements ----
  // e.g. "Vienna Convention on the Law of Treaties", "Treaty of Rome"
  {
    label: 'Treaty / International Agreement',
    type: 'treaty',
    pattern: /\b(?:Treaty ?of|Convention ?on|Treaty ?on|Agreement ?under|Paris ?Convention|Berne ?Convention|UDRP)\b[ ][A-Z][a-zA-Z'\u2019\u2018\u0027 ]+/gi,
    baseConfidence: 0.8,
  },
]

// ============================================================
// LEGAL TERMINOLOGY WEIGHTING
// ============================================================

/**
 * Legal term categories with importance weights.
 * Weight scale: 0.0–1.0 where:
 *   0.0–0.29 = boilerplate/neutral
 *   0.3–0.49 = standard clause language
 *   0.5–0.69 = notable terms with legal effect
 *   0.7–0.89 = high-risk / high-significance terms
 *   0.9–1.0 = critical red-flag terms
 */
const legalTermCategories: {
  category: LegalTerm['category']
  weight: number
  terms: string[]
}[] = [
  // ---- HIGH-WEIGHT RISK TERMS ----
  {
    category: 'risk',
    weight: 0.9,
    terms: [
      'indemnify', 'indemnification', 'hold harmless', 'defend and hold harmless',
      'unlimited liability', 'unlimited exposure', 'sole and absolute liability',
      'waive', 'waiver of', 'waived', 'waiver', 'waiving',
      'liquidated damages', 'penalty', 'forfeit', 'rescission',
      'non-compete', 'non-compete clause', 'covenant not to compete',
      'work for hire', 'work-made-for-hire',
      'without limitation', 'unlimited indemnification',
      'unconditional', 'unilateral', 'irrevocable',
      'self-executing', 'automatic renewal', 'subscription trap',
      'adhesion contract', 'unconscionable', 'overreaching',
      'exculpatory', 'limitation of liability', 'cap on damages',
    ],
  },
  // ---- OBLIGATION (binding duties) ----
  {
    category: 'obligation',
    weight: 0.75,
    terms: [
      'shall', 'must', 'will', 'is required to', 'agrees to', 'undertakes to',
      'undertakes', 'covenant', 'warrants', 'warrant', 'represents and warrants',
      'representations and warranties', 'guarantee', 'guaranteed', 'ensure',
      'prior written consent', 'written approval', 'exclusive right',
      'non-exclusive', 'exclusive', 'assign', 'assignment of rights',
      'force majeure', 'material breach', 'cure period',
      'indemnify and hold harmless', 'defend', 'reimburse',
      'comply with', 'compliance', 'compliance with',
      'authority to bind', 'full authority', 'due authority',
      'best efforts', 'reasonable efforts', 'commercially reasonable efforts',
      'duty of care', 'fiduciary duty', 'confidentiality obligation',
      'non-disclosure', 'non-solicitation', 'non-circumvention',
    ],
  },
  // ---- LIABILITY (accountability / exposure) ----
  {
    category: 'liability',
    weight: 0.8,
    terms: [
      'liable', 'liability', 'responsible for', 'responsibility',
      'at fault', 'negligence', 'gross negligence', 'willful misconduct',
      'strict liability', 'joint and several liability',
      'vicarious liability', 'contingent liability',
      'limitation of liability', 'limiting liability', 'cap on liability',
      'exclusion of liability', 'disclaimer of liability',
      'assumption of risk', 'risk of loss', 'loss risk',
      'damages', 'consequential damages', 'indirect damages',
      'incidental damages', 'special damages', 'punitive damages',
      'attorney fees', 'costs of suit',
      'indemnification', 'indemnify', 'hold harmless',
      'contribution', 'right of contribution',
    ],
  },
  // ---- RIGHTS (entitlements) ----
  {
    category: 'right',
    weight: 0.65,
    terms: [
      'right to', 'rights to', 'entitled to', 'entitlement',
      'option to', 'election to', 'choice of', 'may elect',
      'reserve the right', 'retains the right', 'retained right',
      'waive rights', 'waiver of rights', 'forfeit rights',
      'termination right', 'right of termination', 'right to terminate',
      'right of first refusal', 'right of first offer', 'ROFR',
      'inspection rights', 'audit rights', 'right to audit',
      'intellectual property rights', 'IP rights', 'ownership rights',
      'reversionary interest', 'reversion of rights', 'reverts to',
      'license', 'sublicense', 'sublicense right', 'grant of license',
      'transfer of rights', 'assignment of rights', 'right to assign',
    ],
  },
  // ---- REMEDIES (relief / enforcement mechanisms) ----
  {
    category: 'remedy',
    weight: 0.7,
    terms: [
      'remedy', 'remedies', 'relief', 'enforcement',
      'injunctive relief', 'preliminary injunction', 'permanent injunction',
      'restraining order', 'temporary restraining order', 'TRO',
      'specific performance', 'specific enforcement',
      'rescission', 'rescind', 'rescinded',
      'declaratory judgment', 'declaratory relief',
      'restitution', 'disgorgement', 'account of profits',
      'set-off', 'offset', 'counterclaim',
      'indemnification', 'indemnify', 'hold harmless',
      'right to cure', 'cure period', 'notice and cure',
      'dispute resolution', 'arbitration', 'mediation',
      'governing law', 'choice of law', 'jurisdiction',
    ],
  },
  // ---- JURISDICTION / PROCEDURE ----
  {
    category: 'jurisdiction',
    weight: 0.6,
    terms: [
      'governing law', 'governed by', 'choice of law', 'applicable law',
      'jurisdiction', 'exclusive jurisdiction', 'concurrent jurisdiction',
      'venue', 'place of venue', 'appropriate venue',
      'court of competent jurisdiction', 'arbitration', 'arbitrate',
      'mediation', 'mediate', 'alternative dispute resolution', 'ADR',
      'binding arbitration', 'mandatory arbitration', 'non-binding arbitration',
      'class action waiver', 'class action', 'class certification',
      'jury trial waiver', 'waive jury', 'waive right to jury',
      'personal jurisdiction', 'subject matter jurisdiction',
      'notice', 'written notice', 'notice period',
      'service of process', 'summons', 'complaint',
      'statute of limitations', 'limitations period',
    ],
  },
  // ---- DEFINITIONS (defined terms signal precision) ----
  {
    category: 'definition',
    weight: 0.55,
    terms: [
      '"', // quoted defined term e.g. "Affiliate"
      'means', 'defined as', 'shall mean', 'is defined as',
      'as used herein', 'as defined herein', 'as follows',
      'the following', 'including but not limited to',
      'hereinafter', 'heretofore', 'whereas',
      'the term', 'the expression', 'the phrase',
      'for purposes of this', 'in this Agreement',
      'the parties agree', 'the parties acknowledge',
    ],
  },
  // ---- BOILERPLATE (standard, low-risk language) ----
  {
    category: 'boilerplate',
    weight: 0.25,
    terms: [
      'herein', 'hereby', 'hereof', 'hereto', 'hereunder',
      'therein', 'thereof', 'thereto', 'thereunder',
      'whereas', 'whereby', 'wherein',
      'in witness whereof', 'signed and delivered',
      'entire agreement', 'integration clause', 'merger clause',
      'amendment', 'amend', 'modification', 'modify',
      'severability', 'severable', 'separability',
      'force majeure', 'headings', 'captions',
      'counterparts', 'electronic signature', 'e-signature',
      'successors and assigns', 'binding on successors',
      'notices in writing', 'effective date', 'commencement date',
      'representations', 'warranties', 'covenants',
      'acknowledged', 'agreed', 'accepted',
    ],
  },
]

// ============================================================
// LEGAL CLAUSE EXTRACTION PATTERNS
// ============================================================

/**
 * Clause type definitions with extraction patterns and metadata.
 */
const clauseTypeDefinitions: {
  type: string
  titlePattern: RegExp
  bodyPattern?: RegExp
  baseSeverity: number
  riskLevel: ExtractedClause['riskLevel']
  keywords: string[]
}[] = [
  {
    type: 'definitions',
    titlePattern: /^\b(?:DEFINITION|DEFINITIONS|DEFINED TERMS|INTERPRETATION)\b(?:\b[:]\b)?/i,
    baseSeverity: 15,
    riskLevel: 'low',
    keywords: ['means', 'defined as', 'shall mean', 'as used in', '"'],
  },
  {
    type: 'indemnification',
    titlePattern: /^\b(?:INDEMNIFICATION|INDEMNITY|DEFENSE AND HOLD HARMLESS|HOLD HARMLESS)\b(?:\b[:]\b)?/i,
    baseSeverity: 75,
    riskLevel: 'high',
    keywords: ['indemnify', 'defend', 'hold harmless', 'any and all claims'],
  },
  {
    type: 'liability',
    titlePattern: /^\b(?:LIMITATION OF LIABILITY|LIABILITY|LIMITATION|LIABILITY CAP| DAMAGES|LIMITED LIABILITY)\b(?:\b[:]\b)?/i,
    baseSeverity: 80,
    riskLevel: 'critical',
    keywords: ['limit', 'cap', 'not exceed', 'maximum liability', 'no consequential damages', 'liable for'],
  },
  {
    type: 'termination',
    titlePattern: /^\b(?:TERMINATION|TERM|EXPIRATION|END OF TERM|CANCELLATION|WITHDRAWAL)\b(?:\b[:]\b)?/i,
    baseSeverity: 45,
    riskLevel: 'medium',
    keywords: ['terminate', 'cancellation', 'expiration', 'breach', 'default', 'notice period'],
  },
  {
    type: 'non_compete',
    titlePattern: /^\b(?:NON.?COMPETE|NON-COMPETE|NON COMPETITION|COMPETITIVE RESTRICTION|BUSINESS RESTRICTION)\b(?:\b[:]\b)?/i,
    baseSeverity: 70,
    riskLevel: 'high',
    keywords: ['compete', 'competitive', 'restriction', 'non-compete', 'business activities'],
  },
  {
    type: 'confidentiality',
    titlePattern: /^\b(?:CONFIDENTIALITY|NON.?DISCLOSURE|PRIVACY|DATA PROTECTION|CONFIDENTIAL INFORMATION|SECRET|CLASSIFIED)\b(?:\b[:]\b)?/i,
    baseSeverity: 40,
    riskLevel: 'medium',
    keywords: ['confidential', 'proprietary', 'trade secret', 'non-disclosure', 'privacy'],
  },
  {
    type: 'governing_law',
    titlePattern: /^\b(?:GOVERNING LAW|CHOICE OF LAW|APPLICABLE LAW|JURISDICTION|VENUE|CONTROLLING LAW)\b(?:\b[:]\b)?/i,
    baseSeverity: 20,
    riskLevel: 'low',
    keywords: ['governing law', 'jurisdiction', 'venue', 'choice of law', 'applicable law'],
  },
  {
    type: 'ip_assignment',
    titlePattern: /^\b(?:INTELLECTUAL PROPERTY|IP|ASSIGNMENT|WORK FOR HIRE|OWNERSHIP|COPYRIGHT|PATENT|TRADEMARK)\b(?:\b[:]\b)?/i,
    baseSeverity: 55,
    riskLevel: 'medium',
    keywords: ['intellectual property', 'work for hire', 'assign', 'ownership', 'patent', 'copyright', 'trademark'],
  },
  {
    type: 'auto_renewal',
    titlePattern: /^\b(?:AUTO.?RENEWAL|AUTOMATIC RENEWAL|RENEWAL|TERM EXTENSION|SUBSCRIPTION RENEWAL)\b(?:\b[:]\b)?/i,
    baseSeverity: 60,
    riskLevel: 'high',
    keywords: ['automatically renew', 'auto-renewal', 'successive period', 'notice period'],
  },
  {
    type: 'payment_terms',
    titlePattern: /^\b(?:PAYMENT|COMPENSATION|FEES|CHARGES|BILLING|INVOICING|REIMBURSEMENT)\b(?:\b[:]\b)?/i,
    baseSeverity: 35,
    riskLevel: 'medium',
    keywords: ['payment', 'fee', 'invoice', 'due upon', 'late payment', 'interest'],
  },
  {
    type: 'force_majeure',
    titlePattern: /^\b(?:FORCE MAJEURE|UNFORESEEN EVENTS|ACT OF GOD|EMERGENCY|CATASTROPHE)\b(?:\b[:]\b)?/i,
    baseSeverity: 10,
    riskLevel: 'low',
    keywords: ['force majeure', 'act of god', 'beyond control', 'unforeseeable'],
  },
  {
    type: 'dispute_resolution',
    titlePattern: /^\b(?:DISPUTE RESOLUTION|ARBITRATION|MEDIATION|ADR|ALTERNATIVE DISPUTE|CONFIDENTIAL ARBITRATION)\b(?:\b[:]\b)?/i,
    baseSeverity: 30,
    riskLevel: 'medium',
    keywords: ['arbitration', 'mediation', 'binding arbitration', 'AAA', 'JAMS', 'dispute'],
  },
  {
    type: 'severability',
    titlePattern: /^\b(?:SEVERABILITY|SEVERABLE|SEPARABILITY|SEPARATE PROVISIONS)\b(?:\b[:]\b)?/i,
    baseSeverity: 5,
    riskLevel: 'low',
    keywords: ['severability', 'if any provision', 'invalid or unenforceable'],
  },
  {
    type: 'amendment',
    titlePattern: /^\b(?:AMENDMENT|MODIFICATION|WAIVER|CHANGE|VARIATION|REVISION)\b(?:\b[:]\b)?/i,
    baseSeverity: 20,
    riskLevel: 'low',
    keywords: ['amend', 'modify', 'in writing', 'signed by both parties'],
  },
  {
    type: 'notice',
    titlePattern: /^\b(?:NOTICES|NOTICE|COMMUNICATION|CONTACT|CORRESPONDENCE)\b(?:\b[:]\b)?/i,
    baseSeverity: 15,
    riskLevel: 'low',
    keywords: ['notice', 'written notice', 'address', 'delivery'],
  },
  {
    type: 'representations',
    titlePattern: /^\b(?:REPRESENTATIONS|WARRANTIES|WARRANTIES AND REPRESENTATIONS|REPRESENTATIONS AND WARRANTIES)\b(?:\b[:]\b)?/i,
    baseSeverity: 40,
    riskLevel: 'medium',
    keywords: ['represents', 'warrants', 'warranty', 'representation', 'true and accurate'],
  },
  {
    type: 'assignment',
    titlePattern: /^\b(?:ASSIGNMENT|DELEGATION|TRANSFER|SUBLETTING|SUB-CONTRACTING)\b(?:\b[:]\b)?/i,
    baseSeverity: 45,
    riskLevel: 'medium',
    keywords: ['assign', 'delegate', 'transfer', 'sublet', 'subcontract'],
  },
  {
    type: 'escalation',
    titlePattern: /^\b(?:ESCALATION|PRIORITY|HANDLING|HIGH PRIORITY|URGENT)\b(?:\b[:]\b)?/i,
    baseSeverity: 50,
    riskLevel: 'high',
    keywords: ['escalate', 'urgency', 'priority', 'immediate action'],
  },
]

// ============================================================
// NLP ENGINE CLASS
// ============================================================

export class NLPEngine {
  private responseTemplates: Map<string, string[]>

  constructor() {
    this.responseTemplates = new Map()
    this.initializeTemplates()
  }

  private initializeTemplates(): void {
    this.responseTemplates.set('greeting', [
      'Hello! How can I assist you today?',
      'Welcome! What can I help you with?',
      'Hi there! How may I help you today?',
    ])
    this.responseTemplates.set('appointment', [
      'I would be happy to help you schedule an appointment. What date and time works best for you?',
      'Let me help you book an appointment. When would you like to come in?',
    ])
    this.responseTemplates.set('information', [
      'Here is the information you requested:',
      'Let me provide you with the details you need:',
    ])
    this.responseTemplates.set('location', [
      'We are located at the following address:',
      'You can find us here:',
    ])
    this.responseTemplates.set('hours', [
      'Our business hours are:',
      'We are available during the following hours:',
    ])
    this.responseTemplates.set('pricing', [
      'Here is our pricing information:',
      'Let me share our current rates with you:',
    ])
    this.responseTemplates.set('escalation', [
      'I understand your concern. Let me connect you with a human agent right away.',
      'I am going to escalate this to a human agent who can better assist you.',
    ])
    this.responseTemplates.set('complaint', [
      'I am truly sorry you had this experience. Let me make this right.',
      'I apologize for the inconvenience. Let me address this immediately.',
    ])
    this.responseTemplates.set('thank', [
      'You are welcome! Is there anything else I can help you with?',
      'Thank you for your patience! Let me know if you need anything else.',
    ])
    this.responseTemplates.set('goodbye', [
      'Goodbye! Have a wonderful day.',
      'Take care! Feel free to reach out if you need anything else.',
    ])
  }

  // ========================================================
  // SENTIMENT ANALYSIS
  // ========================================================

  public analyzeSentiment(message: string): SentimentResult {
    const text = message.toLowerCase()
    let positiveCount = 0
    let negativeCount = 0
    let frustratedCount = 0
    const emotions: string[] = []

    for (const keyword of sentimentKeywords.positive) {
      const matches = text.match(new RegExp(`\\b${keyword}\\b`, 'gi'))
      if (matches) {
        positiveCount += matches.length
        emotions.push(keyword)
      }
    }

    for (const keyword of sentimentKeywords.negative) {
      const matches = text.match(new RegExp(`\\b${keyword}\\b`, 'gi'))
      if (matches) {
        negativeCount += matches.length
        emotions.push(keyword)
      }
    }

    for (const keyword of sentimentKeywords.frustrated) {
      const matches = text.match(new RegExp(`\\b${keyword}\\b`, 'gi'))
      if (matches) {
        frustratedCount += matches.length
        emotions.push(keyword)
      }
    }

    const score = (positiveCount - negativeCount - frustratedCount * 1.5) / Math.max(text.split(/\b/).length, 1)

    let label: SentimentResult['label'] = 'neutral'
    if (frustratedCount > 0) label = 'frustrated'
    else if (negativeCount > 0) label = 'negative'
    else if (positiveCount > 0) label = 'positive'

    let actionRecommended: string | undefined
    if (frustratedCount >= 2) actionRecommended = 'escalate_to_human'
    else if (negativeCount >= 1) actionRecommended = 'express_empathy_and_offer_help'

    return {
      score: Math.max(-1, Math.min(1, score)),
      label,
      emotions: [...new Set(emotions)],
      actionRecommended,
    }
  }

  // ========================================================
  // ENTITY EXTRACTION
  // ========================================================

  public extractEntities(message: string): {
    email: string[]
    phone: string[]
    date: string[]
    time: string[]
    name: string[]
  } {
    const entities = {
      email: [] as string[],
      phone: [] as string[],
      date: [] as string[],
      time: [] as string[],
      name: [] as string[],
    }

    const emailMatch = message.match(entityPatterns.email)
    if (emailMatch) entities.email.push(emailMatch[0])

    const phoneMatch = message.match(entityPatterns.phone)
    if (phoneMatch) entities.phone.push(phoneMatch[0])

    const dateMatch = message.match(entityPatterns.date)
    if (dateMatch) entities.date.push(dateMatch[0])

    const timeMatch = message.match(entityPatterns.time)
    if (timeMatch) entities.time.push(timeMatch[0])

    const nameMatch = message.match(entityPatterns.name)
    if (nameMatch) entities.name.push(nameMatch[0])

    return entities
  }

  // ========================================================
  // INTENT DETECTION
  // ========================================================

  public detectIntent(message: string): string {
    const lowerMessage = message.toLowerCase()
    for (const [intent, pattern] of Object.entries(intentPatterns)) {
      if (pattern.test(lowerMessage)) {
        return intent
      }
    }
    return 'unknown'
  }

  // ========================================================
  // RESPONSE GENERATION
  // ========================================================

  public generateResponse(
    message: string,
    context?: InteractionContext
  ): AIResponse {
    const startTime = Date.now()

    const intent = this.detectIntent(message)
    const sentiment = this.analyzeSentiment(message)
    const entities = this.extractEntities(message)

    let response =
      this.responseTemplates.get(intent)?.[
        Math.floor(Math.random() * this.responseTemplates.get(intent)!.length)
      ] ?? 'I am not sure how to help with that.'

    response = this.customizeResponse(
      response,
      sentiment,
      context?.visitorName,
      context?.urgency ?? 'low'
    )

    if (intent === 'greeting' && context?.industry) {
      response = this.addIndustryGreeting(response, context.industry)
    }

    const requiresHumanEscalation =
      sentiment.label === 'frustrated' ||
      /supervisor|manager|speak to someone|human|real person|real agent|representative|escalate/i.test(
        message
      )

    return {
      agentId: 'nlp-engine-1',
      content: response,
      confidence: this.calculateConfidence(intent, entities, sentiment),
      suggestedActions: this.getSuggestedActions(intent),
      requiresHumanEscalation,
      sentimentAnalysis: sentiment,
      language: context?.visitorLanguage ?? 'en',
      responseTime: Date.now() - startTime,
      metadata: {
        tokensUsed: Math.floor(response.split(/\b/).length * 1.3),
        modelVersion: 'nlp-engine-v1',
        cachedResponse: false,
        processingTimeMs: Date.now() - startTime,
      },
    }
  }

  private customizeResponse(
    response: string,
    sentiment: SentimentResult,
    visitorName?: string,
    urgency?: string
  ): string {
    let customizedResponse = response

    if (sentiment.label === 'frustrated') {
      customizedResponse = `I understand this has been a difficult experience. ${customizedResponse}`
    } else if (sentiment.label === 'negative') {
      customizedResponse = `I apologize for any inconvenience. ${customizedResponse}`
    }

    if (visitorName) {
      customizedResponse = `${visitorName}, ${customizedResponse}`
    }

    if (urgency === 'high' || urgency === 'emergency') {
      customizedResponse = `${customizedResponse} Please note that your request is being treated as a priority.`
    }

    return customizedResponse
  }

  private addIndustryGreeting(
    response: string,
    industry: InteractionContext['industry']
  ): string {
    const industryGreetings: { [key in InteractionContext['industry']]?: string } = {
      healthcare: 'Thank you for contacting our healthcare team. ',
      legal: 'Thank you for reaching out. As legal professionals, we are here to assist you. ',
      realestate: 'Welcome to our real estate services. ',
      hospitality: 'We appreciate your inquiry. ',
      corporate: 'Thank you for contacting us. ',
      retail: 'Thank you for your interest in our products. ',
      education: 'Welcome to our educational services. ',
      government: 'Thank you for contacting us. ',
    }
    return (industryGreetings[industry] ?? '') + response
  }

  private calculateConfidence(
    intent: string,
    entities: ReturnType<typeof this.extractEntities>,
    sentiment: SentimentResult
  ): number {
    let confidence = intent === 'unknown' ? 0.4 : 0.75

    const entityCount =
      entities.email.length +
      entities.phone.length +
      entities.date.length +
      entities.time.length
    if (entityCount > 0) confidence += entityCount * 0.05

    if (sentiment.label !== 'neutral') confidence += 0.05
    if (sentiment.label === 'frustrated') confidence -= 0.05

    return Math.max(0.3, Math.min(0.99, confidence))
  }

  private getSuggestedActions(intent: string): string[] {
    const suggestedActionsMap: { [key: string]: string[] } = {
      greeting: ['Ask about services', 'Schedule appointment', 'Get directions'],
      appointment: ['Select date and time', 'Confirm appointment', 'View available slots'],
      information: ['View detailed information', 'Download brochure', 'Contact us'],
      pricing: ['Request quote', 'Compare packages', 'Check insurance'],
      location: ['Get directions', 'View map', 'Check traffic'],
      hours: ['View full schedule', 'Book appointment', 'Set reminder'],
      complaint: ['File complaint', 'Request callback', 'Speak to manager'],
      escalation: ['Connect to agent', 'Request callback', 'Submit ticket'],
      thank: ['Provide feedback', 'Rate service', 'End chat'],
      goodbye: ['Take survey', 'Book again', 'Refer friend'],
    }
    return suggestedActionsMap[intent] ?? ['Provide more details', 'Contact support']
  }

  // ========================================================
  // LEGAL CITATION PARSING
  // ========================================================

  /**
   * Parse and extract all legal citations from the given text.
   */
  public parseLegalCitations(text: string): LegalCitation[] {
    const citations: LegalCitation[] = []
    const seenTexts = new Set<string>()

    for (const { label, type, pattern, baseConfidence } of legalCitationPatterns) {
      pattern.lastIndex = 0 // reset for global regex
      let match: RegExpExecArray | null

      while ((match = pattern.exec(text)) !== null) {
        const matchedText = match[0].trim()
        if (seenTexts.has(matchedText)) continue
        seenTexts.add(matchedText)

        const citation = this.buildLegalCitation(matchedText, type, baseConfidence)
        if (citation) citations.push(citation)
      }
    }

    return citations.sort((a, b) => b.confidence - a.confidence)
  }

  private buildLegalCitation(
    text: string,
    type: LegalCitation['type'],
    baseConfidence: number
  ): LegalCitation | null {
    let jurisdiction = ''
    let title = text
    let section: string | undefined
    let year: number | undefined

    // Case law: extract year from parentheses e.g. "(2009)" or "(9th Cir. 2008)"
    const yearMatch = text.match(/\b(20[0-2][0-9]|19[89][0-9])\b/)
    if (yearMatch) {
      year = parseInt(yearMatch[1], 10)
    }

    // US Code: extract title and section
    if (/U ?S ?C/i.test(text)) {
      jurisdiction = 'Federal'
      const titleMatch = text.match(/\b([A-Z]{1,3})\b[\/\/ ]?U ?S ?C/i)
      if (titleMatch) {
        title = titleMatch[1] + ' U.S.C.'
      }
      const sectionMatch = text.match(/§ ?(.*?)(?:[,;]|$)/i) || text.match(/section ?(.*?)(?:[,;]|$)/i)
      if (sectionMatch) {
        section = sectionMatch[1].trim()
      }
    }
    // CFR
    else if (/\bC\b\/?[Ff]\/?[Rr]\b/i.test(text)) {
      jurisdiction = 'Federal'
      title = text
    }
    // State code
    else if (/[A-Z][a-z]+\b.*\bCode\b/i.test(text)) {
      const stateMatch = text.match(/\b([A-Z][a-z]+)\b/)
      jurisdiction = stateMatch ? stateMatch[1] : ''
      title = text
    }
    // Constitution
    else if (/[Cc]onst/i.test(text) && /[Aa]mend/i.test(text)) {
      jurisdiction = 'Federal'
      title = text
    }
    // Case law (Party v. Party)
    else if (/v ?/i.test(text)) {
      const parts = text.split(/v ?/i)
      if (parts.length >= 2) {
        jurisdiction = 'Federal'
        title = parts[0].trim() + ' v. ' + parts[1].trim().split(/[,;(]/)[0].trim()
      }
    }

    return {
      text,
      type,
      jurisdiction: jurisdiction || 'Unknown',
      title: title || text,
      section,
      year,
      confidence: baseConfidence,
    }
  }

  // ========================================================
  // LEGAL TERMINOLOGY WEIGHTING
  // ========================================================

  /**
   * Extract and weight all legal terms found in the text.
   */
  public extractLegalTerms(text: string): LegalTerm[] {
    const terms: LegalTerm[] = []
    const seenTerms = new Set<string>()

    for (const { category, weight, terms: categoryTerms } of legalTermCategories) {
      for (const term of categoryTerms) {
        const regex = new RegExp(`\\b${term}\\b`, 'gi')
        let match: RegExpExecArray | null

        while ((match = regex.exec(text)) !== null) {
          const textMatched = match[0]
          const pos = match.index

          // Determine context window (±60 chars)
          const contextStart = Math.max(0, pos - 60)
          const contextEnd = Math.min(text.length, pos + textMatched.length + 60)
          const context = text.slice(contextStart, contextEnd)

          const key = `${textMatched}|${pos}`
          if (seenTerms.has(key)) continue
          seenTerms.add(key)

          terms.push({
            text: textMatched,
            canonical: term.toLowerCase(),
            category,
            weight,
            position: pos,
            context: (contextStart > 0 ? '...' : '') + context + (contextEnd < text.length ? '...' : ''),
          })
        }
      }
    }

    return terms.sort((a, b) => b.weight - a.weight)
  }

  /**
   * Compute aggregate risk score based on weighted legal terms.
   * Returns 0–100.
   */
  public computeLegalRiskScore(terms: LegalTerm[]): number {
    if (terms.length === 0) return 0

    // Weighted average of term weights, boosted by count of high-risk terms
    const highRiskCount = terms.filter(t => t.weight >= 0.7).length
    const avgWeight =
      terms.reduce((sum, t) => sum + t.weight, 0) / terms.length
    const densityBoost = Math.min(highRiskCount * 5, 30) // up to +30 from density

    return Math.min(100, Math.round((avgWeight * 100) + densityBoost))
  }

  // ========================================================
  // LEGAL CLAUSE EXTRACTION
  // ========================================================

  /**
   * Extract legal clauses from the given text using structured patterns.
   */
  public extractLegalClauses(text: string): ExtractedClause[] {
    const clauses: ExtractedClause[] = []
    const lines = text.split('\n')

    let clauseCounter = 1

    // ---- Extract numbered sections ----
    const sectionMatches: { lineIdx: number; sectionText: string }[] = []
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const nm =
        /\b(?:Article|Section|§|Sec\"|Clause|Schedule|Exhibit|Appendix|Annex)\b[ .\t]+[IVX0-9a-z]+[.:)\t]/i.exec(line) ||
        /^\b[0-9]+[.\t]+[A-Z]?[a-z]/i.exec(line) ||
        /^\b[0-9]+\b[.\t]+/.exec(line)
      if (nm) {
        const nextLineIdx = i + 1 < lines.length ? sectionMatches[sectionMatches.length - 1]?.lineIdx ?? i + 1 : lines.length
        // Collect all text from this section
        const sectionLines = lines.slice(i, nextLineIdx)
        const sectionText = sectionLines.join('\n').trim()
        if (sectionText.length >= 10) {
          sectionMatches.push({ lineIdx: i, sectionText })
        }
      }
    }

    // Build clauses from section matches - need to find boundaries properly
    for (let s = 0; s < sectionMatches.length; s++) {
      const startLineIdx = sectionMatches[s].lineIdx
      const endLineIdx = s + 1 < sectionMatches.length ? sectionMatches[s + 1].lineIdx : lines.length
      const sectionText = lines.slice(startLineIdx, endLineIdx).join('\n').trim()
      if (sectionText.length < 10) continue

      // Classify the clause
      let bestType = 'general'
      let highestSeverity = 0
      const keyTerms: string[] = []
      const riskFlags: string[] = []

      for (const def of clauseTypeDefinitions) {
        if (def.titlePattern.test(sectionText.slice(0, 80))) {
          bestType = def.type
          highestSeverity = def.baseSeverity
          break // title match takes precedence
        }
        // Check if any keywords are present
        for (const kw of def.keywords) {
          if (new RegExp(`\\b${kw}\\b`, 'i').test(sectionText)) {
            keyTerms.push(kw)
            if (def.baseSeverity > highestSeverity) {
              highestSeverity = def.baseSeverity
              bestType = def.type
            }
          }
        }
      }

      // Detect risk flags within clause text
      const riskFlagPatterns = [
        { pattern: /without limitation/gi, flag: 'without limitation' },
        { pattern: /indemnify(?:ication)?\b/gi, flag: 'indemnify' },
        { pattern: /\bsole(?:ly)? and (?:absolutely|completely)? liable\b/gi, flag: 'sole and absolute liability' },
        { pattern: /\bauto-?renew\b/gi, flag: 'auto-renewal' },
        { pattern: /\bnon-?compete\b/gi, flag: 'non-compete' },
        { pattern: /\b(?:unlimited|unconditional|irrevocable)\b/gi, flag: 'unlimited/irrevocable' },
        { pattern: /\bwaive[d]?\b/gi, flag: 'waiver' },
        { pattern: /\bwork for hire\b/gi, flag: 'work for hire' },
      ]

      for (const { pattern, flag } of riskFlagPatterns) {
        if (pattern.test(sectionText)) {
          riskFlags.push(flag)
          if (highestSeverity < 80) highestSeverity = Math.min(100, highestSeverity + 15)
        }
      }

      // Determine risk level
      let riskLevel: ExtractedClause['riskLevel'] = 'low'
      if (highestSeverity >= 80) riskLevel = 'critical'
      else if (highestSeverity >= 60) riskLevel = 'high'
      else if (highestSeverity >= 30) riskLevel = 'medium'

      clauses.push({
        id: `LC-${clauseCounter++}`,
        type: bestType,
        title: lines[startLineIdx]?.trim().slice(0, 80) || bestType,
        text: sectionText,
        excerpt: sectionText.slice(0, 150).trim(),
        severity: highestSeverity,
        riskLevel,
        keyTerms: [...new Set(keyTerms)],
        riskFlags: [...new Set(riskFlags)],
      })
    }

    // ---- Extract WHEREAS clauses ----
    const whereasPattern = /\bWHEREAS\b[ .]+[^.]{10,200}[.]/gi
    let match: RegExpExecArray | null

    whereasPattern.lastIndex = 0
    while ((match = whereasPattern.exec(text)) !== null) {
      const whereasText = match[0].trim()
      // Check if already covered by a numbered section
      if (clauses.some(c => c.text.includes(whereasText))) continue

      clauses.push({
        id: `LC-${clauseCounter++}`,
        type: 'preamble',
        title: 'WHEREAS clause',
        text: whereasText,
        excerpt: whereasText.slice(0, 150),
        severity: 10,
        riskLevel: 'low',
        keyTerms: [],
        riskFlags: [],
      })
    }

    // ---- Extract definition clauses ----
    const definitionPattern = /"([^"]+)"\b[^.]*?\bmeans\b[^.]{5,150}[.]/gi
    definitionPattern.lastIndex = 0
    while ((match = definitionPattern.exec(text)) !== null) {
      const defText = match[0].trim()
      if (clauses.some(c => c.text.includes(defText))) continue

      const definedTerm = match[1] || ''
      clauses.push({
        id: `LC-${clauseCounter++}`,
        type: 'definitions',
        title: `Defined term: "${definedTerm}"`,
        text: defText,
        excerpt: defText.slice(0, 150),
        severity: 15,
        riskLevel: 'low',
        keyTerms: [definedTerm, 'means'],
        riskFlags: [],
      })
    }

    // ---- Fallback: split by paragraph if very few clauses found ----
    if (clauses.length === 0) {
      const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 30)
      for (const para of paragraphs) {
        clauses.push({
          id: `LC-${clauseCounter++}`,
          type: 'general',
          title: para.trim().slice(0, 60),
          text: para.trim(),
          excerpt: para.trim().slice(0, 150),
          severity: 20,
          riskLevel: 'low',
          keyTerms: [],
          riskFlags: [],
        })
      }
    }

    return clauses.sort((a, b) => b.severity - a.severity)
  }

  // ========================================================
  // FULL LEGAL ANALYSIS
  // ========================================================

  /**
   * Perform complete legal document analysis: citations, terms, clauses, complexity.
   */
  public analyzeLegalDocument(text: string): LegalAnalysisResult {
    const analysisId = `LEGAL-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    const citations = this.parseLegalCitations(text)
    const terms = this.extractLegalTerms(text)
    const clauses = this.extractLegalClauses(text)

    // Compute complexity
    const wordCount = text.split(/\b/).length
    const citationCount = citations.length
    const clauseCount = clauses.length
    const highRiskTermCount = terms.filter(t => t.weight >= 0.7).length

    // Complexity formula
    const complexity =
      Math.min(100, Math.round(
        (wordCount / 150) +
        (citationCount * 2) +
        (clauseCount * 1.5) +
        (highRiskTermCount * 3)
      ))

    let complexityLabel: LegalAnalysisResult['complexityLabel'] = 'simple'
    if (complexity >= 75) complexityLabel = 'highly_complex'
    else if (complexity >= 50) complexityLabel = 'complex'
    else if (complexity >= 25) complexityLabel = 'standard'

    // Detect domains
    const domainKeywords = [
      { domain: 'Corporate / M&A', keywords: ['merger', 'acquisition', 'stock', 'shareholder', 'board of directors', 'subsidiary'] },
      { domain: 'Employment', keywords: ['employee', 'employer', 'at-will', 'compensation', 'benefits', 'non-compete'] },
      { domain: 'Intellectual Property', keywords: ['patent', 'trademark', 'copyright', 'license', 'IP', 'work for hire'] },
      { domain: 'Real Estate', keywords: ['property', 'lease', 'landlord', 'tenant', 'escrow', 'deed'] },
      { domain: 'Finance / Banking', keywords: ['loan', 'interest', 'principal', 'securities', 'investment', 'collateral'] },
      { domain: 'Healthcare', keywords: ['HIPAA', 'PHI', 'medical', 'patient', 'physician', 'treatment'] },
      { domain: 'Data Privacy', keywords: ['GDPR', 'CCPA', 'personal data', 'data breach', 'privacy policy', 'consent'] },
      { domain: 'Litigation', keywords: ['jurisdiction', 'arbitration', 'damages', 'venue', 'judgment', 'tort'] },
      { domain: 'Tax', keywords: ['IRC', 'tax deduction', 'revenue', 'gross income', 'tax'] },
      { domain: 'Constitutional', keywords: ['First Amendment', 'due process', 'equal protection', 'constitutional'] },
    ]

    const detectedDomains: string[] = []
    for (const { domain, keywords } of domainKeywords) {
      const matchCount = keywords.filter(kw => new RegExp(`\\b${kw}\\b`, 'i').test(text)).length
      if (matchCount >= 1) detectedDomains.push(domain)
    }

    // Build risk summary
    const criticalClauses = clauses.filter(c => c.riskLevel === 'critical')
    const highRiskClauses = clauses.filter(c => c.riskLevel === 'high')
    const riskTerms = terms.filter(t => t.weight >= 0.7)

    const riskSummaryParts: string[] = []
    if (criticalClauses.length > 0) riskSummaryParts.push(`${criticalClauses.length} critical clause(s) requiring attention`)
    if (highRiskClauses.length > 0) riskSummaryParts.push(`${highRiskClauses.length} high-risk clause(s)`)
    if (riskTerms.length > 0) riskSummaryParts.push(`${riskTerms.length} high-significance legal term(s) detected`)
    if (citationCount > 0) riskSummaryParts.push(`${citationCount} legal citation(s) identified`)

    const riskSummary = riskSummaryParts.length > 0
      ? riskSummaryParts.join('; ') + '.'
      : 'Document appears standard with no major risk indicators detected.'

    return {
      analysisId,
      citations,
      terms,
      clauses,
      complexity,
      complexityLabel,
      domains: detectedDomains.length > 0 ? detectedDomains : ['General'],
      riskSummary,
      metadata: {
        wordCount,
        citationCount,
        clauseCount,
        termCount: terms.length,
        language: 'en',
        analyzedAt: new Date().toISOString(),
      },
    }
  }
}

// ============================================================
// EXPORTS
// ============================================================

export const nlpEngine = new NLPEngine()
export default NLPEngine