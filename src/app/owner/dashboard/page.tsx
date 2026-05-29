'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Phone, MessageSquare, Users, Settings, BarChart3, Bell, 
  ChevronRight, Play, Pause, Mic, MicOff, PhoneOutgoing,
  Calendar, Clock, TrendingUp, TrendingDown, ArrowUpRight,
  Sun, Moon, LogOut, Menu, X, Activity, Zap, Globe, Shield,
  CheckCircle, XCircle, AlertTriangle, ChevronDown, User,
  FileText, Download, Filter, Search, Plus, Trash2, Eye,
  Brain, Network, Sparkles, Cpu, GitBranch, ArrowRight,
  Lightbulb, Target, Zap as ZapIcon, RefreshCw, Workflow,
  Layers, GitMerge, Timer,
  Building2, CreditCard, Bot, Star, ArrowUp, DollarSign,
  Server, Database, Globe2, ShieldCheck, AlertCircle,
  Crown, Command, Eye as EyeIcon
} from 'lucide-react'
import LanguageSelector from '../../components/LanguageSelector'

import { rtlLanguages } from '../../lib/rtl'

// Translations for all supported languages
const translations: Record<string, Record<string, string>> = {
  en: {
    // Header & Navigation
    platformOwner: 'OWNER', platformOwnerAccess: 'Platform Owner Access',
    navOverview: 'Overview', navAgents: 'AI Agents', navCustomers: 'Customers', navIntelligence: 'Intelligence', navSettings: 'Settings',
    platformAlerts: 'Platform Alerts', profileSettings: 'Profile Settings', logOut: 'Log Out',
    themeLight: 'Switch to light mode', themeDark: 'Switch to dark mode',
    // Platform Status
    platformOperatingNormally: 'Platform Operating Normally',
    businessesActive: 'businesses', activeAIAgents: 'active AI agents', uptime: 'uptime',
    allSystemsOperational: 'All Systems Operational', regions: 'US-East, EU-West, AP-South',
    // Metrics
    totalRevenue: 'Total Revenue', activeBusinesses: 'Active Businesses', aiAgentsRunning: 'AI Agents Running',
    callsToday: 'Calls Today', avgResponseTime: 'Avg Response Time', systemUptime: 'System Uptime',
    // Agent reasoning
    platformAIOrchestrator: 'Platform AI Orchestrator', realTimeAutonomous: 'Real-time autonomous decision making', live: 'Live',
    analyzingGlobalDemand: 'Analyzing global demand patterns', detectedSpike: 'Detected 23% spike in appointment scheduling calls across enterprise accounts. Routing additional capacity.',
    scaleSchedulerAgents: 'Scale Scheduler agents +15%',
    processingUpgrades: 'Processing subscription upgrades', approachingLimits: '3 enterprise accounts approaching call limits. Identifying upsell opportunities.',
    notifySalesTeam: 'Notify sales team',
    monitoringHealth: 'Monitoring infrastructure health', servicesNormal: 'All services nominal. API latency within acceptable thresholds.',
    continueMonitoring: 'Continue monitoring',
    analyzingChurnRisk: 'Analyzing churn risk', decliningUsage: '2 starter accounts with declining usage. Running retention protocols.',
    sendEngagementTriggers: 'Send engagement triggers',
    // Tabs content
    topPerformingAgents: 'Top Performing Agents', viewAll: 'View All',
    recentRevenue: 'Recent Revenue', thisMonth: 'this month',
    multiAgentOrchestration: 'Multi-Agent Orchestration', platformWideTasks: 'Platform-wide task coordination',
    primary: 'Primary', collaborators: 'Collaborators',
    // Agent tab
    allPlatformAgents: 'All Platform Agents', agentsAcrossBusinesses: 'active agents across businesses',
    export: 'Export', addAgentTemplate: 'Add Agent Template',
    searchAgents: 'Search agents...', allBusinesses: 'All Businesses', allStatus: 'All Status',
    agent: 'Agent', business: 'Business', status: 'Status', confidence: 'Confidence', callsTodayHeader: 'Calls Today', selfCorrection: 'Self-Correction', avgResponse: 'Avg Response',
    active: 'Active', paused: 'Paused', learning: 'Learning',
    // Customers tab
    customerAccounts: 'Customer Accounts', totalAccounts: 'total accounts', accountsActive: 'active',
    addCustomer: 'Add Customer',
    owner: 'Owner', plan: 'Plan', agents: 'Agents', totalCalls: 'Total Calls', joined: 'Joined', actions: 'Actions',
    enterprise: 'Enterprise', professional: 'Professional', starter: 'Starter', trial: 'Trial', suspended: 'Suspended',
    // Intelligence tab
    platformAIIntelligence: 'Platform AI Intelligence', autonomousLearningMetrics: 'Autonomous decision making and learning metrics',
    multiBusinessNeural: 'Multi-Business Neural Network',
    decisionsPerSec: 'Decisions/sec', accuracy: 'Accuracy', selfCorrections: 'Self-Corrections', learningRate: 'Learning Rate',
    fromAvg: 'from avg', improvement: 'improvement', today: 'Today', thisWeek: 'this week',
    monthlyRecurringRevenue: 'Monthly Recurring Revenue', activeSubscriptions: 'Active Subscriptions', churnRate: 'Churn Rate',
    newThisWeek: 'new this week', improvementChurn: 'improvement',
    // Settings tab
    platformSettings: 'Platform Settings', platformWideSettings: 'Configure platform-wide settings and integrations',
    apiConfiguration: 'API Configuration', infrastructure: 'Infrastructure',
    supabase: 'Supabase', stripe: 'Stripe', square: 'Square', voiceAI: 'Voice AI',
    connected: 'Connected', region: 'Region', apiLatency: 'API Latency',
    // CEO Panel
    ceoAIBrain: 'CEO & AI Orchestrator', ownerCommands: 'Owner Commands',
    enterCommandCEO: 'Enter command for CEO...',
    recentDecisions: 'Recent Decisions', autonomousModeON: 'Autonomous Mode: ON',
    // Hermes Panel
    hermesEmployee: 'Main Platform Employee', platformOperations: 'Platform Operations',
    frontendTasks: 'Frontend Tasks', backendTasks: 'Backend Tasks',
    enterTaskHermes: 'Enter task for Hermes...',
    recentTasks: 'Recent Tasks', runningPlatformOps: 'Running Platform Operations',
    // Footer
    footerText: '© 2026 FrontDesk Agents. Platform Owner Dashboard.',
    systemStatus: 'System Status', footerSystemsOperational: 'All Systems Operational',
    darkMode: 'Dark Mode', lightMode: 'Light Mode'
  },
  es: {
    platformOwner: 'PROPIETARIO', platformOwnerAccess: 'Acceso de Propietario de Plataforma',
    navOverview: 'Resumen', navAgents: 'Agentes IA', navCustomers: 'Clientes', navIntelligence: 'Inteligencia', navSettings: 'Configuración',
    platformAlerts: 'Alertas de Plataforma', profileSettings: 'Configuración de Perfil', logOut: 'Cerrar Sesión',
    themeLight: 'Cambiar a modo claro', themeDark: 'Cambiar a modo oscuro',
    platformOperatingNormally: 'Plataforma Operando Normally',
    businessesActive: 'negocios', activeAIAgents: 'agentes IA activos', uptime: 'disponibilidad',
    allSystemsOperational: 'Todos los Sistemas Operativos', regions: 'US-East, EU-West, AP-South',
    totalRevenue: 'Ingresos Totales', activeBusinesses: 'Negocios Activos', aiAgentsRunning: 'Agentes IA Activos',
    callsToday: 'Llamadas Hoy', avgResponseTime: 'Tiempo de Respuesta Prom.', systemUptime: 'Disponibilidad del Sistema',
    platformAIOrchestrator: 'Orquestador IA de Plataforma', realTimeAutonomous: 'Decisiones autónomas en tiempo real', live: 'En Vivo',
    analyzingGlobalDemand: 'Analizando patrones de demanda global', detectedSpike: 'Detectado 23% de aumento en llamadas de programación de citas en cuentas empresariales.',
    scaleSchedulerAgents: 'Escalar agentes de Programador +15%',
    processingUpgrades: 'Procesando actualizaciones de suscripción', approachingLimits: '3 cuentas empresariales acercándose a límites de llamadas.',
    notifySalesTeam: 'Notificar al equipo de ventas',
    monitoringHealth: 'Monitoreando salud de infraestructura', servicesNormal: 'Todos los servicios normales. Latencia de API dentro de umbrales aceptables.',
    continueMonitoring: 'Continuar monitoreo',
    analyzingChurnRisk: 'Analizando riesgo de abandono', decliningUsage: '2 cuentas starter con uso declining.',
    sendEngagementTriggers: 'Enviar disparadores de compromiso',
    topPerformingAgents: 'Agentes con Mejor Rendimiento', viewAll: 'Ver Todo',
    recentRevenue: 'Ingresos Recientes', thisMonth: 'este mes',
    multiAgentOrchestration: 'Orquestación Multi-Agente', platformWideTasks: 'Coordinación de tareas en toda la plataforma',
    primary: 'Primario', collaborators: 'Colaboradores',
    allPlatformAgents: 'Todos los Agentes de Plataforma', agentsAcrossBusinesses: 'agentes activos en negocios',
    export: 'Exportar', addAgentTemplate: 'Agregar Plantilla de Agente',
    searchAgents: 'Buscar agentes...', allBusinesses: 'Todos los Negocios', allStatus: 'Todos los Estados',
    agent: 'Agente', business: 'Negocio', status: 'Estado', confidence: 'Confianza', callsTodayHeader: 'Llamadas Hoy', selfCorrection: 'Auto-Corrección', avgResponse: 'Respuesta Prom.',
    active: 'Activo', paused: 'Pausado', learning: 'Aprendiendo',
    customerAccounts: 'Cuentas de Clientes', totalAccounts: 'cuentas totales', accountsActive: 'activo',
    addCustomer: 'Agregar Cliente',
    owner: 'Propietario', plan: 'Plan', agents: 'Agentes', totalCalls: 'Llamadas Totales', joined: 'Unido', actions: 'Acciones',
    enterprise: 'Empresarial', professional: 'Profesional', starter: 'Inicial', trial: 'Prueba', suspended: 'Suspendido',
    platformAIIntelligence: 'Inteligencia IA de Plataforma', autonomousLearningMetrics: 'Decisiones autónomas y métricas de aprendizaje',
    multiBusinessNeural: 'Red Neural Multi-Negocio',
    decisionsPerSec: 'Decisiones/seg', accuracy: 'Precisión', selfCorrections: 'Auto-Correcciones', learningRate: 'Tasa de Aprendizaje',
    fromAvg: 'del promedio', improvement: 'mejora', today: 'Hoy', thisWeek: 'esta semana',
    monthlyRecurringRevenue: 'Ingresos Recurrentes Mensuales', activeSubscriptions: 'Suscripciones Activas', churnRate: 'Tasa de Abandono',
    newThisWeek: 'nuevos esta semana', improvementChurn: 'mejora',
    platformSettings: 'Configuración de Plataforma', platformWideSettings: 'Configurar ajustes e integraciones de toda la plataforma',
    apiConfiguration: 'Configuración de API', infrastructure: 'Infraestructura',
    supabase: 'Supabase', stripe: 'Stripe', square: 'Square', voiceAI: 'Voice AI',
    connected: 'Conectado', region: 'Región', apiLatency: 'Latencia de API',
    ceoAIBrain: 'CEO y Orquestador IA', ownerCommands: 'Comandos del Propietario',
    enterCommandCEO: 'Ingresar comando para CEO...',
    recentDecisions: 'Decisiones Recientes', autonomousModeON: 'Modo Autónomo: ON',
    hermesEmployee: 'Empleado Principal de Plataforma', platformOperations: 'Operaciones de Plataforma',
    frontendTasks: 'Tareas Frontend', backendTasks: 'Tareas Backend',
    enterTaskHermes: 'Ingresar tarea para Hermes...',
    recentTasks: 'Tareas Recientes', runningPlatformOps: 'Ejecutando Operaciones de Plataforma',
    footerText: '© 2026 FrontDesk Agents. Panel del Propietario de Plataforma.',
    systemStatus: 'Estado del Sistema', footerSystemsOperational: 'Todos los Sistemas Operativos',
    darkMode: 'Modo Oscuro', lightMode: 'Modo Claro'
  },
  fr: {
    platformOwner: 'PROPRIÉTAIRE', platformOwnerAccess: 'Accès Propriétaire de la Plateforme',
    navOverview: 'Aperçu', navAgents: 'Agents IA', navCustomers: 'Clients', navIntelligence: 'Intelligence', navSettings: 'Paramètres',
    platformAlerts: 'Alertes de Plateforme', profileSettings: 'Paramètres du Profil', logOut: 'Déconnexion',
    themeLight: 'Passer en mode clair', themeDark: 'Passer en mode sombre',
    platformOperatingNormally: 'Plateforme Opérant Normalement',
    businessesActive: 'entreprises', activeAIAgents: 'agents IA actifs', uptime: 'disponibilité',
    allSystemsOperational: 'Tous les Systèmes Opérationnels', regions: 'US-East, EU-West, AP-South',
    totalRevenue: 'Revenu Total', activeBusinesses: 'Entreprises Actives', aiAgentsRunning: 'Agents IA Actifs',
    callsToday: 'Appels Aujourd\'hui', avgResponseTime: 'Temps de Réponse Moy.', systemUptime: 'Disponibilité du Système',
    platformAIOrchestrator: 'Orchestrateur IA de Plateforme', realTimeAutonomous: 'Décisions autonomes en temps réel', live: 'En Direct',
    analyzingGlobalDemand: 'Analyse des modèles de demande mondiale', detectedSpike: 'Détecté une augmentation de 23% dans les appels de planification de rendez-vous.',
    scaleSchedulerAgents: 'Augmenter les agents Scheduleur +15%',
    processingUpgrades: 'Traitement des mises à niveau d\'abonnement', approachingLimits: '3 comptes entreprise approchant des limites d\'appels.',
    notifySalesTeam: 'Notifier l\'équipe de ventes',
    monitoringHealth: 'Surveillance de la santé de l\'infrastructure', servicesNormal: 'Tous les services normaux. Latence API dans les seuils acceptables.',
    continueMonitoring: 'Continuer la surveillance',
    analyzingChurnRisk: 'Analyse du risque de désabonnement', decliningUsage: '2 comptes starter avec utilisation en déclin.',
    sendEngagementTriggers: 'Envoyer des déclencheurs d\'engagement',
    topPerformingAgents: 'Agents les Plus Performants', viewAll: 'Voir Tout',
    recentRevenue: 'Revenus Récents', thisMonth: 'ce mois',
    multiAgentOrchestration: 'Orchestration Multi-Agents', platformWideTasks: 'Coordination des tâches à l\'échelle de la plateforme',
    primary: 'Primaire', collaborators: 'Collaborateurs',
    allPlatformAgents: 'Tous les Agents de Plateforme', agentsAcrossBusinesses: 'agents actifs dans les entreprises',
    export: 'Exporter', addAgentTemplate: 'Ajouter Modèle d\'Agent',
    searchAgents: 'Rechercher agents...', allBusinesses: 'Toutes les Entreprises', allStatus: 'Tous les Statuts',
    agent: 'Agent', business: 'Entreprise', status: 'Statut', confidence: 'Confiance', callsTodayHeader: 'Appels Aujourd\'hui', selfCorrection: 'Auto-Correction', avgResponse: 'Réponse Moy.',
    active: 'Actif', paused: 'En pause', learning: 'Apprentissage',
    customerAccounts: 'Comptes Clients', totalAccounts: 'comptes au total', accountsActive: 'actif',
    addCustomer: 'Ajouter Client',
    owner: 'Propriétaire', plan: 'Plan', agents: 'Agents', totalCalls: 'Appels Totaux', joined: 'Inscrit', actions: 'Actions',
    enterprise: 'Entreprise', professional: 'Professionnel', starter: 'Starter', trial: 'Essai', suspended: 'Suspendu',
    platformAIIntelligence: 'Intelligence IA de Plateforme', autonomousLearningMetrics: 'Décisions autonomes et métriques d\'apprentissage',
    multiBusinessNeural: 'Réseau Neural Multi-Entreprise',
    decisionsPerSec: 'Décisions/sec', accuracy: 'Précision', selfCorrections: 'Auto-Corrections', learningRate: 'Taux d\'Apprentissage',
    fromAvg: 'de la moyenne', improvement: 'amélioration', today: 'Aujourd\'hui', thisWeek: 'cette semaine',
    monthlyRecurringRevenue: 'Revenus Récurrents Mensuels', activeSubscriptions: 'Abonnements Actifs', churnRate: 'Taux de Désabonnement',
    newThisWeek: 'nouveaux cette semaine', improvementChurn: 'amélioration',
    platformSettings: 'Paramètres de Plateforme', platformWideSettings: 'Configurer les paramètres et intégrations à l\'échelle de la plateforme',
    apiConfiguration: 'Configuration API', infrastructure: 'Infrastructure',
    supabase: 'Supabase', stripe: 'Stripe', square: 'Square', voiceAI: 'Voice AI',
    connected: 'Connecté', region: 'Région', apiLatency: 'Latence API',
    ceoAIBrain: 'CEO et Orchestrateur IA', ownerCommands: 'Commandes du Propriétaire',
    enterCommandCEO: 'Entrer une commande pour le CEO...',
    recentDecisions: 'Décisions Récentes', autonomousModeON: 'Mode Autonome: ON',
    hermesEmployee: 'Employé Principal de Plateforme', platformOperations: 'Opérations de Plateforme',
    frontendTasks: 'Tâches Frontend', backendTasks: 'Tâches Backend',
    enterTaskHermes: 'Entrer une tâche pour Hermès...',
    recentTasks: 'Tâches Récentes', runningPlatformOps: 'Exécution des Opérations de Plateforme',
    footerText: '© 2026 FrontDesk Agents. Tableau de Bord du Propriétaire de Plateforme.',
    systemStatus: 'État du Système', footerSystemsOperational: 'Tous les Systèmes Opérationnels',
    darkMode: 'Mode Sombre', lightMode: 'Mode Clair'
  },
  zh: {
    platformOwner: '所有者', platformOwnerAccess: '平台所有者访问',
    navOverview: '概览', navAgents: 'AI代理', navCustomers: '客户', navIntelligence: '智能', navSettings: '设置',
    platformAlerts: '平台警报', profileSettings: '个人设置', logOut: '退出登录',
    themeLight: '切换到浅色模式', themeDark: '切换到深色模式',
    platformOperatingNormally: '平台正常运行',
    businessesActive: '家企业', activeAIAgents: '个活跃AI代理', uptime: '正常运行',
    allSystemsOperational: '所有系统运行正常', regions: 'US-East, EU-West, AP-South',
    totalRevenue: '总收入', activeBusinesses: '活跃企业', aiAgentsRunning: '活跃AI代理',
    callsToday: '今日通话', avgResponseTime: '平均响应时间', systemUptime: '系统正常运行',
    platformAIOrchestrator: '平台AI编排器', realTimeAutonomous: '实时自主决策', live: '直播',
    analyzingGlobalDemand: '分析全球需求模式', detectedSpike: '检测到企业账户预约通话增加23%。',
    scaleSchedulerAgents: '扩展调度代理 +15%',
    processingUpgrades: '处理订阅升级', approachingLimits: '3个企业账户接近通话限制。',
    notifySalesTeam: '通知销售团队',
    monitoringHealth: '监控基础设施健康', servicesNormal: '所有服务正常。API延迟在可接受范围内。',
    continueMonitoring: '继续监控',
    analyzingChurnRisk: '分析客户流失风险', decliningUsage: '2个入门账户使用量下降。',
    sendEngagementTriggers: '发送参与触发器',
    topPerformingAgents: '表现最佳的代理', viewAll: '查看全部',
    recentRevenue: '近期收入', thisMonth: '本月',
    multiAgentOrchestration: '多代理编排', platformWideTasks: '平台范围任务协调',
    primary: '主要', collaborators: '协作',
    allPlatformAgents: '所有平台代理', agentsAcrossBusinesses: '跨企业活跃代理',
    export: '导出', addAgentTemplate: '添加代理模板',
    searchAgents: '搜索代理...', allBusinesses: '所有企业', allStatus: '所有状态',
    agent: '代理', business: '企业', status: '状态', confidence: '置信度', callsTodayHeader: '今日通话', selfCorrection: '自我修正', avgResponse: '平均响应',
    active: '活跃', paused: '暂停', learning: '学习中',
    customerAccounts: '客户账户', totalAccounts: '总账户', accountsActive: '活跃',
    addCustomer: '添加客户',
    owner: '所有者', plan: '计划', agents: '代理', totalCalls: '总通话', joined: '加入', actions: '操作',
    enterprise: '企业', professional: '专业', starter: '入门', trial: '试用', suspended: '暂停',
    platformAIIntelligence: '平台AI智能', autonomousLearningMetrics: '自主决策和学习指标',
    multiBusinessNeural: '多企业神经网络',
    decisionsPerSec: '决策/秒', accuracy: '准确率', selfCorrections: '自我修正', learningRate: '学习率',
    fromAvg: '平均值', improvement: '改进', today: '今日', thisWeek: '本周',
    monthlyRecurringRevenue: '每月经常性收入', activeSubscriptions: '活跃订阅', churnRate: '流失率',
    newThisWeek: '本周新增', improvementChurn: '改进',
    platformSettings: '平台设置', platformWideSettings: '配置平台范围设置和集成',
    apiConfiguration: 'API配置', infrastructure: '基础设施',
    supabase: 'Supabase', stripe: 'Stripe', square: 'Square', voiceAI: 'Voice AI',
    connected: '已连接', region: '区域', apiLatency: 'API延迟',
    ceoAIBrain: 'CEO和AI编排器', ownerCommands: '所有者命令',
    enterCommandCEO: '输入CEO命令...',
    recentDecisions: '近期决策', autonomousModeON: '自主模式: 开启',
    hermesEmployee: '主平台员工', platformOperations: '平台运营',
    frontendTasks: '前端任务', backendTasks: '后端任务',
    enterTaskHermes: '输入Hermes任务...',
    recentTasks: '近期任务', runningPlatformOps: '运行平台运营',
    footerText: '© 2026 FrontDesk Agents。平台所有者仪表板。',
    systemStatus: '系统状态', footerSystemsOperational: '所有系统运行正常',
    darkMode: '深色模式', lightMode: '浅色模式'
  },
  hi: {
    platformOwner: 'मालिक', platformOwnerAccess: 'प्लेटफॉर्म मालिक पहुंच',
    navOverview: 'अवलोकन', navAgents: 'AI एजेंट', navCustomers: 'ग्राहक', navIntelligence: 'बुद्धिमत्ता', navSettings: 'सेटिंग्स',
    platformAlerts: 'प्लेटफॉर्म अलर्ट', profileSettings: 'प्रोफ़ाइल सेटिंग्स', logOut: 'लॉग आउट',
    themeLight: 'हल्के मोड पर स्विच करें', themeDark: 'डार्क मोड पर स्विच करें',
    platformOperatingNormally: 'प्लेटफॉर्म सामान्य रूप से संचालित',
    businessesActive: 'व्यापार', activeAIAgents: 'सक्रिय AI एजेंट', uptime: 'अपटाइम',
    allSystemsOperational: 'सभी सिस्टम संचालित', regions: 'US-East, EU-West, AP-South',
    totalRevenue: 'कुल राजस्व', activeBusinesses: 'सक्रिय व्यापार', aiAgentsRunning: 'सक्रिय AI एजेंट',
    callsToday: 'आज की कॉलें', avgResponseTime: 'औसत प्रतिक्रिया समय', systemUptime: 'सिस्टम अपटाइम',
    platformAIOrchestrator: 'प्लेटफॉर्म AI ऑर्केस्ट्रेटर', realTimeAutonomous: 'रीयल-टाइम स्वायत्त निर्णय', live: 'लाइव',
    analyzingGlobalDemand: 'वैश्विक मांग पैटर्न का विश्लेषण', detectedSpike: 'एंटरप्राइज खातों में अपॉइंटमेंट शेड्यूलिंग कॉल में 23% वृद्धि का पता चला।',
    scaleSchedulerAgents: 'स्केड्यूलर एजेंट +15% बढ़ाएं',
    processingUpgrades: 'सब्सक्रिप्शन अपग्रेड प्रोसेस कर रहे', approachingLimits: '3 एंटरप्राइज खाते कॉल सीमा के करीब।',
    notifySalesTeam: 'सेल्स टीम को सूचित करें',
    monitoringHealth: 'इन्फ्रास्ट्रक्चर स्वास्थ्य की निगरानी', servicesNormal: 'सभी सेवाएं सामान्य। API विलंबता स्वीकार्य सीमा में।',
    continueMonitoring: 'निगरानी जारी रखें',
    analyzingChurnRisk: 'चर्न जोखिम का विश्लेषण', decliningUsage: '2 स्टार्टर खातों में उपयोग में गिरावट।',
    sendEngagementTriggers: 'एंगेजमेंट ट्रिगर्स भेजें',
    topPerformingAgents: 'शीर्ष प्रदर्शन करने वाले एजेंट', viewAll: 'सभी देखें',
    recentRevenue: 'हालिया राजस्व', thisMonth: 'इस महीने',
    multiAgentOrchestration: 'मल्टी-एजेंट ऑर्केस्ट्रेशन', platformWideTasks: 'प्लेटफॉर्म-व्यापी कार्य समन्वय',
    primary: 'प्राथमिक', collaborators: 'सहयोगी',
    allPlatformAgents: 'सभी प्लेटफॉर्म एजेंट', agentsAcrossBusinesses: 'व्यापारों में सक्रिय एजेंट',
    export: 'निर्यात', addAgentTemplate: 'एजेंट टेम्पलेट जोड़ें',
    searchAgents: 'एजेंट खोजें...', allBusinesses: 'सभी व्यापार', allStatus: 'सभी स्थिति',
    agent: 'एजेंट', business: 'व्यापार', status: 'स्थिति', confidence: 'आत्मविश्वास', callsTodayHeader: 'आज कॉलें', selfCorrection: 'सेल्फ-करेक्ट', avgResponse: 'औसत प्रतिक्रिया',
    active: 'सक्रिय', paused: 'रुका हुआ', learning: 'सीख रहा',
    customerAccounts: 'ग्राहक खाते', totalAccounts: 'कुल खाते', accountsActive: 'सक्रिय',
    addCustomer: 'ग्राहक जोड़ें',
    owner: 'मालिक', plan: 'योजना', agents: 'एजेंट', totalCalls: 'कुल कॉलें', joined: 'शामिल', actions: 'कार्य',
    enterprise: 'एंटरप्राइज', professional: 'पेशेवर', starter: 'स्टार्टर', trial: 'परीक्षण', suspended: 'निलंबित',
    platformAIIntelligence: 'प्लेटफॉर्म AI इंटेलिजेंस', autonomousLearningMetrics: 'स्वायत्त निर्णय और सीखने के मेट्रिक्स',
    multiBusinessNeural: 'मल्टी-बिजनेस न्यूरल नेटवर्क',
    decisionsPerSec: 'निर्णय/सेकंड', accuracy: 'सटीकता', selfCorrections: 'सेल्फ-करेक्शन', learningRate: 'सीखने की दर',
    fromAvg: 'औसत से', improvement: 'सुधार', today: 'आज', thisWeek: 'इस सप्ताह',
    monthlyRecurringRevenue: 'मासिक आवर्ती राजस्व', activeSubscriptions: 'सक्रिय सदस्यताएं', churnRate: 'चर्न दर',
    newThisWeek: 'इस सप्ताह नया', improvementChurn: 'सुधार',
    platformSettings: 'प्लेटफॉर्म सेटिंग्स', platformWideSettings: 'प्लेटफॉर्म-व्यापी सेटिंग्स और एकीकरण कॉन्फ़िगर करें',
    apiConfiguration: 'API कॉन्फ़िगरेशन', infrastructure: 'इन्फ्रास्ट्रक्चर',
    supabase: 'Supabase', stripe: 'Stripe', square: 'Square', voiceAI: 'Voice AI',
    connected: 'जुड़ा', region: 'क्षेत्र', apiLatency: 'API विलंबता',
    ceoAIBrain: 'CEO और AI ऑर्केस्ट्रेटर', ownerCommands: 'मालिक के आदेश',
    enterCommandCEO: 'CEO के लिए कमांड दर्ज करें...',
    recentDecisions: 'हालिया निर्णय', autonomousModeON: 'स्वायत्त मोड: चालू',
    hermesEmployee: 'मुख्य प्लेटफॉर्म कर्मचारी', platformOperations: 'प्लेटफॉर्म संचालन',
    frontendTasks: 'फ्रंटएंड कार्य', backendTasks: 'बैकएंड कार्य',
    enterTaskHermes: 'Hermes के लिए कार्य दर्ज करें...',
    recentTasks: 'हालिया कार्य', runningPlatformOps: 'प्लेटफॉर्म संचालन चला रहे',
    footerText: '© 2026 FrontDesk Agents। प्लेटफॉर्म मालिक डैशबोर्ड।',
    systemStatus: 'सिस्टम स्थिति', footerSystemsOperational: 'सभी सिस्टम संचालित',
    darkMode: 'डार्क मोड', lightMode: 'लाइट मोड'
  },
  ar: {
    platformOwner: 'المالك', platformOwnerAccess: 'وصول مالك المنصة',
    navOverview: 'نظرة عامة', navAgents: 'وكلاء الذكاء الاصطناعي', navCustomers: 'العملاء', navIntelligence: 'الذكاء', navSettings: 'الإعدادات',
    platformAlerts: 'تنبيهات المنصة', profileSettings: 'إعدادات الملف الشخصي', logOut: 'تسجيل الخروج',
    themeLight: 'التبديل إلى الوضع الفاتح', themeDark: 'التبديل إلى الوضع الداكن',
    platformOperatingNormally: 'المنصة تعمل بشكل طبيعي',
    businessesActive: 'أعمال', activeAIAgents: 'وكلاء ذكاء اصطناعي نشطين', uptime: 'وقت التشغيل',
    allSystemsOperational: 'جميع الأنظمة تعمل', regions: 'US-East, EU-West, AP-South',
    totalRevenue: 'إجمالي الإيرادات', activeBusinesses: 'الأعمال النشطة', aiAgentsRunning: 'وكلاء الذكاء الاصطناعي النشطون',
    callsToday: 'المكالمات اليوم', avgResponseTime: 'متوسط وقت الاستجابة', systemUptime: 'وقت تشغيل النظام',
    platformAIOrchestrator: 'منسق الذكاء الاصطناعي للمنصة', realTimeAutonomous: 'اتخاذ القرار المستقل في الوقت الفعلي', live: 'مباشر',
    analyzingGlobalDemand: 'تحليل أنماط الطلب العالمية', detectedSpike: 'تم اكتشاف زيادة بنسبة 23% في مكالمات جدولة المواعيد.',
    scaleSchedulerAgents: 'توسيع وكلاء المجدول +15%',
    processingUpgrades: 'معالجة ترقيات الاشتراك', approachingLimits: '3 حسابات للمؤسسات تقترب من حدود المكالمات.',
    notifySalesTeam: 'إخطار فريق المبيعات',
    monitoringHealth: 'مراقبة صحة البنية التحتية', servicesNormal: 'جميع الخدمات طبيعية. latency API ضمن العتبات المقبولة.',
    continueMonitoring: 'مواصلة المراقبة',
    analyzingChurnRisk: 'تحليل مخاطر churn', decliningUsage: '2 حسابات starter مع استخدامDeclining.',
    sendEngagementTriggers: 'إرسال محفزات المشاركة',
    topPerformingAgents: 'أفضل الوكلاء أداءً', viewAll: 'عرض الكل',
    recentRevenue: 'الإيرادات الأخيرة', thisMonth: 'هذا الشهر',
    multiAgentOrchestration: 'تنسيق الوكلاء المتعددين', platformWideTasks: 'تنسيق المهام عبر المنصة',
    primary: 'أساسي', collaborators: 'المتعاونون',
    allPlatformAgents: 'جميع وكلاء المنصة', agentsAcrossBusinesses: 'وكلاء نشطين عبرBusinesses',
    export: 'تصدير', addAgentTemplate: 'إضافة قالب وكيل',
    searchAgents: 'البحث عن الوكلاء...', allBusinesses: 'جميع الأعمال', allStatus: 'جميع الحالات',
    agent: 'وكيل', business: 'الأعمال', status: 'الحالة', confidence: 'ثقة', callsTodayHeader: 'المكالمات اليوم', selfCorrection: 'التصحيح الذاتي', avgResponse: 'متوسط الاستجابة',
    active: 'نشط', paused: 'متوقف', learning: 'يتعلم',
    customerAccounts: 'حسابات العملاء', totalAccounts: 'إجمالي الحسابات', accountsActive: 'نشط',
    addCustomer: 'إضافة عميل',
    owner: 'المالك', plan: 'الخطة', agents: 'الوكلاء', totalCalls: 'إجمالي المكالمات', joined: 'انضم', actions: 'الإجراءات',
    enterprise: 'مؤسساتي', professional: 'احترافي', starter: 'مبتدئ', trial: 'تجربة', suspended: 'معلق',
    platformAIIntelligence: 'ذكاء منصة الذكاء الاصطناعي', autonomousLearningMetrics: 'اتخاذ القرار المستقل ومقاييس التعلم',
    multiBusinessNeural: 'شبكة الأعصاب متعددة الأعمال',
    decisionsPerSec: 'قرارات/ثانية', accuracy: 'دقة', selfCorrections: 'التصحيحات الذاتية', learningRate: 'معدل التعلم',
    fromAvg: 'من المتوسط', improvement: 'تحسين', today: 'اليوم', thisWeek: 'هذا الأسبوع',
    monthlyRecurringRevenue: 'الإيرادات المتكررة الشهرية', activeSubscriptions: 'الاشتراكات النشطة', churnRate: 'معدل churn',
    newThisWeek: 'جديد هذا الأسبوع', improvementChurn: 'تحسين',
    platformSettings: 'إعدادات المنصة', platformWideSettings: 'تكوين إعدادات التكامل عبر المنصة',
    apiConfiguration: 'تكوين API', infrastructure: 'البنية التحتية',
    supabase: 'Supabase', stripe: 'Stripe', square: 'Square', voiceAI: 'Voice AI',
    connected: 'متصل', region: 'المنطقة', apiLatency: 'latency API',
    ceoAIBrain: 'الرئيس التنفيذي ومنسق الذكاء الاصطناعي', ownerCommands: 'أوامر المالك',
    enterCommandCEO: 'إدخال أمر للرئيس التنفيذي...',
    recentDecisions: 'القرارات الأخيرة', autonomousModeON: 'الوضع المستقل: مفعل',
    hermesEmployee: 'موظف المنصة الرئيسي', platformOperations: 'عمليات المنصة',
    frontendTasks: 'مهام الواجهة الأمامية', backendTasks: 'مهام الواجهة الخلفية',
    enterTaskHermes: 'إدخال مهمة لـ Hermes...',
    recentTasks: 'المهام الأخيرة', runningPlatformOps: 'تشغيل عمليات المنصة',
    footerText: '© 2026 FrontDesk Agents. لوحة تحكم مالك المنصة.',
    systemStatus: 'حالة النظام', footerSystemsOperational: 'جميع الأنظمة تعمل',
    darkMode: 'الوضع الداكن', lightMode: 'الوضع الفاتح'
  },
  pt: {
    platformOwner: 'PROPRIETÁRIO', platformOwnerAccess: 'Acesso do Proprietário da Plataforma',
    navOverview: 'Visão Geral', navAgents: 'Agentes IA', navCustomers: 'Clientes', navIntelligence: 'Inteligência', navSettings: 'Configurações',
    platformAlerts: 'Alertas da Plataforma', profileSettings: 'Configurações do Perfil', logOut: 'Sair',
    themeLight: 'Mudar para modo claro', themeDark: 'Mudar para modo escuro',
    platformOperatingNormally: 'Plataforma Operando Normally',
    businessesActive: 'negócios', activeAIAgents: 'agentes IA ativos', uptime: 'disponibilidade',
    allSystemsOperational: 'Todos os Sistemas Operacionais', regions: 'US-East, EU-West, AP-South',
    totalRevenue: 'Receita Total', activeBusinesses: 'Negócios Ativos', aiAgentsRunning: 'Agentes IA Ativos',
    callsToday: 'Chamadas Hoje', avgResponseTime: 'Tempo de Resposta Médio', systemUptime: 'Disponibilidade do Sistema',
    platformAIOrchestrator: 'Orquestrador IA da Plataforma', realTimeAutonomous: 'Decisões autônomas em tempo real', live: 'Ao Vivo',
    analyzingGlobalDemand: 'Analisando padrões de demanda global', detectedSpike: 'Detectado aumento de 23% em chamadas de agendamento.',
    scaleSchedulerAgents: 'Escalar agentes Agendador +15%',
    processingUpgrades: 'Processando upgrades de assinatura', approachingLimits: '3 contas enterprise se aproximando de limites.',
    notifySalesTeam: 'Notificar equipe de vendas',
    monitoringHealth: 'Monitorando saúde da infraestrutura', servicesNormal: 'Todos os serviços nominais. Latência API dentro dos limites.',
    continueMonitoring: 'Continuar monitoramento',
    analyzingChurnRisk: 'Analisando risco de churn', decliningUsage: '2 contas starter com uso em declínio.',
    sendEngagementTriggers: 'Enviar gatilhos de engajamento',
    topPerformingAgents: 'Agentes com Melhor Desempenho', viewAll: 'Ver Tudo',
    recentRevenue: 'Receita Recente', thisMonth: 'este mês',
    multiAgentOrchestration: 'Orquestração Multi-Agente', platformWideTasks: 'Coordenação de tarefas em toda a plataforma',
    primary: 'Primário', collaborators: 'Colaboradores',
    allPlatformAgents: 'Todos os Agentes da Plataforma', agentsAcrossBusinesses: 'agentes ativos em negócios',
    export: 'Exportar', addAgentTemplate: 'Adicionar Modelo de Agente',
    searchAgents: 'Buscar agentes...', allBusinesses: 'Todos os Negócios', allStatus: 'Todos os Status',
    agent: 'Agente', business: 'Negócio', status: 'Status', confidence: 'Confiança', callsTodayHeader: 'Chamadas Hoje', selfCorrection: 'Auto-Correção', avgResponse: 'Resposta Média',
    active: 'Ativo', paused: 'Pausado', learning: 'Aprendendo',
    customerAccounts: 'Contas de Clientes', totalAccounts: 'contas totais', accountsActive: 'ativo',
    addCustomer: 'Adicionar Cliente',
    owner: 'Proprietário', plan: 'Plano', agents: 'Agentes', totalCalls: 'Chamadas Totais', joined: 'Entrou', actions: 'Ações',
    enterprise: 'Enterprise', professional: 'Profissional', starter: 'Starter', trial: 'Trial', suspended: 'Suspenso',
    platformAIIntelligence: 'Inteligência IA da Plataforma', autonomousLearningMetrics: 'Decisões autônomas e métricas de aprendizado',
    multiBusinessNeural: 'Rede Neural Multi-Negócio',
    decisionsPerSec: 'Decisões/seg', accuracy: 'Precisão', selfCorrections: 'Auto-Correções', learningRate: 'Taxa de Aprendizado',
    fromAvg: 'da média', improvement: 'melhoria', today: 'Hoje', thisWeek: 'esta semana',
    monthlyRecurringRevenue: 'Receita Recorrente Mensal', activeSubscriptions: 'Assinaturas Ativas', churnRate: 'Taxa de Churn',
    newThisWeek: 'novos esta semana', improvementChurn: 'melhoria',
    platformSettings: 'Configurações da Plataforma', platformWideSettings: 'Configurar ajustes e integrações em toda a plataforma',
    apiConfiguration: 'Configuração de API', infrastructure: 'Infraestrutura',
    supabase: 'Supabase', stripe: 'Stripe', square: 'Square', voiceAI: 'Voice AI',
    connected: 'Conectado', region: 'Região', apiLatency: 'Latência API',
    ceoAIBrain: 'CEO e Orquestrador IA', ownerCommands: 'Comandos do Proprietário',
    enterCommandCEO: 'Inserir comando para CEO...',
    recentDecisions: 'Decisões Recentes', autonomousModeON: 'Modo Autônomo: ON',
    hermesEmployee: 'Funcionário Principal da Plataforma', platformOperations: 'Operações da Plataforma',
    frontendTasks: 'Tarefas Frontend', backendTasks: 'Tarefas Backend',
    enterTaskHermes: 'Inserir tarefa para Hermes...',
    recentTasks: 'Tarefas Recentes', runningPlatformOps: 'Executando Operações da Plataforma',
    footerText: '© 2026 FrontDesk Agents. Painel do Proprietário da Plataforma.',
    systemStatus: 'Status do Sistema', footerSystemsOperational: 'Todos os Sistemas Operacionais',
    darkMode: 'Modo Escuro', lightMode: 'Modo Claro'
  },
  ko: {
    platformOwner: '소유자', platformOwnerAccess: '플랫폼 소유자 접근',
    navOverview: '개요', navAgents: 'AI 에이전트', navCustomers: '고객', navIntelligence: '지능', navSettings: '설정',
    platformAlerts: '플랫폼 알림', profileSettings: '프로필 설정', logOut: '로그아웃',
    themeLight: '라이트 모드로 전환', themeDark: '다크 모드로 전환',
    platformOperatingNormally: '플랫폼正常运行',
    businessesActive: '비즈니스', activeAIAgents: '활성 AI 에이전트', uptime: '가동률',
    allSystemsOperational: '모든 시스템 운영 중', regions: 'US-East, EU-West, AP-South',
    totalRevenue: '총 수익', activeBusinesses: '활성 비즈니스', aiAgentsRunning: '활성 AI 에이전트',
    callsToday: '오늘의 통화', avgResponseTime: '평균 응답 시간', systemUptime: '시스템 가동률',
    platformAIOrchestrator: '플랫폼 AI 오케스트레이터', realTimeAutonomous: '실시간 자율 결정', live: '라이브',
    analyzingGlobalDemand: '글로벌 수요 패턴 분석 중', detectedSpike: '기업 계정 예약 통화 23% 증가 감지.',
    scaleSchedulerAgents: '스케줄러 에이전트 +15% 확장',
    processingUpgrades: '구독 업그레이드 처리 중', approachingLimits: '3개 기업 계정이 통화 한도에 근접.',
    notifySalesTeam: '영업팀에게 알림',
    monitoringHealth: '인프라 상태 모니터링 중', servicesNormal: '모든 서비스 정상. API 지연시간 허용 범위 내.',
    continueMonitoring: '모니터링 계속',
    analyzingChurnRisk: '고객流失 위험 분석 중', decliningUsage: '2개 스타터 계정의 사용량 감소.',
    sendEngagementTriggers: '참여 트리거发送',
    topPerformingAgents: '최고 성과 에이전트', viewAll: '모두 보기',
    recentRevenue: '최근 수익', thisMonth: '이번 달',
    multiAgentOrchestration: '멀티 에이전트 오케스트레이션', platformWideTasks: '플랫폼 전체 작업 조정',
    primary: '기본', collaborators: '협업자',
    allPlatformAgents: '모든 플랫폼 에이전트', agentsAcrossBusinesses: '비즈니스 간 활성 에이전트',
    export: '내보내기', addAgentTemplate: '에이전트 템플릿 추가',
    searchAgents: '에이전트 검색...', allBusinesses: '모든 비즈니스', allStatus: '모든 상태',
    agent: '에이전트', business: '비즈니스', status: '상태', confidence: '신뢰도', callsTodayHeader: '오늘의 통화', selfCorrection: '자기 수정', avgResponse: '평균 응답',
    active: '활성', paused: '일시 정지', learning: '학습 중',
    customerAccounts: '고객 계정', totalAccounts: '총 계정', accountsActive: '활성',
    addCustomer: '고객 추가',
    owner: '소유자', plan: '플랜', agents: '에이전트', totalCalls: '총 통화', joined: '가입일', actions: '작업',
    enterprise: '엔터프라이즈', professional: '프로페셔널', starter: '스타터', trial: '체험', suspended: '정지',
    platformAIIntelligence: '플랫폼 AI 지능', autonomousLearningMetrics: '자율 결정 및 학습 지표',
    multiBusinessNeural: '멀티 비즈니스 신경망',
    decisionsPerSec: '결정/초', accuracy: '정확도', selfCorrections: '자기 수정', learningRate: '학습률',
    fromAvg: '평균 대비', improvement: '개선', today: '오늘', thisWeek: '이번 주',
    monthlyRecurringRevenue: '월간 반복 수익', activeSubscriptions: '활성 구독', churnRate: '流失率',
    newThisWeek: '이번 주 신규', improvementChurn: '개선',
    platformSettings: '플랫폼 설정', platformWideSettings: '플랫폼 전체 설정 및 통합 구성',
    apiConfiguration: 'API 구성', infrastructure: '인프라',
    supabase: 'Supabase', stripe: 'Stripe', square: 'Square', voiceAI: 'Voice AI',
    connected: '연결됨', region: '지역', apiLatency: 'API 지연시간',
    ceoAIBrain: 'CEO 및 AI 오케스트레이터', ownerCommands: '소유자 명령',
    enterCommandCEO: 'CEO 명령 입력...',
    recentDecisions: '최근 결정', autonomousModeON: '자율 모드: 켜짐',
    hermesEmployee: '주요 플랫폼 직원', platformOperations: '플랫폼 운영',
    frontendTasks: '프론트엔드 작업', backendTasks: '백엔드 작업',
    enterTaskHermes: 'Hermes 작업 입력...',
    recentTasks: '최근 작업', runningPlatformOps: '플랫폼 운영 실행 중',
    footerText: '© 2026 FrontDesk Agents. 플랫폼 소유자 대시보드.',
    systemStatus: '시스템 상태', footerSystemsOperational: '모든 시스템 운영 중',
    darkMode: '다크 모드', lightMode: '라이트 모드'
  },
  ja: {
    platformOwner: 'オーナー', platformOwnerAccess: 'プラットフォームオーナーアクセス',
    navOverview: '概要', navAgents: 'AIエージェント', navCustomers: '顧客', navIntelligence: 'インテリジェンス', navSettings: '設定',
    platformAlerts: 'プラットフォームアラート', profileSettings: 'プロフィール設定', logOut: 'ログアウト',
    themeLight: 'ライトモードに切り替え', themeDark: 'ダークモードに切り替え',
    platformOperatingNormally: 'プラットフォーム正常に 운영中',
    businessesActive: 'ビジネス', activeAIAgents: 'アクティブAIエージェント', uptime: '稼働率',
    allSystemsOperational: '全システム運用中', regions: 'US-East, EU-West, AP-South',
    totalRevenue: '総収益', activeBusinesses: 'アクティブビジネス', aiAgentsRunning: 'アクティブAIエージェント',
    callsToday: '今日の通話', avgResponseTime: '平均応答時間', systemUptime: 'システム稼働率',
    platformAIOrchestrator: 'プラットフォームAIオーケストレーター', realTimeAutonomous: 'リアルタイム自律的意思決定', live: 'ライブ',
    analyzingGlobalDemand: 'グローバル需要パターンを分析中', detectedSpike: 'エンタープライズアカウントの予約通話が23%増加を検出.',
    scaleSchedulerAgents: 'スケジューラーエージェントを+15%スケール',
    processingUpgrades: 'サブスクリプションアップグレードを処理中', approachingLimits: '3つのエンタープライズアカウントが通話制限に近づいています.',
    notifySalesTeam: '営業チームに通知',
    monitoringHealth: 'インフラストラクチャの健常性を監視中', servicesNormal: 'すべてのサービスが正常。APIレイテンシーが許容範囲内.',
    continueMonitoring: '監視を継続',
    analyzingChurnRisk: 'チャーンリスクを分析中', decliningUsage: '2つのスターターアカウントで使用率が低下しています.',
    sendEngagementTriggers: 'エンゲージメントトリガーを送信',
    topPerformingAgents: '最高パフォーマンスエージェント', viewAll: 'すべて表示',
    recentRevenue: '最近の収益', thisMonth: '今月',
    multiAgentOrchestration: 'マルチエージェントオーケストレーション', platformWideTasks: 'プラットフォーム全体のタスク調整',
    primary: 'プライマリ', collaborators: 'コラボレーター',
    allPlatformAgents: 'すべてのプラットフォームエージェント', agentsAcrossBusinesses: 'ビジネス間のアクティブエージェント',
    export: 'エクスポート', addAgentTemplate: 'エージェントテンプレートを追加',
    searchAgents: 'エージェントを検索...', allBusinesses: 'すべてのビジネス', allStatus: 'すべてのステータス',
    agent: 'エージェント', business: 'ビジネス', status: 'ステータス', confidence: '信頼性', callsTodayHeader: '今日の通話', selfCorrection: '自己修正', avgResponse: '平均応答',
    active: 'アクティブ', paused: '一時停止', learning: '学習中',
    customerAccounts: '顧客アカウント', totalAccounts: '総アカウント', accountsActive: 'アクティブ',
    addCustomer: '顧客を追加',
    owner: 'オーナー', plan: 'プラン', agents: 'エージェント', totalCalls: '総通話', joined: '参加日', actions: 'アクション',
    enterprise: 'エンタープライズ', professional: 'プロフェッショナル', starter: 'スターター', trial: 'トライアル', suspended: '停止',
    platformAIIntelligence: 'プラットフォームAIインテリジェンス', autonomousLearningMetrics: '自律的意思決定と学習指標',
    multiBusinessNeural: 'マルチビジネスニューラルネットワーク',
    decisionsPerSec: '決定/秒', accuracy: '正確性', selfCorrections: '自己修正', learningRate: '学習率',
    fromAvg: '平均から', improvement: '改善', today: '今日', thisWeek: '今週',
    monthlyRecurringRevenue: '月間経常収益', activeSubscriptions: 'アクティブサブスクリプション', churnRate: 'チャーン率',
    newThisWeek: '今週の新規', improvementChurn: '改善',
    platformSettings: 'プラットフォーム設定', platformWideSettings: 'プラットフォーム全体の設定と統合を構成',
    apiConfiguration: 'API構成', infrastructure: 'インフラストラクチャ',
    supabase: 'Supabase', stripe: 'Stripe', square: 'Square', voiceAI: 'Voice AI',
    connected: '接続済み', region: '地域', apiLatency: 'APIレイテンシー',
    ceoAIBrain: 'CEOおよびAIオーケストレーター', ownerCommands: '所有者のコマンド',
    enterCommandCEO: 'CEOコマンドを入力...',
    recentDecisions: '最近の決定', autonomousModeON: '自律モード: オン',
    hermesEmployee: 'メインプラットフォーム従業員', platformOperations: 'プラットフォームオペレーション',
    frontendTasks: 'フロントエンドタスク', backendTasks: 'バックエンドタスク',
    enterTaskHermes: 'Hermesタスクを入力...',
    recentTasks: '最近のタスク', runningPlatformOps: 'プラットフォームオペレーション実行中',
    footerText: '© 2026 FrontDesk Agents. プラットフォームオーナーダッシュボード.',
    systemStatus: 'システムステータス', footerSystemsOperational: '全システム運用中',
    darkMode: 'ダークモード', lightMode: 'ライトモード'
  },
  vi: {
    platformOwner: 'CHỦ SỞ HỮU', platformOwnerAccess: 'Truy cập Chủ sở hữu Nền tảng',
    navOverview: 'Tổng quan', navAgents: 'Đại lý AI', navCustomers: 'Khách hàng', navIntelligence: 'Trí tuệ', navSettings: 'Cài đặt',
    platformAlerts: 'Cảnh báo Nền tảng', profileSettings: 'Cài đặt Hồ sơ', logOut: 'Đăng xuất',
    themeLight: 'Chuyển sang chế độ sáng', themeDark: 'Chuyển sang chế độ tối',
    platformOperatingNormally: 'Nền tảng Hoạt động Bình thường',
    businessesActive: 'doanh nghiệp', activeAIAgents: 'đại lý AI đang hoạt động', uptime: 'thời gian hoạt động',
    allSystemsOperational: 'Tất cả Hệ thống Hoạt động', regions: 'US-East, EU-West, AP-South',
    totalRevenue: 'Tổng Doanh thu', activeBusinesses: 'Doanh nghiệp Hoạt động', aiAgentsRunning: 'Đại lý AI Hoạt động',
    callsToday: 'Cuộc gọi Hôm nay', avgResponseTime: 'Thời gian Phản hồi Trung bình', systemUptime: 'Thời gian Hoạt động Hệ thống',
    platformAIOrchestrator: 'Điều phối AI Nền tảng', realTimeAutonomous: 'Quyết định tự chủ thời gian thực', live: 'Trực tiếp',
    analyzingGlobalDemand: 'Phân tích các mẫu nhu cầu toàn cầu', detectedSpike: 'Phát hiện tăng 23% trong các cuộc gọi lên lịch hẹn.',
    scaleSchedulerAgents: 'Mở rộng đại lý Lịch biểu +15%',
    processingUpgrades: 'Xử lý nâng cấp đăng ký', approachingLimits: '3 tài khoản doanh nghiệp đang tiếp cận giới hạn cuộc gọi.',
    notifySalesTeam: 'Thông báo cho đội ngũ bán hàng',
    monitoringHealth: 'Giám sát tình trạng cơ sở hạ tầng', servicesNormal: 'Tất cả các dịch vụ bình thường. Độ trễ API trong ngưỡng chấp nhận được.',
    continueMonitoring: 'Tiếp tục giám sát',
    analyzingChurnRisk: 'Phân tích rủi ro churn', decliningUsage: '2 tài khoản starter có mức sử dụng giảm.',
    sendEngagementTriggers: 'Gửi kích hoạt tương tác',
    topPerformingAgents: 'Đại lý Hiệu suất Cao nhất', viewAll: 'Xem Tất cả',
    recentRevenue: 'Doanh thu Gần đây', thisMonth: 'tháng này',
    multiAgentOrchestration: 'Điều phối Đa đại lý', platformWideTasks: 'Phối hợp nhiệm vụ trên toàn nền tảng',
    primary: 'Chính', collaborators: 'Cộng tác viên',
    allPlatformAgents: 'Tất cả Đại lý Nền tảng', agentsAcrossBusinesses: 'đại lý hoạt động trên các doanh nghiệp',
    export: 'Xuất', addAgentTemplate: 'Thêm Mẫu đại lý',
    searchAgents: 'Tìm kiếm đại lý...', allBusinesses: 'Tất cả Doanh nghiệp', allStatus: 'Tất cả Trạng thái',
    agent: 'Đại lý', business: 'Doanh nghiệp', status: 'Trạng thái', confidence: 'Độ tin cậy', callsTodayHeader: 'Cuộc gọi Hôm nay', selfCorrection: 'Tự sửa', avgResponse: 'Phản hồi Trung bình',
    active: 'Hoạt động', paused: 'Tạm dừng', learning: 'Đang học',
    customerAccounts: 'Tài khoản Khách hàng', totalAccounts: 'tổng tài khoản', accountsActive: 'hoạt động',
    addCustomer: 'Thêm Khách hàng',
    owner: 'Chủ sở hữu', plan: 'Kế hoạch', agents: 'Đại lý', totalCalls: 'Tổng Cuộc gọi', joined: 'Tham gia', actions: 'Hành động',
    enterprise: 'Doanh nghiệp', professional: 'Chuyên nghiệp', starter: 'Starter', trial: 'Dùng thử', suspended: 'Tạm ngừng',
    platformAIIntelligence: 'Trí tuệ AI Nền tảng', autonomousLearningMetrics: 'Quyết định tự chủ và chỉ số học tập',
    multiBusinessNeural: 'Mạng lưới Thần kinh Đa doanh nghiệp',
    decisionsPerSec: 'Quyết định/giây', accuracy: 'Độ chính xác', selfCorrections: 'Tự sửa', learningRate: 'Tốc độ Học tập',
    fromAvg: 'từ trung bình', improvement: 'cải thiện', today: 'Hôm nay', thisWeek: 'Tuần này',
    monthlyRecurringRevenue: 'Doanh thu Định kỳ Hàng tháng', activeSubscriptions: 'Đăng ký Hoạt động', churnRate: 'Tỷ lệ Churn',
    newThisWeek: 'mới tuần này', improvementChurn: 'cải thiện',
    platformSettings: 'Cài đặt Nền tảng', platformWideSettings: 'Định cấu hình cài đặt và tích hợp trên toàn nền tảng',
    apiConfiguration: 'Cấu hình API', infrastructure: 'Cơ sở hạ tầng',
    supabase: 'Supabase', stripe: 'Stripe', square: 'Square', voiceAI: 'Voice AI',
    connected: 'Đã kết nối', region: 'Khu vực', apiLatency: 'Độ trễ API',
    ceoAIBrain: 'CEO và Điều phối AI', ownerCommands: 'Lệnh Chủ sở hữu',
    enterCommandCEO: 'Nhập lệnh cho CEO...',
    recentDecisions: 'Quyết định Gần đây', autonomousModeON: 'Chế độ Tự chủ: BẬT',
    hermesEmployee: 'Nhân viên Chính của Nền tảng', platformOperations: 'Vận hành Nền tảng',
    frontendTasks: 'Nhiệm vụ Frontend', backendTasks: 'Nhiệm vụ Backend',
    enterTaskHermes: 'Nhập nhiệm vụ cho Hermes...',
    recentTasks: 'Nhiệm vụ Gần đây', runningPlatformOps: 'Đang Chạy Vận hành Nền tảng',
    footerText: '© 2026 FrontDesk Agents. Bảng điều khiển Chủ sở hữu Nền tảng.',
    systemStatus: 'Trạng thái Hệ thống', footerSystemsOperational: 'Tất cả Hệ thống Hoạt động',
    darkMode: 'Chế độ Tối', lightMode: 'Chế độ Sáng'
  },
  tl: {
    platformOwner: 'MAY-ARI', platformOwnerAccess: 'Access ng Platform Owner',
    navOverview: 'Overview', navAgents: 'AI Agents', navCustomers: 'Customers', navIntelligence: 'Intelligence', navSettings: 'Settings',
    platformAlerts: 'Platform Alerts', profileSettings: 'Profile Settings', logOut: 'Mag-log Out',
    themeLight: 'Mag-switch sa light mode', themeDark: 'Mag-switch sa dark mode',
    platformOperatingNormally: 'Platform Operating Normally',
    businessesActive: 'negosyo', activeAIAgents: 'active na AI agents', uptime: 'uptime',
    allSystemsOperational: 'All Systems Operational', regions: 'US-East, EU-West, AP-South',
    totalRevenue: 'Total Revenue', activeBusinesses: 'Active na Negosyo', aiAgentsRunning: 'Active na AI Agents',
    callsToday: 'Tawag Ngayon', avgResponseTime: 'Average Response Time', systemUptime: 'System Uptime',
    platformAIOrchestrator: 'Platform AI Orchestrator', realTimeAutonomous: 'Real-time autonomous decision making', live: 'Live',
    analyzingGlobalDemand: 'Nagsasagawa ng pagsusuri sa global demand patterns', detectedSpike: 'Nakakita ng 23% spike sa appointment scheduling calls.',
    scaleSchedulerAgents: 'I-scale ang Scheduler agents +15%',
    processingUpgrades: 'Nagproseso ng subscription upgrades', approachingLimits: '3 enterprise accounts ang nag-a-approach ng call limits.',
    notifySalesTeam: 'I-notify ang sales team',
    monitoringHealth: 'Nagmo-monitor ng infrastructure health', servicesNormal: 'All services nominal. API latency within acceptable thresholds.',
    continueMonitoring: 'Ituloy ang monitoring',
    analyzingChurnRisk: 'Nagsasagawa ng churn risk analysis', decliningUsage: '2 starter accounts ang may declining usage.',
    sendEngagementTriggers: 'Mag-send ng engagement triggers',
    topPerformingAgents: 'Top Performing Agents', viewAll: 'View All',
    recentRevenue: 'Kamakailang Revenue', thisMonth: 'this month',
    multiAgentOrchestration: 'Multi-Agent Orchestration', platformWideTasks: 'Platform-wide task coordination',
    primary: 'Primary', collaborators: 'Collaborators',
    allPlatformAgents: 'All Platform Agents', agentsAcrossBusinesses: 'active agents sa mga negosyo',
    export: 'I-export', addAgentTemplate: 'Add Agent Template',
    searchAgents: 'Mag-search ng agents...', allBusinesses: 'All Businesses', allStatus: 'All Status',
    agent: 'Agent', business: 'Negosyo', status: 'Status', confidence: 'Confidence', callsTodayHeader: 'Tawag Ngayon', selfCorrection: 'Self-Correction', avgResponse: 'Average Response',
    active: 'Active', paused: 'Paused', learning: 'Learning',
    customerAccounts: 'Customer Accounts', totalAccounts: 'total na accounts', accountsActive: 'active',
    addCustomer: 'Magdagdag ng Customer',
    owner: 'May-ari', plan: 'Plan', agents: 'Agents', totalCalls: 'Total na Tawag', joined: 'Nag-join', actions: 'Actions',
    enterprise: 'Enterprise', professional: 'Professional', starter: 'Starter', trial: 'Trial', suspended: 'Suspended',
    platformAIIntelligence: 'Platform AI Intelligence', autonomousLearningMetrics: 'Autonomous decision making and learning metrics',
    multiBusinessNeural: 'Multi-Business Neural Network',
    decisionsPerSec: 'Decisions/sec', accuracy: 'Accuracy', selfCorrections: 'Self-Corrections', learningRate: 'Learning Rate',
    fromAvg: 'mula sa average', improvement: 'improvement', today: 'Ngayon', thisWeek: 'This week',
    monthlyRecurringRevenue: 'Monthly Recurring Revenue', activeSubscriptions: 'Active Subscriptions', churnRate: 'Churn Rate',
    newThisWeek: 'new this week', improvementChurn: 'improvement',
    platformSettings: 'Platform Settings', platformWideSettings: 'Configure platform-wide settings and integrations',
    apiConfiguration: 'API Configuration', infrastructure: 'Infrastructure',
    supabase: 'Supabase', stripe: 'Stripe', square: 'Square', voiceAI: 'Voice AI',
    connected: 'Connected', region: 'Region', apiLatency: 'API Latency',
    ceoAIBrain: 'CEO & AI Orchestrator', ownerCommands: 'Owner Commands',
    enterCommandCEO: 'Mag-enter ng command para sa CEO...',
    recentDecisions: 'Kamakailang mga Desisyon', autonomousModeON: 'Autonomous Mode: ON',
    hermesEmployee: 'Main Platform Employee', platformOperations: 'Platform Operations',
    frontendTasks: 'Frontend Tasks', backendTasks: 'Backend Tasks',
    enterTaskHermes: 'Mag-enter ng task para kay Hermes...',
    recentTasks: 'Kamakailang mga Task', runningPlatformOps: 'Running Platform Operations',
    footerText: '© 2026 FrontDesk Agents. Platform Owner Dashboard.',
    systemStatus: 'System Status', footerSystemsOperational: 'All Systems Operational',
    darkMode: 'Dark Mode', lightMode: 'Light Mode'
  },
  de: {
    platformOwner: 'EIGENTÜMER', platformOwnerAccess: 'Plattform-Eigentümer-Zugang',
    navOverview: 'Übersicht', navAgents: 'KI-Agenten', navCustomers: 'Kunden', navIntelligence: 'Intelligenz', navSettings: 'Einstellungen',
    platformAlerts: 'Plattform-Warnungen', profileSettings: 'Profileinstellungen', logOut: 'Abmelden',
    themeLight: 'Zum hellen Modus wechseln', themeDark: 'Zum dunklen Modus wechseln',
    platformOperatingNormally: 'Plattform arbeitet normal',
    businessesActive: 'Geschäfte', activeAIAgents: 'aktive KI-Agenten', uptime: 'Verfügbarkeit',
    allSystemsOperational: 'Alle Systeme operativ', regions: 'US-East, EU-West, AP-South',
    totalRevenue: 'Gesamtumsatz', activeBusinesses: 'Aktive Geschäfte', aiAgentsRunning: 'Aktive KI-Agenten',
    callsToday: 'Anrufe heute', avgResponseTime: 'Durchschn. Antwortzeit', systemUptime: 'Systemverfügbarkeit',
    platformAIOrchestrator: 'Plattform-KI-Orchestrator', realTimeAutonomous: 'Echtzeit-autonome Entscheidungsfindung', live: 'Live',
    analyzingGlobalDemand: 'Analysiere globale Nachfragemuster', detectedSpike: '23% Anstieg bei Terminplanungsanrufen erkannt.',
    scaleSchedulerAgents: 'Scheduler-Agenten um 15% skalieren',
    processingUpgrades: 'Verarbeite Abonnement-Upgrades', approachingLimits: '3 Enterprise-Konten nähern sich Anrufgrenzen.',
    notifySalesTeam: 'Vertriebsteam benachrichtigen',
    monitoringHealth: 'Überwache Infrastruktur-Gesundheit', servicesNormal: 'Alle Dienste nominal. API-Latenz innerhalb akzeptabler Schwellenwerte.',
    continueMonitoring: 'Überwachung fortsetzen',
    analyzingChurnRisk: 'Analysiere Churn-Risiko', decliningUsage: '2 Starter-Konten mit zurückgehender Nutzung.',
    sendEngagementTriggers: 'Engagement-Trigger senden',
    topPerformingAgents: 'Top-performende Agenten', viewAll: 'Alle anzeigen',
    recentRevenue: 'Kürzlicher Umsatz', thisMonth: 'diesen Monat',
    multiAgentOrchestration: 'Multi-Agenten-Orchestrierung', platformWideTasks: 'Plattformweite Aufgabenkoordination',
    primary: 'Primär', collaborators: 'Mitarbeiter',
    allPlatformAgents: 'Alle Plattform-Agenten', agentsAcrossBusinesses: 'aktive Agenten in Geschäften',
    export: 'Exportieren', addAgentTemplate: 'Agentenvorlage hinzufügen',
    searchAgents: 'Agenten suchen...', allBusinesses: 'Alle Geschäfte', allStatus: 'Alle Status',
    agent: 'Agent', business: 'Geschäft', status: 'Status', confidence: 'Vertrauen', callsTodayHeader: 'Anrufe heute', selfCorrection: 'Selbstkorrektur', avgResponse: 'Durchschn. Antwort',
    active: 'Aktiv', paused: 'Pausiert', learning: 'Lernend',
    customerAccounts: 'Kundenkonten', totalAccounts: 'Gesamtkonten', accountsActive: 'aktiv',
    addCustomer: 'Kunde hinzufügen',
    owner: 'Eigentümer', plan: 'Plan', agents: 'Agenten', totalCalls: 'Gesamtanrufe', joined: 'Beigetreten', actions: 'Aktionen',
    enterprise: 'Unternehmen', professional: 'Professionell', starter: 'Starter', trial: 'Testversion', suspended: 'Suspendiert',
    platformAIIntelligence: 'Plattform-KI-Intelligenz', autonomousLearningMetrics: 'Autonome Entscheidungsfindung und Lernmetriken',
    multiBusinessNeural: 'Multi-Geschäfts-Neuronales Netzwerk',
    decisionsPerSec: 'Entscheidungen/Sek', accuracy: 'Genauigkeit', selfCorrections: 'Selbstkorrekturen', learningRate: 'Lernrate',
    fromAvg: 'vom Durchschnitt', improvement: 'Verbesserung', today: 'Heute', thisWeek: 'Diese Woche',
    monthlyRecurringRevenue: 'Monatlich wiederkehrender Umsatz', activeSubscriptions: 'Aktive Abonnements', churnRate: 'Churn-Rate',
    newThisWeek: 'neu diese Woche', improvementChurn: 'Verbesserung',
    platformSettings: 'Plattform-Einstellungen', platformWideSettings: 'Plattformweite Einstellungen und Integrationen konfigurieren',
    apiConfiguration: 'API-Konfiguration', infrastructure: 'Infrastruktur',
    supabase: 'Supabase', stripe: 'Stripe', square: 'Square', voiceAI: 'Voice AI',
    connected: 'Verbunden', region: 'Region', apiLatency: 'API-Latenz',
    ceoAIBrain: 'CEO & KI-Orchestrator', ownerCommands: 'Eigentümer-Befehle',
    enterCommandCEO: 'Befehl für CEO eingeben...',
    recentDecisions: 'Kürzliche Entscheidungen', autonomousModeON: 'Autonomer Modus: AN',
    hermesEmployee: 'Hauptplattform-Mitarbeiter', platformOperations: 'Plattform-Betrieb',
    frontendTasks: 'Frontend-Aufgaben', backendTasks: 'Backend-Aufgaben',
    enterTaskHermes: 'Aufgabe für Hermes eingeben...',
    recentTasks: 'Kürzliche Aufgaben', runningPlatformOps: 'Plattform-Betrieb läuft',
    footerText: '© 2026 FrontDesk Agents. Plattform-Eigentümer-Dashboard.',
    systemStatus: 'Systemstatus', footerSystemsOperational: 'Alle Systeme operativ',
    darkMode: 'Dunkler Modus', lightMode: 'Heller Modus'
  },
  it: {
    platformOwner: 'PROPRIETARIO', platformOwnerAccess: 'Accesso Proprietario Piattaforma',
    navOverview: 'Panoramica', navAgents: 'Agenti IA', navCustomers: 'Clienti', navIntelligence: 'Intelligenza', navSettings: 'Impostazioni',
    platformAlerts: 'Avvisi Piattaforma', profileSettings: 'Impostazioni Profilo', logOut: 'Disconnettiti',
    themeLight: 'Passa a modalità chiara', themeDark: 'Passa a modalità scura',
    platformOperatingNormally: 'Piattaforma Operante Normally',
    businessesActive: 'attività', activeAIAgents: 'agenti IA attivi', uptime: 'disponibilità',
    allSystemsOperational: 'Tutti i Sistemi Operativi', regions: 'US-East, EU-West, AP-South',
    totalRevenue: 'Ricavo Totale', activeBusinesses: 'Attività Attive', aiAgentsRunning: 'Agenti IA Attivi',
    callsToday: 'Chiamate Oggi', avgResponseTime: 'Tempo di Risposta Medio', systemUptime: 'Disponibilità Sistema',
    platformAIOrchestrator: 'Orchestratore IA Piattaforma', realTimeAutonomous: 'Decisioni autonome in tempo reale', live: 'In diretta',
    analyzingGlobalDemand: 'Analizzando pattern di domanda globale', detectedSpike: 'Rilevato aumento del 23% nelle chiamate di programmazione appuntamenti.',
    scaleSchedulerAgents: 'Scala agenti Scheduler +15%',
    processingUpgrades: 'Elaborazione upgrade abbonamento', approachingLimits: '3 account enterprise si stanno avvicinando ai limiti di chiamata.',
    notifySalesTeam: 'Notifica il team di vendita',
    monitoringHealth: 'Monitoraggio salute infrastruttura', servicesNormal: 'Tutti i servizi nominali. Latenza API entro soglie accettabili.',
    continueMonitoring: 'Continua monitoraggio',
    analyzingChurnRisk: 'Analisi rischio churn', decliningUsage: '2 account starter con utilizzo in calo.',
    sendEngagementTriggers: 'Invia trigger di coinvolgimento',
    topPerformingAgents: 'Agenti con Migliori Prestazioni', viewAll: 'Vedi Tutto',
    recentRevenue: 'Ricavo Recente', thisMonth: 'questo mese',
    multiAgentOrchestration: 'Orchestrazione Multi-Agente', platformWideTasks: 'Coordinazione attività a livello piattaforma',
    primary: 'Primario', collaborators: 'Collaboratori',
    allPlatformAgents: 'Tutti gli Agenti Piattaforma', agentsAcrossBusinesses: 'agenti attivi tra attività',
    export: 'Esporta', addAgentTemplate: 'Aggiungi Modello Agente',
    searchAgents: 'Cerca agenti...', allBusinesses: 'Tutte le Attività', allStatus: 'Tutti i Status',
    agent: 'Agente', business: 'Attività', status: 'Status', confidence: 'Fiducia', callsTodayHeader: 'Chiamate Oggi', selfCorrection: 'Auto-Correzione', avgResponse: 'Risposta Media',
    active: 'Attivo', paused: 'In pausa', learning: 'Apprendimento',
    customerAccounts: 'Account Clienti', totalAccounts: 'account totali', accountsActive: 'attivo',
    addCustomer: 'Aggiungi Cliente',
    owner: 'Proprietario', plan: 'Piano', agents: 'Agenti', totalCalls: 'Chiamate Totali', joined: 'Iscritto', actions: 'Azioni',
    enterprise: 'Enterprise', professional: 'Professionale', starter: 'Starter', trial: 'Trial', suspended: 'Sospeso',
    platformAIIntelligence: 'Intelligenza IA Piattaforma', autonomousLearningMetrics: 'Decisioni autonome e metriche di apprendimento',
    multiBusinessNeural: 'Rete Neurale Multi-Attività',
    decisionsPerSec: 'Decisioni/sec', accuracy: 'Precisione', selfCorrections: 'Auto-Correzioni', learningRate: 'Tasso di Apprendimento',
    fromAvg: 'dalla media', improvement: 'miglioramento', today: 'Oggi', thisWeek: 'Questa settimana',
    monthlyRecurringRevenue: 'Ricavo Ricorrente Mensile', activeSubscriptions: 'Abbonamenti Attivi', churnRate: 'Tasso di Churn',
    newThisWeek: 'nuovi questa settimana', improvementChurn: 'miglioramento',
    platformSettings: 'Impostazioni Piattaforma', platformWideSettings: 'Configura impostazioni e integrazioni a livello piattaforma',
    apiConfiguration: 'Configurazione API', infrastructure: 'Infrastruttura',
    supabase: 'Supabase', stripe: 'Stripe', square: 'Square', voiceAI: 'Voice AI',
    connected: 'Connesso', region: 'Regione', apiLatency: 'Latenza API',
    ceoAIBrain: 'CEO e Orchestratore IA', ownerCommands: 'Comandi del Proprietario',
    enterCommandCEO: 'Inserisci comando per CEO...',
    recentDecisions: 'Decisioni Recenti', autonomousModeON: 'Modalità Autonoma: ON',
    hermesEmployee: 'Impiegato Principale Piattaforma', platformOperations: 'Operazioni Piattaforma',
    frontendTasks: 'Attività Frontend', backendTasks: 'Attività Backend',
    enterTaskHermes: 'Inserisci attività per Hermes...',
    recentTasks: 'Attività Recenti', runningPlatformOps: 'Operazioni Piattaforma in corso',
    footerText: '© 2026 FrontDesk Agents. Dashboard Proprietario Piattaforma.',
    systemStatus: 'Stato Sistema', footerSystemsOperational: 'Tutti i Sistemi Operativi',
    darkMode: 'Modalità Scura', lightMode: 'Modalità Chiara'
  },
  ru: {
    platformOwner: 'ВЛАДЕЛЕЦ', platformOwnerAccess: 'Доступ владельца платформы',
    navOverview: 'Обзор', navAgents: 'ИИ-агенты', navCustomers: 'Клиенты', navIntelligence: 'Интеллект', navSettings: 'Настройки',
    platformAlerts: 'Оповещения платформы', profileSettings: 'Настройки профиля', logOut: 'Выйти',
    themeLight: 'Переключиться на светлый режим', themeDark: 'Переключиться на тёмный режим',
    platformOperatingNormally: 'Платформа работает нормально',
    businessesActive: 'бизнесы', activeAIAgents: 'активных ИИ-агентов', uptime: 'время работы',
    allSystemsOperational: 'Все системы работают', regions: 'US-East, EU-West, AP-South',
    totalRevenue: 'Общий доход', activeBusinesses: 'Активные бизнесы', aiAgentsRunning: 'Активные ИИ-агенты',
    callsToday: 'Звонки сегодня', avgResponseTime: 'Среднее время ответа', systemUptime: 'Доступность системы',
    platformAIOrchestrator: 'ИИ-оркестратор платформы', realTimeAutonomous: 'Принятие решений в реальном времени', live: 'Онлайн',
    analyzingGlobalDemand: 'Анализ глобальных паттернов спроса', detectedSpike: 'Обнаружен рост на 23% в звонках по записи на приём.',
    scaleSchedulerAgents: 'Масштабировать агентов-планировщиков на +15%',
    processingUpgrades: 'Обработка улучшений подписки', approachingLimits: '3 корпоративных аккаунта приближаются к лимитам звонков.',
    notifySalesTeam: 'Уведомить команду продаж',
    monitoringHealth: 'Мониторинг здоровья инфраструктуры', servicesNormal: 'Все сервисы в норме. Задержка API в допустимых пределах.',
    continueMonitoring: 'Продолжить мониторинг',
    analyzingChurnRisk: 'Анализ риска оттока', decliningUsage: '2 стартовых аккаунта с снижением использования.',
    sendEngagementTriggers: 'Отправить триггеры вовлечения',
    topPerformingAgents: 'Лучшие агенты', viewAll: 'Посмотреть все',
    recentRevenue: 'Недавний доход', thisMonth: 'этот месяц',
    multiAgentOrchestration: 'Мультиагентная оркестрация', platformWideTasks: 'Координация задач на уровне платформы',
    primary: 'Основной', collaborators: 'Сотрудники',
    allPlatformAgents: 'Все агенты платформы', agentsAcrossBusinesses: 'активных агентов в бизнесах',
    export: 'Экспорт', addAgentTemplate: 'Добавить шаблон агента',
    searchAgents: 'Поиск агентов...', allBusinesses: 'Все бизнесы', allStatus: 'Все статусы',
    agent: 'Агент', business: 'Бизнес', status: 'Статус', confidence: 'Уверенность', callsTodayHeader: 'Звонки сегодня', selfCorrection: 'Самокоррекция', avgResponse: 'Средний ответ',
    active: 'Активный', paused: 'На паузе', learning: 'Обучение',
    customerAccounts: 'Аккаунты клиентов', totalAccounts: 'всего аккаунтов', accountsActive: 'активных',
    addCustomer: 'Добавить клиента',
    owner: 'Владелец', plan: 'План', agents: 'Агенты', totalCalls: 'Всего звонков', joined: 'Присоединился', actions: 'Действия',
    enterprise: 'Корпоративный', professional: 'Профессиональный', starter: 'Стартовый', trial: 'Пробный', suspended: 'Приостановлен',
    platformAIIntelligence: 'ИИ-интеллект платформы', autonomousLearningMetrics: 'Автономное принятие решений и метрики обучения',
    multiBusinessNeural: 'Мультибизнес-нейронная сеть',
    decisionsPerSec: 'Решений/сек', accuracy: 'Точность', selfCorrections: 'Самокоррекции', learningRate: 'Скорость обучения',
    fromAvg: 'от среднего', improvement: 'улучшение', today: 'Сегодня', thisWeek: 'На этой неделе',
    monthlyRecurringRevenue: 'Ежемесячный повторяющийся доход', activeSubscriptions: 'Активные подписки', churnRate: 'Коэффициент оттока',
    newThisWeek: 'новых на этой неделе', improvementChurn: 'улучшение',
    platformSettings: 'Настройки платформы', platformWideSettings: 'Настройка параметров и интеграций платформы',
    apiConfiguration: 'Конфигурация API', infrastructure: 'Инфраструктура',
    supabase: 'Supabase', stripe: 'Stripe', square: 'Square', voiceAI: 'Voice AI',
    connected: 'Подключено', region: 'Регион', apiLatency: 'Задержка API',
    ceoAIBrain: 'Генеральный директор и ИИ-оркестратор', ownerCommands: 'Команды владельца',
    enterCommandCEO: 'Введите команду для генерального директора...',
    recentDecisions: 'Недавние решения', autonomousModeON: 'Автономный режим: ВКЛ',
    hermesEmployee: 'Главный сотрудник платформы', platformOperations: 'Операции платформы',
    frontendTasks: 'Задачи интерфейса', backendTasks: 'Задачи сервера',
    enterTaskHermes: 'Введите задачу для Hermes...',
    recentTasks: 'Недавние задачи', runningPlatformOps: 'Выполняются операции платформы',
    footerText: '© 2026 FrontDesk Agents. Панель владельца платформы.',
    systemStatus: 'Статус системы', footerSystemsOperational: 'Все системы работают',
    darkMode: 'Тёмный режим', lightMode: 'Светлый режим'
  }
}

