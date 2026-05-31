'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Activity, Zap, TrendingUp, Shield, Clock,
  CheckCircle, AlertCircle, Play, Pause, RefreshCw,
  Code, Database, Server, BarChart3, Terminal,
  History, Lightbulb, Bug, ArrowUp, ArrowDown,
  Gauge, Network, Users, DollarSign, Phone, FileText,
  ChevronDown, ChevronRight, X, ExternalLink
} from 'lucide-react'

interface LogEntry {
  id?: number
  cycle: number
  level: 'info' | 'warning' | 'error' | 'success'
  message: string
  details?: Record<string, any>
  created_at?: string
}

interface StatusData {
  running: boolean
  cycleCount: number
  lastCycle: string | null
  nextCycle: string | null
  totalCycles: number
  successfulDeployments: number
  failedTests: number
  learningsStored: number
  config?: any
  currentMetrics?: any
  recentAnomalies?: any[]
  recentDeployments?: any[]
  cycleHistory?: any[]
}

export default function HarnessDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(true)
  const [status, setStatus] = useState<StatusData | null>(null)
  const [triggering, setTriggering] = useState(false)
  const [activeTab, setActiveTab] = useState<'status' | 'logs' | 'history'>('status')
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [logsLoading, setLogsLoading] = useState(false)
  const [expandedAnomalies, setExpandedAnomalies] = useState<Set<string>>(new Set())
  const [expandedDeployments, setExpandedDeployments] = useState<Set<string>>(new Set())
  const [showDetails, setShowDetails] = useState<string | null>(null)

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/harness/status')
      const data = await res.json()
      setStatus(data)
      setRunning(data.running)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch harness status:', error)
      setLoading(false)
    }
  }, [])

  const fetchLogs = useCallback(async () => {
    setLogsLoading(true)
    try {
      const res = await fetch('/api/harness/logs?limit=30')
      const data = await res.json()
      setLogs(data.logs || [])
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    }
    setLogsLoading(false)
  }, [])

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [fetchStatus])

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchLogs()
    }
  }, [activeTab, fetchLogs])

  const triggerCycle = async () => {
    setTriggering(true)
    try {
      const res = await fetch('/api/harness/trigger', { method: 'POST' })
      const data = await res.json()
      await fetchStatus()
      await fetchLogs()
    } catch (error) {
      console.error('Failed to trigger cycle:', error)
    }
    setTriggering(false)
  }

  const toggleAnomaly = (id: string) => {
    setExpandedAnomalies(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleDeployment = (id: string) => {
    setExpandedDeployments(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-400" />
      case 'error': return <X className="w-4 h-4 text-red-400" />
      default: return <Terminal className="w-4 h-4 text-blue-400" />
    }
  }

  const getLogBg = (level: string) => {
    switch (level) {
      case 'success': return 'bg-green-900/20 border-green-500/30'
      case 'warning': return 'bg-yellow-900/20 border-yellow-500/30'
      case 'error': return 'bg-red-900/20 border-red-500/30'
      default: return 'bg-blue-900/20 border-blue-500/30'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      default: return 'bg-blue-500'
    }
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
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              running ? 'bg-green-900/50 text-green-400' : 'bg-gray-800 text-gray-400'
            }`}>
              {running ? '● Active' : '○ Paused'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={triggerCycle}
              disabled={triggering}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-all active:scale-95"
            >
              {triggering ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              {triggering ? 'Running...' : 'Manual Cycle'}
            </button>
            <button
              onClick={() => setRunning(!running)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all active:scale-95 ${
                running
                  ? 'bg-yellow-600 hover:bg-yellow-500'
                  : 'bg-green-600 hover:bg-green-500'
              }`}
            >
              {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {running ? 'Pause' : 'Resume'}
            </button>
            <button
              onClick={fetchStatus}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Tab Bar */}
      <div className="border-b border-white/10 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            <TabButton
              icon={Gauge}
              label="Dashboard"
              active={activeTab === 'status'}
              onClick={() => setActiveTab('status')}
            />
            <TabButton
              icon={Terminal}
              label="Logs"
              badge={logs.length}
              active={activeTab === 'logs'}
              onClick={() => setActiveTab('logs')}
            />
            <TabButton
              icon={History}
              label="Cycle History"
              badge={status?.cycleHistory?.length || 0}
              active={activeTab === 'history'}
              onClick={() => setActiveTab('history')}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {activeTab === 'status' && (
          <>
            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatusCard
                title="Total Cycles"
                value={status?.totalCycles || 0}
                icon={RefreshCw}
                color="text-blue-400"
                bgColor="bg-blue-500/10"
              />
              <StatusCard
                title="Deployments"
                value={status?.successfulDeployments || 0}
                icon={CheckCircle}
                color="text-green-400"
                bgColor="bg-green-500/10"
              />
              <StatusCard
                title="Anomalies Detected"
                value={status?.failedTests || 0}
                icon={AlertCircle}
                color="text-orange-400"
                bgColor="bg-orange-500/10"
              />
              <StatusCard
                title="Learnings Stored"
                value={status?.learningsStored || 0}
                icon={Database}
                color="text-purple-400"
                bgColor="bg-purple-500/10"
              />
            </div>

            {/* Current Metrics */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.02] border border-white/10">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                Current System Metrics
                {status?.lastCycle && (
                  <span className="text-xs text-gray-500 font-normal ml-auto">
                    Last updated: {new Date(status.lastCycle).toLocaleTimeString()}
                  </span>
                )}
              </h2>
              {status?.currentMetrics ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <MetricItem
                      icon={Bug}
                      label="Error Rate"
                      value={`${((status.currentMetrics.errorRate || 0) * 100).toFixed(2)}%`}
                      status={status.currentMetrics.errorRate < 0.001 ? 'good' : 'bad'}
                      detail={`Threshold: < 0.1%`}
                    />
                    <MetricItem
                      icon={Gauge}
                      label="Avg Latency"
                      value={`${status.currentMetrics.avgLatencyMs || 0}ms`}
                      status={status.currentMetrics.avgLatencyMs < 500 ? 'good' : 'bad'}
                      detail={`Threshold: < 500ms`}
                    />
                    <MetricItem
                      icon={TrendingUp}
                      label="Conversion Rate"
                      value={`${((status.currentMetrics.conversionRate || 0) * 100).toFixed(1)}%`}
                      status={status.currentMetrics.conversionRate > 0.02 ? 'good' : 'bad'}
                      detail={`Threshold: > 2%`}
                    />
                    <MetricItem
                      icon={Users}
                      label="Churn Risk"
                      value={`${((status.currentMetrics.churnRate || 0) * 100).toFixed(1)}%`}
                      status={(status.currentMetrics.churnRate || 0) < 0.7 ? 'good' : 'bad'}
                      detail={`Threshold: < 70%`}
                    />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MetricItem
                      icon={DollarSign}
                      label="MRR"
                      value={`$${(status.currentMetrics.mrr || 0).toLocaleString()}`}
                      status="neutral"
                    />
                    <MetricItem
                      icon={DollarSign}
                      label="ARR"
                      value={`$${(status.currentMetrics.arr || 0).toLocaleString()}`}
                      status="neutral"
                    />
                    <MetricItem
                      icon={Users}
                      label="Active Customers"
                      value={status.currentMetrics.activeCustomers || 0}
                      status="neutral"
                    />
                    <MetricItem
                      icon={Phone}
                      label="Total Calls"
                      value={status.currentMetrics.totalCalls || 0}
                      status="neutral"
                    />
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>No metrics collected yet — run your first cycle to see data</p>
                </div>
              )}
            </div>

            {/* Recent Anomalies */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/[0.04] to-transparent border border-white/10">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                Recent Anomalies
                {status?.recentAnomalies && status.recentAnomalies.length > 0 && (
                  <span className="text-xs text-gray-500 font-normal ml-auto">
                    {status.recentAnomalies.length} detected
                  </span>
                )}
              </h2>
              {status?.recentAnomalies && status.recentAnomalies.length > 0 ? (
                <div className="space-y-2">
                  {status.recentAnomalies.slice(0, 5).map((anomaly: any) => (
                    <div
                      key={anomaly.id}
                      className="p-4 rounded-xl bg-black/40 border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
                      onClick={() => toggleAnomaly(anomaly.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`w-2 h-2 rounded-full ${getSeverityColor(anomaly.severity)}`} />
                            <span className="font-medium capitalize text-sm">
                              {anomaly.type.replace(/_/g, ' ')}
                            </span>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${
                              anomaly.severity === 'critical' ? 'bg-red-900/50 text-red-400' :
                              anomaly.severity === 'high' ? 'bg-orange-900/50 text-orange-400' :
                              anomaly.severity === 'medium' ? 'bg-yellow-900/50 text-yellow-400' :
                              'bg-blue-900/50 text-blue-400'
                            }`}>
                              {anomaly.severity}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400">{anomaly.description}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {anomaly.status === 'resolved' && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                          {expandedAnomalies.has(anomaly.id) ? (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                          )}
                        </div>
                      </div>
                      {expandedAnomalies.has(anomaly.id) && (
                        <div className="mt-3 pt-3 border-t border-white/10 text-xs text-gray-500 space-y-1">
                          <div><span className="text-gray-400">Component:</span> {anomaly.affectedComponent}</div>
                          <div><span className="text-gray-400">Detected:</span> {new Date(anomaly.detectedAt).toLocaleString()}</div>
                          {anomaly.resolvedAt && (
                            <div><span className="text-gray-400">Resolved:</span> {new Date(anomaly.resolvedAt).toLocaleString()}</div>
                          )}
                          {anomaly.metrics && (
                            <div>
                              <span className="text-gray-400">Metrics:</span>{' '}
                              <code className="text-gray-500">{JSON.stringify(anomaly.metrics)}</code>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {(status.recentAnomalies?.length || 0) > 5 && (
                    <p className="text-xs text-gray-500 text-center pt-2">
                      +{(status.recentAnomalies?.length || 0) - 5} more anomalies
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500/30" />
                  <p>No anomalies detected — all systems nominal</p>
                </div>
              )}
            </div>

            {/* Recent Deployments */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/[0.04] to-transparent border border-white/10">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Code className="w-5 h-5 text-green-400" />
                  Recent Deployments
                </h2>
                {status?.recentDeployments && status.recentDeployments.length > 0 ? (
                  <div className="space-y-2">
                    {status.recentDeployments.slice(0, 5).map((deployment: any) => (
                      <div
                        key={deployment.id}
                        className="p-3 rounded-xl bg-black/40 border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
                        onClick={() => toggleDeployment(deployment.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{deployment.hypothesis || deployment.id}</div>
                            {deployment.improvement && (
                              <p className="text-xs text-green-400 mt-0.5">+{deployment.improvement}</p>
                            )}
                          </div>
                          <span className={`px-2 py-0.5 text-xs rounded-full whitespace-nowrap ml-2 ${
                            deployment.status === 'completed' || deployment.status === 'applied'
                              ? 'bg-green-900/50 text-green-400'
                              : deployment.status === 'verified'
                              ? 'bg-blue-900/50 text-blue-400'
                              : deployment.status === 'rolled_back'
                              ? 'bg-red-900/50 text-red-400'
                              : 'bg-yellow-900/50 text-yellow-400'
                          }`}>
                            {deployment.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Code className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No deployments yet</p>
                  </div>
                )}
              </div>

              {/* System Info */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Server className="w-5 h-5 text-blue-400" />
                  System Controls
                </h2>
                <div className="space-y-3">
                  <InfoRow
                    icon={Server}
                    label="System Status"
                    value={running ? 'Autonomous Mode' : 'Paused'}
                    color={running ? 'text-green-400' : 'text-yellow-400'}
                  />
                  <InfoRow
                    icon={Clock}
                    label="Next Cycle"
                    value={status?.nextCycle ? new Date(status.nextCycle).toLocaleString() : 'N/A'}
                    color="text-blue-400"
                  />
                  <InfoRow
                    icon={History}
                    label="Last Cycle"
                    value={status?.lastCycle ? new Date(status.lastCycle).toLocaleString() : 'N/A'}
                    color="text-purple-400"
                  />
                  <InfoRow
                    icon={Lightbulb}
                    label="Learnings Collected"
                    value={status?.learningsStored || 0}
                    color="text-yellow-400"
                  />
                  <div className="pt-3 border-t border-white/10">
                    <div className="text-xs text-gray-500 mb-2">Configuration</div>
                    <div className="flex flex-wrap gap-2">
                      {status?.config && (
                        <>
                          <span className="px-2 py-1 bg-white/5 rounded text-xs text-gray-400">
                            Interval: {(status.config.cycleIntervalSeconds / 60).toFixed(0)}min
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            status.config.autoDeploy ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'
                          }`}>
                            {status.config.autoDeploy ? 'Auto-Deploy ON' : 'Auto-Deploy OFF'}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            status.config.sandboxMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-blue-900/30 text-blue-400'
                          }`}>
                            {status.config.sandboxMode ? 'Sandbox' : 'Production'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'logs' && (
          <div className="p-6 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Terminal className="w-5 h-5 text-blue-400" />
                Harness Engine Logs
              </h2>
              <button
                onClick={fetchLogs}
                disabled={logsLoading}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-50 rounded-lg text-sm transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${logsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
            <div className="space-y-1 max-h-[600px] overflow-y-auto">
              {logs.length > 0 ? (
                logs.map((log, idx) => (
                  <div
                    key={log.id || idx}
                    className={`flex items-start gap-3 p-2.5 rounded-lg border ${getLogBg(log.level)} hover:opacity-80 transition-opacity text-sm`}
                  >
                    <div className="mt-0.5 shrink-0">{getLogIcon(log.level)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-mono text-xs text-gray-300">{log.message}</span>
                        <span className="text-xs text-gray-500 shrink-0 whitespace-nowrap">
                          #{log.cycle}
                        </span>
                      </div>
                      {log.details && Object.keys(log.details).length > 0 && (
                        <div className="mt-1">
                          <code className="text-xs text-gray-500 font-mono block truncate">
                            {JSON.stringify(log.details)}
                          </code>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-600 shrink-0">
                      {log.created_at ? new Date(log.created_at).toLocaleTimeString() : ''}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Terminal className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>No logs yet — run a cycle to see activity</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-6 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-purple-400" />
              Cycle History
            </h2>
            {status?.cycleHistory && status.cycleHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400">
                      <th className="text-left py-3 px-2 font-medium">Cycle</th>
                      <th className="text-left py-3 px-2 font-medium">Time</th>
                      <th className="text-left py-3 px-2 font-medium">Duration</th>
                      <th className="text-center py-3 px-2 font-medium">Anomalies</th>
                      <th className="text-center py-3 px-2 font-medium">Deployments</th>
                      <th className="text-center py-3 px-2 font-medium">Learnings</th>
                      <th className="text-center py-3 px-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {status.cycleHistory.map((cycle: any) => (
                      <tr
                        key={cycle.cycle}
                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-3 px-2 font-mono text-blue-400">#{cycle.cycle}</td>
                        <td className="py-3 px-2 text-gray-400">
                          {new Date(cycle.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-3 px-2 text-gray-400">
                          {cycle.durationSeconds.toFixed(1)}s
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            cycle.anomaliesCount > 0
                              ? 'bg-orange-900/50 text-orange-400'
                              : 'bg-green-900/50 text-green-400'
                          }`}>
                            {cycle.anomaliesCount}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            cycle.deploymentsCount > 0
                              ? 'bg-blue-900/50 text-blue-400'
                              : 'text-gray-500'
                          }`}>
                            {cycle.deploymentsCount}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center text-gray-400">
                          {cycle.learnings}
                        </td>
                        <td className="py-3 px-2 text-center">
                          {cycle.success ? (
                            <CheckCircle className="w-4 h-4 text-green-500 inline-block" />
                          ) : (
                            <X className="w-4 h-4 text-red-500 inline-block" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <History className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No cycle history yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function TabButton({ icon: Icon, label, active, badge, onClick }: {
  icon: any
  label: string
  active: boolean
  badge?: number
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
        active
          ? 'border-blue-500 text-blue-400 bg-blue-500/5'
          : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
      {badge !== undefined && badge > 0 && (
        <span className="px-1.5 py-0.5 text-[10px] bg-white/10 rounded-full">{badge}</span>
      )}
    </button>
  )
}

function StatusCard({ title, value, icon: Icon, color, bgColor }: {
  title: string
  value: string | number
  icon: any
  color: string
  bgColor: string
}) {
  return (
    <div className={`p-5 rounded-2xl ${bgColor} border border-white/10`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-400 text-xs uppercase tracking-wider">{title}</span>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  )
}

function MetricItem({ icon: Icon, label, value, status, detail }: {
  icon: any
  label: string
  value: string | number
  status: 'good' | 'bad' | 'neutral'
  detail?: string
}) {
  return (
    <div className="p-4 rounded-xl bg-black/40 border border-white/10">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-3.5 h-3.5 text-gray-500" />
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <div className="text-lg font-bold">{value}</div>
      {status === 'good' && <div className="text-[10px] text-green-400 mt-1">✓ Normal</div>}
      {status === 'bad' && <div className="text-[10px] text-red-400 mt-1">⚠ Alert</div>}
      {detail && <div className="text-[10px] text-gray-600 mt-0.5">{detail}</div>}
    </div>
  )
}

function InfoRow({ icon: Icon, label, value, color }: {
  icon: any
  label: string
  value: string | number
  color: string
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <span className={`text-sm font-medium ${color}`}>{value}</span>
    </div>
  )
}
