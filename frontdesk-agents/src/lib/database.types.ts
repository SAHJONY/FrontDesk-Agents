// ─── Database Types ──────────────────────────────────────────
// Auto-generated types matching Supabase schema.
// FRONTDESK AGENTS - Production Schema v1
// ============================================================

// ─── Enums ──────────────────────────────────────────
export type PlanType = 'starter' | 'professional' | 'enterprise';
export type CustomerStatus = 'active' | 'trial' | 'past_due' | 'suspended' | 'cancelled';
// Billing History
export interface BillingHistoryRow {
  id: string;
  customer_id: string;
  invoice_id: string;
  subscription_id: string | null;
  amount: number;
  currency: string;
  status: BillingStatus;
  description: string;
  billing_reason: string | null;
  invoice_pdf_url: string | null;
  period_start: string | null;
  period_end: string | null;
  created_at: string;
}

export type BillingStatus = 'succeeded' | 'failed' | 'refunded' | 'pending';

export type BillingHistoryInsert = Omit<BillingHistoryRow, 'id' | 'created_at'>;
export type BillingHistoryUpdate = Partial<Omit<BillingHistoryRow, 'id' | 'created_at'>> & { id: string };

export type OnboardingStatus = 'pending' | 'in_progress' | 'completed';
export type MetricPeriod = 'daily' | 'weekly' | 'monthly';
export type CallType = 'inbound' | 'outbound' | 'ai';
export type CallStatus = 'completed' | 'missed' | 'voicemail' | 'transferred' | 'failed';
export type AgentType = 'receptionist' | 'scheduler' | 'faq' | 'transfer' | 'voicemail';
export type AgentStatus = 'active' | 'paused' | 'inactive';
export type ReportFrequency = 'daily' | 'weekly' | 'monthly';
export type PhoneStatus = 'active' | 'suspended' | 'released';
export type PhoneServiceStatus = 'active' | 'inactive' | 'error';

// ─── Table Row Types ───────────────────────────────

export interface CustomerRow {
  id: string;
  email: string;
  business_name: string;
  owner_name: string;
  phone: string;
  industry: string;
  plan: PlanType;
  status: CustomerStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  onboarding_status: OnboardingStatus;
  created_at: string;
  updated_at: string;
}

export interface BusinessMetricsRow {
  id: string;
  customer_id: string;
  total_calls: number;
  total_sms: number;
  total_revenue: number;
  ai_accuracy: number;
  active_agents: number;
  satisfaction_score: number;
  period: MetricPeriod;
  created_at: string;
}

export interface CallRecordRow {
  id: string;
  customer_id: string;
  caller: string;
  name: string;
  type: CallType;
  duration: number;
  status: CallStatus;
  revenue: number;
  intent: string;
  notes: string;
  created_at: string;
}

export interface AiAgentRow {
  id: string;
  customer_id: string;
  name: string;
  type: AgentType;
  voice_id: string;
  voice_settings: Record<string, unknown>;
  config: Record<string, unknown>;
  status: AgentStatus;
  calls_handled: number;
  created_at: string;
  updated_at: string;
}

export interface ReportRow {
  id: string;
  customer_id: string;
  business_name: string;
  frequency: ReportFrequency;
  file_path: string;
  storage_url: string;
  size_bytes: number;
  generated_at: string;
}

export interface CustomerPhoneRow {
  id: string;
  customer_id: string;
  phone_number: string;
  formatted_number: string;
  capabilities: Record<string, unknown>;
  monthly_cost: number;
  provisioned_at: string | null;
  status: PhoneStatus;
  created_at: string;
}

export interface PhoneServiceRow {
  id: string;
  customer_id: string;
  service_name: string;
  status: PhoneServiceStatus;
  configured_at: string | null;
  config: Record<string, unknown>;
  created_at: string;
}

export interface CallerProfileRow {
  phone: string;
  name: string;
  business: string;
  previous_calls: number;
  last_contact: string | null;
  preferences: Record<string, unknown>;
  embedding: number[] | null;
  updated_at: string;
  created_at: string;
}

