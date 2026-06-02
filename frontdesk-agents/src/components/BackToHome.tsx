'use client'

import Link from 'next/link'
import { Home } from 'lucide-react'

export default function BackToHome({ className = '' }: { className?: string }) {
  return (
    <Link 
      href="/" 
      className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white transition-all duration-200 hover:scale-105 ${className}`}
    >
      <Home className="w-4 h-4" />
      <span>Back to Home</span>
    </Link>
  )
}
