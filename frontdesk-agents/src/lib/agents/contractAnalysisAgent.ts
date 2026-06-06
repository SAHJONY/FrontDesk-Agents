/**
 * ============================================================
 * CONTRACT ANALYSIS AGENT
 * ============================================================
 *
 * Specialized AI agent for legal contract review that parses
 * contract text, extracts key clauses (indemnification, termination,
 * liability, etc.), and flags риски (risks) for legal professionals.
 *
 * Extends BaseReceptionistAgent to integrate with the existing
 * agent-workforce system.
 */

import { EventEmitter } from 'events'
import { v4 as uuid } from 'uuid'
import { IndustryType, AgentType } from './types'
import {
  BaseReceptionistAgent,
  BaseReceptionistAgent as ReceptionistBase,
  Task,
  TaskResult,
} from './receptionist-agents'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'info'

export type ClauseType =
  | 'indemnification'
  | 'termination'
  | 'liability'
  | 'confidentiality'
  | 'non_compete'
  | 'non_solicitation'
  | 'force_majeure'
  | 'assignment'
  | 'dispute_resolution'
  | 'governing_law'
  | 'payment_terms'
  | 'intellectual_property'
  | 'warranties'
  | 'limitation_of_liability'
  | 'indemnity_cap'
  | 'auto_renewal'
  | 'data_protection'
  | 'insurance'
  | 'penalty'
  | 'unknown'

export interface ClauseMatch {
  id: string
  type: ClauseType
  title: string
  rawText: string
  summary: string
  startIndex: number
  endIndex: number
  riskLevel: RiskLevel
  riskFlags: string[]
  recommendations: string[]
  severity: number
}

export interface ContractAnalysisResult {
  contractId: string
  overallRiskScore: number
  riskLevel: RiskLevel
  clauses: ClauseMatch[]
  flaggedRisks: FlaggedRisk[]
  summary: ContractSummary
  redFlags: RedFlag[]
  recommendations: string[]
  metadata: ContractMetadata
}

export interface FlaggedRisk {
  id: string
  clauseType: ClauseType
  description: string
  riskLevel: RiskLevel
  severity: number
  excerpt: string
  legalExplanation: string
  mitigation: string
}

export interface RedFlag {
  id: string
  type: string
  description: string
  severity: number
  clauseExcerpt: string
  whyFlagged: string
}

export interface ContractSummary {
  contractType: string
  parties: string[]
  effectiveDate?: string
  expirationDate?: string
  renewalTerms?: string
  jurisdiction?: string
  governingLaw?: string
  totalClauses: number
  highRiskClauses: number
  mediumRiskClauses: number
  lowRiskClauses: number
}

export interface ContractMetadata {
  analyzedAt: Date
  wordCount: number
  estimatedReadingTime: number
  contractLanguage: string
  complexity: 'simple' | 'standard' | 'complex' | 'highly_complex'
  documentType: string
}

// ============================================================================
// CLAUSE PATTERN DEFINITIONS
// ============================================================================

interface ClauseDefinition {
  type: ClauseType
  title: string
  patterns: RegExp[]
  keywords: string[]
  riskIndicators: string[]
  riskLevel: RiskLevel
  baseSeverity: number
}

