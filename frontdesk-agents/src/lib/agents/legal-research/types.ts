// Legal Research - Core Types

export type CourtType = 'family' | 'immigration' | 'bankruptcy' | 'ip'

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
  winRate: number
  avgTimeToDisposition: number
  appealsRate: number
  reversalRate: number
}

export interface CaseOutcome {
  caseId: string
  caseType: string
  judge: string
  outcome: 'won' | 'lost' | 'settled' | 'dismissed' | 'appeal_success' | 'appeal_denied'
  date: string
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
  riskScore: number
}

export interface CaseLawEntry {
  caseName: string
  citation: string
  court: string
  year: number
  outcome: 'affirmed' | 'reversed' | 'remanded' | 'settled' | 'vacated'
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

export interface CourtProcedureRule {
  ruleNumber: string
  title: string
  description: string
  requirements: string[]
  deadlines: string[]
  commonMistakes: string[]
  strategicNotes: string[]
}

export interface CourtProceduresResult {
  court: string
  district: string
  courtType: CourtType
  localRules: CourtProcedureRule[]
  filingRequirements: string[]
  hearingProcedures: string[]
  criticalDeadlines: { event: string; daysBefore: number; rule: string }[]
  judgeSpecificNotes: { judgeName: string; note: string }[]
}