const getTranslation = (key: string, lang: string = 'en'): string => {
  return translations[lang]?.[key] || translations['en'][key] || key
}

// CEO Brain Import
import { ceoBrain, CEO_IDENTITY } from '@/lib/ceo-brain/CEOBrain'
import { hermesEmployee, HERMES_IDENTITY } from '@/lib/hermes-employee/HermesEmployee'

// Tesla-style colors
const tesla = {
  black: '#000000',
  darkGray: '#171717',
  mediumGray: '#393c41',
  lightGray: '#5c5c5c',
  white: '#ffffff',
  offWhite: '#f4f4f4',
  gold: '#f0b429',
  green: '#26de81',
  red: '#ff4444',
  blue: '#0066ff'
}

// Types
interface PlatformMetric {
  label: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: any
  color: string
}

interface AgentPerformance {
  agentId: string
  name: string
  business: string
  confidence: number
  callsToday: number
  status: 'active' | 'paused' | 'learning'
  selfCorrectionRate: number
  avgResponseTime: string
}

interface CustomerAccount {
  id: string
  businessName: string
  ownerName: string
  email: string
  plan: 'starter' | 'professional' | 'enterprise'
  status: 'active' | 'trial' | 'suspended'
  agentsActive: number
  totalCalls: number
  joinedDate: string
}