const CLAUSE_DEFINITIONS: ClauseDefinition[] = [
  {
    type: 'indemnification',
    title: 'Indemnification',
    patterns: [
      /\b indemnify /gi,
      /\b hold harmless /gi,
      /\b shall defend, indemnify and hold harmless /gi,
    ],
    keywords: ['indemnify', 'hold harmless', 'defend', 'save and hold harmless'],
    riskIndicators: [
      'unlimited indemnification',
      'broad indemnification scope',
      'no caps on indemnification',
      'indemnify without knowledge',
      'indemnify for third-party claims',
    ],
    riskLevel: 'high',
    baseSeverity: 75,
  },
  {
    type: 'termination',
    title: 'Termination',
    patterns: [
      /\b terminate /gi,
      /\b cancellation /gi,
      /\b cancel /gi,
      /\b breach of contract /gi,
      /\b for cause /gi,
      /\b without cause /gi,
    ],
    keywords: ['termination', 'cancel', 'breach', 'cure period', 'for cause', 'without cause'],
    riskIndicators: [
      'immediate termination right',
      'no cure period',
      'unilateral termination',
      'termination for convenience',
      'auto-termination on change of control',
    ],
    riskLevel: 'medium',
    baseSeverity: 55,
  },
  {
    type: 'liability',
    title: 'Limitation of Liability',
    patterns: [
      /\b limitation of liability /gi,
      /\b liable .* not exceed /gi,
      /\b not be liable /gi,
      /\b maximum liability /gi,
      /\b exclude damages /gi,
      /\b caps? (?:its|their) liability /gi,
    ],
    keywords: ['limitation of liability', 'caps liability', 'not liable', 'maximum liability', 'exclude damages'],
    riskIndicators: [
      'unlimited liability exposure',
      'no liability cap',
      'exclusion of consequential damages',
      'waiver of liability',
      'liability for indirect losses',
    ],
    riskLevel: 'high',
    baseSeverity: 70,
  },
  {
    type: 'confidentiality',
    title: 'Confidentiality',
    patterns: [
      /\b confidential /gi,
      /\b proprietary information /gi,
      /\b non-disclosure /gi,
      /\b trade secret /gi,
    ],
    keywords: ['confidential', 'proprietary', 'non-disclosure', 'trade secret', 'privileged information'],
    riskIndicators: [
      'no time limit on confidentiality',
      'broad definition of confidential information',
      'permitted disclosure exceptions too narrow',
    ],
    riskLevel: 'medium',
    baseSeverity: 45,
  },
  {
    type: 'non_compete',
    title: 'Non-Compete',
    patterns: [
      /\b non-compete /gi,
      /\b noncompete /gi,
      /\b competitive .* activit/gi,
      /\b competition .* restrict /gi,
    ],
    keywords: ['non-compete', 'non-competition', 'competitive restriction', 'no competing business', 'competitive activities'],
    riskIndicators: [
      'geographic scope too broad',
      'duration exceeds 2 years',
      'scope too vague or broad',
      'no carve-out for passive investments',
    ],
    riskLevel: 'high',
    baseSeverity: 80,
  },
  {
    type: 'non_solicitation',
    title: 'Non-Solicitation',
    patterns: [
      /\b non-solicitation /gi,
      /\b non solicitation /gi,
      /\b not solicit /gi,
    ],
    keywords: ['non-solicit', 'no solicitation', 'customer restriction', 'employee non-solicit'],
    riskIndicators: [
      'duration exceeds 2 years',
      'broad geographic scope',
      'applies to existing customers',
      'employees broadly defined',
    ],
    riskLevel: 'medium',
    baseSeverity: 50,
  },
  {
    type: 'force_majeure',
    title: 'Force Majeure',
    patterns: [
      /\b force majeure /gi,
      /\b act of god /gi,
      /\b unforeseeable circumstances /gi,
      /\b beyond control /gi,
    ],
    keywords: ['force majeure', 'acts of god', 'beyond control', 'unforeseeable', 'natural disaster'],
    riskIndicators: [
      'no pandemic or epidemic clause',
      'no clear relief mechanism',
      'force majeure used to excuse payment',
      'broad sweeping force majeure language',
    ],
    riskLevel: 'medium',
    baseSeverity: 40,
  },
  {
    type: 'assignment',
    title: 'Assignment',
    patterns: [
      /\b assignment /gi,
      /\b assign /gi,
      /\b transfer /gi,
      /\b delegate /gi,
    ],
    keywords: ['assignment', 'transfer', 'delegate', 'assign rights', 'transfer obligations'],
    riskIndicators: [
      'unlimited assignment rights',
      'counterparty can assign without consent',
      'no notice requirement for assignment',
      'successor clause broad',
    ],
    riskLevel: 'medium',
    baseSeverity: 45,
  },
  {
    type: 'dispute_resolution',
    title: 'Dispute Resolution / Arbitration',
    patterns: [
      /\b arbitration /gi,
      /\b mediation /gi,
      /\b dispute resolution /gi,
      /\b forum /gi,
      /\b venue /gi,
      /\b class action waiver /gi,
    ],
    keywords: ['arbitration', 'mediation', 'dispute resolution', 'forum', 'venue', 'jury waiver', 'class action'],
    riskIndicators: [
      'mandatory arbitration in unfavorable venue',
      'no class action right',
      'jury waiver buried',
      'arbitration costs asymmetric',
      'no discovery in arbitration',
    ],
    riskLevel: 'medium',
    baseSeverity: 55,
  },
  {
    type: 'governing_law',
    title: 'Governing Law',
    patterns: [
      /\b governing law /gi,
      /\b controlled by /gi,
      /\b interpreted under /gi,
      /\b laws? of /gi,
    ],
    keywords: ['governing law', 'controlled by', 'interpreted under', 'construed in accordance with', 'jurisdiction'],
    riskIndicators: [
      'foreign governing law',
      'unfavorable jurisdiction',
      'exclusive jurisdiction clause',
      'no choice of law protection',
    ],
    riskLevel: 'low',
    baseSeverity: 30,
  },
  {
    type: 'payment_terms',
    title: 'Payment Terms',
    patterns: [
      /\b payment /gi,
      /\b invoice /gi,
      /\b net 30 /gi,
      /\b net 60 /gi,
      /\b net 90 /gi,
      /\b fee /gi,
      /\b compensation /gi,
    ],
    keywords: ['payment', 'invoice', 'net 30', 'net 60', 'fee', 'compensation', 'retainer'],
    riskIndicators: [
      'no payment terms specified',
      'automatic price increase',
      'unilateral fee changes',
      'payment in advance only',
      'no late payment penalty protection',
    ],
    riskLevel: 'medium',
    baseSeverity: 50,
  },
  {
    type: 'intellectual_property',
    title: 'Intellectual Property',
    patterns: [
      /\b intellectual property /gi,
      /\b copyright /gi,
      /\b patent /gi,
      /\b trademark /gi,
      /\b work (?:made|created|developed) for hire /gi,
    ],
    keywords: ['intellectual property', 'IP', 'copyright', 'patent', 'trademark', 'work for hire', 'ownership'],
    riskIndicators: [
      'work for hire clause',
      'broad IP assignment',
      'perpetual IP rights',
      'license back to licensor',
      'no IP retention for pre-existing IP',
    ],
    riskLevel: 'high',
    baseSeverity: 70,
  },
  {
    type: 'warranties',
    title: 'Warranties',
    patterns: [
      /\b warranty /gi,
      /\b warranties /gi,
      /\b represented? /gi,
      /\b disclaim /gi,
      /\b no warranty /gi,
    ],
    keywords: ['warranty', 'warranties', 'representations', 'disclaim', 'as is', 'no warranty'],
    riskIndicators: [
      'no warranties made',
      'disclaimer of implied warranties',
      'unlimited warranty disclaimers',
      'no remedy for breach of warranty',
    ],
    riskLevel: 'medium',
    baseSeverity: 50,
  },
  {
    type: 'indemnity_cap',
    title: 'Indemnity Cap',
    patterns: [
      /\b indemnify .* cap /gi,
      /\b indemnify .* limit /gi,
      /\b cap .* indemnification /gi,
    ],
    keywords: ['indemnity cap', 'indemnification limit', 'maximum indemnification', 'liability cap'],
    riskIndicators: [
      'no cap on indemnification',
      'cap set below potential exposure',
      'carve-out for gross negligence',
      'cap excludes defense costs',
    ],
    riskLevel: 'high',
    baseSeverity: 75,
  },
  {
    type: 'auto_renewal',
    title: 'Auto-Renewal',
    patterns: [
      /\b auto-?renewal? /gi,
      /\b automatically renew /gi,
      /\b must provide notice (?:of |to )? non-renewal /gi,
    ],
    keywords: ['auto-renewal', 'automatic renewal', 'must give notice', 'rolling renewal', 'term extension'],
    riskIndicators: [
      'short notice period less than 30 days',
      'no maximum renewal term',
      'notice by email only',
      'auto-renewal with price increase',
    ],
    riskLevel: 'medium',
    baseSeverity: 50,
  },
  {
    type: 'data_protection',
    title: 'Data Protection / Privacy',
    patterns: [
      /\b data protection /gi,
      /\b privacy /gi,
      /\b personal data /gi,
      /\b GDPR /gi,
      /\b CCPA /gi,
      /\b data breach /gi,
    ],
    keywords: ['data protection', 'GDPR', 'CCPA', 'personal data', 'privacy', 'data breach', 'PII'],
    riskIndicators: [
      'no data breach notification',
      'no processing limitations',
      'cross-border data transfer unrestricted',
      'no data deletion right',
      'processor not defined',
    ],
    riskLevel: 'high',
    baseSeverity: 65,
  },
  {
    type: 'insurance',
    title: 'Insurance Requirements',
    patterns: [
      /\b insurance /gi,
      /\b coverage /gi,
      /\b policy /gi,
      /\b insured /gi,
    ],
    keywords: ['insurance', 'coverage', 'policy', 'insured', 'liability insurance', 'workers comp'],
    riskIndicators: [
      'insurance requirement missing',
      'no minimum coverage amounts',
      'counterparty not required to maintain insurance',
      'no certificate of insurance requirement',
    ],
    riskLevel: 'low',
    baseSeverity: 30,
  },
  {
    type: 'penalty',
    title: 'Penalties and Liquidated Damages',
    patterns: [
      /\b liquidated damages /gi,
      /\b penalty /gi,
      /\b punitive /gi,
    ],
    keywords: ['liquidated damages', 'penalties', 'fines', 'punitive damages', 'early termination fee'],
    riskIndicators: [
      'liquidated damages excessive',
      'penalty not proportionate',
      'no cap on penalties',
      'unenforceable penalty clause',
    ],
    riskLevel: 'high',
    baseSeverity: 70,
  },
]

// ============================================================================
// MITIGATION MAP
// ============================================================================

