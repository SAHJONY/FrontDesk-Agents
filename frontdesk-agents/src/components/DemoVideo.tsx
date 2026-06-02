'use client'

import { useState } from 'react'
import { Play, X } from 'lucide-react'

export function DemoVideo() {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <div className="relative">
      {!isPlaying ? (
        <div 
          className="relative aspect-video bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden cursor-pointer group"
          onClick={() => setIsPlaying(true)}
        >
          {/* Thumbnail */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Play className="w-8 h-8 text-white ml-1" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                See FrontDesk Agents AI in Action
              </h3>
              <p className="text-gray-400">
                Watch how our AI handles real customer conversations
              </p>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-xs text-white">
            2:34 min
          </div>
          
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div className="flex gap-2">
              {['AI Receptionist', 'Multi-language', '24/7 Availability'].map((tag) => (
                <span key={tag} className="px-2 py-1 bg-white/10 backdrop-blur-sm rounded text-xs text-white">
                  {tag}
                </span>
              ))}
            </div>
            <div className="text-white text-sm">4K</div>
          </div>
        </div>
      ) : (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setIsPlaying(false)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div className="w-full max-w-4xl aspect-video bg-black rounded-lg flex items-center justify-center">
            <div className="text-center text-white">
              <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Demo video would play here</p>
              <p className="text-sm text-gray-400 mt-2">
                (Integrate with Loom, Wistia, or YouTube in production)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
