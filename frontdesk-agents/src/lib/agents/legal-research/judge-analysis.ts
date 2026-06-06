// Judge Win-Rate Analysis Agent
// Analyzes judge history, win rates, and strategic recommendations for family, immigration, and bankruptcy courts

import { CourtType, JudgeProfile, WinRateMetric, CaseOutcome, JudgeAnalysisResult } from './types'

// Simulated judge database — in production, connect to PACER/Web or legal data provider API
const JUDGE_DATABASE: JudgeProfile[] = [
  // Family Court Judges
  { name: 'Hon. Sarah M. Bennett', court: 'Los Angeles Superior Court', district: 'California', appointmentYear: 2015, tenure: 10, specialty: 'family', background: 'Former family law practitioner, USC Law' },
  { name: 'Hon. Michael R. Torres', court: 'Cook County Circuit Court', district: 'Illinois', appointmentYear: 2018, tenure: 7, specialty: 'family', background: 'Former guardian ad litem, Northwestern Law' },
  { name: 'Hon. Jennifer L. Walsh', court: 'Harris County Family Court', district: 'Texas', appointmentYear: 2012, tenure: 13, specialty: 'family', background: 'Former CPS attorney, UT Austin Law' },
  { name: 'Hon. David K. Nakamura', court: 'King County Superior Court', district: 'Washington', appointmentYear: 2019, tenure: 6, specialty: 'family', background: 'Former mediator, UW School of Law' },
  { name: 'Hon. Patricia A. Coleman', court: 'Miami-Dade Circuit Court', district: 'Florida', appointmentYear: 2014, tenure: 11, specialty: 'family', background: 'Former appeals attorney, UF Law' },
  // Immigration Court Judges
  { name: 'Hon. Robert J. Martinez', court: 'Executive Office for Immigration Review - NYC', district: 'New York', appointmentYear: 2016, tenure: 9, specialty: 'immigration', background: 'Former DOJ trial attorney, Columbia Law' },
  { name: 'Hon. Grace W. Lin', court: 'EOIR - San Francisco', district: 'California', appointmentYear: 2020, tenure: 5, specialty: 'immigration', background: 'Former asylum officer, Stanford Law' },
  { name: 'Hon. Charles E. Thompson', court: 'EOIR - Chicago', district: 'Illinois', appointmentYear: 2013, tenure: 12, specialty: 'immigration', background: 'Former border patrol legal counsel, Georgetown Law' },
  { name: 'Hon. Maria Elena Rodriguez', court: 'EOIR - Houston', district: 'Texas', appointmentYear: 2017, tenure: 8, specialty: 'immigration', background: 'Former immigration clinic director, UH Law' },
  { name: "Hon. James P. O'Brien", court: 'EOIR - Boston', district: 'Massachusetts', appointmentYear: 2011, tenure: 14, specialty: 'immigration', background: 'Former UN refugee officer, Boston College Law' },
  // Bankruptcy Court Judges
  { name: 'Hon. William T. Sherwood', court: 'US Bankruptcy Court - SDNY', district: 'New York', appointmentYear: 2014, tenure: 11, specialty: 'bankruptcy', background: 'Former bankruptcy partner, Davis Polk, Yale Law' },
  { name: 'Hon. Katherine M. Finch', court: 'US Bankruptcy Court - CDCA', district: 'California', appointmentYear: 2018, tenure: 7, specialty: 'bankruptcy', background: 'Former Ch. 11 trustee, UCI Law' },
  { name: 'Hon. Randall J. Huff', court: 'US Bankruptcy Court - DDE', district: 'Delaware', appointmentYear: 2010, tenure: 15, specialty: 'bankruptcy', background: 'Former corporate restructuring counsel, Harvard Law' },
  { name: 'Hon. Sandra K. Morrison', court: 'US Bankruptcy Court - NDTX', district: 'Texas', appointmentYear: 2019, tenure: 6, specialty: 'bankruptcy', background: 'Former financial advisor, SMU Law' },
  { name: "Hon. Brian D. O'Marah", court: 'US Bankruptcy Court - EDMI', district: 'Michigan', appointmentYear: 2016, tenure: 9, specialty: 'bankruptcy', background: 'Former credit counseling agency counsel, UMich Law' },
]

