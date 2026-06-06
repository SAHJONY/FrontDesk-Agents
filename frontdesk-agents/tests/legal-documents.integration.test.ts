import { describe, it, expect, vi } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/owner-session', () => ({
  getOwnerSession: vi.fn(),
}))

import { getOwnerSession } from '@/lib/owner-session'

const responses: Array<{ status: number; data: object }> = []
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data: object, options?: { status?: number }) => {
      responses.push({ status: options?.status ?? 200, data })
      return { status: options?.status ?? 200, data }
    }),
  },
}))

const ALL_DOCUMENT_TYPES = [
  'family-intake-form', 'custody-petition', 'divorce-filing-checklist',
  'child-support-worksheet', 'means-test-form', 'chapter-7-petition-checklist',
  'chapter-13-petition-checklist', 'asset-schedule-worksheet',
  'trademark-search-request', 'trademark-application-checklist', 'cease-and-desist-letter',
] as const

const ALL_COURT_TYPES = ['family', 'bankruptcy', 'ip', 'immigration'] as const

const COURT_TYPE_MAP: Record<string, string[]> = {
  family: ['family-intake-form', 'custody-petition', 'divorce-filing-checklist', 'child-support-worksheet'],
  bankruptcy: ['means-test-form', 'chapter-7-petition-checklist', 'chapter-13-petition-checklist', 'asset-schedule-worksheet'],
  ip: ['trademark-search-request', 'trademark-application-checklist', 'cease-and-desist-letter'],
  immigration: [],
}

function makeGetRequest(url: string): NextRequest {
  return { url, clone: function () { return this } } as unknown as NextRequest
}

function makePostRequest(body: Record<string, unknown>): NextRequest {
  const jsonStr = JSON.stringify(body)
  return {
    clone: function () { return this },
    async json() { return JSON.parse(jsonStr) },
  } as unknown as NextRequest
}

function setupOwnerAuth(authenticated = true) {
  responses.length = 0
  vi.mocked(getOwnerSession).mockResolvedValue(
    authenticated
      ? ({ authenticated: true, email: 'owner@test.com', name: 'Test Owner' } as any)
      : (null as any)
  )
}

async function getRoute() {
  const mod = await import('@/app/api/legal/documents/route')
  return mod
}

// GET /catalog — all 4 court type keys
describe('GET /catalog', () => {
  it('returns catalog with all 4 court type keys', async () => {
    setupOwnerAuth(true)
    const route = await getRoute()
    await route.GET(makeGetRequest('http://localhost/api/legal/documents?action=catalog'))
    expect(responses).toHaveLength(1)
    const { status, data } = responses[0]
    expect(status).toBe(200)
    expect(data).toMatchObject({
      success: true,
      catalog: expect.objectContaining({
        family: expect.any(Array),
        bankruptcy: expect.any(Array),
        ip: expect.any(Array),
        immigration: expect.any(Array),
      }),
    })
  })

  it('family court has 4 documents', async () => {
    setupOwnerAuth(true)
    const route = await getRoute()
    await route.GET(makeGetRequest('http://localhost/api/legal/documents?action=catalog'))
    const { data } = responses[0] as { status: number; data: { catalog: { family: unknown[] } } }
    expect(data.catalog.family).toHaveLength(4)
  })

  it('bankruptcy court has 4 documents', async () => {
    setupOwnerAuth(true)
    const route = await getRoute()
    await route.GET(makeGetRequest('http://localhost/api/legal/documents?action=catalog'))
    const { data } = responses[0] as { status: number; data: { catalog: { bankruptcy: unknown[] } } }
    expect(data.catalog.bankruptcy).toHaveLength(4)
  })

  it('ip court has 3 documents', async () => {
    setupOwnerAuth(true)
    const route = await getRoute()
    await route.GET(makeGetRequest('http://localhost/api/legal/documents?action=catalog'))
    const { data } = responses[0] as { status: number; data: { catalog: { ip: unknown[] } } }
    expect(data.catalog.ip).toHaveLength(3)
  })

  it('immigration court returns empty array', async () => {
    setupOwnerAuth(true)
    const route = await getRoute()
    await route.GET(makeGetRequest('http://localhost/api/legal/documents?action=catalog'))
    const { data } = responses[0] as { status: number; data: { catalog: { immigration: unknown[] } } }
    expect(data.catalog.immigration).toHaveLength(0)
  })

  it('catalog entries include type, title, description', async () => {
    setupOwnerAuth(true)
    const route = await getRoute()
    await route.GET(makeGetRequest('http://localhost/api/legal/documents?action=catalog'))
    const { data } = responses[0] as { status: number; data: { catalog: { family: Array<{type:string;title:string;description:string}> } } }
    const doc = data.catalog.family[0]
    expect(doc).toHaveProperty('type')
    expect(doc).toHaveProperty('title')
    expect(doc).toHaveProperty('description')
  })
})

