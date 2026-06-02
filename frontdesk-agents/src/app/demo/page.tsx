'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

// ─── SVG Icons ──────────────────────────────────────────────────────────────

const BotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="16" height="16" x="4" y="4" rx="2" /><path d="M9 1v3M15 1v3M9 13l3 3 3-3M12 16V8" />
  </svg>
)
const MicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z" /><path d="M19 10v2a7 7 0 01-14 0v-2" /><line x1="12" y1="19" x2="12" y2="22" />
  </svg>
)
const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
)
const PhoneCallIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
  </svg>
)
const PhoneIncomingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 2 16 8 22 8" /><line x1="22" x2="11" y1="2" y2="13" /><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
  </svg>
)
const PhoneOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.68 13.31a16 16 0 003.41 2.6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91" /><line x1="23" y1="1" x2="1" y2="23" />
  </svg>
)
const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
  </svg>
)
const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
)
const MessageSquareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
)
const CpuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2" />
  </svg>
)
const ZapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)
const VolumeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 010 7.07" /><path d="M19.07 4.93a10 10 0 010 14.14" />
  </svg>
)
const VolumeXIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
  </svg>
)
const SpeakerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 010 14.14" /><path d="M15.54 8.46a5 5 0 010 7.07" />
  </svg>
)
const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
)
const ActivityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
)
const MusicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
)
const UserCheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="8.5" cy="7" r="4" /><polyline points="17 11 19 13 23 9" /></svg>
)

// ─── TYPES ──────────────────────────────────────────────────────────────────

type ScenarioId = 'general' | 'healthcare' | 'dental' | 'realestate' | 'hvac' | 'legal'
type CallState = 'idle' | 'ringing' | 'connected' | 'on-hold' | 'transferring' | 'voicemail' | 'ended'

interface ScenarioConfig {
  id: ScenarioId
  label: string
  icon: string
  greeting: string
  description: string
}

// ─── SCENARIOS ──────────────────────────────────────────────────────────────

const SCENARIOS: ScenarioConfig[] = [
  { id: 'general', label: 'General', icon: '🤖', greeting: 'Hi! I\'m FrontDesk Agents AI. Try asking me about my features, pricing, or how I can help your business. I respond just like a real phone call — naturally and conversationally.', description: 'Explore all features and capabilities' },
  { id: 'healthcare', label: 'Healthcare', icon: '🏥', greeting: 'Thank you for calling Northside Medical Center. I\'m your AI receptionist. How can I help you today? You can schedule an appointment, request a prescription refill, or get connected to a specific department.', description: 'Patient scheduling & triage simulation' },
  { id: 'dental', label: 'Dental', icon: '🦷', greeting: 'Welcome to BrightSmile Dental. This is your AI receptionist speaking. Are you calling about a new patient appointment, an existing booking, or are you experiencing a dental emergency?', description: 'Dental office call handling' },
  { id: 'realestate', label: 'Real Estate', icon: '🏠', greeting: 'You\'ve reached Park Realty Group. I\'m your AI assistant. Are you looking to buy, sell, or inquire about a specific property? I can schedule viewings and connect you with an agent.', description: 'Property inquiry & showing scheduling' },
  { id: 'hvac', label: 'HVAC', icon: '🔧', greeting: 'Wilson HVAC Services — this is your AI dispatcher. Are you calling about an emergency service, a routine maintenance appointment, or a new installation estimate? If this is an emergency, I\'ll prioritize you immediately.', description: 'Emergency dispatch & service scheduling' },
  { id: 'legal', label: 'Legal', icon: '⚖️', greeting: 'You\'ve reached Rodriguez & Associates. I\'m your AI intake specialist. Are you a new client seeking a consultation, an existing client checking case status, or calling about something else?', description: 'Client intake & case inquiry' },
]

// ─── DEMO RESPONSES ─────────────────────────────────────────────────────────

