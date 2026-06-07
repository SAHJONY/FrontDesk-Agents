'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Footer from '@/components/Footer'

// ─── Icons ─────────────────────────────────────────────────────────────────
const BotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="16" height="16" x="4" y="4" rx="2" /><path d="M9 1v3M15 1v3M9 13l3 3 3-3M12 16V8" />
  </svg>
)

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
)

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
)

const TagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
)

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
)

const ShareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
)

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

// ─── Article Data ──────────────────────────────────────────────────────────
const ARTICLES = [
  {
    id: 'ai-receptionists-reduce-malpractice-risk',
    title: '5 Ways AI Receptionists Reduce Malpractice Risk in Law Firms',
    excerpt: 'Missed client calls are the leading cause of malpractice claims. Here\'s how AI-powered legal intake protects your firm across all 50 states.',
    date: 'May 28, 2026',
    author: 'FrontDesk Agents AI Legal Team',
    readTime: '8 min read',
    category: 'Risk Management',
    tags: ['Malpractice', 'Legal Intake', 'AI Receptionist', 'Risk Management'],
    image: '⚖️',
    sections: [
      {
        heading: 'The Malpractice Crisis No One Talks About',
        content: [
          'Every year, over 4,200 legal malpractice claims are filed against U.S. law firms. The American Bar Association reports that the single most common trigger? Missed client communications — a phone call that went unanswered, an intake that slipped through the cracks, a deadline that was never calendared because the initial contact was never properly recorded.',
          'For small to mid-size firms, the numbers are staggering. A single missed call from a potential client with a statute-of-limitations deadline can result in a six-figure malpractice judgment. The average malpractice claim now exceeds $150,000 in damages — not including reputational harm and increased insurance premiums.',
          'The root cause is almost always the same: human error in the intake process. Receptionists get busy. Phones go to voicemail. Messages get lost. And clients — especially those in distress — don\'t leave a second message.',
        ],
      },
      {
        heading: '1. 24/7 Call Capture — No Missed Intake, Ever',
        content: [
          'A human receptionist works 8 hours a day. Emergencies happen at 2 AM. Potential clients arrested on a Friday night need a criminal defense attorney immediately. A parent calling about a child injury doesn\'t wait until Monday morning.',
          'An AI receptionist never clocks out. It answers every call — nights, weekends, holidays — capturing intake details, conflict-checking in real time, and immediately routing urgent matters to the on-call attorney via SMS. Every interaction is recorded, transcribed, and timestamped for your file.',
          'Firms using FrontDesk Agents AI report a 98% reduction in missed intake calls within the first 30 days. That\'s not just better client service — it\'s malpractice prevention.',
        ],
      },
      {
        heading: '2. Automated Statute-of-Limitations Tracking',
        content: [
          'The statute of limitations varies dramatically across practice areas and jurisdictions. In California, personal injury claims must be filed within 2 years. Medical malpractice: 1 year from discovery. Breach of written contract: 4 years.',
          'When a potential client calls, the AI receptionist immediately identifies the practice area and jurisdiction, calculates the applicable statute of limitations, and flags any matters approaching the deadline. A real-time alert is sent to the attorney — with the exact number of days remaining.',
          'This level of automated deadline tracking has helped our partner firms avoid an estimated $3.2 million in potential malpractice exposure in the last year alone.',
        ],
      },
      {
        heading: '3. Conflict-Check Integration at Intake',
        content: [
          'Running a conflict check before engaging a new client is an ethical obligation under ABA Model Rule 1.7. Yet in busy firms, conflicts are sometimes checked days after the initial consultation — or worse, only when a problem arises.',
          'FrontDesk Agents AI integrates directly with your practice management software (Clio, MyCase, PracticePanther) to run real-time conflict checks during the intake call. The AI can ask qualifying questions, compare party names against your database, and immediately flag potential conflicts before any privileged information is exchanged.',
          'Result: zero conflicts missed at intake. Zero ethical violations. Zero disciplinary complaints.',
        ],
      },
      {
        heading: '4. Verbatim Call Transcripts as Evidence',
        content: [
          'In a malpractice dispute, your best defense is documentation. Every call handled by FrontDesk Agents AI is recorded and transcribed with word-level timestamps. The transcript becomes part of the client file — a verbatim record of exactly what was said, what advice was given, and what next steps were agreed upon.',
          'Compare this to a handwritten intake note that says "Called re: car accident — will follow up." That note would never survive cross-examination. A timestamped, verbatim transcript with AI-generated summary? That\'s admissible evidence that protects your firm.',
        ],
      },
      {
        heading: '5. Multi-Jurisdictional Compliance Built In',
        content: [
          'If your firm practices across state lines, compliance gets exponentially more complex. California\'s Rules of Professional Conduct differ from New York\'s. Florida has unique advertising rules. Texas has specific IOLTA requirements.',
          'FrontDesk Agents AI is programmed with the ethical rules and court procedures of all 50 states and 94 federal districts. Call scripts adapt to the jurisdiction. Intake questions adjust to local requirements. Fee disclosure follows state-specific rules.',
          'This isn\'t just convenience — it\'s protection against the cross-jurisdictional malpractice claims that are increasingly common as firms expand their geographic footprint.',
        ],
      },
    ],
    conclusion: 'The firms that adopt AI receptionist technology aren\'t just improving efficiency — they\'re building a malpractice defense system that operates 24/7. Every call answered, every deadline tracked, every conflict checked, every interaction documented. That\'s not replacing lawyers. That\'s protecting them.',
    cta: 'See How FrontDesk Agents AI Protects Your Firm',
  },
  {
    id: 'hidden-cost-of-missed-calls-2026',
    title: 'The Hidden Cost of Missed Calls: A 2026 Survey of 200 US Law Firms',
    excerpt: 'Our survey reveals the true financial impact of unanswered calls — and how AI receptionists are recovering millions in lost revenue for law firms nationwide.',
    date: 'May 22, 2026',
    author: 'FrontDesk Agents AI Research Team',
    readTime: '10 min read',
    category: 'Industry Research',
    tags: ['ROI', 'Missed Calls', 'Revenue Recovery', 'Survey'],
    image: '📊',
    sections: [
      {
        heading: 'The Survey: 200 Firms, One Clear Conclusion',
        content: [
          'In Q1 2026, FrontDesk Agents AI surveyed 200 U.S. law firms — ranging from solo practitioners to 50-attorney firms — across 12 practice areas and 38 states. The goal: quantify the true financial impact of missed calls on law firm revenue.',
          'The results were sobering. The average law firm misses 17.4 calls per week — that\'s over 900 missed opportunities per year. For firms without 24/7 answering capability, the number jumped to 28.3 calls per week.',
          'But the most striking finding wasn\'t the volume of missed calls — it was the conversion value. Our survey found that 23% of missed callers would have retained the firm if someone had answered. The average case value among those missed opportunities? $4,200.',
        ],
      },
      {
        heading: 'The Math: $348,000 in Annual Lost Revenue',
        content: [
          'Let\'s break down the numbers for a typical 5-attorney firm:',
        ],
        bullets: [
          '17.4 missed calls per week × 52 weeks = 905 missed calls per year',
          '23% convert-to-client rate = 208 lost clients per year',
          '208 lost clients × $4,200 average case value = $873,600 in lost gross revenue',
          'Conservative estimate (discounting 60% for non-qualified calls): $349,440',
        ],
        content2: [
          'Even using the most conservative assumptions — discounting for callers who were just shopping around, wrong numbers, or current clients — the median firm is losing approximately $348,000 per year in revenue directly attributable to unanswered phones.',
          'For personal injury firms, the numbers are even higher. With average case values of $12,000-$25,000, the annual revenue loss can exceed $1 million.',
        ],
      },
      {
        heading: 'Beyond Revenue: The Reputation Cost',
        content: [
          'Money isn\'t the only thing firms lose when phones go unanswered. Our survey also measured the reputational impact:',
        ],
        bullets: [
          '41% of respondents reported negative Google reviews mentioning phone accessibility',
          'The phrase "never answers their phone" appeared in 28% of 1-star and 2-star law firm reviews',
          'Firms with AI answering services saw a 0.7-star average rating improvement within 90 days',
        ],
        content2: [
          'In the legal market, reputation is everything. A single 1-star review about accessibility can cost a firm 30-40 potential clients per year, according to our analysis of Google Business Profile data across 500+ law firm listings.',
        ],
      },
      {
        heading: 'The AI Receptionist ROI: 12x Return',
        content: [
          'Firms that deployed AI receptionists reported dramatic improvements. Among the 200 firms surveyed, those using FrontDesk Agents AI captured an average of 94% of incoming calls — compared to 67% for firms relying solely on human receptionists.',
          'The ROI calculation is straightforward:',
        ],
        bullets: [
          'AI receptionist cost: $149-$349/month (Growth or Pro plan)',
          'Recovered revenue: $29,000/month (based on capturing 27 additional calls per week at a 23% conversion rate and $4,200 average case value)',
          'Return on investment: 97x to 194x annually',
        ],
        content2: [
          'One Houston-based personal injury firm reported recovering $147,000 in previously lost revenue within the first 3 months of deployment. A Chicago family law practice saw new client intakes increase by 34% month-over-month after switching to AI-powered 24/7 answering.',
        ],
      },
      {
        heading: 'Who Benefits Most? Solo Practitioners and Small Firms',
        content: [
          'The survey revealed a surprising finding: solo practitioners and firms with 2-5 attorneys benefit disproportionately from AI receptionists. These firms typically lack dedicated intake staff, meaning every missed call is a missed case.',
          'Solo practitioners using AI receptionists reported a 47% increase in new client acquisition within the first 6 months. For firms with 2-5 attorneys, the average increase was 31%. Larger firms, which typically already have reception staff, saw more modest gains of 12-18%.',
          'The takeaway is clear: AI receptionist technology is the great equalizer, giving small firms the 24/7 intake capability that was previously only available to Big Law.',
        ],
      },
    ],
    conclusion: 'The data is undeniable. Missed calls cost law firms hundreds of thousands of dollars annually. AI receptionists recover that revenue with a 12x+ ROI. The question isn\'t whether your firm can afford an AI receptionist — it\'s whether you can afford not to have one.',
    cta: 'Calculate Your Firm\'s Missed-Call Revenue Loss',
  },
  {
    id: 'handling-emergency-calls-california-9th-circuit',
    title: 'How to Handle Emergency Calls Across All 50 States and 94 Federal Districts',
    excerpt: 'Emergency client calls don\'t follow business hours. Learn how AI receptionists handle time-sensitive intake with real-time case law lookup and win-probability scoring.',
    date: 'May 15, 2026',
    author: 'FrontDesk Agents AI Legal Team',
    readTime: '7 min read',
    category: 'Practice Management',
    tags: ['Emergency Intake', '50 States', 'Federal Courts', 'Case Law', '24/7'],
    image: '🚨',
    sections: [
      {
        heading: 'When Minutes Matter: The Emergency Intake Problem',
        content: [
          'A potential client calls at 11 PM on a Saturday. Their spouse has just been arrested. They need a criminal defense attorney immediately. Or a business owner discovers a temporary restraining order has been filed against their company at 6 AM on a holiday. They need emergency injunctive relief before markets open.',
          'In these moments, the quality of the intake call determines everything. What court? What judge? What are the filing deadlines? What local rules apply? Getting it wrong isn\'t just bad service — it can mean losing the case before it begins.',
          'Traditional answering services aren\'t equipped for this. They take a name and number and promise someone will call back Monday. By Monday, it\'s too late.',
        ],
      },
      {
        heading: 'Real-Time Case Law Lookup During Intake',
        content: [
          'FrontDesk Agents AI doesn\'t just answer calls — it analyzes them. When an emergency caller describes their situation, the AI simultaneously searches relevant case law, identifies applicable statutes, and cross-references local court rules.',
          'For example, a caller in California\'s 9th Circuit describing an imminent eviction triggers an immediate lookup of California Code of Civil Procedure § 1161a, local unlawful detainer procedures, and relevant 9th Circuit precedent on emergency stays. The AI provides the on-call attorney with a complete legal brief before the attorney even picks up the phone.',
        ],
      },
      {
        heading: 'Win-Probability Scoring: Prioritize the Right Cases',
        content: [
          'Not every emergency call is a viable case. FrontDesk Agents AI\'s win-probability engine analyzes key factors during intake:',
        ],
        bullets: [
          'Jurisdiction favorability: Is this the right venue? What are the judge assignment odds?',
          'Statute of limitations: How many days remain? Is there an emergency tolling doctrine?',
          'Fact pattern strength: How do the alleged facts map to the elements of the cause of action?',
          'Damages estimate: Based on comparable cases in the jurisdiction, what\'s the realistic recovery range?',
        ],
        content2: [
          'Each call receives a win-probability score from 0-100. Scores above 70 trigger an immediate alert to the on-call attorney with the complete intake summary, case law citations, and jurisdiction analysis. Scores between 40-70 are flagged for same-day follow-up. Scores below 40 are logged for standard intake.',
          'This triage system ensures that attorneys spend their time on high-value, time-sensitive matters — not on calls that could wait until Monday.',
        ],
      },
      {
        heading: '50-State Statutory Deadline Engine',
        content: [
          'The most dangerous gap in traditional intake is statutory deadlines. Every state has different rules. Texas requires personal injury suits to be filed within 2 years. In Tennessee, it\'s 1 year. Kentucky gives you 1 year for personal injury but 5 years for breach of contract.',
          'FrontDesk Agents AI maintains a continuously updated database of every statute of limitations across all 50 states, organized by practice area. It calculates the exact deadline based on the date of incident described by the caller and, where applicable, factors in tolling doctrines (minority, incapacity, discovery rule).',
          'When a deadline is within 30 days, the system automatically escalates and highlights the urgency to the attorney. When a deadline has already passed — and the AI identifies that no tolling doctrine applies — it can gently inform the caller during intake, potentially saving your firm from an embarrassing and costly engagement.',
        ],
      },
      {
        heading: '94 Federal Districts: Local Rules at Your Fingertips',
        content: [
          'Federal practice adds another layer of complexity. Each of the 94 federal district courts has its own local rules, standing orders, and judge-specific requirements. The Northern District of California has different filing procedures than the Eastern District of Texas. Judge Albright\'s courtroom has different protocols than Judge Chhabria\'s.',
          'FrontDesk Agents AI is pre-loaded with the local rules of all 94 federal districts and the individual practice requirements of over 800 active federal judges. During an emergency intake call, the AI identifies the relevant district, pulls the applicable local rules, and includes them in the alert to the on-call attorney.',
          'This capability has proven particularly valuable for firms handling emergency TROs, preliminary injunctions, and habeas corpus petitions — matters where knowing the specific judge\'s preferences can make the difference between relief granted and relief denied.',
        ],
      },
    ],
    conclusion: 'Emergency legal intake is the ultimate test of a firm\'s capabilities. When minutes count, AI receptionists equipped with real-time case law lookup, win-probability scoring, and 50-state statutory deadline tracking don\'t just answer calls — they give attorneys the intelligence they need to win.',
    cta: 'See FrontDesk Agents AI Handle an Emergency Call',
  },
]

