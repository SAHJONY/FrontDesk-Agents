// Legal Research Types — shared interfaces for judge analysis, case law research, and document generation

// ============= Court Types =============
export type CourtType = 'family' | 'immigration' | 'bankruptcy' | 'ip'

// ============= Judge Analysis Types =============
export interface JudgeProfile {
  name: string
  court: string
  district: string
  appointmentYear: number
  tenure: number
  specialty: CourtType
  background: string
}

export interface WinRateMetric {
  totalCases: number
  wonCases: number
  lostCases: number
  settledCases: number
  winRate: number // 0-100
  avgTimeToDisposition: number // days
  appealsRate: number // 0-1
  reversalRate: number // 0-1
}

export type CaseOutcomeType = 'won' | 'lost' | 'settled' | 'dismissed' | 'appeal_success' | 'appeal_denied'

export interface CaseOutcome {
  caseId: string
  caseType: string
  judge: string
  outcome: CaseOutcomeType
  date: string // YYYY-MM-DD
  keyIssue: string
  precedentCited: string[]
}

export interface JudgeAnalysisResult {
  judge: JudgeProfile
  metrics: WinRateMetric
  recentOutcomes: CaseOutcome[]
  strengths: string[]
  weaknesses: string[]
  recommendedStrategies: string[]
  riskScore: number // 0-100
}

// ============= Case Law Research Types =============
export interface CaseLawEntry {
  caseName: string
  citation: string
  court: string
  year: number
  outcome: 'affirmed' | 'reversed' | 'vacated' | 'settled'
  legalIssue: string
  rulingSummary: string
  keyPrecedent: string
  appliedTest: string
  relevantStatute: string
  jurisdiction: string
  applicability: string
}

export interface CaseLawSearchResult {
  query: string
  court: CourtType
  results: CaseLawEntry[]
  totalFound: number
  mostRecentYear: number
  governingStatutes: string[]
}

// ============= Court Procedures Types =============
export interface CourtProcedureRule {
  rule: string
  description: string
  deadline?: string
  requirement?: string
}

export interface CourtProceduresResult {
  courtName: string
  courtType: CourtType
  procedures: CourtProcedureRule[]
  filingDeadlines: { deadline: string; description: string }[]
  filingRequirements: {
    required: string[]
    commonMistakes: string[]
    tips: string[]
  }
  judgeNotes?: Record<string, string>
}

// ============= Document Generation Types =============
export type DocumentType =
  // Family Law
  | 'family_intake'
  | 'family_custody_petition'
  | 'family_divorce_filing'
  | 'family_support_worksheet'
  | 'family_dv_restraining_order'
  | 'family_parental_responsibility_affidavit'
  // Bankruptcy
  | 'bankruptcy_means_test'
  | 'bankruptcy_chapter7_petition'
  | 'bankruptcy_chapter13_plan'
  | 'bankruptcy_schedule_a_b'
  | 'bankruptcy_statement_of_financial_affairs'
  | 'bankruptcy_creditor_matrix'
  // IP / Trademark
  | 'trademark_search_request'
  | 'trademark_application_1a'
  | 'trademark_application_1b'
  | 'trademark_cease_desist'
  | 'trademark_opposition'

export interface DocumentField {
  name: string
  label: string
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'textarea' | 'currency'
  required: boolean
  options?: string[] // for select type
  placeholder?: string
  helpText?: string
  validation?: {
    min?: number
    max?: number
    pattern?: string
    patternMessage?: string
  }
}

export interface DocumentTemplate {
  type: DocumentType
  title: string
  description: string
  courtType: CourtType
  jurisdiction: string
  fields: DocumentField[]
  sections: { title: string; fieldNames: string[] }[]
  legalBasis?: string
  estimatedCompletionTime?: string // e.g., "15-20 minutes"
  retentionPeriod?: string // e.g., "7 years"
}

export interface GeneratedDocument {
  id: string
  type: DocumentType
  title: string
  generatedAt: string // ISO date
  clientId?: string
  fields: Record<string, string | number | boolean>
  content: string // The full document text/markdown
  metadata: {
    courtType: CourtType
    jurisdiction: string
    legalBasis?: string
    wordCount?: number
    pageCount?: number
  }
}

// ============= Document Generation Input =============
export interface GenerateDocumentInput {
  type: DocumentType
  clientData: Record<string, string | number | boolean>
  jurisdiction?: string
  attorneyBarNumber?: string
}