interface Transaction {
  id: string
  businessName: string
  amount: string
  date: string
  status: 'completed' | 'pending' | 'failed'
  plan: string
}

// Mock Data
const initialPlatformMetrics: PlatformMetric[] = [
  { label: 'Total Revenue', value: '$127,450', change: '+18.2%', trend: 'up', icon: DollarSign, color: 'green' },
  { label: 'Active Businesses', value: '847', change: '+12', trend: 'up', icon: Building2, color: 'blue' },
  { label: 'AI Agents Running', value: '2,341', change: '+156', trend: 'up', icon: Bot, color: 'purple' },
  { label: 'Calls Today', value: '48,291', change: '+8.3%', trend: 'up', icon: Phone, color: 'cyan' },
  { label: 'Avg Response Time', value: '0.8s', change: '-15%', trend: 'down', icon: ZapIcon, color: 'green' },
  { label: 'System Uptime', value: '99.98%', change: '+0.02%', trend: 'up', icon: Server, color: 'green' },
]

const topAgents: AgentPerformance[] = [
  { agentId: '1', name: 'Receptionist Pro', business: 'Acme Corp', confidence: 97, callsToday: 2341, status: 'active', selfCorrectionRate: 1.2, avgResponseTime: '0.6s' },
  { agentId: '2', name: 'Scheduler AI', business: 'TechStart Inc', confidence: 95, callsToday: 1876, status: 'active', selfCorrectionRate: 1.8, avgResponseTime: '0.7s' },
  { agentId: '3', name: 'FAQ Expert', business: 'Global Services', confidence: 99, callsToday: 1654, status: 'learning', selfCorrectionRate: 0.5, avgResponseTime: '0.4s' },
  { agentId: '4', name: 'Transfer Agent', business: 'SalesForce Pro', confidence: 92, callsToday: 1432, status: 'active', selfCorrectionRate: 3.1, avgResponseTime: '0.9s' },
  { agentId: '5', name: 'Voicemail Handler', business: 'Support Hub', confidence: 98, callsToday: 1298, status: 'active', selfCorrectionRate: 0.8, avgResponseTime: '0.5s' },
]

