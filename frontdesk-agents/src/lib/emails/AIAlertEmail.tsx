import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Row,
  Column,
  Section,
  Text,
  Hr,
} from '@react-email/components'

interface AIAlertEmailProps {
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  category?: string
  trigger?: string
  reasoning?: string
  recommendedAction?: string
  metadata?: Record<string, unknown>
  timestamp?: string
}

const SEVERITY_CONFIG = {
  critical: {
    color: '#dc2626',
    bgColor: '#fef2f2',
    label: 'CRITICAL',
    icon: '🚨',
  },
  high: {
    color: '#f97316',
    bgColor: '#fff7ed',
    label: 'HIGH',
    icon: '⚠️',
  },
  medium: {
    color: '#ca8a04',
    bgColor: '#fefce8',
    label: 'MEDIUM',
    icon: '🔔',
  },
  low: {
    color: '#6b7280',
    bgColor: '#f9fafb',
    label: 'LOW',
    icon: 'ℹ️',
  },
} as const

export function AIAlertEmail({
  severity,
  title,
  description,
  category = 'alert',
  trigger = title,
  reasoning = description,
  recommendedAction,
  metadata,
  timestamp,
}: AIAlertEmailProps) {
  const config = SEVERITY_CONFIG[severity] ?? SEVERITY_CONFIG.low
  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      })
    : new Date().toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      })

  return (
    <Html>
      <Head />
      <Text style={{ display: 'none' }}>
        [{config.label}] {title} — AI Decision Engine Alert
      </Text>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Severity Banner */}
          <Section style={{ ...styles.banner, backgroundColor: config.bgColor }}>
            <Row>
              <Column width={40}>
                <Text style={styles.icon}>{config.icon}</Text>
              </Column>
              <Column>
                <Text style={{ ...styles.bannerLabel, color: config.color }}>
                  {`${config.label} ALERT`}
                </Text>
                <Text style={styles.bannerSub}>
                  AI Decision Engine · {category.toUpperCase()}
                </Text>
              </Column>
              <Column align="right">
                <Text style={styles.timestamp}>{formattedTime}</Text>
              </Column>
            </Row>
          </Section>

          {/* Main Content */}
          <Section style={styles.content}>
            {/* Title */}
            <Heading style={styles.title}>{title}</Heading>

            {/* Trigger */}
            <Section style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>TRIGGER</Text>
              <Text style={styles.fieldValue}>{trigger}</Text>
            </Section>

            {/* Reasoning */}
            <Section style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>REASONING</Text>
              <Text style={styles.reasoning}>{reasoning}</Text>
            </Section>

            {/* Recommended Action */}
            {recommendedAction && (
              <Section style={styles.actionSection}>
                <Text style={styles.actionLabel}>RECOMMENDED ACTION</Text>
                <Text style={styles.actionValue}>{recommendedAction}</Text>
              </Section>
            )}

            {/* Metadata */}
            {metadata && Object.keys(metadata).length > 0 && (
              <Section style={styles.metadataSection}>
                <Text style={styles.metadataLabel}>METADATA</Text>
                <Text style={styles.metadataPre}>
                  {JSON.stringify(metadata, null, 2)}
                </Text>
              </Section>
            )}
          </Section>

          <Hr style={styles.divider} />

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              This alert was generated automatically by the Frontdesk Agents AI Decision Engine.
              No action is required if you've already handled this situation.
            </Text>
            <Text style={styles.footerLinks}>
              <a href="#" style={styles.link}>View Dashboard</a>
              {' · '}
              <a href="#" style={styles.link}>Acknowledge Alert</a>
              {' · '}
              <a href="#" style={styles.link}>Snooze</a>
            </Text>
            <Text style={styles.footerBrand}>
              Frontdesk Agents · AI Decision Engine
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const styles = {
  body: {
    backgroundColor: '#f4f4f5',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    margin: 0,
    padding: '40px 0',
  },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    maxWidth: 600,
    margin: '0 auto',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  banner: {
    padding: '20px 40px',
  },
  icon: {
    fontSize: 24,
    margin: 0,
    lineHeight: 1,
  },
  bannerLabel: {
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: '1px',
    margin: 0,
  } as React.CSSProperties,
  bannerSub: {
    fontSize: 11,
    color: '#71717a',
    margin: '3px 0 0',
    letterSpacing: '0.3px',
  },
  timestamp: {
    fontSize: 11,
    color: '#71717a',
    margin: 0,
    textAlign: 'right' as const,
  },
  content: {
    padding: '28px 40px',
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: '#18181b',
    margin: '0 0 24px',
    lineHeight: 1.3,
    letterSpacing: '-0.3px',
  } as React.CSSProperties,
  fieldGroup: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: '#a1a1aa',
    letterSpacing: '1px',
    margin: '0 0 6px',
    textTransform: 'uppercase' as const,
  } as React.CSSProperties,
  fieldValue: {
    fontSize: 14,
    color: '#18181b',
    margin: 0,
    fontWeight: 500,
    lineHeight: 1.5,
  },
  reasoning: {
    fontSize: 13,
    color: '#3f3f46',
    margin: 0,
    lineHeight: 1.65,
  },
  actionSection: {
    backgroundColor: '#f4f4f5',
    borderRadius: 6,
    padding: '14px 16px',
    marginBottom: 20,
  },
  actionLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: '#a1a1aa',
    letterSpacing: '1px',
    margin: '0 0 6px',
    textTransform: 'uppercase' as const,
  } as React.CSSProperties,
  actionValue: {
    fontSize: 13,
    color: '#18181b',
    margin: 0,
    fontWeight: 500,
    lineHeight: 1.5,
  },
  metadataSection: {
    marginBottom: 4,
  },
  metadataLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: '#a1a1aa',
    letterSpacing: '1px',
    margin: '0 0 8px',
    textTransform: 'uppercase' as const,
  } as React.CSSProperties,
  metadataPre: {
    backgroundColor: '#f4f4f5',
    borderRadius: 6,
    padding: '12px 16px',
    fontSize: 11,
    color: '#3f3f46',
    margin: 0,
    fontFamily: '"JetBrains Mono", "Menlo", monospace',
    overflow: 'auto' as const,
    lineHeight: 1.6,
    whiteSpace: 'pre' as const,
  } as React.CSSProperties,
  divider: {
    borderColor: '#e4e4e7',
    margin: '0',
  },
  footer: {
    padding: '20px 40px 28px',
    textAlign: 'center' as const,
  },
  footerText: {
    color: '#71717a',
    fontSize: 11,
    lineHeight: 1.6,
    margin: '0 0 10px',
  },
  footerLinks: {
    fontSize: 12,
    margin: '0 0 10px',
  },
  link: {
    color: '#71717a',
    textDecoration: 'underline',
  } as React.CSSProperties,
  footerBrand: {
    color: '#a1a1aa',
    fontSize: 10,
    letterSpacing: '0.5px',
    margin: 0,
  },
}

export default AIAlertEmail