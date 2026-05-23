'use client'

import { useState, useEffect, useCallback } from 'react'
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Activity, Zap, Target, BarChart3, RefreshCw, Play, Pause, Sun, Moon } from 'lucide-react'

interface Signal {
  id: string
  type: string
  name: string
  value: number
  threshold: number
  status: 'normal' | 'warning' | 'critical'
  trend: 'improving' | 'stable' | 'degrading'
}

interface Pattern {
  id: string
  name: string
  confidence: number
  recommendedAction: string
  status: 'detected' | 'analyzing' | 'actioned'
}

interface Experiment {
  id: string
  name: string
  hypothesis: string
  status: 'running' | 'completed' | 'failed'
  trafficPercent: number
  improvement: number | null
}

export default function CoLearningDashboard() {
  const [isDarkMode, useState(true)
  const [signals, setSignals] = useState<Signal[]>([])
  const [patterns, setPatterns] = useState<Pattern[]>([])
  const [autoImprove, setAutoImprove] = useState(true)

  useEffect(() => {
    const mockSignals: Signal[] = [
      { id: '1', type: 'user_behavior', name: 'Signup Completion Rate', value: 67, threshold: 70, status: 'warning', trend: 'degrading' },
      { id: '2', type: 'performance', name: 'API Response Time (ms)', value: 245, threshold: 300, status: 'normal', trend: 'improving' },
      { id: '3', type: 'business', name: 'Conversion Rate (%)', value: 3.2, threshold: 3.0, status: 'normal', trend: 'improving' },
      { id: '4', type: 'ai_quality', name: 'Response Accuracy', value: 89, threshold: 85, status: 'normal', trend: 'stable' },
    ]
    setSignals(mockSignals)

    const mockPatterns: Pattern[] = [
      { id: 'p1', name: 'Signup Form Friction', confidence: 87, recommendedAction: 'Reduce form fields from 6 to 3', status: 'detected' },
      { id: 'p2', name: 'Performance Optimization Working', confidence: 92, recommendedAction: 'Continue current strategy', status: 'actioned' },
    ]
    setPatterns(mockPatterns)
  }, [])

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
      <nav className={`sticky top-0 z-50 border-b ${isDarkMode ? 'bg-black/80 border-white/10' : 'bg-white/80 border-gray-200'} backdrop-blur-md`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f0b429, #c4920a)' }}>
              <Brain className="w-6 h-6" style={{ color: '#050810' }} />
            </div>
            <div>
              <h1 className="text-lg font-bold">Co-Learning Engine</h1>
              <p className="text-xs" style={{ color: '#f0b429' }}>Autonomous Self-Improvement</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setAutoImprove(!autoImprove)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${autoImprove ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' : isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}
            >
              {autoImprove ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {autoImprove ? 'Auto-Improve ON' : 'OFF'}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Signals */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Activity className="w-6 h-6" style={{ color: '#f0b429' }} />
            Live Signals
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {signals.map(signal => (
              <div key={signal.id} className={`p-4 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{signal.type}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${signal.status === 'normal' ? 'bg-green-500/20 text-green-400' : signal.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                    {signal.status}
                  </span>
                </div>
                <p className="text-sm font-medium mb-1">{signal.name}</p>
                <p className="text-2xl font-bold">{signal.value}</p>
                <div className="flex items-center gap-2 mt-2 text-xs">
                  <TrendingUp className={`w-3 h-3 ${signal.trend === 'improving' ? 'text-green-400' : signal.trend === 'degrading' ? 'text-red-400' : 'text-gray-400'}`} />
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{signal.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Patterns */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Target className="w-6 h-6" style={{ color: '#f0b429' }} />
            Detected Patterns
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {patterns.map(pattern => (
              <div key={pattern.id} className={`p-4 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold">{pattern.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">{pattern.confidence}% confidence</span>
                </div>
                <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{pattern.recommendedAction}</p>
                <button className="w-full py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold text-sm hover:from-yellow-500 hover:to-yellow-700 transition">
                  Run Experiment
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Loop Status */}
        <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <RefreshCw className={`w-6 h-6 ${autoImprove ? 'animate-spin' : ''}`} style={{ color: '#f0b429' }} />
            Co-Learning Loop Status
          </h2>
          <div className="grid md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold" style={{ color: '#f0b429' }}>24</p>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Signals/Day</p>
            </div>
            <div>
              <p className="text-3xl font-bold" style={{ color: '#f0b429' }}>8</p>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Patterns Found</p>
            </div>
            <div>
              <p className="text-3xl font-bold" style={{ color: '#f0b429' }}>12</p>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Experiments Run</p>
            </div>
            <div>
              <p className="text-3xl font-bold" style={{ color: '#f0b429' }}>91%</p>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Success Rate</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