const recentCustomers: CustomerAccount[] = [
  { id: '1', businessName: 'Acme Corporation', ownerName: 'John Smith', email: 'john@acme.com', plan: 'enterprise', status: 'active', agentsActive: 5, totalCalls: 45678, joinedDate: '2024-01-15' },
  { id: '2', businessName: 'TechStart Inc', ownerName: 'Sarah Johnson', email: 'sarah@techstart.io', plan: 'professional', status: 'active', agentsActive: 3, totalCalls: 23456, joinedDate: '2024-03-22' },
  { id: '3', businessName: 'Global Services LLC', ownerName: 'Michael Chen', email: 'michael@globalservices.com', plan: 'professional', status: 'active', agentsActive: 4, totalCalls: 18765, joinedDate: '2024-02-10' },
  { id: '4', businessName: 'SalesForce Pro', ownerName: 'Emily Davis', email: 'emily@salesforcepro.com', plan: 'starter', status: 'trial', agentsActive: 2, totalCalls: 3456, joinedDate: '2025-01-05' },
  { id: '5', businessName: 'Support Hub', ownerName: 'James Wilson', email: 'james@supporthub.co', plan: 'enterprise', status: 'active', agentsActive: 5, totalCalls: 67890, joinedDate: '2023-11-20' },
]

