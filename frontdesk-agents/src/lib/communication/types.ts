// Communication Department Types
// Voice and SMS Integration Services

export interface CallStatus {
  callId?: string;
  sid?: string;
  status: 'initiated' | 'ringing' | 'answered' | 'completed' | 'busy' | 'failed' | 'canceled';
  duration: number;
  direction?: 'inbound' | 'outbound';
  from?: string;
  to?: string;
  startTime?: string;
  endTime?: string;
  transcript?: TranscriptSegment[];
  recordingUrl?: string;
}

export interface VoiceResponse {
  twiml: string;
  status: string;
}

export interface PhoneNumber {
  type: 'mobile' | 'landline' | 'voip';
  number: string;
  formatted?: string;
}

export interface CallConfig {
  model?: 'base' | 'enhanced';
  voice?: string;
  voiceSettings?: {
    stability?: number;
    similarityBoost?: number;
    speed?: number;
  };
  maxDuration?: number;
  temperature?: number;
  language?: string;
  industry?: 'real-estate' | 'legal' | 'medical' | 'default';
}

export interface TranscriptSegment {
  role: 'human' | 'assistant';
  content: string;
  start: number;
  end: number;
}

export interface CommunicationMetrics {
  totalCalls: number;
  completedCalls: number;
  missedCalls: number;
  averageDuration: number;
  totalMinutes: number;
  successRate: number;
}

export interface Campaign {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  totalCalls: number;
  completedCalls: number;
  failedCalls: number;
  cost: number;
  createdAt: string;
}

export interface SMSMessage {
  sid: string;
  to: string;
  from: string;
  body: string;
  status: 'queued' | 'sent' | 'delivered' | 'failed';
  dateCreated: string;
}

export interface PhoneNumberResource {
  phoneNumber: string;
  region: string;
  type: 'local' | 'tollfree';
  capabilities: ('sms' | 'voice' | 'mms')[];
}