// Analytics tracking for FrontDesk Agents AI
// Supports multiple analytics providers

export interface AnalyticsEvent {
  event: string
  properties?: Record<string, any>
  userId?: string
  timestamp: number
}

// Initialize analytics
export function initializeAnalytics() {
  if (typeof window === 'undefined') return

  // Google Analytics
  if (process.env.NEXT_PUBLIC_GA_ID) {
    // GA initialization would go here
    console.log('Analytics initialized')
  }

  // Track page views
  trackPageView()
}

// Track page views
export function trackPageView(url?: string) {
  if (typeof window === 'undefined') return
  
  const currentPath = url || window.location.pathname
  console.log(`[Analytics] Page view: ${currentPath}`)
  
  // Google Analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('event', 'page_view', {
      page_path: currentPath,
    })
  }
}

// Track custom events
export function trackEvent(
  eventName: string,
  properties?: Record<string, any>,
  userId?: string
) {
  if (typeof window === 'undefined') return

  const event: AnalyticsEvent = {
    event: eventName,
    properties,
    userId,
    timestamp: Date.now(),
  }

  console.log(`[Analytics] ${eventName}`, event)

  // Google Analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('event', eventName, properties)
  }

  // Send to backend for storage
  try {
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    }).catch(console.error)
  } catch (error) {
    console.error('Failed to track event:', error)
  }
}

// Track conversions
export function trackConversion(
  conversionId: string,
  value?: number,
  currency = 'USD'
) {
  trackEvent('conversion', {
    conversion_id: conversionId,
    value,
    currency,
  })
}

// Track user actions
export const analytics = {
  // User actions
  userSignedUp: (email: string) =>
    trackEvent('user_signed_up', { email }),
  userLoggedIn: (email: string) =>
    trackEvent('user_logged_in', { email }),
  userLoggedOut: () => trackEvent('user_logged_out'),
  
  // Business actions
  customerCreated: (businessName: string) =>
    trackEvent('customer_created', { businessName }),
  subscriptionStarted: (plan: string, revenue: number) =>
    trackEvent('subscription_started', { plan, revenue }),
  
  // AI interactions
  aiConversationStarted: (industry: string) =>
    trackEvent('ai_conversation_started', { industry }),
  aiCallHandled: (duration: number, success: boolean) =>
    trackEvent('ai_call_handled', { duration, success }),
  aiMessageProcessed: (language: string) =>
    trackEvent('ai_message_processed', { language }),
  
  // Dashboard actions
  dashboardViewed: (metrics: any) =>
    trackEvent('dashboard_viewed', { metrics }),
  reportExported: (type: string) =>
    trackEvent('report_exported', { type }),
  
  // Pricing
  pricingViewed: () => trackEvent('pricing_viewed'),
  planSelected: (plan: string) =>
    trackEvent('plan_selected', { plan }),
  checkoutStarted: (plan: string) =>
    trackEvent('checkout_started', { plan }),
  
  // Performance
  pageLoaded: (loadTime: number) =>
    trackEvent('page_loaded', { loadTime }),
  apiCallCompleted: (endpoint: string, duration: number) =>
    trackEvent('api_call_completed', { endpoint, duration }),
}

export default analytics
