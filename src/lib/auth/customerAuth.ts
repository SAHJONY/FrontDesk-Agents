// Customer Authentication Service
// Secure login and session management for business customers

const SESSION_COOKIE_NAME = 'customer_session';
const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days

export interface CustomerSession {
  id: string;
  type: 'customer';
  email: string;
  businessName: string;
  industry?: string;
  plan?: string;
  authenticated: boolean;
  loginTime: string;
  lastActivity: string;
}

export class CustomerAuthService {
  private static instance: CustomerAuthService;

  private constructor() {}

  public static getInstance(): CustomerAuthService {
    if (!CustomerAuthService.instance) {
      CustomerAuthService.instance = new CustomerAuthService();
    }
    return CustomerAuthService.instance;
  }

  // Create customer session token
  createCustomerSession(customerData: {
    email: string;
    businessName: string;
    industry?: string;
    plan?: string;
  }): string {
    const session: CustomerSession = {
      id: crypto.randomUUID(),
      type: 'customer',
      email: customerData.email,
      businessName: customerData.businessName,
      industry: customerData.industry || 'General',
      plan: customerData.plan || 'Professional',
      authenticated: true,
      loginTime: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };

    return Buffer.from(JSON.stringify(session)).toString('base64');
  }

  // Validate customer session token
  validateCustomerSession(token: string): CustomerSession | null {
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const session: CustomerSession = JSON.parse(decoded);

      if (session.type !== 'customer' || !session.authenticated) {
        return null;
      }

      // Check session expiry (7 days)
      const loginTime = new Date(session.loginTime);
      const now = new Date();
      const hoursSinceLogin = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLogin > 168) {
        return null;
      }

      return session;
    } catch {
      return null;
    }
  }
}

export const customerAuthService = CustomerAuthService.getInstance();