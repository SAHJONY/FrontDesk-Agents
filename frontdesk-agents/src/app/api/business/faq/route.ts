// FAQ Management API Route
// GET/POST/PUT/DELETE /api/business/faq

import { NextRequest, NextResponse } from 'next/server'
import { requireCustomerAuth } from '@/lib/customer-auth'
export const dynamic = 'force-dynamic'


// In-memory FAQ storage (replace with database in production)
const faqStore = new Map<string, Array<{id: string; question: string; answer: string; category: string; enabled: boolean}>>()

export async function GET() {
  try {
    const { authorized, session } = await requireCustomerAuth()
    if (!authorized || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const faqs = faqStore.get(session.customerId) || getDefaultFaqs()
    return NextResponse.json({ faqs })
  } catch (error) {
    console.error('FAQ GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { authorized, session } = await requireCustomerAuth()
    if (!authorized || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { question, answer, category } = await request.json()
    if (!question || !answer) {
      return NextResponse.json({ error: 'Question and answer are required' }, { status: 400 })
    }

    const customerFaqs = faqStore.get(session.customerId) || []
    const newFaq = {
      id: crypto.randomUUID(),
      question,
      answer,
      category: category || 'General',
      enabled: true
    }
    customerFaqs.push(newFaq)
    faqStore.set(session.customerId, customerFaqs)

    return NextResponse.json({ success: true, faq: newFaq })
  } catch (error) {
    console.error('FAQ POST error:', error)
    return NextResponse.json({ error: 'Failed to create FAQ' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { authorized, session } = await requireCustomerAuth()
    if (!authorized || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, question, answer, category, enabled } = await request.json()
    const customerFaqs = faqStore.get(session.customerId) || []
    const index = customerFaqs.findIndex((f: any) => f.id === id)

    if (index === -1) {
      return NextResponse.json({ error: 'FAQ not found' }, { status: 404 })
    }

    customerFaqs[index] = { ...customerFaqs[index], question, answer, category, enabled }
    faqStore.set(session.customerId, customerFaqs)

    return NextResponse.json({ success: true, faq: customerFaqs[index] })
  } catch (error) {
    console.error('FAQ PUT error:', error)
    return NextResponse.json({ error: 'Failed to update FAQ' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { authorized, session } = await requireCustomerAuth()
    if (!authorized || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'FAQ ID is required' }, { status: 400 })
    }

    const customerFaqs = faqStore.get(session.customerId) || []
    const filtered = customerFaqs.filter((f: any) => f.id !== id)
    faqStore.set(session.customerId, filtered)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('FAQ DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete FAQ' }, { status: 500 })
  }
}

function getDefaultFaqs() {
  return [
    { id: '1', question: 'What are your business hours?', answer: 'We are open Monday through Friday, 9 AM to 5 PM EST.', category: 'General', enabled: true },
    { id: '2', question: 'How can I schedule an appointment?', answer: 'You can schedule an appointment by calling us or through our online booking system.', category: 'Scheduling', enabled: true },
    { id: '3', question: 'What services do you offer?', answer: 'We offer a wide range of professional services. Please visit our services page for more details.', category: 'Services', enabled: true },
  ]
}