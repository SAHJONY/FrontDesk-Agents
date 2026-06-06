// Legal Document Generation System
// Supports Family Law, Bankruptcy, and IP/Trademark verticals

import { CourtType } from './types'
// Re-export so route.ts can import CourtType from here
export type { CourtType }

export type DocumentType =
  | 'family-intake-form'
  | 'custody-petition'
  | 'divorce-filing-checklist'
  | 'child-support-worksheet'
  | 'means-test-form'
  | 'chapter-7-petition-checklist'
  | 'chapter-13-petition-checklist'
  | 'asset-schedule-worksheet'
  | 'trademark-search-request'
  | 'trademark-application-checklist'
  | 'cease-and-desist-letter'

export interface DocumentField {
  id: string
  label: string
  type: 'text' | 'date' | 'currency' | 'number' | 'select' | 'checkbox' | 'textarea'
  required: boolean
  placeholder?: string
  helpText?: string
  options?: string[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
}

export interface DocumentSection {
  id: string
  title: string
  instruction?: string
  fields: DocumentField[]
}

export interface DocumentTemplate {
  type: DocumentType
  title: string
  description: string
  courtType: CourtType
  jurisdiction: string
  estimatedTime: string
  sections: DocumentSection[]
}

export interface GeneratedSection {
  sectionId: string
  title: string
  content: string
  fields: Array<{
    id: string
    label: string
    value: string | number | boolean
    filled: boolean
  }>
}

export interface GeneratedDocument {
  type: DocumentType
  title: string
  template: string
  generatedAt: string
  jurisdiction: string
  sections: GeneratedSection[]
  metadata: {
    fieldCount: number
    filledCount: number
    completionPercent: number
  }
}

// ─────────────────────────────────────────────────────────────
// TEMPLATE DEFINITIONS
// ─────────────────────────────────────────────────────────────

const FAMILY_INTAKE_FORM: DocumentTemplate = {
  type: 'family-intake-form',
  title: 'Family Law Intake Form',
  description: 'Comprehensive initial intake form for family law matters including domestic relations, custody, and support.',
  courtType: 'family',
  jurisdiction: 'State Family Court',
  estimatedTime: '25-30 min',
  sections: [
    {
      id: 'client-info',
      title: 'Client Information',
      fields: [
        { id: 'fullName', label: 'Full Legal Name', type: 'text', required: true, placeholder: 'Enter full legal name' },
        { id: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true },
        { id: 'address', label: 'Current Address', type: 'textarea', required: true },
        { id: 'phone', label: 'Phone Number', type: 'text', required: true, placeholder: '(555) 000-0000' },
        { id: 'email', label: 'Email Address', type: 'text', required: true, placeholder: 'email@example.com' },
        { id: 'occupation', label: 'Current Occupation', type: 'text', required: false },
        { id: 'employer', label: 'Employer Name', type: 'text', required: false },
        { id: 'annualIncome', label: 'Annual Income', type: 'currency', required: true, helpText: 'Include all sources: wages, tips, bonuses, investments' },
      ],
    },
    {
      id: 'spouse-info',
      title: 'Spouse/Partner Information',
      fields: [
        { id: 'spouseName', label: 'Spouse Full Name', type: 'text', required: true },
        { id: 'spouseDOB', label: 'Spouse Date of Birth', type: 'date', required: true },
        { id: 'spouseAddress', label: 'Spouse Current Address', type: 'textarea', required: true },
        { id: 'spousePhone', label: 'Spouse Phone', type: 'text', required: false },
        { id: 'spouseEmployer', label: 'Spouse Employer', type: 'text', required: false },
        { id: 'spouseAnnualIncome', label: 'Spouse Annual Income', type: 'currency', required: false },
      ],
    },
    {
      id: 'marriage-details',
      title: 'Marriage Details',
      fields: [
        { id: 'dateOfMarriage', label: 'Date of Marriage', type: 'date', required: true },
        { id: 'placeOfMarriage', label: 'Place of Marriage (City, State)', type: 'text', required: true },
        { id: 'marriageLength', label: 'Length of Marriage (Years)', type: 'number', required: true },
        { id: 'separatedDate', label: 'Date of Separation', type: 'date', required: false },
        { id: 'prenuptialAgreement', label: 'Prenuptial Agreement Exists?', type: 'select', required: true, options: ['Yes', 'No', 'Unsure'] },
        { id: 'prenuptialDetails', label: 'If Yes, provide details', type: 'textarea', required: false },
      ],
    },
    {
      id: 'children',
      title: 'Children',
      instruction: 'List all children from this marriage or relationship.',
      fields: [
        { id: 'numChildren', label: 'Number of Children', type: 'number', required: true },
        { id: 'childrenNames', label: 'Children Names & Ages', type: 'textarea', required: true, helpText: 'Format: Name - Age (one per line)' },
        { id: 'primaryCustodian', label: 'Current Primary Custodian', type: 'select', required: true, options: ['Client', 'Spouse', 'Joint', 'Other'] },
        { id: 'custodyArrangement', label: 'Current Custody Arrangement', type: 'textarea', required: true },
        { id: 'childrenSpecialNeeds', label: 'Any Child with Special Needs?', type: 'checkbox', required: false },
        { id: 'specialNeedsDetails', label: 'If yes, describe needs', type: 'textarea', required: false },
      ],
    },
    {
      id: 'assets',
      title: 'Marital Assets',
      instruction: 'Estimate value of major marital assets.',
      fields: [
        { id: 'realEstateOwned', label: 'Real Estate Owned (Current Value)', type: 'currency', required: true },
        { id: 'vehiclesValue', label: 'Vehicles (Blue Book Value)', type: 'currency', required: true },
        { id: 'bankAccountsTotal', label: 'Bank Accounts (Total)', type: 'currency', required: true },
        { id: 'retirementAccounts', label: 'Retirement Accounts (401k, IRA)', type: 'currency', required: true },
        { id: 'investmentAccounts', label: 'Investment/Brokerage Accounts', type: 'currency', required: true },
        { id: 'businessInterests', label: 'Business Interests or Professional Practices', type: 'currency', required: false },
        { id: 'otherAssets', label: 'Other Significant Assets', type: 'textarea', required: false },
        { id: 'totalAssetsEstimate', label: 'Estimated Total Marital Assets', type: 'currency', required: true },
      ],
    },
    {
      id: 'debts',
      title: 'Marital Debts',
      fields: [
        { id: 'mortgageBalance', label: 'Mortgage Balance', type: 'currency', required: true },
        { id: 'vehicleLoans', label: 'Auto Loans (Total)', type: 'currency', required: true },
        { id: 'studentLoans', label: 'Student Loans (Total)', type: 'currency', required: true },
        { id: 'creditCardDebt', label: 'Credit Card Debt (Total)', type: 'currency', required: true },
        { id: 'taxDebt', label: 'Tax Debt Owed', type: 'currency', required: false },
        { id: 'otherDebts', label: 'Other Debts', type: 'textarea', required: false },
        { id: 'totalDebtEstimate', label: 'Estimated Total Marital Debt', type: 'currency', required: true },
      ],
    },
    {
      id: 'case-type',
      title: 'Case Type & Goals',
      fields: [
        { id: 'caseType', label: 'Primary Case Type', type: 'select', required: true, options: ['Divorce', 'Legal Separation', 'Custody', 'Visitation', 'Child Support', 'Spousal Support', 'Asset Division', 'Domestic Violence', 'Other'] },
        { id: 'hasDomesticViolence', label: 'Domestic Violence Allegations?', type: 'checkbox', required: true },
        { id: 'dvDetails', label: 'If Yes, describe briefly (details in later filing)', type: 'textarea', required: false },
        { id: 'desiredOutcome', label: 'Brief Description of Desired Outcome', type: 'textarea', required: true, helpText: 'What are you hoping to achieve?' },
        { id: 'timeline', label: 'Desired Timeline', type: 'select', required: false, options: ['As soon as possible', '3-6 months', '6-12 months', 'No urgency'] },
      ],
    },
  ],
}

const CUSTODY_PETITION: DocumentTemplate = {
  type: 'custody-petition',
  title: 'Child Custody Petition',
  description: 'Petition for child custody including legal and physical custody arrangements.',
  courtType: 'family',
  jurisdiction: 'State Family Court',
  estimatedTime: '20-25 min',
  sections: [
    {
      id: 'caption',
      title: 'Case Caption',
      fields: [
        { id: 'petitionerName', label: 'Petitioner Name', type: 'text', required: true },
        { id: 'respondentName', label: 'Respondent Name', type: 'text', required: true },
        { id: 'caseNumber', label: 'Case Number (if existing)', type: 'text', required: false },
        { id: 'courtName', label: 'Court Name', type: 'text', required: true },
      ],
    },
    {
      id: 'children-detail',
      title: 'Children Detail',
      fields: [
        { id: 'child1Name', label: 'Child 1 Full Name', type: 'text', required: true },
        { id: 'child1DOB', label: 'Child 1 Date of Birth', type: 'date', required: true },
        { id: 'child1Relation', label: 'Child 1 Relationship to Petitioner', type: 'text', required: true },
        { id: 'child2Name', label: 'Child 2 Full Name', type: 'text', required: false },
        { id: 'child2DOB', label: 'Child 2 Date of Birth', type: 'date', required: false },
        { id: 'child2Relation', label: 'Child 2 Relationship to Petitioner', type: 'text', required: false },
        { id: 'otherChildren', label: 'Other Children (names & DOBs)', type: 'textarea', required: false },
      ],
    },
    {
      id: 'current-custody',
      title: 'Current Custody Situation',
      fields: [
        { id: 'currentCustodian', label: 'Who currently has physical custody?', type: 'select', required: true, options: ['Petitioner', 'Respondent', 'Joint', 'Third Party'] },
        { id: 'currentSchedule', label: 'Describe current visitation schedule', type: 'textarea', required: true },
        { id: 'custodyAgreementExists', label: 'Prior custody agreement exists?', type: 'select', required: true, options: ['Yes - Informal', 'Yes - Formal Court Order', 'No'] },
        { id: 'agreementDetails', label: 'If yes, describe the agreement', type: 'textarea', required: false },
      ],
    },
    {
      id: 'requested-custody',
      title: 'Requested Custody Arrangement',
      fields: [
        { id: 'legalCustody', label: 'Requested Legal Custody', type: 'select', required: true, options: ['Joint', 'Sole to Petitioner', 'Sole to Respondent'] },
        { id: 'physicalCustody', label: 'Requested Physical Custody', type: 'select', required: true, options: ['Joint (equal time)', 'Joint (primary with Petitioner)', 'Joint (primary with Respondent)', 'Sole to Petitioner', 'Sole to Respondent'] },
        { id: 'proposedSchedule', label: 'Proposed visitation schedule', type: 'textarea', required: true },
        { id: 'holidayArrangement', label: 'Holiday & vacation arrangement', type: 'textarea', required: true },
        { id: 'decisionMaking', label: 'Who makes major decisions (education, medical, religion)?', type: 'select', required: true, options: ['Joint', 'Petitioner only', 'Respondent only', 'Specify below'] },
        { id: 'decisionMakingDetails', label: 'Decision-making details if not joint', type: 'textarea', required: false },
      ],
    },
    {
      id: 'reasons',
      title: 'Reasons for Requested Custody',
      instruction: 'Provide factual basis for custody request.',
      fields: [
        { id: 'stabilityFactors', label: 'Child stability factors (home, school, community)', type: 'textarea', required: true },
        { id: 'parentChildRelationship', label: 'Current parent-child relationship quality', type: 'textarea', required: true },
        { id: 'coParentAbility', label: 'Your ability to co-parent', type: 'select', required: true, options: ['Excellent', 'Good', 'Fair', 'Poor'] },
        { id: 'concernsAboutOtherParent', label: 'Concerns about other parent (if any)', type: 'textarea', required: false, helpText: 'Be factual - use specific incidents when possible' },
        { id: 'childPreference', label: "Child's preference (if mature enough to express)", type: 'select', required: false, options: ['Yes - child expressed preference', 'Child too young', 'No preference expressed'] },
        { id: 'childPreferenceDetails', label: "Describe child's preference", type: 'textarea', required: false },
      ],
    },
    {
      id: 'best-interest',
      title: 'Best Interest Factors',
      instruction: 'Address each factor relevant to child best interest determination.',
      fields: [
        { id: 'bfStability', label: 'Stability of proposed home environment', type: 'textarea', required: true },
        { id: 'bfParentBond', label: 'Quality of bond with each parent', type: 'textarea', required: true },
        { id: 'bfAdjustment', label: "Child's adjustment to school, home, community", type: 'textarea', required: true },
        { id: 'bfHistory', label: "History of domestic violence or substance abuse (if any)", type: 'textarea', required: false },
        { id: 'bfRelocation', label: 'Relocation impact if custody changes', type: 'textarea', required: false },
        { id: 'bfOtherFactors', label: 'Any other best-interest factors', type: 'textarea', required: false },
      ],
    },
  ],
}

const DIVORCE_FILING_CHECKLIST: DocumentTemplate = {
  type: 'divorce-filing-checklist',
  title: 'Divorce Filing Checklist',
  description: 'Comprehensive checklist of required documents and steps for divorce filing.',
  courtType: 'family',
  jurisdiction: 'State Family Court',
  estimatedTime: '15-20 min',
  sections: [
    {
      id: 'required-docs',
      title: 'Required Court Documents',
      instruction: 'Items that must be filed with the court.',
      fields: [
        { id: 'petitionFiled', label: 'Petition for Dissolution of Marriage', type: 'checkbox', required: true },
        { id: 'summonsFiled', label: 'Summons (automatically issued with petition)', type: 'checkbox', required: true },
        { id: 'disclosureFiled', label: 'Preliminary Declaration of Disclosure', type: 'checkbox', required: true },
        { id: 'maritalSettlementAgreed', label: 'Marital Settlement Agreement (if settled)', type: 'checkbox', required: false },
        { id: 'childCustodyJs', label: 'Child Custody Jurisdiction Statement (if children)', type: 'checkbox', required: false },
        { id: 'propertyDeclarationJs', label: 'Property Declaration (Schedule of Assets & Debts)', type: 'checkbox', required: true },
      ],
    },
    {
      id: 'support-docs',
      title: 'Support-Related Documents',
      fields: [
        { id: 'incomeDeclaration', label: 'Income Declaration (Support worksheet)', type: 'checkbox', required: true },
        { id: 'childSupportWorksheet', label: 'Child Support Guidelines Worksheet', type: 'checkbox', required: false },
        { id: 'spousalSupportFactors', label: 'Spousal Support Factors Declaration', type: 'checkbox', required: false },
        { id: 'taxReturnsAttached', label: 'Copy of Most Recent Tax Returns', type: 'checkbox', required: true },
        { id: 'payStubsAttached', label: 'Recent Pay Stubs (last 3 months)', type: 'checkbox', required: true },
        { id: 'bankStatementsAttached', label: 'Bank Statements (last 3 months)', type: 'checkbox', required: true },
      ],
    },
    {
      id: 'additional-docs',
      title: 'Additional Supporting Documents',
      fields: [
        { id: 'marriageCertificate', label: 'Marriage Certificate', type: 'checkbox', required: true },
        { id: 'childrenBirthCertificates', label: "Children's Birth Certificates", type: 'checkbox', required: false },
        { id: 'deedAttached', label: 'Deed to Real Property', type: 'checkbox', required: false },
        { id: 'vehicleTitlesAttached', label: 'Vehicle Titles', type: 'checkbox', required: false },
        { id: 'retirementStatementsAttached', label: 'Retirement Account Statements', type: 'checkbox', required: false },
        { id: 'businessValuations', label: 'Business Valuations (if applicable)', type: 'checkbox', required: false },
        { id: 'legalDescriptions', label: 'Legal Descriptions of Property', type: 'checkbox', required: false },
      ],
    },
    {
      id: 'service-proof',
      title: 'Service of Process',
      instruction: 'Proof that the other party was served.',
      fields: [
        { id: 'respondentServed', label: 'Respondent has been served', type: 'checkbox', required: true },
        { id: 'serviceAffidavit', label: 'Affidavit of Service filed with court', type: 'checkbox', required: true },
        { id: 'respondentAcknowledged', label: 'Respondent Acknowledgment (if served informally)', type: 'checkbox', required: false },
      ],
    },
    {
      id: 'procedural-steps',
      title: 'Procedural Steps Completed',
      fields: [
        { id: 'filingFeePaid', label: 'Filing fee paid (or fee waiver granted)', type: 'checkbox', required: true },
        { id: 'caseCoordinatorAssigned', label: 'Family Court Case Coordinator assigned', type: 'checkbox', required: false },
        { id: 'mediationScheduled', label: 'Mediation scheduled/completed', type: 'checkbox', required: false },
        { id: 'financialDiscoveryDone', label: 'Financial Discovery completed', type: 'checkbox', required: true },
        { id: 'finalDisclosureDone', label: 'Final Declaration of Disclosure filed', type: 'checkbox', required: true },
      ],
    },
  ],
}

const CHILD_SUPPORT_WORKSHEET: DocumentTemplate = {
  type: 'child-support-worksheet',
  title: 'Child Support Guidelines Worksheet',
  description: 'Calculates child support based on parental incomes and time share.',
  courtType: 'family',
  jurisdiction: 'State Family Court',
  estimatedTime: '15-20 min',
  sections: [
    {
      id: 'income-info',
      title: 'Parental Income Information',
      instruction: 'Enter gross monthly income for each parent.',
      fields: [
        { id: 'parentAName', label: 'Parent A Name', type: 'text', required: true },
        { id: 'parentAGrossIncome', label: 'Parent A Gross Monthly Income', type: 'currency', required: true },
        { id: 'parentAIncomeType', label: 'Parent A Income Type', type: 'select', required: true, options: ['W-2 Employee', 'Self-Employed', 'Fixed Income', 'Variable Income', 'Not Employed'] },
        { id: 'parentBName', label: 'Parent B Name', type: 'text', required: true },
        { id: 'parentBGrossIncome', label: 'Parent B Gross Monthly Income', type: 'currency', required: true },
        { id: 'parentBIncomeType', label: 'Parent B Income Type', type: 'select', required: true, options: ['W-2 Employee', 'Self-Employed', 'Fixed Income', 'Variable Income', 'Not Employed'] },
        { id: 'combinedIncome', label: 'Combined Monthly Income (auto)', type: 'currency', required: false, helpText: 'Auto-calculated from above' },
      ],
    },
    {
      id: 'timeshare',
      title: 'Parenting Time / Time Share',
      fields: [
        { id: 'parentAPctTime', label: 'Parent A % of Parenting Time', type: 'number', required: true, validation: { min: 0, max: 100 }, helpText: 'Percentage of overnights per year' },
        { id: 'parentBPctTime', label: 'Parent B % of Parenting Time', type: 'number', required: true, validation: { min: 0, max: 100 } },
        { id: 'overnightsPerYear', label: 'Total Overnights per Year (auto)', type: 'number', required: false },
        { id: 'timeshareAdjustment', label: 'Timeshare Deviation Applied?', type: 'select', required: false, options: ['None', 'Upward Adjustment', 'Downward Adjustment'] },
      ],
    },
    {
      id: 'support-calculation',
      title: 'Support Calculation',
      fields: [
        { id: 'guidelineAmount', label: 'Guideline Child Support Amount', type: 'currency', required: false },
        { id: 'addOnCosts', label: 'Add-on Child Costs (childcare, health insurance, uninsured medical)', type: 'currency', required: false },
        { id: 'totalSupport', label: 'Total Child Support Obligation', type: 'currency', required: false },
        { id: 'parentAContribution', label: 'Parent A Share (%)', type: 'number', required: false },
        { id: 'parentBContribution', label: 'Parent B Share (%)', type: 'number', required: false },
        { id: 'parentAPays', label: 'Parent A Monthly Payment', type: 'currency', required: false },
        { id: 'parentBPays', label: 'Parent B Monthly Payment', type: 'currency', required: false },
      ],
    },
    {
      id: 'deviation-factors',
      title: 'Deviation Factors',
      instruction: 'Document any factors warranting deviation from guideline support.',
      fields: [
        { id: 'hardshipClaimed', label: 'Hardship Claimed?', type: 'checkbox', required: false },
        { id: 'hardshipDetails', label: 'Describe hardship', type: 'textarea', required: false },
        { id: 'specialNeedsClaimed', label: 'Child Special Needs?', type: 'checkbox', required: false },
        { id: 'specialNeedsDetails', label: 'Describe special needs', type: 'textarea', required: false },
        { id: 'extraordinaryExpenses', label: 'Extraordinary Expenses (travel, extracurriculars)', type: 'checkbox', required: false },
        { id: 'extraordinaryDetails', label: 'Describe extraordinary expenses', type: 'textarea', required: false },
        { id: 'otherDeviations', label: 'Other Deviation Factors', type: 'textarea', required: false },
      ],
    },
  ],
}

const MEANS_TEST_FORM: DocumentTemplate = {
  type: 'means-test-form',
  title: 'Bankruptcy Means Test Form',
  description: 'Official means test form (Form 122A-1) for Chapter 7 bankruptcy eligibility determination.',
  courtType: 'bankruptcy',
  jurisdiction: 'US Bankruptcy Court',
  estimatedTime: '30-35 min',
  sections: [
    {
      id: 'debtor-info',
      title: 'Debtor Information',
      fields: [
        { id: 'fullName', label: 'Full Legal Name', type: 'text', required: true },
        { id: 'ssn', label: 'Social Security Number', type: 'text', required: true, placeholder: 'XXX-XX-XXXX' },
        { id: 'address', label: 'Current Address', type: 'textarea', required: true },
        { id: 'caseNumber', label: 'Case Number (if existing)', type: 'text', required: false },
        { id: 'filingDate', label: 'Date of Filing / Anticipated Filing', type: 'date', required: true },
      ],
    },
    {
      id: 'income-section',
      title: 'Current Monthly Income',
      instruction: 'List ALL income sources for the past 6 calendar months.',
      fields: [
        { id: 'grossWages', label: 'Gross Wages, Salary, Tips', type: 'currency', required: true },
        { id: 'businessIncome', label: 'Business Income (Self-Employment)', type: 'currency', required: false },
        { id: 'rentalIncome', label: 'Rental Income', type: 'currency', required: false },
        { id: 'interestDividendIncome', label: 'Interest & Dividend Income', type: 'currency', required: false },
        { id: 'pensionRetirementIncome', label: 'Pension / Retirement Income', type: 'currency', required: false },
        { id: 'socialSecurityIncome', label: 'Social Security Income', type: 'currency', required: false },
        { id: 'otherIncome', label: 'Other Income (specify in notes)', type: 'currency', required: false },
        { id: 'totalMonthlyIncome', label: 'Total Monthly Income', type: 'currency', required: true },
        { id: 'sixMonthTotal', label: '6-Month Average Income', type: 'currency', required: false },
        { id: 'stateMedianIncome', label: 'State Median Income (check current table)', type: 'currency', required: true },
        { id: 'belowMedian', label: 'Income Below State Median?', type: 'checkbox', required: true },
      ],
    },
    {
      id: 'deductions',
      title: 'Allowed Deductions from Income',
      instruction: 'Standard deductions per IRS expense standards.',
      fields: [
        { id: 'housingDeduction', label: 'Housing & Utilities (IRS standard)', type: 'currency', required: true },
        { id: 'healthInsuranceDeduction', label: 'Health Insurance & Healthcare', type: 'currency', required: true },
        { id: 'vehicleOperationDeduction', label: 'Vehicle Operation / Transportation', type: 'currency', required: true },
        { id: 'courtOrderedPayments', label: 'Court-Ordered Payments (support, alimony)', type: 'currency', required: false },
        { id: 'educationExpenses', label: 'Education Expenses (for dependent children)', type: 'currency', required: false },
        { id: 'childcareExpenses', label: 'Child / Elder Care Expenses', type: 'currency', required: false },
        { id: 'otherDeductions', label: 'Other Authorized Deductions', type: 'currency', required: false },
        { id: 'totalDeductions', label: 'Total Deductions', type: 'currency', required: true },
      ],
    },
    {
      id: 'means-test-calculation',
      title: 'Means Test Calculation',
      fields: [
        { id: 'monthlyIncome', label: 'Monthly Income (from above)', type: 'currency', required: true },
        { id: 'deductAmount', label: 'Minus Total Deductions', type: 'currency', required: true },
        { id: 'disposableIncome', label: 'Monthly Disposable Income', type: 'currency', required: true },
        { id: 'sixtyMonthProjection', label: '60-Month Projection ( x 60)', type: 'currency', required: true },
        { id: 'presumptionExists', label: 'Presumption of Abuse Exists?', type: 'checkbox', required: true },
        { id: 'rebuttalEvidence', label: 'Rebuttal Evidence Available?', type: 'checkbox', required: false },
        { id: 'rebuttalExplanation', label: 'Explain rebutting factors', type: 'textarea', required: false },
      ],
    },
    {
      id: 'special-circumstances',
      title: 'Special Circumstances',
      instruction: 'If income exceeds median, explain special circumstances.',
      fields: [
        { id: 'medicalCondition', label: 'Serious Medical Condition Affects Income?', type: 'checkbox', required: false },
        { id: 'militaryService', label: 'Recent Military Service Affects Income?', type: 'checkbox', required: false },
        { id: 'businessFailure', label: 'Business Failure as Income Cause?', type: 'checkbox', required: false },
        { id: 'childSupportObligation', label: 'Child Support Obligations?', type: 'checkbox', required: false },
        { id: 'recentJobLoss', label: 'Recent Job Loss / Reduction?', type: 'checkbox', required: false },
        { id: 'specialCircumstancesDetail', label: 'Describe special circumstances in detail', type: 'textarea', required: false },
      ],
    },
  ],
}

const CHAPTER7_PETITION_CHECKLIST: DocumentTemplate = {
  type: 'chapter-7-petition-checklist',
  title: 'Chapter 7 Bankruptcy Petition Checklist',
  description: 'Complete list of schedules, statements, and documents required for Chapter 7 filing.',
  courtType: 'bankruptcy',
  jurisdiction: 'US Bankruptcy Court',
  estimatedTime: '20-25 min',
  sections: [
    {
      id: 'voluntary-petition',
      title: 'Voluntary Petition',
      fields: [
        { id: 'voluntaryPetition', label: 'Voluntary Petition (Official Form 101)', type: 'checkbox', required: true },
        { id: 'listOfCreditors', label: 'Schedule of Creditors (List of all creditors)', type: 'checkbox', required: true },
      ],
    },
    {
      id: 'schedules',
      title: 'Required Schedules',
      fields: [
        { id: 'scheduleAB', label: 'Schedule A/B - Property (all assets)', type: 'checkbox', required: true },
        { id: 'scheduleC', label: 'Schedule C - Exempt Property', type: 'checkbox', required: true },
        { id: 'scheduleD', label: 'Schedule D - Secured Claims', type: 'checkbox', required: true },
        { id: 'scheduleEF', label: 'Schedule E/F - Unsecured Claims', type: 'checkbox', required: true },
        { id: 'scheduleG', label: 'Schedule G - Executory Contracts', type: 'checkbox', required: true },
        { id: 'scheduleH', label: 'Schedule H - Co-Debtor Obligations', type: 'checkbox', required: true },
        { id: 'scheduleI', label: 'Schedule I - Income', type: 'checkbox', required: true },
        { id: 'scheduleJ', label: 'Schedule J - Expenditures', type: 'checkbox', required: true },
        { id: 'scheduleJ2', label: 'Schedule J-2 - Costs of Sale / Lease Property', type: 'checkbox', required: false },
      ],
    },
    {
      id: 'statements',
      title: 'Statements & Disclosures',
      fields: [
        { id: 'statementOfFinancialAffairs', label: 'Statement of Financial Affairs (Form 107)', type: 'checkbox', required: true },
        { id: 'statementOfIntent', label: 'Statement of Intent (creditor redemption)', type: 'checkbox', required: true },
        { id: 'meansTestForm', label: 'Means Test Form (122A-1 or 122C-1)', type: 'checkbox', required: true },
        { id: 'balanceSheet', label: 'Balance Sheet (if self-employed)', type: 'checkbox', required: false },
        { id: 'statementOfOperations', label: 'Statement of Operations (if self-employed)', type: 'checkbox', required: false },
        { id: 'statementOfCurrentMonthlyIncome', label: 'Statement of Current Monthly Income (Form 122B)', type: 'checkbox', required: true },
      ],
    },
    {
      id: 'other-docs',
      title: 'Other Required Documents',
      fields: [
        { id: 'creditCounselingCert', label: 'Credit Counseling Certificate', type: 'checkbox', required: true },
        { id: 'payStubsLast6Months', label: 'Pay Stubs (last 6 months)', type: 'checkbox', required: true },
        { id: 'taxReturnsLast2Years', label: 'Tax Returns (last 2 years)', type: 'checkbox', required: true },
        { id: 'bankStatementsLast6Months', label: 'Bank Statements (last 6 months)', type: 'checkbox', required: true },
        { id: 'vehicleTitles', label: 'Vehicle Titles', type: 'checkbox', required: false },
        { id: 'deedToRealProperty', label: 'Deed to Real Property', type: 'checkbox', required: false },
        { id: 'retirementStatements', label: 'Retirement Account Statements', type: 'checkbox', required: false },
        { id: 'lifeInsurancePolicies', label: 'Life Insurance Policies (cash value)', type: 'checkbox', required: false },
        { id: 'recentAppraisals', label: 'Recent Appraisals of Valuable Property', type: 'checkbox', required: false },
      ],
    },
    {
      id: 'exemption-schedules',
      title: 'Exemption Planning',
      fields: [
        { id: 'federalExemptionsUsed', label: 'Federal Exemptions Selected', type: 'checkbox', required: true },
        { id: 'stateExemptionsUsed', label: 'State Exemptions Selected (if applicable)', type: 'checkbox', required: false },
        { id: 'homesteadExemption', label: 'Homestead Exemption Claimed', type: 'checkbox', required: false },
        { id: 'retirementExemptions', label: 'Retirement Account Exemptions Claimed', type: 'checkbox', required: true },
        { id: 'vehicleExemption', label: 'Vehicle Exemption Claimed (wildcard / other)', type: 'checkbox', required: true },
      ],
    },
  ],
}

const CHAPTER13_PETITION_CHECKLIST: DocumentTemplate = {
  type: 'chapter-13-petition-checklist',
  title: 'Chapter 13 Bankruptcy Petition Checklist',
  description: 'Complete list of documents required for Chapter 13 repayment plan bankruptcy.',
  courtType: 'bankruptcy',
  jurisdiction: 'US Bankruptcy Court',
  estimatedTime: '20-25 min',
  sections: [
    {
      id: 'petition-docs',
      title: 'Core Petition Documents',
      fields: [
        { id: 'voluntaryPetition', label: 'Voluntary Petition', type: 'checkbox', required: true },
        { id: 'listOfCreditors', label: 'Schedule of Creditors', type: 'checkbox', required: true },
        { id: 'chapter13Plan', label: 'Chapter 13 Plan', type: 'checkbox', required: true },
        { id: 'planAnalysisWorksheet', label: 'Plan Analysis / Feasibility Worksheet', type: 'checkbox', required: true },
      ],
    },
    {
      id: 'all-schedules',
      title: 'All Schedules (A/B through J)',
      fields: [
        { id: 'scheduleAB', label: 'Schedule A/B - Property', type: 'checkbox', required: true },
        { id: 'scheduleC', label: 'Schedule C - Exemptions', type: 'checkbox', required: true },
        { id: 'scheduleD', label: 'Schedule D - Secured Claims', type: 'checkbox', required: true },
        { id: 'scheduleEF', label: 'Schedule E/F - Unsecured Claims', type: 'checkbox', required: true },
        { id: 'scheduleG', label: 'Schedule G - Executory Contracts', type: 'checkbox', required: true },
        { id: 'scheduleH', label: 'Schedule H - Co-Debtors', type: 'checkbox', required: true },
        { id: 'scheduleI', label: 'Schedule I - Income', type: 'checkbox', required: true },
        { id: 'scheduleJ', label: 'Schedule J - Expenses', type: 'checkbox', required: true },
        { id: 'scheduleAB2', label: 'Schedule A/B-2 (Real Property)', type: 'checkbox', required: true },
        { id: 'scheduleC2', label: 'Schedule C-2 (Exemptions)', type: 'checkbox', required: true },
        { id: 'summaryOfSchedules', label: 'Summary of Schedules (Form 106Sum)', type: 'checkbox', required: true },
      ],
    },
    {
      id: 'statements',
      title: 'Statements & Means Test',
      fields: [
        { id: 'sofA', label: 'Statement of Financial Affairs', type: 'checkbox', required: true },
        { id: 'statementOfIntent', label: 'Statement of Intent (secured property)', type: 'checkbox', required: true },
        { id: 'meansTestForm', label: 'Means Test Form (122C-1)', type: 'checkbox', required: true },
        { id: 'currentMonthlyIncome', label: 'Statement of Current Monthly Income (Form 122C)', type: 'checkbox', required: true },
        { id: 'balanceSheet', label: 'Balance Sheet (if self-employed)', type: 'checkbox', required: false },
      ],
    },
    {
      id: 'plan-specific',
      title: 'Chapter 13 Plan Details',
      fields: [
        { id: 'monthlyNetIncome', label: 'Monthly Net Income (from Schedule I/J)', type: 'currency', required: true },
        { id: 'monthlyExpenses', label: 'Monthly Expenses (from Schedule J)', type: 'currency', required: true },
        { id: 'monthlyPlanPayment', label: 'Proposed Monthly Plan Payment', type: 'currency', required: true },
        { id: 'planDuration', label: 'Plan Duration (36 or 60 months)', type: 'select', required: true, options: ['36 months', '60 months'] },
        { id: 'priorityClaimsTotal', label: 'Priority Claims Total (tax, support, admin)', type: 'currency', required: true },
        { id: 'securedClaimsTotal', label: 'Secured Claims Total (arrearage + ongoing)', type: 'currency', required: true },
        { id: 'generalUnsecuredPercent', label: 'Proposed % to General Unsecured Creditors', type: 'number', required: true },
        { id: 'bestInterestTest', label: 'Best Interest Test satisfied?', type: 'checkbox', required: true },
      ],
    },
    {
      id: 'other-docs',
      title: 'Supporting Documents',
      fields: [
        { id: 'creditCounselingCert', label: 'Credit Counseling Certificate', type: 'checkbox', required: true },
        { id: 'payStubsLast6Months', label: 'Pay Stubs (last 6 months)', type: 'checkbox', required: true },
        { id: 'taxReturnsLast2Years', label: 'Tax Returns (last 2 years)', type: 'checkbox', required: true },
        { id: 'taxReturnStubsLast4Quarters', label: 'Tax Return Stubs (last 4 quarters)', type: 'checkbox', required: true },
        { id: 'bankStatementsLast6Months', label: 'Bank Statements (last 6 months)', type: 'checkbox', required: true },
        { id: 'vehicleValueDocumentation', label: 'Vehicle Value Documentation (KBB / appraisal)', type: 'checkbox', required: false },
        { id: 'realEstateAppraisal', label: 'Real Estate Appraisal (if applicable)', type: 'checkbox', required: false },
      ],
    },
  ],
}

const ASSET_SCHEDULE_WORKSHEET: DocumentTemplate = {
  type: 'asset-schedule-worksheet',
  title: 'Asset Schedule / Statement of Financial Affairs',
  description: 'Comprehensive worksheet for documenting all assets for bankruptcy filing.',
  courtType: 'bankruptcy',
  jurisdiction: 'US Bankruptcy Court',
  estimatedTime: '25-30 min',
  sections: [
    {
      id: 'real-property',
      title: 'Real Property',
      instruction: 'List all real property owned or partially owned.',
      fields: [
        { id: 'primaryResidence', label: 'Primary Residence Address', type: 'text', required: true },
        { id: 'primaryResidenceValue', label: 'Estimated Current Value', type: 'currency', required: true },
        { id: 'primaryResidenceMortgage', label: 'Mortgage / Lien Balance', type: 'currency', required: true },
        { id: 'primaryResidenceEquity', label: 'Estimated Equity', type: 'currency', required: false },
        { id: 'rentalProperty', label: 'Rental / Investment Property', type: 'text', required: false },
        { id: 'rentalPropertyValue', label: 'Estimated Current Value', type: 'currency', required: false },
        { id: 'rentalPropertyMortgage', label: 'Mortgage Balance', type: 'currency', required: false },
        { id: 'otherRealProperty', label: 'Other Real Property', type: 'text', required: false },
        { id: 'otherRealPropertyValue', label: 'Value', type: 'currency', required: false },
        { id: 'otherRealPropertyMortgage', label: 'Mortgage Balance', type: 'currency', required: false },
      ],
    },
    {
      id: 'vehicles',
      title: 'Vehicles',
      fields: [
        { id: 'vehicle1Make', label: 'Vehicle 1: Year / Make / Model', type: 'text', required: true },
        { id: 'vehicle1Value', label: 'Vehicle 1: Current Value', type: 'currency', required: true },
        { id: 'vehicle1LoanBalance', label: 'Vehicle 1: Loan Balance', type: 'currency', required: true },
        { id: 'vehicle1Equity', label: 'Vehicle 1: Equity', type: 'currency', required: false },
        { id: 'vehicle2Make', label: 'Vehicle 2: Year / Make / Model', type: 'text', required: false },
        { id: 'vehicle2Value', label: 'Vehicle 2: Current Value', type: 'currency', required: false },
        { id: 'vehicle2LoanBalance', label: 'Vehicle 2: Loan Balance', type: 'currency', required: false },
        { id: 'vehicle2Equity', label: 'Vehicle 2: Equity', type: 'currency', required: false },
        { id: 'otherVehicles', label: 'Other Vehicles (boats, motorcycles, etc.)', type: 'textarea', required: false },
      ],
    },
    {
      id: 'financial-accounts',
      title: 'Financial Accounts',
      fields: [
        { id: 'checkingAccounts', label: 'Checking Account(s) - Total Balance', type: 'currency', required: true },
        { id: 'savingsAccounts', label: 'Savings Account(s) - Total Balance', type: 'currency', required: true },
        { id: 'moneyMarketAccounts', label: 'Money Market Accounts', type: 'currency', required: false },
        { id: 'cdAccounts', label: 'Certificate of Deposit (CD) Accounts', type: 'currency', required: false },
        { id: 'investmentAccounts', label: 'Brokerage / Investment Accounts', type: 'currency', required: false },
        { id: 'retirement401k', label: '401(k) / Retirement Accounts', type: 'currency', required: false },
        { id: 'iraAccounts', label: 'IRA / Roth IRA Accounts', type: 'currency', required: false },
        { id: 'pensionAccounts', label: 'Pension Accounts', type: 'currency', required: false },
        { id: 'otherFinancial', label: 'Other Financial Assets', type: 'textarea', required: false },
      ],
    },
    {
      id: 'personal-property',
      title: 'Personal Property',
      instruction: 'Describe valuable personal property items.',
      fields: [
        { id: 'jewelry', label: 'Jewelry (description & estimated value)', type: 'textarea', required: true },
        { id: 'artCollectibles', label: 'Art, Collectibles, Antiques', type: 'textarea', required: false },
        { id: 'furniture', label: 'Furniture (if valuable)', type: 'textarea', required: false },
        { id: 'electronics', label: 'Electronics (TV, computer, etc.)', type: 'textarea', required: false },
        { id: 'toolsEquipment', label: 'Tools / Equipment', type: 'textarea', required: false },
        { id: 'sportsEquipment', label: 'Sports / Hobby Equipment', type: 'textarea', required: false },
        { id: 'firearms', label: 'Firearms / Weapons', type: 'textarea', required: false },
        { id: 'otherPersonal', label: 'Other Personal Property', type: 'textarea', required: false },
      ],
    },
    {
      id: 'business-assets',
      title: 'Business Interests',
      fields: [
        { id: 'businessName', label: 'Business Name (if applicable)', type: 'text', required: false },
        { id: 'businessType', label: 'Business Type', type: 'text', required: false },
        { id: 'businessOwnershipPercent', label: 'Ownership Percentage', type: 'number', required: false },
        { id: 'businessValue', label: 'Estimated Business Value', type: 'currency', required: false },
        { id: 'businessDebts', label: 'Business Debts Owed', type: 'currency', required: false },
      ],
    },
    {
      id: 'other-assets',
      title: 'Other Assets',
      fields: [
        { id: 'lifeInsuranceCashValue', label: 'Life Insurance (cash surrender value)', type: 'currency', required: false },
        { id: 'pendingLawsuits', label: 'Pending Lawsuits / Claims', type: 'textarea', required: false },
        { id: 'taxRefundsOwed', label: 'Tax Refunds Owed', type: 'currency', required: false },
        { id: 'alimonyDue', label: 'Alimony / Support Due', type: 'currency', required: false },
        { id: 'accountsReceivable', label: 'Accounts Receivable', type: 'currency', required: false },
        { id: 'otherAssetDescription', label: 'Other Assets Description', type: 'textarea', required: false },
        { id: 'totalAssetsValue', label: 'TOTAL ASSETS VALUE', type: 'currency', required: true },
      ],
    },
  ],
}

const TRADEMARK_SEARCH_REQUEST: DocumentTemplate = {
  type: 'trademark-search-request',
  title: 'Trademark Search Request',
  description: 'Request form for comprehensive trademark availability search across USPTO and common law databases.',
  courtType: 'ip',
  jurisdiction: 'USPTO',
  estimatedTime: '10-15 min',
  sections: [
    {
      id: 'mark-info',
      title: 'Trademark / Service Mark Information',
      fields: [
        { id: 'markName', label: 'Mark Name / Logo', type: 'text', required: true, helpText: 'Enter the wordmark or describe the logo' },
        { id: 'markType', label: 'Mark Type', type: 'select', required: true, options: ['Word Mark (text only)', 'Design Mark (logo/symbol)', 'Combined Mark (word + design)', 'Sound Mark', '3D Mark / Trade Dress'] },
        { id: 'descriptionOfMark', label: 'Description of Mark', type: 'textarea', required: true, helpText: 'Describe colors, design elements, font if applicable' },
        { id: 'attachedDrawing', label: 'Drawing / Specimen Attached?', type: 'checkbox', required: false },
      ],
    },
    {
      id: 'goods-services',
      title: 'Goods / Services Classification',
      instruction: 'Identify the classes (Nice Classification) for your goods or services.',
      fields: [
        { id: 'classDescription1', label: 'International Class 1 (Chemicals)', type: 'textarea', required: false },
        { id: 'classDescription2', label: 'International Class 2 (Paints)', type: 'textarea', required: false },
        { id: 'classDescription3', label: 'International Class 3 (Cosmetics)', type: 'textarea', required: false },
        { id: 'classDescription4', label: 'International Class 4 (Lubricants)', type: 'textarea', required: false },
        { id: 'classDescription5', label: 'International Class 5 (Pharmaceuticals)', type: 'textarea', required: false },
        { id: 'classDescription6', label: 'International Class 6 (Metal Goods)', type: 'textarea', required: false },
        { id: 'classDescription7', label: 'International Class 7 (Machinery)', type: 'textarea', required: false },
        { id: 'classDescription8', label: 'International Class 8 (Hand Tools)', type: 'textarea', required: false },
        { id: 'classDescription9', label: 'International Class 9 (Electronics / Software)', type: 'textarea', required: false },
        { id: 'classDescription10', label: 'International Class 10 (Medical Devices)', type: 'textarea', required: false },
        { id: 'classDescription11', label: 'International Class 11 (Lighting)', type: 'textarea', required: false },
        { id: 'classDescription12', label: 'International Class 12 (Vehicles)', type: 'textarea', required: false },
        { id: 'classDescription35', label: 'International Class 35 (Advertising / Business)', type: 'textarea', required: false },
        { id: 'classDescription36', label: 'International Class 36 (Financial)', type: 'textarea', required: false },
        { id: 'classDescription37', label: 'International Class 37 (Construction)', type: 'textarea', required: false },
        { id: 'classDescription38', label: 'International Class 38 (Telecommunications)', type: 'textarea', required: false },
        { id: 'classDescription41', label: 'International Class 41 (Education / Entertainment)', type: 'textarea', required: false },
        { id: 'classDescription42', label: 'International Class 42 (Technology / Science)', type: 'textarea', required: false },
        { id: 'classDescription43', label: 'International Class 43 (Restaurants / Hotels)', type: 'textarea', required: false },
        { id: 'classDescription44', label: 'International Class 44 (Medical / Agriculture)', type: 'textarea', required: false },
        { id: 'classDescription45', label: 'International Class 45 (Legal / Personal)', type: 'textarea', required: false },
        { id: 'goodsServicesDescription', label: 'Full Goods / Services Description', type: 'textarea', required: true },
      ],
    },
    {
      id: 'search-scope',
      title: 'Search Scope',
      fields: [
        { id: 'searchTess', label: 'Search USPTO TESS Database', type: 'checkbox', required: true },
        { id: 'searchStateTrademarks', label: 'Search State Trademark Registries', type: 'checkbox', required: false },
        { id: 'searchCommonLaw', label: 'Search Common Law (internet / social media)', type: 'checkbox', required: true },
        { id: 'searchDomainNames', label: 'Search Domain Names (.com, .net, .org)', type: 'checkbox', required: false },
        { id: 'searchSimilarMarks', label: 'Search Phonetically Similar Marks', type: 'checkbox', required: true },
        { id: 'searchForeignMarks', label: 'Search Madrid Protocol / Foreign Marks', type: 'checkbox', required: false },
      ],
    },
    {
      id: 'applicant-info',
      title: 'Applicant Information',
      fields: [
        { id: 'applicantName', label: 'Applicant / Company Name', type: 'text', required: true },
        { id: 'applicantAddress', label: 'Street Address', type: 'text', required: true },
        { id: 'applicantCity', label: 'City', type: 'text', required: true },
        { id: 'applicantState', label: 'State', type: 'text', required: true },
        { id: 'applicantZip', label: 'ZIP Code', type: 'text', required: true },
        { id: 'applicantCountry', label: 'Country', type: 'text', required: true },
        { id: 'contactName', label: 'Contact Person', type: 'text', required: true },
        { id: 'contactEmail', label: 'Contact Email', type: 'text', required: true },
        { id: 'contactPhone', label: 'Contact Phone', type: 'text', required: false },
      ],
    },
    {
      id: 'search-type',
      title: 'Search Intensity',
      fields: [
        { id: 'searchLevel', label: 'Search Level', type: 'select', required: true, options: ['Basic (exact + phonetic)', 'Comprehensive (exact + phonetic + meaning)', 'Full (comprehensive + design code search)', 'Premier (full + common law + domain)'] },
        { id: 'rushedSearch', label: 'Rushed Search (24-48 hour turnaround)', type: 'checkbox', required: false },
        { id: 'searchPurpose', label: 'Purpose of Search', type: 'select', required: true, options: ['Pre-filing clearance', 'Litigation / infringement', 'Licensing / assignment', 'Trademark renewal', 'Monitoring / watch'] },
      ],
    },
  ],
}

const TRADEMARK_APPLICATION_CHECKLIST: DocumentTemplate = {
  type: 'trademark-application-checklist',
  title: 'Trademark Application Filing Checklist',
  description: 'Comprehensive checklist for filing a USPTO trademark application (TEAS).',
  courtType: 'ip',
  jurisdiction: 'USPTO',
  estimatedTime: '20-25 min',
  sections: [
    {
      id: 'pre-filing',
      title: 'Pre-Filing Requirements',
      fields: [
        { id: 'searchCompleted', label: 'Trademark search completed', type: 'checkbox', required: true },
        { id: 'searchClearance', label: 'Search results reviewed - no conflicting marks found', type: 'checkbox', required: true },
        { id: 'specimenReady', label: 'Specimen of use prepared (if applying based on use)', type: 'checkbox', required: false },
        { id: 'drawingPageReady', label: 'Drawing page / stylized mark image ready', type: 'checkbox', required: false },
        { id: 'idManualReview', label: 'Goods/services descriptions reviewed in ID Manual', type: 'checkbox', required: true },
      ],
    },
    {
      id: 'application-type',
      title: 'Application Type Selection',
      fields: [
        { id: 'teasPlus', label: 'TEAS+ (lower fee, requires specific description format)', type: 'checkbox', required: false },
        { id: 'teasStandard', label: 'TEAS Standard', type: 'checkbox', required: false },
        { id: 'teasReal', label: 'TEAS Real (use-based application)', type: 'checkbox', required: false },
        { id: 'teasIntent', label: 'TEAS Intent-to-Use (ITU - no specimen required yet)', type: 'checkbox', required: false },
        { id: 'foreignPriority', label: 'Foreign application priority claimed', type: 'checkbox', required: false },
        { id: 'foreignApplicationDate', label: 'Foreign application filing date', type: 'date', required: false },
      ],
    },
    {
      id: 'mark-details',
      title: 'Mark Details',
      fields: [
        { id: 'markText', label: 'Mark Text (exact wording)', type: 'text', required: true },
        { id: 'markType', label: 'Mark Type', type: 'select', required: true, options: ['Standard Character', 'Special Form (stylized/design)'] },
        { id: 'colorClaim', label: 'Color Claim (if any)', type: 'text', required: false },
        { id: 'descriptionOfMark', label: 'Description of Mark', type: 'textarea', required: false },
        { id: 'translationNeeded', label: 'Translation of foreign wording needed?', type: 'checkbox', required: false },
        { id: 'transliterationNeeded', label: 'Transliteration needed?', type: 'checkbox', required: false },
      ],
    },
    {
      id: 'goods-services',
      title: 'Goods / Services',
      fields: [
        { id: 'classIdentification', label: 'International Class Identification(s)', type: 'textarea', required: true },
        { id: 'goodsServicesDescription', label: 'Goods/Services Description (per class)', type: 'textarea', required: true },
        { id: 'basisForFiling', label: 'Basis for Filing', type: 'select', required: true, options: ['Section 1(a) - Use in commerce', 'Section 1(b) - Intent to use', 'Section 44(e) - Foreign registration', 'Section 44(d) - Foreign application'] },
        { id: 'dateOfFirstUse', label: 'Date of First Use (if known)', type: 'date', required: false },
        { id: 'dateOfFirstUseCommerce', label: 'Date of First Use in Commerce', type: 'date', required: false },
      ],
    },
    {
      id: 'owner-info',
      title: 'Owner / Applicant Information',
      fields: [
        { id: 'ownerName', label: 'Owner Name (individual or entity)', type: 'text', required: true },
        { id: 'ownerType', label: 'Owner Type', type: 'select', required: true, options: ['Individual', 'Corporation / LLC', 'Partnership', 'Joint Venture', 'Non-profit', 'Other'] },
        { id: 'ownerAddress', label: 'Street Address', type: 'text', required: true },
        { id: 'ownerCity', label: 'City', type: 'text', required: true },
        { id: 'ownerState', label: 'State / Province', type: 'text', required: true },
        { id: 'ownerZip', label: 'Postal Code', type: 'text', required: true },
        { id: 'ownerCountry', label: 'Country', type: 'text', required: true },
        { id: 'citizenship', label: 'Citizenship / State of Incorporation', type: 'text', required: false },
      ],
    },
    {
      id: 'correspondence',
      title: 'Correspondence Information',
      fields: [
        { id: 'attorneyName', label: 'Attorney / Correspondent Name', type: 'text', required: false },
        { id: 'attorneyEmail', label: 'Email Address (USPTO will communicate here)', type: 'text', required: false },
        { id: 'attorneyPhone', label: 'Phone Number', type: 'text', required: false },
        { id: 'attorneyAddress', label: 'Correspondence Address (if different from owner)', type: 'textarea', required: false },
      ],
    },
    {
      id: 'fee-calculation',
      title: 'Fee Calculation',
      fields: [
        { id: 'numClasses', label: 'Number of International Classes', type: 'number', required: true },
        { id: 'feePerClass', label: 'Fee per Class (TEAS+ or TEAS Standard)', type: 'currency', required: true },
        { id: 'totalFilingFee', label: 'Total Filing Fee', type: 'currency', required: true },
        { id: 'methodOfPayment', label: 'Payment Method', type: 'select', required: true, options: ['USPTO trademark portal (credit card)', 'Deposit account', 'Wire transfer'] },
      ],
    },
    {
      id: 'declaration',
      title: 'Declaration & Signature',
      fields: [
        { id: 'ownerSignature', label: 'Owner Signature (or authorized signer)', type: 'checkbox', required: true },
        { id: 'declarationReviewed', label: 'Declaration language reviewed and understood', type: 'checkbox', required: true },
        { id: 'specimenVerified', label: 'Specimen verified as showing mark in use (if applicable)', type: 'checkbox', required: false },
        { id: 'falseStatementsWarning', label: 'Acknowledged: false statements may result in cancellation', type: 'checkbox', required: true },
      ],
    },
  ],
}

const CEASE_AND_DESIST_LETTER: DocumentTemplate = {
  type: 'cease-and-desist-letter',
  title: 'Cease and Desist Letter',
  description: 'Formal demand letter for trademark infringement or copyright violation.',
  courtType: 'ip',
  jurisdiction: 'General',
  estimatedTime: '15-20 min',
  sections: [
    {
      id: 'parties',
      title: 'Parties',
      fields: [
        { id: 'senderName', label: 'Your Name / Company', type: 'text', required: true },
        { id: 'senderAddress', label: 'Your Address', type: 'textarea', required: true },
        { id: 'senderEmail', label: 'Your Email', type: 'text', required: true },
        { id: 'recipientName', label: 'Recipient Name / Company', type: 'text', required: true },
        { id: 'recipientAddress', label: 'Recipient Address', type: 'textarea', required: true },
      ],
    },
    {
      id: 'ip-details',
      title: 'Intellectual Property Being Infringed',
      fields: [
        { id: 'ipType', label: 'Type of IP', type: 'select', required: true, options: ['Trademark', 'Copyright', 'Patent', 'Trade Secret', 'Other'] },
        { id: 'registeredMark', label: 'Is IP registered? (Registration # if yes)', type: 'text', required: false },
        { id: 'registrationDate', label: 'Registration / Filing Date', type: 'date', required: false },
        { id: 'descriptionOfIP', label: 'Description of IP Being Infringed', type: 'textarea', required: true },
        { id: 'infringingActivity', label: 'Describe Infringing Activity', type: 'textarea', required: true },
        { id: 'infringingStartDate', label: 'Approximate Date Infringement Began', type: 'date', required: true },
      ],
    },
    {
      id: 'demands',
      title: 'Demands',
      fields: [
        { id: 'immediateCessation', label: 'Immediate cessation of infringing activity', type: 'checkbox', required: true },
        { id: 'removeInfringingContent', label: 'Removal of infringing content/materials', type: 'checkbox', required: false },
        { id: 'destroyInfringingMaterials', label: 'Destruction of infringing materials', type: 'checkbox', required: false },
        { id: 'writtenAssurance', label: 'Written assurance to cease and desist', type: 'checkbox', required: false },
        { id: 'monetaryCompensation', label: 'Monetary compensation for damages', type: 'checkbox', required: false },
        { id: 'otherDemands', label: 'Other specific demands', type: 'textarea', required: false },
      ],
    },
    {
      id: 'legal-framework',
      title: 'Legal Framework',
      fields: [
        { id: 'jurisdiction', label: 'Jurisdiction for legal purposes', type: 'text', required: true },
        { id: 'governingLaw', label: 'Governing Law', type: 'text', required: true },
        { id: 'legalBasis', label: 'Legal Basis for Claim', type: 'textarea', required: true },
      ],
    },
    {
      id: 'deadline-response',
      title: 'Deadline for Response',
      fields: [
        { id: 'responseDeadline', label: 'Days given to respond (typically 10-30)', type: 'number', required: true, validation: { min: 1, max: 90 } },
        { id: 'escalationNotice', label: 'Notice of escalation if no response', type: 'checkbox', required: true },
        { id: 'escalationDetails', label: 'Escalation details (litigation, domain dispute, etc.)', type: 'textarea', required: false },
        { id: 'settlementOffer', label: 'Open to settlement discussion?', type: 'checkbox', required: false },
        { id: 'settlementTerms', label: 'Settlement terms (if open)', type: 'textarea', required: false },
      ],
    },
  ],
}

const ALL_TEMPLATES: DocumentTemplate[] = [
  FAMILY_INTAKE_FORM,
  CUSTODY_PETITION,
  DIVORCE_FILING_CHECKLIST,
  CHILD_SUPPORT_WORKSHEET,
  MEANS_TEST_FORM,
  CHAPTER7_PETITION_CHECKLIST,
  CHAPTER13_PETITION_CHECKLIST,
  ASSET_SCHEDULE_WORKSHEET,
  TRADEMARK_SEARCH_REQUEST,
  TRADEMARK_APPLICATION_CHECKLIST,
  CEASE_AND_DESIST_LETTER,
]

// ─────────────────────────────────────────────────────────────
// DOCUMENT GENERATOR CLASS
// ─────────────────────────────────────────────────────────────

export class LegalDocumentGenerator {
  private templates: DocumentTemplate[] = ALL_TEMPLATES