const MITIGATION_MAP: Record<ClauseType, string> = {
  indemnification:
    'Negotiate a cap on indemnification (e.g., 1x-2x annual fees). Add carve-outs for gross negligence and willful misconduct. Require prompt notice of claims.',
  termination:
    'Ensure adequate cure period (30+ days). Negotiate mutual termination rights. Add transition assistance provisions.',
  liability:
    'Add limitation of liability cap. Exclude consequential damages where appropriate. Carve out for willful misconduct and gross negligence.',
  confidentiality:
    'Define confidential information clearly with exclusions. Add time limits (2-5 years) for confidential obligations. Limit permitted disclosures.',
  non_compete:
    'Narrow geographic scope to specific market. Limit duration to 1-2 years max. Add carve-out for passive investments.',
  non_solicitation:
    'Limit to actively solicited employees. Reduce duration to 12-18 months. Carve out for general advertising.',
  force_majeure:
    'Add pandemic/epidemic clause. Define clear relief mechanism and termination right if FM continues beyond 90 days.',
  assignment:
    'Require written consent for assignment. Include successor clause protections. Add change of control provisions.',
  dispute_resolution:
    'Prefer neutral venue. Ensure class action waiver is mutual. Validate arbitration costs are proportionate.',
  governing_law:
    'Prefer mutual home jurisdiction. Add severability clause. Consider federal law preemption carve-out.',
  payment_terms:
    'Specify exact payment terms with due dates. Add late payment interest (1-2% per month). Define accepted payment methods.',
  intellectual_property:
    'Clearly define what IP is being licensed vs. assigned. Retain rights to pre-existing IP. Limit license scope to contract purpose.',
  warranties:
    'Ensure all warranties are qualified with knowledge qualifiers. Align warranty period with industry norms (12-24 months).',
  indemnity_cap:
    'Confirm cap exists and is reasonable (1x-2x fees). Verify cap includes defense costs. Add gross negligence exception.',
  auto_renewal:
    'Negotiate minimum 30-day notice period. Add price increase cap in renewal. Limit maximum renewal terms (1+1, not perpetual).',
  data_protection:
    'Ensure GDPR/CCPA compliance. Add breach notification within 72 hours. Define data retention and deletion timelines.',
  insurance:
    'Specify minimum coverage amounts. Require certificate of insurance as condition. Add named insured requirements.',
  penalty:
    'Ensure liquidated damages are reasonable estimate of harm. Avoid punitive penalties. Add cap on penalties.',
  unknown:
    'Review with legal counsel to determine enforceability and risk exposure.',
  limitation_of_liability:
    'Add mutual liability cap. Exclude consequential damages. Carve out for willful misconduct and gross negligence.',
}

// ============================================================================
// LEGAL EXPLANATIONS MAP
// ============================================================================

const LEGAL_EXPLANATIONS: Record<ClauseType, string> = {
  indemnification:
    'Indemnification clauses require one party to compensate the other for specified losses. Broad indemnification without caps can create unlimited financial exposure.',
  termination:
    'Termination clauses define when and how parties can end the contract. Lack of termination rights or one-sided termination can lock parties into unfavorable arrangements.',
  liability:
    'Limitation of liability clauses cap the damages one party can recover from another. Missing or weak caps expose parties to significant financial risk.',
  confidentiality:
    'Confidentiality obligations protect sensitive business information. Undefined scope or perpetual obligations may be overbroad and difficult to enforce.',
  non_compete:
    'Non-compete agreements restrict competitive activities. Overly broad non-competes may be unenforceable and expose parties to litigation risk.',
  non_solicitation:
    'Non-solicitation clauses prevent poaching of employees or customers. Must be reasonable in scope and duration to be enforceable.',
  force_majeure:
    'Force majeure clauses excuse performance during extraordinary events. Without clear triggering events and relief mechanisms, parties may face liability for events beyond their control.',
  assignment:
    'Assignment clauses govern whether and how contract rights can be transferred. Unrestricted assignment can result in contract being assigned to undesirable counterparties.',
  dispute_resolution:
    'Dispute resolution clauses determine how contract disputes will be resolved. Mandatory arbitration in unfavorable venues or class action waivers can significantly affect litigation rights.',
  governing_law:
    'Governing law clauses determine which jurisdiction laws apply to the contract. Forcing a party to litigate in an unfamiliar jurisdiction creates procedural disadvantage.',
  payment_terms:
    'Payment terms define when and how payments are made. Unclear or one-sided payment terms can create cash flow disputes.',
  intellectual_property:
    'IP clauses govern ownership and licensing of intellectual property. Overly broad assignments can deprive a party of rights to its own creations.',
  warranties:
    'Warranty clauses create promises about product or service quality. Disclaiming all warranties eliminates recourse for defective performance.',
  indemnity_cap:
    'Indemnity caps limit the maximum indemnification exposure. Lack of a cap creates unlimited exposure for indemnification claims.',
  auto_renewal:
    'Auto-renewal clauses automatically extend the contract term unless cancelled. Short notice periods and no price caps can lock parties into unwanted obligations.',
  data_protection:
    'Data protection clauses govern how personal and sensitive data is handled. Non-compliance with privacy laws can result in regulatory penalties and liability.',
  insurance:
    'Insurance requirements ensure adequate coverage for potential liabilities. Missing requirements can leave parties unprotected.',
  penalty:
    'Penalty clauses impose pre-set damages for breach. Excessive penalties may be deemed unenforceable as punitive rather than compensatory.',
  unknown:
    'This clause type requires legal review to assess its implications and enforceability.',
  limitation_of_liability:
    'Limitation of liability clauses cap the damages recoverable in case of breach. Missing caps expose parties to unlimited financial risk.',
}

// ============================================================================
// CLAUSE RECOMMENDATIONS MAP
// ============================================================================

const CLAUSE_RECOMMENDATIONS: Record<ClauseType, string[]> = {
  indemnification: [
    'Cap indemnification at 1x-2x annual fees',
    'Add gross negligence carve-out',
    'Require prompt written notice of claims',
    'Include defense costs in cap',
  ],
  termination: [
    'Ensure mutual termination for convenience rights',
    'Add minimum 30-day cure period',
    'Include transition assistance provisions',
    'Define post-termination obligations',
  ],
  liability: [
    'Add mutual liability cap',
    'Exclude consequential damages where appropriate',
    'Carve out for willful misconduct',
    'Define de minimis threshold',
  ],
  confidentiality: [
    'Define confidential information clearly',
    'Add time limits (2-5 years typical)',
    'Include standard exclusions (public info, independently developed)',
    'Limit permitted disclosures',
  ],
  non_compete: [
    'Narrow geographic scope to specific market',
    'Limit duration to 1-2 years maximum',
    'Add carve-out for passive investments under 5%',
    'Ensure consideration is adequate',
  ],
  non_solicitation: [
    'Limit to actively solicited employees only',
    'Reduce duration to 12-18 months',
    'Carve out for general advertising',
    'Define solicitation specifically',
  ],
  force_majeure: [
    'Add pandemic and epidemic events',
    'Define clear relief timeline (30-90 days)',
    'Include termination right if FM continues',
    'Address payment obligations during FM',
  ],
  assignment: [
    'Require written consent for assignment',
    'Include change of control provisions',
    'Add successor clause protections',
    'Define assignment broadly enough',
  ],
  dispute_resolution: [
    'Prefer neutral arbitration venue',
    'Ensure class action waiver is mutual',
    'Validate cost allocation is proportionate',
    'Add appeal rights for large claims',
  ],
  governing_law: [
    'Prefer mutual home jurisdiction',
    'Add severability clause',
    'Consider federal preemption carve-out',
    'Ensure venue is convenient for both',
  ],
  payment_terms: [
    'Specify exact payment due dates',
    'Add late payment interest (1-2% per month)',
    'Define accepted payment methods',
    'Include invoice dispute process',
  ],
  intellectual_property: [
    'Clearly separate license vs. assignment',
    'Retain rights to pre-existing IP',
    'Limit license scope to contract purpose',
    'Define deliverable ownership specifically',
  ],
  warranties: [
    'Qualify warranties with knowledge standards',
    'Align warranty period with industry norms',
    'Include cure or replacement rights',
    'Define merchantability standard',
  ],
  indemnity_cap: [
    'Confirm cap exists and is documented',
    'Verify cap includes defense costs',
    'Add gross negligence exception to cap',
    'Check for insurance coverage interaction',
  ],
  auto_renewal: [
    'Negotiate minimum 30-day notice period',
    'Add price increase cap in renewal',
    'Limit maximum renewal terms (1+1)',
    'Ensure renewal terms are not buried',
  ],
  data_protection: [
    'Ensure GDPR/CCPA compliance language',
    'Add breach notification (72-hour window)',
    'Define data retention and deletion timelines',
    'Clarify processor vs. controller obligations',
  ],
  insurance: [
    'Specify minimum coverage amounts',
    'Require certificate of insurance',
    'Add named insured requirements',
    'Verify coverage types match risk',
  ],
  penalty: [
    'Ensure liquidated damages are reasonable',
    'Avoid punitive penalty language',
    'Add cap on penalty amounts',
    'Define relationship to actual damages',
  ],
  unknown: [
    'Review with legal counsel',
    'Assess enforceability under applicable law',
    'Evaluate business risk exposure',
    'Negotiate clearer, more specific language',
  ],
  limitation_of_liability: [
    'Add mutual liability cap',
    'Exclude consequential damages',
    'Carve out for willful misconduct',
    'Define de minimis threshold',
  ],
}