// Simulated case outcomes — in production, sourced from court records analytics
function generateWinRateMetrics(judgeName: string, courtType: CourtType): WinRateMetric {
  // Use deterministic but realistic-looking data based on judge name
  const seed = judgeName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const baseRate = 0.45 + (seed % 30) / 100 // 45-75% win rate range

  // Different court types have different baseline characteristics
  const courtMultipliers: Record<CourtType, { avgDisposition: number; appealsRate: number }> = {
    family: { avgDisposition: 180, appealsRate: 0.12 },
    immigration: { avgDisposition: 90, appealsRate: 0.25 },
    bankruptcy: { avgDisposition: 45, appealsRate: 0.08 },
    ip: { avgDisposition: 120, appealsRate: 0.15 },
  }

  const cm = courtMultipliers[courtType]
  const totalCases = 80 + (seed % 120)

  return {
    totalCases,
    wonCases: Math.round(totalCases * baseRate),
    lostCases: Math.round(totalCases * (1 - baseRate) * 0.7),
    settledCases: Math.round(totalCases * (1 - baseRate) * 0.3),
    winRate: Math.round(baseRate * 100),
    avgTimeToDisposition: cm.avgDisposition + ((seed % 60) - 30),
    appealsRate: cm.appealsRate + ((seed % 5) / 100),
    reversalRate: 0.03 + ((seed % 8) / 100),
  }
}

function generateRecentOutcomes(judgeName: string, courtType: CourtType): CaseOutcome[] {
  const seed = judgeName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const caseTypes: Record<CourtType, string[]> = {
    family: ['Divorce', 'Child Custody', 'Child Support Modification', 'Domestic Violence Restraining Order', 'Parental Relocation'],
    immigration: ['Asylum', 'Withholding of Removal', 'Convention Against Torture', 'Cancellation of Removal', 'Voluntary Departure'],
    bankruptcy: ['Chapter 7 Discharge', 'Chapter 13 Plan Confirmation', 'Adversary Proceeding - Fraud', 'Motion to Lift Stay', 'Claim Objection'],
    ip: ['Trademark Registration', 'Trademark Opposition', 'Copyright Infringement', 'Patent Infringement', 'Cease and Desist'],
  }
  const outcomes: CaseOutcome['outcome'][] = ['won', 'lost', 'settled', 'dismissed', 'appeal_success', 'appeal_denied']
  const issues = caseTypes[courtType]

  const results: CaseOutcome[] = []
  for (let i = 0; i < 8; i++) {
    const s = (seed + i * 17) % 100
    results.push({
      caseId: `CASE-${2020 + (i % 5)}-${String(s).padStart(4, '0')}`,
      caseType: issues[i % issues.length],
      judge: judgeName,
      outcome: outcomes[s % outcomes.length],
      date: `${2020 + (i % 5)}-${String((s % 12) + 1).padStart(2, '0')}-${String((s % 28) + 1).padStart(2, '0')}`,
      keyIssue: `Key legal issue addressed in case ${i + 1}`,
      precedentCited: [`Sample v. Citation ${(seed + i) % 3 + 1}`, `Statute ${(seed + i) % 5 + 1} U.S.C.`],
    })
  }
  return results
}

function computeStrengthsWeaknesses(metrics: WinRateMetric, courtType: CourtType): { strengths: string[]; weaknesses: string[] } {
  const strengths: string[] = []
  const weaknesses: string[] = []

  if (metrics.winRate >= 60) strengths.push('High win rate overall — favorable for petitioners')
  else if (metrics.winRate < 45) weaknesses.push('Below-average win rate — case preparation must be thorough')

  if (metrics.avgTimeToDisposition < 90) strengths.push('Fast disposition time — efficient case processing')
  else weaknesses.push('Extended docket — prepare for longer timeline')

  if (metrics.appealsRate > 0.20) weaknesses.push('High appeal rate — expect close scrutiny of evidence and procedure')
  else strengths.push('Low appeal rate — consistent application of standards')

  if (metrics.reversalRate > 0.06) weaknesses.push('Elevated reversal rate on appeals — consider strengthening appellate record')
  else strengths.push('Few reversals — stable jurisprudence')

  if (courtType === 'family') {
    strengths.push('Family court dockets typically favor mediation — consider settlement positioning')
    if (metrics.winRate > 55) strengths.push('Custody matters frequently resolved — parenting plans well-received')
  }
  if (courtType === 'immigration') {
    strengths.push('Immigration judges vary significantly — analyze individual judge tendencies')
    weaknesses.push('High government appeal rate in immigration — build robust record')
    if (metrics.winRate < 50) weaknesses.push('Low asylum grant rate — prepare detailed corroborating evidence')
  }
  if (courtType === 'bankruptcy') {
    strengths.push('Bankruptcy judges are specialized — expect technical compliance requirements')
    if (metrics.avgTimeToDisposition < 30) strengths.push('Quick trustee assignments — trustee relationships matter')
  }

  return { strengths, weaknesses }
}

