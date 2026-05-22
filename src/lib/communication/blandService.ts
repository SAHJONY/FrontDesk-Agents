// Bland.ai Service for FRONTDESK AGENTS
// AI-Powered Voice Agent Integration

import type { CallConfig, CallStatus, TranscriptSegment } from './types';

export class BlandService {
  private static instance: BlandService;
  private apiKey: string;
  private baseUrl: string;

  private constructor() {
    this.apiKey = process.env.BLAND_API_KEY || '';
    this.baseUrl = 'https://api.bland.ai/v1';
  }

  public static getInstance(): BlandService {
    if (!BlandService.instance) {
      BlandService.instance = new BlandService();
    }
    return BlandService.instance;
  }

  // Make an AI-powered call via API
  async makeAICall(
    phoneNumber: string,
    task: string,
    config?: CallConfig
  ): Promise<{ callId: string; status: string }> {
    try {
      if (!this.apiKey) {
        throw new Error('BLAND_API_KEY is not configured');
      }

      const response = await fetch(`${this.baseUrl}/calls`, {
        method: 'POST',
        headers: {
          'Authorization': `${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          task: task,
          model: config?.model || 'enhanced',
          voice: config?.voice || 'rachel',
          voice_settings: config?.voiceSettings || {
            stability: 0.5,
            similarity_boost: 0.75,
            speed: 1.0
          },
          max_duration: config?.maxDuration || 300,
          temperature: config?.temperature || 0.7,
          language: config?.language || 'en'
        })
      });

      if (!response.ok) {
        throw new Error(`Bland.ai API error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        callId: data.id || data.call_id,
        status: 'initiated'
      };
    } catch (error) {
      console.error('Bland.ai makeAICall error:', error);
      throw error;
    }
  }

  // Get call status and details
  async getCallStatus(callId: string): Promise<CallStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/calls/${callId}`, {
        method: 'GET',
        headers: {
          'Authorization': `${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Bland.ai API error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        callId: data.id,
        status: data.status,
        duration: data.duration || 0,
        startTime: data.start_time,
        endTime: data.end_time,
        transcript: data.transcript,
        recordingUrl: data.recording_url
      };
    } catch (error) {
      console.error('Bland.ai getCallStatus error:', error);
      throw error;
    }
  }

  // Get call transcript
  async getTranscript(callId: string): Promise<TranscriptSegment[]> {
    try {
      const response = await fetch(`${this.baseUrl}/calls/${callId}/transcript`, {
        method: 'GET',
        headers: {
          'Authorization': `${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Bland.ai API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.segments || [];
    } catch (error) {
      console.error('Bland.ai getTranscript error:', error);
      throw error;
    }
  }

  // List recent calls
  async listCalls(limit: number = 50): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/calls?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Authorization': `${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Bland.ai API error: ${response.statusText}`);
      }

      const data = await response.json();
      return (data.calls || []).map((call: any) => ({
        id: call.id,
        phoneNumber: call.phone_number,
        status: call.status,
        duration: call.duration,
        startTime: call.start_time,
        endTime: call.end_time,
        task: call.task
      }));
    } catch (error) {
      console.error('Bland.ai listCalls error:', error);
      throw error;
    }
  }

  // End an active call
  async endCall(callId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/calls/${callId}/end`, {
        method: 'POST',
        headers: {
          'Authorization': `${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Bland.ai endCall error:', error);
      return false;
    }
  }

  // Check API health
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `${this.apiKey}`
        }
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.status === 'ok';
    } catch (error) {
      console.error('Bland.ai health check failed:', error);
      return false;
    }
  }

  // Get available voices
  async getAvailableVoices(): Promise<string[]> {
    return [
      'rachel', 'josh', 'sam', 'beth', 'sarah', 
      'matt', 'emma', 'david', 'grace', 'james',
      'lily', 'michael', 'olivia', 'william', 'ava'
    ];
  }

  // Get call recordings
  async getRecording(callId: string): Promise<string | null> {
    try {
      const call = await this.getCallStatus(callId);
      return call.recordingUrl || null;
    } catch (error) {
      console.error('Bland.ai getRecording error:', error);
      return null;
    }
  }
}

export const blandService = BlandService.getInstance();