// POST /catalog — catalog + totalDocuments
describe('POST /catalog', () => {
  it('returns catalog with totalDocuments=11', async () => {
    setupOwnerAuth(true)
    const route = await getRoute()
    await route.POST(makePostRequest({ action: 'catalog' }))
    expect(responses).toHaveLength(1)
    const { status, data } = responses[0]
    expect(status).toBe(200)
    expect(data).toMatchObject({
      success: true,
      totalDocuments: 11,
      catalog: expect.objectContaining({
        family: expect.any(Array),
        bankruptcy: expect.any(Array),
        ip: expect.any(Array),
        immigration: expect.any(Array),
      }),
    })
  })

  it('catalog has correct counts per court type', async () => {
    setupOwnerAuth(true)
    const route = await getRoute()
    await route.POST(makePostRequest({ action: 'catalog' }))
    const { data } = responses[0] as { status: number; data: { catalog: Record<string, unknown[]>; totalDocuments: number } }
    expect(data.catalog.family).toHaveLength(4)
    expect(data.catalog.bankruptcy).toHaveLength(4)
    expect(data.catalog.ip).toHaveLength(3)
    expect(data.catalog.immigration).toHaveLength(0)
    expect(data.totalDocuments).toBe(11)
  })
})

// POST /generate — all 11 document types
describe('POST /generate — all document types', () => {
  // Per-document-type field values map — only test field injection for templates
  // whose field IDs match what we provide; verify structure for all 11 types
  const DOC_FIELD_VALUES: Record<string, Record<string, string>> = {
    'family-intake-form': { fullName: 'John Doe', dateOfBirth: '1990-01-01' },
    'custody-petition': { petitionerName: 'Jane Doe', child1Name: 'Alice Doe' },
    'divorce-filing-checklist': { petitionFiled: 'true' },
    'child-support-worksheet': { parentAName: 'John Doe', parentBName: 'Jane Doe' },
    'means-test-form': { fullName: 'John Smith', ssn: '123-45-6789' },
    'chapter-7-petition-checklist': { voluntaryPetition: 'true' },
    'chapter-13-petition-checklist': { voluntaryPetition: 'true' },
    'asset-schedule-worksheet': { primaryResidence: '123 Main St' },
    'trademark-search-request': { markName: 'ACME Corp', goodsServicesDescription: 'Software' },
    'trademark-application-checklist': { markText: 'ACME', classIdentification: 'Class 35' },
    'cease-and-desist-letter': { senderName: 'ACME Corp', recipientName: 'Infringer LLC' },
  }

  for (const docType of ALL_DOCUMENT_TYPES) {
    it('generates ' + docType + ' with correct document structure', async () => {
      setupOwnerAuth(true)
      const route = await getRoute()
      const fieldValues = DOC_FIELD_VALUES[docType] ?? {}
      await route.POST(makePostRequest({
        action: 'generate',
        documentType: docType,
        fieldValues,
      }))
      expect(responses).toHaveLength(1)
      const { status, data } = responses[0]
      expect(status).toBe(200)
      expect(data).toMatchObject({
        success: true,
        document: expect.objectContaining({
          type: docType,
          title: expect.any(String),
          generatedAt: expect.any(String),
          jurisdiction: expect.any(String),
          sections: expect.any(Array),
          metadata: expect.objectContaining({
            fieldCount: expect.any(Number),
            filledCount: expect.any(Number),
            completionPercent: expect.any(Number),
          }),
        }),
      })
      // Verify metadata structure is valid
      const doc = (data as { document: { metadata: { fieldCount: number; filledCount: number; completionPercent: number } } }).document
      expect(doc.metadata.fieldCount).toBeGreaterThan(0)
      expect(doc.metadata.filledCount).toBeGreaterThanOrEqual(0)
      expect(doc.metadata.completionPercent).toBeGreaterThanOrEqual(0)
      expect(doc.metadata.completionPercent).toBeLessThanOrEqual(100)
    })
  }

  it('returns 400 for missing documentType', async () => {
    setupOwnerAuth(true)
    const route = await getRoute()
    await route.POST(makePostRequest({ action: 'generate' }))
    const { status, data } = responses[0]
    expect(status).toBe(400)
    expect(data).toMatchObject({ success: false })
  })

  it('returns 400 for invalid documentType', async () => {
    setupOwnerAuth(true)
    const route = await getRoute()
    await route.POST(makePostRequest({ action: 'generate', documentType: 'nonexistent-type' }))
    const { status, data } = responses[0]
    expect(status).toBe(400)
    expect(data).toMatchObject({ success: false })
  })

  it('generates successfully for valid documentType', async () => {
    setupOwnerAuth(true)
    const route = await getRoute()
    await route.POST(makePostRequest({ action: 'generate', documentType: 'family-intake-form' }))
    expect(responses[0].status).toBe(200)
  })
})