const SCENARIO_RESPONSES: Record<ScenarioId, Record<string, string>> = {
  general: {
    hello: 'Hello! Welcome to FrontDesk Agents AI. I\'m your AI receptionist. How can I help you today? You can ask me about appointment scheduling, pricing, features, or how we handle calls for your industry.',
    hi: 'Hi there! I\'m FrontDesk Agents AI, your intelligent receptionist. I answer calls, book appointments, qualify leads, and speak 200+ languages with a natural human-like voice. What would you like to explore?',
    appointment: 'Absolutely! I integrate with Google Calendar, Outlook, and Calendly to handle booking, rescheduling, and cancellations automatically. I check availability, send confirmations via SMS, and send reminder calls. Want to try booking a demo?',
    schedule: 'Scheduling is my specialty! I handle complex multi-provider calendars, recurring appointments, same-day bookings, and waitlist management. I sync two-way with your calendar and never double-book. Would you like me to schedule a call with your team?',
    price: 'Great question! Plans are transparent: Starter at $99/month (500 calls), Growth at $149/month (2,000 calls — most popular), and Enterprise with custom pricing. No hidden fees, no revenue share.',
    pricing: 'Pricing is straightforward: Starter ($99/mo — 500 calls), Growth ($149/mo — 2,000 calls), Enterprise (custom). All plans include a 14-day free trial with no credit card required.',
    help: 'I can help with: appointment scheduling, answering FAQs, call routing, message taking, lead qualification, and more. I work 24/7/365, handle unlimited simultaneous calls, and speak 200+ languages.',
    language: 'I support over 200 languages with native-level fluency! I detect languages in real-time and can switch mid-conversation. I adapt to regional dialects and maintain your brand voice across every language.',
    feature: 'Key features include: neural AI call answering, smart appointment booking, real-time lead qualification, 200+ language support, intelligent call routing, analytics dashboard, and auto-transcriptions.',
    voice: 'My voice uses advanced neural text-to-speech with natural prosody, emotion, and pacing. Customers often can\'t tell they\'re talking to AI. I can match your brand\'s tone — professional, friendly, warm, or formal.',
    trial: 'The free trial gives you 14 days of full access. No credit card needed. We help you set up your AI receptionist, train it on your business info, and go live. Cancel anytime if it\'s not perfect.',
    call: 'I handle multiple calls simultaneously with no hold music or voicemail. I answer naturally, qualify leads in real-time, route to human staff with full context, and work 24/7/365.',
    business: 'FrontDesk Agents AI is perfect for healthcare, legal, dental, real estate, HVAC, medical spas, automotive, insurance, and more. I\'m pre-trained on industry-specific terminology and compliance.',
    integration: 'I integrate with Google Calendar, Outlook, Calendly, HubSpot, Salesforce, Twilio, Slack, Zapier, Stripe, Square, and many more. If a tool has an API, I can connect to it.',
    security: 'Enterprise-grade security: end-to-end encryption, SOC 2 compliance, HIPAA-ready infrastructure. You own all your data — call recordings, transcripts, and customer information. No lock-in contracts.',
    transfer: 'Of course! I\'ll transfer you to a human agent right away. Just one moment while I connect you with the right person and share the context of our conversation so you don\'t have to repeat yourself.',
    hold: 'No problem! I\'ll put you on a brief hold while I look into that for you. In the meantime, you can also visit our website for more information.',
    voicemail: 'The team is currently unavailable. I can take a detailed message and ensure it reaches the right person immediately. May I take your name, number, and a brief message?',
    demo: 'I\'d love to show you more! You can book a personalized demo with our team, or continue exploring here. I can walk you through any specific feature you\'re interested in.',
    default: 'That\'s a great question! As an AI receptionist, I handle calls in 200+ languages, book appointments, qualify leads, and work 24/7. I integrate with your existing tools and go live in minutes. What aspect would you like to explore?',
  },

  healthcare: {
    hello: 'Hello! Thank you for calling Northside Medical Center. I\'m your AI receptionist. How can I help you today? Are you looking to schedule an appointment, refill a prescription, or speak with a specific department?',
    hi: 'Hi there! Welcome to Northside Medical Center. I can help you book appointments, request prescription refills, check lab results, or connect you to the right department. How can I assist you today?',
    appointment: 'I can certainly help with that! Our available slots this week include Tuesday at 2pm, Wednesday at 10am and 3pm, and Thursday at 11am and 4pm. Would any of these work for you? I can also check next week if needed.',
    schedule: 'Let me check our provider schedules. We have Dr. Patel available on Tuesday and Thursday, and Dr. Nguyen on Monday, Wednesday, and Friday. What time works best for you? I\'ll send a confirmation via text.',
    price: 'Our consultation fees depend on your insurance plan. We accept most major insurance providers. Could you provide your insurance information so I can verify coverage and estimated copay?',
    help: 'I can help you: schedule appointments, request prescription refills, get lab results, find a specialist, check insurance coverage, get directions, or leave a message for your doctor.',
    emergency: 'If this is a medical emergency, please hang up and dial 911 immediately. For urgent same-day appointments, I can check availability right now. Would you like me to look for an urgent slot?',
    refill: 'I can request a prescription refill for you. Could you please provide the medication name, dosage, and your pharmacy details? I\'ll send the request to your provider for approval.',
    specialist: 'We have several specialists available including cardiology, dermatology, orthopedics, and neurology. Do you have a referral from your primary care provider? I can help schedule a consultation.',
    insurance: 'We accept Medicare, Medicaid, Blue Cross, Aetna, Cigna, UnitedHealthcare, and most major plans. For specific coverage details, I recommend contacting your insurance provider or I can have our billing team reach out.',
    transfer: 'Let me connect you to the right department. Please hold while I transfer you to our scheduling team. I\'ll share your information so you don\'t need to repeat everything.',
    default: 'I\'m your Northside Medical Center AI receptionist. I can help with appointments, prescription refills, finding a specialist, or connecting you to a department. How may I assist you today?',
  },

  dental: {
    hello: 'Welcome to BrightSmile Dental! I\'m your AI receptionist. Are you a new patient looking to schedule, an existing patient checking an appointment, or experiencing a dental concern?',
    hi: 'Hi there! Thanks for calling BrightSmile Dental. I can help you book a cleaning, check on a treatment plan, or connect you with our team if you\'re in pain. What can I help you with?',
    appointment: 'I can help schedule your visit! We have availability this week for cleanings on Wednesday at 10am, Thursday at 2pm, or Friday at 9am and 11am. New patients usually start with a comprehensive exam — would you like that?',
    schedule: 'Let me look at our schedule. Dr. Chen is available for new patient exams on Monday and Thursday. For regular cleanings, we have hygienist slots throughout the week. What works best for you?',
    price: 'A new patient exam with X-rays is typically $150-250 depending on your insurance. We accept most dental insurance plans. We also offer a membership plan for uninsured patients at $299/year.',
    pain: 'I\'m sorry to hear you\'re in discomfort! I can get you in for an emergency exam today if needed. We reserve same-day slots for urgent cases. Can you describe the pain level on a scale of 1-10?',
    emergency: 'For dental emergencies like severe pain, swelling, or a knocked-out tooth, please come in immediately. We\'ll see you right away. Do you need our address or directions to the office?',
    cleaning: 'Regular cleanings are recommended every 6 months. Your last cleaning was about 7 months ago so you\'re due! I can book you for a cleaning and exam — would you prefer a morning or afternoon appointment?',
    insurance: 'We accept Delta Dental, Cigna, MetLife, Aetna, Blue Cross Dental, and most major plans. I can verify your coverage and provide an estimate before your visit. What insurance do you have?',
    transfer: 'Let me connect you to our treatment coordinator who can discuss your treatment plan in detail. One moment please — I\'ll transfer you with full context of our conversation.',
    default: 'At BrightSmile Dental, we offer general dentistry, cleanings, fillings, crowns, whitening, and emergency care. I can help schedule your visit, answer insurance questions, or connect you with our team. How can I help?',
  },

  realestate: {
    hello: 'You\'ve reached Park Realty Group! I\'m your AI assistant. Are you looking to buy a home, sell a property, or inquire about a specific listing? I can schedule viewings and connect you with an agent.',
    hi: 'Hi there! Welcome to Park Realty Group. I can help you browse available properties, schedule showings, get pre-approved, or connect with a specialist agent. How can I assist you today?',
    appointment: 'I\'d be happy to schedule a viewing! The property at 123 Maple Street is available for showings tomorrow at 10am, 1pm, or 4pm. We also have similar properties in the area I can tell you about.',
    schedule: 'Our agents are available for consultations Monday through Saturday. Would you prefer a virtual tour or an in-person visit? I can schedule with our top-rated agent for your area.',
    price: 'The average home in that area ranges from $350,000 to $550,000. I can send you a list of current listings within your budget. Are you pre-approved for a mortgage? I can connect you with a lender.',
    buy: 'Great choice! I can help you find properties based on your preferences — bedrooms, bathrooms, price range, location, and must-have features. Could you tell me more about what you\'re looking for?',
    sell: 'Selling your home? Our agents have a proven track record with an average of 45 days on market and 97% of asking price. I can schedule a free home valuation consultation. When would be convenient?',
    mortgage: 'I can connect you with our trusted lending partners. They offer competitive rates and can help with pre-approval, which makes your offer stronger. Would you like me to arrange a call?',
    viewing: 'I can schedule a viewing! Properties book quickly so I recommend choosing a time soon. Would morning, afternoon, or evening work best for you? I\'ll send confirmation and directions.',
    transfer: 'Let me connect you with a specialized agent for your area. I\'ll share your preferences and requirements so you can jump right into the conversation. One moment please.',
    default: 'At Park Realty Group, we help buyers and sellers with residential and commercial properties. I can search listings, schedule showings, connect you with agents, and answer questions about the process. How can I help?',
  },

  hvac: {
    hello: 'Wilson HVAC Services — this is your AI dispatcher. Are you calling about an emergency service, a routine maintenance appointment, or a new installation estimate? If this is an emergency, I\'ll prioritize you immediately.',
    hi: 'Hi there! Thanks for calling Wilson HVAC. I can dispatch emergency service, schedule routine maintenance, or provide a free estimate for a new system. What brings you in today?',
    appointment: 'I can book a service appointment. Our technicians are available for routine maintenance on Tuesday, Wednesday, and Friday this week. Emergency services are available 24/7 with a 2-hour response time.',
    schedule: 'For routine maintenance, our next available slot is Tuesday morning at 8am or Wednesday afternoon at 1pm. Regular maintenance helps prevent breakdowns and extends your system\'s life.',
    price: 'A standard service call is $89 for diagnosis, which is waived if you proceed with repairs. New AC installation starts at $3,500 depending on unit size and efficiency rating. I can schedule a free estimate.',
    emergency: 'This is an emergency! I\'m dispatching a technician to your location immediately. Our team will arrive within 2 hours. While you wait, please turn off your HVAC system to prevent further damage. Can I confirm your address?',
    ac: 'AC issues are our specialty. Common problems include refrigerant leaks, frozen coils, or capacitor failures. I can send a technician today or schedule a convenient time. Is your AC blowing warm air or not running at all?',
    heating: 'Having heating issues? I can help with furnaces, heat pumps, and boilers. Before the technician arrives, check that your thermostat is set to heat and your air filter isn\'t clogged. When did the issue start?',
    maintenance: 'Great idea! We recommend bi-annual maintenance — once in spring for AC and once in fall for heating. Our maintenance plan is $199/year for two tune-ups with priority scheduling. Would you like to sign up?',
    estimate: 'I can schedule a free estimate for a new system. Our comfort consultants will assess your home, measure your current system, and provide a detailed quote. Available Monday through Saturday.',
    transfer: 'Let me connect you with a senior technician who can walk you through the repair options in detail. I\'ll share your system information and issue description so you don\'t have to repeat yourself.',
    default: 'Wilson HVAC provides heating, cooling, and indoor air quality services for residential and commercial customers. I can dispatch emergency service, schedule maintenance, or set up a free estimate. How can I help?',
  },

  legal: {
    hello: 'You\'ve reached Rodriguez & Associates. I\'m your AI intake specialist. Are you a new client seeking a consultation, an existing client checking case status, or calling about something else?',
    hi: 'Hi there! Welcome to Rodriguez & Associates. I can help you schedule a consultation, check on an existing case, or direct you to the right practice area. How can I assist you today?',
    appointment: 'I can schedule a consultation! We offer initial 30-minute consultations at no charge. Mr. Rodriguez has availability on Tuesday at 2pm, Thursday at 10am, or Friday at 3pm. Would any of these work?',
    schedule: 'Let me check our calendar. We have consultation slots available this week on Tuesday (2pm, 4pm), Thursday (10am, 1pm), and Friday (11am, 3pm). Initial consultations are complimentary.',
    price: 'Our initial consultation is free with no obligation. After that, our fee structure depends on the case type. For personal injury, we work on contingency — you pay nothing unless we win. For other matters, hourly or flat fee options are available.',
    case: 'If you\'re an existing client checking on your case status, I can look up your file. Could you please provide your full name and date of birth so I can access your information?',
    injury: 'If you\'ve been injured in an accident, I can help. We handle personal injury cases including car accidents, slip and falls, and medical malpractice. Our consultations are free and we work on contingency.',
    consultation: 'During your free consultation, you\'ll meet with Mr. Rodriguez to discuss your situation, learn your legal options, and get answers to your questions. There\'s absolutely no obligation to proceed.',
    area: 'We practice in several areas: personal injury, family law, criminal defense, real estate law, and business litigation. Which area best describes your legal needs? I can direct you to the right specialist.',
    urgency: 'If this is urgent, I can prioritize your call. Please briefly describe your situation so I can ensure you speak with the right attorney as quickly as possible.',
    transfer: 'Let me transfer you to our legal intake team who can begin gathering details about your case. I\'ll make sure they have the context of our conversation so you can move forward efficiently.',
    default: 'Rodriguez & Associates provides legal services in personal injury, family law, criminal defense, real estate, and business litigation. I can schedule a free consultation or direct you to the right practice area. How can I help?',
  },
}