function computeRecommendedStrategies(judgeName: string, metrics: WinRateMetric, courtType: CourtType): string[] {
  const strategies: string[] = []

  if (metrics.winRate >= 60) {
    strategies.push('Case appears strong — focus on clear presentation of key facts')
    strategies.push('Request early mediation to capitalize on favorable disposition')
  } else {
    strategies.push('Case requires thorough preparation — gather all corroborating evidence')
    strategies.push('Consider whether settlement achieves client goals before litigation risk')
  }

  if (courtType === 'family') {
    strategies.push('Submit pre-trial memo with proposed parenting plan — judges appreciate organized submissions')
    strategies.push('Prepare custody evidence per local rule — some courts require it in advance')
    strategies.push('Consider child specialist testimony if custody is disputed')
    strategies.push('Offer concessions on financial issues to gain custody advantage')
  }

  if (courtType === 'immigration') {
    strategies.push('File complete application package — incomplete filings trigger delays and negative inference')
    strategies.push('Prepare corroborating declaration from applicant in addition to testimony')
    strategies.push('Bring certified translations of all foreign language documents')
    strategies.push('Consider adjournment request only with strong justification — judges track it')
    strategies.push('Prepare asylum interview notes if applicable — corroboration is critical')
  }

  if (courtType === 'bankruptcy') {
    strategies.push('Ensure all schedules are complete and consistent — judges review carefully')
    strategies.push('Coordinate with trustee before hearing — informal resolution preferred')
    strategies.push('Prepare for cram-down analysis in Chapter 13 confirmation')
    strategies.push('Document good faith with pre-petition credit counseling certificate')
    strategies.push('Address any asset valuation disputes with appraisal evidence')
  }

  if (metrics.appealsRate > 0.20) {
    strategies.push('Build a perfect trial record — every objection must be preserved for appeal')
    strategies.push('Request written findings of fact and conclusions of law')
  }

  return strategies
}

function computeRiskScore(metrics: WinRateMetric, courtType: CourtType): number {
  // Risk score: 0-100 (higher = more risk to pursue litigation)
  let risk = 50

  // Win rate contribution
  if (metrics.winRate < 40) risk += 25
  else if (metrics.winRate < 50) risk += 15
  else if (metrics.winRate >= 65) risk -= 20

  // Appeal rate contribution
  if (metrics.appealsRate > 0.30) risk += 15
  else if (metrics.appealsRate < 0.10) risk -= 10

  // Disposition time (longer dockets = more risk)
  if (metrics.avgTimeToDisposition > 180) risk += 10

  // Court-specific adjustments
  if (courtType === 'immigration') risk += 5 // inherently higher risk due to government appeals
  if (courtType === 'bankruptcy') risk -= 10 // more predictable outcomes

  return Math.max(0, Math.min(100, risk))
}

export class JudgeWinRateAnalysisAgent {
  /**
   * Analyze a judge for a specific court type and generate strategic recommendations.
   */
  public analyzeJudge(judgeName: string, courtType: CourtType): JudgeAnalysisResult {
    const profile = JUDGE_DATABASE.find(j =>
      j.name.toLowerCase().includes(judgeName.toLowerCase()) && j.specialty === courtType
    )

    if (!profile) {
      // Exact judge not found for this court type — throw rather than silently returning wrong judge
      const existingJudges = JUDGE_DATABASE.filter(j => j.specialty === courtType).map(j => j.name)
      throw new Error(`Judge "${judgeName}" not found for court type "${courtType}". Available judges: ${existingJudges.join(', ')}`)
    }

    const metrics = generateWinRateMetrics(profile.name, courtType)
    const recentOutcomes = generateRecentOutcomes(profile.name, courtType)
    const { strengths, weaknesses } = computeStrengthsWeaknesses(metrics, courtType)
    const recommendedStrategies = computeRecommendedStrategies(profile.name, metrics, courtType)
    const riskScore = computeRiskScore(metrics, courtType)

    return {
      judge: profile,
      metrics,
      recentOutcomes,
      strengths,
      weaknesses,
      recommendedStrategies,
      riskScore,
    }
  }

  /**
   * Compare multiple judges within the same court type.
   */
  public compareJudges(judgeNames: string[], courtType: CourtType): JudgeAnalysisResult[] {
    return judgeNames.map(name => this.analyzeJudge(name, courtType))
  }

  /**
   * Find the best judge for a given case type in a jurisdiction.
   */
  public findBestJudge(courtType: CourtType, criteria: {
    minWinRate?: number
    maxDispositionDays?: number
    specialty?: string
  }): JudgeAnalysisResult[] {
    const candidates = JUDGE_DATABASE.filter(j => j.specialty === courtType)
    return candidates
      .map(j => this.analyzeJudge(j.name, courtType))
      .filter(r => {
        if (criteria.minWinRate && r.metrics.winRate < criteria.minWinRate) return false
        if (criteria.maxDispositionDays && r.metrics.avgTimeToDisposition > criteria.maxDispositionDays) return false
        return true
      })
      .sort((a, b) => b.metrics.winRate - a.metrics.winRate)
  }

  /**
   * Get all available judges for a court type.
   */
  public listJudges(courtType: CourtType): JudgeProfile[] {
    return JUDGE_DATABASE.filter(j => j.specialty === courtType)
  }
}

export const judgeWinRateAgent = new JudgeWinRateAnalysisAgent()