// ============================================================================
// CONTRACT ANALYSIS AGENT
// ============================================================================

export class ContractAnalysisAgent extends ReceptionistBase {
  private analyzedContracts = new Map<string, ContractAnalysisResult>()

  constructor() {
    super({
      id: 'contract-analysis-1',
      name: 'LEXIS',
      role: 'contract_analysis',
      capabilities: [
        {
          name: 'contract_analysis',
          description:
            'AI-powered contract review agent that extracts key clauses, flags риски, and provides legal recommendations',
          tools: [
            'analyze_contract',
            'extract_clauses',
            'flag_risks',
            'summarize_contract',
            'compare_clauses',
            'identify_red_flags',
            'generate_risk_report',
          ],
          maxConcurrentTasks: 5,
        },
      ],
    })

    this.registerTools()
  }

  private registerTools(): void {
    this.registerTool({
      name: 'analyze_contract',
      description: 'Perform full contract analysis — parse text, extract clauses, flag risks',
      execute: async (params: unknown) => {
        const p = params as { contractText: string; contractType?: string; parties?: string[] }
        const result = this.analyzeContract(p.contractText, p.contractType, p.parties)
        return { success: true, output: result, duration: 0 }
      },
    })

    this.registerTool({
      name: 'extract_clauses',
      description: 'Extract all detected clauses from contract text',
      execute: async (params: unknown) => {
        const p = params as { contractText: string }
        const clauses = this.extractClauses(p.contractText)
        return { success: true, output: { clauses, count: clauses.length }, duration: 0 }
      },
    })

    this.registerTool({
      name: 'flag_risks',
      description: 'Identify and flag риски (risks) in contract text',
      execute: async (params: unknown) => {
        const p = params as { contractText: string; riskLevel?: RiskLevel }
        const risks = this.flagRisks(p.contractText, p.riskLevel)
        return { success: true, output: { risks, count: risks.length }, duration: 0 }
      },
    })

    this.registerTool({
      name: 'summarize_contract',
      description: 'Generate a summary of the contract',
      execute: async (params: unknown) => {
        const p = params as { contractText: string }
        const clauses = this.extractClauses(p.contractText)
        const summary = this.generateSummary(p.contractText, clauses)
        return { success: true, output: summary, duration: 0 }
      },
    })

    this.registerTool({
      name: 'compare_clauses',
      description: 'Compare clauses across two contract versions',
      execute: async (params: unknown) => {
        const p = params as { contractTextA: string; contractTextB: string }
        const comparison = this.compareContracts(p.contractTextA, p.contractTextB)
        return { success: true, output: comparison, duration: 0 }
      },
    })

    this.registerTool({
      name: 'identify_red_flags',
      description:
        'Identify red flags — unusual, unfavorable, or potentially unenforceable terms',
      execute: async (params: unknown) => {
        const p = params as { contractText: string }
        const redFlags = this.identifyRedFlags(p.contractText)
        return { success: true, output: { redFlags, count: redFlags.length }, duration: 0 }
      },
    })

    this.registerTool({
      name: 'generate_risk_report',
      description: 'Generate a comprehensive risk report for the contract',
      execute: async (params: unknown) => {
        const p = params as { contractText: string; contractType?: string }
        const result = this.analyzeContract(p.contractText, p.contractType)
        return { success: true, output: result, duration: 0 }
      },
    })
  }

  getCapabilities(): string[] {
    return [
      'Full Contract Analysis',
      'Clause Extraction (20+ types)',
      'Risk Flagging',
      'Red Flag Detection',
      'Contract Summarization',
      'Version Comparison',
      'Risk Report Generation',
      'Legal Recommendations',
    ]
  }

  // ===========================================================================
  // CORE ANALYSIS ENGINE
  // ===========================================================================

  public analyzeContract(
    contractText: string,
    contractType?: string,
    parties?: string[]
  ): ContractAnalysisResult {
    const contractId = `CONTRACT-${uuid()}`
    const clauses = this.extractClauses(contractText)
    const flaggedRisks = this.flagRisks(contractText)
    const redFlags = this.identifyRedFlags(contractText)
    const summary = this.generateSummary(contractText, clauses)

    const overallRiskScore = this.calculateOverallRiskScore(clauses, flaggedRisks, redFlags)
    const riskLevel = this.scoreToRiskLevel(overallRiskScore)

    const result: ContractAnalysisResult = {
      contractId,
      overallRiskScore,
      riskLevel,
      clauses,
      flaggedRisks,
      summary,
      redFlags,
      recommendations: this.generateRecommendations(clauses, flaggedRisks, redFlags),
      metadata: {
        analyzedAt: new Date(),
        wordCount: contractText.split(/\s+/).filter((w) => w.length > 0).length,
        estimatedReadingTime: Math.ceil(
          contractText.split(/\s+/).filter((w) => w.length > 0).length / 200
        ),
        contractLanguage: 'en',
        complexity: this.assessComplexity(contractText, clauses),
        documentType: contractType || this.detectContractType(contractText),
      },
    }

    this.analyzedContracts.set(contractId, result)
    return result
  }

