import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─────────────────────────────────────────────────────────────────────────────
// Mocks — hoisted before any imports
// ─────────────────────────────────────────────────────────────────────────────

const mockGetOwnerSession = vi.fn()

vi.mock('@/lib/owner-session', () => ({
  getOwnerSession: mockGetOwnerSession,
}))

const mockNextResponseJson = vi.fn()

vi.mock('next/server', () => ({
  NextRequest: vi.fn(),
  NextResponse: {
    json: mockNextResponseJson,
  },
}))

// Mock the document generator — route layer tests only (not testing the generator itself)
vi.mock('@/lib/agents/legal-research/document-generator', () => ({
  legalDocumentGenerator: {
    listTemplates: vi.fn(),
    getTemplate: vi.fn(),
    getTemplatesForCourt: vi.fn(),
    generateDocument: vi.fn(),
    getDocumentCatalog: vi.fn(),
  },
  CourtType: {} as any,
  DocumentSection: {} as any,
  DocumentTemplate: {} as any,
}))

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const AUTHED_OWNER = {
  id: 'owner-001',
  email: 'owner@example.com',
  authenticated: true,
  loginTime: new Date().toISOString(),
  role: 'owner',
}

function createMockRequest(url: string, body: object = {}) {
  const urlObj = new URL(url, 'http://localhost')
  return {
    url,
    searchParams: urlObj.searchParams,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as any
}

// ─────────────────────────────────────────────────────────────────────────────
// Test Suite
// ─────────────────────────────────────────────────────────────────────────────

describe('Legal Document Generation API — Route Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetOwnerSession.mockResolvedValue(AUTHED_OWNER)
  })

  // ── GET /api/legal/documents ─────────────────────────────────────────────

  describe('GET handler', () => {
    it('returns 401 when not authenticated', async () => {
      mockGetOwnerSession.mockResolvedValueOnce(null)
      mockNextResponseJson.mockImplementation((data: object) => data)

      const { GET } = await import('@/app/api/legal/documents/route')
      const result = await GET(createMockRequest('http://localhost/api/legal/documents'))

      expect(result).toEqual({ success: false, error: 'Not authenticated' })
    })

    it('returns all templates when action=list-templates (no filter)', async () => {
      const { legalDocumentGenerator } = await import('@/lib/agents/legal-research/document-generator')
      ;(legalDocumentGenerator.listTemplates as ReturnType<typeof vi.fn>).mockReturnValue([
        {
          type: 'family-intake-form', title: 'Family Law Intake Form', description: 'Comprehensive intake form',
          courtType: 'family', jurisdiction: 'State Family Court', estimatedTime: '25-30 min',
          sections: [{ fields: [{ id: 'a', label: 'A', type: 'text', required: true }] }],
        },
      ])
      mockNextResponseJson.mockImplementation((data: object) => data)

      const { GET } = await import('@/app/api/legal/documents/route')
      const result = await GET(createMockRequest('http://localhost/api/legal/documents?action=list-templates'))

      expect(result.success).toBe(true)
      expect(Array.isArray(result.templates)).toBe(true)
      expect(result.total).toBe(1)
    })

    it('returns IP templates when list-templates filtered by courtType=ip', async () => {
      const { legalDocumentGenerator } = await import('@/lib/agents/legal-research/document-generator')
      ;(legalDocumentGenerator.listTemplates as ReturnType<typeof vi.fn>).mockReturnValue([
        { type: 'trademark-search-request', title: 'Trademark Search Request', description: '...', courtType: 'ip', jurisdiction: 'USPTO', estimatedTime: '10-15 min', sections: [{ fields: [] }] },
      ])
      mockNextResponseJson.mockImplementation((data: object) => data)

      const { GET } = await import('@/app/api/legal/documents/route')
      const result = await GET(createMockRequest('http://localhost/api/legal/documents?action=list-templates&courtType=ip'))

      expect(result.success).toBe(true)
      expect(result.templates[0].courtType).toBe('ip')
    })

    it('returns template when action=get-template with valid type', async () => {
      const { legalDocumentGenerator } = await import('@/lib/agents/legal-research/document-generator')
      ;(legalDocumentGenerator.getTemplate as ReturnType<typeof vi.fn>).mockReturnValue({
        type: 'custody-petition', title: 'Child Custody Petition', description: 'Petition for child custody',
        courtType: 'family', jurisdiction: 'State Family Court', estimatedTime: '20-25 min', sections: [],
      })
      mockNextResponseJson.mockImplementation((data: object) => data)

      const { GET } = await import('@/app/api/legal/documents/route')
      const result = await GET(createMockRequest('http://localhost/api/legal/documents?action=get-template&type=custody-petition'))

      expect(result.success).toBe(true)
      expect(result.template.type).toBe('custody-petition')
    })

    it('returns 400 when get-template missing type parameter', async () => {
      mockNextResponseJson.mockImplementation((data: object) => data)

      const { GET } = await import('@/app/api/legal/documents/route')
      const result = await GET(createMockRequest('http://localhost/api/legal/documents?action=get-template'))

      expect(result).toEqual({ success: false, error: 'Missing type parameter' })
    })

    it('returns 404 when get-template type not found', async () => {
      const { legalDocumentGenerator } = await import('@/lib/agents/legal-research/document-generator')
      ;(legalDocumentGenerator.getTemplate as ReturnType<typeof vi.fn>).mockReturnValue(undefined)
      mockNextResponseJson.mockImplementation((data: object) => data)

      const { GET } = await import('@/app/api/legal/documents/route')
      const result = await GET(createMockRequest('http://localhost/api/legal/documents?action=get-template&type=nonexistent-type'))

      expect(result).toEqual({ success: false, error: "Template 'nonexistent-type' not found" })
    })

    it('returns catalog with family, bankruptcy, ip, and immigration keys', async () => {
      const { legalDocumentGenerator } = await import('@/lib/agents/legal-research/document-generator')
      ;(legalDocumentGenerator.getDocumentCatalog as ReturnType<typeof vi.fn>).mockReturnValue({
        family: [{ type: 'family-intake-form', title: 'Family Law Intake Form', description: '...' }],
        bankruptcy: [{ type: 'means-test-form', title: 'Bankruptcy Means Test Form', description: '...' }],
        ip: [{ type: 'trademark-search-request', title: 'Trademark Search Request', description: '...' }],
        immigration: [],
      })
      mockNextResponseJson.mockImplementation((data: object) => data)

      const { GET } = await import('@/app/api/legal/documents/route')
      const result = await GET(createMockRequest('http://localhost/api/legal/documents?action=catalog'))

      expect(result.success).toBe(true)
      expect(result.catalog).toHaveProperty('family')
      expect(result.catalog).toHaveProperty('bankruptcy')
      expect(result.catalog).toHaveProperty('ip')
      expect(result.catalog).toHaveProperty('immigration')
      expect(result.catalog.family[0].type).toBe('family-intake-form')
      expect(result.catalog.ip[0].type).toBe('trademark-search-request')
    })

    it('defaults to list-templates when no action param is provided', async () => {
      const { legalDocumentGenerator } = await import('@/lib/agents/legal-research/document-generator')
      ;(legalDocumentGenerator.listTemplates as ReturnType<typeof vi.fn>).mockReturnValue([])
      mockNextResponseJson.mockImplementation((data: object) => data)

      const { GET } = await import('@/app/api/legal/documents/route')
      await GET(createMockRequest('http://localhost/api/legal/documents'))

      expect(legalDocumentGenerator.listTemplates).toHaveBeenCalledWith(undefined)
    })

    it('returns 400 for unknown action', async () => {
      mockNextResponseJson.mockImplementation((data: object) => data)

      const { GET } = await import('@/app/api/legal/documents/route')
      const result = await GET(createMockRequest('http://localhost/api/legal/documents?action=unknown-action'))

      expect(result.success).toBe(false)
      expect(result.error).toContain('Unknown action')
    })
  })

  // ── POST /api/legal/documents ────────────────────────────────────────────

  describe('POST handler', () => {
    it('returns 401 when not authenticated', async () => {
      mockGetOwnerSession.mockResolvedValueOnce(null)
      mockNextResponseJson.mockImplementation((data: object) => data)

      const { POST } = await import('@/app/api/legal/documents/route')
      const result = await POST(createMockRequest('http://localhost/api/legal/documents', { action: 'generate' }))

      expect(result).toEqual({ success: false, error: 'Not authenticated' })
    })

    it('returns 400 when action field is missing', async () => {
      mockNextResponseJson.mockImplementation((data: object) => data)

      const { POST } = await import('@/app/api/legal/documents/route')
      const result = await POST(createMockRequest('http://localhost/api/legal/documents', {}))

      expect(result).toEqual({ success: false, error: 'Missing action field' })
    })

    // — generate action —

    it('returns 400 when generate missing documentType', async () => {
      mockNextResponseJson.mockImplementation((data: object) => data)

      const { POST } = await import('@/app/api/legal/documents/route')
      const result = await POST(createMockRequest('http://localhost/api/legal/documents', { action: 'generate' }))

      expect(result).toEqual({ success: false, error: 'Missing documentType for generate action' })
    })

    it('returns 400 when generate has invalid documentType', async () => {
      mockNextResponseJson.mockImplementation((data: object) => data)

      const { POST } = await import('@/app/api/legal/documents/route')
      const result = await POST(createMockRequest('http://localhost/api/legal/documents', {
        action: 'generate',
        documentType: 'invalid-type',
      }))

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid documentType')
    })

    it('returns generated document with metadata when generate is valid', async () => {
      const { legalDocumentGenerator } = await import('@/lib/agents/legal-research/document-generator')
      ;(legalDocumentGenerator.generateDocument as ReturnType<typeof vi.fn>).mockReturnValue({
        type: 'family-intake-form',
        title: 'Family Law Intake Form',
        template: 'Comprehensive initial intake form...',
        generatedAt: new Date().toISOString(),
        jurisdiction: 'State Family Court',
        sections: [{
          sectionId: 'client-info',
          title: 'Client Information',
          content: 'Full Legal Name: John Doe',
          fields: [{ id: 'fullName', label: 'Full Legal Name', value: 'John Doe', filled: true }],
        }],
        metadata: { fieldCount: 8, filledCount: 1, completionPercent: 13 },
      })
      mockNextResponseJson.mockImplementation((data: object) => data)

      const { POST } = await import('@/app/api/legal/documents/route')
      const result = await POST(createMockRequest('http://localhost/api/legal/documents', {
        action: 'generate',
        documentType: 'family-intake-form',
        fieldValues: { fullName: 'John Doe' },
      }))

      expect(result.success).toBe(true)
      expect(result.document.type).toBe('family-intake-form')
      expect(result.document.metadata.fieldCount).toBe(8)
      expect(result.document.metadata.completionPercent).toBe(13)
    })

    it('returns 404 when generate template not found', async () => {
      const { legalDocumentGenerator } = await import('@/lib/agents/legal-research/document-generator')
      ;(legalDocumentGenerator.generateDocument as ReturnType<typeof vi.fn>).mockReturnValue(undefined)
      mockNextResponseJson.mockImplementation((data: object) => data)

      const { POST } = await import('@/app/api/legal/documents/route')
      const result = await POST(createMockRequest('http://localhost/api/legal/documents', {
        action: 'generate',
        documentType: 'family-intake-form',
      }))

      expect(result).toEqual({ success: false, error: "Template 'family-intake-form' not found" })
    })

    // — preview action —

    it('returns 400 when preview missing documentType', async () => {
      mockNextResponseJson.mockImplementation((data: object) => data)

      const { POST } = await import('@/app/api/legal/documents/route')
      const result = await POST(createMockRequest('http://localhost/api/legal/documents', { action: 'preview' }))

      expect(result).toEqual({ success: false, error: 'Missing documentType for preview action' })
    })

    it('returns 400 when preview has invalid (non-existent) documentType', async () => {
      // Route validates documentType against VALID_DOCUMENT_TYPES before calling getTemplate.
      // 'nonexistent-type' is not in the valid list → returns "Invalid documentType" (not 404).
      mockNextResponseJson.mockImplementation((data: object) => data)

      const { POST } = await import('@/app/api/legal/documents/route')
      const result = await POST(createMockRequest('http://localhost/api/legal/documents', {
        action: 'preview',
        documentType: 'nonexistent-type',
      }))

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid documentType')
    })

    it('returns preview with sections and fields when preview is valid', async () => {
      const { legalDocumentGenerator } = await import('@/lib/agents/legal-research/document-generator')
      ;(legalDocumentGenerator.getTemplate as ReturnType<typeof vi.fn>).mockReturnValue({
        type: 'means-test-form',
        title: 'Bankruptcy Means Test Form',
        description: 'Official means test form...',
        courtType: 'bankruptcy',
        estimatedTime: '30-35 min',
        sections: [{
          id: 'debtor-info',
          title: 'Debtor Information',
          instruction: undefined,
          fields: [
            { id: 'fullName', label: 'Full Legal Name', type: 'text', required: true, placeholder: undefined, helpText: undefined, options: undefined },
            { id: 'ssn', label: 'Social Security Number', type: 'text', required: true, placeholder: 'XXX-XX-XXXX', helpText: undefined, options: undefined },
          ],
        }],
      })
      mockNextResponseJson.mockImplementation((data: object) => data)

      const { POST } = await import('@/app/api/legal/documents/route')
      const result = await POST(createMockRequest('http://localhost/api/legal/documents', {
        action: 'preview',
        documentType: 'means-test-form',
      }))

      expect(result.success).toBe(true)
      expect(result.preview.type).toBe('means-test-form')
      expect(result.preview.sections[0].fields[0].label).toBe('Full Legal Name')
      expect(result.preview.sections[0].fieldCount).toBe(2)
    })

    it('returns 404 when preview template not found (valid docType but getTemplate returns undefined)', async () => {
      const { legalDocumentGenerator } = await import('@/lib/agents/legal-research/document-generator')
      // Valid docType but getTemplate returns undefined (e.g. removed template)
      ;(legalDocumentGenerator.getTemplate as ReturnType<typeof vi.fn>).mockReturnValue(undefined)
      mockNextResponseJson.mockImplementation((data: object) => data)

      const { POST } = await import('@/app/api/legal/documents/route')
      // Use a valid docType so it passes the VALID_DOCUMENT_TYPES check
      const result = await POST(createMockRequest('http://localhost/api/legal/documents', {
        action: 'preview',
        documentType: 'cease-and-desist-letter',
      }))

      expect(result).toEqual({ success: false, error: "Template 'cease-and-desist-letter' not found" })
    })

    // — catalog action (POST) —

    it('POST catalog returns catalog with totalDocuments', async () => {
      const { legalDocumentGenerator } = await import('@/lib/agents/legal-research/document-generator')
      ;(legalDocumentGenerator.getDocumentCatalog as ReturnType<typeof vi.fn>).mockReturnValue({
        family: [{ type: 'family-intake-form', title: 'Family Law Intake Form', description: '...' }],
        bankruptcy: [{ type: 'means-test-form', title: 'Bankruptcy Means Test', description: '...' }],
        ip: [
          { type: 'trademark-search-request', title: 'Trademark Search Request', description: '...' },
          { type: 'trademark-application-checklist', title: 'Trademark Application Checklist', description: '...' },
          { type: 'cease-and-desist-letter', title: 'Cease and Desist Letter', description: '...' },
        ],
        immigration: [],
      })
      mockNextResponseJson.mockImplementation((data: object) => data)

      const { POST } = await import('@/app/api/legal/documents/route')
      const result = await POST(createMockRequest('http://localhost/api/legal/documents', { action: 'catalog' }))

      expect(result.success).toBe(true)
      expect(result.totalDocuments).toBe(5)
      expect(result.catalog.ip.length).toBe(3)
    })

    // — list-by-court action —

    it('returns 400 when list-by-court missing courtType', async () => {
      mockNextResponseJson.mockImplementation((data: object) => data)

      const { POST } = await import('@/app/api/legal/documents/route')
      const result = await POST(createMockRequest('http://localhost/api/legal/documents', { action: 'list-by-court' }))

      expect(result).toEqual({ success: false, error: 'Missing courtType for list-by-court action' })
    })

    it('returns 400 when list-by-court has invalid courtType', async () => {
      mockNextResponseJson.mockImplementation((data: object) => data)

      const { POST } = await import('@/app/api/legal/documents/route')
      const result = await POST(createMockRequest('http://localhost/api/legal/documents', {
        action: 'list-by-court',
        courtType: 'invalid-court',
      }))

      expect(result.success).toBe(false)
      expect(result.error).toContain("courtType must be")
    })

    it('returns IP templates when list-by-court courtType=ip', async () => {
      const { legalDocumentGenerator } = await import('@/lib/agents/legal-research/document-generator')
      ;(legalDocumentGenerator.getTemplatesForCourt as ReturnType<typeof vi.fn>).mockReturnValue([
        { type: 'trademark-search-request', title: 'Trademark Search Request', description: '...', jurisdiction: 'USPTO', estimatedTime: '10-15 min', sections: [{ fields: [] }] },
        { type: 'trademark-application-checklist', title: 'Trademark Application Checklist', description: '...', jurisdiction: 'USPTO', estimatedTime: '20-25 min', sections: [{ fields: [] }] },
        { type: 'cease-and-desist-letter', title: 'Cease and Desist Letter', description: '...', jurisdiction: 'General', estimatedTime: '15-20 min', sections: [{ fields: [] }] },
      ])
      mockNextResponseJson.mockImplementation((data: object) => data)

      const { POST } = await import('@/app/api/legal/documents/route')
      const result = await POST(createMockRequest('http://localhost/api/legal/documents', {
        action: 'list-by-court',
        courtType: 'ip',
      }))

      expect(result.success).toBe(true)
      expect(result.courtType).toBe('ip')
      expect(result.total).toBe(3)
      expect(result.templates[0].type).toBe('trademark-search-request')
    })

    it('returns bankruptcy templates when list-by-court courtType=bankruptcy', async () => {
      const { legalDocumentGenerator } = await import('@/lib/agents/legal-research/document-generator')
      ;(legalDocumentGenerator.getTemplatesForCourt as ReturnType<typeof vi.fn>).mockReturnValue([
        { type: 'means-test-form', title: 'Bankruptcy Means Test Form', description: '...', jurisdiction: 'US Bankruptcy Court', estimatedTime: '30-35 min', sections: [{ fields: [] }] },
        { type: 'chapter-7-petition-checklist', title: 'Chapter 7 Bankruptcy Petition Checklist', description: '...', jurisdiction: 'US Bankruptcy Court', estimatedTime: '20-25 min', sections: [{ fields: [] }] },
        { type: 'chapter-13-petition-checklist', title: 'Chapter 13 Bankruptcy Petition Checklist', description: '...', jurisdiction: 'US Bankruptcy Court', estimatedTime: '20-25 min', sections: [{ fields: [] }] },
        { type: 'asset-schedule-worksheet', title: 'Asset Schedule / Statement of Financial Affairs', description: '...', jurisdiction: 'US Bankruptcy Court', estimatedTime: '25-30 min', sections: [{ fields: [] }] },
      ])
      mockNextResponseJson.mockImplementation((data: object) => data)

      const { POST } = await import('@/app/api/legal/documents/route')
      const result = await POST(createMockRequest('http://localhost/api/legal/documents', {
        action: 'list-by-court',
        courtType: 'bankruptcy',
      }))

      expect(result.success).toBe(true)
      expect(result.courtType).toBe('bankruptcy')
      expect(result.total).toBe(4)
    })

    it('returns 400 for unknown POST action', async () => {
      mockNextResponseJson.mockImplementation((data: object) => data)

      const { POST } = await import('@/app/api/legal/documents/route')
      const result = await POST(createMockRequest('http://localhost/api/legal/documents', { action: 'unknown-action' }))

      expect(result.success).toBe(false)
      expect(result.error).toContain('Unknown action')
    })
  })
})