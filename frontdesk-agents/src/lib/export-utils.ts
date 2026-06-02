/**
 * downloadCSV - Generates and downloads a CSV file from tabular data
 * Uses the native Blob API — zero dependencies.
 */
export function downloadCSV(
  rows: Record<string, string | number | boolean | null | undefined>[],
  filename: string
) {
  if (rows.length === 0) return

  const headers = Object.keys(rows[0])
  const escape = (v: unknown) => {
    const s = v == null ? '' : String(v)
    return s.includes(',') || s.includes('"') || s.includes('\\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s
  }

  const lines: string[] = [headers.join(',')]
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(','))
  }

  const bom = '\\uFEFF'
  const blob = new Blob([bom + lines.join('\\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * downloadMergedCSV - Combines multiple data sections into a single CSV file.
 * Each section is separated by a blank row and a # comment header for readability.
 */
export function downloadMergedCSV(
  sections: {
    title: string
    rows: Record<string, string | number | boolean | null | undefined>[]
  }[],
  filename: string
) {
  if (sections.length === 0) return

  const escape = (v: unknown) => {
    const s = v == null ? '' : String(v)
    return s.includes(',') || s.includes('"') || s.includes('\\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s
  }

  const lines: string[] = []

  for (const section of sections) {
    if (section.rows.length === 0) continue
    lines.push(`# ${section.title}`)
    const headers = Object.keys(section.rows[0])
    lines.push(headers.join(','))
    for (const row of section.rows) {
      lines.push(headers.map((h) => escape(row[h])).join(','))
    }
    lines.push('')
  }

  const bom = '\\uFEFF'
  const blob = new Blob([bom + lines.join('\\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * downloadPDF - Captures a DOM element by id and saves it as a PDF
 * Uses html2canvas + jspdf (must be installed).
 */
export async function downloadPDF(
  elementId: string,
  filename: string,
  callbacks?: { onSuccess?: () => void; onError?: (msg: string) => void }
) {
  try {
    const { default: html2canvas } = await import('html2canvas')
    const { default: jsPDF } = await import('jspdf')

    const element = document.getElementById(elementId)
    if (!element) {
      const msg = `Element #${elementId} not found`
      console.warn(msg)
      callbacks?.onError?.(msg)
      return
    }

    const canvas = await html2canvas(element, { backgroundColor: '#000000', scale: 2, useCORS: true, logging: false })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width

    let heightLeft = pdfHeight
    let position = 0
    const pageHeight = pdf.internal.pageSize.getHeight()

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight)
    heightLeft -= pageHeight

    while (heightLeft > 0) {
      position -= pageHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight)
      heightLeft -= pageHeight
    }

    pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`)
    callbacks?.onSuccess?.()
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to generate PDF'
    console.error('downloadPDF error:', err)
    callbacks?.onError?.(msg)
  }
}