// ─── SUGGESTED PROMPTS ──────────────────────────────────────────────────────

const SUGGESTED_PROMPTS: { text: string; icon: string; category: string; scenarios?: ScenarioId[] }[] = [
  // Booking & Scheduling
  { text: 'Can you book an appointment?', icon: '📅', category: 'Scheduling' },
  { text: 'What times are available?', icon: '🕐', category: 'Scheduling' },
  { text: 'Reschedule my appointment', icon: '🔄', category: 'Scheduling' },
  // Pricing
  { text: 'What are your prices?', icon: '💰', category: 'Pricing' },
  { text: 'Tell me about the free trial', icon: '🎁', category: 'Pricing' },
  // Features
  { text: 'What languages do you support?', icon: '🌍', category: 'Features' },
  { text: 'How does the voice work?', icon: '🎤', category: 'Features' },
  { text: 'What integrations do you have?', icon: '🔗', category: 'Features' },
  { text: 'Tell me about your features', icon: '⚙️', category: 'Features' },
  // Industry-specific
  { text: 'Healthcare scenario', icon: '🏥', category: 'Industries', scenarios: ['general', 'healthcare'] },
  { text: 'Dental emergency', icon: '🦷', category: 'Industries', scenarios: ['general', 'dental'] },
  { text: 'Real estate inquiry', icon: '🏠', category: 'Industries', scenarios: ['general', 'realestate'] },
  { text: 'HVAC emergency call', icon: '🔧', category: 'Industries', scenarios: ['general', 'hvac'] },
  { text: 'Legal consultation', icon: '⚖️', category: 'Industries', scenarios: ['general', 'legal'] },
  // Call actions
  { text: 'Transfer me to a human', icon: '👤', category: 'Actions' },
  { text: 'Put me on hold', icon: '🎵', category: 'Actions' },
  { text: 'Leave a voicemail', icon: '📞', category: 'Actions' },
]

