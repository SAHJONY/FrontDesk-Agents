/**
 * BUFFY & HERMES REAL-TIME MONITORING & ANALYTICS
 * Live dashboard for system performance and business intelligence
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Zap, Activity, TrendingUp, TrendingDown, AlertTriangle, 
  Clock, DollarSign, Users, MessageSquare, Bot, 
  Server, Globe, Radio, Signal, Cpu
} from 'lucide-react';

// ============================================================================
// LIVE METRICS COMPONENT
// ============================================================================

interface LiveMetric {
  label: string;
  value: number;
  previousValue: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'healthy' | 'warning' | 'critical';
  sparkline: number[];
}

const LiveMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<LiveMetric[]>([]);
  
  useEffect(() => {
    const initialMetrics: LiveMetric[] = [
      { label: 'Active Conversations', value: 147, previousValue: 142, unit: 'conversations', trend: 'up', status: 'healthy', sparkline: [40, 45, 42, 48, 52, 50, 55, 58, 62, 68, 72, 78] },
      { label: 'AI Response Time', value: 1.2, previousValue: 1.4, unit: 'seconds', trend: 'down', status: 'healthy', sparkline: [2.1, 1.9, 1.8, 1.6, 1.5, 1.4, 1.3, 1.2, 1.2, 1.1, 1.2, 1.2] },
      { label: 'Customer Satisfaction', value: 94.7, previousValue: 93.2, unit: '%', trend: 'up', status: 'healthy', sparkline: [90, 91, 89, 92, 91, 93, 92, 94, 93, 94, 94, 95] },
      { label: 'Revenue Today', value: 12847, previousValue: 11250, unit: '$', trend: 'up', status: 'healthy', sparkline: [5000, 6200, 7100, 8500, 9200, 9800, 10500, 11200, 11800, 12200, 12500, 12847] }
    ];
    
    setMetrics(initialMetrics);
    
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.label.includes('Revenue') ? metric.value + Math.floor(Math.random() * 100) : metric.label === 'Active Conversations' ? metric.value + Math.floor(Math.random() * 5 - 2) : parseFloat((metric.value + (Math.random() - 0.5) * 0.1).toFixed(2)),
        sparkline: [...metric.sparkline.slice(1), metric.value + (Math.random() - 0.5) * 10]
      })));
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4`}>
      {metrics.map((metric, i) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`relative bg-gradient-to-br from-slate-900/90 to-slate-800/50 backdrop-blur-xl rounded-2xl p-5 border border-white/10 overflow-hidden group hover:border-cyan-500/30 transition-all duration-300`}
        >
          <div className={`absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
          
          <div className={`relative z-10`}>
            <div className={`flex items-center justify-between mb-3`}>
              <span className={`text-gray-400 text-xs font-medium uppercase tracking-wider`}>{metric.label}</span>
              <div className={`p-1.5 rounded-lg ${metric.status === 'healthy' ? 'bg-green-500/20 text-green-400' : metric.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                {metric.trend === 'up' ? <TrendingUp className={`w-3 h-3`} /> : metric.trend === 'down' ? <TrendingDown className={`w-3 h-3`} /> : <Activity className={`w-3 h-3`} />}
              </div>
            </div>
            
            <div className={`flex items-end gap-2`}>
              <span className={`text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent`}>
                {metric.label.includes('Revenue') ? '$' : ''}{metric.value.toLocaleString()}
              </span>
              {!metric.label.includes('Revenue') && <span className={`text-gray-500 text-sm mb-1`}>{metric.unit}</span>}
            </div>
            
            <div className={`mt-3 h-12 flex items-end gap-0.5`}>
              {metric.sparkline.map((val, idx) => (
                <motion.div
                  key={idx}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(10, (val / Math.max(...metric.sparkline)) * 100)}%` }}
                  transition={{ duration: 0.5, delay: idx * 0.02 }}
                  className={`flex-1 rounded-sm ${idx === metric.sparkline.length - 1 ? 'bg-gradient-to-t from-cyan-500 to-cyan-300' : 'bg-slate-600/50'}`}
                />
              ))}
            </div>
            
            <div className={`mt-2 flex items-center gap-1 text-xs`}>
              <span className={metric.trend === 'up' ? 'text-green-400' : metric.trend === 'down' ? 'text-red-400' : 'text-gray-400'}>
                {metric.trend === 'up' ? '+' : metric.trend === 'down' ? '-' : ''}{Math.abs(((metric.value - metric.previousValue) / metric.previousValue * 100)).toFixed(1)}%
              </span>
              <span className={`text-gray-500`}>vs last hour</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// ============================================================================
// BUFFY & HERMES STATUS PANEL
// ============================================================================

interface AgentStatusData {
  name: string;
  role: string;
  status: 'active' | 'processing' | 'idle';
  avatar: string;
  color: string;
  metrics: { decisions: number; accuracy: number; responseTime: string };
  currentTask?: string;
}

const AgentStatusPanel: React.FC = () => {
  const [buffy] = useState<AgentStatusData>({
    name: 'BUFFY', role: 'Strategic Orchestrator', status: 'active', avatar: '🧠', color: '#00f5ff',
    metrics: { decisions: 2847, accuracy: 97.3, responseTime: '0.8ms' }, currentTask: 'Analyzing customer sentiment patterns'
  });
  
  const [hermes] = useState<AgentStatusData>({
    name: 'HERMES', role: 'Communication Executor', status: 'processing', avatar: '⚡', color: '#ffd700',
    metrics: { decisions: 3842, accuracy: 99.1, responseTime: '0.3ms' }, currentTask: 'Delivering 147 messages in parallel'
  });
  
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4`}>
      {[buffy, hermes].map((agent, i) => (
        <motion.div
          key={agent.name}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.15 }}
          className={`relative bg-gradient-to-br from-slate-900/90 to-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10 overflow-hidden`}
        >
          <div className={`absolute top-0 left-0 right-0 h-1 opacity-60`} style={{ background: `linear-gradient(90deg, transparent, ${agent.color}, transparent)` }} />
          
          <div className={`flex items-start gap-4`}>
            <div className={`relative`}>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl`} style={{ background: `linear-gradient(135deg, ${agent.color}20, ${agent.color}05)`, border: `2px solid ${agent.color}40` }}>
                {agent.avatar}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-slate-900 ${agent.status === 'active' ? 'bg-green-500' : agent.status === 'processing' ? 'bg-yellow-500 animate-pulse' : 'bg-gray-500'}`} />
            </div>
            
            <div className={`flex-1`}>
              <div className={`flex items-center gap-2 mb-1`}>
                <h3 className={`text-white font-bold text-lg`}>{agent.name}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium`} style={{ background: `${agent.color}20`, color: agent.color, border: `1px solid ${agent.color}40` }}>
                  {agent.status}
                </span>
              </div>
              <p className={`text-gray-400 text-sm mb-3`}>{agent.role}</p>
              
              {agent.currentTask && (
                <div className={`flex items-center gap-2 text-xs text-gray-500 mb-3`}>
                  <Radio className={`w-3 h-3 animate-pulse`} style={{ color: agent.color }} />
                  <span>{agent.currentTask}</span>
                </div>
              )}
              
              <div className={`grid grid-cols-3 gap-3`}>
                <div className={`bg-slate-800/50 rounded-xl p-2 text-center`}>
                  <div className={`text-white font-bold text-sm`}>{agent.metrics.decisions.toLocaleString()}</div>
                  <div className={`text-gray-500 text-xs`}>Decisions</div>
                </div>
                <div className={`bg-slate-800/50 rounded-xl p-2 text-center`}>
                  <div className={`text-green-400 font-bold text-sm`}>{agent.metrics.accuracy}%</div>
                  <div className={`text-gray-500 text-xs`}>Accuracy</div>
                </div>
                <div className={`bg-slate-800/50 rounded-xl p-2 text-center`}>
                  <div className={`text-cyan-400 font-bold text-sm`}>{agent.metrics.responseTime}</div>
                  <div className={`text-gray-500 text-xs`}>Speed</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className={`mt-4 h-1 bg-slate-800 rounded-full overflow-hidden`}>
            <motion.div className={`h-full rounded-full`} style={{ background: agent.color }} initial={{ width: '0%' }} animate={{ width: agent.status === 'processing' ? '100%' : '75%' }} transition={{ duration: 2, repeat: agent.status === 'processing' ? Infinity : 0 }} />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// ============================================================================
// LIVE ACTIVITY FEED
// ============================================================================

interface ActivityItem {
  id: string;
  type: 'decision' | 'message' | 'sale' | 'escalation' | 'learning';
  title: string;
  description: string;
  timestamp: Date;
  agent?: 'buffy' | 'hermes';
}

const LiveActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  
  useEffect(() => {
    const initial: ActivityItem[] = [
      { id: '1', type: 'decision', title: 'Upsell recommended', description: 'Enterprise customer qualified for premium upgrade', timestamp: new Date(), agent: 'buffy' },
      { id: '2', type: 'message', title: 'Message delivered', description: '147 messages successfully delivered in 0.3ms avg', timestamp: new Date(Date.now() - 10000), agent: 'hermes' },
      { id: '3', type: 'sale', title: 'Conversion achieved', description: 'Pro tier subscription completed - $99/mo', timestamp: new Date(Date.now() - 25000) },
      { id: '4', type: 'learning', title: 'Pattern learned', description: 'New escalation pattern identified and saved', timestamp: new Date(Date.now() - 40000), agent: 'buffy' },
      { id: '5', type: 'escalation', title: 'Escalation handled', description: 'Critical support request routed to specialist', timestamp: new Date(Date.now() - 60000) }
    ];
    setActivities(initial);
    
    const types: ActivityItem['type'][] = ['decision', 'message', 'sale', 'escalation', 'learning'];
    const titles: Record<ActivityItem['type'], string[]> = {
      decision: ['Strategy optimized', 'Customer segmented', 'Priority adjusted', 'Resource allocated'],
      message: ['Response delivered', 'Email sent', 'Notification pushed', 'Follow-up scheduled'],
      sale: ['Upgrade converted', 'Add-on purchased', 'Renewal secured', 'Cross-sell successful'],
      escalation: ['Specialist assigned', 'Manager notified', 'SLA extended', 'Issue resolved'],
      learning: ['Pattern updated', 'Model retrained', 'Accuracy improved', 'New rule added']
    };
    
    const interval = setInterval(() => {
      const type = types[Math.floor(Math.random() * types.length)];
      const newActivity: ActivityItem = {
        id: `act-${Date.now()}`, type, title: titles[type][Math.floor(Math.random() * titles[type].length)],
        description: ['Last 5 minutes', 'Real-time', 'AI-powered', 'Automated'][Math.floor(Math.random() * 4)],
        timestamp: new Date(), agent: Math.random() > 0.5 ? 'buffy' : 'hermes'
      };
      setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);
  
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'decision': return <Brain className={`w-4 h-4 text-cyan-400`} />;
      case 'message': return <MessageSquare className={`w-4 h-4 text-yellow-400`} />;
      case 'sale': return <DollarSign className={`w-4 h-4 text-green-400`} />;
      case 'escalation': return <AlertTriangle className={`w-4 h-4 text-red-400`} />;
      case 'learning': return <Cpu className={`w-4 h-4 text-purple-400`} />;
    }
  };
  
  return (
    <div className={`bg-gradient-to-br from-slate-900/90 to-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10`}>
      <div className={`flex items-center justify-between mb-4`}>
        <h3 className={`text-white font-bold flex items-center gap-2`}>
          <Signal className={`w-4 h-4 text-green-400 animate-pulse`} />
          Live Activity
        </h3>
        <span className={`text-xs text-gray-500`}>{activities.length} events</span>
      </div>
      
      <div className={`space-y-3 max-h-80 overflow-y-auto`}>
        <AnimatePresence>
          {activities.map((activity) => (
            <motion.div key={activity.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}
              className={`flex items-start gap-3 p-3 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors group`}
            >
              <div className={`p-2 bg-slate-800 rounded-lg`}>{getActivityIcon(activity.type)}</div>
              <div className={`flex-1 min-w-0`}>
                <div className={`flex items-center gap-2`}>
                  <span className={`text-white text-sm font-medium`}>{activity.title}</span>
                  {activity.agent && (
                    <span className={`text-xs px-1.5 py-0.5 rounded ${activity.agent === 'buffy' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {activity.agent.toUpperCase()}
                    </span>
                  )}
                </div>
                <p className={`text-gray-500 text-xs mt-0.5`}>{activity.description}</p>
              </div>
              <span className={`text-gray-600 text-xs whitespace-nowrap`}>{Math.floor((Date.now() - activity.timestamp.getTime()) / 1000)}s ago</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ============================================================================
// SYSTEM HEALTH MONITOR
// ============================================================================

interface SystemComponent {
  name: string;
  status: 'operational' | 'degraded' | 'offline';
  latency: number;
  uptime: number;
  requests: number;
}

const SystemHealthMonitor: React.FC = () => {
  const [components] = useState<SystemComponent[]>([
    { name: 'BUFFY Core', status: 'operational', latency: 0.8, uptime: 99.99, requests: 125847 },
    { name: 'HERMES Engine', status: 'operational', latency: 0.3, uptime: 99.98, requests: 384291 },
    { name: 'NLP Engine', status: 'operational', latency: 1.2, uptime: 99.95, requests: 94521 },
    { name: 'Learning System', status: 'operational', latency: 2.1, uptime: 99.87, requests: 12458 },
    { name: 'Analytics DB', status: 'operational', latency: 5.4, uptime: 99.99, requests: 847521 },
    { name: 'Message Queue', status: 'operational', latency: 0.1, uptime: 100, requests: 847521 }
  ]);
  
  return (
    <div className={`bg-gradient-to-br from-slate-900/90 to-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10`}>
      <div className={`flex items-center justify-between mb-5`}>
        <h3 className={`text-white font-bold flex items-center gap-2`}>
          <Server className={`w-4 h-4 text-cyan-400`} />
          System Health
        </h3>
        <div className={`flex items-center gap-2`}>
          <div className={`w-2 h-2 rounded-full bg-green-500 animate-pulse`} />
          <span className={`text-green-400 text-sm font-medium`}>99.97% Healthy</span>
        </div>
      </div>
      
      <div className={`space-y-3`}>
        {components.map((component, i) => (
          <motion.div key={component.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={`flex items-center gap-4 p-3 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors`}
          >
            <div className={`w-2 h-2 rounded-full ${component.status === 'operational' ? 'bg-green-500' : component.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'}`} />
            <div className={`flex-1`}>
              <div className={`flex items-center justify-between`}>
                <span className={`text-white text-sm font-medium`}>{component.name}</span>
                <span className={`text-gray-500 text-xs`}>{component.latency}ms</span>
              </div>
              <div className={`mt-1.5 h-1 bg-slate-700 rounded-full overflow-hidden`}>
                <div className={`h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full`} style={{ width: `${component.uptime}%` }} />
              </div>
            </div>
            <div className={`text-right`}>
              <div className={`text-white text-sm font-medium`}>{component.requests.toLocaleString()}</div>
              <div className={`text-gray-500 text-xs`}>requests</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// BUSINESS INTELLIGENCE PANEL
// ============================================================================

const BusinessIntelligencePanel: React.FC = () => {
  const [data] = useState({
    totalRevenue: 128472, monthlyGrowth: 23.4, activeCustomers: 847, customerGrowth: 12.8,
    conversionRate: 4.7, conversionChange: 0.8, avgOrderValue: 156, aovChange: 5.2
  });
  
  return (
    <div className={`bg-gradient-to-br from-slate-900/90 to-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10`}>
      <h3 className={`text-white font-bold flex items-center gap-2 mb-5`}>
        <Globe className={`w-4 h-4 text-cyan-400`} />
        Business Intelligence
      </h3>
      
      <div className={`grid grid-cols-2 gap-4`}>
        <div className={`bg-slate-800/30 rounded-xl p-4`}>
          <div className={`flex items-center justify-between mb-2`}>
            <span className={`text-gray-400 text-xs`}>Total Revenue</span>
            <DollarSign className={`w-4 h-4 text-green-400`} />
          </div>
          <div className={`text-2xl font-bold text-white mb-1`}>${data.totalRevenue.toLocaleString()}</div>
          <div className={`flex items-center gap-1 text-green-400 text-xs`}>
            <TrendingUp className={`w-3 h-3`} />+{data.monthlyGrowth}% this month
          </div>
        </div>
        
        <div className={`bg-slate-800/30 rounded-xl p-4`}>
          <div className={`flex items-center justify-between mb-2`}>
            <span className={`text-gray-400 text-xs`}>Active Customers</span>
            <Users className={`w-4 h-4 text-cyan-400`} />
          </div>
          <div className={`text-2xl font-bold text-white mb-1`}>{data.activeCustomers}</div>
          <div className={`flex items-center gap-1 text-green-400 text-xs`}>
            <TrendingUp className={`w-3 h-3`} />+{data.customerGrowth}% growth
          </div>
        </div>
        
        <div className={`bg-slate-800/30 rounded-xl p-4`}>
          <div className={`flex items-center justify-between mb-2`}>
            <span className={`text-gray-400 text-xs`}>Conversion Rate</span>
            <Activity className={`w-4 h-4 text-yellow-400`} />
          </div>
          <div className={`text-2xl font-bold text-white mb-1`}>{data.conversionRate}%</div>
          <div className={`flex items-center gap-1 text-green-400 text-xs`}>
            <TrendingUp className={`w-3 h-3`} />+{data.conversionChange}% improvement
          </div>
        </div>
        
        <div className={`bg-slate-800/30 rounded-xl p-4`}>
          <div className={`flex items-center justify-between mb-2`}>
            <span className={`text-gray-400 text-xs`}>Avg Order Value</span>
            <TrendingUp className={`w-4 h-4 text-purple-400`} />
          </div>
          <div className={`text-2xl font-bold text-white mb-1`}>${data.avgOrderValue}</div>
          <div className={`flex items-center gap-1 text-green-400 text-xs`}>
            <TrendingUp className={`w-3 h-3`} />+{data.aovChange}% increase
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

export const MonitoringDashboard: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => { setIsVisible(true); }, []);
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl overflow-auto`}>
          <div className={`sticky top-0 z-10 bg-slate-900/80 backdrop-blur-xl border-b border-white/5 px-6 py-4`}>
            <div className={`max-w-7xl mx-auto flex items-center justify-between`}>
              <div className={`flex items-center gap-4`}>
                <div className={`flex items-center gap-3`}>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-xl`}>🧠⚡</div>
                  <div>
                    <h1 className={`text-white font-bold text-xl`}>BUFFY & HERMES Control Center</h1>
                    <p className={`text-gray-400 text-sm`}>Real-time AI Performance Monitoring</p>
                  </div>
                </div>
              </div>
              <div className={`flex items-center gap-4`}>
                <div className={`flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full`}>
                  <div className={`w-2 h-2 rounded-full bg-green-500 animate-pulse`} />
                  <span className={`text-green-400 text-sm font-medium`}>System Online</span>
                </div>
                <div className={`text-right`}>
                  <div className={`text-white text-sm font-medium`}>{new Date().toLocaleTimeString()}</div>
                  <div className={`text-gray-500 text-xs`}>{new Date().toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className={`max-w-7xl mx-auto p-6 space-y-6`}>
            <div>
              <h2 className={`text-white font-bold mb-4 flex items-center gap-2`}><Activity className={`w-5 h-5 text-cyan-400`} />Live Metrics</h2>
              <LiveMetrics />
            </div>
            
            <div>
              <h2 className={`text-white font-bold mb-4 flex items-center gap-2`}><Brain className={`w-5 h-5 text-cyan-400`} />AI Agent Status</h2>
              <AgentStatusPanel />
            </div>
            
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6`}>
              <LiveActivityFeed />
              <SystemHealthMonitor />
            </div>
            
            <BusinessIntelligencePanel />
            
            <div className={`bg-gradient-to-br from-slate-900/90 to-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10`}>
              <h3 className={`text-white font-bold mb-4 flex items-center gap-2`}><Zap className={`w-5 h-5 text-yellow-400`} />Quick Actions</h3>
              <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4`}>
                {[{ label: 'Optimize Decisions', icon: Brain, color: 'cyan' }, { label: 'Run Diagnostics', icon: Activity, color: 'green' }, { label: 'View Logs', icon: Server, color: 'purple' }, { label: 'Generate Report', icon: TrendingUp, color: 'yellow' }].map((action, i) => (
                  <motion.button key={action.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className={`p-4 bg-slate-800/50 rounded-xl border border-white/10 hover:border-cyan-500/30 transition-all group`}
                  >
                    <action.icon className={`w-6 h-6 mx-auto mb-2 text-cyan-400`} />
                    <span className={`text-white text-sm font-medium`}>{action.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MonitoringDashboard;