  public extractClauses(contractText: string): ClauseMatch[] {
    const clauses: ClauseMatch[] = []

    for (const def of CLAUSE_DEFINITIONS) {
      for (const pattern of def.patterns) {
        const re = new RegExp(pattern.source, 'gi')
        let match: RegExpExecArray | null

        while ((match = re.exec(contractText)) !== null) {
          const startIndex = match.index
          const endIndex = startIndex + match[0].length

          const contextStart = Math.max(0, startIndex - 200)
          const contextEnd = Math.min(contractText.length, endIndex + 200)
          const context = contractText.substring(contextStart, contextEnd)

          const sentenceStart = this.findSentenceStart(contractText, startIndex)
          const sentenceEnd = this.findSentenceEnd(contractText, endIndex)
          const cleanText = contractText.substring(sentenceStart, sentenceEnd).trim()

          const { riskLevel, riskFlags } = this.assessClauseRisk(def, cleanText, contractText)
          const severity = this.calculateClauseSeverity(def, riskFlags)

          clauses.push({
            id: `CLAUSE-${uuid()}`,
            type: def.type,
            title: def.title,
            rawText: match[0],
            summary: this.summarizeClause(def.type, cleanText),
            startIndex,
            endIndex,
            riskLevel,
            riskFlags,
            recommendations: this.getClauseRecommendations(def.type, riskLevel, riskFlags),
            severity,
          })

          break
        }
      }
    }

    return clauses.sort((a, b) => b.severity - a.severity)
  }

  public flagRisks(contractText: string, minRiskLevel?: RiskLevel): FlaggedRisk[] {
    const allRisks: FlaggedRisk[] = []

    for (const def of CLAUSE_DEFINITIONS) {
      if (def.riskLevel === 'critical' || def.riskLevel === 'high') {
        for (const pattern of def.patterns) {
          const re = new RegExp(pattern.source, 'gi')
          const match = re.exec(contractText)
          if (match) {
            allRisks.push(this.createFlaggedRisk(def, match[0], contractText))
          }
        }
      }
    }

    allRisks.push(...this.detectContextualRisks(contractText))

    if (minRiskLevel) {
      const riskPriority: Record<RiskLevel, number> = {
        critical: 4,
        high: 3,
        medium: 2,
        low: 1,
        info: 0,
      }
      return allRisks
        .filter((r) => riskPriority[r.riskLevel] >= riskPriority[minRiskLevel])
        .sort((a, b) => b.severity - a.severity)
    }

    return allRisks.sort((a, b) => b.severity - a.severity)
  }

  public identifyRedFlags(contractText: string): RedFlag[] {
    const redFlags: RedFlag[] = []

    const oneSidedTests: Array<{ pattern: RegExp; description: string }> = [
      { pattern: /(?:only|solely) (?:party|the counterparty) .* may/i, description: 'One-sided termination right' },
      { pattern: /void if (?:unapproved|rejected|disapproved)/i, description: 'Approval can void contract unilaterally' },
      { pattern: /waive(?:s|r|d)? .* (?:right|obligation)/i, description: 'Waiver of rights clause present' },
      { pattern: /\b irrevocable \b/i, description: 'Irrevocable obligation — limited flexibility' },
    ]

    for (const { pattern, description } of oneSidedTests) {
      if (pattern.test(contractText)) {
        const match = contractText.match(pattern)
        redFlags.push({
          id: `RF-${uuid()}`,
          type: 'one_sided',
          description,
          severity: 75,
          clauseExcerpt: match?.[0] || '',
          whyFlagged: 'This clause appears to favor only one party and may be unenforceable or unfair.',
        })
      }
    }

    if (/\b(?:sole|solely|absolute|absolutely|unlimited)\b.{0,80}\bliable\b/i.test(contractText)) {
      const match = contractText.match(/\bliable\b[^.]{0,100}/i)
      redFlags.push({
        id: `RF-${uuid()}`,
        type: 'liability',
        description: 'Unlimited or absolute liability exposure detected',
        severity: 85,
        clauseExcerpt: match?.[0] || '',
        whyFlagged: 'Unlimited liability exposure can expose a party to catastrophic financial risk.',
      })
    }

    if (/waive(?:s|r|d)? .* (?:jury|class action|right to sue)/i.test(contractText)) {
      redFlags.push({
        id: `RF-${uuid()}`,
        type: 'unconscionability',
        description: 'Waiver of jury trial or class action — may be unconscionable',
        severity: 80,
        clauseExcerpt: contractText.match(/waive(?:s|r|d)? [^.]{0,150}/i)?.[0] || '',
        whyFlagged: 'Mandatory waiver of jury trial or class action rights may be unconscionable under state law.',
      })
    }

    if (/liquidated damages .* \b (?:excessive|unreasonable|punitive) \b/i.test(contractText)) {
      redFlags.push({
        id: `RF-${uuid()}`,
        type: 'penalty',
        description: 'Excessive liquidated damages — potentially unenforceable penalty',
        severity: 80,
        clauseExcerpt: contractText.match(/liquidated damages [^.]{0,150}/i)?.[0] || '',
        whyFlagged: 'Liquidated damages deemed punitive or unreasonable may be invalidated as a penalty.',
      })
    }

    if (/\b assign \b .* without (?:prior |written )? consent/i.test(contractText)) {
      redFlags.push({
        id: `RF-${uuid()}`,
        type: 'assignment',
        description: 'Assignment allowed without counterparty consent',
        severity: 55,
        clauseExcerpt: contractText.match(/assign [^.]{0,100}/i)?.[0] || '',
        whyFlagged: 'Unrestricted assignment rights could transfer the contract to an undesirable counterparty.',
      })
    }

    if (/indemnify(?:ication)?\b/i.test(contractText) && /\b any \b/i.test(contractText) && /\b(?:and all|claims?|losses?|damages?)\b/i.test(contractText)) {
      redFlags.push({
        id: `RF-${uuid()}`,
        type: 'indemnification',
        description: 'Broad indemnification covering any and all claims — asymmetric risk',
        severity: 90,
        clauseExcerpt: contractText.match(/(?:indemnify|indemnification).{0,150}/i)?.[0] || '',
        whyFlagged: 'Indemnification for any and all claims without caps creates unlimited exposure.',
      })
    }

    if (!/\b confidential \b/i.test(contractText) && /\b proprietary \b/i.test(contractText)) {
      redFlags.push({
        id: `RF-${uuid()}`,
        type: 'missing_protection',
        description: 'Proprietary information mentioned but no confidentiality clause found',
        severity: 60,
        clauseExcerpt: 'No explicit confidentiality clause detected',
        whyFlagged: 'Proprietary information is referenced without an enforceable confidentiality obligation.',
      })
    }

    if (/\b auto-?renew/i.test(contractText) || /\b automatically renew/i.test(contractText)) {
      // Check for explicit notice period: "30 days", "thirty (30) days", etc.
      const hasNumericDays = /\b(?:30|60|90)\s*days?\b/i.test(contractText)
      const hasWrittenDays = /\b(?:thirty|sixty|ninety).{0,40}days\b/i.test(contractText);
      const hasNotice = hasNumericDays || hasWrittenDays
      if (!hasNotice) {
        redFlags.push({
          id: `RF-${uuid()}`,
          type: 'auto_renewal',
          description: 'Auto-renewal without clear notice period — subscription trap risk',
          severity: 65,
          clauseExcerpt: contractText.match(/(?:auto-?renew|automatically renew).{0,100}/i)?.[0] || '',
          whyFlagged: 'Auto-renewal without clear notice period can lock parties into unwanted renewals.',
        })
      }
    }

    const governingMatch = contractText.match(/govern(?:ing)? law .* (?:State of|under the laws of) \b.*?,/i)
    if (governingMatch) {
      const unfavorableStates = ['Delaware', 'New York', 'California']
      for (const state of unfavorableStates) {
        if (governingMatch[0].includes(state)) {
          redFlags.push({
            id: `RF-${uuid()}`,
            type: 'jurisdiction',
            description: `Governing law set to ${state} — may disadvantage non-local party`,
            severity: 50,
            clauseExcerpt: governingMatch[0],
            whyFlagged: `Forcing ${state} law may impose unfamiliar legal standards on the other party.`,
          })
        }
      }
    }

    if (/work[s]? (?:made|created|developed) (?:for|under|as) hire \b/i.test(contractText)) {
      if (/\b all \b .* \b (?:rights?|IP|intellectual property) \b/i.test(contractText)) {
        redFlags.push({
          id: `RF-${uuid()}`,
          type: 'intellectual_property',
          description: 'Work-for-hire with all rights assignment — may overreach',
          severity: 75,
          clauseExcerpt: contractText.match(/work[s]? (?:made|created|developed) [^.]{0,150}/i)?.[0] || '',
          whyFlagged: 'Work-for-hire with all-rights assignment may deprive party of legitimate IP rights.',
        })
      }
    }

    return redFlags.sort((a, b) => b.severity - a.severity)
  }

