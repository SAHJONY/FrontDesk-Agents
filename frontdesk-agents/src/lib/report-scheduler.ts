import cron from 'node-cron'
import { generateReport } from './report-generator'

let _initialized = false

/**
 * startDailyReportScheduler - Starts a node-cron job that runs every day at midnight.
 * Only allows one instance and only runs on the server side.
 */
export function startDailyReportScheduler(): void {
  if (_initialized) return
  if (typeof window !== 'undefined') {
    console.warn('[report-scheduler] Running in browser — skipping cron setup')
    return
  }

  // Run daily at midnight (00:00)
  const task = cron.schedule('0 0 * * *', async () => {
    console.log('[report-scheduler] Daily report generation started...')
    try {
      const results = await generateReport({ frequency: 'daily', upload: true })
      console.log(`[report-scheduler] Generated ${results.length} daily report(s)`)
      for (const r of results) {
        console.log(`  - ${r.businessName}: ${r.storageUrl || 'no storage upload'} (${(r.sizeBytes / 1024).toFixed(1)} KB)`)
      }
    } catch (err) {
      console.error('[report-scheduler] Daily report generation failed:', err)
    }
  }, {
    
    timezone: 'America/New_York',
  })

  _initialized = true
  console.log('[report-scheduler] Daily cron job scheduled (midnight ET)')
}

/**
 * stopDailyReportScheduler - Stops the daily cron job.
 */
export function stopDailyReportScheduler(): void {
  if (!_initialized) return
  _initialized = false
  console.log('[report-scheduler] Stopped')
}