// POST /preview — all 11 document types
describe('POST /preview — all document types', () => {
  for (const docType of ALL_DOCUMENT_TYPES) {
    it('previews ' + docType + ' with section structure', async () => {
      setupOwnerAuth(true)
      const route = await getRoute()
      await route.POST(makePostRequest({ action: 'preview', documentType: docType }))
      expect(responses).toHaveLength(1)
      const { status, data } = responses[0]
      expect(status).toBe(200)
      expect(data).toMatchObject({
        success: true,
        preview: expect.objectContaining({
          type: docType,
          title: expect.any(String),
          courtType: expect.any(String),
          estimatedTime: expect.any(String),
          sections: expect.any(Array),
        }),
      })
      const preview = (data as { preview: { sections: Array<{id: string; title: string; fieldCount: number}> } }).preview
      expect(preview.sections.length).toBeGreaterThan(0)
      for (const section of preview.sections) {
        expect(section).toHaveProperty('id')
        expect(section).toHaveProperty('title')
        expect(section).toHaveProperty('fieldCount')
      }
    })
  }

  it('returns 400 for invalid documentType', async () => {
    setupOwnerAuth(true)
    const route = await getRoute()
    await route.POST(makePostRequest({ action: 'preview', documentType: 'invalid-doc-type' }))
    const { status, data } = responses[0]
    expect(status).toBe(400)
    expect(data).toMatchObject({ success: false })
  })

  it('returns 400 for missing documentType', async () => {
    setupOwnerAuth(true)
    const route = await getRoute()
    await route.POST(makePostRequest({ action: 'preview' }))
    const { status, data } = responses[0]
    expect(status).toBe(400)
    expect(data).toMatchObject({ success: false })
  })
})

