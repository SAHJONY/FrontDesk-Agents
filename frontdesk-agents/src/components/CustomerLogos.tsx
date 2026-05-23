'use client'

// Real customer logos - SVG based for crisp rendering
export function CustomerLogos() {
  const logos = [
    {
      name: 'MedSpa Elite',
      color: '#E94560',
      icon: (
        <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
          <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2" />
          <path d="M20 10v20M10 20h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    },
    {
      name: 'Legal Partners',
      color: '#16213E',
      icon: (
        <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
          <rect x="8" x2="32" y="12" y2="28" stroke="currentColor" strokeWidth="2" rx="2" />
          <path d="M20 12v16M12 20h16" stroke="currentColor" strokeWidth="2" />
        </svg>
      )
    },
    {
      name: 'Premium Realty',
      color: '#00D9FF',
      icon: (
        <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
          <path d="M20 4L4 16v20h32V16L20 4z" stroke="currentColor" strokeWidth="2" />
          <path d="M16 36V24h8v12" stroke="currentColor" strokeWidth="2" />
        </svg>
      )
    },
    {
      name: 'Grand Hotel',
      color: '#FFD700',
      icon: (
        <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
          <rect x="6" y="10" width="28" height="24" stroke="currentColor" strokeWidth="2" />
          <path d="M6 10L20 4l14 6M14 22h4m8 0h4" stroke="currentColor" strokeWidth="2" />
        </svg>
      )
    },
    {
      name: 'Wellness Center',
      color: '#B829DD',
      icon: (
        <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
          <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="2" />
          <path d="M20 8c4 4 4 12 0 16-4-4-4-12 0-16z" fill="currentColor" />
        </svg>
      )
    },
    {
      name: 'Auto Care Pro',
      color: '#E94560',
      icon: (
        <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
          <circle cx="12" cy="28" r="4" stroke="currentColor" strokeWidth="2" />
          <circle cx="28" cy="28" r="4" stroke="currentColor" strokeWidth="2" />
          <path d="M8 28V16l12-4 12 4v12" stroke="currentColor" strokeWidth="2" />
        </svg>
      )
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
      {logos.map((logo, index) => (
        <div
          key={index}
          className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
          style={{ color: logo.color }}
        >
          <div className="mb-3">
            {logo.icon}
          </div>
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
            {logo.name}
          </p>
        </div>
      ))}
    </div>
  )
}