  // ===========================================================================
  // RISK ASSESSMENT HELPERS
  // ===========================================================================

  private assessClauseRisk(
    def: ClauseDefinition,
    clauseText: string,
    _fullText: string
  ): { riskLevel: RiskLevel; riskFlags: string[] } {
    const riskFlags: string[] = []

    for (const indicator of def.riskIndicators) {
      if (clauseText.toLowerCase().includes(indicator.toLowerCase())) {
        riskFlags.push(indicator)
      }
    }

    if (
      clauseText.includes('without limitation') ||
      clauseText.includes('including without limitation')
    ) {
      riskFlags.push('broad without limitation language amplifies risk')
    }

    if (/\b (?:unlimited|unrestricted|sole discretion) \b/i.test(clauseText)) {
      riskFlags.push('unlimited discretion or scope detected')
    }

    if (
      /\b (?:except|excluding|notwithstanding) \b .* (?:gross negligence|willful misconduct|fraud)/i.test(
        clauseText
      )
    ) {
      riskFlags.push('carve-out for gross negligence or fraud — exposure amplification')
    }

    const hasCapIndicators = /\b (?:cap|limit|maximum|not exceed|ceiling) \b/i.test(clauseText)
    if (!hasCapIndicators && def.type === 'indemnification') {
      riskFlags.push('NO CAP on indemnification — unlimited exposure')
    }

    if (
      clauseText.toLowerCase().includes('without limitation') ||
      clauseText.toLowerCase().includes('without limitations') ||
      clauseText.toLowerCase().includes('unlimited indemnification')
    ) {
      riskFlags.push('without limitation language — unlimited indemnification exposure')
    }

    if (/\b (?:perpetual|forever|indefinite) \b/i.test(clauseText)) {
      riskFlags.push('perpetual or indefinite obligation detected')
    }

    let riskLevel = def.riskLevel
    if (riskFlags.length >= 3) {
      riskLevel = riskLevel === 'critical' ? 'critical' : riskLevel === 'high' ? 'critical' : 'high'
    } else if (riskFlags.length >= 1) {
      riskLevel =
        riskLevel === 'low' ? 'medium' : riskLevel === 'medium' ? 'high' : riskLevel
    }

    return { riskLevel, riskFlags }
  }

  private calculateClauseSeverity(def: ClauseDefinition, riskFlags: string[]): number {
    let severity = def.baseSeverity + riskFlags.length * 8
    return Math.min(100, severity)
  }

  private calculateOverallRiskScore(
    clauses: ClauseMatch[],
    risks: FlaggedRisk[],
    redFlags: RedFlag[]
  ): number {
    const allEmpty = clauses.length === 0 && risks.length === 0 && redFlags.length === 0
    if (allEmpty) return 10

    // No clauses extracted — minimum score of 10, regardless of contextual risks
    if (clauses.length === 0) return 10

    const clauseContrib =
      clauses.reduce((sum, c) => sum + c.severity, 0) / clauses.length
    const riskContrib =
      (risks.reduce((sum, r) => sum + r.severity, 0) / Math.max(risks.length, 1)) * 1.5
    const redFlagContrib =
      (redFlags.reduce((sum, rf) => sum + rf.severity, 0) / Math.max(redFlags.length, 1)) * 1.2

    const score = clauseContrib * 0.4 + riskContrib * 0.35 + redFlagContrib * 0.25
    return Math.min(100, Math.round(score))
  }

  private scoreToRiskLevel(score: number): RiskLevel {
    if (score >= 80) return 'critical'
    if (score >= 60) return 'high'
    if (score >= 40) return 'medium'
    if (score >= 20) return 'low'
    return 'info'
  }

  private createFlaggedRisk(def: ClauseDefinition, matchedText: string, _fullText: string): FlaggedRisk {
    const { riskLevel, riskFlags } = this.assessClauseRisk(def, matchedText, matchedText)
    const severity = this.calculateClauseSeverity(def, riskFlags)

    return {
      id: `RISK-${uuid()}`,
      clauseType: def.type,
      description: `${def.title} clause detected with ${
        riskFlags.length > 0 ? riskFlags.join(', ') : 'potential for unfavorable terms'
      }`,
      riskLevel,
      severity,
      excerpt: matchedText,
      legalExplanation: LEGAL_EXPLANATIONS[def.type] || LEGAL_EXPLANATIONS.unknown,
      mitigation: MITIGATION_MAP[def.type] || 'Consult with legal counsel for mitigation strategies.',
    }
  }

  private detectContextualRisks(contractText: string): FlaggedRisk[] {
    const risks: FlaggedRisk[] = []

    if (contractText.length > 50000) {
      risks.push({
        id: `RISK-${uuid()}`,
        clauseType: 'unknown',
        description: 'Unusually long contract — risk of buried unfavorable terms',
        riskLevel: 'medium',
        severity: 55,
        excerpt: `Contract is ${Math.round(contractText.length / 1000)}KB — significantly longer than standard agreements`,
        legalExplanation:
          'Excessively long contracts often contain hidden unfavorable terms buried in dense language. Parties may agree to terms they did not read.',
        mitigation:
          'Conduct thorough review of all sections. Consider negotiating a table of contents and section summaries.',
      })
    }

    if (!/\b terminate \b/i.test(contractText)) {
      risks.push({
        id: `RISK-${uuid()}`,
        clauseType: 'termination',
        description: 'No termination clause found — contract may be indefinite',
        riskLevel: 'high',
        severity: 70,
        excerpt: 'No termination provisions detected in the contract',
        legalExplanation:
          'A contract without termination provisions may be enforceable indefinitely, creating ongoing obligations with no exit.',
        mitigation: 'Negotiate termination for convenience clause with reasonable notice period (30-60 days).',
      })
    }

    if (
      !/\b limitation (?:of |on )? liability \b/i.test(contractText) &&
      !/\b not exceed \b .* \b liability /i.test(contractText)
    ) {
      risks.push({
        id: `RISK-${uuid()}`,
        clauseType: 'liability',
        description: 'No limitation of liability clause — unlimited exposure risk',
        riskLevel: 'high',
        severity: 65,
        excerpt: 'No limitation of liability provisions detected',
        legalExplanation:
          'Without liability limitations, a party may be exposed to unlimited damages in case of breach or dispute.',
        mitigation:
          'Negotiate mutual limitation of liability clause capping damages to 1x-2x annual fees or contract value.',
      })
    }

    return risks
  }