// GET /list-templates — all templates and courtType filtering
describe('GET /list-templates', () => {
  it('returns all 11 templates without filter', async () => {
    setupOwnerAuth(true)
    const route = await getRoute()
    await route.GET(makeGetRequest('http://localhost/api/legal/documents?action=list-templates'))
    const { status, data } = responses[0]
    expect(status).toBe(200)
    const d = data as { templates: unknown[]; total: number }
    expect(d.total).toBe(11)
    expect(d.templates).toHaveLength(11)
  })

  for (const courtType of ALL_COURT_TYPES) {
    const expectedCount = COURT_TYPE_MAP[courtType]?.length ?? 0
    it('filters by courtType=' + courtType + ' (expects ' + expectedCount + ' templates)', async () => {
      setupOwnerAuth(true)
      const route = await getRoute()
      await route.GET(makeGetRequest('http://localhost/api/legal/documents?action=list-templates&courtType=' + courtType))
      const { status, data } = responses[0]
      expect(status).toBe(200)
      const d = data as { templates: Array<{courtType: string}>; total: number }
      expect(d.total).toBe(expectedCount)
      expect(d.templates).toHaveLength(expectedCount)
      for (const t of d.templates) {
        expect(t.courtType).toBe(courtType)
      }
    })
  }

  it('template entries have correct shape', async () => {
    setupOwnerAuth(true)
    const route = await getRoute()
    await route.GET(makeGetRequest('http://localhost/api/legal/documents?action=list-templates'))
    const { data } = responses[0] as { templates: Array<{type:string;title:string;description:string;courtType:string;jurisdiction:string;estimatedTime:string;sectionCount:number;fieldCount:number}> }
    const template = data.templates[0]
    expect(template).toHaveProperty('type')
    expect(template).toHaveProperty('title')
    expect(template).toHaveProperty('description')
    expect(template).toHaveProperty('courtType')
    expect(template).toHaveProperty('jurisdiction')
    expect(template).toHaveProperty('estimatedTime')
    expect(template).toHaveProperty('sectionCount')
    expect(template).toHaveProperty('fieldCount')
    expect(template.sectionCount).toBeGreaterThan(0)
    expect(template.fieldCount).toBeGreaterThan(0)
  })
})

// POST /list-by-court — all 4 court types
describe('POST /list-by-court', () => {
  for (const courtType of ALL_COURT_TYPES) {
    const expectedCount = COURT_TYPE_MAP[courtType]?.length ?? 0
    it('list-by-court ' + courtType + ' returns ' + expectedCount + ' templates', async () => {
      setupOwnerAuth(true)
      const route = await getRoute()
      await route.POST(makePostRequest({ action: 'list-by-court', courtType }))
      const { status, data } = responses[0]
      expect(status).toBe(200)
      expect(data).toMatchObject({
        success: true,
        courtType,
        total: expectedCount,
        templates: expect.any(Array),
      })
      const d = data as { templates: unknown[]; total: number }
      expect(d.templates).toHaveLength(expectedCount)
    })
  }

  it('returns 400 for missing courtType', async () => {
    setupOwnerAuth(true)
    const route = await getRoute()
    await route.POST(makePostRequest({ action: 'list-by-court' }))
    const { status, data } = responses[0]
    expect(status).toBe(400)
    expect(data).toMatchObject({ success: false })
  })

  it('returns 400 for invalid courtType', async () => {
    setupOwnerAuth(true)
    const route = await getRoute()
    await route.POST(makePostRequest({ action: 'list-by-court', courtType: 'invalid-court' }))
    const { status, data } = responses[0]
    expect(status).toBe(400)
    expect(data).toMatchObject({ success: false })
  })
})

// GET /get-template
describe('GET /get-template', () => {
  it('returns template for valid document type', async () => {
    setupOwnerAuth(true)
    const route = await getRoute()
    await route.GET(makeGetRequest('http://localhost/api/legal/documents?action=get-template&type=family-intake-form'))
    const { status, data } = responses[0]
    expect(status).toBe(200)
    expect(data).toMatchObject({
      success: true,
      template: expect.objectContaining({
        type: 'family-intake-form',
        title: expect.any(String),
        sections: expect.any(Array),
      }),
    })
  })

  it('returns 404 for non-existent type', async () => {
    setupOwnerAuth(true)
    const route = await getRoute()
    await route.GET(makeGetRequest('http://localhost/api/legal/documents?action=get-template&type=nonexistent-type'))
    const { status, data } = responses[0]
    expect(status).toBe(404)
    expect(data).toMatchObject({ success: false })
  })

  it('returns 400 for missing type parameter', async () => {
    setupOwnerAuth(true)
    const route = await getRoute()
    await route.GET(makeGetRequest('http://localhost/api/legal/documents?action=get-template'))
    const { status, data } = responses[0]
    expect(status).toBe(400)
    expect(data).toMatchObject({ success: false })
  })
})

