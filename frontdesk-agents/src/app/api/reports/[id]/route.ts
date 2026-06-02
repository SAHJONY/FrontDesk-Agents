import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * GET /api/reports/[id]
 * Downloads a specific report PDF by filename from Supabase Storage.
 *
 * The [id] param is the filename (e.g. "sunrise-medical-center-daily-2026-05-30.pdf")
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: fileName } = await params

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Supabase Storage not configured' },
        { status: 503 }
      )
    }

    // Try to find the file in the daily folder
    const filePath = `${fileName}`

    const { data, error } = await supabaseAdmin.storage
      .from('reports')
      .download(filePath)

    if (error || !data) {
      // Try listing all files to find a match
      const { data: files } = await supabaseAdmin.storage
        .from('reports')
        .list()

      const found = files?.find((f: any) => f.name === fileName)

      if (!found) {
        return NextResponse.json(
          { success: false, error: 'Report not found' },
          { status: 404 }
        )
      }

      const { data: retryData, error: retryError } = await supabaseAdmin.storage
        .from('reports')
        .download(filePath)

      if (retryError || !retryData) {
        return NextResponse.json(
          { success: false, error: 'Failed to download report' },
          { status: 500 }
        )
      }

      const buffer = Buffer.from(await retryData.arrayBuffer())
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Length': buffer.length.toString(),
        },
      })
    }

    const buffer = Buffer.from(await data.arrayBuffer())
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (err) {
    console.error(`[GET /api/reports/${(await params).id}] Error:`, err)
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
