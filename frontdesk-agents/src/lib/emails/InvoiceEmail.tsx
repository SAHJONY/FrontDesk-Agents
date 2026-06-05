import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Text,
  Column,
  Hr,
  Img,
} from '@react-email/components'

interface InvoiceEmailProps {
  customerName?: string
  businessName?: string
  invoiceId: string
  amount: string
  dueDate?: string
  description?: string
  status?: 'paid' | 'pending' | 'overdue'
}

const STATUS_COLORS = {
  paid: '#16a34a',
  pending: '#2563eb',
  overdue: '#dc2626',
} as const

export function InvoiceEmail({
  customerName = 'Valued Customer',
  businessName = 'Frontdesk Agents',
  invoiceId,
  amount,
  dueDate,
  description,
  status = 'pending',
}: InvoiceEmailProps) {
  const statusColor = STATUS_COLORS[status] ?? STATUS_COLORS.pending

  return (
    <Html>
      <Head />
      <Preview>
        Invoice {invoiceId} from {businessName} — {status === 'paid' ? 'Paid' : status === 'overdue' ? 'Overdue' : 'Payment Due'}
      </Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.headerSection}>
            <Row>
              <Column>
                <Heading style={styles.businessName}>{businessName}</Heading>
                <Text style={styles.headerSub}>AI-Powered Business Agents</Text>
              </Column>
              <Column align="right">
                <Text style={styles.invoiceLabel}>INVOICE</Text>
                <Text style={styles.invoiceId}>#{invoiceId}</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={styles.divider} />

          {/* Status badge */}
          <Section style={styles.statusSection}>
            <Text
              style={{
                ...styles.statusBadge,
                color: statusColor,
                borderColor: statusColor,
              }}
            >
              {status.toUpperCase()}
            </Text>
          </Section>

          {/* Customer & Amount */}
          <Section style={styles.summarySection}>
            <Row>
              <Column>
                <Text style={styles.fieldLabel}>BILL TO</Text>
                <Text style={styles.fieldValue}>{customerName}</Text>
              </Column>
              <Column align="right">
                <Text style={styles.fieldLabel}>AMOUNT DUE</Text>
                <Heading style={styles.amount}>{amount}</Heading>
              </Column>
            </Row>
            {dueDate && (
              <Row style={{ marginTop: 16 }}>
                <Column>
                  <Text style={styles.fieldLabel}>DUE DATE</Text>
                  <Text style={styles.fieldValue}>{dueDate}</Text>
                </Column>
              </Row>
            )}
          </Section>

          <Hr style={styles.divider} />

          {/* Description */}
          {description && (
            <Section style={styles.descriptionSection}>
              <Text style={styles.fieldLabel}>DESCRIPTION</Text>
              <Text style={styles.description}>{description}</Text>
            </Section>
          )}

          {/* Divider */}
          <Hr style={styles.divider} />

          {/* Footer note */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              This is an automated invoice sent by {businessName}. If you have questions,
              please reply to this email or contact our support team.
            </Text>
            <Text style={styles.footerBrand}>
              — Powered by Frontdesk Agents
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
  headerSection: {
    backgroundColor: '#18181b',
    padding: '32px 40px',
  },
  businessName: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 700,
    margin: 0,
    letterSpacing: '-0.5px',
  } as React.CSSProperties,
  headerSub: {
    color: '#71717a',
    fontSize: 12,
    margin: '4px 0 0',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  invoiceLabel: {
    color: '#71717a',
    fontSize: 11,
    fontWeight: 600,
    margin: 0,
    letterSpacing: '1px',
    textTransform: 'uppercase',
  } as React.CSSProperties,
  invoiceId: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 700,
    margin: '4px 0 0',
    letterSpacing: '-0.5px',
  },
  divider: {
    borderColor: '#e4e4e7',
    margin: '0',
  },
  statusSection: {
    padding: '24px 40px 0',
  },
  statusBadge: {
    display: 'inline-block',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '1px',
    padding: '4px 10px',
    border: '1.5px solid',
    borderRadius: 4,
    margin: 0,
  } as React.CSSProperties,
  summarySection: {
    padding: '24px 40px',
  },
  fieldLabel: {
    color: '#71717a',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    margin: '0 0 4px',
  } as React.CSSProperties,
  fieldValue: {
    color: '#18181b',
    fontSize: 15,
    fontWeight: 500,
    margin: 0,
  },
  amount: {
    color: '#18181b',
    fontSize: 28,
    fontWeight: 800,
    margin: 0,
    letterSpacing: '-1px',
  } as React.CSSProperties,
  descriptionSection: {
    padding: '0 40px 24px',
  },
  description: {
    color: '#3f3f46',
    fontSize: 14,
    lineHeight: 1.6,
    margin: '8px 0 0',
  },
  footer: {
    padding: '24px 40px 32px',
    textAlign: 'center' as const,
  },
  footerText: {
    color: '#71717a',
    fontSize: 12,
    lineHeight: 1.6,
    margin: 0,
  },
  footerBrand: {
    color: '#a1a1aa',
    fontSize: 11,
    margin: '12px 0 0',
    fontStyle: 'italic' as const,
  },
}

export default InvoiceEmail