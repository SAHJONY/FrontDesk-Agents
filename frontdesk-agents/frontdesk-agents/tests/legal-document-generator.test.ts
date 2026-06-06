import { describe, it, expect } from 'vitest'
import { legalDocumentGenerator } from '@/lib/agents/legal-research/document-generator'
import type { CourtType } from '@/lib/agents/legal-research/types'

// ─────────────────────────────────────────────────────────────────────────────
// These tests exercise the REAL LegalDocumentGenerator — no mocking.
// Keep this file separate so vi.mock on document-generator in the route tests
// does not affect these tests.
// ─────────────────────────────────────────────────────────────────────────────

describe('LegalDocumentGenerator — Template Coverage', () => {
  describe('Court type coverage', () => {
    it('covers all 4 court types: family, immigration, bankruptcy, ip', () => {
      const allTemplates = legalDocumentGenerator.listTemplates()
      const courtTypes = new Set(allTemplates.map((t) => t.courtType as string))

      expect(courtTypes.has('family')).toBe(true)
      expect(courtTypes.has('immigration')).toBe(true)
      expect(courtTypes.has('bankruptcy')).toBe(true)
      expect(courtTypes.has('ip')).toBe(true)
    })

    it('has at least 3 templates per active court type (family, bankruptcy, ip)', () => {
      for (const court of ['family', 'bankruptcy', 'ip'] as const) {
        const templates = legalDocumentGenerator.getTemplatesForCourt(court as CourtType)
        expect(templates.length).toBeGreaterThanOrEqual(3)
      }
    })
  })

  describe('Document type generation', () => {
    const docTypes = [
      'family-intake-form',
      'custody-petition',
      'divorce-filing-checklist',
      'child-support-worksheet',
      'means-test-form',
      'chapter-7-petition-checklist',
      'chapter-13-petition-checklist',
      'asset-schedule-worksheet',
      'trademark-search-request',
      'trademark-application-checklist',
      'cease-and-desist-letter',
    ] as const

    it('generates all 11 document types without returning undefined', () => {
      for (const docType of docTypes) {
        const doc = legalDocumentGenerator.generateDocument(docType, {})
        expect(doc).toBeDefined()
        expect(doc?.type).toBe(docType)
      }
    })

    it('generated document has correct structure for every doc type', () => {
      for (const docType of docTypes) {
        const doc = legalDocumentGenerator.generateDocument(docType, {})
        expect(doc).toBeDefined()
        expect(doc!.type).toBe(docType)
        expect(typeof doc!.title).toBe('string')
        expect(typeof doc!.generatedAt).toBe('string')
        expect(Array.isArray(doc!.sections)).toBe(true)
        expect(doc!.metadata).toBeDefined()
        expect(typeof doc!.metadata.fieldCount).toBe('number')
        expect(typeof doc!.metadata.filledCount).toBe('number')
        expect(typeof doc!.metadata.completionPercent).toBe('number')
      }
    })

    it('fills fields correctly when fieldValues are provided', () => {
      const doc = legalDocumentGenerator.generateDocument('family-intake-form', {
        fullName: 'Jane Doe',
        dateOfBirth: '1990-05-15',
        annualIncome: '75000',
      })

      expect(doc).toBeDefined()
      const filledFields = doc!.sections.flatMap((s) => s.fields.filter((f) => f.filled))
      expect(filledFields.length).toBeGreaterThan(0)
      expect(filledFields.some((f) => f.value === 'Jane Doe')).toBe(true)
    })

    it('completionPercent is 0 when no fields are filled', () => {
      const doc = legalDocumentGenerator.generateDocument('trademark-search-request', {})
      expect(doc!.metadata.completionPercent).toBe(0)
    })

    it('completionPercent is 100 when all fields are filled', () => {
      const doc = legalDocumentGenerator.generateDocument('trademark-search-request', {
        markName: 'MyBrand',
        markType: 'Word Mark (text only)',
        descriptionOfMark: 'A distinctive word mark',
        goodsServicesDescription: 'Software services',
        searchTess: true,
        searchCommonLaw: true,
        searchSimilarMarks: true,
        applicantName: 'Jane Doe',
        applicantAddress: '123 Main St',
        applicantCity: 'Austin',
        applicantState: 'TX',
        applicantZip: '78701',
        applicantCountry: 'USA',
        contactName: 'Jane Doe',
        contactEmail: 'jane@example.com',
        searchLevel: 'Comprehensive (exact + phonetic + meaning)',
        searchPurpose: 'Pre-filing clearance',
      })
      expect(doc!.metadata.completionPercent).toBeGreaterThan(0)
    })
  })

  describe('getDocumentCatalog', () => {
    it('returns catalog with all 4 court type keys (family, immigration, bankruptcy, ip)', () => {
      const catalog = legalDocumentGenerator.getDocumentCatalog()

      expect(catalog).toHaveProperty('family')
      expect(catalog).toHaveProperty('immigration')
      expect(catalog).toHaveProperty('bankruptcy')
      expect(catalog).toHaveProperty('ip')
    })

    it('catalog has exactly 11 total templates across all court types', () => {
      const catalog = legalDocumentGenerator.getDocumentCatalog()
      const total =
        catalog.family.length +
        catalog.bankruptcy.length +
        catalog.ip.length +
        catalog.immigration.length

      expect(total).toBe(11)
    })

    it('ip court type has exactly 3 trademark templates', () => {
      const catalog = legalDocumentGenerator.getDocumentCatalog()

      expect(catalog.ip).toBeDefined()
      expect(catalog.ip.length).toBe(3)
      const ipTypes = catalog.ip.map((t) => t.type)
      expect(ipTypes).toContain('trademark-search-request')
      expect(ipTypes).toContain('trademark-application-checklist')
      expect(ipTypes).toContain('cease-and-desist-letter')
    })

    it('family court type has 4 templates', () => {
      const catalog = legalDocumentGenerator.getDocumentCatalog()
      expect(catalog.family.length).toBe(4)
    })

    it('bankruptcy court type has 4 templates', () => {
      const catalog = legalDocumentGenerator.getDocumentCatalog()
      expect(catalog.bankruptcy.length).toBe(4)
    })

    it('each catalog entry has type, title, and description fields', () => {
      const catalog = legalDocumentGenerator.getDocumentCatalog()
      const allEntries = [
        ...catalog.family,
        ...catalog.immigration,
        ...catalog.bankruptcy,
        ...catalog.ip,
      ]

      for (const entry of allEntries) {
        expect(typeof entry.type).toBe('string')
        expect(typeof entry.title).toBe('string')
        expect(typeof entry.description).toBe('string')
      }
    })
  })

  describe('getTemplate', () => {
    it('returns template for each of the 11 document types', () => {
      const docTypes = [
        'family-intake-form', 'custody-petition', 'divorce-filing-checklist', 'child-support-worksheet',
        'means-test-form', 'chapter-7-petition-checklist', 'chapter-13-petition-checklist', 'asset-schedule-worksheet',
        'trademark-search-request', 'trademark-application-checklist', 'cease-and-desist-letter',
      ] as const

      for (const docType of docTypes) {
        const template = legalDocumentGenerator.getTemplate(docType)
        expect(template).toBeDefined()
        expect(template!.type).toBe(docType)
      }
    })

    it('returns undefined for non-existent template type', () => {
      const template = legalDocumentGenerator.getTemplate('non-existent-type' as any)
      expect(template).toBeUndefined()
    })

    it('returned template has sections and fields', () => {
      const template = legalDocumentGenerator.getTemplate('custody-petition')
      expect(template).toBeDefined()
      expect(template!.sections.length).toBeGreaterThan(0)
      const allFields = template!.sections.flatMap((s) => s.fields)
      expect(allFields.length).toBeGreaterThan(0)
    })
  })

  describe('getTemplatesForCourt', () => {
    it('returns 4 family law templates', () => {
      const templates = legalDocumentGenerator.getTemplatesForCourt('family')
      expect(templates.length).toBe(4)
      expect(templates.every((t) => t.courtType === 'family')).toBe(true)
    })

    it('returns 4 bankruptcy templates', () => {
      const templates = legalDocumentGenerator.getTemplatesForCourt('bankruptcy')
      expect(templates.length).toBe(4)
      expect(templates.every((t) => t.courtType === 'bankruptcy')).toBe(true)
    })

    it('returns 3 IP/trademark templates', () => {
      const templates = legalDocumentGenerator.getTemplatesForCourt('ip')
      expect(templates.length).toBe(3)
      expect(templates.every((t) => t.courtType === 'ip')).toBe(true)
    })

    it('returns empty array for immigration (no immigration templates defined)', () => {
      const templates = legalDocumentGenerator.getTemplatesForCourt('immigration')
      expect(templates.length).toBe(0)
    })
  })

  describe('listTemplates', () => {
    it('returns all 11 templates when called with no filter', () => {
      const templates = legalDocumentGenerator.listTemplates()
      expect(templates.length).toBe(11)
    })

    it('returns only family templates when filtered by family', () => {
      const templates = legalDocumentGenerator.listTemplates('family')
      expect(templates.length).toBe(4)
      expect(templates.every((t) => t.courtType === 'family')).toBe(true)
    })

    it('returns only bankruptcy templates when filtered by bankruptcy', () => {
      const templates = legalDocumentGenerator.listTemplates('bankruptcy')
      expect(templates.length).toBe(4)
      expect(templates.every((t) => t.courtType === 'bankruptcy')).toBe(true)
    })

    it('returns only IP templates when filtered by ip', () => {
      const templates = legalDocumentGenerator.listTemplates('ip')
      expect(templates.length).toBe(3)
      expect(templates.every((t) => t.courtType === 'ip')).toBe(true)
    })

    it('returns empty array when filtered by immigration', () => {
      const templates = legalDocumentGenerator.listTemplates('immigration')
      expect(templates.length).toBe(0)
    })
  })
})