// ─── FEATURE HIGHLIGHTS ────────────────────────────────────────────────────

const DEMO_HIGHLIGHTS = [
  { icon: PhoneCallIcon, title: 'Natural Conversation', desc: 'Our neural voice engine delivers human-like responses with emotion and pacing. Customers can\'t tell they\'re talking to AI.' },
  { icon: GlobeIcon, title: '200+ Languages', desc: 'Real-time language detection and switching. Speaks your customer\'s language fluently, with regional dialect adaptation.' },
  { icon: ClockIcon, title: '24/7 Availability', desc: 'Handles unlimited simultaneous calls. Never misses a call with no hold music, no voicemail, no busy signals.' },
  { icon: CpuIcon, title: 'Sub-500ms Response', desc: 'Real-time processing with streaming audio. Natural conversation flow with no awkward pauses or delays.' },
  { icon: ZapIcon, title: 'Smart Intent Detection', desc: 'Real-time lead scoring, sentiment analysis, and intent detection during every conversation.' },
  { icon: MessageSquareIcon, title: 'Auto Transcriptions', desc: 'Every call is transcribed, summarized, and stored. Full searchable history with sentiment analysis trends.' },
]

const HOW_IT_WORKS = [
  { step: 1, title: 'Connect Your Number', desc: 'Port your existing number or get a new one. Setup wizard guides you through configuration in minutes.' },
  { step: 2, title: 'Train Your AI', desc: 'Customize with your business info, hours, FAQs, and brand voice. No technical skills needed.' },
  { step: 3, title: 'Go Live', desc: 'Your AI receptionist starts taking calls immediately. Monitor and optimize from your dashboard.' },
]

// ─── SUBCOMPONENTS ──────────────────────────────────────────────────────────

function AudioWaveform({ isActive, isUser }: { isActive: boolean; isUser?: boolean }) {
  return (
    <div className={`flex items-center gap-[2px] h-12 ${isUser ? 'opacity-50' : ''}`}>
      {Array.from({ length: 32 }).map((_, i) => {
        const heights = isUser ? [4, 8, 6, 10, 4] : [Math.random() * 16 + 4, Math.random() * 32 + 8, Math.random() * 20 + 6, Math.random() * 40 + 4, Math.random() * 16 + 4]
        return (
          <motion.div
            key={i}
            className={`w-[3px] rounded-full ${
              isUser
                ? 'bg-aurora-cyan/40'
                : isActive
                  ? 'bg-gradient-to-t from-aurora-cyan/60 to-aurora-cyan'
                  : 'bg-white/10'
            }`}
            animate={isActive ? { height: heights, opacity: [0.6, 1, 0.5, 0.8, 0.6] } : { height: 4, opacity: 0.2 }}
            transition={{ duration: 0.4 + Math.random() * 0.3, repeat: Infinity, delay: i * 0.03, ease: 'easeInOut' }}
          />
        )
      })}
    </div>
  )
}

