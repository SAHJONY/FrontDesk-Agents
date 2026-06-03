import { NextRequest, NextResponse } from 'next/server'

// Available integrations configuration
const AVAILABLE_CONNECTORS = [
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Payment processing and billing management',
    category: 'payments',
    icon: '💳',
    status: 'connected',
    features: ['Subscription billing', 'One-time payments', 'Invoice generation', 'Customer management'],
    configFields: [
      { key: 'webhook_secret', label: 'Webhook Secret', type: 'password' },
      { key: 'publishable_key', label: 'Publishable Key', type: 'text' },
    ],
  },
  {
    id: 'supabase',
    name: 'Supabase',
    description: 'Database and authentication backend',
    category: 'backend',
    icon: '🗄️',
    status: 'connected',
    features: ['Customer data storage', 'User authentication', 'Real-time subscriptions', 'File storage'],
    configFields: [
      { key: 'supabase_url', label: 'Project URL', type: 'text' },
      { key: 'supabase_key', label: 'API Key', type: 'password' },
    ],
  },
  {
    id: 'bland',
    name: 'Bland AI',
    description: 'AI voice calling and phone provisioning',
    category: 'voice',
    icon: '📞',
    status: 'connected',
    features: ['Outbound calls', 'Inbound AI answering', 'Call recording', 'Transcription'],
    configFields: [
      { key: 'api_key', label: 'API Key', type: 'password' },
      { key: 'webhook_url', label: 'Webhook URL', type: 'text' },
      { key: 'default_voice', label: 'Default Voice ID', type: 'text' },
    ],
  },
  {
    id: 'google_calendar',
    name: 'Google Calendar',
    description: 'Calendar integration for appointment scheduling',
    category: 'calendar',
    icon: '📅',
    status: 'disconnected',
    features: ['Sync appointments', 'Calendar availability', 'Event creation', 'Reminder notifications'],
    configFields: [
      { key: 'client_id', label: 'Client ID', type: 'text' },
      { key: 'client_secret', label: 'Client Secret', type: 'password' },
    ],
    oauthUrl: '/api/connect/google/calendar',
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'CRM integration for lead management',
    category: 'crm',
    icon: '🔶',
    status: 'disconnected',
    features: ['Contact sync', 'Lead capture', 'Pipeline management', 'Email sequences'],
    configFields: [
      { key: 'api_key', label: 'API Key', type: 'password' },
      { key: 'portal_id', label: 'Portal ID', type: 'text' },
    ],
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Enterprise CRM for customer management',
    category: 'crm',
    icon: '☁️',
    status: 'disconnected',
    features: ['Contact management', 'Opportunity tracking', 'Custom objects', 'Workflow automation'],
    configFields: [
      { key: 'instance_url', label: 'Instance URL', type: 'text' },
      { key: 'client_id', label: 'Client ID', type: 'text' },
      { key: 'client_secret', label: 'Client Secret', type: 'password' },
    ],
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Workflow automation and app connections',
    category: 'automation',
    icon: '⚡',
    status: 'disconnected',
    features: ['Trigger workflows', 'App connections', 'Data sync', 'Automated tasks'],
    configFields: [
      { key: 'webhook_url', label: 'Webhook URL', type: 'text' },
      { key: 'api_key', label: 'API Key', type: 'password' },
    ],
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Team notifications and call alerts',
    category: 'notifications',
    icon: '💬',
    status: 'disconnected',
    features: ['Call notifications', 'Lead alerts', 'Team channels', 'DM updates'],
    configFields: [
      { key: 'webhook_url', label: 'Webhook URL', type: 'text' },
      { key: 'channel', label: 'Default Channel', type: 'text' },
    ],
  },
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'SMS notifications and phone services',
    category: 'sms',
    icon: '💬',
    status: 'disconnected',
    features: ['SMS alerts', 'Text notifications', 'Phone numbers', 'Multi-channel'],
    configFields: [
      { key: 'account_sid', label: 'Account SID', type: 'text' },
      { key: 'auth_token', label: 'Auth Token', type: 'password' },
      { key: 'phone_number', label: 'Phone Number', type: 'text' },
    ],
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    description: 'Email marketing and transactional emails',
    category: 'email',
    icon: '📧',
    status: 'connected',
    features: ['Email campaigns', 'Transactional emails', 'Templates', 'Analytics'],
    configFields: [
      { key: 'api_key', label: 'API Key', type: 'password' },
    ],
  },
  {
    id: 'google_analytics',
    name: 'Google Analytics',
    description: 'Website traffic and conversion tracking',
    category: 'analytics',
    icon: '📊',
    status: 'disconnected',
    features: ['Traffic analytics', 'Conversion tracking', 'User behavior', 'Custom reports'],
    configFields: [
      { key: 'tracking_id', label: 'Tracking ID', type: 'text' },
      { key: 'api_key', label: 'API Key', type: 'password' },
    ],
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Accounting and invoicing integration',
    category: 'accounting',
    icon: '🧾',
    status: 'disconnected',
    features: ['Invoice sync', 'Payment tracking', 'Expense management', 'Financial reports'],
    configFields: [
      { key: 'realm_id', label: 'Realm ID', type: 'text' },
      { key: 'client_id', label: 'Client ID', type: 'text' },
      { key: 'client_secret', label: 'Client Secret', type: 'password' },
    ],
  },
]