const recentTransactions: Transaction[] = [
  { id: '1', businessName: 'Acme Corporation', amount: '$999/mo', date: 'Today', status: 'completed', plan: 'Enterprise' },
  { id: '2', businessName: 'TechStart Inc', amount: '$299/mo', date: 'Yesterday', status: 'completed', plan: 'Professional' },
  { id: '3', businessName: 'Global Services', amount: '$299/mo', date: 'Jan 18', status: 'completed', plan: 'Professional' },
  { id: '4', businessName: 'SalesForce Pro', amount: '$99/mo', date: 'Jan 15', status: 'pending', plan: 'Starter' },
  { id: '5', businessName: 'Support Hub', amount: '$999/mo', date: 'Jan 12', status: 'completed', plan: 'Enterprise' },
]

const agentThoughts = [
  { id: '1', agent: 'Platform Orchestrator', thought: 'Analyzing global demand patterns...', reasoning: 'Detected 23% spike in appointment scheduling calls across enterprise accounts. Routing additional capacity.', decision: 'Scale Scheduler agents +15%', confidence: 94, timestamp: new Date(Date.now() - 60000) },
  { id: '2', agent: 'Revenue Monitor', thought: 'Processing subscription upgrades...', reasoning: '3 enterprise accounts approaching call limits. Identifying upsell opportunities.', decision: 'Notify sales team', confidence: 89, timestamp: new Date(Date.now() - 120000) },
  { id: '3', agent: 'System Guardian', thought: 'Monitoring infrastructure health...', reasoning: 'All services nominal. API latency within acceptable thresholds.', decision: 'Continue monitoring', confidence: 99, timestamp: new Date(Date.now() - 180000) },
  { id: '4', agent: 'Customer Intelligence', thought: 'Analyzing churn risk...', reasoning: '2 starter accounts with declining usage. Running retention protocols.', decision: 'Send engagement triggers', confidence: 87, timestamp: new Date(Date.now() - 240000) },
]