function CallIndicator({ state }: { state: CallState }) {
  const indicators: Record<CallState, { label: string; color: string; pulse: boolean }> = {
    idle: { label: 'Ready', color: 'bg-gray-400', pulse: false },
    ringing: { label: 'Ringing...', color: 'bg-amber-400', pulse: true },
    connected: { label: 'Connected', color: 'bg-green-400', pulse: true },
    'on-hold': { label: 'On Hold', color: 'bg-amber-400', pulse: true },
    transferring: { label: 'Transferring...', color: 'bg-amber-400', pulse: true },
    voicemail: { label: 'Recording', color: 'bg-amber-400', pulse: true },
    ended: { label: 'Call Ended', color: 'bg-gray-400', pulse: false },
  }
  const info = indicators[state]
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${info.color} ${info.pulse ? 'animate-pulse' : ''}`} />
      <span className="text-[10px] text-gray-400 font-mono">{info.label}</span>
    </div>
  )
}

function TypingDots() {
  return (
    <div className="flex gap-1">
      {[0, 150, 300].map(delay => (
        <span key={delay} className="w-1.5 h-1.5 rounded-full bg-aurora-cyan/60 animate-bounce" style={{ animationDelay: `${delay}ms` }} />
      ))}
    </div>
  )
}

// ─── MAIN PAGE ──────────────────────────────────────────────────────────────

export default function DemoPage() {
  const [scrolled, setScrolled] = useState(false)
  const [message, setMessage] = useState('')
  const [conversation, setConversation] = useState<{ role: 'ai' | 'user'; text: string }[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [callState, setCallState] = useState<CallState>('idle')
  const [callDuration, setCallDuration] = useState(0)
  const [mode, setMode] = useState<'chat' | 'phone'>('chat')
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(false)
  const [scenario, setScenario] = useState<ScenarioId>('general')
  const [showScenarioPicker, setShowScenarioPicker] = useState(false)
  const [sentiment, setSentiment] = useState(75)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const ringingRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentScenario = SCENARIOS.find(s => s.id === scenario)!

  // Initialize greeting on mount and scenario change
  useEffect(() => {
    setConversation([{ role: 'ai', text: currentScenario.greeting }])
    setCallState('idle')
    setCallDuration(0)
  }, [scenario]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation, isTyping])

  // Call timer
  useEffect(() => {
    if (callState !== 'connected' && callState !== 'on-hold') {
      if (callState === 'idle' || callState === 'ended') setCallDuration(0)
      return
    }
    const interval = setInterval(() => setCallDuration(prev => prev + 1), 1000)
    return () => clearInterval(interval)
  }, [callState])

  // Auto-answer ringing after 2 seconds
  useEffect(() => {
    if (callState === 'ringing') {
      ringingRef.current = setTimeout(() => setCallState('connected'), 2000)
      return () => { if (ringingRef.current) clearTimeout(ringingRef.current) }
    }
  }, [callState])

  // Cleanup ringing timeout on unmount
  useEffect(() => {
    return () => { if (ringingRef.current) clearTimeout(ringingRef.current) }
  }, [])

  const getAIResponse = useCallback((userMsg: string): string => {
    const lower = userMsg.toLowerCase()
    const responses = SCENARIO_RESPONSES[scenario] || SCENARIO_RESPONSES.general

    // Check for multiple keywords and pick the best match
    const keywordPriority = ['emergency', 'pain', 'refill', 'mortgage', 'buy', 'sell', 'ac', 'heating', 'case', 'injury', 'specialist', 'cleaning', 'area', 'urgency', 'hold', 'transfer', 'voicemail', 'demo', 'viewing', 'estimate', 'maintenance', 'insurance', 'integration', 'language', 'feature', 'trial', 'schedule', 'appointment', 'help', 'price', 'pricing', 'voice', 'call', 'business', 'security', 'consultation', 'hello', 'hi']

    // Handle 'transfer' keyword specially
    if (lower.includes('transfer') || lower.includes('human') || lower.includes('person') || lower.includes('agent')) {
      return responses.transfer || SCENARIO_RESPONSES.general.transfer
    }
    if (lower.includes('hold') || lower.includes('wait')) {
      return responses.hold || SCENARIO_RESPONSES.general.hold
    }
    if (lower.includes('voicemail') || lower.includes('message')) {
      return responses.voicemail || SCENARIO_RESPONSES.general.voicemail
    }

    for (const keyword of keywordPriority) {
      if (lower.includes(keyword)) {
        return responses[keyword] || SCENARIO_RESPONSES.general[keyword] || SCENARIO_RESPONSES.general.default
      }
    }
    return responses.default || SCENARIO_RESPONSES.general.default
  }, [scenario])

  const simulateCallState = useCallback(async (state: CallState, duration: number) => {
    setCallState(state)
    await new Promise(resolve => setTimeout(resolve, duration))
  }, [])

  const handleSend = useCallback(async (text?: string) => {
    const msg = (text || message).trim()
    if (!msg || isTyping) return

    setMessage('')
    setConversation(prev => [...prev, { role: 'user', text: msg }])
    setIsTyping(true)

    // Simulate sentiment change
    const lower = msg.toLowerCase()
    if (lower.includes('emergency') || lower.includes('pain') || lower.includes('urgent')) {
      setSentiment(prev => Math.max(prev - 15, 20))
    } else if (lower.includes('thank') || lower.includes('great') || lower.includes('perfect')) {
      setSentiment(prev => Math.min(prev + 10, 100))
    }

    // Handle special call actions
    if (lower.includes('transfer') || lower.includes('human') || lower.includes('person') || lower.includes('agent')) {
      setIsTyping(false)
      await simulateCallState('transferring', 500)
      // Simulate transfer — show transfer message then end
      setConversation(prev => [...prev, { role: 'ai', text: getAIResponse(msg) }])
      await new Promise(resolve => setTimeout(resolve, 1500))
      setCallState('ended')
      await new Promise(resolve => setTimeout(resolve, 2000))
      setCallState('idle')
      setConversation([{ role: 'ai', text: currentScenario.greeting }])
      return
    }

    if (lower.includes('hold') || lower.includes('wait')) {
      setIsTyping(false)
      await simulateCallState('on-hold', 500)
      setConversation(prev => [...prev, { role: 'ai', text: getAIResponse(msg) }])
      await new Promise(resolve => setTimeout(resolve, 3000))
      setCallState('connected')
      return
    }

    if (lower.includes('voicemail') || lower.includes('message')) {
      setIsTyping(false)
      await simulateCallState('voicemail', 500)
      setConversation(prev => [...prev, { role: 'ai', text: getAIResponse(msg) }])
      await new Promise(resolve => setTimeout(resolve, 2000))
      setCallState('idle')
      setConversation([{ role: 'ai', text: currentScenario.greeting }])
      return
    }

    // Normal AI response
    await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 800))
    const response = getAIResponse(msg)
    setConversation(prev => [...prev, { role: 'ai', text: response }])
    setIsTyping(false)
  }, [message, isTyping, getAIResponse, simulateCallState, currentScenario.greeting])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleStartCall = () => {
    setCallState('ringing')
    // Ringing auto-transitions to connected after 2s via useEffect
  }

  const handleEndCall = () => {
    setCallState('ended')
    setTimeout(() => {
      setCallState('idle')
      setConversation([{ role: 'ai', text: currentScenario.greeting }])
      setCallDuration(0)
    }, 1500)
  }

  const handlePromptClick = useCallback((text: string) => {
    if (mode === 'phone') {
      handleSend(text)
    } else {
      setMessage(text)
    }
  }, [mode, handleSend])

  const handleScenarioChange = useCallback((id: ScenarioId) => {
    setScenario(id)
    setShowScenarioPicker(false)
  }, [])

  // Filter prompts based on current scenario
  const filteredPrompts = SUGGESTED_PROMPTS.filter(p => !p.scenarios || p.scenarios.includes(scenario))

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // ─── Phone Call UI ─────────────────────────────────────

  const PhoneCallUI = () => (
    <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 py-6">
      {/* Phone Device Frame */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-[320px] shrink-0"
      >
        <div className="relative rounded-[3rem] border-2 border-white/[0.08] bg-gradient-to-b from-deep-space/95 to-deep-space overflow-hidden shadow-2xl shadow-aurora-cyan/5">
          {/* Status Bar */}
          <div className="flex items-center justify-between px-8 pt-8 pb-2">
            <span className="text-[10px] text-gray-500 font-mono">
              {callState === 'connected' || callState === 'on-hold' ? formatDuration(callDuration) : ''}
            </span>
            <CallIndicator state={callState} />
          </div>

          {/* Notch */}
          <div className="w-[120px] h-6 bg-black rounded-b-2xl mx-auto mb-4" />

          <div className="px-6 pb-6">
            {/* AI Avatar with Pulsing Rings */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-3">
                {(callState === 'connected' || callState === 'ringing' || callState === 'transferring') && (
                  <>
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-aurora-cyan/20"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full border border-aurora-cyan/10"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
                    />
                  </>
                )}
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-aurora-cyan to-midnight-blue flex items-center justify-center shadow-lg shadow-aurora-cyan/20">
                  <BotIcon />
                </div>
              </div>

              {/* Ringing animation */}
              {callState === 'ringing' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center"
                >
                  <h3 className="text-lg font-display font-bold text-white mb-1">Incoming Call...</h3>
                  <div className="flex items-center justify-center gap-2 text-sm text-amber-400">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span>Connecting to AI Receptionist</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">Call will be answered in a moment</p>
                </motion.div>
              )}

              {/* Connected state */}
              {callState === 'connected' && (
                <div className="text-center">
                  <h3 className="text-lg font-display font-bold text-white mb-1">{scenario === 'general' ? 'AI Receptionist' : currentScenario.label} AI</h3>
                  <p className="text-xs text-gray-500">
                    {isTyping ? 'Speaking...' : 'Listening'}
                  </p>
                </div>
              )}

              {/* On Hold state */}
              {callState === 'on-hold' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <MusicIcon />
                    <h3 className="text-lg font-display font-bold text-white">On Hold</h3>
                  </div>
                  <p className="text-xs text-amber-400/80">Enjoy the music while you wait</p>
                  {/* Simulated hold music visual */}
                  <div className="mt-2 flex justify-center">
                    <AudioWaveform isActive={true} />
                  </div>
                </motion.div>
              )}

              {/* Transferring state */}
              {callState === 'transferring' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <UserCheckIcon />
                    <h3 className="text-lg font-display font-bold text-white">Transferring</h3>
                  </div>
                  <p className="text-xs text-amber-400/80">Connecting you to a human agent...</p>
                  <div className="mt-2 flex justify-center">
                    <AudioWaveform isActive={true} />
                  </div>
                </motion.div>
              )}

              {/* Voicemail state */}
              {callState === 'voicemail' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <h3 className="text-lg font-display font-bold text-white mb-1">Recording Voicemail</h3>
                  <p className="text-xs text-gray-500">Leave your message after the tone...</p>
                </motion.div>
              )}

              {/* Idle state */}
              {callState === 'idle' && (
                <div className="text-center">
                  <h3 className="text-lg font-display font-bold text-white mb-1">AI Receptionist</h3>
                  <p className="text-xs text-gray-500">Press call to start</p>
                </div>
              )}

              {/* Ended state */}
              {callState === 'ended' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <h3 className="text-lg font-display font-bold text-white">Call Ended</h3>
                  <p className="text-xs text-gray-500">Duration: {formatDuration(callDuration)}</p>
                  <motion.div
                    animate={{ opacity: 0 }}
                    transition={{ delay: 1.5 }}
                    className="text-xs text-gray-600 mt-1"
                  >
                    Resetting...
                  </motion.div>
                </motion.div>
              )}

              {/* Waveform */}
              {(callState === 'connected' || callState === 'idle') && (
                <div className="flex justify-center mt-4">
                  <AudioWaveform isActive={callState === 'connected' && isTyping} />
                </div>
              )}
            </div>

            {/* Call Controls */}
            {callState === 'connected' && (
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                    isMuted
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-white/[0.06] text-gray-400 border border-white/[0.08] hover:bg-white/[0.1]'
                  }`}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeXIcon /> : <VolumeIcon />}
                </button>
                <button
                  onClick={handleEndCall}
                  className="w-16 h-16 rounded-full bg-cinematic-red/90 text-white flex items-center justify-center hover:bg-cinematic-red transition-all shadow-lg shadow-cinematic-red/20 active:scale-95"
                  aria-label="End call"
                >
                  <PhoneOffIcon />
                </button>
                <button
                  onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                    isSpeakerOn
                      ? 'bg-aurora-cyan/20 text-aurora-cyan border border-aurora-cyan/30'
                      : 'bg-white/[0.06] text-gray-400 border border-white/[0.08] hover:bg-white/[0.1]'
                  }`}
                  aria-label={isSpeakerOn ? 'Turn off speaker' : 'Turn on speaker'}
                >
                  <SpeakerIcon />
                </button>
              </div>
            )}

            {/* Start / End call buttons when idle */}
            {callState === 'idle' && (
              <div className="flex items-center justify-center">
                <button
                  onClick={handleStartCall}
                  className="w-16 h-16 rounded-full bg-green-500/90 text-white flex items-center justify-center hover:bg-green-500 transition-all shadow-lg shadow-green-500/20 active:scale-95"
                  aria-label="Start call"
                >
                  <PhoneCallIcon />
                </button>
              </div>
            )}
          </div>

          <div className="h-1 w-1/3 mx-auto mb-2 rounded-full bg-white/20" />
        </div>
      </motion.div>

      {/* Live Transcription Panel */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex-1 w-full max-w-lg"
      >
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl overflow-hidden">
          {/* Transcription Header */}
          <div className="p-4 border-b border-white/10 bg-white/[0.03]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {callState === 'ringing' ? <PhoneCallIcon /> : <PhoneIncomingIcon />}
                <span className="text-sm font-semibold font-display">
                  {callState === 'idle' ? 'Call Log' : 'Live Transcription'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {/* Live sentiment indicator */}
                <div className="hidden sm:flex items-center gap-1.5 text-[10px]">
                  <HeartIcon />
                  <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${sentiment > 60 ? 'bg-green-400' : sentiment > 40 ? 'bg-amber-400' : 'bg-cinematic-red'}`}
                      animate={{ width: `${sentiment}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <span className="text-gray-500">{sentiment}%</span>
                </div>
                {(callState === 'connected' || callState === 'on-hold') && (
                  <span className="text-[10px] text-green-400 font-mono bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                    REC {formatDuration(callDuration)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="h-[360px] overflow-y-auto p-4 space-y-3">
            {conversation.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className={`flex items-start gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {msg.role === 'ai' ? (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-aurora-cyan to-midnight-blue shrink-0 flex items-center justify-center">
                      <BotIcon />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-white/[0.08] shrink-0 flex items-center justify-center">
                      <span className="text-[10px] text-gray-400">You</span>
                    </div>
                  )}
                  <div
                    className={`px-3 py-2 rounded-xl text-sm max-w-[85%] ${
                      msg.role === 'user'
                        ? 'bg-aurora-cyan/10 border border-aurora-cyan/20 text-gray-200'
                        : 'bg-white/5 border border-white/10 text-gray-300'
                    }`}
                  >
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              </motion.div>
            ))}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-2"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-aurora-cyan to-midnight-blue shrink-0 flex items-center justify-center">
                    <BotIcon />
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                    <TypingDots />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          {/* Phone Input */}
          <div className="p-3 border-t border-white/10 bg-white/[0.03]">
            <form onSubmit={e => { e.preventDefault(); handleSend() }} className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <MicIcon />
                </span>
                <input
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Say something..."
                  disabled={isTyping || callState === 'idle' || callState === 'ended' || callState === 'ringing'}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-aurora-cyan/50 transition-colors text-sm disabled:opacity-30"
                />
              </div>
              <button
                type="submit"
                disabled={!message.trim() || isTyping || callState === 'idle' || callState === 'ended' || callState === 'ringing'}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 text-white font-medium disabled:opacity-50 transition-all hover:shadow-lg hover:shadow-aurora-cyan/25 active:scale-95"
              >
                <SendIcon />
              </button>
            </form>
          </div>
        </div>

        {/* Suggested Prompts */}
        <div className="mt-3 space-y-2">
          {/* Category groups */}
          {['Scheduling', 'Pricing', 'Features', 'Actions'].map(cat => {
            const prompts = filteredPrompts.filter(p => p.category === cat)
            if (prompts.length === 0) return null
            return (
              <div key={cat} className="flex flex-wrap items-center gap-1.5">
                <span className="text-[9px] text-gray-600 uppercase tracking-wider font-semibold w-16 shrink-0">{cat}</span>
                {prompts.map((s, i) => (
                  <button
                    key={`${cat}-${i}`}
                    onClick={() => handlePromptClick(s.text)}
                    disabled={isTyping || (callState === 'idle' && mode === 'phone')}
                    className="px-2.5 py-1 rounded-full border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-aurora-cyan/20 transition-all text-[11px] text-gray-400 hover:text-white disabled:opacity-30"
                  >
                    {s.icon} {s.text}
                  </button>
                ))}
              </div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )

  // ─── Render ───────────────────────────────────────────

  return (
    <div className="min-h-screen bg-deep-space text-white">
      {/* ─── NAV ─── */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/10' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aurora-cyan to-midnight-blue flex items-center justify-center">
              <BotIcon />
            </div>
            <span className="font-bold text-lg hidden sm:inline">FrontDesk Agents AI</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="/services" className="text-sm text-gray-300 hover:text-white transition-colors">Services</a>
            <a href="/ai-receptionist" className="text-sm text-gray-300 hover:text-white transition-colors">Legal AI</a>
            <a href="/partners" className="text-sm text-gray-300 hover:text-white transition-colors">Partners</a>
            <a href="/industries" className="text-sm text-gray-300 hover:text-white transition-colors">Industries</a>
            <a href="/blog" className="text-sm text-gray-300 hover:text-white transition-colors">Blog</a>
            <a href="/pricing" className="text-sm text-gray-300 hover:text-white transition-colors">Pricing</a>
            <a href="/contact" className="text-sm text-gray-300 hover:text-white transition-colors">Contact</a>
            <Link href="/pricing" className="px-4 py-2 rounded-full bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 text-white text-sm font-medium hover:shadow-lg hover:shadow-aurora-cyan/25 transition-all">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative pt-32 pb-6 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-aurora-cyan/20 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-aurora-cyan/8 rounded-full blur-3xl animate-float" />
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {callState === 'connected' ? 'Call in Progress' : 'Live Interactive Demo'}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold font-display leading-tight mb-3">
              Try the AI Receptionist
            </h1>
            <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto mb-5">
              Choose a scenario to see how FrontDesk Agents AI handles real calls for your industry.
              Try typing naturally — the AI responds just like a real receptionist would.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── SCENARIO SELECTOR ─── */}
      <div className="px-4 mb-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center">
            <div className="relative">
              <button
                onClick={() => setShowScenarioPicker(!showScenarioPicker)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-aurora-cyan/20 transition-all text-sm"
              >
                <span>{currentScenario.icon}</span>
                <span className="font-medium">{currentScenario.label}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${showScenarioPicker ? 'rotate-180' : ''}`}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              <AnimatePresence>
                {showScenarioPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[500px] max-w-[90vw] bg-deep-space/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-3 shadow-2xl z-30"
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {SCENARIOS.map(s => (
                        <button
                          key={s.id}
                          onClick={() => handleScenarioChange(s.id)}
                          className={`text-left p-3 rounded-xl transition-all ${
                            scenario === s.id
                              ? 'bg-aurora-cyan/10 border border-aurora-cyan/20'
                              : 'bg-white/[0.02] border border-transparent hover:bg-white/[0.05]'
                          }`}
                        >
                          <div className="text-lg mb-1">{s.icon}</div>
                          <div className="text-xs font-semibold">{s.label}</div>
                          <div className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{s.description}</div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MODE TOGGLE ─── */}
      <div className="px-4 mb-5">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-2 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.06] w-fit mx-auto backdrop-blur-xl">
            <button
              onClick={() => setMode('chat')}
              className={`relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                mode === 'chat'
                  ? 'bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 text-white shadow-lg shadow-aurora-cyan/20'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <MessageSquareIcon />
                Chat Demo
              </span>
            </button>
            <button
              onClick={() => setMode('phone')}
              className={`relative px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                mode === 'phone'
                  ? 'bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 text-white shadow-lg shadow-aurora-cyan/20'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <PhoneCallIcon />
                Phone Call
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── DEMO EXPERIENCE ─── */}
      <section className="px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {mode === 'chat' ? (
              /* ─── CHAT MODE ─── */
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl overflow-hidden">
                  {/* Chat Header */}
                  <div className="p-4 border-b border-white/10 bg-white/[0.03]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-aurora-cyan to-midnight-blue flex items-center justify-center">
                          <BotIcon />
                        </div>
                        <div>
                          <div className="font-semibold font-display">
                            {scenario === 'general' ? 'FrontDesk Agents AI Receptionist' : currentScenario.label}
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <CallIndicator state={callState === 'idle' && conversation.length > 1 ? 'connected' : callState} />
                            {callState === 'connected' && (
                              <span className="text-green-400 font-mono">{formatDuration(callDuration)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {callState === 'connected' && (
                          <button onClick={handleEndCall} className="px-4 py-2 rounded-full text-xs font-medium bg-cinematic-red/10 text-cinematic-red border border-cinematic-red/20 hover:bg-cinematic-red/20 transition-all">
                            End Call
                          </button>
                        )}
                        {callState === 'idle' && conversation.length <= 1 && (
                          <button onClick={handleStartCall} className="px-4 py-2 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-all">
                            Start Call
                          </button>
                        )}
                        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-aurora-cyan/10 text-aurora-cyan text-xs border border-aurora-cyan/20">
                          <MessageSquareIcon />
                          {currentScenario.icon} {currentScenario.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                    {conversation.map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[85%] sm:max-w-[70%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-aurora-cyan/10 border border-aurora-cyan/20' : 'bg-white/5 border border-white/10'}`}>
                          {msg.role === 'ai' && (
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-aurora-cyan to-midnight-blue flex items-center justify-center">
                                <BotIcon />
                              </div>
                              <span className="text-[10px] text-aurora-cyan/60 font-medium uppercase tracking-wider">
                                {scenario === 'general' ? 'AI Receptionist' : currentScenario.label} AI
                              </span>
                            </div>
                          )}
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                        </div>
                      </motion.div>
                    ))}
                    <AnimatePresence>
                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex justify-start"
                        >
                          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-aurora-cyan to-midnight-blue flex items-center justify-center">
                                <BotIcon />
                              </div>
                              <span className="text-[10px] text-aurora-cyan/60 font-medium uppercase tracking-wider">Typing</span>
                            </div>
                            <TypingDots />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div ref={chatEndRef} />
                  </div>

                  {/* Chat Input */}
                  <div className="p-4 border-t border-white/10 bg-white/[0.03]">
                    <form onSubmit={e => { e.preventDefault(); handleSend() }} className="flex gap-2">
                      <input
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={`Try: "${filteredPrompts[0]?.text || 'Can you book an appointment?'}"`}
                        disabled={isTyping}
                        className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-aurora-cyan/50 transition-colors text-sm"
                      />
                      <button
                        type="submit"
                        disabled={!message.trim() || isTyping}
                        className="px-5 py-3 rounded-xl bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 text-white font-medium disabled:opacity-50 transition-all hover:shadow-lg hover:shadow-aurora-cyan/25 active:scale-95"
                      >
                        <SendIcon />
                      </button>
                    </form>
                  </div>

                  {/* Suggested Prompts */}
                  <div className="px-4 pb-4 pt-2 border-t border-white/5">
                    <div className="flex flex-wrap gap-2">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold self-center mr-1">Try:</span>
                      {filteredPrompts.slice(0, 10).map((s, i) => (
                        <button
                          key={i}
                          onClick={() => setMessage(s.text)}
                          disabled={isTyping}
                          className="px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-aurora-cyan/20 transition-all text-xs text-gray-400 hover:text-white flex items-center gap-1.5"
                        >
                          <span>{s.icon}</span>
                          {s.text}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* ─── PHONE CALL MODE ─── */
              <motion.div
                key="phone"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <PhoneCallUI />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ─── WHAT YOU JUST EXPERIENCED ─── */}
      <section className="py-16 px-4 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold font-display mb-4">What You Just Experienced</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Every interaction with FrontDesk Agents AI is powered by enterprise-grade AI — this demo shows just a fraction of what our platform can do.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEMO_HIGHLIGHTS.map((item, i) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl hover:bg-white/[0.05] hover:border-aurora-cyan/30 hover:scale-[1.01] transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-aurora-cyan/20 to-aurora-cyan/10 flex items-center justify-center mb-4 text-aurora-cyan">
                    <Icon />
                  </div>
                  <h3 className="font-semibold mb-2 font-display">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold font-display mb-4">From Demo to Live in Minutes</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              What you just experienced is the exact same AI that will handle your real calls. Here&apos;s how fast you can go live.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative text-center p-6"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-aurora-cyan/20 to-aurora-cyan/10 border border-aurora-cyan/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-aurora-cyan">{item.step}</span>
                </div>
                <h3 className="font-semibold mb-2 font-display">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="p-12 rounded-3xl border border-aurora-cyan/20 bg-gradient-to-br from-aurora-cyan/5 to-transparent"
          >
            <h2 className="text-3xl sm:text-4xl font-bold font-display mb-4">Ready for a Real AI Receptionist?</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              What you just experienced is just a preview. Get the full AI receptionist handling your actual calls — live and in production.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/pricing" className="px-8 py-4 rounded-full bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 text-white font-semibold text-lg hover:shadow-xl hover:shadow-aurora-cyan/25 transition-all transform hover:scale-105">
                Start Free Trial
              </Link>
              <Link href="/services" className="px-8 py-4 rounded-full border border-white/20 text-white font-semibold text-lg hover:bg-white/5 hover:border-aurora-cyan/30 transition-all duration-300">
                Explore Features
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-6">Free 14-day trial · No credit card required · Cancel anytime</p>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-12 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aurora-cyan to-midnight-blue flex items-center justify-center"><BotIcon /></div>
              <span className="font-bold">FrontDesk Agents AI</span>
            </div>
            <p className="text-sm text-gray-500">The world&apos;s most advanced AI receptionist platform.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Services</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="/services" className="hover:text-white transition-colors">AI Call Answering</a></li>
              <li><a href="/services" className="hover:text-white transition-colors">Appointment Booking</a></li>
              <li><a href="/services" className="hover:text-white transition-colors">Lead Qualification</a></li>
              <li><a href="/services" className="hover:text-white transition-colors">All Services</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Company</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="/demo" className="hover:text-white transition-colors">Demo</a></li>
              <li><a href="/ai-receptionist" className="hover:text-white transition-colors">Legal AI</a></li>
              <li><a href="/partners" className="hover:text-white transition-colors">Partners</a></li>
              <li><a href="/industries" className="hover:text-white transition-colors">Industries</a></li>
              <li><a href="/blog" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="/pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="/privacy-policy" className="hover:text-white transition-colors">Privacy</a></li>
              <li><a href="/terms-of-service" className="hover:text-white transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-white/5 text-center text-sm text-gray-600">
          &copy; {new Date().getFullYear()} FrontDesk Agents AI. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
