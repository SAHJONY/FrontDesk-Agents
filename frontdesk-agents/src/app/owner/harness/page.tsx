'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Activity, Zap, TrendingUp, Shield, Clock, 
  CheckCircle, AlertCircle, Play, Pause, RefreshCw,
  Code, Database, Server, BarChart3
} from 'lucide-react'

export default function HarnessDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(true)
  const [status, setStatus] = useState<any>(null)
  const [triggering, setTriggering] = useState(false)

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/harness/status')
      const data = await res.json()
      setStatus(data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch harness status:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const triggerCycle = async () => {
    setTriggering(true)
    try {
      await fetch('/api/harness/trigger', { method: 'POST' })
      await fetchStatus()
    } catch (error) {
      console.error('Failed to trigger cycle:', error)
    }
    setTriggering(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-400">Loading Autonomous Harness...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-blue-500" />
            <h1 className="text-xl font-bold">Autonomous Harness Engine</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={triggerCycle}
              disabled={triggering}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 rounded-lg transition-colors"
            >
              {triggering ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {triggering ? 'Running...' : 'Run Cycle'}
            </button>
            <button
              onClick={() => setRunning(!running)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors"
            >
              {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {running ? 'Running' : 'Paused'}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatusCard
            title="Total Cycles"
            value={status?.totalCycles || 0}
            icon={RefreshCw}
            color="text-blue-400"
          />
          <StatusCard
            title="Successful Deployments"
            value={status?.successfulDeployments || 0}
            icon={CheckCircle}
            color="text-green-400"
          />
          <StatusCard
            title="Failed Tests"
            value={status?.failedTests || 0}
            icon={AlertCircle}
            color="text-red-400"
          />
          <StatusCard
            title="Learnings Stored"
            value={status?.learningsStored || 0}
            icon={Database}
            color="text-purple-400"
          />
        </div>

        {/* Current Metrics */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Current System Metrics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricItem
              label="Error Rate"
              value={`${(status?.currentMetrics?.errorRate || 0) * 100}%`}
              status={status?.currentMetrics?.errorRate < 0.001 ? 'good' : 'bad'}
            />
            <MetricItem
              label="Avg Latency"
              value={`${status?.currentMetrics?.avgLatencyMs || 0}ms`}
              status={status?.currentMetrics?.avgLatencyMs < 500 ? 'good' : 'bad'}
            />
            <MetricItem
              label="Conversion Rate"
              value={`${(status?.currentMetrics?.conversionRate || 0) * 100}%`}
              status="neutral"
            />
            <MetricItem
              label="Churn Risk"
              value={`${(status?.currentMetrics?.churnRisk || 0) * 100}%`}
              status={status?.currentMetrics?.churnRisk < 0.7 ? 'good' : 'bad'}
            />
          </div>
        </div>

        {/* Recent Anomalies */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            Recent Anomalies
          </h2>
          {status?.recentAnomalies?.length > 0 ? (
            <div className="space-y-3">
              {status.recentAnomalies.map((anomaly: any) => (
                <div
                  key={anomaly.id}
                  className="p-4 rounded-xl bg-black/50 border border-white/10"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2 h-2 rounded-full ${
                          anomaly.severity === 'critical' ? 'bg-red-500' :
                          anomaly.severity === 'high' ? 'bg-orange-500' :
                          anomaly.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`} />
                        <span className="font-medium capitalize">{anomaly.type.replace('_', ' ')}</span>
                      </div>
                      <p className="text-sm text-gray-400">{anomaly.description}</p>
                    </div>
                    {anomaly.status === 'resolved' && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No recent anomalies</p>
          )}
        </div>

        {/* Recent Deployments */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Code className="w-5 h-5 text-green-400" />
            Recent Deployments
          </h2>
          {status?.recentDeployments?.length > 0 ? (
            <div className="space-y-3">
              {status.recentDeployments.map((deployment: any) => (
                <div
                  key={deployment.id}
                  className="p-4 rounded-xl bg-black/50 border border-white/10"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium mb-1">{deployment.hypothesis}</div>
                      <p className="text-sm text-gray-400">{deployment.improvement}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-900/50 text-green-400 text-xs rounded-full capitalize">
                      {deployment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No recent deployments</p>
          )}
        </div>

        {/* System Info */}
        <div className="grid md:grid-cols-3 gap-6">
          <InfoCard
            icon={Server}
            title="System Status"
            value={running ? 'Autonomous Mode' : 'Paused'}
            color="text-green-400"
          />
          <InfoCard
            icon={Clock}
            title="Next Cycle"
            value={status?.nextCycle ? new Date(status.nextCycle).toLocaleTimeString() : 'N/A'}
            color="text-blue-400"
          />
          <InfoCard
            icon={TrendingUp}
            title="Last Cycle"
            value={status?.lastCycle ? new Date(status.lastCycle).toLocaleTimeString() : 'N/A'}
            color="text-purple-400"
          />
        </div>
      </div>
    </div>
  )
}

function StatusCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-400 text-sm">{title}</span>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
    </div>
  )
}

function MetricItem({ label, value, status }: any) {
  return (
    <div className="p-4 rounded-xl bg-black/50 border border-white/10">
      <div className="text-sm text-gray-400 mb-1">{label}</div>
      <div className="text-xl font-bold">{value}</div>
      {status === 'good' && <div className="text-xs text-green-400 mt-1">✓ Normal</div>}
      {status === 'bad' && <div className="text-xs text-red-400 mt-1">⚠ Alert</div>}
    </div>
  )
}

function InfoCard({ icon: Icon, title, value, color }: any) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-5 h-5 ${color}`} />
        <span className="text-gray-400 text-sm">{title}</span>
      </div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  )
}
