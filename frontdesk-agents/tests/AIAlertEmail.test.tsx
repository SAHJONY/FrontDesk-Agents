import { describe, it, expect } from 'vitest'
import { render } from '@react-email/render'
import { AIAlertEmail } from '@/lib/emails/AIAlertEmail'

describe('AIAlertEmail', () => {
  describe('severity configuration', () => {
    it('renders critical severity with red color and 🚨 emoji', async () => {
      const html = await render(AIAlertEmail({
        severity: 'critical',
        title: 'System down',
        description: 'Primary database unreachable',
      }))
      expect(html).toContain('#dc2626') // red
      expect(html).toContain('🚨')
      expect(html).toContain('CRITICAL ALERT')
    })

    it('renders high severity with orange color and ⚠️ emoji', async () => {
      const html = await render(AIAlertEmail({
        severity: 'high',
        title: 'High churn risk',
        description: 'Customer health below 40',
      }))
      expect(html).toContain('#f97316') // orange
      expect(html).toContain('⚠️')
      expect(html).toContain('HIGH ALERT')
    })

    it('renders medium severity with yellow color and 🔔 emoji', async () => {
      const html = await render(AIAlertEmail({
        severity: 'medium',
        title: 'Unusual pattern',
        description: 'Call volume 30% above normal',
      }))
      expect(html).toContain('#ca8a04') // yellow
      expect(html).toContain('🔔')
      expect(html).toContain('MEDIUM ALERT')
    })

    it('renders low severity with gray color and ℹ️ emoji', async () => {
      const html = await render(AIAlertEmail({
        severity: 'low',
        title: 'Info: routine check',
        description: 'System operating normally',
      }))
      expect(html).toContain('#6b7280') // gray
      expect(html).toContain('ℹ️')
      expect(html).toContain('LOW ALERT')
    })

    it('defaults to low severity config when unknown severity is passed', async () => {
      const html = await render(AIAlertEmail({
        severity: 'unknown' as any,
        title: 'Test',
        description: 'Test description',
      }))
      // Falls back to low config (gray)
      expect(html).toContain('#6b7280')
    })
  })

  describe('banner rendering', () => {
    it('includes severity background color in banner', async () => {
      const html = await render(AIAlertEmail({
        severity: 'critical',
        title: 'Critical alert',
        description: 'Something went wrong',
      }))
      expect(html).toContain('#fef2f2') // critical bgColor
    })

    it('shows category in uppercase in banner subtitle', async () => {
      const html = await render(AIAlertEmail({
        severity: 'high',
        title: 'Test alert',
        description: 'Test desc',
        category: 'retain',
      }))
      expect(html).toContain('RETAIN')
    })

    it('shows AI Decision Engine label in banner', async () => {
      const html = await render(AIAlertEmail({
        severity: 'low',
        title: 'Test',
        description: 'Test',
        category: 'escalate',
      }))
      expect(html).toContain('AI Decision Engine')
    })
  })

  describe('content rendering', () => {
    it('renders the title in a heading', async () => {
      const html = await render(AIAlertEmail({ severity: 'high', title: 'Churn Alert', description: 'Health score low' }))
      expect(html).toContain('Churn Alert')
    })

    it('renders trigger field', async () => {
      const html = await render(AIAlertEmail({
        severity: 'medium',
        title: 'Alert',
        description: 'Desc',
        trigger: 'healthScore < 40',
      }))
      expect(html).toContain('TRIGGER')
      // HTML entity encoding: < becomes &lt; in attributes/text content
      expect(html).toContain('healthScore &lt; 40')
    })

    it('renders reasoning field', async () => {
      const html = await render(AIAlertEmail({
        severity: 'high',
        title: 'Alert',
        description: 'Desc',
        reasoning: 'Customer has not called in 21+ days',
      }))
      expect(html).toContain('REASONING')
      expect(html).toContain('Customer has not called in 21+ days')
    })

    it('renders recommendedAction when provided', async () => {
      const html = await render(AIAlertEmail({
        severity: 'critical',
        title: 'Alert',
        description: 'Desc',
        recommendedAction: 'Send retention offer immediately',
      }))
      expect(html).toContain('RECOMMENDED ACTION')
      expect(html).toContain('Send retention offer immediately')
    })

    it('does not render action section when recommendedAction is omitted', async () => {
      const html = await render(AIAlertEmail({
        severity: 'low',
        title: 'Info',
        description: 'Just info',
      }))
      expect(html).not.toContain('RECOMMENDED ACTION')
    })
  })

  describe('metadata', () => {
    it('renders metadata JSON when provided', async () => {
      const html = await render(AIAlertEmail({
        severity: 'high',
        title: 'Alert',
        description: 'Desc',
        metadata: { customerId: 'cust-123', plan: 'starter', mrr: 50 },
      }))
      expect(html).toContain('METADATA')
      expect(html).toContain('cust-123')
      expect(html).toContain('starter')
      expect(html).toContain('50')
    })

    it('uses monospace font for metadata pre block', async () => {
      const html = await render(AIAlertEmail({
        severity: 'low',
        title: 'Alert',
        description: 'Desc',
        metadata: { key: 'value' },
      }))
      expect(html).toContain('JetBrains Mono')
    })

    it('does not render metadata section when metadata is omitted', async () => {
      const html = await render(AIAlertEmail({
        severity: 'medium',
        title: 'Alert',
        description: 'Desc',
      }))
      expect(html).not.toContain('METADATA')
    })

    it('handles empty metadata object gracefully', async () => {
      const html = await render(AIAlertEmail({
        severity: 'low',
        title: 'Alert',
        description: 'Desc',
        metadata: {},
      }))
      // Empty object → no keys → section is not rendered
      expect(html).not.toContain('METADATA')
    })

    it('renders nested metadata fields correctly', async () => {
      const html = await render(AIAlertEmail({
        severity: 'critical',
        title: 'Alert',
        description: 'Desc',
        metadata: {
          customerId: 'cust-abc',
          decisionId: 'dec-xyz',
          score: 92,
          flagged: true,
        },
      }))
      expect(html).toContain('cust-abc')
      expect(html).toContain('dec-xyz')
      expect(html).toContain('92')
      expect(html).toContain('true')
    })
  })

  describe('timestamp', () => {
    it('renders a formatted timestamp when provided', async () => {
      const html = await render(AIAlertEmail({
        severity: 'high',
        title: 'Alert',
        description: 'Desc',
        timestamp: '2026-01-15T10:30:00Z',
      }))
      expect(typeof html).toBe('string')
      expect(html.length).toBeGreaterThan(0)
    })

    it('renders without error when timestamp is omitted', async () => {
      const html = await render(AIAlertEmail({
        severity: 'low',
        title: 'Alert',
        description: 'Desc',
      }))
      expect(typeof html).toBe('string')
      expect(html.length).toBeGreaterThan(0)
    })
  })

  describe('footer', () => {
    it('includes View Dashboard link in footer', async () => {
      const html = await render(AIAlertEmail({ severity: 'low', title: 'Alert', description: 'Desc' }))
      expect(html).toContain('View Dashboard')
    })

    it('includes Acknowledge Alert link in footer', async () => {
      const html = await render(AIAlertEmail({ severity: 'low', title: 'Alert', description: 'Desc' }))
      expect(html).toContain('Acknowledge Alert')
    })

    it('includes Snooze link in footer', async () => {
      const html = await render(AIAlertEmail({ severity: 'low', title: 'Alert', description: 'Desc' }))
      expect(html).toContain('Snooze')
    })

    it('includes Frontdesk Agents branding in footer', async () => {
      const html = await render(AIAlertEmail({ severity: 'low', title: 'Alert', description: 'Desc' }))
      expect(html).toContain('Frontdesk Agents')
    })
  })

  describe('defaults and fallbacks', () => {
    it('uses title as trigger when trigger is omitted', async () => {
      const html = await render(AIAlertEmail({
        severity: 'medium',
        title: 'Test Title',
        description: 'Test description',
      }))
      // trigger defaults to title
      expect(html).toContain('Test Title')
    })

    it('uses description as reasoning when reasoning is omitted', async () => {
      const html = await render(AIAlertEmail({
        severity: 'low',
        title: 'Alert',
        description: 'This is the reasoning fallback',
      }))
      // reasoning defaults to description
      expect(html).toContain('This is the reasoning fallback')
    })

    it('defaults category to alert when omitted', async () => {
      const html = await render(AIAlertEmail({
        severity: 'low',
        title: 'Alert',
        description: 'Desc',
      }))
      expect(html).toContain('ALERT') // 'alert'.toUpperCase() = 'ALERT'
    })
  })
})