const collaborativeTasks = [
  { id: '1', task: 'Balance platform load', primaryAgent: 'Orchestrator', collaboratingAgents: ['Scheduler', 'Guardian'], status: 'executing', progress: 78 },
  { id: '2', task: 'Process billing cycle', primaryAgent: 'Revenue', collaboratingAgents: ['Monitor', 'Alert'], status: 'executing', progress: 45 },
  { id: '3', task: 'Generate monthly reports', primaryAgent: 'Analytics', collaboratingAgents: ['Revenue', 'Intelligence'], status: 'completed', progress: 100 },
]

// Helper functions
const getAgentColor = (agent: string) => {
  switch (agent) {
    case 'Platform Orchestrator': return 'bg-gradient-to-br from-green-500 to-emerald-600'
    case 'Revenue Monitor': return 'bg-gradient-to-br from-blue-500 to-cyan-600'
    case 'System Guardian': return 'bg-gradient-to-br from-purple-500 to-pink-600'
    case 'Customer Intelligence': return 'bg-gradient-to-br from-orange-500 to-red-600'
    case 'Analytics': return 'bg-gradient-to-br from-yellow-500 to-amber-600'
    default: return 'bg-gradient-to-br from-gray-500 to-gray-600'
  }
}

const formatTimeAgo = (date: Date) => {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ago`
}

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 95) return 'text-green-500'
  if (confidence >= 85) return 'text-blue-500'
  if (confidence >= 70) return 'text-yellow-500'
  return 'text-red-500'
}

const getProgressColor = (progress: number) => {
  if (progress >= 75) return 'from-green-500 to-emerald-600'
  if (progress >= 50) return 'from-blue-500 to-cyan-600'
  if (progress >= 25) return 'from-yellow-500 to-amber-600'
  return 'from-red-500 to-pink-600'
}

const getPlanColor = (plan: string) => {
  switch (plan) {
    case 'enterprise': return 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
    case 'professional': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
    case 'starter': return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
    default: return 'bg-gray-500/20 text-gray-400'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-500/20 text-green-400'
    case 'trial': return 'bg-yellow-500/20 text-yellow-400'
    case 'suspended': return 'bg-red-500/20 text-red-400'
    default: return 'bg-gray-500/20 text-gray-400'
  }
}

export default function OwnerDashboardPage() {
  const router = useRouter()
  const [isDark, setIsDark] = useState(true)
  const [lang, setLang] = useState('en')
  const [isRTL, setIsRTL] = useState(false)
  const t = (key: string) => getTranslation(key, lang)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [selectedTab, setSelectedTab] = useState('overview')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showCEOPanel, setShowCEOPanel] = useState(false)
  const [ceoCommand, setCeoCommand] = useState('')
  const [ceoResponse, setCeoResponse] = useState<any>(null)
  const [ceoStatus, setCeoStatus] = useState<any>(null)
  const [notifications, setNotifications] = useState([
    { id: '1', message: 'New enterprise signup: TechCorp Global', time: '5 min ago', read: false },
    { id: '2', message: 'System alert: API latency spike detected in EU region', time: '12 min ago', read: false },
    { id: '3', message: 'Monthly revenue target exceeded by 18%', time: '1 hour ago', read: true },
  ])

  // CEO Brain State
  // Hermes Employee State
  const [hermesThinking, setHermesThinking] = useState(false)
  const [hermesCommand, setHermesCommand] = useState('')
  const [hermesResponse, setHermesResponse] = useState<any>(null)
  const [hermesTaskLog, setHermesTaskLog] = useState<any[]>([])
  const [showHermesPanel, setShowHermesPanel] = useState(false)
  
  // CEO Brain State
  const [ceoThinking, setCeoThinking] = useState(false)
  const [ceoDecisionLog, setCeoDecisionLog] = useState<any[]>([])

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'agents', label: 'AI Agents', icon: Brain },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'intelligence', label: 'Intelligence', icon: Sparkles },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  const unreadCount = notifications.filter(n => !n.read).length

  // Tab translation keys mapping
  const tabKeys: Record<string, string> = {
    overview: 'navOverview',
    agents: 'navAgents',
    customers: 'navCustomers',
    intelligence: 'navIntelligence',
    settings: 'navSettings'
  }

  // Language change handler
  useEffect(() => {
    const savedLang = localStorage.getItem('preferred-language') || 'en'
    setLang(savedLang)
    setIsRTL(rtlLanguages.includes(savedLang))
    
    const handleLangChange = (e: CustomEvent) => {
      setLang(e.detail)
      setIsRTL(rtlLanguages.includes(e.detail))
    }
    window.addEventListener('languageChange', handleLangChange as EventListener)
    return () => window.removeEventListener('languageChange', handleLangChange as EventListener)
  }, [])

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out?')) {
      try {
        await fetch('/api/owner/login', { method: 'DELETE' })
      } catch (e) {
        // ignore
      }
      router.push('/owner/login')
    }
  }

  const markNotificationRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
  }

  // Hermes Employee Command Handler - Main platform operations
  const executeHermesCommand = async () => {
    if (!hermesCommand.trim()) return
    setHermesThinking(true)
    setHermesResponse(null)
    
    try {
      // Call Hermes Employee API for real platform operations
      const response = await fetch('/api/hermes/employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: hermesCommand,
          context: {
            owner: CEO_IDENTITY.owner,
            platform: 'FrontDesk Agents',
            timestamp: new Date().toISOString()
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Hermes error: ${response.status}`)
      }

      const data = await response.json()
      
      // Update with Hermes response
      setHermesResponse({
        type: data.type || 'Task Completed',
        frontend: data.frontend || {},
        backend: data.backend || {},
        fullText: data.response || 'Hermes completed the task.'
      })

      // Add to task log
      setHermesTaskLog((prev: any[]) => [{
        command: hermesCommand,
        response: data.response?.substring(0, 60) + (data.response?.length > 60 ? '...' : ''),
        type: data.type,
        timestamp: new Date()
      }, ...prev].slice(0, 10))

      setHermesCommand('')
    } catch (error: any) {
      setHermesResponse({ 
        error: true,
        type: 'Hermes Error',
        fullText: `⚠️ Hermes connection failed: ${error.message}`
      })
    }
    setHermesThinking(false)
  }

  // CEO Real-Time Command Handler - Uses NVIDIA NIM AI for true AI responses
  const executeCEOCommand = async () => {
    if (!ceoCommand.trim()) return
    setCeoThinking(true)
    setCeoResponse(null)
    
    try {
      // Call the real-time CEO chat API powered by NVIDIA NIM AI
      const response = await fetch('/api/ceo/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: ceoCommand,
          conversationHistory: ceoDecisionLog.map((log: any) => ({
            role: 'assistant',
            content: log.response?.text || log.response?.decision?.type || 'Command executed'
          }))
        })
      })

      if (!response.ok) {
        throw new Error(`CEO AI error: ${response.status}`)
      }

      const data = await response.json()
      const aiText = data.response || 'AI processing complete.'

      // Update with real AI response
      setCeoResponse({
        response: {
          decision: { type: 'AI Response' },
          confidence: 97,
          execution: { status: 'success', actions: ['Real AI response received'] },
          fullText: aiText
        }
      })

      // Add to decision log
      setCeoDecisionLog((prev: any[]) => [{
        response: {
          decision: { type: 'AI Response' },
          confidence: 97,
          text: aiText.substring(0, 80) + (aiText.length > 80 ? '...' : '')
        }
      }, ...prev].slice(0, 10))

      setCeoCommand('')
    } catch (error: any) {
      setCeoResponse({ 
        error: true,
        response: {
          decision: { type: 'Communication Error' },
          confidence: 0,
          execution: { status: 'failed', actions: [error.message] },
          fullText: `⚠️ Connection failed: ${error.message}. Please check API configuration.`
        }
      })
    }
    setCeoThinking(false)
  }

  // Load CEO Status
  useEffect(() => {
    const status = ceoBrain.getStatus()
    setCeoStatus(status)
  }, [])

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-black' : 'bg-gray-50'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className={`fixed top-0 w-full z-50 ${isDark ? 'bg-black/90' : 'bg-white/90'} backdrop-blur-md border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
        <div className='max-w-7xl mx-auto px-6 py-4 flex justify-between items-center'>
          <Link href='/' className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center'>
              <Shield className='w-5 h-5 text-white' />
            </div>
            <div>
              <span className={`font-bold text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>FRONTDESK</span>
              <span className={`text-xs ml-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white`}>OWNER</span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className='hidden md:flex items-center gap-2'>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  selectedTab === tab.id
                    ? isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'
                    : isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className='w-4 h-4' />
                {t(tabKeys[tab.id])}
              </button>
            ))}
          </div>
          
          <div className='flex items-center gap-3'>
            {/* Hermes Employee Button */}
            <button
              onClick={() => setShowHermesPanel(!showHermesPanel)}
              className={`p-2 rounded-xl transition-all ${showHermesPanel ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30' : 'bg-white/10 hover:bg-white/20'} text-white`}
              title="Hermes - Main Platform Employee"
            >
              <Bot className={`w-5 h-5 ${showHermesPanel ? 'text-cyan-400' : 'text-blue-400'}`} />
            </button>
            
            {/* CEO Brain Button */}
            <button
              onClick={() => setShowCEOPanel(!showCEOPanel)}
              className={`p-2 rounded-xl transition-all ${showCEOPanel ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30' : 'bg-white/10 hover:bg-white/20'} text-white`}
              title="CEO AI Brain"
            >
              <Crown className={`w-5 h-5 ${showCEOPanel ? 'text-yellow-400' : 'text-yellow-500'}`} />
            </button>
            
            {/* Language Selector */}
            <LanguageSelector currentLang={lang} onChange={(newLang: string) => {
              setLang(newLang)
              setIsRTL(rtlLanguages.includes(newLang))
              localStorage.setItem('preferred-language', newLang)
              window.dispatchEvent(new CustomEvent('languageChange', { detail: newLang }))
            }} />
            
            {/* Theme Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-full transition-colors ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
              title={isDark ? t('themeLight') : t('themeDark')}
            >
              {isDark ? <Sun className='w-5 h-5' /> : <Moon className='w-5 h-5' />}
            </button>
            
            {/* Theme Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-full transition-colors ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
              title={isDark ? t('themeLight') : t('themeDark')}
            >
              {isDark ? <Sun className='w-5 h-5' /> : <Moon className='w-5 h-5' />}
            </button>
            
            {/* Notifications */}
            <div className='relative'>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 rounded-full transition-colors relative ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
              >
                <Bell className='w-5 h-5' />
                {unreadCount > 0 && (
                  <span className='absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center'>
                    {unreadCount}
                  </span>
                )}
              </button>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`absolute right-0 mt-2 w-80 rounded-xl ${isDark ? 'bg-gray-900 border border-white/10' : 'bg-white border border-gray-200'} shadow-xl overflow-hidden z-50`}
                  >
                    <div className={`p-4 border-b ${isDark ? 'border-white/10' : 'border-gray-200'} flex items-center justify-between`}>
                      <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('platformAlerts')}</span>
                    </div>
                    <div className='max-h-80 overflow-y-auto'>
                      {notifications.map(notification => (
                        <div 
                          key={notification.id}
                          onClick={() => markNotificationRead(notification.id)}
                          className={`p-4 border-b ${isDark ? 'border-white/5 hover:bg-white/5' : 'border-gray-100 hover:bg-gray-50'} cursor-pointer ${!notification.read ? (isDark ? 'bg-purple-500/5' : 'bg-purple-50/50') : ''}`}
                        >
                          <div className='flex items-start gap-3'>
                            {!notification.read && <div className='w-2 h-2 mt-2 rounded-full bg-purple-500' />}
                            <div className='flex-1'>
                              <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{notification.message}</p>
                              <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* User Menu */}
            <div className='relative'>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                <div className='w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center'>
                  <span className='text-white text-sm font-bold'>JG</span>
                </div>
                <span className={`hidden md:block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Juan Gonzalez</span>
                <ChevronDown className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
              
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`absolute right-0 mt-2 w-56 rounded-xl ${isDark ? 'bg-gray-900 border border-white/10' : 'bg-white border border-gray-200'} shadow-xl overflow-hidden z-50`}
                  >
                    <div className={`p-4 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Juan Gonzalez</p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>sahjonycapitalllc@outlook.com</p>
                    </div>
                    <div className='p-2'>
                      <button className={`w-full flex items-center gap-3 p-3 rounded-lg ${isDark ? 'hover:bg-white/5 text-gray-300' : 'hover:bg-gray-50 text-gray-700'} transition-colors`}>
                        <Settings className='w-4 h-4' />
                        <span className='text-sm'>{t('profileSettings')}</span>
                      </button>
                      <button 
                        onClick={handleLogout}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors`}
                      >
                        <LogOut className='w-4 h-4' />
                        <span className='text-sm'>{t('logOut')}</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className={`md:hidden p-2 rounded-full ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'}`}
            >
              {showMobileMenu ? <X className='w-5 h-5' /> : <Menu className='w-5 h-5' />}
            </button>
          </div>
        </div>
      </header>
      
      {/* Hermes Employee Panel */}
      <AnimatePresence>
        {showHermesPanel && (
          <motion.div
            initial={{ opacity: 0, x: -400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -400 }}
            className={`fixed top-0 left-0 h-full w-96 z-50 ${isDark ? 'bg-gray-900 border-r border-blue-500/20' : 'bg-white border-r border-blue-300'} shadow-2xl`}
          >
            <div className={`p-6 border-b ${isDark ? 'border-white/10' : 'border-gray-200'} bg-gradient-to-r from-blue-500/10 to-cyan-500/10`}>
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-3'>
                  <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center'>
                    <Bot className='w-6 h-6 text-white' />
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{HERMES_IDENTITY.name}</h3>
                    <p className={`text-xs ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>{HERMES_IDENTITY.role}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowHermesPanel(false)}
                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                >
                  <X className='w-5 h-5' />
                </button>
              </div>
              
              {/* Hermes Status */}
              <div className={`p-3 rounded-lg ${isDark ? 'bg-black/40' : 'bg-white/80'} mb-4`}>
                <div className='flex items-center justify-between mb-2'>
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Platform Operations</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'}`}>Active</span>
                </div>
                <div className='grid grid-cols-2 gap-2 text-xs'>
                  <div className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Frontend Tasks:</div>
                  <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{hermesEmployee.getStats().frontendTasksCompleted}</div>
                  <div className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Backend Tasks:</div>
                  <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{hermesEmployee.getStats().backendTasksCompleted}</div>
                </div>
              </div>
              
              {/* Hermes Command Input */}
              <div className='relative'>
                <input
                  type='text'
                  value={hermesCommand}
                  onChange={(e) => setHermesCommand(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && executeHermesCommand()}
                  placeholder='Enter task for Hermes...'
                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm ${isDark ? 'bg-black/40 border border-blue-500/20 text-white placeholder-gray-500' : 'bg-white border border-blue-300 text-gray-900 placeholder-gray-400'}`}
                />
                <Bot className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <button
                  onClick={executeHermesCommand}
                  disabled={hermesThinking || !hermesCommand.trim()}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg ${hermesThinking ? 'bg-blue-500/50' : 'bg-blue-500 hover:bg-blue-400'} text-white disabled:opacity-50`}
                >
                  {hermesThinking ? <RefreshCw className='w-4 h-4 animate-spin' /> : <ArrowRight className='w-4 h-4' />}
                </button>
              </div>
            </div>
            
            {/* Hermes Response Area */}
            <div className='p-4 overflow-y-auto h-80'>
              {hermesResponse && (
                <div className={`p-4 rounded-xl ${isDark ? 'bg-black/40 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'} mb-4`}>
                  <div className='flex items-center gap-2 mb-2'>
                    <Bot className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                    <span className={`text-xs font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Hermes Response</span>
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
                    <p className='mb-1'><strong>Task Type:</strong> {hermesResponse.type}</p>
                    {hermesResponse.fullText && (
                      <p className={`mt-2 p-2 rounded ${isDark ? 'bg-black/40' : 'bg-white/80'}`}>{hermesResponse.fullText}</p>
                    )}
                  </div>
                  {hermesResponse.frontend && hermesResponse.frontend.action && (
                    <div className={`mt-2 p-2 rounded ${isDark ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'}`}>
                      <p className={`text-xs font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>Frontend Operation</p>
                      <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{hermesResponse.frontend.action}</p>
                    </div>
                  )}
                  {hermesResponse.backend && hermesResponse.backend.action && (
                    <div className={`mt-2 p-2 rounded ${isDark ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-purple-50 border border-purple-200'}`}>
                      <p className={`text-xs font-medium ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>Backend Operation</p>
                      <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{hermesResponse.backend.action}</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Task History */}
              <div>
                <h4 className={`text-xs font-medium mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Recent Tasks</h4>
                {hermesTaskLog.length === 0 && (
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No tasks yet. Enter a command above.</p>
                )}
                {hermesTaskLog.map((log, i) => (
                  <div key={i} className={`p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'} mb-2`}>
                    <div className='flex items-center justify-between mb-1'>
                      <span className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{log.type}</span>
                      <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{formatTimeAgo(log.timestamp)}</span>
                    </div>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} truncate`}>{log.command}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Hermes Status Footer */}
            <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${isDark ? 'border-white/10 bg-black/40' : 'border-gray-200 bg-gray-50'}`}>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='w-2 h-2 rounded-full bg-blue-500 animate-pulse' />
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Running Platform Operations</span>
                </div>
                <span className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>v{HERMES_IDENTITY.version}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* CEO Brain Panel */}
      <AnimatePresence>
        {showCEOPanel && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className={`fixed top-0 right-0 h-full w-96 z-50 ${isDark ? 'bg-gray-900 border-l border-yellow-500/20' : 'bg-white border-l border-yellow-300'} shadow-2xl`}
          >
            <div className={`p-6 border-b ${isDark ? 'border-white/10' : 'border-gray-200'} bg-gradient-to-r from-yellow-500/10 to-amber-500/10`}>
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-3'>
                  <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center'>
                    <Crown className='w-6 h-6 text-white' />
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>BUFFY</h3>
                    <p className={`text-xs ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>CEO & AI Orchestrator</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowCEOPanel(false)}
                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                >
                  <X className='w-5 h-5' />
                </button>
              </div>
              
              {/* Owner Info */}
              <div className={`p-3 rounded-lg ${isDark ? 'bg-black/40' : 'bg-white/80'} mb-4`}>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Owner Commands</p>
                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{CEO_IDENTITY.owner.name}</p>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{CEO_IDENTITY.owner.email}</p>
              </div>
              
              {/* CEO Command Input */}
              <div className='relative'>
                <input
                  type='text'
                  value={ceoCommand}
                  onChange={(e) => setCeoCommand(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && executeCEOCommand()}
                  placeholder='Enter command for CEO...'
                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm ${isDark ? 'bg-black/40 border border-yellow-500/20 text-white placeholder-gray-500' : 'bg-white border border-yellow-300 text-gray-900 placeholder-gray-400'}`}
                />
                <Command className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-yellow-500' : 'text-yellow-600'}`} />
                <button
                  onClick={executeCEOCommand}
                  disabled={ceoThinking || !ceoCommand.trim()}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg ${ceoThinking ? 'bg-yellow-500/50' : 'bg-yellow-500 hover:bg-yellow-400'} text-white disabled:opacity-50`}
                >
                  {ceoThinking ? <RefreshCw className='w-4 h-4 animate-spin' /> : <ArrowRight className='w-4 h-4' />}
                </button>
              </div>
            </div>
            
            {/* CEO Response Area */}
            <div className='p-4 overflow-y-auto h-96'>
              {ceoResponse && (
                <div className={`p-4 rounded-xl ${isDark ? 'bg-black/40 border border-yellow-500/20' : 'bg-yellow-50 border border-yellow-200'} mb-4`}>
                  <div className='flex items-center gap-2 mb-2'>
                    <Brain className={`w-4 h-4 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                    <span className={`text-xs font-medium ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>CEO Response</span>
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <p className='mb-2'><strong>Decision:</strong> {ceoResponse.response?.decision?.type}</p>
                    <p className='mb-2'><strong>Confidence:</strong> {ceoResponse.response?.confidence}%</p>
                    <p className='mb-2'><strong>Execution:</strong> {ceoResponse.response?.execution?.status}</p>
                    {ceoResponse.response?.execution?.actions && (
                      <div className='mt-2'>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Actions taken:</p>
                        <ul className='text-xs mt-1 space-y-1'>
                          {ceoResponse.response.execution.actions.slice(0, 3).map((action: string, i: number) => (
                            <li key={i} className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              <CheckCircle className='w-3 h-3 text-green-500' /> {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Decision History */}
              <div>
                <h4 className={`text-xs font-medium mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Recent Decisions</h4>
                {ceoDecisionLog.length === 0 && (
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No decisions yet. Enter a command above.</p>
                )}
                {ceoDecisionLog.map((log, i) => (
                  <div key={i} className={`p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'} mb-2`}>
                    <div className='flex items-center justify-between'>
                      <span className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{log.response?.decision?.type}</span>
                      <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{log.response?.confidence}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* CEO Status Footer */}
            <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${isDark ? 'border-white/10 bg-black/40' : 'border-gray-200 bg-gray-50'}`}>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='w-2 h-2 rounded-full bg-green-500 animate-pulse' />
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Autonomous Mode: ON</span>
                </div>
                <span className={`text-xs ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>v{CEO_IDENTITY.version}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-20 left-0 right-0 z-40 p-4 ${isDark ? 'bg-black/95' : 'bg-white'} border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}
          >
            <div className='flex flex-col gap-2'>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setSelectedTab(tab.id); setShowMobileMenu(false) }}
                  className={`flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                    selectedTab === tab.id
                      ? isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'
                      : isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  <tab.icon className='w-5 h-5' />
                  {t(tabKeys[tab.id])}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Content */}
      <main className='pt-28 pb-16 px-4 md:px-6'>
        <div className='max-w-7xl mx-auto'>
          
          {/* Platform Status Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-8 p-6 rounded-2xl ${isDark ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20' : 'bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200'}`}
          >
            <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
              <div className='flex items-center gap-4'>
                <div className='relative'>
                  <div className='w-3 h-3 rounded-full bg-green-500' />
                  <div className='absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping' />
                </div>
                <div>
                  <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('platformOperatingNormally')}
                  </h2>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    847 {t('businessesActive')} • 2,341 {t('activeAIAgents')} • 99.98% {t('uptime')}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${isDark ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-100 border border-green-200'}`}>
                  <Server className='w-4 h-4 text-green-500' />
                  <span className={`text-sm font-medium ${isDark ? 'text-green-400' : 'text-green-700'}`}>{t('footerSystemsOperational')}</span>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                  <Globe className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('regions')}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tab Content */}
          <AnimatePresence mode='wait'>
            {selectedTab === 'overview' && (
              <motion.div
                key='overview'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Platform Metrics Grid */}
                <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8'>
                  {initialPlatformMetrics.map((metric, index) => (
                    <motion.div
                      key={metric.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-5 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}
                    >
                      <div className='flex items-center justify-between mb-3'>
                        <metric.icon className={`w-5 h-5 text-${metric.color}-500`} />
                        <span className={`flex items-center gap-1 text-xs font-medium ${
                          metric.trend === 'up' ? 'text-green-500' : metric.trend === 'down' ? 'text-green-500' : 'text-gray-500'
                        }`}>
                          {metric.trend === 'up' && <ArrowUp className='w-3 h-3' />}
                          {metric.change}
                        </span>
                      </div>
                      <div className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {metric.value}
                      </div>
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {metric.label}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Real-Time Agent Reasoning */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`mb-6 p-6 rounded-2xl ${isDark ? 'bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20' : 'bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200'}`}
                >
                  <div className='flex items-center justify-between mb-4'>
                    <div className='flex items-center gap-3'>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                        <Brain className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                      </div>
                      <div>
                        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('platformAIOrchestrator')}</h3>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('realTimeAutonomous')}</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${isDark ? 'bg-green-500/20' : 'bg-green-100'}`}>
                      <div className='w-2 h-2 rounded-full bg-green-500 animate-pulse' />
                      <span className={`text-xs font-medium text-green-500`}>{t('live')}</span>
                    </div>
                  </div>
                  
                  <div className='space-y-3'>
                    {agentThoughts.map((thought, index) => (
                      <motion.div
                        key={thought.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-xl ${isDark ? 'bg-black/40 border border-white/5' : 'bg-white/80 border border-gray-200'}`}
                      >
                        <div className='flex items-start gap-4'>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getAgentColor(thought.agent)}`}>
                            <Cpu className='w-4 h-4 text-white' />
                          </div>
                          <div className='flex-1'>
                            <div className='flex items-center gap-2 mb-1'>
                              <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{thought.agent}</span>
                              <span className={`px-2 py-0.5 rounded text-xs ${isDark ? 'bg-white/10 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>{thought.thought}</span>
                            </div>
                            <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{thought.reasoning}</p>
                            <div className='flex items-center gap-4'>
                              <div className='flex items-center gap-1'>
                                <Lightbulb className={`w-4 h-4 ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`} />
                                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Decision:</span>
                                <span className={`text-xs font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>{thought.decision}</span>
                              </div>
                              <div className='flex items-center gap-1'>
                                <Target className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Confidence:</span>
                                <div className='w-16 h-1.5 rounded-full bg-white/10 overflow-hidden'>
                                  <div 
                                    className='h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full'
                                    style={{ width: `${thought.confidence}%` }}
                                  />
                                </div>
                                <span className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{thought.confidence}%</span>
                              </div>
                              <span className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{formatTimeAgo(thought.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Content Grid */}
                <div className='grid md:grid-cols-2 gap-6'>
                  {/* Top Performing Agents */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}
                  >
                    <div className='flex items-center justify-between mb-6'>
                      <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('topPerformingAgents')}</h3>
                      <button 
                        onClick={() => setSelectedTab('agents')}
                        className='text-purple-500 text-sm font-medium hover:text-purple-400 flex items-center gap-1'
                      >
                        {t('viewAll')} <ChevronRight className='w-4 h-4' />
                      </button>
                    </div>
                    <div className='space-y-3'>
                      {topAgents.slice(0, 5).map((agent, i) => (
                        <div key={agent.agentId} className={`flex items-center justify-between p-4 rounded-xl ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'} transition-colors`}>
                          <div className='flex items-center gap-3'>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getAgentColor(agent.name)}`}>
                              <Bot className='w-5 h-5 text-white' />
                            </div>
                            <div>
                              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{agent.name}</div>
                              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{agent.business}</div>
                            </div>
                          </div>
                          <div className='text-right'>
                            <div className={`text-lg font-bold ${getConfidenceColor(agent.confidence)}`}>{agent.confidence}%</div>
                            <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{agent.callsToday.toLocaleString()} calls</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Recent Transactions */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}
                  >
                    <div className='flex items-center justify-between mb-6'>
                      <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('recentRevenue')}</h3>
                      <div className='flex items-center gap-1 text-green-500 text-sm font-medium'>
                        <TrendingUp className='w-4 h-4' />
                        +18.2% {t('thisMonth')}
                      </div>
                    </div>
                    <div className='space-y-3'>
                      {recentTransactions.map((tx) => (
                        <div key={tx.id} className={`flex items-center justify-between p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                          <div className='flex items-center gap-3'>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.status === 'completed' ? 'bg-green-500/10' : 'bg-yellow-500/10'}`}>
                              <CreditCard className={`w-5 h-5 ${tx.status === 'completed' ? 'text-green-500' : 'text-yellow-500'}`} />
                            </div>
                            <div>
                              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{tx.businessName}</div>
                              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{tx.plan} • {tx.date}</div>
                            </div>
                          </div>
                          <div className='text-right'>
                            <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{tx.amount}</div>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              tx.status === 'completed' ? 'bg-green-500/20 text-green-400' : 
                              tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {tx.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Collaborative Tasks */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className={`mt-6 p-6 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}
                >
                  <div className='flex items-center gap-3 mb-6'>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                      <Network className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('multiAgentOrchestration')}</h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('platformWideTasks')}</p>
                    </div>
                  </div>
                  <div className='grid md:grid-cols-3 gap-4'>
                    {collaborativeTasks.map((task) => (
                      <div key={task.id} className={`p-4 rounded-xl ${isDark ? 'bg-black/40 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                        <div className='flex items-center justify-between mb-3'>
                          <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{task.task}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            task.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            task.status === 'executing' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {task.status}
                          </span>
                        </div>
                        <div className='flex items-center gap-2 mb-3'>
                          <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Primary:</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'}`}>{task.primaryAgent}</span>
                        </div>
                        <div className='w-full h-2 rounded-full bg-white/10 overflow-hidden'>
                          <div 
                            className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(task.progress)}`}
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}

            {selectedTab === 'agents' && (
              <motion.div
                key='agents'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'} mb-6`}>
                  <div className='flex items-center justify-between mb-6'>
                    <div className='flex items-center gap-3'>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                        <Brain className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                      </div>
                      <div>
                        <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('allPlatformAgents')}</h3>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>2,341 {t('agentsAcrossBusinesses')}</p>
                      </div>
                    </div>
                    <div className='flex items-center gap-3'>
                      <button className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}>
                        <Download className='w-4 h-4' />
                        {t('export')}
                      </button>
                      <button className='flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-sm font-bold text-white hover:from-purple-500 hover:to-pink-500'>
                        <Plus className='w-4 h-4' />
                        {t('addAgentTemplate')}
                      </button>
                    </div>
                  </div>

                  {/* Agent Filters */}
                  <div className='flex items-center gap-4 mb-6'>
                    <div className='relative flex-1 max-w-md'>
                      <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <input
                        type='text'
                        placeholder={t('searchAgents')}
                        className={`w-full pl-10 pr-4 py-2 rounded-xl text-sm ${isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500' : 'bg-gray-100 border border-gray-200 text-gray-900 placeholder-gray-400'}`}
                      />
                    </div>
                    <select className={`px-4 py-2 rounded-xl text-sm ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-100 border border-gray-200 text-gray-900'}`}>
                      <option>{t('allBusinesses')}</option>
                      <option>Acme Corporation</option>
                      <option>TechStart Inc</option>
                      <option>Global Services</option>
                    </select>
                    <select className={`px-4 py-2 rounded-xl text-sm ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-100 border border-gray-200 text-gray-900'}`}>
                      <option>{t('allStatus')}</option>
                      <option>Active</option>
                      <option>Paused</option>
                      <option>Learning</option>
                    </select>
                  </div>

                  {/* Agent Performance Table */}
                  <div className='overflow-x-auto'>
                    <table className='w-full'>
                      <thead className={isDark ? 'bg-white/5' : 'bg-gray-50'}>
                        <tr>
                          <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('agent')}</th>
                          <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('business')}</th>
                          <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('status')}</th>
                          <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('confidence')}</th>
                          <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('callsTodayHeader')}</th>
                          <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('selfCorrection')}</th>
                          <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('avgResponse')}</th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-white/5'>
                        {topAgents.map((agent) => (
                          <tr key={agent.agentId} className={`${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'} transition-colors`}>
                            <td className={`px-4 py-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              <div className='flex items-center gap-3'>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getAgentColor(agent.name)}`}>
                                  <Bot className='w-4 h-4 text-white' />
                                </div>
                                <span className='font-medium'>{agent.name}</span>
                              </div>
                            </td>
                            <td className={`px-4 py-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{agent.business}</td>
                            <td className='px-4 py-4'>
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                agent.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                agent.status === 'learning' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {t(agent.status)}
                              </span>
                            </td>
                            <td className={`px-4 py-4 font-medium ${getConfidenceColor(agent.confidence)}`}>{agent.confidence}%</td>
                            <td className={`px-4 py-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{agent.callsToday.toLocaleString()}</td>
                            <td className={`px-4 py-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{agent.selfCorrectionRate}%</td>
                            <td className={`px-4 py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{agent.avgResponseTime}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {selectedTab === 'customers' && (
              <motion.div
                key='customers'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
                  <div className='flex items-center justify-between mb-6'>
                    <div className='flex items-center gap-3'>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                        <Users className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                      </div>
                      <div>
                        <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('customerAccounts')}</h3>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>847 {t('totalAccounts')} • 723 {t('accountsActive')}</p>
                      </div>
                    </div>
                    <button className='flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-sm font-bold text-white hover:from-blue-500 hover:to-cyan-500'>
                      <Plus className='w-4 h-4' />
                      {t('addCustomer')}
                    </button>
                  </div>

                  {/* Customer Table */}
                  <div className='overflow-x-auto'>
                    <table className='w-full'>
                      <thead className={isDark ? 'bg-white/5' : 'bg-gray-50'}>
                        <tr>
                          <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('business')}</th>
                          <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('owner')}</th>
                          <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('plan')}</th>
                          <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('status')}</th>
                          <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('agents')}</th>
                          <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('totalCalls')}</th>
                          <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('joined')}</th>
                          <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('actions')}</th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-white/5'>
                        {recentCustomers.map((customer) => (
                          <tr key={customer.id} className={`${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'} transition-colors`}>
                            <td className={`px-4 py-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              <div className='flex items-center gap-3'>
                                <div className='w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center'>
                                  <Building2 className='w-4 h-4 text-white' />
                                </div>
                                <span className='font-medium'>{customer.businessName}</span>
                              </div>
                            </td>
                            <td className={`px-4 py-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              <div>{customer.ownerName}</div>
                              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{customer.email}</div>
                            </td>
                            <td className='px-4 py-4'>
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPlanColor(customer.plan)}`}>
                                {t(customer.plan)}
                              </span>
                            </td>
                            <td className='px-4 py-4'>
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                                {t(customer.status)}
                              </span>
                            </td>
                            <td className={`px-4 py-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{customer.agentsActive}</td>
                            <td className={`px-4 py-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{customer.totalCalls.toLocaleString()}</td>
                            <td className={`px-4 py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{customer.joinedDate}</td>
                            <td className='px-4 py-4'>
                              <div className='flex items-center gap-2'>
                                <button className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                                  <Eye className='w-4 h-4' />
                                </button>
                                <button className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                                  <Settings className='w-4 h-4' />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {selectedTab === 'intelligence' && (
              <motion.div
                key='intelligence'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className='space-y-6'
              >
                {/* AI Intelligence Overview */}
                <div className={`p-6 rounded-2xl ${isDark ? 'bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20' : 'bg-gradient-to-br from-violet-50 to-fuchsia-50 border border-violet-200'}`}>
                  <div className='flex items-center gap-3 mb-6'>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-violet-500/20' : 'bg-violet-100'}`}>
                      <Brain className={`w-6 h-6 ${isDark ? 'text-violet-400' : 'text-violet-600'}`} />
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Platform AI Intelligence</h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Autonomous decision making and learning metrics</p>
                    </div>
                  </div>
                  
                  {/* Neural Network Visualization */}
                  <div className={`p-6 rounded-xl mb-6 ${isDark ? 'bg-black/40' : 'bg-white/80'}`}>
                    <h4 className={`text-sm font-medium mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Multi-Business Neural Network</h4>
                    <svg viewBox='0 0 800 200' className='w-full h-48'>
                      {/* Input Layer */}
                      <g transform='translate(50, 100)'>
                        {['Demand', 'Revenue', 'Quality', 'Retention'].map((label, i) => (
                          <g key={label} transform={`translate(0, ${(i - 1.5) * 35})`}>
                            <circle r='15' className={isDark ? 'fill-green-500/80' : 'fill-green-400'} />
                            <text y='25' textAnchor='middle' className={`text-xs fill-white`}>{label.substring(0, 3)}</text>
                          </g>
                        ))}
                      </g>
                      
                      {/* Hidden Layer */}
                      <g transform='translate(300, 100)'>
                        {[0, 1, 2, 3, 4].map((i) => (
                          <g key={i} transform={`translate(0, ${(i - 2) * 45})`}>
                            <circle r='20' className={isDark ? 'fill-blue-500/80' : 'fill-blue-400'} />
                            {i === 2 && <circle r='25' className={isDark ? 'fill-blue-400/30' : 'fill-blue-300/30'} />}
                          </g>
                        ))}
                      </g>
                      
                      {/* Output Layer - Platform Agents */}
                      <g transform='translate(600, 100)'>
                        {[
                          { label: 'Orchest.', color: 'fill-green-500' },
                          { label: 'Revenue', color: 'fill-blue-500' },
                          { label: 'Guardian', color: 'fill-purple-500' },
                          { label: 'Intel', color: 'fill-orange-500' },
                          { label: 'Analytics', color: 'fill-yellow-500' }
                        ].map((item, i) => (
                          <g key={item.label} transform={`translate(0, ${(i - 2) * 45})`}>
                            <circle r='22' className={isDark ? item.color : item.color.replace('500', '400')} opacity='0.8' />
                            <circle r='26' className={item.color} opacity='0.2' />
                            <text y='4' textAnchor='middle' className={`text-xs fill-white font-bold`}>{item.label}</text>
                          </g>
                        ))}
                      </g>
                      
                      {/* Connections */}
                      <path d='M 100 30 Q 200 100 280 100' className={`stroke-green-500/30 fill-none stroke-1`} />
                      <path d='M 100 65 Q 200 120 280 110' className={`stroke-green-500/30 fill-none stroke-1`} />
                      <path d='M 100 100 Q 200 100 280 100' className={`stroke-green-500/50 fill-none stroke-2`} />
                      <path d='M 100 135 Q 200 80 280 90' className={`stroke-green-500/30 fill-none stroke-1`} />
                      <path d='M 100 170 Q 200 60 280 80' className={`stroke-green-500/30 fill-none stroke-1`} />
                      
                      <path d='M 340 55 Q 470 100 580 100' className={`stroke-blue-500/40 fill-none stroke-2`} />
                      <path d='M 340 100 Q 470 100 580 100' className={`stroke-blue-500/50 fill-none stroke-2`} />
                      <path d='M 340 145 Q 470 100 580 100' className={`stroke-blue-500/40 fill-none stroke-2`} />
                    </svg>
                  </div>
                  
                  {/* Intelligence Metrics */}
                  <div className='grid grid-cols-4 gap-4'>
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-black/40' : 'bg-white/80'}`}>
                      <div className='flex items-center gap-2 mb-2'>
                        <ZapIcon className='w-5 h-5 text-yellow-500' />
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Decisions/sec</span>
                      </div>
                      <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>2,847</div>
                      <div className='text-xs text-green-500 mt-1'>+23% from avg</div>
                    </div>
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-black/40' : 'bg-white/80'}`}>
                      <div className='flex items-center gap-2 mb-2'>
                        <Target className='w-5 h-5 text-green-500' />
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Accuracy</span>
                      </div>
                      <div className={`text-2xl font-bold text-green-500`}>96.2%</div>
                      <div className='text-xs text-green-500 mt-1'>+1.8% improvement</div>
                    </div>
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-black/40' : 'bg-white/80'}`}>
                      <div className='flex items-center gap-2 mb-2'>
                        <RefreshCw className='w-5 h-5 text-blue-500' />
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Self-Corrections</span>
                      </div>
                      <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>1,234</div>
                      <div className='text-xs text-blue-500 mt-1'>Today</div>
                    </div>
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-black/40' : 'bg-white/80'}`}>
                      <div className='flex items-center gap-2 mb-2'>
                        <Lightbulb className='w-5 h-5 text-purple-500' />
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Learning Rate</span>
                      </div>
                      <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>78%</div>
                      <div className='text-xs text-purple-500 mt-1'>+4% this week</div>
                    </div>
                  </div>
                </div>

                {/* Revenue & Usage Stats */}
                <div className='grid md:grid-cols-3 gap-6'>
                  <div className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
                    <h4 className={`text-sm font-medium mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Monthly Recurring Revenue</h4>
                    <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>$127,450</div>
                    <div className='flex items-center gap-2 mt-2 text-green-500 text-sm'>
                      <TrendingUp className='w-4 h-4' />
                      +18.2% from last month
                    </div>
                  </div>
                  <div className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
                    <h4 className={`text-sm font-medium mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Active Subscriptions</h4>
                    <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>723</div>
                    <div className='flex items-center gap-2 mt-2 text-green-500 text-sm'>
                      <TrendingUp className='w-4 h-4' />
                      +12 new this week
                    </div>
                  </div>
                  <div className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
                    <h4 className={`text-sm font-medium mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Churn Rate</h4>
                    <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>2.1%</div>
                    <div className='flex items-center gap-2 mt-2 text-green-500 text-sm'>
                      <TrendingDown className='w-4 h-4' />
                      -0.8% improvement
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {selectedTab === 'settings' && (
              <motion.div
                key='settings'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}
              >
                <div className='flex items-center gap-3 mb-6'>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-gray-500/20' : 'bg-gray-100'}`}>
                    <Settings className={`w-6 h-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Platform Settings</h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Configure platform-wide settings and integrations</p>
                  </div>
                </div>

                <div className='grid md:grid-cols-2 gap-6'>
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-black/40' : 'bg-gray-50'}`}>
                    <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>API Configuration</h4>
                    <div className='space-y-2'>
                      <div className='flex items-center justify-between'>
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Supabase</span>
                        <span className='flex items-center gap-1 text-xs text-green-500'><ShieldCheck className='w-3 h-3' /> Connected</span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Stripe</span>
                        <span className='flex items-center gap-1 text-xs text-green-500'><ShieldCheck className='w-3 h-3' /> Connected</span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Square</span>
                        <span className='flex items-center gap-1 text-xs text-green-500'><ShieldCheck className='w-3 h-3' /> Connected</span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Voice AI</span>
                        <span className='flex items-center gap-1 text-xs text-green-500'><ShieldCheck className='w-3 h-3' /> Connected</span>
                      </div>
                    </div>
                  </div>
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-black/40' : 'bg-gray-50'}`}>
                    <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Infrastructure</h4>
                    <div className='space-y-2'>
                      <div className='flex items-center justify-between'>
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Region</span>
                        <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>US-East, EU-West, AP-South</span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Uptime</span>
                        <span className={`text-sm text-green-500`}>99.98%</span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>API Latency</span>
                        <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>45ms avg</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className={`py-8 px-6 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
        <div className='max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4'>
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            © 2026 FrontDesk Agents. Platform Owner Dashboard.
          </div>
          <div className='flex items-center gap-6'>
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>System Status</span>
            <div className='flex items-center gap-2'>
              <div className='w-2 h-2 rounded-full bg-green-500' />
              <span className={`text-sm text-green-500`}>All Systems Operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}