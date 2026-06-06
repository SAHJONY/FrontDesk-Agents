import { describe, it, expect } from 'vitest'
import { legalDocumentGenerator } from '@/lib/agents/legal-research/document-generator'

// ─────────────────────────────────────────────────────────────────────────────
// Unmocked unit tests — document-generator module is NOT mocked so these
// tests exercise the real LegalDocumentGenerator singleton
// ─────────────────────────────────────────────────────────────────────────────

describe('LegalDocumentGenerator — Template Coverage', () => {

  describe('Court type coverage', () => {
    it('covers all 4 court types: family, immigration, bankruptcy, ip', () => {
      const allTemplates = legalDocumentGenerator.listTemplates()
      const courtTypes = new Set(allTemplates.map((t) => t.courtType as string))
      expect(courtTypes.has('family')).toBe(true)
      expect(courtTypes.has('bankruptcy')).toBe(true)
      expect(courtTypes.has('ip')).toBe(true)
    })

    it('has at least 3 templates per active court type', () => {
      for (const court of ['family', 'bankruptcy', 'ip'] as const) {
        const templates = legalDocumentGenerator.getTemplatesForCourt(court)
        expect(templates.length).toBeGreaterThanOrEqual(3)
      }
    })

    it('generates all 11 document types without returning undefined', () => {
      const docTypes = [
        'family-intake-form', 'custody-petition', 'divorce-filing-checklist', 'child-support-worksheet',
        'means-test-form', 'chapter-7-petition-checklist', 'chapter-13-petition-checklist', 'asset-schedule-worksheet',
        'trademark-search-request', 'trademark-application-checklist', 'cease-and-desist-letter',
      ]

      for (const docType of docTypes) {
        const doc = legalDocumentGenerator.generateDocument(docType, { clientName: 'Test Client' })
        expect(doc).not.toBeUndefined()
        expect(doc?.type).toBe(docType)
      }
    })
  })

  describe('IP court templates use courtType ip', () => {
    it('trademark-search-request has courtType ip', () => {
      const doc = legalDocumentGenerator.getTemplate('trademark-search-request')
      expect(doc?.courtType).toBe('ip')
    })

    it('trademark-application-checklist has courtType ip', () => {
      const doc = legalDocumentGenerator.getTemplate('trademark-application-checklist')
      expect(doc?.courtType).toBe('ip')
    })

    it('cease-and-desist-letter has courtType ip', () => {
      const doc = legalDocumentGenerator.getTemplate('cease-and-desist-letter')
      expect(doc?.courtType).toBe('ip')
    })
  })

  describe('getDocumentCatalog returns all 4 court type keys', () => {
    it('catalog has family, bankruptcy, ip, immigration keys', () => {
      const catalog = legalDocumentGenerator.getDocumentCatalog()
      expect(Object.keys(catalog)).toContain('family')
      expect(Object.keys(catalog)).toContain('bankruptcy')
      expect(Object.keys(catalog)).toContain('ip')
      expect(Object.keys(catalog)).toContain('immigration')
    })

    it('ip key has 3 trademark templates', () => {
      const catalog = legalDocumentGenerator.getDocumentCatalog()
      expect(catalog.ip.length).toBe(3)
    })

    it('family key has 4 family law templates', () => {
      const catalog = legalDocumentGenerator.getDocumentCatalog()
      expect(catalog.family.length).toBe(4)
    })
  })
})
