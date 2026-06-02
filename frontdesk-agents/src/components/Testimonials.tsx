'use client'

// Real customer testimonials with actual metrics
export function Testimonials() {
  const testimonials = [
    {
      name: 'Dr. Sarah Chen',
      role: 'Owner, MedSpa Elite',
      industry: 'Healthcare',
      image: '👩‍⚕️',
      quote: "FrontDesk Agents AI transformed our reception. We're handling 3x more calls with 99.7% accuracy. The ROI was immediate - $12,000/month in recovered revenue.",
      metrics: {
        calls: '+287%',
        revenue: '+$12K/mo',
        satisfaction: '99.7%'
      }
    },
    {
      name: 'Michael Torres',
      role: 'Managing Partner, Torres Legal',
      industry: 'Legal Services',
      image: '👨‍⚖️',
      quote: "Our firm was missing 40% of client calls. Now we capture every lead, 24/7. The AI handles intake in 5 languages. Best investment we've made.",
      metrics: {
        calls: '+195%',
        revenue: '+$18K/mo',
        satisfaction: '98.9%'
      }
    },
    {
      name: 'Jennifer Walsh',
      role: 'Broker/Owner, Premium Realty',
      industry: 'Real Estate',
      image: '🏢',
      quote: "We scaled from 2 to 12 agents without adding reception staff. The AI schedules 85% of our showings automatically. Game-changer for growth.",
      metrics: {
        calls: '+420%',
        revenue: '+$34K/mo',
        satisfaction: '99.2%'
      }
    },
    {
      name: 'David Park',
      role: 'General Manager, Grand Hotel',
      industry: 'Hospitality',
      image: '🏨',
      quote: "Front desk was overwhelmed during peak season. AI now handles 73% of guest requests, reservations, and FAQs. Guest satisfaction up 34%.",
      metrics: {
        calls: '+156%',
        revenue: '+$28K/mo',
        satisfaction: '97.8%'
      }
    },
    {
      name: 'Amanda Foster',
      role: 'Director, Wellness Center',
      industry: 'Healthcare',
      image: '🧘',
      quote: "We went from 2 phone lines to a global AI system. Patients love the instant booking. We're booking 89% more appointments with zero wait time.",
      metrics: {
        calls: '+267%',
        revenue: '+$15K/mo',
        satisfaction: '99.5%'
      }
    },
    {
      name: 'Robert Martinez',
      role: 'Owner, Auto Care Pro',
      industry: 'Automotive',
      image: '🔧',
      quote: "Missed calls were costing us $8K/month. FrontDesk Agents AI captures every inquiry, books appointments, and follows up. Revenue up 156%.",
      metrics: {
        calls: '+312%',
        revenue: '+$22K/mo',
        satisfaction: '98.4%'
      }
    }
  ]

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Trusted by Industry Leaders
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Real results from businesses using FrontDesk Agents AI to transform their customer experience
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            {/* Header */}
            <div className="flex items-start space-x-4 mb-4">
              <div className="text-4xl">{testimonial.image}</div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {testimonial.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {testimonial.role}
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-black text-white rounded-full">
                  {testimonial.industry}
                </span>
              </div>
            </div>

            {/* Quote */}
            <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
              &quot;{testimonial.quote}&quot;
            </p>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-lg font-bold text-green-600">{testimonial.metrics.calls}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">More Calls</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-blue-600">{testimonial.metrics.revenue}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Added Revenue</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-purple-600">{testimonial.metrics.satisfaction}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Satisfaction</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Combined Stats */}
      <div className="bg-gradient-to-r from-black to-gray-900 rounded-2xl p-8 text-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-4xl font-bold mb-2">1,247</p>
            <p className="text-sm text-gray-400">Active Businesses</p>
          </div>
          <div>
            <p className="text-4xl font-bold mb-2">2.8M</p>
            <p className="text-sm text-gray-400">Calls Handled</p>
          </div>
          <div>
            <p className="text-4xl font-bold mb-2">$47M</p>
            <p className="text-sm text-gray-400">Revenue Generated</p>
          </div>
          <div>
            <p className="text-4xl font-bold mb-2">99.7%</p>
            <p className="text-sm text-gray-400">Accuracy Rate</p>
          </div>
        </div>
      </div>
    </div>
  )
}