// Connected customers data
const CONNECTED_CUSTOMERS = [
  { customerId: 'cus_001', connectorId: 'stripe', status: 'active', lastSync: '2026-06-02T09:30:00Z' },
  { customerId: 'cus_001', connectorId: 'google_calendar', status: 'active', lastSync: '2026-06-02T08:15:00Z' },
  { customerId: 'cus_002', connectorId: 'hubspot', status: 'active', lastSync: '2026-06-01T14:20:00Z' },
  { customerId: 'cus_003', connectorId: 'stripe', status: 'active', lastSync: '2026-02T10:45:00Z' },
  { customerId: 'cus_005', connectorId: 'salesforce', status: 'active', lastSync: '2026-06-01T16:00:00Z' },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const connectorId = searchParams.get('connectorId')
    const category = searchParams.get('category')

    // Verify owner session
    const sessionCookie = request.cookies.get('owner_session')
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      const sessionData = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString())
      if (!sessionData.isOwner) {
        return NextResponse.json({ error: 'Not an owner' }, { status: 403 })
      }
    } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    // List all connectors
    if (action === 'list') {
      const connectors = category 
        ? AVAILABLE_CONNECTORS.filter(c => c.category === category)
        : AVAILABLE_CONNECTORS
      
      return NextResponse.json({
        connectors,
        stats: {
          total: AVAILABLE_CONNECTORS.length,
          connected: AVAILABLE_CONNECTORS.filter(c => c.status === 'connected').length,
          disconnected: AVAILABLE_CONNECTORS.filter(c => c.status === 'disconnected').length,
        },
        categories: [...new Set(AVAILABLE_CONNECTORS.map(c => c.category))],
      })
    }

    // Get single connector details
    if (action === 'details' && connectorId) {
      const connector = AVAILABLE_CONNECTORS.find(c => c.id === connectorId)
      if (!connector) {
        return NextResponse.json({ error: 'Connector not found' }, { status: 404 })
      }

      // Get customer connections for this connector
      const connections = CONNECTED_CUSTOMERS.filter(cc => cc.connectorId === connectorId)

      return NextResponse.json({
        connector,
        connections: connections.length,
        connectedCustomers: connections.map(cc => {
          const customer = CONNECTED_CUSTOMERS.find(c => c.customerId === cc.customerId)
          return cc.customerId
        }),
      })
    }

    // Get platform-wide connector stats
    if (action === 'stats') {
      const connectorStats = AVAILABLE_CONNECTORS.map(connector => ({
        ...connector,
        connections: CONNECTED_CUSTOMERS.filter(cc => cc.connectorId === connector.id).length,
      }))

      return NextResponse.json({
        connectors: connectorStats,
        platformStats: {
          totalIntegrations: AVAILABLE_CONNECTORS.length,
          activeConnections: CONNECTED_CUSTOMERS.length,
          categoriesCount: [...new Set(AVAILABLE_CONNECTORS.map(c => c.category))].length,
        },
      })
    }

    // Default: return all connectors
    return NextResponse.json({
      connectors: AVAILABLE_CONNECTORS,
      stats: {
        total: AVAILABLE_CONNECTORS.length,
        connected: AVAILABLE_CONNECTORS.filter(c => c.status === 'connected').length,
        disconnected: AVAILABLE_CONNECTORS.filter(c => c.status === 'disconnected').length,
      },
    })
  } catch (error: any) {
    console.error('Connectors API error:', error)
    return NextResponse.json({ error: error.message || 'Failed to get connectors' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, connectorId, config, customerId } = body

    // Verify owner session
    const sessionCookie = request.cookies.get('owner_session')
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      const sessionData = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString())
      if (!sessionData.isOwner) {
        return NextResponse.json({ error: 'Not an owner' }, { status: 403 })
      }
    } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    // Configure connector
    if (action === 'configure' && connectorId && config) {
      const connector = AVAILABLE_CONNECTORS.find(c => c.id === connectorId)
      if (!connector) {
        return NextResponse.json({ error: 'Connector not found' }, { status: 404 })
      }

      // In production, save config to database
      console.log(`Configuring ${connectorId} with:`, config)

      return NextResponse.json({
        success: true,
        message: `${connector.name} configured successfully`,
        connector: { ...connector, status: 'connected', config },
      })
    }

    // Test connector connection
    if (action === 'test' && connectorId) {
      const connector = AVAILABLE_CONNECTORS.find(c => c.id === connectorId)
      if (!connector) {
        return NextResponse.json({ error: 'Connector not found' }, { status: 404 })
      }

      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 1000))

      return NextResponse.json({
        success: true,
        message: `${connector.name} connection successful`,
        testResult: {
          status: 'connected',
          latency: Math.floor(Math.random() * 100) + 50,
          timestamp: new Date().toISOString(),
        },
      })
    }

    // Disconnect connector
    if (action === 'disconnect' && connectorId) {
      const connector = AVAILABLE_CONNECTORS.find(c => c.id === connectorId)
      if (!connector) {
        return NextResponse.json({ error: 'Connector not found' }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        message: `${connector.name} disconnected`,
        connector: { ...connector, status: 'disconnected' },
      })
    }

    // Connect customer to connector
    if (action === 'connect_customer' && connectorId && customerId) {
      const connector = AVAILABLE_CONNECTORS.find(c => c.id === connectorId)
      if (!connector) {
        return NextResponse.json({ error: 'Connector not found' }, { status: 404 })
      }

      // Add connection
      const newConnection = {
        customerId,
        connectorId,
        status: 'active',
        lastSync: new Date().toISOString(),
      }

      return NextResponse.json({
        success: true,
        message: `Customer connected to ${connector.name}`,
        connection: newConnection,
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Connectors API error:', error)
    return NextResponse.json({ error: error.message || 'Failed to process request' }, { status: 500 })
  }
}