// Authentication
describe('Authentication', () => {
  it('GET catalog returns 401 when not authenticated', async () => {
    setupOwnerAuth(false)
    const route = await getRoute()
    await route.GET(makeGetRequest('http://localhost/api/legal/documents?action=catalog'))
    const { status, data } = responses[0]
    expect(status).toBe(401)
    expect(data).toMatchObject({ success: false, error: 'Not authenticated' })
  })

  it('POST generate returns 401 when not authenticated', async () => {
    setupOwnerAuth(false)
    const route = await getRoute()
    await route.POST(makePostRequest({ action: 'generate', documentType: 'family-intake-form' }))
    const { status, data } = responses[0]
    expect(status).toBe(401)
    expect(data).toMatchObject({ success: false, error: 'Not authenticated' })
  })

  it('POST list-by-court returns 401 when not authenticated', async () => {
    setupOwnerAuth(false)
    const route = await getRoute()
    await route.POST(makePostRequest({ action: 'list-by-court', courtType: 'family' }))
    const { status, data } = responses[0]
    expect(status).toBe(401)
    expect(data).toMatchObject({ success: false, error: 'Not authenticated' })
  })
})

// Unknown action handling
describe('Unknown action handling', () => {
  it('GET returns 400 for unknown action', async () => {
    setupOwnerAuth(true)
    const route = await getRoute()
    await route.GET(makeGetRequest('http://localhost/api/legal/documents?action=unknown-action'))
    const { status, data } = responses[0]
    expect(status).toBe(400)
    expect(data).toMatchObject({ success: false })
  })

  it('POST returns 400 for unknown action', async () => {
    setupOwnerAuth(true)
    const route = await getRoute()
    await route.POST(makePostRequest({ action: 'unknown-action' }))
    const { status, data } = responses[0]
    expect(status).toBe(400)
    expect(data).toMatchObject({ success: false })
  })

  it('POST returns 400 for missing action field', async () => {
    setupOwnerAuth(true)
    const route = await getRoute()
    await route.POST(makePostRequest({}))
    const { status, data } = responses[0]
    expect(status).toBe(400)
    expect(data).toMatchObject({ success: false })
  })
})

// End-to-end document structure validation
describe('Document structure validation', () => {
  it('generated document has correct type and metadata', async () => {
    setupOwnerAuth(true)
    const route = await getRoute()
    await route.POST(makePostRequest({
      action: 'generate',
      documentType: 'custody-petition',
      fieldValues: {
        petitionerName: 'Jane Doe',
        respondentName: 'John Doe',
        child1Name: 'Alice Doe',
        child1DOB: '2015-03-12',
      },
    }))
    const { data } = responses[0] as { status: number; data: { document: { type: string; title: string; sections: Array<{fields: Array<{filled: boolean}>}>; metadata: { fieldCount: number; filledCount: number; completionPercent: number } } } }
    expect(data.document.type).toBe('custody-petition')
    expect(data.document.title).toBe('Child Custody Petition')
    expect(data.document.sections.length).toBeGreaterThan(0)
    const allFields = data.document.sections.flatMap((s) => s.fields)
    const filledFields = allFields.filter((f) => f.filled)
    expect(filledFields.length).toBeGreaterThanOrEqual(4)
    expect(data.document.metadata.completionPercent).toBeGreaterThanOrEqual(0)
    expect(data.document.metadata.completionPercent).toBeLessThanOrEqual(100)
  })

  it('preview sections have correct field structure', async () => {
    setupOwnerAuth(true)
    const route = await getRoute()
    await route.POST(makePostRequest({ action: 'preview', documentType: 'trademark-search-request' }))
    const { data } = responses[0] as { status: number; data: { preview: { sections: Array<{id: string; title: string; instruction?: string; fields: Array<{id: string; label: string; type: string; required: boolean}> }> } } }
    const sections = data.preview.sections
    expect(sections.length).toBeGreaterThan(0)
    for (const section of sections) {
      expect(section.id).toBeTruthy()
      expect(section.title).toBeTruthy()
      expect(section.fields.length).toBeGreaterThan(0)
      for (const field of section.fields) {
        expect(field.id).toBeTruthy()
        expect(field.label).toBeTruthy()
        expect(field.type).toBeTruthy()
        expect(typeof field.required).toBe('boolean')
      }
    }
  })
})