import { NextRequest, NextResponse } from 'next/server'
import { generateReport, ReportMeta } from '@/lib/report-generator'
import { supabaseAdmin } from '@/lib/supabase'
import { startDailyReportScheduler } from '@/lib/report-scheduler'

/**
 * POST /api/reports
 * Triggers on-demand PDF report generation for all or a specific business.
 *
 * Body (JSON):
 *   businessId?: string  — optional, generates for all businesses if omitted
 *   frequency?: 'daily' | 'weekly' | 'monthly'  — defaults to 'daily'
 *
 * Returns: { reports: ReportMeta[] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { businessId, frequency } = body as {
      businessId?: string
      frequency?: 'daily' | 'weekly' | 'monthly'
    }

    const reports = await generateReport({
      businessId,
      frequency: frequency || 'daily',
      upload: true,
    })

    return NextResponse.json({
      success: true,
      count: reports.length,
      reports: reports.map((r: ReportMeta) => ({
        id: r.id,
        businessId: r.businessId,
        businessName: r.businessName,
        frequency: r.frequency,
        generatedAt: r.generatedAt,
        sizeBytes: r.sizeBytes,
        storageUrl: r.storageUrl,
      })),
    })
  } catch (err) {
    console.error('[POST /api/reports] Error:', err)
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/reports
 * Lists generated reports stored in Supabase Storage,
 * grouped by business.
 *
 * Query params:
 *   businessId?: string  — filter by business
 *   limit?: number       — max results (default 50)
 *
 * Returns: { reports: StoredReport[] }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get('businessId')
    const limit = Math.min(Number(searchParams.get('limit')) || 50, 100)

    if (!supabaseAdmin) {
      return NextResponse.json({
        success: true,
        reports: [],
        note: 'Supabase Storage not configured',
      })
    }

    const { data: files, error } = await supabaseAdmin.storage
      .from('reports')
      .list('', {
        limit,
        sortBy: { column: 'created_at', order: 'desc' },
      })

    if (error) {
      // Bucket may not exist yet
      return NextResponse.json({
        success: true,
        reports: [],
      })
    }

    // Build report metadata from file listing
    const reports = files
      .filter((f: any) => f.name.endsWith('.pdf'))
      .map((f: any) => {
        const { data: urlData } = supabaseAdmin!.storage
          .from('reports')
          .getPublicUrl(f.name)

        // Extract business name from filename (e.g. "sunrise-medical-center-daily-2026-05-30.pdf")
        const nameParts = f.name.replace(/\.pdf$/, '').split('-')
        // Remove date parts (last 3 segments: daily-2026-05-30)
        const businessName = nameParts.slice(0, -4).join(' ').replace(/-/g, ' ')

        return {
          id: f.id || f.name,
          fileName: f.name,
          businessName: businessName || 'Unknown',
          frequency: 'daily' as const,
          generatedAt: f.created_at,
          sizeBytes: f.metadata?.size || 0,
          storageUrl: urlData.publicUrl,
        }
      })

    return NextResponse.json({
      success: true,
      count: reports.length,
      reports,
    })
  } catch (err) {
    console.error('[GET /api/reports] Error:', err)
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}


// Initialize the daily report scheduler at module load
startDailyReportScheduler()