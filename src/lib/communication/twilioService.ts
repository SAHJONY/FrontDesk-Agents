// Twilio Voice Service for FRONTDESK AGENTS
// Communication Department Integration

import twilio from 'twilio';
import type { VoiceResponse, CallStatus, PhoneNumber } from './types';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export class TwilioService {
  private static instance: TwilioService;
  
  private constructor() {}

  public static getInstance(): TwilioService {
    if (!TwilioService.instance) {
      TwilioService.instance = new TwilioService();
    }
    return TwilioService.instance;
  }

  // Make an outbound call
  async makeCall(to: string, from: string, url: string): Promise<string> {
    try {
      const call = await client.calls.create({
        to: to,
        from: from,
        url,
        statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/twilio/callback`,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        statusCallbackMethod: 'POST'
      });
      return call.sid;
    } catch (error) {
      console.error('Twilio makeCall error:', error);
      throw error;
    }
  }

  // Get call status
  async getCallStatus(callSid: string): Promise<CallStatus> {
    try {
      const call = await client.calls(callSid).fetch();
      return {
        sid: call.sid,
        status: call.status as any,
        duration: typeof call.duration === 'number' ? call.duration : 0,
        direction: call.direction as any,
        from: call.from || '',
        to: call.to || '',
        startTime: call.startTime?.toISOString(),
        endTime: call.endTime?.toISOString()
      };
    } catch (error) {
      console.error('Twilio getCallStatus error:', error);
      throw error;
    }
  }

  // List recent calls
  async listCalls(limit: number = 20): Promise<any[]> {
    try {
      const calls = await client.calls.list({ limit });
      return calls.map(call => ({
        sid: call.sid,
        status: call.status,
        duration: typeof call.duration === 'number' ? call.duration : 0,
        direction: call.direction,
        from: call.from || '',
        to: call.to || '',
        startTime: call.startTime?.toISOString(),
        endTime: call.endTime?.toISOString()
      }));
    } catch (error) {
      console.error('Twilio listCalls error:', error);
      throw error;
    }
  }

  // Get call recordings
  async getRecordings(callSid: string): Promise<any[]> {
    try {
      const recordings = await client.recordings.list({ callSid });
      return recordings;
    } catch (error) {
      console.error('Twilio getRecordings error:', error);
      throw error;
    }
  }

  // Send SMS
  async sendSMS(to: string, from: string, body: string): Promise<string> {
    try {
      const message = await client.messages.create({
        to: to,
        from: from,
        body
      });
      return message.sid;
    } catch (error) {
      console.error('Twilio sendSMS error:', error);
      throw error;
    }
  }

  // Get available phone numbers
  async getAvailableNumbers(country: string = 'US', type: 'local' | 'tollfree' = 'local'): Promise<any[]> {
    try {
      if (type === 'local') {
        const numbers = await client.availablePhoneNumbers(country).local.list({ limit: 10 });
        return numbers;
      } else {
        const numbers = await client.availablePhoneNumbers(country).tollFree.list({ limit: 10 });
        return numbers;
      }
    } catch (error) {
      console.error('Twilio getAvailableNumbers error:', error);
      throw error;
    }
  }

  // Purchase phone number
  async purchaseNumber(phoneNumber: string): Promise<any> {
    try {
      const purchased = await client.incomingPhoneNumbers.create({
        phoneNumber
      });
      return purchased;
    } catch (error) {
      console.error('Twilio purchaseNumber error:', error);
      throw error;
    }
  }

  // Generate TwiML response for inbound calls
  generateVoiceResponse(sayText: string, digits?: string): VoiceResponse {
    const twiml = new twilio.twiml.VoiceResponse();
    
    twiml.say({ voice: 'Polly.Joanna' }, sayText);
    
    if (digits) {
      twiml.gather({
        numDigits: 1,
        timeout: 10
      }).say('Press 1 for sales, 2 for support, or 3 for general inquiries.');
    }
    
    twiml.record({
      action: '/api/twilio/record',
      method: 'POST',
      maxLength: 30,
      playBeep: true
    });

    twiml.redirect('/api/twilio/voice');

    return {
      twiml: twiml.toString(),
      status: 'ready'
    };
  }

  // Validate phone number format
  validatePhoneNumber(phoneNumber: string): boolean {
    const regex = /^\\+?[1-9]\\d{1,14}$/;
    return regex.test(phoneNumber);
  }

  // Format phone number for Twilio
  formatPhoneNumber(phoneNumber: string): string {
    const cleaned = phoneNumber.replace(/\\D/g, '');
    return cleaned.startsWith('1') ? `+${cleaned}` : `+1${cleaned}`;
  }
}

export const twilioService = TwilioService.getInstance();