  listTemplates (courtTypeParam?: CourtType): DocumentTemplate[] {
    if (!courtTypeParam) return this.templates
    return this.templates.filter((t: DocumentTemplate) => t.courtType === courtTypeParam)
  }

  getTemplate (type: DocumentType): DocumentTemplate | undefined {
    return this.templates.find((t: DocumentTemplate) => t.type === type)
  }

  getTemplatesForCourt (court: CourtType): DocumentTemplate[] {
    return this.templates.filter((t: DocumentTemplate) => t.courtType === court)
  }

  generateDocument (
    type: DocumentType,
    fieldValues: Record<string, string | number | boolean> = {}
  ): GeneratedDocument | undefined {
    const template = this.getTemplate(type)
    if (!template) return undefined

    const sections: GeneratedSection[] = template.sections.map((section: DocumentSection) => {
      const filledFields = section.fields.map((field: DocumentField) => {
        const value = fieldValues[field.id]
        return {
          id: field.id,
          label: field.label,
          value: value !== undefined ? String(value) : '',
          filled: value !== undefined && value !== '',
        }
      })

      const sectionContentParts: string[] = []
      filledFields.forEach((f: { id: string; label: string; value: string; filled: boolean }) => {
        if (f.filled) {
          sectionContentParts.push(`${f.label}: ${f.value}`)
        }
      })

      return {
        sectionId: section.id,
        title: section.title,
        content: sectionContentParts.join('\n'),
        fields: filledFields,
      }
    })

    const totalFields = sections.reduce(
      (sum: number, s: GeneratedSection) => sum + s.fields.length,
      0
    )
    const filledCount = sections.reduce(
      (sum: number, s: GeneratedSection) => sum + s.fields.filter((f: { filled: boolean }) => f.filled).length,
      0
    )

    return {
      type: template.type,
      title: template.title,
      template: template.description,
      generatedAt: new Date().toISOString(),
      jurisdiction: template.jurisdiction,
      sections,
      metadata: {
        fieldCount: totalFields,
        filledCount,
        completionPercent: totalFields > 0 ? Math.round((filledCount / totalFields) * 100) : 0,
      },
    }
  }

  getDocumentCatalog (): Record<CourtType, Array<{ type: DocumentType; title: string; description: string }>> {
    const catalog: Record<CourtType, Array<{ type: DocumentType; title: string; description: string }>> = {
      family: [],
      bankruptcy: [],
      immigration: [],
      ip: [],
    }
    for (const t of this.templates) {
      catalog[t.courtType].push({ type: t.type, title: t.title, description: t.description })
    }
    return catalog
  }
}

// Default instance for convenience
export const legalDocumentGenerator = new LegalDocumentGenerator()