export interface FaqRow {
  id: string;
  customer_id: string;
  question: string;
  answer: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceRow {
  id: string;
  customer_id: string;
  name: string;
  description: string;
  duration: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HarnessLearningRow {
  id: string;
  customer_id: string | null;
  type: string;
  hypothesis: string;
  solution: string;
  test_result: string;
  deployment: Record<string, unknown>;
  cycle: number;
  created_at: string;
}

// ─── Insert Types (Omit auto-generated fields) ────

export type CustomerInsert = Omit<CustomerRow, 'id' | 'created_at' | 'updated_at'>;
export type BusinessMetricsInsert = Omit<BusinessMetricsRow, 'id' | 'created_at'>;
export type CallRecordInsert = Omit<CallRecordRow, 'id' | 'created_at'>;
export type AiAgentInsert = Omit<AiAgentRow, 'id' | 'created_at' | 'updated_at'>;
export type ReportInsert = Omit<ReportRow, 'id' | 'generated_at'>;
export type CustomerPhoneInsert = Omit<CustomerPhoneRow, 'id' | 'created_at'>;
export type PhoneServiceInsert = Omit<PhoneServiceRow, 'id' | 'created_at'>;
export type CallerProfileInsert = Omit<CallerProfileRow, 'created_at' | 'updated_at'>;
export type FaqInsert = Omit<FaqRow, 'id' | 'created_at' | 'updated_at'>;
export type ServiceInsert = Omit<ServiceRow, 'id' | 'created_at' | 'updated_at'>;
export type HarnessLearningInsert = Omit<HarnessLearningRow, 'id' | 'created_at'>;

// ─── Update Types (Partial with required id) ──────

export type CustomerUpdate = Partial<Omit<CustomerRow, 'id'>> & { id: string };
export type BusinessMetricsUpdate = Partial<Omit<BusinessMetricsRow, 'id'>> & { id: string };
export type CallRecordUpdate = Partial<Omit<CallRecordRow, 'id'>> & { id: string };
export type AiAgentUpdate = Partial<Omit<AiAgentRow, 'id'>> & { id: string };
export type FaqUpdate = Partial<Omit<FaqRow, 'id'>> & { id: string };
export type ServiceUpdate = Partial<Omit<ServiceRow, 'id'>> & { id: string };

// ─── Database Schema Map ───────────────────────────

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: CustomerRow;
        Insert: CustomerInsert;
        Update: Partial<CustomerRow>;
      };
      business_metrics: {
        Row: BusinessMetricsRow;
        Insert: BusinessMetricsInsert;
        Update: Partial<BusinessMetricsRow>;
      };
      call_records: {
        Row: CallRecordRow;
        Insert: CallRecordInsert;
        Update: Partial<CallRecordRow>;
      };
      ai_agents: {
        Row: AiAgentRow;
        Insert: AiAgentInsert;
        Update: Partial<AiAgentRow>;
      };
      reports: {
        Row: ReportRow;
        Insert: ReportInsert;
        Update: Partial<ReportRow>;
      };
      customer_phones: {
        Row: CustomerPhoneRow;
        Insert: CustomerPhoneInsert;
        Update: Partial<CustomerPhoneRow>;
      };
      phone_services: {
        Row: PhoneServiceRow;
        Insert: PhoneServiceInsert;
        Update: Partial<PhoneServiceRow>;
      };
      caller_profiles: {
        Row: CallerProfileRow;
        Insert: CallerProfileInsert;
        Update: Partial<CallerProfileRow>;
      };
      faqs: {
        Row: FaqRow;
        Insert: FaqInsert;
        Update: Partial<FaqRow>;
      };
      services: {
        Row: ServiceRow;
        Insert: ServiceInsert;
        Update: Partial<ServiceRow>;
      };
      harness_learnings: {
        Row: HarnessLearningRow;
        Insert: HarnessLearningInsert;
        Update: Partial<HarnessLearningRow>;
      };
    };
    Functions: Record<string, unknown>;
    Enums: Record<string, unknown>;
  };
}