  // ===========================================================================
  // SUMMARY AND RECOMMENDATIONS
  // ===========================================================================

  private generateSummary(contractText: string, clauses: ClauseMatch[]): ContractSummary {
    const highRiskClauses = clauses.filter(
      (c) => c.riskLevel === 'high' || c.riskLevel === 'critical'
    )
    const mediumRiskClauses = clauses.filter((c) => c.riskLevel === 'medium')

    const partyMatches =
      contractText.match(/(?:between|among|with)\b[^,]*\band\b[^,]*/gi) || []
    const parties = partyMatches
      .slice(0, 4)
      .map((p) => p.replace(/^(?:between|among|with)\b/gi, '').trim())

    const datePatterns = [
      /\b (?:effective|date of|dated)\b[: \t]*\b\d+\b[/,\t]+\b\d+\b[/,\t]+\b\d+\b/i,
      /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\b\s+\d+\b,?\s+\d+/i,
    ]
    let effectiveDate: string | undefined
    for (const dp of datePatterns) {
      const match = contractText.match(dp)
      if (match) {
        effectiveDate = match[0]
        break
      }
    }

    const jurisdictionMatch = contractText.match(
      /(?:govern(?:ing)? law|governed by)[^,.]*?State of ([A-Z][a-z]+(?: [A-Z][a-z]+)?)/i
    )
    const governingLaw = jurisdictionMatch?.[1]

    return {
      contractType: this.detectContractType(contractText),
      parties: parties.length > 0 ? parties : ['Parties not clearly identified'],
      effectiveDate,
      expirationDate: this.findExpirationDate(contractText),
      renewalTerms: this.findRenewalTerms(contractText),
      jurisdiction: governingLaw,
      governingLaw,
      totalClauses: clauses.length,
      highRiskClauses: highRiskClauses.length,
      mediumRiskClauses: mediumRiskClauses.length,
      lowRiskClauses: clauses.length - highRiskClauses.length - mediumRiskClauses.length,
    }
  }

  private generateRecommendations(
    clauses: ClauseMatch[],
    risks: FlaggedRisk[],
    redFlags: RedFlag[]
  ): string[] {
    const recommendations: string[] = []

    const criticalRisks = risks.filter((r) => r.riskLevel === 'critical')
    if (criticalRisks.length > 0) {
      recommendations.push(
        `🚨 CRITICAL: ${criticalRisks.length} critical risk(s) detected. Recommend legal counsel review before execution.`
      )
    }

    if (clauses.some((c) => c.type === 'indemnification' && c.severity > 65)) {
      recommendations.push(
        '🔴 INDEMNIFICATION: Negotiate a cap on indemnification obligations (e.g., 1x-2x annual fees). Ensure defense costs are included within the cap.'
      )
    }

    if (clauses.some((c) => c.type === 'liability' && c.severity > 60)) {
      recommendations.push(
        '⚠️ LIABILITY: Add or strengthen limitation of liability clause. Cap damages at reasonable level (contract value or annual fees).'
      )
    }

    if (clauses.some((c) => c.type === 'auto_renewal')) {
      recommendations.push(
        '⚠️ AUTO-RENEWAL: Ensure notice period is at least 30 days. Negotiate price increase cap for renewal periods.'
      )
    }

    if (!clauses.some((c) => c.type === 'data_protection')) {
      recommendations.push(
        '⚠️ DATA PROTECTION: Add explicit data protection or privacy clause if handling personal data. Ensure GDPR/CCPA compliance language.'
      )
    }

    if (clauses.some((c) => c.type === 'non_compete')) {
      recommendations.push(
        '⚠️ NON-COMPETE: Ensure geographic scope and duration are reasonable. Most states require a 1-2 year maximum and specific geographic market.'
      )
    }

    if (redFlags.some((rf) => rf.type === 'indemnification')) {
      recommendations.push(
        '🚨 RED FLAG: Broad indemnification clause detected. Request narrowing of scope and addition of knowledge qualifiers.'
      )
    }

    if (redFlags.some((rf) => rf.type === 'unconscionability')) {
      recommendations.push(
        '🚨 RED FLAG: Waiver of jury trial or class action detected. Ensure such waivers are mutual and not buried in fine print.'
      )
    }

    if (recommendations.length === 0) {
      recommendations.push(
        'Contract appears to have standard, balanced terms. Minor risks identified — recommend standard review.'
      )
    }

    recommendations.push(
      'GENERAL: Always have legal counsel review contracts before execution. This analysis is a starting point, not legal advice.'
    )

    return recommendations
  }

  private getClauseRecommendations(
    clauseType: ClauseType,
    riskLevel: RiskLevel,
    _riskFlags: string[]
  ): string[] {
    const baseRecs = CLAUSE_RECOMMENDATIONS[clauseType] || CLAUSE_RECOMMENDATIONS.unknown

    if (riskLevel === 'critical' || riskLevel === 'high') {
      return baseRecs.slice(0, 4)
    }
    return baseRecs.slice(0, 2)
  }

  // ===========================================================================
  // CONTRACT COMPARISON
  // ===========================================================================

  public compareContracts(
    contractTextA: string,
    contractTextB: string
  ): {
    added: ClauseMatch[]
    removed: ClauseMatch[]
    modified: { before: ClauseMatch; after: ClauseMatch; changeDescription: string }[]
    riskDelta: number
  } {
    const clausesA = this.extractClauses(contractTextA)
    const clausesB = this.extractClauses(contractTextB)

    const typeSetA = new Set(clausesA.map((c) => c.type))
    const typeSetB = new Set(clausesB.map((c) => c.type))

    const added = clausesB.filter((c) => !typeSetA.has(c.type))
    const removed = clausesA.filter((c) => !typeSetB.has(c.type))

    const modified: { before: ClauseMatch; after: ClauseMatch; changeDescription: string }[] = []
    for (const clauseB of clausesB) {
      const matchA = clausesA.find((c) => c.type === clauseB.type)
      if (matchA) {
        const severityDelta = clauseB.severity - matchA.severity
        if (Math.abs(severityDelta) > 10) {
          modified.push({
            before: matchA,
            after: clauseB,
            changeDescription:
              severityDelta > 0
                ? `Risk increased by ${severityDelta} points — more concerning language detected`
                : `Risk decreased by ${Math.abs(severityDelta)} points — improved language detected`,
          })
        }
      }
    }

    const riskDelta =
      this.calculateOverallRiskScore(clausesB, [], []) -
      this.calculateOverallRiskScore(clausesA, [], [])

    return { added, removed, modified, riskDelta }
  }

  // ===========================================================================
  // UTILITY HELPERS
  // ===========================================================================

