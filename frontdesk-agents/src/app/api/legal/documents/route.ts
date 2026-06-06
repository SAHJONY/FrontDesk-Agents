// Legal Document Generation API
// GET  /api/legal/documents - list templates / get template / catalog
// POST /api/legal/documents - generate / preview / catalog / list-by-court

import { NextRequest, NextResponse } from 'next/server'
import { legalDocumentGenerator, DocumentType, DocumentTemplate, CourtType, DocumentSection } from '@/lib/agents/legal-research/document-generator'
import { getOwnerSession } from '@/lib/owner-session'
export const dynamic = 'force-dynamic'

const VALID_DOCUMENT_TYPES: DocumentType[] = [
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
]

const ALLOWED_COURT_TYPES: CourtType[] = ['family', 'immigration', 'bankruptcy', 'ip']

function safeCourtType(raw: string | null): CourtType | undefined {
  if (!raw) return undefined
  if ((ALLOWED_COURT_TYPES as readonly string[]).includes(raw)) return raw as CourtType
  return undefined
}

// GET /api/legal/documents?action=list-templates&courtType=family
// GET /api/legal/documents?action=get-template&type=custody-petition
// GET /api/legal/documents?action=catalog
export async function GET(request: NextRequest) {
  try {
    const session = await getOwnerSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'list-templates'
    const courtTypeParam = safeCourtType(searchParams.get('courtType'))
    const documentType = searchParams.get('type') as DocumentType | null

    if (action === 'list-templates') {
      const templates = legalDocumentGenerator.listTemplates(courtTypeParam)
      return NextResponse.json({
        success: true,
        templates: templates.map((t: DocumentTemplate) => ({
          type: t.type,
          title: t.title,
          description: t.description,
          courtType: t.courtType,
          jurisdiction: t.jurisdiction,
          estimatedTime: t.estimatedTime,
          sectionCount: t.sections.length,
          fieldCount: t.sections.reduce((sum: number, sec: DocumentSection) => sum + sec.fields.length, 0),
        })),
        total: templates.length,
      })
    }

    if (action === 'get-template') {
      if (!documentType) {
        return NextResponse.json({ success: false, error: 'Missing type parameter' }, { status: 400 })
      }
      const template = legalDocumentGenerator.getTemplate(documentType)
      if (!template) {
        return NextResponse.json({ success: false, error: `Template '${documentType}' not found` }, { status: 404 })
      }
      return NextResponse.json({ success: true, template })
    }

    if (action === 'catalog') {
      const catalog = legalDocumentGenerator.getDocumentCatalog()
      return NextResponse.json({
        success: true,
        catalog: {
          family: catalog.family.map((t: { type: DocumentType; title: string; description: string }) => ({ type: t.type, title: t.title, description: t.description })),
          bankruptcy: catalog.bankruptcy.map((t: { type: DocumentType; title: string; description: string }) => ({ type: t.type, title: t.title, description: t.description })),
          ip: catalog.ip.map((t: { type: DocumentType; title: string; description: string }) => ({ type: t.type, title: t.title, description: t.description })),
          immigration: catalog.immigration?.map((t: { type: DocumentType; title: string; description: string }) => ({ type: t.type, title: t.title, description: t.description })),
        },
      })
    }

    return NextResponse.json({ success: false, error: `Unknown action '${action}'` }, { status: 400 })
  } catch (error) {
    console.error('Legal documents GET error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/legal/documents
// Body: { action: 'generate'|'preview'|'catalog'|'list-by-court', documentType?, fieldValues?, courtType? }
export async function POST(request: NextRequest) {
  try {
    const session = await getOwnerSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
    }

    let body: { action?: string; documentType?: string; fieldValues?: Record<string, string | number | boolean>; courtType?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
    }

    const { action, documentType, fieldValues = {}, courtType } = body

    if (!action) {
      return NextResponse.json({ success: false, error: 'Missing action field' }, { status: 400 })
    }

    if (action === 'generate') {
      if (!documentType) {
        return NextResponse.json({ success: false, error: 'Missing documentType for generate action' }, { status: 400 })
      }
      if (!VALID_DOCUMENT_TYPES.includes(documentType as DocumentType)) {
        return NextResponse.json(
          { success: false, error: `Invalid documentType. Must be one of: ${VALID_DOCUMENT_TYPES.join(', ')}` },
          { status: 400 }
        )
      }
      const doc = legalDocumentGenerator.generateDocument(documentType as DocumentType, fieldValues)
      if (!doc) {
        return NextResponse.json({ success: false, error: `Template '${documentType}' not found` }, { status: 404 })
      }
      return NextResponse.json({ success: true, document: doc })
    }

    if (action === 'preview') {
      if (!documentType) {
        return NextResponse.json({ success: false, error: 'Missing documentType for preview action' }, { status: 400 })
      }
      if (!VALID_DOCUMENT_TYPES.includes(documentType as DocumentType)) {
        return NextResponse.json({ success: false, error: `Invalid documentType` }, { status: 400 })
      }
      const template = legalDocumentGenerator.getTemplate(documentType as DocumentType)
      if (!template) {
        return NextResponse.json({ success: false, error: `Template '${documentType}' not found` }, { status: 404 })
      }
      return NextResponse.json({
        success: true,
        preview: {
          type: template.type,
          title: template.title,
          description: template.description,
          courtType: template.courtType,
          estimatedTime: template.estimatedTime,
          sections: template.sections.map((s: DocumentSection) => ({
            id: s.id,
            title: s.title,
            instruction: s.instruction,
            fieldCount: s.fields.length,
            fields: s.fields.map((f) => ({
              id: f.id,
              label: f.label,
              type: f.type,
              required: f.required,
              placeholder: f.placeholder,
              helpText: f.helpText,
              options: f.options,
            })),
          })),
        },
      })
    }

    if (action === 'catalog') {
      const catalog = legalDocumentGenerator.getDocumentCatalog()
      return NextResponse.json({
        success: true,
        catalog: {
          family: catalog.family.map((t: { type: DocumentType; title: string; description: string }) => ({ type: t.type, title: t.title, description: t.description })),
          bankruptcy: catalog.bankruptcy.map((t: { type: DocumentType; title: string; description: string }) => ({ type: t.type, title: t.title, description: t.description })),
          ip: catalog.ip.map((t: { type: DocumentType; title: string; description: string }) => ({ type: t.type, title: t.title, description: t.description })),
          immigration: catalog.immigration?.map((t: { type: DocumentType; title: string; description: string }) => ({ type: t.type, title: t.title, description: t.description })),
        },
        totalDocuments: catalog.family.length + catalog.bankruptcy.length + catalog.ip.length + (catalog.immigration?.length ?? 0),
      })
    }

    if (action === 'list-by-court') {
      if (!courtType) {
        return NextResponse.json({ success: false, error: 'Missing courtType for list-by-court action' }, { status: 400 })
      }
      if (!(ALLOWED_COURT_TYPES as readonly string[]).includes(courtType)) {
        return NextResponse.json({ success: false, error: "courtType must be 'family', 'bankruptcy', or 'ip'" }, { status: 400 })
      }
      const templates = legalDocumentGenerator.getTemplatesForCourt(courtType as CourtType)
      return NextResponse.json({
        success: true,
        courtType,
        templates: templates.map((t: DocumentTemplate) => ({
          type: t.type,
          title: t.title,
          description: t.description,
          jurisdiction: t.jurisdiction,
          estimatedTime: t.estimatedTime,
          sectionCount: t.sections.length,
          fieldCount: t.sections.reduce((sum: number, sec: DocumentSection) => sum + sec.fields.length, 0),
        })),
        total: templates.length,
      })
    }

    return NextResponse.json({ success: false, error: `Unknown action '${action}'` }, { status: 400 })
  } catch (error) {
    console.error('Legal documents POST error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}