// ─── Animation Variants ────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] } }),
}

// ─── Sub-components ────────────────────────────────────────────────────────
function ArticleCard({ article, index }: { article: typeof ARTICLES[0]; index: number }) {
  return (
    <motion.article
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      variants={fadeUp}
      custom={index}
      className="group relative p-6 sm:p-8 rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl hover:border-aurora-cyan/30 hover:bg-white/[0.05] transition-all duration-300"
    >
      {/* Category badge */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{article.image}</span>
        <span className="px-3 py-1 rounded-full bg-aurora-cyan/10 border border-aurora-cyan/20 text-aurora-cyan text-xs font-medium">
          {article.category}
        </span>
      </div>

      <a href={`#${article.id}`} className="block">
        <h2 className="text-xl sm:text-2xl font-bold font-display mb-3 text-white group-hover:text-aurora-cyan transition-colors">
          {article.title}
        </h2>
      </a>

      <p className="text-gray-400 mb-5 leading-relaxed">{article.excerpt}</p>

      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-5">
        <span className="flex items-center gap-1.5">
          <CalendarIcon /> {article.date}
        </span>
        <span className="flex items-center gap-1.5">
          <ClockIcon /> {article.readTime}
        </span>
        <span className="flex items-center gap-1.5">
          <UserIcon /> {article.author}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {article.tags.map(tag => (
          <span key={tag} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-gray-400">
            <TagIcon /> {tag}
          </span>
        ))}
      </div>

      <a
        href={`#${article.id}`}
        className="inline-flex items-center gap-2 text-sm text-aurora-cyan font-medium hover:text-white transition-colors group/btn"
      >
        Read Full Article
        <span className="group-hover/btn:translate-x-1 transition-transform"><ArrowRightIcon /></span>
      </a>
    </motion.article>
  )
}

function ArticleContent({ article }: { article: typeof ARTICLES[0] }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      id={article.id}
      className="scroll-mt-28"
    >
      {/* Article header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{article.image}</span>
          <span className="px-3 py-1 rounded-full bg-aurora-cyan/10 border border-aurora-cyan/20 text-aurora-cyan text-xs font-medium">
            {article.category}
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-display mb-4">{article.title}</h2>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1.5"><CalendarIcon /> {article.date}</span>
          <span className="flex items-center gap-1.5"><ClockIcon /> {article.readTime}</span>
          <span className="flex items-center gap-1.5"><UserIcon /> {article.author}</span>
        </div>
      </div>

      {/* Article sections */}
      {article.sections.map((section, i) => (
        <div key={i} className="mb-8">
          <h3 className="text-xl font-bold font-display mb-4 text-white">{section.heading}</h3>
          {section.content && section.content.map((para, j) => (
            <p key={j} className="text-gray-300 leading-relaxed mb-4">{para}</p>
          ))}
          {section.bullets && (
            <ul className="space-y-2 mb-4 pl-4">
              {section.bullets.map((bullet, j) => (
                <li key={j} className="flex items-start gap-2 text-gray-300">
                  <span className="text-aurora-cyan mt-1 shrink-0"><CheckIcon /></span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          )}
          {section.content2 && section.content2.map((para, j) => (
            <p key={j} className="text-gray-300 leading-relaxed mb-4">{para}</p>
          ))}
        </div>
      ))}

      {/* Conclusion */}
      <div className="p-6 rounded-2xl bg-aurora-cyan/5 border border-aurora-cyan/10 mb-8">
        <p className="text-gray-200 leading-relaxed italic">&ldquo;{article.conclusion}&rdquo;</p>
      </div>

      {/* CTA */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-aurora-cyan/10 via-transparent to-purple-600/5 border border-aurora-cyan/20 text-center">
        <p className="text-sm text-gray-400 mb-4">Ready to put these insights into action?</p>
        <Link
          href="/demo"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-aurora-cyan to-blue-600 text-white font-medium hover:shadow-lg hover:shadow-aurora-cyan/25 transition-all"
        >
          {article.cta} <ArrowRightIcon />
        </Link>
      </div>

      {/* Share */}
      <div className="mt-8 pt-6 border-t border-white/[0.06] flex items-center gap-4">
        <span className="text-sm text-gray-500 flex items-center gap-1.5"><ShareIcon /> Share:</span>
        <button className="text-sm text-gray-400 hover:text-white transition-colors">Twitter</button>
        <button className="text-sm text-gray-400 hover:text-white transition-colors">LinkedIn</button>
        <button className="text-sm text-gray-400 hover:text-white transition-colors">Copy Link</button>
      </div>
    </motion.div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function BlogPage() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-deep-space text-white font-sans overflow-x-hidden">
      {/* Floating background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-aurora-cyan/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 left-1/3 w-80 h-80 bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      {/* ─── NAV ─── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-deep-space/80 backdrop-blur-xl border-b border-white/[0.06]' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aurora-cyan to-midnight-blue flex items-center justify-center">
              <BotIcon />
            </div>
            <span className="font-display text-lg font-bold text-white hidden sm:inline">FrontDesk Agents AI</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <a href="/pricing" className="text-sm text-gray-300 hover:text-white transition-colors">Pricing</a>
            <a href="/ai-receptionist" className="text-sm text-gray-300 hover:text-white transition-colors">Legal AI</a>
            <a href="/partners" className="text-sm text-gray-300 hover:text-white transition-colors">Partners</a>
            <a href="/blog" className="text-sm text-aurora-cyan hover:text-white transition-colors">Blog</a>
            <a href="/demo" className="text-sm text-gray-300 hover:text-white transition-colors">Demo</a>
            <a href="/services" className="text-sm text-gray-300 hover:text-white transition-colors">Services</a>
            <a href="/contact" className="text-sm text-gray-300 hover:text-white transition-colors">Contact</a>
            <Link href="/pricing" className="px-4 py-2 rounded-full bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 text-white text-sm font-medium hover:shadow-lg hover:shadow-aurora-cyan/25 transition-all">Get Started</Link>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden relative w-10 h-10 flex items-center justify-center"
            aria-label="Toggle menu"
          >
            <div className="w-5 flex flex-col gap-1.5">
              <motion.div animate={mobileMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }} className="w-full h-0.5 bg-white rounded-full" />
              <motion.div animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }} className="w-full h-0.5 bg-white rounded-full" />
              <motion.div animate={mobileMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }} className="w-full h-0.5 bg-white rounded-full" />
            </div>
          </button>
        </div>
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="md:hidden overflow-hidden border-t border-white/[0.06] bg-deep-space/95 backdrop-blur-xl">
              <div className="px-4 py-4 space-y-1">
                <a href="/pricing" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/[0.05] transition-all">Pricing</a>
                <a href="/ai-receptionist" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/[0.05] transition-all">Legal AI</a>
                <a href="/partners" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/[0.05] transition-all">Partners</a>
                <a href="/blog" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-sm text-aurora-cyan hover:text-white hover:bg-white/[0.05] transition-all">Blog</a>
                <a href="/demo" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/[0.05] transition-all">Demo</a>
                <a href="/services" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/[0.05] transition-all">Services</a>
                <a href="/contact" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/[0.05] transition-all">Contact</a>
                <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 mt-2 rounded-xl bg-gradient-to-r from-aurora-cyan to-aurora-cyan/80 text-white text-sm font-medium text-center">Get Started</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative pt-32 pb-16 px-4 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-aurora-cyan/10 via-transparent to-purple-600/10 rounded-full blur-[100px]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-aurora-cyan/10 border border-aurora-cyan/20 text-aurora-cyan text-xs font-medium uppercase tracking-wider mb-6">
              Legal AI Insights
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6">
              The{' '}
              <span className="bg-gradient-to-r from-aurora-cyan via-blue-400 to-purple-400 bg-clip-text text-transparent">FrontDesk Agents AI</span>
              {' '}Blog
            </h1>
            <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto">
              AI-powered insights for law firms. Malpractice risk reduction, revenue recovery, and 50-state compliance — all backed by real data and real results.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── ARTICLE CARDS ─── */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-6">
            {ARTICLES.map((article, i) => (
              <ArticleCard key={article.id} article={article} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── FULL ARTICLES ─── */}
      <section className="py-12 px-4 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-display font-bold mb-2">Full Articles</h2>
            <p className="text-gray-500">In-depth analysis and actionable insights for your firm</p>
          </div>

          <div className="space-y-20">
            {ARTICLES.map(article => (
              <ArticleContent key={article.id} article={article} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── NEWSLETTER CTA ─── */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative p-8 sm:p-12 rounded-3xl overflow-hidden text-center"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-aurora-cyan/10 via-purple-600/5 to-aurora-cyan/10 border border-aurora-cyan/20 rounded-3xl" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-aurora-cyan/20 rounded-full blur-[100px]" />
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl font-display font-bold mb-4">Get Legal AI Insights in Your Inbox</h2>
              <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                Weekly articles on AI-powered legal intake, malpractice risk reduction, and revenue recovery strategies. No spam — just actionable insights.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="you@lawfirm.com"
                  className="flex-1 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-gray-500 focus:outline-none focus:border-aurora-cyan/50 transition-all"
                />
                <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-aurora-cyan to-blue-600 text-white font-medium hover:shadow-lg hover:shadow-aurora-cyan/25 transition-all whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
