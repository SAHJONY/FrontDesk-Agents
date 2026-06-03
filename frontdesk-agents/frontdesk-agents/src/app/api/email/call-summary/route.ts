import { NextRequest, NextResponse } from 'next/server';
import { sendCallSummaryEmail } from '@/lib/email';

interface CallSummaryRequest {
  callId: string;
  phoneNumber: string;
  duration: number;
  status: 'completed' | 'failed' | 'missed';
  transcript?: string;
  summary?: string;
  to: string;
  customerName?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CallSummaryRequest = await request.json();
    
    const { callId, phoneNumber, duration, status, transcript, summary, to, customerName } = body;
    
    // Validate required fields
    if (!callId || !phoneNumber || !status || !to) {
      return NextResponse.json(
        { error: 'Missing required fields: callId, phoneNumber, status, to' },
        { status: 400 }
      );
    }
    
    // Validate email address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }
    
    // Validate status
    const validStatuses = ['completed', 'failed', 'missed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: completed, failed, missed' },
        { status: 400 }
      );
    }
    
    // Send the email
    const result = await sendCallSummaryEmail({
      to,
      callId,
      phoneNumber,
      duration,
      status,
      transcript,
      summary,
      customerName,
    });
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Call summary email sent successfully',
        messageId: result.messageId,
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending call summary email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    endpoint: 'POST /api/email/call-summary',
    description: 'Send a call summary email via Resend or SMTP',
    body: {
      to: 'recipient@example.com (required)',
      callId: 'string (required)',
      phoneNumber: 'string (required)',
      duration: 'number in seconds (optional)',
      status: "'completed' | 'failed' | 'missed' (required)",
      transcript: 'string (optional)',
      summary: 'string (optional)',
      customerName: 'string (optional)',
    },
  });
}