  private findSentenceStart(text: string, index: number): number {
    for (let i = index - 1; i >= 0; i--) {
      const char = text[i]
      if (char === '.' || char === '!' || char === '?' || char === ';') {
        return i + 1
      }
      if (char === '\n' && i > 0 && text[i - 1] === '\n') {
        return i + 1
      }
    }
    return 0
  }

  private findSentenceEnd(text: string, index: number): number {
    for (let i = index; i < text.length; i++) {
      const char = text[i]
      if (char === '.' || char === '!' || char === '?' || char === ';') {
        return i + 1
      }
      if (char === '\n' && i > index + 20 && text.substring(index, i).includes('.')) {
        return i
      }
    }
    return text.length
  }

  private summarizeClause(type: ClauseType, _text: string): string {
    const summaries: Record<ClauseType, string> = {
      indemnification:
        'Requires one party to compensate the other for losses, damages, or liabilities arising from specified events or breaches.',
      termination:
        'Governs the conditions and procedures under which the contract may be ended by either party.',
      liability:
        'Limits the financial exposure and types of damages one party can recover from the other in case of breach.',
      confidentiality:
        'Obliges parties to protect and not disclose certain sensitive or proprietary information.',
      non_compete:
        'Restricts one party from engaging in competitive business activities within a defined scope and duration.',
      non_solicitation:
        'Prevents one party from soliciting the other party employees, customers, or business relationships.',
      force_majeure:
        'Excuses performance obligations when extraordinary events beyond the parties control prevent fulfillment.',
      assignment:
        'Controls whether and how the rights and obligations under the contract can be transferred to another party.',
      dispute_resolution:
        'Establishes the mechanism and venue for resolving disagreements arising from the contract.',
      governing_law:
        'Specifies which jurisdiction legal framework will be used to interpret and govern the contract.',
      payment_terms:
        'Defines when, how, and under what conditions payments will be made between the parties.',
      intellectual_property:
        'Addresses ownership, licensing, and rights to intellectual property created or used under the contract.',
      warranties:
        'Creates promises or guarantees about the quality, condition, or performance of products or services.',
      indemnity_cap:
        'Sets maximum financial limits on indemnification obligations between the parties.',
      auto_renewal:
        'Automatically extends the contract term unless one party provides timely notice of non-renewal.',
      data_protection:
        'Establishes obligations for handling, protecting, and processing personal or sensitive data.',
      insurance:
        'Requires parties to maintain specified insurance coverage throughout the contract term.',
      penalty:
        'Imposes pre-determined financial penalties for specified breaches or failures.',
      unknown: 'This clause requires legal review to determine its nature and implications.',
      limitation_of_liability:
        'Caps the maximum damages one party can recover from another in the event of a breach or dispute.',
    }
    return summaries[type] || summaries.unknown
  }

  private detectContractType(contractText: string): string {
    const typeIndicators: Array<[RegExp, string]> = [
      [/master services agreement/i, 'Master Services Agreement (MSA)'],
      [/statement of work/i, 'Statement of Work (SOW)'],
      [/non-disclosure agreement/i, 'Non-Disclosure Agreement (NDA)'],
      [/purchase agreement/i, 'Purchase Agreement'],
      [/software license/i, 'Software License Agreement'],
      [/employment agreement/i, 'Employment Agreement'],
      [/consulting agreement/i, 'Consulting Agreement'],
      [/lease agreement/i, 'Lease Agreement'],
      [/partnership agreement/i, 'Partnership Agreement'],
      [/share purchase/i, 'Share Purchase Agreement'],
      [/asset purchase/i, 'Asset Purchase Agreement'],
      [/service level agreement/i, 'Service Level Agreement (SLA)'],
      [/privacy policy/i, 'Privacy Policy'],
      [/terms of service/i, 'Terms of Service'],
      [/vendor agreement/i, 'Vendor Agreement'],
      [/client services agreement/i, 'Client Services Agreement'],
      [/confidentiality agreement/i, 'Confidentiality Agreement'],
    ]

    for (const [pattern, label] of typeIndicators) {
      if (pattern.test(contractText)) return label
    }

    return 'General Contract Agreement'
  }

  private findExpirationDate(text: string): string | undefined {
    const datePatterns = [
      /\b(?:expires?|terminates?|ends?|expiration)\b[^.\n]{0,100}(?:\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\b\s+\d+,?\s+\d+|\b\d+\b[/]\b\d+\b[/]\b\d+\b)/i,
    ]
    for (const dp of datePatterns) {
      const match = text.match(dp)
      if (match) {
        return match[0].replace(/^(?:expires?|terminates?|ends?|expiration)\b/gi, '').trim()
      }
    }
    return undefined
  }

  private findRenewalTerms(text: string): string | undefined {
    if (/\b auto-?renew \b/i.test(text)) {
      const match = text.match(/auto-?renew(?:al)? [^.]{0,100}/i)
      return match ? match[0].trim() : 'Auto-renewal clause detected — review notice period'
    }
    if (/\b (?:renew|renewal) \b/i.test(text)) {
      const match = text.match(/renew(?:al)? [^.]{0,100}/i)
      return match?.[0].slice(0, 100).trim()
    }
    return undefined
  }

  private assessComplexity(
    text: string,
    clauses: ClauseMatch[]
  ): 'simple' | 'standard' | 'complex' | 'highly_complex' {
    const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length
    // Very long text: threshold lowered to 4000 (accounting for whitespace-split counting)
    // Also use text length as a secondary indicator for very large contracts
    if (wordCount > 4000 || text.length > 30000 || clauses.length > 15) return 'highly_complex'
    if (wordCount > 2500 || clauses.length > 8) return 'complex'
    if (wordCount > 1000 || clauses.length > 3) return 'standard'
    return 'simple'
  }

  // ===========================================================================
  // BASE AGENT TASK EXECUTION
  // ===========================================================================

  async executeTask(task: Task): Promise<TaskResult> {
    const context = task.context.variables as {
      action?: string
      contractText?: string
      contractType?: string
      parties?: string[]
      contractTextA?: string
      contractTextB?: string
    }

    switch (context.action) {
      case 'analyze':
        return this.executeTool('analyze_contract', context)
      case 'extract_clauses':
        return this.executeTool('extract_clauses', { contractText: context.contractText })
      case 'flag_risks':
        return this.executeTool('flag_risks', { contractText: context.contractText })
      case 'summarize':
        return this.executeTool('summarize_contract', { contractText: context.contractText })
      case 'compare':
        return this.executeTool('compare_clauses', {
          contractTextA: context.contractTextA,
          contractTextB: context.contractTextB,
        })
      case 'red_flags':
        return this.executeTool('identify_red_flags', { contractText: context.contractText })
      case 'risk_report':
        return this.executeTool('generate_risk_report', {
          contractText: context.contractText,
          contractType: context.contractType,
        })
      default: {
        const result = await this.executeTool('analyze_contract', context)
        const out = result.output as ContractAnalysisResult | undefined
        return {
          success: true,
          output: {
            agent: 'LEXIS',
            action: 'contract_analyzed',
            contractId: out?.contractId,
            overallRiskScore: out?.overallRiskScore,
            riskLevel: out?.riskLevel,
            clausesFound: out?.clauses.length,
            redFlags: out?.redFlags.length,
          },
        }
      }
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const contractAnalysisAgent = new ContractAnalysisAgent()
export default contractAnalysisAgent