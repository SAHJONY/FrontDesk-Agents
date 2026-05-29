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
  Lightbulb, Target, Zap as ZapIcon, RefreshCw, Check, Loader2
} from 'lucide-react'
import BlandConfigForm from '@/components/BlandConfigForm'
import LanguageSelector from '../../components/LanguageSelector'

import { rtlLanguages } from '../../lib/rtl'

// Translations for all supported languages
const getTranslation = (key: string, lang: string = 'en'): string => {
  return translations[lang]?.[key] || translations['en'][key] || key
}

const translations: Record<string, Record<string, string>> = {
  en: {
    // Navigation
    navOverview: 'Overview', navCalls: 'Call Logs', navAgents: 'AI Agents', navIntelligence: 'Intelligence', navSettings: 'Voice Config',
    // Header
    headerTitle: 'FRONTDESK', headerSubtitle: 'AGENTS', themeLight: 'Switch to light mode', themeDark: 'Switch to dark mode',
    // Notifications
    notificationsTitle: 'Notifications', markAllRead: 'Mark all read',
    // User menu
    profileSettings: 'Profile Settings', accountSettings: 'Account Settings', logOut: 'Log Out',
    // Agent status
    aiAgentOrchestra: 'AI Agent Orchestra', agentsPaused: 'Agents paused', activeCollaborating: '5 agents actively collaborating', callsHandledToday: 'calls handled today',
    singleMode: 'Single', orchestrationMode: 'Orchestration', intelligenceMode: 'Intelligence',
    pauseOrchestra: 'Pause Orchestra', startOrchestra: 'Start Orchestra', testCall: 'Test Call',
    autonomousModeActive: 'Autonomous Mode Active',
    // Stats
    totalCallsToday: 'Total Calls Today', avgResponseTime: 'Avg Response Time', resolutionRate: 'Resolution Rate', activeAgents: 'Active Agents',
    // Agent reasoning
    agentReasoningChain: 'Agent Reasoning Chain', liveAutonomous: 'Live autonomous decision making', live: 'Live',
    analyzingIntent: 'Analyzing caller intent', checkingCalendar: 'Checking calendar availability', retrievingPolicy: 'Retrieving policy information', escalationCriteria: 'Escalation criteria met',
    decision: 'Decision', confidence: 'Confidence',
    // Recent calls
    recentCalls: 'Recent Calls', viewAll: 'View All',
    // Top intents
    topCallIntents: 'Top Call Intents', quickActions: 'Quick Actions', viewAllCalls: 'View All Calls', addLanguage: 'Add Language', securitySettings: 'Security Settings',
    // AI capabilities
    aiAgentCapabilities: 'AI Agent Capabilities', voiceAI: 'Voice AI', smsChat: 'SMS / Chat', visionAnalysis: 'Vision Analysis', availability247: '24/7 Availability', statusActive: 'Active',
    // Call logs
    callLogs: 'Call Logs', searchCalls: 'Search calls...', allStatus: 'All Status', completed: 'Completed', transferred: 'Transferred', voicemail: 'Voicemail', missed: 'Missed', export: 'Export',
    caller: 'Caller', intent: 'Intent', status: 'Status', duration: 'Duration', time: 'Time', actions: 'Actions',
    viewDetails: 'View Details', playRecording: 'Play Recording', delete: 'Delete',
    showingOfCalls: 'Showing {count} of {total} calls', previous: 'Previous', next: 'Next',
    // Agent collaboration
    agentCollaborationMatrix: 'Agent Collaboration Matrix', multiAgentOrchestration: 'Multi-agent orchestration and task delegation',
    primary: 'Primary', collaborators: 'Collaborators', realTimeAgentComm: 'Real-time Agent Communication',
    // Individual agents
    callsToday: 'calls today', selfCorrect: 'Self-Correct', learningProgress: 'Learning Progress',
    // AI Intelligence
    aiIntelligenceDashboard: 'AI Intelligence Dashboard', autonomousDecision: 'Autonomous decision making and learning metrics',
    multiAgentNeural: 'Multi-Agent Neural Network', decisionsPerSec: 'Decisions/sec', accuracy: 'Accuracy', selfCorrections: 'Self-Corrections', learningRate: 'Learning Rate',
    fromAvg: 'from avg', improvement: 'improvement', today: 'Today', thisWeek: 'this week',
    callsByHour: 'Calls by Hour', callsThisWeek: 'Calls This Week',
    agentPerformanceComparison: 'Agent Performance Comparison',
    avgCallDuration: 'Average Call Duration', transferRate: 'Transfer Rate', customerSatisfaction: 'Customer Satisfaction',
    fromLastWeek: 'from last week',
    // Welcome modal
    welcomeTitle: 'Welcome to FrontDesk Agents!', welcomeSubtitle: 'Your AI receptionist is ready. Select a plan to activate your service.',
    mostPopular: 'MOST POPULAR', perMonth: '/mo', startFreeTrial: 'Start Free Trial', processing: 'Processing...',
    trialNote: '14-day free trial on all plans. No credit card required to start.', skipForNow: 'Skip for now - explore dashboard first',
    starter: 'Starter', professional: 'Professional', enterprise: 'Enterprise',
    hundredCalls: '100 calls/mo', emailSupport: 'Email support', basicAnalytics: 'Basic analytics',
    thousandCalls: '1,000 calls/mo', prioritySupport: 'Priority support', smsIntegration: 'SMS integration',
    unlimitedCalls: 'Unlimited calls', support247: '24/7 support', customIntegrations: 'Custom integrations',
    // Call details modal
    callDetails: 'Call Details', close: 'Close',
    viewTranscript: 'View Transcript',
    // Footer
    footerText: "© 2026 FrontDesk Agents. World's Most Advanced AI Receptionist Platform.",
    privacyPolicy: 'Privacy Policy', termsOfService: 'Terms of Service', contactSupport: 'Contact Support',
    // Logout confirmation
    logoutConfirm: 'Are you sure you want to log out?',
    // Misc
    darkMode: 'Dark Mode', lightMode: 'Light Mode'
  },
  es: {
    navOverview: 'Resumen', navCalls: 'Registro de Llamadas', navAgents: 'Agentes IA', navIntelligence: 'Inteligencia', navSettings: 'Config. de Voz',
    headerTitle: 'FRONTDESK', headerSubtitle: 'AGENTES', themeLight: 'Cambiar a modo claro', themeDark: 'Cambiar a modo oscuro',
    notificationsTitle: 'Notificaciones', markAllRead: 'Marcar todo leído',
    profileSettings: 'Configuración de Perfil', accountSettings: 'Configuración de Cuenta', logOut: 'Cerrar Sesión',
    aiAgentOrchestra: 'Orquesta de Agentes IA', agentsPaused: 'Agentes pausados', activeCollaborating: '5 agentes collaborating activamente', callsHandledToday: 'llamadas manejadas hoy',
    singleMode: 'Individual', orchestrationMode: 'Orquestación', intelligenceMode: 'Inteligencia',
    pauseOrchestra: 'Pausar Orquesta', startOrchestra: 'Iniciar Orquesta', testCall: 'Llamada de Prueba',
    autonomousModeActive: 'Modo Autónomo Activo',
    totalCallsToday: 'Llamadas Totales Hoy', avgResponseTime: 'Tiempo de Respuesta Prom.', resolutionRate: 'Tasa de Resolución', activeAgents: 'Agentes Activos',
    agentReasoningChain: 'Cadena de Razonamiento del Agente', liveAutonomous: 'Decisiones autónomas en vivo', live: 'En Vivo',
    analyzingIntent: 'Analizando intención del llamante', checkingCalendar: 'Verificando disponibilidad del calendario', retrievingPolicy: 'Recuperando información de política', escalationCriteria: 'Criterios de escalación cumplidos',
    decision: 'Decisión', confidence: 'Confianza',
    recentCalls: 'Llamadas Recientes', viewAll: 'Ver Todo',
    topCallIntents: 'Principales Intenciones de Llamada', quickActions: 'Acciones Rápidas', viewAllCalls: 'Ver Todas las Llamadas', addLanguage: 'Agregar Idioma', securitySettings: 'Configuración de Seguridad',
    aiAgentCapabilities: 'Capacidades del Agente IA', voiceAI: 'IA de Voz', smsChat: 'SMS / Chat', visionAnalysis: 'Análisis de Visión', availability247: 'Disponibilidad 24/7', statusActive: 'Activo',
    callLogs: 'Registro de Llamadas', searchCalls: 'Buscar llamadas...', allStatus: 'Todos los Estados', completed: 'Completadas', transferred: 'Transferidas', voicemail: 'Buzón de Voz', missed: 'Perdidas', export: 'Exportar',
    caller: 'Llamante', intent: 'Intención', status: 'Estado', duration: 'Duración', time: 'Hora', actions: 'Acciones',
    viewDetails: 'Ver Detalles', playRecording: 'Reproducir Grabación', delete: 'Eliminar',
    showingOfCalls: 'Mostrando {count} de {total} llamadas', previous: 'Anterior', next: 'Siguiente',
    agentCollaborationMatrix: 'Matriz de Colaboración de Agentes', multiAgentOrchestration: 'Orquestación multi-agente y delegación de tareas',
    primary: 'Primario', collaborators: 'Colaboradores', realTimeAgentComm: 'Comunicación de Agentes en Tiempo Real',
    callsToday: 'llamadas hoy', selfCorrect: 'Auto-Corrección', learningProgress: 'Progreso de Aprendizaje',
    aiIntelligenceDashboard: 'Panel de Inteligencia IA', autonomousDecision: 'Decisiones autónomas y métricas de aprendizaje',
    multiAgentNeural: 'Red Neural Multi-Agente', decisionsPerSec: 'Decisiones/seg', accuracy: 'Precisión', selfCorrections: 'Auto-Correcciones', learningRate: 'Tasa de Aprendizaje',
    fromAvg: 'del promedio', improvement: 'mejora', today: 'Hoy', thisWeek: 'esta semana',
    callsByHour: 'Llamadas por Hora', callsThisWeek: 'Llamadas Esta Semana',
    agentPerformanceComparison: 'Comparación de Rendimiento de Agentes',
    avgCallDuration: 'Duración Promedio de Llamada', transferRate: 'Tasa de Transferencia', customerSatisfaction: 'Satisfacción del Cliente',
    fromLastWeek: 'de la semana pasada',
    welcomeTitle: '¡Bienvenido a FrontDesk Agents!', welcomeSubtitle: 'Tu receptionist IA está listo. Selecciona un plan para activar tu servicio.',
    mostPopular: 'MÁS POPULAR', perMonth: '/mes', startFreeTrial: 'Iniciar Prueba Gratuita', processing: 'Procesando...',
    trialNote: 'Prueba gratuita de 14 días en todos los planes. No se requiere tarjeta de crédito.', skipForNow: 'Omitir por ahora - explorar panel primero',
    starter: 'Inicial', professional: 'Profesional', enterprise: 'Empresarial',
    hundredCalls: '100 llamadas/mes', emailSupport: 'Soporte por email', basicAnalytics: 'Análisis básico',
    thousandCalls: '1,000 llamadas/mes', prioritySupport: 'Soporte prioritario', smsIntegration: 'Integración SMS',
    unlimitedCalls: 'Llamadas ilimitadas', support247: 'Soporte 24/7', customIntegrations: 'Integraciones personalizadas',
    callDetails: 'Detalles de Llamada', close: 'Cerrar',
    viewTranscript: 'Ver Transcripción',
    footerText: '© 2026 FrontDesk Agents. La Plataforma de Recepcionista IA Más Avanzada del Mundo.',
    privacyPolicy: 'Política de Privacidad', termsOfService: 'Términos de Servicio', contactSupport: 'Contactar Soporte',
    logoutConfirm: '¿Estás seguro de que quieres cerrar sesión?',
    darkMode: 'Modo Oscuro', lightMode: 'Modo Claro'
  },
  fr: {
    navOverview: 'Aperçu', navCalls: 'Journal des Appels', navAgents: 'Agents IA', navIntelligence: 'Intelligence', navSettings: 'Config. Vocale',
    headerTitle: 'FRONTDESK', headerSubtitle: 'AGENTS', themeLight: 'Passer en mode clair', themeDark: 'Passer en mode sombre',
    notificationsTitle: 'Notifications', markAllRead: 'Tout marquer comme lu',
    profileSettings: 'Paramètres du Profil', accountSettings: 'Paramètres du Compte', logOut: 'Déconnexion',
    aiAgentOrchestra: 'Orchestre d\'Agents IA', agentsPaused: 'Agents en pause', activeCollaborating: '5 agents collaborating activement', callsHandledToday: 'appels traités aujourd\'hui',
    singleMode: 'Simple', orchestrationMode: 'Orchestration', intelligenceMode: 'Intelligence',
    pauseOrchestra: 'Pause Orchestre', startOrchestra: 'Démarrer Orchestre', testCall: 'Appel Test',
    autonomousModeActive: 'Mode Autonome Actif',
    totalCallsToday: 'Total Appels Aujourd\'hui', avgResponseTime: 'Temps de Réponse Moy.', resolutionRate: 'Taux de Résolution', activeAgents: 'Agents Actifs',
    agentReasoningChain: 'Chaîne de Raisonnement de l\'Agent', liveAutonomous: 'Décisions autonomes en direct', live: 'En Direct',
    analyzingIntent: 'Analyse de l\'intention de l\'appelant', checkingCalendar: 'Vérification de la disponibilité du calendrier', retrievingPolicy: 'Récupération des informations de politique', escalationCriteria: 'Critères d\'escalade remplis',
    decision: 'Décision', confidence: 'Confiance',
    recentCalls: 'Appels Récents', viewAll: 'Voir Tout',
    topCallIntents: 'Principales Intentions d\'Appel', quickActions: 'Actions Rapides', viewAllCalls: 'Voir Tous les Appels', addLanguage: 'Ajouter Langue', securitySettings: 'Paramètres de Sécurité',
    aiAgentCapabilities: 'Capacités de l\'Agent IA', voiceAI: 'IA Vocale', smsChat: 'SMS / Chat', visionAnalysis: 'Analyse de Vision', availability247: 'Disponibilité 24/7', statusActive: 'Actif',
    callLogs: 'Journal des Appels', searchCalls: 'Rechercher appels...', allStatus: 'Tous les Statuts', completed: 'Complétés', transferred: 'Transférés', voicemail: 'Messagerie', missed: 'Manqués', export: 'Exporter',
    caller: 'Appelant', intent: 'Intention', status: 'Statut', duration: 'Durée', time: 'Heure', actions: 'Actions',
    viewDetails: 'Voir Détails', playRecording: 'Lire Enregistrement', delete: 'Supprimer',
    showingOfCalls: 'Affichage {count} sur {total} appels', previous: 'Précédent', next: 'Suivant',
    agentCollaborationMatrix: 'Matrice de Collaboration des Agents', multiAgentOrchestration: 'Orchestration multi-agents et délégation de tâches',
    primary: 'Primaire', collaborators: 'Collaborateurs', realTimeAgentComm: 'Communication des Agents en Temps Réel',
    callsToday: 'appels aujourd\'hui', selfCorrect: 'Auto-Correction', learningProgress: 'Progrès d\'Apprentissage',
    aiIntelligenceDashboard: 'Tableau de Bord Intelligence IA', autonomousDecision: 'Décisions autonomes et métriques d\'apprentissage',
    multiAgentNeural: 'Réseau Neural Multi-Agents', decisionsPerSec: 'Décisions/sec', accuracy: 'Précision', selfCorrections: 'Auto-Corrections', learningRate: 'Taux d\'Apprentissage',
    fromAvg: 'de la moyenne', improvement: 'amélioration', today: 'Aujourd\'hui', thisWeek: 'cette semaine',
    callsByHour: 'Appels par Heure', callsThisWeek: 'Appels Cette Semaine',
    agentPerformanceComparison: 'Comparaison de Performance des Agents',
    avgCallDuration: 'Durée Moyenne d\'Appel', transferRate: 'Taux de Transfert', customerSatisfaction: 'Satisfaction Client',
    fromLastWeek: 'de la semaine dernière',
    welcomeTitle: 'Bienvenue chez FrontDesk Agents!', welcomeSubtitle: 'Votre réceptionniste IA est prêt. Sélectionnez un plan pour activer votre service.',
    mostPopular: 'PLUS POPULAIRE', perMonth: '/mois', startFreeTrial: 'Commencer Essai Gratuit', processing: 'Traitement...',
    trialNote: 'Essai gratuit de 14 jours sur tous les plans. Aucune carte de crédit requise.', skipForNow: 'Passer pour l\'instant - explorer le tableau de bord',
    starter: 'Starter', professional: 'Professionnel', enterprise: 'Entreprise',
    hundredCalls: '100 appels/mois', emailSupport: 'Support email', basicAnalytics: 'Analytique basique',
    thousandCalls: '1,000 appels/mois', prioritySupport: 'Support prioritaire', smsIntegration: 'Intégration SMS',
    unlimitedCalls: 'Appels illimités', support247: 'Support 24/7', customIntegrations: 'Intégrations personnalisées',
    callDetails: 'Détails de l\'Appel', close: 'Fermer',
    viewTranscript: 'Voir Transcription',
    footerText: '© 2026 FrontDesk Agents. La Plateforme de Réceptionniste IA la Plus Avancée au Monde.',
    privacyPolicy: 'Politique de Confidentialité', termsOfService: 'Conditions d\'Utilisation', contactSupport: 'Contacter Support',
    logoutConfirm: 'Êtes-vous sûr de vouloir vous déconnecter?',
    darkMode: 'Mode Sombre', lightMode: 'Mode Clair'
  },
  zh: {
    navOverview: '概览', navCalls: '通话记录', navAgents: 'AI代理', navIntelligence: '智能', navSettings: '语音配置',
    headerTitle: 'FRONTDESK', headerSubtitle: '代理', themeLight: '切换到浅色模式', themeDark: '切换到深色模式',
    notificationsTitle: '通知', markAllRead: '全部标记已读',
    profileSettings: '个人设置', accountSettings: '账户设置', logOut: '退出登录',
    aiAgentOrchestra: 'AI代理乐团', agentsPaused: '代理已暂停', activeCollaborating: '5个代理主动协作', callsHandledToday: '今日处理的通话',
    singleMode: '单一', orchestrationMode: '编排', intelligenceMode: '智能',
    pauseOrchestra: '暂停乐团', startOrchestra: '启动乐团', testCall: '测试通话',
    autonomousModeActive: '自动模式已激活',
    totalCallsToday: '今日总通话', avgResponseTime: '平均响应时间', resolutionRate: '解决率', activeAgents: '活跃代理',
    agentReasoningChain: '代理推理链', liveAutonomous: '实时自主决策', live: '直播',
    analyzingIntent: '分析呼叫者意图', checkingCalendar: '检查日历可用性', retrievingPolicy: '检索策略信息', escalationCriteria: '升级条件已满足',
    decision: '决策', confidence: '置信度',
    recentCalls: '最近通话', viewAll: '查看全部',
    topCallIntents: '主要通话意图', quickActions: '快速操作', viewAllCalls: '查看所有通话', addLanguage: '添加语言', securitySettings: '安全设置',
    aiAgentCapabilities: 'AI代理能力', voiceAI: '语音AI', smsChat: '短信/聊天', visionAnalysis: '视觉分析', availability247: '24/7可用性', statusActive: '活跃',
    callLogs: '通话记录', searchCalls: '搜索通话...', allStatus: '所有状态', completed: '已完成', transferred: '已转接', voicemail: '语音邮件', missed: '未接', export: '导出',
    caller: '呼叫者', intent: '意图', status: '状态', duration: '时长', time: '时间', actions: '操作',
    viewDetails: '查看详情', playRecording: '播放录音', delete: '删除',
    showingOfCalls: '显示 {count} / {total} 条通话', previous: '上一页', next: '下一页',
    agentCollaborationMatrix: '代理协作矩阵', multiAgentOrchestration: '多代理编排和任务委托',
    primary: '主要', collaborators: '协作代理', realTimeAgentComm: '实时代理通信',
    callsToday: '今日通话', selfCorrect: '自我修正', learningProgress: '学习进度',
    aiIntelligenceDashboard: 'AI智能仪表板', autonomousDecision: '自主决策和学习指标',
    multiAgentNeural: '多代理神经网络', decisionsPerSec: '决策/秒', accuracy: '准确率', selfCorrections: '自我修正', learningRate: '学习率',
    fromAvg: '平均值', improvement: '改进', today: '今日', thisWeek: '本周',
    callsByHour: '每小时通话', callsThisWeek: '本周通话',
    agentPerformanceComparison: '代理性能对比',
    avgCallDuration: '平均通话时长', transferRate: '转接率', customerSatisfaction: '客户满意度',
    fromLastWeek: '上周',
    welcomeTitle: '欢迎使用 FrontDesk Agents!', welcomeSubtitle: '您的AI接待员已就绪。选择计划以激活服务。',
    mostPopular: '最受欢迎', perMonth: '/月', startFreeTrial: '开始免费试用', processing: '处理中...',
    trialNote: '所有计划均提供14天免费试用。无需信用卡。', skipForNow: '暂时跳过 - 先探索仪表板',
    starter: '入门版', professional: '专业版', enterprise: '企业版',
    hundredCalls: '100通话/月', emailSupport: '邮件支持', basicAnalytics: '基本分析',
    thousandCalls: '1,000通话/月', prioritySupport: '优先支持', smsIntegration: '短信集成',
    unlimitedCalls: '无限通话', support247: '24/7支持', customIntegrations: '自定义集成',
    callDetails: '通话详情', close: '关闭',
    viewTranscript: '查看 transcript',
    footerText: '© 2026 FrontDesk Agents. 全球最先进的AI接待员平台。',
    privacyPolicy: '隐私政策', termsOfService: '服务条款', contactSupport: '联系支持',
    logoutConfirm: '您确定要退出登录吗?',
    darkMode: '深色模式', lightMode: '浅色模式'
  },
  hi: {
    navOverview: 'अवलोकन', navCalls: 'कॉल लॉग', navAgents: 'AI एजेंट', navIntelligence: 'बुद्धिमत्ता', navSettings: 'वॉइस कॉन्फ़िग',
    headerTitle: 'FRONTDESK', headerSubtitle: 'एजेंट', themeLight: 'हल्के मोड पर स्विच करें', themeDark: 'डार्क मोड पर स्विच करें',
    notificationsTitle: 'सूचनाएं', markAllRead: 'सभी पढ़े चिह्नित करें',
    profileSettings: 'प्रोफ़ाइल सेटिंग्स', accountSettings: 'खाता सेटिंग्स', logOut: 'लॉग आउट',
    aiAgentOrchestra: 'AI एजेंट ऑर्केस्ट्रा', agentsPaused: 'एजेंट रुके हुए', activeCollaborating: '5 एजेंट सक्रिय रूप से सहयोग कर रहे', callsHandledToday: 'आज संभाली गई कॉलें',
    singleMode: 'सिंगल', orchestrationMode: 'ऑर्केस्ट्रेशन', intelligenceMode: 'बुद्धिमत्ता',
    pauseOrchestra: 'ऑर्केस्ट्रा रोकें', startOrchestra: 'ऑर्केस्ट्रा शुरू करें', testCall: 'टेस्ट कॉल',
    autonomousModeActive: 'स्वायत्त मोड सक्रिय',
    totalCallsToday: 'आज कुल कॉलें', avgResponseTime: 'औसत प्रतिक्रिया समय', resolutionRate: 'समाधान दर', activeAgents: 'सक्रिय एजेंट',
    agentReasoningChain: 'एजेंट रीज़निंग चेन', liveAutonomous: 'लाइव स्वायत्त निर्णय लेना', live: 'लाइव',
    analyzingIntent: 'कॉलर इरादे का विश्लेषण', checkingCalendar: 'कैलेंडर उपलब्धता जांच रहे', retrievingPolicy: 'नीति जानकारी पुनः प्राप्त', escalationCriteria: 'एस्केलेशन मानदंड पूरे',
    decision: 'निर्णय', confidence: 'आत्मविश्वास',
    recentCalls: 'हालिया कॉलें', viewAll: 'सभी देखें',
    topCallIntents: 'शीर्ष कॉल इरादे', quickActions: 'त्वरित कार्य', viewAllCalls: 'सभी कॉलें देखें', addLanguage: 'भाषा जोड़ें', securitySettings: 'सुरक्षा सेटिंग्स',
    aiAgentCapabilities: 'AI एजेंट क्षमताएं', voiceAI: 'वॉइस AI', smsChat: 'SMS / चैट', visionAnalysis: 'विज़न विश्लेषण', availability247: '24/7 उपलब्धता', statusActive: 'सक्रिय',
    callLogs: 'कॉल लॉग', searchCalls: 'कॉल खोजें...', allStatus: 'सभी स्थिति', completed: 'पूर्ण', transferred: 'स्थानांतरित', voicemail: 'वॉइसमेल', missed: 'चूका', export: 'निर्यात',
    caller: 'कॉलर', intent: 'इरादा', status: 'स्थिति', duration: 'अवधि', time: 'समय', actions: 'कार्य',
    viewDetails: 'विवरण देखें', playRecording: 'रिकॉर्डिंग चलाएं', delete: 'हटाएं',
    showingOfCalls: '{total} में से {count} कॉलें दिखा रहे', previous: 'पिछला', next: 'अगला',
    agentCollaborationMatrix: 'एजेंट सहयोग मैट्रिक्स', multiAgentOrchestration: 'मल्टी-एजेंट ऑर्केस्ट्रेशन और कार्य प्रत्यायोजन',
    primary: 'प्राथमिक', collaborators: 'सहयोगी', realTimeAgentComm: 'रीयल-टाइम एजेंट संचार',
    callsToday: 'आज कॉलें', selfCorrect: 'सेल्फ-करेक्ट', learningProgress: 'सीखने की प्रगति',
    aiIntelligenceDashboard: 'AI इंटेलिजेंस डैशबोर्ड', autonomousDecision: 'स्वायत्त निर्णय लेना और सीखने के मेट्रिक्स',
    multiAgentNeural: 'मल्टी-एजेंट न्यूरल नेटवर्क', decisionsPerSec: 'निर्णय/सेकंड', accuracy: 'सटीकता', selfCorrections: 'सेल्फ-करेक्शन', learningRate: 'सीखने की दर',
    fromAvg: 'औसत से', improvement: 'सुधार', today: 'आज', thisWeek: 'इस सप्ताह',
    callsByHour: 'प्रति घंटा कॉलें', callsThisWeek: 'इस सप्ताह कॉलें',
    agentPerformanceComparison: 'एजेंट प्रदर्शन तुलना',
    avgCallDuration: 'औसत कॉल अवधि', transferRate: 'स्थानांतरण दर', customerSatisfaction: 'ग्राहक संतुष्टि',
    fromLastWeek: 'पिछले सप्ताह से',
    welcomeTitle: 'FrontDesk Agents में आपका स्वागत है!', welcomeSubtitle: 'आपका AI रिसेप्शनिस्ट तैयार है। अपनी सेवा सक्रिय करने के लिए एक योजना चुनें।',
    mostPopular: 'सबसे लोकप्रिय', perMonth: '/महीना', startFreeTrial: 'मुफ्त परीक्षण शुरू करें', processing: 'प्रोसेसिंग...',
    trialNote: 'सभी योजनाओं पर 14-दिन का मुफ्त परीक्षण। कोई क्रेडिट कार्ड आवश्यक नहीं।', skipForNow: 'अभी छोड़ें - पहले डैशबोर्ड देखें',
    starter: 'स्टार्टर', professional: 'पेशेवर', enterprise: 'एंटरप्राइज़',
    hundredCalls: '100 कॉल/महीना', emailSupport: 'ईमेल सहायता', basicAnalytics: 'बेसिक एनालिटिक्स',
    thousandCalls: '1,000 कॉल/महीना', prioritySupport: 'प्राथमिक सहायता', smsIntegration: 'SMS इंटीग्रेशन',
    unlimitedCalls: 'असीमित कॉलें', support247: '24/7 सहायता', customIntegrations: 'कस्टम इंटीग्रेशन',
    callDetails: 'कॉल विवरण', close: 'बंद करें',
    viewTranscript: 'ट्रांसक्रिप्ट देखें',
    footerText: '© 2026 FrontDesk Agents। दुनिया का सबसे उन्नत AI रिसेप्शनिस्ट प्लेटफॉर्म।',
    privacyPolicy: 'गोपनीयता नीति', termsOfService: 'सेवा की शर्तें', contactSupport: 'सहायता संपर्क करें',
    logoutConfirm: 'क्या आप वाकई लॉग आउट करना चाहते हैं?',
    darkMode: 'डार्क मोड', lightMode: 'लाइट मोड'
  },
  ar: {
    navOverview: 'نظرة عامة', navCalls: 'سجل المكالمات', navAgents: 'وكلاء الذكاء الاصطناعي', navIntelligence: 'الذكاء', navSettings: 'تكوين الصوت',
    headerTitle: 'FRONTDESK', headerSubtitle: 'الوكلاء', themeLight: 'التبديل إلى الوضع الفاتح', themeDark: 'التبديل إلى الوضع الداكن',
    notificationsTitle: 'الإشعارات', markAllRead: 'تحديد الكل كمقروء',
    profileSettings: 'إعدادات الملف الشخصي', accountSettings: 'إعدادات الحساب', logOut: 'تسجيل الخروج',
    aiAgentOrchestra: 'أوركسترا الوكلاء الذكاء الاصطناعي', agentsPaused: 'الوكلاء متوقفون', activeCollaborating: '5 وكلاء يتعاونون بنشاط', callsHandledToday: 'مكالمة تمت معالجتها اليوم',
    singleMode: 'فردي', orchestrationMode: 'تنسيق', intelligenceMode: 'ذكاء',
    pauseOrchestra: 'إيقاف الأوركسترا', startOrchestra: 'بدء الأوركسترا', testCall: 'مكالمة تجريبية',
    autonomousModeActive: 'الوضع المستقل نشط',
    totalCallsToday: 'إجمالي المكالمات اليوم', avgResponseTime: 'متوسط وقت الاستجابة', resolutionRate: 'معدل القرار', activeAgents: 'الوكلاء النشطون',
    agentReasoningChain: 'سلسلة تفكير الوكيل', liveAutonomous: 'اتخاذ القرار المستقل المباشر', live: 'مباشر',
    analyzingIntent: 'تحليل نية المتصل', checkingCalendar: 'التحقق من توفر التقويم', retrievingPolicy: 'استرداد معلومات السياسة', escalationCriteria: 'تم استيفاء معايير التصعيد',
    decision: 'قرار', confidence: 'ثقة',
    recentCalls: 'المكالمات الأخيرة', viewAll: 'عرض الكل',
    topCallIntents: 'أهم نوايا المكالمات', quickActions: 'إجراءات سريعة', viewAllCalls: 'عرض جميع المكالمات', addLanguage: 'إضافة لغة', securitySettings: 'إعدادات الأمان',
    aiAgentCapabilities: 'قدرات الوكيل الذكاء الاصطناعي', voiceAI: 'الذكاء الاصطناعي الصوتي', smsChat: 'الرسائل / الدردشة', visionAnalysis: 'تحليل الرؤية', availability247: 'التوفر على مدار الساعة', statusActive: 'نشط',
    callLogs: 'سجل المكالمات', searchCalls: 'البحث في المكالمات...', allStatus: 'جميع الحالات', completed: 'مكتمل', transferred: 'محول', voicemail: 'البريد الصوتي', missed: 'فائت', export: 'تصدير',
    caller: 'المتصل', intent: 'النية', status: 'الحالة', duration: 'المدة', time: 'الوقت', actions: 'الإجراءات',
    viewDetails: 'عرض التفاصيل', playRecording: 'تشغيل التسجيل', delete: 'حذف',
    showingOfCalls: 'عرض {count} من {total} مكالمة', previous: 'السابق', next: 'التالي',
    agentCollaborationMatrix: 'مصفوفة تعاون الوكلاء', multiAgentOrchestration: 'تنسيق الوكلاء المتعددين وتفويض المهام',
    primary: 'أساسي', collaborators: 'المتعاونون', realTimeAgentComm: 'تواصل الوكلاء في الوقت الفعلي',
    callsToday: 'مكالمات اليوم', selfCorrect: 'التصحيح الذاتي', learningProgress: 'تقدم التعلم',
    aiIntelligenceDashboard: 'لوحة معلومات الذكاء الاصطناعي', autonomousDecision: 'اتخاذ القرار المستقل ومقاييس التعلم',
    multiAgentNeural: 'شبكة الوكلاء العصبية المتعددة', decisionsPerSec: 'قرارات/ثانية', accuracy: 'الدقة', selfCorrections: 'التصحيحات الذاتية', learningRate: 'معدل التعلم',
    fromAvg: 'من المتوسط', improvement: 'تحسين', today: 'اليوم', thisWeek: 'هذا الأسبوع',
    callsByHour: 'المكالمات حسب الساعة', callsThisWeek: 'مكالمات هذا الأسبوع',
    agentPerformanceComparison: 'مقارنة أداء الوكلاء',
    avgCallDuration: 'متوسط مدة المكالمة', transferRate: 'معدل التحويل', customerSatisfaction: 'رضا العملاء',
    fromLastWeek: 'من الأسبوع الماضي',
    welcomeTitle: 'مرحبًا بك في FrontDesk Agents!', welcomeSubtitle: 'منظم الذكاء الاصطناعي الخاص بك جاهز. حدد خطة لتفعيل خدمتك.',
    mostPopular: 'الأكثر شعبية', perMonth: '/شهر', startFreeTrial: 'بدء التجربة المجانية', processing: 'معالجة...',
    trialNote: 'تجربة مجانية لمدة 14 يومًا على جميع الخطط. لا يلزم بطاقة ائتمان.', skipForNow: 'تخطي الآن - استكشف لوحة التحكم أولاً',
    starter: 'مبتدئ', professional: 'احترافي', enterprise: 'مؤسساتي',
    hundredCalls: '100 مكالمة/شهر', emailSupport: 'دعم البريد الإلكتروني', basicAnalytics: 'تحليلات أساسية',
    thousandCalls: '1,000 مكالمة/شهر', prioritySupport: 'دعم أولوية', smsIntegration: 'تكامل الرسائل',
    unlimitedCalls: 'مكالمات غير محدودة', support247: 'دعم على مدار الساعة', customIntegrations: 'تكاملات مخصصة',
    callDetails: 'تفاصيل المكالمة', close: 'إغلاق',
    viewTranscript: 'عرض النص',
    footerText: '© 2026 FrontDesk Agents. منصة منظم الذكاء الاصطناعي الأكثر تقدمًا في العالم.',
    privacyPolicy: 'سياسة الخصوصية', termsOfService: 'شروط الخدمة', contactSupport: 'اتصل بالدعم',
    logoutConfirm: 'هل أنت متأكد من أنك تريد تسجيل الخروج؟',
    darkMode: 'الوضع الداكن', lightMode: 'الوضع الفاتح'
  },
  pt: {
    navOverview: 'Resumo', navCalls: 'Registro de Chamadas', navAgents: 'Agentes IA', navIntelligence: 'Inteligência', navSettings: 'Config. de Voz',
    headerTitle: 'FRONTDESK', headerSubtitle: 'AGENTES', themeLight: 'Mudar para modo claro', themeDark: 'Mudar para modo escuro',
    notificationsTitle: 'Notificações', markAllRead: 'Marcar tudo como lido',
    profileSettings: 'Configurações do Perfil', accountSettings: 'Configurações da Conta', logOut: 'Sair',
    aiAgentOrchestra: 'Orquestra de Agentes IA', agentsPaused: 'Agentes pausados', activeCollaborating: '5 agentes collaborando ativamente', callsHandledToday: 'chamadas tratadas hoje',
    singleMode: 'Simples', orchestrationMode: 'Orquestração', intelligenceMode: 'Inteligência',
    pauseOrchestra: 'Pausar Orquestra', startOrchestra: 'Iniciar Orquestra', testCall: 'Chamada de Teste',
    autonomousModeActive: 'Modo Autônomo Ativo',
    totalCallsToday: 'Total de Chamadas Hoje', avgResponseTime: 'Tempo de Resposta Médio', resolutionRate: 'Taxa de Resolução', activeAgents: 'Agentes Ativos',
    agentReasoningChain: 'Cadeia de Raciocínio do Agente', liveAutonomous: 'Decisões autônomas em tempo real', live: 'Ao Vivo',
    analyzingIntent: 'Analisando intenção do chamador', checkingCalendar: 'Verificando disponibilidade do calendário', retrievingPolicy: 'Recuperando informações da política', escalationCriteria: 'Critérios de escalação atendidos',
    decision: 'Decisão', confidence: 'Confiança',
    recentCalls: 'Chamadas Recentes', viewAll: 'Ver Tudo',
    topCallIntents: 'Principais Intenções de Chamada', quickActions: 'Ações Rápidas', viewAllCalls: 'Ver Todas as Chamadas', addLanguage: 'Adicionar Idioma', securitySettings: 'Configurações de Segurança',
    aiAgentCapabilities: 'Capacidades do Agente IA', voiceAI: 'IA de Voz', smsChat: 'SMS / Chat', visionAnalysis: 'Análise de Visão', availability247: 'Disponibilidade 24/7', statusActive: 'Ativo',
    callLogs: 'Registro de Chamadas', searchCalls: 'Pesquisar chamadas...', allStatus: 'Todos os Status', completed: 'Concluídas', transferred: 'Transferidas', voicemail: 'Correio de Voz', missed: 'Perdidas', export: 'Exportar',
    caller: 'Chamador', intent: 'Intenção', status: 'Status', duration: 'Duração', time: 'Hora', actions: 'Ações',
    viewDetails: 'Ver Detalhes', playRecording: 'Reproduzir Gravação', delete: 'Excluir',
    showingOfCalls: 'Mostrando {count} de {total} chamadas', previous: 'Anterior', next: 'Próximo',
    agentCollaborationMatrix: 'Matriz de Colaboração de Agentes', multiAgentOrchestration: 'Orquestração multi-agente e delegação de tarefas',
    primary: 'Primário', collaborators: 'Colaboradores', realTimeAgentComm: 'Comunicação de Agentes em Tempo Real',
    callsToday: 'chamadas hoje', selfCorrect: 'Auto-Correção', learningProgress: 'Progresso de Aprendizagem',
    aiIntelligenceDashboard: 'Painel de Inteligência IA', autonomousDecision: 'Decisões autônomas e métricas de aprendizagem',
    multiAgentNeural: 'Rede Neural Multi-Agente', decisionsPerSec: 'Decisões/seg', accuracy: 'Precisão', selfCorrections: 'Auto-Correções', learningRate: 'Taxa de Aprendizagem',
    fromAvg: 'da média', improvement: 'melhoria', today: 'Hoje', thisWeek: 'esta semana',
    callsByHour: 'Chamadas por Hora', callsThisWeek: 'Chamadas Esta Semana',
    agentPerformanceComparison: 'Comparação de Desempenho de Agentes',
    avgCallDuration: 'Duração Média de Chamada', transferRate: 'Taxa de Transferência', customerSatisfaction: 'Satisfação do Cliente',
    fromLastWeek: 'da semana passada',
    welcomeTitle: 'Bem-vindo ao FrontDesk Agents!', welcomeSubtitle: 'Seu receptionist IA está pronto. Selecione um plano para ativar seu serviço.',
    mostPopular: 'MAIS POPULAR', perMonth: '/mês', startFreeTrial: 'Iniciar Teste Gratuito', processing: 'Processando...',
    trialNote: 'Teste gratuito de 14 dias em todos os planos. Nenhum cartão de crédito necessário.', skipForNow: 'Pular por agora - explorar painel primeiro',
    starter: 'Inicial', professional: 'Profissional', enterprise: 'Empresarial',
    hundredCalls: '100 chamadas/mês', emailSupport: 'Suporte por email', basicAnalytics: 'Análise básica',
    thousandCalls: '1,000 chamadas/mês', prioritySupport: 'Suporte prioritário', smsIntegration: 'Integração SMS',
    unlimitedCalls: 'Chamadas ilimitadas', support247: 'Suporte 24/7', customIntegrations: 'Integrações personalizadas',
    callDetails: 'Detalhes da Chamada', close: 'Fechar',
    viewTranscript: 'Ver Transcrição',
    footerText: '© 2026 FrontDesk Agents. A Plataforma de Recepcionista IA Mais Avançada do Mundo.',
    privacyPolicy: 'Política de Privacidade', termsOfService: 'Termos de Serviço', contactSupport: 'Contatar Suporte',
    logoutConfirm: 'Tem certeza de que deseja sair?',
    darkMode: 'Modo Escuro', lightMode: 'Modo Claro'
  },
  ko: {
    navOverview: '개요', navCalls: '통화 기록', navAgents: 'AI 에이전트', navIntelligence: '지능', navSettings: '음성 구성',
    headerTitle: 'FRONTDESK', headerSubtitle: '에이전트', themeLight: '라이트 모드로 전환', themeDark: '다크 모드로 전환',
    notificationsTitle: '알림', markAllRead: '모두 읽음으로 표시',
    profileSettings: '프로필 설정', accountSettings: '계정 설정', logOut: '로그아웃',
    aiAgentOrchestra: 'AI 에이전트 오케스트라', agentsPaused: '에이전트 일시 중지됨', activeCollaborating: '5개의 에이전트가 활발히 협력 중', callsHandledToday: '오늘 처리된 통화',
    singleMode: '단일', orchestrationMode: '오케스트레이션', intelligenceMode: '지능',
    pauseOrchestra: '오케스트라 일시 중지', startOrchestra: '오케스트라 시작', testCall: '테스트 통화',
    autonomousModeActive: '자율 모드 활성',
    totalCallsToday: '오늘 총 통화', avgResponseTime: '평균 응답 시간', resolutionRate: '해결률', activeAgents: '활성 에이전트',
    agentReasoningChain: '에이전트 추론 체인', liveAutonomous: '실시간 자율 의사결정', live: '실시간',
    analyzingIntent: '통화자 의도 분석 중', checkingCalendar: '캘린더 가용성 확인 중', retrievingPolicy: '정책 정보 검색 중', escalationCriteria: '에스컬레이션 기준 충족',
    decision: '결정', confidence: '신뢰도',
    recentCalls: '최근 통화', viewAll: '모두 보기',
    topCallIntents: '주요 통화 의도', quickActions: '빠른 작업', viewAllCalls: '모든 통화 보기', addLanguage: '언어 추가', securitySettings: '보안 설정',
    aiAgentCapabilities: 'AI 에이전트 기능', voiceAI: '음성 AI', smsChat: 'SMS / 채팅', visionAnalysis: '비전 분석', availability247: '24/7 가용성', statusActive: '활성',
    callLogs: '통화 기록', searchCalls: '통화 검색...', allStatus: '모든 상태', completed: '완료', transferred: '전환됨', voicemail: '음성메일', missed: '부재', export: '내보내기',
    caller: '통화자', intent: '의도', status: '상태', duration: '기간', time: '시간', actions: '작업',
    viewDetails: '세부 정보 보기', playRecording: '녹음 재생', delete: '삭제',
    showingOfCalls: '{total}개 중 {count}개 표시', previous: '이전', next: '다음',
    agentCollaborationMatrix: '에이전트 협력 매트릭스', multiAgentOrchestration: '멀티에이전트 오케스트레이션 및 작업 위임',
    primary: '기본', collaborators: '협력자', realTimeAgentComm: '실시간 에이전트 통신',
    callsToday: '오늘 통화', selfCorrect: '자기 수정', learningProgress: '학습 진행',
    aiIntelligenceDashboard: 'AI 인텔리전스 대시보드', autonomousDecision: '자율 의사결정 및 학습 지표',
    multiAgentNeural: '멀티에이전트 신경망', decisionsPerSec: '결정/초', accuracy: '정확도', selfCorrections: '자기 수정', learningRate: '학습률',
    fromAvg: '평균 대비', improvement: '개선', today: '오늘', thisWeek: '이번 주',
    callsByHour: '시간별 통화', callsThisWeek: '이번 주 통화',
    agentPerformanceComparison: '에이전트 성능 비교',
    avgCallDuration: '평균 통화 시간', transferRate: '전환율', customerSatisfaction: '고객 만족도',
    fromLastWeek: '지난주 대비',
    welcomeTitle: 'FrontDesk Agents에 오신 것을 환영합니다!', welcomeSubtitle: 'AI 리셉셔니스트가 준비되었습니다. 서비스를 활성화하려면 플랜을 선택하세요.',
    mostPopular: '가장 인기 있음', perMonth: '/월', startFreeTrial: '무료 체험 시작', processing: '처리 중...',
    trialNote: '모든 플랜에서 14일 무료 체험. 신용 카드 필요 없음.', skipForNow: '지금은 건너뛰기 - 먼저 대시보드 탐색',
    starter: '스타터', professional: '프로페셔널', enterprise: '엔터프라이즈',
    hundredCalls: '100회 통화/월', emailSupport: '이메일 지원', basicAnalytics: '기본 분석',
    thousandCalls: '1,000회 통화/월', prioritySupport: '우선 지원', smsIntegration: 'SMS 통합',
    unlimitedCalls: '무제한 통화', support247: '24/7 지원', customIntegrations: '사용자 정의 통합',
    callDetails: '통화 세부 정보', close: '닫기',
    viewTranscript: '대본 보기',
    footerText: '© 2026 FrontDesk Agents. 세계에서 가장 진보한 AI 리셉셔니스트 플랫폼.',
    privacyPolicy: '개인정보 보호정책', termsOfService: '서비스 약관', contactSupport: '지원 문의',
    logoutConfirm: '정말 로그아웃하시겠습니까?',
    darkMode: '다크 모드', lightMode: '라이트 모드'
  },
  ja: {
    navOverview: '概要', navCalls: '通話履歴', navAgents: 'AIエージェント', navIntelligence: 'インテリジェンス', navSettings: '音声設定',
    headerTitle: 'FRONTDESK', headerSubtitle: 'エージェント', themeLight: 'ライトモードに切り替え', themeDark: 'ダークモードに切り替え',
    notificationsTitle: '通知', markAllRead: 'すべて既読にする',
    profileSettings: 'プロフィール設定', accountSettings: 'アカウント設定', logOut: 'ログアウト',
    aiAgentOrchestra: 'AIエージェントオーケストラ', agentsPaused: 'エージェント一時停止', activeCollaborating: '5つのエージェントが積極的にコラボレーション中', callsHandledToday: '今日の処理済み通話',
    singleMode: 'シングル', orchestrationMode: 'オーケストレーション', intelligenceMode: 'インテリジェンス',
    pauseOrchestra: 'オーケストラ一時停止', startOrchestra: 'オーケストラ開始', testCall: 'テスト通話',
    autonomousModeActive: '自律モード有効',
    totalCallsToday: '今日の総通話', avgResponseTime: '平均応答時間', resolutionRate: '解決率', activeAgents: 'アクティブエージェント',
    agentReasoningChain: 'エージェント推論チェーン', liveAutonomous: 'ライブ自律的意思決定', live: 'ライブ',
    analyzingIntent: '発信者の意図を分析中', checkingCalendar: 'カレンダーの可用性を確認中', retrievingPolicy: 'ポリシー情報を取得中', escalationCriteria: 'エスカレーション基準満たす',
    decision: '決定', confidence: '信頼度',
    recentCalls: '最近の通話', viewAll: 'すべて表示',
    topCallIntents: '主要な通話意図', quickActions: 'クイックアクション', viewAllCalls: 'すべての通話を表示', addLanguage: '言語を追加', securitySettings: 'セキュリティ設定',
    aiAgentCapabilities: 'AIエージェント機能', voiceAI: 'ボイスAI', smsChat: 'SMS / チャット', visionAnalysis: 'ビジョン分析', availability247: '24時間365日対応', statusActive: 'アクティブ',
    callLogs: '通話履歴', searchCalls: '通話検索...', allStatus: 'すべてのステータス', completed: '完了', transferred: '転送', voicemail: '音声メール', missed: '不在', export: 'エクスポート',
    caller: '発信者', intent: '意図', status: 'ステータス', duration: '期間', time: '時間', actions: 'アクション',
    viewDetails: '詳細を表示', playRecording: '録音再生', delete: '削除',
    showingOfCalls: '{total}件中{count}件を表示', previous: '前へ', next: '次へ',
    agentCollaborationMatrix: 'エージェントコラボレーションマトリックス', multiAgentOrchestration: 'マルチエージェントオーケストレーションとタスク委譲',
    primary: 'プライマリ', collaborators: 'コラボレーター', realTimeAgentComm: 'リアルタイムエージェント通信',
    callsToday: '今日の通話', selfCorrect: '自己修正', learningProgress: '学習進捗',
    aiIntelligenceDashboard: 'AIインテリジェンスダッシュボード', autonomousDecision: '自律的意思決定と学習指標',
    multiAgentNeural: 'マルチエージェントニューラルネットワーク', decisionsPerSec: '決定/秒', accuracy: '精度', selfCorrections: '自己修正', learningRate: '学習率',
    fromAvg: '平均から', improvement: '改善', today: '今日', thisWeek: '今週',
    callsByHour: '時間別通話', callsThisWeek: '今週の通話',
    agentPerformanceComparison: 'エージェントパフォーマンス比較',
    avgCallDuration: '平均通話時間', transferRate: '転送率', customerSatisfaction: '顧客満足度',
    fromLastWeek: '先週比',
    welcomeTitle: 'FrontDesk Agentsへようこそ！', welcomeSubtitle: 'AI受付が準備完了です。サービスを有効にするにはプランを選択してください。',
    mostPopular: '最も人気', perMonth: '/月', startFreeTrial: '無料トライアルを開始', processing: '処理中...',
    trialNote: 'すべてのプランで14日間無料トライアル。クレジットカード不要。', skipForNow: '今はスキップ - まずダッシュボードを探索',
    starter: 'スターター', professional: 'プロフェッショナル', enterprise: 'エンタープライズ',
    hundredCalls: '100通话/月', emailSupport: 'メールサポート', basicAnalytics: '基本分析',
    thousandCalls: '1,000通話/月', prioritySupport: '優先サポート', smsIntegration: 'SMS統合',
    unlimitedCalls: '無制限通話', support247: '24/7サポート', customIntegrations: 'カスタム統合',
    callDetails: '通話詳細', close: '閉じる',
    viewTranscript: 'トランスクリプトを表示',
    footerText: '© 2026 FrontDesk Agents. 世界で最も先進的なAI受付プラットフォーム。',
    privacyPolicy: 'プライバシーポリシー', termsOfService: '利用規約', contactSupport: 'サポートに連絡',
    logoutConfirm: '本当にログアウトしますか？',
    darkMode: 'ダークモード', lightMode: 'ライトモード'
  },
  vi: {
    navOverview: 'Tổng quan', navCalls: 'Nhật ký Cuộc gọi', navAgents: 'Đặc quyền AI', navIntelligence: 'Trí tuệ', navSettings: 'Cấu hình Giọng nói',
    headerTitle: 'FRONTDESK', headerSubtitle: 'ĐẠI LÝ', themeLight: 'Chuyển sang chế độ sáng', themeDark: 'Chuyển sang chế độ tối',
    notificationsTitle: 'Thông báo', markAllRead: 'Đánh dấu tất cả đã đọc',
    profileSettings: 'Cài đặt Hồ sơ', accountSettings: 'Cài đặt Tài khoản', logOut: 'Đăng Xuất',
    aiAgentOrchestra: 'Dàn nhạc Đặc quyền AI', agentsPaused: 'Đặc quyền tạm dừng', activeCollaborating: '5 đặc quyền đang tích cực cộng tác', callsHandledToday: 'cuộc gọi được xử lý hôm nay',
    singleMode: 'Đơn lẻ', orchestrationMode: 'Điều phối', intelligenceMode: 'Trí tuệ',
    pauseOrchestra: 'Tạm dừng Dàn nhạc', startOrchestra: 'Bắt đầu Dàn nhạc', testCall: 'Cuộc gọi Thử nghiệm',
    autonomousModeActive: 'Chế độ Tự trị Đang hoạt động',
    totalCallsToday: 'Tổng Cuộc gọi Hôm nay', avgResponseTime: 'Thời gian Phản hồi Trung bình', resolutionRate: 'Tỷ lệ Giải quyết', activeAgents: 'Đặc quyền Hoạt động',
    agentReasoningChain: 'Chuỗi Lý luận của Đặc quyền', liveAutonomous: 'Ra quyết định tự trị trực tiếp', live: 'Trực tiếp',
    analyzingIntent: 'Phân tích ý định của người gọi', checkingCalendar: 'Kiểm tra tình trạng lịch', retrievingPolicy: 'Truy xuất thông tin chính sách', escalationCriteria: 'Tiêu chí leo thang được đáp ứng',
    decision: 'Quyết định', confidence: 'Độ tin cậy',
    recentCalls: 'Cuộc gọi Gần đây', viewAll: 'Xem Tất cả',
    topCallIntents: 'Ý định Cuộc gọi Hàng đầu', quickActions: 'Hành động Nhanh', viewAllCalls: 'Xem Tất cả Cuộc gọi', addLanguage: 'Thêm Ngôn ngữ', securitySettings: 'Cài đặt Bảo mật',
    aiAgentCapabilities: 'Khả năng của Đặc quyền AI', voiceAI: 'AI Giọng nói', smsChat: 'SMS / Trò chuyện', visionAnalysis: 'Phân tích Tầm nhìn', availability247: 'Khả dụng 24/7', statusActive: 'Hoạt động',
    callLogs: 'Nhật ký Cuộc gọi', searchCalls: 'Tìm kiếm cuộc gọi...', allStatus: 'Tất cả Trạng thái', completed: 'Hoàn thành', transferred: 'Đã chuyển', voicemail: 'Hộp thư thoại', missed: 'Bỏ lỡ', export: 'Xuất',
    caller: 'Người gọi', intent: 'Ý định', status: 'Trạng thái', duration: 'Thời lượng', time: 'Thời gian', actions: 'Hành động',
    viewDetails: 'Xem Chi tiết', playRecording: 'Phát Ghi âm', delete: 'Xóa',
    showingOfCalls: 'Hiển thị {count} trong {total} cuộc gọi', previous: 'Trước', next: 'Tiếp',
    agentCollaborationMatrix: 'Ma trận Cộng tác Đặc quyền', multiAgentOrchestration: 'Điều phối đa đặc quyền và ủy thác tác vụ',
    primary: 'Chính', collaborators: 'Cộng tác viên', realTimeAgentComm: 'Giao tiếp Đặc quyền Thời gian thực',
    callsToday: 'cuộc gọi hôm nay', selfCorrect: 'Tự sửa', learningProgress: 'Tiến độ Học tập',
    aiIntelligenceDashboard: 'Bảng điều khiển Trí tuệ AI', autonomousDecision: 'Ra quyết định tự trị và số liệu học tập',
    multiAgentNeural: 'Mạng lưới Thần kinh Đa đặc quyền', decisionsPerSec: 'Quyết định/giây', accuracy: 'Độ chính xác', selfCorrections: 'Tự sửa', learningRate: 'Tốc độ Học tập',
    fromAvg: 'từ trung bình', improvement: 'cải thiện', today: 'Hôm nay', thisWeek: 'Tuần này',
    callsByHour: 'Cuộc gọi theo Giờ', callsThisWeek: 'Cuộc gọi Tuần này',
    agentPerformanceComparison: 'So sánh Hiệu suất Đặc quyền',
    avgCallDuration: 'Thời lượng Cuộc gọi Trung bình', transferRate: 'Tỷ lệ Chuyển', customerSatisfaction: 'Sự hài lòng của Khách hàng',
    fromLastWeek: 'từ tuần trước',
    welcomeTitle: 'Chào mừng đến với FrontDesk Agents!', welcomeSubtitle: 'Lễ tân AI của bạn đã sẵn sàng. Chọn một gói để kích hoạt dịch vụ của bạn.',
    mostPopular: 'PHỔ BIẾN NHẤT', perMonth: '/tháng', startFreeTrial: 'Bắt đầu Dùng thử Miễn phí', processing: 'Đang xử lý...',
    trialNote: 'Dùng thử miễn phí 14 ngày trên tất cả các gói. Không cần thẻ tín dụng.', skipForNow: 'Bỏ qua ngay bây giờ - khám phá bảng điều khiển trước',
    starter: 'Người mới bắt đầu', professional: 'Chuyên nghiệp', enterprise: 'Doanh nghiệp',
    hundredCalls: '100 cuộc gọi/tháng', emailSupport: 'Hỗ trợ email', basicAnalytics: 'Phân tích cơ bản',
    thousandCalls: '1.000 cuộc gọi/tháng', prioritySupport: 'Hỗ trợ ưu tiên', smsIntegration: 'Tích hợp SMS',
    unlimitedCalls: 'Cuộc gọi không giới hạn', support247: 'Hỗ trợ 24/7', customIntegrations: 'Tích hợp tùy chỉnh',
    callDetails: 'Chi tiết Cuộc gọi', close: 'Đóng',
    viewTranscript: 'Xem Bản ghi',
    footerText: '© 2026 FrontDesk Agents. Nền tảng Lễ tân AI Tiên tiến nhất Thế giới.',
    privacyPolicy: 'Chính sách Bảo mật', termsOfService: 'Điều khoản Dịch vụ', contactSupport: 'Liên hệ Hỗ trợ',
    logoutConfirm: 'Bạn có chắc chắn muốn đăng xuất không?',
    darkMode: 'Chế độ Tối', lightMode: 'Chế độ Sáng'
  },
  tl: {
    navOverview: 'Kabuuan', navCalls: 'Log ng Mga Tawag', navAgents: 'Mga AI Agent', navIntelligence: 'Intelekt', navSettings: 'Config ng Boses',
    headerTitle: 'FRONTDESK', headerSubtitle: 'AHENTE', themeLight: 'Lumipat sa light mode', themeDark: 'Lumipat sa dark mode',
    notificationsTitle: 'Mga Abiso', markAllRead: 'Markahan lahat bilang nabasa',
    profileSettings: 'Mga Setting ng Profile', accountSettings: 'Mga Setting ng Account', logOut: 'Mag-log Out',
    aiAgentOrchestra: 'AI Agent Orchestra', agentsPaused: 'Mga agent ay naka-pause', activeCollaborating: '5 mga agent ay aktibong nagtutulungan', callsHandledToday: 'mga tawag ang natreatment ngayon',
    singleMode: 'Solong', orchestrationMode: 'Orchestration', intelligenceMode: 'Intelekt',
    pauseOrchestra: 'I-pause ang Orchestra', startOrchestra: 'Simulan ang Orchestra', testCall: 'Test na Tawag',
    autonomousModeActive: 'Autonomous Mode ay Aktibo',
    totalCallsToday: 'Kabuuang Mga Tawag Ngayon', avgResponseTime: 'Average na Oras ng Pagtatanggap', resolutionRate: 'Rate ng Resolusyon', activeAgents: 'Mga Aktibong Agent',
    agentReasoningChain: 'Chain ng Pangangatuwiran ng Agent', liveAutonomous: 'Live na autonomous decision making', live: 'Live',
    analyzingIntent: 'Nagsusuri ng intensyon ng caller', checkingCalendar: 'Nagche-check ng availability ng calendar', retrievingPolicy: 'Kumukuha ng impormasyon ng policy', escalationCriteria: 'Naabot ang mga criteria ng escalation',
    decision: 'Desisyon', confidence: 'Kumpiyansa',
    recentCalls: 'Mga Kamakailang Tawag', viewAll: 'Tignan Lahat',
    topCallIntents: 'Mga Pangunahing Intenson ng Tawag', quickActions: 'Mga Quick Actions', viewAllCalls: 'Tignan Lahat ng Mga Tawag', addLanguage: 'Magdagdag ng Wika', securitySettings: 'Mga Setting ng Seguridad',
    aiAgentCapabilities: 'Mga Kakayahan ng AI Agent', voiceAI: 'Voice AI', smsChat: 'SMS / Chat', visionAnalysis: 'Vision Analysis', availability247: '24/7 na Availability', statusActive: 'Aktibo',
    callLogs: 'Log ng Mga Tawag', searchCalls: 'Maghanap ng mga tawag...', allStatus: 'Lahat ng Status', completed: 'Completed', transferred: 'Nai-transfer', voicemail: 'Voicemail', missed: 'Missed', export: 'I-export',
    caller: 'Caller', intent: 'Intenson', status: 'Status', duration: 'Duration', time: 'Oras', actions: 'Mga Aksyon',
    viewDetails: 'Tignan ang mga Detalye', playRecording: 'I-play ang Recording', delete: 'Tanggalin',
    showingOfCalls: 'Ipinapakita ang {count} ng {total} na mga tawag', previous: 'Nakaraan', next: 'Susunod',
    agentCollaborationMatrix: 'Matrix ng Kolaborasyon ng Agent', multiAgentOrchestration: 'Multi-agent orchestration at task delegation',
    primary: 'Pangunahing', collaborators: 'Mga Kolaborador', realTimeAgentComm: 'Real-time na Komunikasyon ng Agent',
    callsToday: 'mga tawag ngayon', selfCorrect: 'Self-Correct', learningProgress: 'Progress ng Pag-aaral',
    aiIntelligenceDashboard: 'Dashboard ng AI Intelligence', autonomousDecision: 'Autonomous decision making at mga metrics ng pag-aaral',
    multiAgentNeural: 'Multi-Agent Neural Network', decisionsPerSec: 'Mga desisyon/seg', accuracy: 'Accuracy', selfCorrections: 'Mga Self-Correction', learningRate: 'Learning Rate',
    fromAvg: 'mula sa average', improvement: 'pagpapabuti', today: 'Ngayon', thisWeek: 'nitong linggong ito',
    callsByHour: 'Mga Tawag ayon sa Oras', callsThisWeek: 'Mga Tawag nitong Linggo',
    agentPerformanceComparison: 'Paghahambing ng Performance ng Agent',
    avgCallDuration: 'Average na Tagal ng Tawag', transferRate: 'Rate ng Transfer', customerSatisfaction: 'Kasiyahan ng Customer',
    fromLastWeek: 'mula sa nakaraang linggo',
    welcomeTitle: 'Maligayang pagdating sa FrontDesk Agents!', welcomeSubtitle: 'Ang iyong AI receptionist ay handa na. Pumili ng plan para i-activate ang iyong serbisyo.',
    mostPopular: 'PINAKA-POPULAR', perMonth: '/buwan', startFreeTrial: 'Simulan ang Free Trial', processing: 'Nagpo-process...',
    trialNote: '14-araw na free trial sa lahat ng plan. Hindi kinakailangan ng credit card.', skipForNow: 'Laktawan muna - explore muna ang dashboard',
    starter: 'Starter', professional: 'Propesyonal', enterprise: 'Enterprise',
    hundredCalls: '100 tawag/buwan', emailSupport: 'Email support', basicAnalytics: 'Basic na analytics',
    thousandCalls: '1,000 tawag/buwan', prioritySupport: 'Priority support', smsIntegration: 'SMS integration',
    unlimitedCalls: 'Walang limitasyang tawag', support247: '24/7 support', customIntegrations: 'Custom na integrations',
    callDetails: 'Mga Detalye ng Tawag', close: 'Isara',
    viewTranscript: 'Tignan ang Transcript',
    footerText: '© 2026 FrontDesk Agents. Ang Pinaka-Advanced na AI Receptionist Platform sa Mundo.',
    privacyPolicy: 'Patakaran sa Privacy', termsOfService: 'Mga Tuntunin ng Serbisyo', contactSupport: 'Makipag-ugnayan sa Support',
    logoutConfirm: 'Sigurado ka bang gusto mong mag-log out?',
    darkMode: 'Dark Mode', lightMode: 'Light Mode'
  },
  de: {
    navOverview: 'Übersicht', navCalls: 'Anrufprotokoll', navAgents: 'KI-Agenten', navIntelligence: 'Intelligenz', navSettings: 'Sprachkonfig',
    headerTitle: 'FRONTDESK', headerSubtitle: 'AGENTEN', themeLight: 'Zum Hellmodus wechseln', themeDark: 'Zum Dunkelmodus wechseln',
    notificationsTitle: 'Benachrichtigungen', markAllRead: 'Alle als gelesen markieren',
    profileSettings: 'Profileinstellungen', accountSettings: 'Kontoeinstellungen', logOut: 'Abmelden',
    aiAgentOrchestra: 'KI-Agenten-Orchester', agentsPaused: 'Agenten pausiert', activeCollaborating: '5 Agenten arbeiten aktiv zusammen', callsHandledToday: 'Anrufe heute bearbeitet',
    singleMode: 'Einzel', orchestrationMode: 'Orchestrierung', intelligenceMode: 'Intelligenz',
    pauseOrchestra: 'Orchester pausieren', startOrchestra: 'Orchester starten', testCall: 'Testanruf',
    autonomousModeActive: 'Autonomouser Modus aktiv',
    totalCallsToday: 'Anrufe heute gesamt', avgResponseTime: 'Durchschn. Antwortzeit', resolutionRate: 'Lösungsrate', activeAgents: 'Aktive Agenten',
    agentReasoningChain: 'Agenten-Denkkette', liveAutonomous: 'Live autonome Entscheidungsfindung', live: 'Live',
    analyzingIntent: 'Analysiere Anruferabsicht', checkingCalendar: 'Prüfe Kalenderverfügbarkeit', retrievingPolicy: 'Rufe Richtlinieninformationen ab', escalationCriteria: 'Eskalationskriterien erfüllt',
    decision: 'Entscheidung', confidence: 'Vertrauen',
    recentCalls: 'Letzte Anrufe', viewAll: 'Alle anzeigen',
    topCallIntents: 'Top-Anrufabsichten', quickActions: 'Schnellaktionen', viewAllCalls: 'Alle Anrufe anzeigen', addLanguage: 'Sprache hinzufügen', securitySettings: 'Sicherheitseinstellungen',
    aiAgentCapabilities: 'KI-Agentenfähigkeiten', voiceAI: 'Sprach-KI', smsChat: 'SMS / Chat', visionAnalysis: 'Bildanalyse', availability247: '24/7 Verfügbarkeit', statusActive: 'Aktiv',
    callLogs: 'Anrufprotokoll', searchCalls: 'Anrufe suchen...', allStatus: 'Alle Status', completed: 'Abgeschlossen', transferred: 'Übertragen', voicemail: 'Mailbox', missed: 'Verpasst', export: 'Exportieren',
    caller: 'Anrufer', intent: 'Absicht', status: 'Status', duration: 'Dauer', time: 'Zeit', actions: 'Aktionen',
    viewDetails: 'Details anzeigen', playRecording: 'Aufnahme abspielen', delete: 'Löschen',
    showingOfCalls: 'Zeige {count} von {total} Anrufen', previous: 'Zurück', next: 'Weiter',
    agentCollaborationMatrix: 'Agenten-Kollaborationsmatrix', multiAgentOrchestration: 'Multi-Agenten-Orchestrierung und Aufgabendelegation',
    primary: 'Primär', collaborators: 'Mitarbeiter', realTimeAgentComm: 'Echtzeit-Agenten-Kommunikation',
    callsToday: 'Anrufe heute', selfCorrect: 'Selbstkorrektur', learningProgress: 'Lernfortschritt',
    aiIntelligenceDashboard: 'KI-Intelligenz-Dashboard', autonomousDecision: 'Autonome Entscheidungsfindung und Lernmetriken',
    multiAgentNeural: 'Multi-Agenten-Neuronales Netzwerk', decisionsPerSec: 'Entscheidungen/Sek', accuracy: 'Genauigkeit', selfCorrections: 'Selbstkorrekturen', learningRate: 'Lernrate',
    fromAvg: 'vom Durchschnitt', improvement: 'Verbesserung', today: 'Heute', thisWeek: 'Diese Woche',
    callsByHour: 'Anrufe nach Stunde', callsThisWeek: 'Anrufe diese Woche',
    agentPerformanceComparison: 'Agenten-Leistungsvergleich',
    avgCallDuration: 'Durchschn. Anrufdauer', transferRate: 'Übertragungsrate', customerSatisfaction: 'Kundenzufriedenheit',
    fromLastWeek: 'von letzter Woche',
    welcomeTitle: 'Willkommen bei FrontDesk Agents!', welcomeSubtitle: 'Ihr KI-Empfang ist bereit. Wählen Sie einen Plan, um Ihren Service zu aktivieren.',
    mostPopular: 'MEISTVERKAUFT', perMonth: '/Mon', startFreeTrial: 'Kostenlosen Test starten', processing: 'Verarbeitung...',
    trialNote: '14-tägige kostenlose Testversion für alle Pläne. Keine Kreditkarte erforderlich.', skipForNow: 'Vorerst überspringen - zuerst Dashboard erkunden',
    starter: 'Starter', professional: 'Professional', enterprise: 'Enterprise',
    hundredCalls: '100 Anrufe/Mon', emailSupport: 'E-Mail-Support', basicAnalytics: 'Basis-Analytics',
    thousandCalls: '1.000 Anrufe/Mon', prioritySupport: 'Prioritäts-Support', smsIntegration: 'SMS-Integration',
    unlimitedCalls: 'Unbegrenzte Anrufe', support247: '24/7 Support', customIntegrations: 'Benutzerdefinierte Integrationen',
    callDetails: 'Anrufdetails', close: 'Schließen',
    viewTranscript: 'Transkript anzeigen',
    footerText: '© 2026 FrontDesk Agents. Die fortschrittlichste KI-Empfangsplattform der Welt.',
    privacyPolicy: 'Datenschutzrichtlinie', termsOfService: 'Nutzungsbedingungen', contactSupport: 'Support kontaktieren',
    logoutConfirm: 'Sind Sie sicher, dass Sie sich abmelden möchten?',
    darkMode: 'Dunkelmodus', lightMode: 'Hellmodus'
  },
  it: {
    navOverview: 'Panoramica', navCalls: 'Registro Chiamate', navAgents: 'Agenti IA', navIntelligence: 'Intelligenza', navSettings: 'Config. Vocale',
    headerTitle: 'FRONTDESK', headerSubtitle: 'AGENTI', themeLight: 'Passa a modalità chiara', themeDark: 'Passa a modalità scura',
    notificationsTitle: 'Notifiche', markAllRead: 'Segna tutto come letto',
    profileSettings: 'Impostazioni Profilo', accountSettings: 'Impostazioni Account', logOut: 'Disconnetti',
    aiAgentOrchestra: 'Orchestra di Agenti IA', agentsPaused: 'Agenti in pausa', activeCollaborating: '5 agenti collaborano attivamente', callsHandledToday: 'chiamate gestite oggi',
    singleMode: 'Singolo', orchestrationMode: 'Orchestrazione', intelligenceMode: 'Intelligenza',
    pauseOrchestra: 'Metti in pausa Orchestra', startOrchestra: 'Avvia Orchestra', testCall: 'Chiamata di Test',
    autonomousModeActive: 'Modalità Autonoma Attiva',
    totalCallsToday: 'Chiamate Totali Oggi', avgResponseTime: 'Tempo di Risposta Medio', resolutionRate: 'Tasso di Risoluzione', activeAgents: 'Agenti Attivi',
    agentReasoningChain: 'Catena di Ragionamento dell\'Agente', liveAutonomous: 'Decisioni autonome in diretta', live: 'In Diretta',
    analyzingIntent: 'Analisi dell\'intento del chiamante', checkingCalendar: 'Verifica della disponibilità del calendario', retrievingPolicy: 'Recupero delle informazioni sulla policy', escalationCriteria: 'Criteri di escalation soddisfatti',
    decision: 'Decisione', confidence: 'Fiducia',
    recentCalls: 'Chiamate Recenti', viewAll: 'Vedi Tutto',
    topCallIntents: 'Primi Intenti di Chiamata', quickActions: 'Azioni Rapide', viewAllCalls: 'Vedi Tutte le Chiamate', addLanguage: 'Aggiungi Lingua', securitySettings: 'Impostazioni di Sicurezza',
    aiAgentCapabilities: 'Capacità dell\'Agente IA', voiceAI: 'IA Vocale', smsChat: 'SMS / Chat', visionAnalysis: 'Analisi della Visione', availability247: 'Disponibilità 24/7', statusActive: 'Attivo',
    callLogs: 'Registro Chiamate', searchCalls: 'Cerca chiamate...', allStatus: 'Tutti gli Status', completed: 'Completate', transferred: 'Trasferite', voicemail: 'Casella Vocale', missed: 'Perso', export: 'Esporta',
    caller: 'Chiamante', intent: 'Intento', status: 'Status', duration: 'Durata', time: 'Ora', actions: 'Azioni',
    viewDetails: 'Vedi Dettagli', playRecording: 'Riproduci Registrazione', delete: 'Elimina',
    showingOfCalls: 'Visualizzazione {count} di {total} chiamate', previous: 'Precedente', next: 'Successivo',
    agentCollaborationMatrix: 'Matrice di Collaborazione Agenti', multiAgentOrchestration: 'Orchestrazione multi-agente e delega dei task',
    primary: 'Primario', collaborators: 'Collaboratori', realTimeAgentComm: 'Comunicazione Agenti in Tempo Reale',
    callsToday: 'chiamate oggi', selfCorrect: 'Auto-Correzione', learningProgress: 'Progresso dell\'Apprendimento',
    aiIntelligenceDashboard: 'Dashboard di Intelligenza IA', autonomousDecision: 'Decisioni autonome e metriche di apprendimento',
    multiAgentNeural: 'Rete Neurale Multi-Agente', decisionsPerSec: 'Decisioni/sec', accuracy: 'Precisione', selfCorrections: 'Auto-Correzioni', learningRate: 'Tasso di Apprendimento',
    fromAvg: 'dalla media', improvement: 'miglioramento', today: 'Oggi', thisWeek: 'Questa settimana',
    callsByHour: 'Chiamate per Ora', callsThisWeek: 'Chiamate Questa Settimana',
    agentPerformanceComparison: 'Confronto Performance Agenti',
    avgCallDuration: 'Durata Media Chiamata', transferRate: 'Tasso di Trasferimento', customerSatisfaction: 'Soddisfazione Cliente',
    fromLastWeek: 'dalla settimana scorsa',
    welcomeTitle: 'Benvenuto in FrontDesk Agents!', welcomeSubtitle: 'Il tuo receptionist IA è pronto. Seleziona un piano per attivare il tuo servizio.',
    mostPopular: 'PIÙ POPOLARE', perMonth: '/mese', startFreeTrial: 'Inizia Trial Gratuito', processing: 'Elaborazione...',
    trialNote: 'Trial gratuito di 14 giorni su tutti i piani. Nessuna carta di credito richiesta.', skipForNow: 'Salta per ora - esplora prima la dashboard',
    starter: 'Starter', professional: 'Professional', enterprise: 'Enterprise',
    hundredCalls: '100 chiamate/mese', emailSupport: 'Supporto email', basicAnalytics: 'Analytics basic',
    thousandCalls: '1.000 chiamate/mese', prioritySupport: 'Supporto prioritario', smsIntegration: 'Integrazione SMS',
    unlimitedCalls: 'Chiamate illimitate', support247: 'Supporto 24/7', customIntegrations: 'Integrazioni personalizzate',
    callDetails: 'Dettagli Chiamata', close: 'Chiudi',
    viewTranscript: 'Vedi Trascrizione',
    footerText: '© 2026 FrontDesk Agents. La Piattaforma di Receptionist IA più Avanzata al Mondo.',
    privacyPolicy: 'Politica sulla Privacy', termsOfService: 'Termini di Servizio', contactSupport: 'Contatta Supporto',
    logoutConfirm: 'Sei sicuro di voler disconnetterti?',
    darkMode: 'Modalità Scura', lightMode: 'Modalità Chiara'
  },
  ru: {
    navOverview: 'Обзор', navCalls: 'Журнал звонков', navAgents: 'ИИ-агенты', navIntelligence: 'Интеллект', navSettings: 'Конфиг. голоса',
    headerTitle: 'FRONTDESK', headerSubtitle: 'АГЕНТЫ', themeLight: 'Переключиться на светлый режим', themeDark: 'Переключиться на темный режим',
    notificationsTitle: 'Уведомления', markAllRead: 'Отметить все как прочитанные',
    profileSettings: 'Настройки профиля', accountSettings: 'Настройки аккаунта', logOut: 'Выйти',
    aiAgentOrchestra: 'Оркестр ИИ-агентов', agentsPaused: 'Агенты на паузе', activeCollaborating: '5 агентов активно сотрудничают', callsHandledToday: 'звонков обработано сегодня',
    singleMode: 'Одиночный', orchestrationMode: 'Оркестрация', intelligenceMode: 'Интеллект',
    pauseOrchestra: 'Приостановить оркестр', startOrchestra: 'Запустить оркестр', testCall: 'Тестовый звонок',
    autonomousModeActive: 'Автономный режим активен',
    totalCallsToday: 'Всего звонков сегодня', avgResponseTime: 'Среднее время ответа', resolutionRate: 'Коэффициент разрешения', activeAgents: 'Активные агенты',
    agentReasoningChain: 'Цепь рассуждений агента', liveAutonomous: 'Живое автономное принятие решений', live: 'В прямом эфире',
    analyzingIntent: 'Анализ намерения звонящего', checkingCalendar: 'Проверка доступности календаря', retrievingPolicy: 'Получение информации о политике', escalationCriteria: 'Критерии эскалации выполнены',
    decision: 'Решение', confidence: 'Уверенность',
    recentCalls: 'Недавние звонки', viewAll: 'Посмотреть все',
    topCallIntents: 'Основные намерения звонков', quickActions: 'Быстрые действия', viewAllCalls: 'Посмотреть все звонки', addLanguage: 'Добавить язык', securitySettings: 'Настройки безопасности',
    aiAgentCapabilities: 'Возможности ИИ-агента', voiceAI: 'Голосовой ИИ', smsChat: 'SMS / Чат', visionAnalysis: 'Анализ зрения', availability247: 'Доступность 24/7', statusActive: 'Активный',
    callLogs: 'Журнал звонков', searchCalls: 'Поиск звонков...', allStatus: 'Все статусы', completed: 'Завершено', transferred: 'Переведено', voicemail: 'Голосовая почта', missed: 'Пропущено', export: 'Экспорт',
    caller: 'Звонящий', intent: 'Намерение', status: 'Статус', duration: 'Длительность', time: 'Время', actions: 'Действия',
    viewDetails: 'Посмотреть детали', playRecording: 'Воспроизвести запись', delete: 'Удалить',
    showingOfCalls: 'Показано {count} из {total} звонков', previous: 'Назад', next: 'Далее',
    agentCollaborationMatrix: 'Матрица сотрудничества агентов', multiAgentOrchestration: 'Мультиагентная оркестрация и делегирование задач',
    primary: 'Основной', collaborators: 'Сотрудники', realTimeAgentComm: 'Связь агентов в реальном времени',
    callsToday: 'звонков сегодня', selfCorrect: 'Самокоррекция', learningProgress: 'Прогресс обучения',
    aiIntelligenceDashboard: 'Панель ИИ-интеллекта', autonomousDecision: 'Автономное принятие решений и метрики обучения',
    multiAgentNeural: 'Мультиагентная нейронная сеть', decisionsPerSec: 'Решений/сек', accuracy: 'Точность', selfCorrections: 'Самокоррекции', learningRate: 'Скорость обучения',
    fromAvg: 'от среднего', improvement: 'улучшение', today: 'Сегодня', thisWeek: 'На этой неделе',
    callsByHour: 'Звонки по часам', callsThisWeek: 'Звонки на этой неделе',
    agentPerformanceComparison: 'Сравнение производительности агентов',
    avgCallDuration: 'Средняя длительность звонка', transferRate: 'Коэффициент перевода', customerSatisfaction: 'Удовлетворенность клиентов',
    fromLastWeek: 'с прошлой недели',
    welcomeTitle: 'Добро пожаловать в FrontDesk Agents!', welcomeSubtitle: 'Ваш ИИ-рецепционист готов. Выберите план для активации вашего сервиса.',
    mostPopular: 'САМЫЙ ПОПУЛЯРНЫЙ', perMonth: '/мес', startFreeTrial: 'Начать бесплатную пробную версию', processing: 'Обработка...',
    trialNote: '14-дневная бесплатная пробная версия на всех планах. Кредитная карта не требуется.', skipForNow: 'Пропустить сейчас - сначала изучить панель управления',
    starter: 'Стартер', professional: 'Профессионал', enterprise: 'Корпоративный',
    hundredCalls: '100 звонков/мес', emailSupport: 'Поддержка по email', basicAnalytics: 'Базовая аналитика',
    thousandCalls: '1,000 звонков/мес', prioritySupport: 'Приоритетная поддержка', smsIntegration: 'Интеграция с SMS',
    unlimitedCalls: 'Безлимитные звонки', support247: 'Поддержка 24/7', customIntegrations: 'Пользовательские интеграции',
    callDetails: 'Детали звонка', close: 'Закрыть',
    viewTranscript: 'Посмотреть транскрипт',
    footerText: '© 2026 FrontDesk Agents. Самая передовая платформа ИИ-рецепциониста в мире.',
    privacyPolicy: 'Политика конфиденциальности', termsOfService: 'Условия использования', contactSupport: 'Связаться с поддержкой',
    logoutConfirm: 'Вы уверены, что хотите выйти?',
    darkMode: 'Темный режим', lightMode: 'Светлый режим'
  }
}

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
interface Call {
  id: string
  caller: string
  name: string
  time: string
  duration: string
  status: 'completed' | 'transferred' | 'voicemail' | 'missed'
  intent: string
  recording?: string
}

interface Stat {
  label: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: any
}

interface AgentThought {
  id: string
  agent: string
  thought: string
  reasoning: string
  decision: string
  confidence: number
  timestamp: Date
}

interface CollaborativeTask {
  id: string
  task: string
  primaryAgent: string
  collaboratingAgents: string[]
  status: 'thinking' | 'executing' | 'completed'
  progress: number
}

interface AgentMetric {
  agentId: string
  name: string
  confidence: number
  callsToday: number
  selfCorrectionRate: number
  learningProgress: number
}

// Mock data
const initialStats: Stat[] = [
  { label: 'Total Calls Today', value: '247', change: '+12%', trend: 'up', icon: Phone },
  { label: 'Avg Response Time', value: '1.2s', change: '-8%', trend: 'down', icon: Activity },
  { label: 'Resolution Rate', value: '94%', change: '+3%', trend: 'up', icon: Zap },
  { label: 'Active Agents', value: '3', change: '0', trend: 'neutral', icon: Users }
]

const initialCalls: Call[] = [
  { id: '1', caller: '+1 (555) 123-4567', name: 'Sarah Johnson', time: '2 min ago', duration: '4:32', status: 'completed', intent: 'Schedule Appointment' },
  { id: '2', caller: '+1 (555) 987-6543', name: 'Michael Chen', time: '8 min ago', duration: '2:15', status: 'transferred', intent: 'Speak to Representative' },
  { id: '3', caller: '+1 (555) 456-7890', name: 'Emily Davis', time: '15 min ago', duration: '5:01', status: 'voicemail', intent: 'Leave Message' },
  { id: '4', caller: '+1 (555) 321-6540', name: 'James Wilson', time: '23 min ago', duration: '3:45', status: 'completed', intent: 'General Inquiry' },
  { id: '5', caller: '+1 (555) 789-0123', name: 'Lisa Anderson', time: '1 hour ago', duration: '6:12', status: 'completed', intent: 'Schedule Appointment' },
  { id: '6', caller: '+1 (555) 234-5678', name: 'Robert Taylor', time: '2 hours ago', duration: '1:23', status: 'missed', intent: 'Pricing Information' },
  { id: '7', caller: '+1 (555) 876-5432', name: 'Jennifer Martinez', time: '3 hours ago', duration: '4:56', status: 'completed', intent: 'Product Support' },
]

const topIntents = [
  { intent: 'Schedule Appointment', count: 89, percentage: 36 },
  { intent: 'General Inquiry', count: 67, percentage: 27 },
  { intent: 'Speak to Representative', count: 45, percentage: 18 },
  { intent: 'Leave Voicemail', count: 32, percentage: 13 },
  { intent: 'Billing Question', count: 14, percentage: 6 }
]

const aiAgents = [
  { id: 'receptionist', name: 'Receptionist Agent', status: 'active', calls: 156, description: 'Handles general inquiries and call routing', confidence: 94, selfCorrectionRate: 2.3, learningProgress: 78 },
  { id: 'scheduler', name: 'Scheduler Agent', status: 'active', calls: 67, description: 'Manages appointments and scheduling', confidence: 91, selfCorrectionRate: 1.8, learningProgress: 65 },
  { id: 'faq', name: 'FAQ Agent', status: 'active', calls: 45, description: 'Answers frequently asked questions', confidence: 97, selfCorrectionRate: 0.9, learningProgress: 82 },
  { id: 'transfer', name: 'Transfer Agent', status: 'paused', calls: 12, description: 'Handles human transfers and escalations', confidence: 88, selfCorrectionRate: 4.2, learningProgress: 54 },
  { id: 'voicemail', name: 'Voicemail Agent', status: 'active', calls: 28, description: 'Captures and manages voicemail messages', confidence: 96, selfCorrectionRate: 1.1, learningProgress: 71 },
]

const agentThoughts: AgentThought[] = [
  { id: '1', agent: 'Receptionist', thought: 'Analyzing caller intent...', reasoning: 'Based on greeting pattern "Hi, I was wondering if..." suggests scheduling intent with 87% confidence', decision: 'Route to Scheduler Agent', confidence: 87, timestamp: new Date(Date.now() - 120000) },
  { id: '2', agent: 'Scheduler', thought: 'Checking calendar availability...', reasoning: 'Querying calendar API for available slots in next 48 hours. Found 3 matching slots.', decision: 'Present 3 available times', confidence: 95, timestamp: new Date(Date.now() - 90000) },
  { id: '3', agent: 'FAQ', thought: 'Retrieving policy information...', reasoning: 'Customer asking about refund policy. Searching knowledge base for current policy v2.3', decision: 'Provide refund policy summary', confidence: 99, timestamp: new Date(Date.now() - 60000) },
  { id: '4', agent: 'Transfer', thought: 'Escalation criteria met...', reasoning: 'Customer expressed dissatisfaction ("very unhappy"). Sentiment analysis triggered escalation protocol.', decision: 'Transfer to human agent', confidence: 92, timestamp: new Date(Date.now() - 30000) },
]

const collaborativeTasks: CollaborativeTask[] = [
  { id: '1', task: 'Handle appointment booking', primaryAgent: 'Receptionist', collaboratingAgents: ['Scheduler', 'SMS'], status: 'executing', progress: 65 },
  { id: '2', task: 'Process customer complaint', primaryAgent: 'Transfer', collaboratingAgents: ['FAQ', 'Voicemail'], status: 'thinking', progress: 30 },
  { id: '3', task: 'Send appointment reminders', primaryAgent: 'Scheduler', collaboratingAgents: ['SMS'], status: 'completed', progress: 100 },
]

const analyticsData = {
  hourly: [
    { hour: '9am', calls: 12 },
    { hour: '10am', calls: 24 },
    { hour: '11am', calls: 31 },
    { hour: '12pm', calls: 18 },
    { hour: '1pm', calls: 15 },
    { hour: '2pm', calls: 28 },
    { hour: '3pm', calls: 35 },
    { hour: '4pm', calls: 22 },
    { hour: '5pm', calls: 19 },
  ],
  weekly: [
    { day: 'Mon', calls: 145 },
    { day: 'Tue', calls: 167 },
    { day: 'Wed', calls: 156 },
    { day: 'Thu', calls: 178 },
    { day: 'Fri', calls: 134 },
    { day: 'Sat', calls: 89 },
    { day: 'Sun', calls: 67 },
  ]
}

export default function DashboardPage() {
  const router = useRouter()
  const [isDark, setIsDark] = useState(true)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [selectedTab, setSelectedTab] = useState('overview')
  const [isAgentActive, setIsAgentActive] = useState(true)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showCallDetails, setShowCallDetails] = useState<Call | null>(null)
  const [stats, setStats] = useState(initialStats)
  const [calls, setCalls] = useState(initialCalls)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [notifications, setNotifications] = useState([
    { id: '1', message: 'New voicemail from Sarah Johnson', time: '5 min ago', read: false },
    { id: '2', message: 'High sentiment detected - transferred to human', time: '12 min ago', read: false },
    { id: '3', message: 'Daily report: 247 calls handled', time: '1 hour ago', read: true },
  ])
  const [activeView, setActiveView] = useState<'single' | 'orchestration' | 'intelligence'>('single')
  const [selectedAgentForDetail, setSelectedAgentForDetail] = useState(aiAgents[0])
  const [agentMetrics] = useState<AgentMetric[]>(aiAgents.map(a => ({
    agentId: a.id,
    name: a.name.replace(' Agent', ''),
    confidence: a.confidence,
    callsToday: a.calls,
    selfCorrectionRate: a.selfCorrectionRate,
    learningProgress: a.learningProgress
  })))
  const [language, setLanguage] = useState('en')
  const [isRTL, setIsRTL] = useState(false)
  
  // Welcome modal state for new users
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false)

  // Check for welcome param on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('preferred-language') || 'en'
    setLanguage(savedLang)
    setIsRTL(rtlLanguages.includes(savedLang))
    
    const handleLanguageChange = (e: CustomEvent) => {
      setLanguage(e.detail)
      setIsRTL(rtlLanguages.includes(e.detail))
    }
    window.addEventListener('languageChange', handleLanguageChange as EventListener)
    
    const params = new URLSearchParams(window.location.search)
    if (params.get('welcome') === 'true') {
      setShowWelcomeModal(true)
    }
    
    return () => window.removeEventListener('languageChange', handleLanguageChange as EventListener)
  }, [])

  const t = (key: string) => getTranslation(key, language)

  const tabs = [
    { id: 'overview', label: t('navOverview'), icon: BarChart3 },
    { id: 'calls', label: t('navCalls'), icon: Phone },
    { id: 'agents', label: t('navAgents'), icon: Brain },
    { id: 'analytics', label: t('navIntelligence'), icon: Sparkles },
    { id: 'settings', label: t('navSettings'), icon: Settings }
  ]

  // Handle agent toggle
  const toggleAgent = () => {
    setIsAgentActive(!isAgentActive)
    // In production, this would call an API to start/stop the agent
  }

  // Handle test call
  const handleTestCall = () => {
    alert('Test call initiated! Your AI receptionist will handle the call.')
  }

  // Handle logout
  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      router.push('/customer/login')
    }
  }

  // Mark notification as read
  const markNotificationRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
  }

  // Mark all notifications as read
  const markAllNotificationsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  // Filter calls
  const filteredCalls = calls.filter(call => {
    const matchesSearch = call.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         call.caller.includes(searchQuery)
    const matchesFilter = filterStatus === 'all' || call.status === filterStatus
    return matchesSearch && matchesFilter
  })

  // Get unread notifications count
  const unreadCount = notifications.filter(n => !n.read).length

  // Handle plan selection and Stripe checkout
  const handlePlanSelect = async (planId: string) => {
    setIsLoadingCheckout(true)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Failed to start checkout. Please try again.')
      }
    } catch (error) {
      alert('Connection error. Please try again.')
    } finally {
      setIsLoadingCheckout(false)
    }
  }

  const handleSquareCheckout = async (planId: string) => {
    setIsLoadingCheckout(true)
    try {
      const response = await fetch('/api/square/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      })
      const data = await response.json()
      if (data.success) {
        alert('Square payment successful! Redirecting...')
        window.location.href = '/customer/dashboard'
      } else {
        alert('Square payment failed. Please try again.')
      }
    } catch (error) {
      alert('Connection error. Please try again.')
    } finally {
      setIsLoadingCheckout(false)
    }
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-black' : 'bg-gray-50'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className={`fixed top-0 w-full z-50 ${isDark ? 'bg-black/90' : 'bg-white/90'} backdrop-blur-md border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
        <div className='max-w-7xl mx-auto px-6 py-4 flex justify-between items-center'>
          <Link href='/' className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center'>
              <Phone className='w-5 h-5 text-white' />
            </div>
            <div>
              <span className={`font-bold text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('headerTitle')}</span>
              <span className={`text-xs ml-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('headerSubtitle')}</span>
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
                    ? isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'
                    : isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className='w-4 h-4' />
                {tab.label}
              </button>
            ))}
          </div>
          
          <div className='flex items-center gap-3'>
            {/* Language Selector */}
            <LanguageSelector currentLang={language} onChange={(newLang: string) => {
              setLanguage(newLang)
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
              
              {/* Notifications Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`absolute right-0 mt-2 w-80 rounded-xl ${isDark ? 'bg-gray-900 border border-white/10' : 'bg-white border border-gray-200'} shadow-xl overflow-hidden z-50`}
                  >
                    <div className={`p-4 border-b ${isDark ? 'border-white/10' : 'border-gray-200'} flex items-center justify-between`}>
                      <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('notificationsTitle')}</span>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllNotificationsRead}
                          className='text-xs text-green-500 hover:text-green-400'
                        >
                          {t('markAllRead')}
                        </button>
                      )}
                    </div>
                    <div className='max-h-80 overflow-y-auto'>
                      {notifications.map(notification => (
                        <div 
                          key={notification.id}
                          onClick={() => markNotificationRead(notification.id)}
                          className={`p-4 border-b ${isDark ? 'border-white/5 hover:bg-white/5' : 'border-gray-100 hover:bg-gray-50'} cursor-pointer ${!notification.read ? (isDark ? 'bg-white/5' : 'bg-green-50/50') : ''}`}
                        >
                          <div className='flex items-start gap-3'>
                            {!notification.read && <div className='w-2 h-2 mt-2 rounded-full bg-green-500' />}
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
                <div className='w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center'>
                  <span className='text-white text-sm font-bold'>JD</span>
                </div>
                <span className={`hidden md:block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>John Doe</span>
                <ChevronDown className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </button>
              
              {/* User Dropdown */}
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`absolute right-0 mt-2 w-56 rounded-xl ${isDark ? 'bg-gray-900 border border-white/10' : 'bg-white border border-gray-200'} shadow-xl overflow-hidden z-50`}
                  >
                    <div className={`p-4 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>John Doe</p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>john@company.com</p>
                    </div>
                    <div className='p-2'>
                      <button className={`w-full flex items-center gap-3 p-3 rounded-lg ${isDark ? 'hover:bg-white/5 text-gray-300' : 'hover:bg-gray-50 text-gray-700'} transition-colors`}>
                        <User className='w-4 h-4' />
                        <span className='text-sm'>{t('profileSettings')}</span>
                      </button>
                      <button className={`w-full flex items-center gap-3 p-3 rounded-lg ${isDark ? 'hover:bg-white/5 text-gray-300' : 'hover:bg-gray-50 text-gray-700'} transition-colors`}>
                        <Settings className='w-4 h-4' />
                        <span className='text-sm'>{t('accountSettings')}</span>
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
                      ? isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'
                      : isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  <tab.icon className='w-5 h-5' />
                  {tab.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Content */}
      <main className='pt-28 pb-16 px-4 md:px-6'>
        <div className='max-w-7xl mx-auto'>{/* Agent Status Banner - Enhanced with AI Agentic Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-8 p-6 rounded-2xl ${isDark ? 'bg-gradient-to-br from-white/10 to-white/5 border border-white/10' : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'}`}
            >
              <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4'>
                <div className='flex items-center gap-4'>
                  <div className='relative'>
                    <div className={`w-3 h-3 rounded-full ${isAgentActive ? 'bg-green-500' : 'bg-red-500'}`} />
                    {isAgentActive && <div className='absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping' />}
                  </div>
                  <div>
                    <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {t('aiAgentOrchestra')}
                    </h2>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {isAgentActive ? t('activeCollaborating') + ' • ' + t('callsHandledToday') : t('agentsPaused')}
                    </p>
                  </div>
                </div>
                {/* Agent Mode Selector */}
                <div className='flex items-center gap-2 p-1 rounded-xl bg-white/5'>
                  <button
                    onClick={() => setActiveView('single')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeView === 'single' ? 'bg-green-500/20 text-green-400' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Cpu className='w-3 h-3 inline mr-1' /> {t('singleMode')}
                  </button>
                  <button
                    onClick={() => setActiveView('orchestration')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeView === 'orchestration' ? 'bg-green-500/20 text-green-400' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Network className='w-3 h-3 inline mr-1' /> {t('orchestrationMode')}
                  </button>
                  <button
                    onClick={() => setActiveView('intelligence')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeView === 'intelligence' ? 'bg-green-500/20 text-green-400' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Brain className='w-3 h-3 inline mr-1' /> {t('intelligenceMode')}
                  </button>
                </div>
              </div>
              
              {/* Agent Collaboration Visualization */}
              {isAgentActive && (
                <div className='grid grid-cols-5 gap-2 mb-4'>
                  {aiAgents.map((agent) => (
                    <div key={agent.id} className={`p-3 rounded-xl ${agent.status === 'active' ? (isDark ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200') : (isDark ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-yellow-50 border border-yellow-200')}`}>
                      <div className='flex items-center gap-2 mb-1'>
                        <div className={`w-2 h-2 rounded-full ${agent.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                        <span className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{agent.name.split(' ')[0]}</span>
                      </div>
                      <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{agent.confidence}%</div>
                      <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>confidence</div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className='flex items-center gap-3'>
                <button
                  onClick={toggleAgent}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${
                    isAgentActive
                      ? 'bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {isAgentActive ? (
                    <>
                      <Pause className='w-5 h-5' /> {t('pauseOrchestra')}
                    </>
                  ) : (
                    <>
                      <Play className='w-5 h-5' /> {t('startOrchestra')}
                    </>
                  )}
                </button>
                <button 
                  onClick={handleTestCall}
                  className='flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-bold text-white hover:from-green-500 hover:to-emerald-500 transition-all'
                >
                  <PhoneOutgoing className='w-5 h-5' /> {t('testCall')}
                </button>
                <div className={`ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg ${isDark ? 'bg-green-500/10' : 'bg-green-100'}`}>
                  <div className='w-2 h-2 rounded-full bg-green-500 animate-pulse' />
                  <span className={`text-xs font-medium text-green-500`}>{t('autonomousModeActive')}</span>
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
                {/* Stats Grid */}
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
                  {stats.map((stat, index) => (
                    <motion.div
                      key={t(stat.label)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}
                    >
                      <div className='flex items-center justify-between mb-4'>
                        <stat.icon className={`w-6 h-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`flex items-center gap-1 text-sm font-medium ${
                          stat.trend === 'up' ? 'text-green-500' : stat.trend === 'down' ? 'text-green-500' : 'text-gray-500'
                        }`}>
                          {stat.trend === 'up' && <TrendingUp className='w-4 h-4' />}
                          {stat.trend === 'down' && <TrendingDown className='w-4 h-4' />}
                          {stat.change}
                        </span>
                      </div>
                      <div className={`text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {stat.value}
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {t(stat.label)}
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Real-Time Agent Activity Feed */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className={`md:col-span-3 mb-6 p-6 rounded-2xl ${isDark ? 'bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20' : 'bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200'}`}
                >
                  <div className='flex items-center justify-between mb-4'>
                    <div className='flex items-center gap-3'>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                        <Brain className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                      </div>
                      <div>
                        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('agentReasoningChain')}</h3>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('liveAutonomous')}</p>
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
                              <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{thought.agent} Agent</span>
                              <span className={`px-2 py-0.5 rounded text-xs ${isDark ? 'bg-white/10 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>{thought.thought}</span>
                            </div>
                            <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{thought.reasoning}</p>
                            <div className='flex items-center gap-4'>
                              <div className='flex items-center gap-1'>
                                <Lightbulb className={`w-4 h-4 ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`} />
                                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('decision')}:</span>
                                <span className={`text-xs font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>{thought.decision}</span>
                              </div>
                              <div className='flex items-center gap-1'>
                                <Target className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('confidence')}:</span>
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
                <div className='grid md:grid-cols-3 gap-6'>
                  {/* Recent Calls */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`md:col-span-2 p-6 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}
                  >
                    <div className='flex items-center justify-between mb-6'>
                    <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {t('recentCalls')}
                    </h3>
                      <button 
                        onClick={() => setSelectedTab('calls')}
                        className='text-green-500 text-sm font-medium hover:text-green-400 flex items-center gap-1'
                      >
                        {t('viewAll')} <ChevronRight className='w-4 h-4' />
                      </button>
                    </div>
                    <div className='space-y-3'>
                      {calls.slice(0, 5).map(call => (
                        <div
                          key={call.id}
                          onClick={() => setShowCallDetails(call)}
                          className={`flex items-center justify-between p-4 rounded-xl ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'} transition-colors cursor-pointer`}
                        >
                          <div className='flex items-center gap-4'>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              call.status === 'completed' ? 'bg-green-500/10' : 
                              call.status === 'transferred' ? 'bg-blue-500/10' : 
                              call.status === 'voicemail' ? 'bg-yellow-500/10' : 'bg-red-500/10'
                            }`}>
                              {call.status === 'completed' && <Phone className='w-5 h-5 text-green-500' />}
                              {call.status === 'transferred' && <Users className='w-5 h-5 text-blue-500' />}
                              {call.status === 'voicemail' && <MessageSquare className='w-5 h-5 text-yellow-500' />}
                              {call.status === 'missed' && <XCircle className='w-5 h-5 text-red-500' />}
                            </div>
                            <div>
                              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {call.name}
                              </div>
                              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {call.caller} • {call.intent}
                              </div>
                            </div>
                          </div>
                          <div className='text-right'>
                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {call.time}
                            </div>
                            <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                              {call.duration}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                  
                  {/* Top Intents & Quick Actions */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}
                  >
                    <h3 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Top Call Intents
                    </h3>
                    <div className='space-y-4'>
                      {topIntents.map((intent, index) => (
                        <div key={intent.intent}>
                          <div className='flex items-center justify-between mb-2'>
                            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {intent.intent}
                            </span>
                            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {intent.count}
                            </span>
                          </div>
                          <div className={`h-2 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
                            <div
                              className='h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600'
                              style={{ width: `${intent.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Quick Actions */}
                    <div className='mt-8 pt-6 border-t border-white/10'>
                      <h4 className={`text-sm font-bold mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Quick Actions
                      </h4>
                      <div className='space-y-2'>
                        <button 
                          onClick={() => setSelectedTab('calls')}
                          className='w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-green-600/10 to-emerald-600/10 border border-green-500/20 text-green-500 hover:bg-green-600/20 transition-colors'
                        >
                          <Calendar className='w-4 h-4' />
                          <span className='text-sm font-medium'>{t('viewAllCalls')}</span>
                        </button>
                        <button className='w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 transition-colors'>
                          <Globe className='w-4 h-4' />
                          <span className='text-sm font-medium'>{t('addLanguage')}</span>
                        </button>
                        <button className='w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 transition-colors'>
                          <Shield className='w-4 h-4' />
                          <span className='text-sm font-medium'>{t('securitySettings')}</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
                
                {/* Agent Capabilities */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className={`mt-6 p-6 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}
                >
                  <h3 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('aiAgentCapabilities')}
                  </h3>
                  <div className='grid md:grid-cols-4 gap-4'>
                    {[
                      { label: t('voiceAI'), status: t('statusActive'), icon: Mic, color: 'green' },
                      { label: t('smsChat'), status: t('statusActive'), icon: MessageSquare, color: 'green' },
                      { label: t('visionAnalysis'), status: t('statusActive'), icon: Globe, color: 'green' },
                      { label: t('availability247'), status: t('statusActive'), icon: Clock, color: 'green' }
                    ].map((cap, index) => (
                      <div
                        key={cap.label}
                        className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}
                      >
                        <div className='flex items-center gap-3 mb-2'>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-${cap.color}-500/10`}>
                            <cap.icon className={`w-4 h-4 text-${cap.color}-500`} />
                          </div>
                          <div>
                            <div className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {cap.label}
                            </div>
                            <div className='text-xs text-green-500'>{cap.status}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}

            {selectedTab === 'calls' && (
              <motion.div
                key='calls'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'} overflow-hidden`}
              >
                {/* Header */}
                <div className={`p-6 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                  <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                    <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('callLogs')}</h3>
                    <div className='flex items-center gap-3'>
                      {/* Search */}
                      <div className='relative'>
                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                        <input
                          type='text'
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder={t('searchCalls')}
                          className={`pl-10 pr-4 py-2 rounded-xl text-sm ${isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500' : 'bg-gray-100 border border-gray-200 text-gray-900 placeholder-gray-400'}`}
                        />
                      </div>
                      {/* Filter */}
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className={`px-4 py-2 rounded-xl text-sm ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-100 border border-gray-200 text-gray-900'}`}
                      >
                        <option value='all'>{t('allStatus')}</option>
                        <option value='completed'>{t('completed')}</option>
                        <option value='transferred'>{t('transferred')}</option>
                        <option value='voicemail'>{t('voicemail')}</option>
                        <option value='missed'>{t('missed')}</option>
                      </select>
                      {/* Export */}
                      <button className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}>
                        <Download className='w-4 h-4' />
                        {t('export')}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <thead className={isDark ? 'bg-white/5' : 'bg-gray-50'}>
                      <tr>
                        <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('caller')}</th>
                        <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('intent')}</th>
                        <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('status')}</th>
                        <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('duration')}</th>
                        <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('time')}</th>
                        <th className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('actions')}</th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-white/5'>
                      {filteredCalls.map(call => (
                        <tr key={call.id} className={`${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'} transition-colors`}>
                          <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            <div className='flex items-center gap-3'>
                              <div className='w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center'>
                                <span className='text-white text-xs font-bold'>{call.name.split(' ').map(n => n[0]).join('')}</span>
                              </div>
                              <div>
                                <div className='font-medium'>{call.name}</div>
                                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{call.caller}</div>
                              </div>
                            </div>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {call.intent}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                              call.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                              call.status === 'transferred' ? 'bg-blue-500/10 text-blue-500' :
                              call.status === 'voicemail' ? 'bg-yellow-500/10 text-yellow-500' :
                              'bg-red-500/10 text-red-500'
                            }`}>
                              {call.status === 'completed' && <CheckCircle className='w-3 h-3' />}
                              {call.status === 'transferred' && <Users className='w-3 h-3' />}
                              {call.status === 'voicemail' && <MessageSquare className='w-3 h-3' />}
                              {call.status === 'missed' && <XCircle className='w-3 h-3' />}
                              {t(call.status)}
                            </span>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {call.duration}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {call.time}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <div className='flex items-center gap-2'>
                              <button 
                                onClick={() => setShowCallDetails(call)}
                                className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                                title={t('viewDetails')}
                              >
                                <Eye className='w-4 h-4' />
                              </button>
                              {call.recording && (
                                <button className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`} title={t('playRecording')}>
                                  <Phone className='w-4 h-4' />
                                </button>
                              )}
                              <button className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`} title={t('delete')}>
                                <Trash2 className='w-4 h-4' />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className={`px-6 py-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'} flex items-center justify-between`}>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t('showingOfCalls').replace('{count}', filteredCalls.length.toString()).replace('{total}', calls.length.toString())}
                  </span>
                  <div className='flex items-center gap-2'>
                    <button className={`px-3 py-1 rounded-lg text-sm ${isDark ? 'bg-white/5 hover:bg-white/10 text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`} disabled>{t('previous')}
                    </button>
                    <button className={`px-3 py-1 rounded-lg text-sm ${isDark ? 'bg-white/5 hover:bg-white/10 text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}>{t('next')}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {selectedTab === 'agents' && (
              <motion.div
                key='agents'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Agent Collaboration Matrix */}
                <div className={`mb-6 p-6 rounded-2xl ${isDark ? 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20' : 'bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200'}`}>
                  <div className='flex items-center gap-3 mb-6'>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-100'}`}>
                      <Network className={`w-6 h-6 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('agentCollaborationMatrix')}</h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('multiAgentOrchestration')}</p>
                    </div>
                  </div>
                  
                  <div className='grid md:grid-cols-3 gap-4 mb-6'>
                    {collaborativeTasks.map((task) => (
                      <div 
                        key={task.id}
                        className={`p-4 rounded-xl ${isDark ? 'bg-black/40 border border-white/10' : 'bg-white/80 border border-gray-200'}`}
                      >
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
                          <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('primary')}:</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'}`}>{task.primaryAgent}</span>
                        </div>
                        <div className='flex items-center gap-2 mb-3'>
                          <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{t('collaborators')}:</span>
                          <div className='flex gap-1'>
                            {task.collaboratingAgents.map((agent, i) => (
                              <span key={i} className={`text-xs px-2 py-0.5 rounded ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>{agent}</span>
                            ))}
                          </div>
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
                  
                  {/* Agent Interaction Graph Visualization */}
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-black/40' : 'bg-white/80'}`}>
                    <h4 className={`text-sm font-medium mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{t('realTimeAgentComm')}</h4>
                    <div className='flex items-center justify-between'>
                      {['Receptionist', 'Scheduler', 'FAQ', 'Transfer', 'Voicemail'].map((agent, i) => (
                        <div key={agent} className='flex flex-col items-center'>
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getAgentColor(agent)}`}>
                            <Cpu className='w-5 h-5 text-white' />
                          </div>
                          <span className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{agent}</span>
                          {i < 4 && (
                            <div className={`absolute h-0.5 w-8 ${isDark ? 'bg-green-500/50' : 'bg-green-400/50'}`} style={{ left: `${(i * 20) + 15}%` }} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Individual Agent Cards with Deep Metrics */}
                <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {aiAgents.map((agent, index) => (
                    <motion.div
                      key={agent.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setSelectedAgentForDetail(agent)}
                      className={`p-6 rounded-2xl cursor-pointer transition-all hover:scale-105 ${isDark ? 'bg-white/5 border border-white/10 hover:border-green-500/30' : 'bg-gray-50 border border-gray-200 hover:border-green-400/50'}`}
                    >
                      <div className='flex items-center gap-4 mb-4'>
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${getAgentColor(agent.name.split(' ')[0])}`}>
                          <Cpu className='w-7 h-7 text-white' />
                        </div>
                        <div className='flex-1'>
                          <div className='flex items-center gap-2'>
                            <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{agent.name}</h4>
                            <span className={`w-2 h-2 rounded-full ${agent.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                          </div>
                          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{agent.description}</p>
                        </div>
                      </div>
                      
                      {/* Agent Metrics */}
                      <div className='grid grid-cols-2 gap-3 mb-4'>
                        <div className={`p-3 rounded-lg ${isDark ? 'bg-black/40' : 'bg-white/80'}`}>
                          <div className='flex items-center gap-1 mb-1'>
                            <Target className={`w-3 h-3 ${getConfidenceColor(agent.confidence)}`} />
                            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Confidence</span>
                          </div>
                          <div className={`text-xl font-bold ${getConfidenceColor(agent.confidence)}`}>{agent.confidence}%</div>
                        </div>
                        <div className={`p-3 rounded-lg ${isDark ? 'bg-black/40' : 'bg-white/80'}`}>
                          <div className='flex items-center gap-1 mb-1'>
                            <RefreshCw className={`w-3 h-3 text-blue-400`} />
                            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Self-Correct</span>
                          </div>
                          <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{agent.selfCorrectionRate}%</div>
                        </div>
                      </div>
                      
                      {/* Learning Progress */}
                      <div>
                        <div className='flex items-center justify-between mb-1'>
                          <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Learning Progress</span>
                          <span className={`text-xs font-medium ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{agent.learningProgress}%</span>
                        </div>
                        <div className='w-full h-2 rounded-full bg-white/10 overflow-hidden'>
                          <div 
                            className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(agent.learningProgress)}`}
                            style={{ width: `${agent.learningProgress}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className='mt-4 flex items-center justify-between'>
                        <div className='text-center'>
                          <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{agent.calls}</div>
                          <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>calls today</div>
                        </div>
                        <div className='flex items-center gap-2'>
                          {agent.status === 'active' ? (
                            <span className='flex items-center gap-1 text-xs text-yellow-500'><Pause className='w-3 h-3' /> Pause</span>
                          ) : (
                            <span className='flex items-center gap-1 text-xs text-green-500'><Play className='w-3 h-3' /> Start</span>
                          )}
                          <Settings className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {selectedTab === 'analytics' && (
              <motion.div
                key='analytics'
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
                      <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>AI Intelligence Dashboard</h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Autonomous decision making and learning metrics</p>
                    </div>
                  </div>
                  
                  {/* Neural Network Visualization */}
                  <div className={`p-6 rounded-xl mb-6 ${isDark ? 'bg-black/40' : 'bg-white/80'}`}>
                    <h4 className={`text-sm font-medium mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Multi-Agent Neural Network</h4>
                    <svg viewBox='0 0 800 200' className='w-full h-48'>
                      {/* Input Layer */}
                      <g transform='translate(50, 100)'>
                        {['Intent', 'Sentiment', 'Context', 'History'].map((label, i) => (
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
                      
                      {/* Output Layer - Agents */}
                      <g transform='translate(600, 100)'>
                        {[
                          { label: 'Recept.', color: 'fill-green-500' },
                          { label: 'Schedule', color: 'fill-blue-500' },
                          { label: 'FAQ', color: 'fill-purple-500' },
                          { label: 'Transfer', color: 'fill-orange-500' },
                          { label: 'Voicemail', color: 'fill-yellow-500' }
                        ].map((item, i) => (
                          <g key={item.label} transform={`translate(0, ${(i - 2) * 45})`}>
                            <circle r='22' className={isDark ? item.color : `${item.color.replace('500', '400')}`} opacity='0.8' />
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
                      <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>847</div>
                      <div className='text-xs text-green-500 mt-1'>+12% from avg</div>
                    </div>
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-black/40' : 'bg-white/80'}`}>
                      <div className='flex items-center gap-2 mb-2'>
                        <Target className='w-5 h-5 text-green-500' />
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Accuracy</span>
                      </div>
                      <div className={`text-2xl font-bold text-green-500`}>94.7%</div>
                      <div className='text-xs text-green-500 mt-1'>+2.3% improvement</div>
                    </div>
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-black/40' : 'bg-white/80'}`}>
                      <div className='flex items-center gap-2 mb-2'>
                        <RefreshCw className='w-5 h-5 text-blue-500' />
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Self-Corrections</span>
                      </div>
                      <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>156</div>
                      <div className='text-xs text-blue-500 mt-1'>Today</div>
                    </div>
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-black/40' : 'bg-white/80'}`}>
                      <div className='flex items-center gap-2 mb-2'>
                        <Lightbulb className='w-5 h-5 text-purple-500' />
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Learning Rate</span>
                      </div>
                      <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>73%</div>
                      <div className='text-xs text-purple-500 mt-1'>+5% this week</div>
                    </div>
                  </div>
                </div>
                
                {/* Charts Row */}
                <div className='grid md:grid-cols-2 gap-6'>
                  {/* Hourly Chart */}
                  <div className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
                    <h3 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Calls by Hour</h3>
                    <div className='flex items-end justify-between h-48 gap-2'>
                      {analyticsData.hourly.map((item, i) => (
                        <div key={item.hour} className='flex flex-col items-center gap-2 flex-1'>
                          <div 
                            className='w-full bg-gradient-to-t from-green-600 to-emerald-500 rounded-t-lg transition-all hover:from-green-500 hover:to-emerald-400'
                            style={{ height: `${(item.calls / 35) * 100}%` }}
                          />
                          <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{item.hour}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Weekly Chart */}
                  <div className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
                    <h3 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Calls This Week</h3>
                    <div className='flex items-end justify-between h-48 gap-2'>
                      {analyticsData.weekly.map((item, i) => (
                        <div key={item.day} className='flex flex-col items-center gap-2 flex-1'>
                          <div 
                            className='w-full bg-gradient-to-t from-green-600 to-emerald-500 rounded-t-lg transition-all hover:from-green-500 hover:to-emerald-400'
                            style={{ height: `${(item.calls / 180) * 100}%` }}
                          />
                          <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{item.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Agent Performance Metrics */}
                <div className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
                  <h3 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Agent Performance Comparison</h3>
                  <div className='space-y-4'>
                    {agentMetrics.map((metric, i) => (
                      <div key={metric.agentId} className='flex items-center gap-4'>
                        <span className={`w-24 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{metric.name}</span>
                        <div className='flex-1 flex items-center gap-2'>
                          <div className='w-32 h-2 rounded-full bg-white/10 overflow-hidden'>
                            <div className={`h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-600`} style={{ width: `${metric.confidence}%` }} />
                          </div>
                          <span className={`text-sm font-medium w-12 ${getConfidenceColor(metric.confidence)}`}>{metric.confidence}%</span>
                        </div>
                        <div className='w-20 text-center'>
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{metric.callsToday} calls</span>
                        </div>
                        <div className='w-20 text-center'>
                          <span className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-500'}`}>{metric.selfCorrectionRate}%</span>
                        </div>
                        <div className='w-24'>
                          <div className='w-full h-2 rounded-full bg-white/10 overflow-hidden'>
                            <div className='h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-600' style={{ width: `${metric.learningProgress}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className='flex items-center gap-8 mt-4 pt-4 border-t border-white/10'>
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Confidence</span>
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Calls Today</span>
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Self-Correction</span>
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Learning</span>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className='grid md:grid-cols-3 gap-6'>
                  <div className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
                    <h4 className={`text-sm font-medium mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Average Call Duration</h4>
                    <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>3:42</div>
                    <div className='flex items-center gap-2 mt-2 text-green-500 text-sm'>
                      <TrendingDown className='w-4 h-4' />
                      -12% from last week
                    </div>
                  </div>
                  <div className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
                    <h4 className={`text-sm font-medium mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Transfer Rate</h4>
                    <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>8.2%</div>
                    <div className='flex items-center gap-2 mt-2 text-green-500 text-sm'>
                      <TrendingDown className='w-4 h-4' />
                      -2.1% from last week
                    </div>
                  </div>
                  <div className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
                    <h4 className={`text-sm font-medium mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Customer Satisfaction</h4>
                    <div className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>4.7/5</div>
                    <div className='flex items-center gap-2 mt-2 text-green-500 text-sm'>
                      <TrendingUp className='w-4 h-4' />
                      +0.3 from last week
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
              >
                <BlandConfigForm isDark={isDark} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Call Details Modal */}
      <AnimatePresence>
        {showCallDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4'
            onClick={() => setShowCallDetails(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-lg rounded-2xl ${isDark ? 'bg-gray-900 border border-white/10' : 'bg-white border border-gray-200'} overflow-hidden`}
            >
              <div className={`p-6 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                <div className='flex items-center justify-between'>
                  <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Call Details</h3>
                  <button 
                    onClick={() => setShowCallDetails(null)}
                    className={`p-2 rounded-full ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                  >
                    <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </button>
                </div>
              </div>
              <div className='p-6'>
                <div className='flex items-center gap-4 mb-6'>
                  <div className='w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center'>
                    <span className='text-white text-xl font-bold'>
                      {showCallDetails.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h4 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{showCallDetails.name}</h4>
                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{showCallDetails.caller}</p>
                  </div>
                </div>
                
                <div className='space-y-4'>
                  <div className='flex justify-between py-3 border-b border-white/10'>
                    <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Status</span>
                    <span className={`font-medium ${
                      showCallDetails.status === 'completed' ? 'text-green-500' :
                      showCallDetails.status === 'transferred' ? 'text-blue-500' :
                      showCallDetails.status === 'voicemail' ? 'text-yellow-500' : 'text-red-500'
                    }`}>
                      {showCallDetails.status.charAt(0).toUpperCase() + showCallDetails.status.slice(1)}
                    </span>
                  </div>
                  <div className='flex justify-between py-3 border-b border-white/10'>
                    <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Intent</span>
                    <span className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{showCallDetails.intent}</span>
                  </div>
                  <div className='flex justify-between py-3 border-b border-white/10'>
                    <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Duration</span>
                    <span className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{showCallDetails.duration}</span>
                  </div>
                  <div className='flex justify-between py-3 border-b border-white/10'>
                    <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Time</span>
                    <span className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{showCallDetails.time}</span>
                  </div>
                </div>

                <div className='mt-6 flex gap-3'>
                  {showCallDetails.recording && (
                    <button className='flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl text-white font-bold'>
                      <Phone className='w-5 h-5' />
                      Play Recording
                    </button>
                  )}
                  <button className={`flex-1 py-3 rounded-xl font-medium ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'}`}>
                    <FileText className='w-5 h-5 inline mr-2' />
                    View Transcript
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Welcome Modal for New Users */}
      <AnimatePresence>
        {showWelcomeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4'
            onClick={() => setShowWelcomeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-2xl rounded-2xl ${isDark ? 'bg-gray-900 border border-white/10' : 'bg-white border border-gray-200'} overflow-hidden`}
            >
              <div className={`p-8 text-center bg-gradient-to-br from-green-500/10 to-emerald-500/10`}>
                <div className='w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-6'>
                  <CheckCircle className='w-10 h-10 text-white' />
                </div>
                <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Welcome to FrontDesk Agents!</h2>
                <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Your AI receptionist is ready. Select a plan to activate your service.</p>
              </div>
              <div className='p-8'>
                <div className='grid md:grid-cols-3 gap-4 mb-6'>
                  {[
                    { id: 'starter', name: 'Starter', price: '$99', features: ['100 calls/mo', 'Email support', 'Basic analytics'] },
                    { id: 'professional', name: 'Professional', price: '$299', features: ['1,000 calls/mo', 'Priority support', 'SMS integration'], popular: true },
                    { id: 'enterprise', name: 'Enterprise', price: '$999', features: ['Unlimited calls', '24/7 support', 'Custom integrations'] }
                  ].map((plan) => (
                    <div 
                      key={plan.id}
                      className={`p-6 rounded-xl border ${plan.popular ? 'border-green-500 bg-green-500/5' : isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'} relative`}
                    >
                      {plan.popular && <div className='absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-500 rounded-full text-xs font-bold text-white'>MOST POPULAR</div>}
                      <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                      <div className='text-3xl font-bold mb-4'>
                        <span className='bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent'>{plan.price}</span>
                        <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>/mo</span>
                      </div>
                      <ul className='space-y-2 mb-6'>
                        {plan.features.map((f, i) => (
                          <li key={i} className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} flex items-center gap-2`}>
                            <Check className='w-4 h-4 text-green-500' /> {f}
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={() => handlePlanSelect(plan.id)}
                        disabled={isLoadingCheckout}
                        className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                          plan.popular 
                            ? 'bg-green-600 hover:bg-green-500 text-white' 
                            : isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                        } disabled:opacity-50`}
                      >
                        {isLoadingCheckout ? (
                          <><Loader2 className='w-4 h-4 animate-spin' /> Processing...</>
                        ) : (
                          <><ArrowRight className='w-4 h-4' /> Start Free Trial</>
                        )}
                      </button>
                      <button
                        onClick={() => handleSquareCheckout(plan.id)}
                        disabled={isLoadingCheckout}
                        className={`w-full py-2 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 border-2 ${
                          plan.popular
                            ? 'border-green-600 text-green-600 hover:bg-green-600 hover:text-white'
                            : isDark ? 'border-white/20 text-white/70 hover:border-white/40' : 'border-gray-300 text-gray-600 hover:border-gray-400'
                        } disabled:opacity-50`}
                      >
                        {isLoadingCheckout ? (
                          <>Processing...</>
                        ) : (
                          <>Pay with Card</>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
                <p className={`text-center text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>14-day free trial on all plans. No credit card required to start.</p>
                <button 
                  onClick={() => setShowWelcomeModal(false)}
                  className={`mt-4 w-full py-2 text-sm ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  Skip for now - explore dashboard first
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className={`py-8 px-6 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
        <div className='max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4'>
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            © 2026 FrontDesk Agents. World's Most Advanced AI Receptionist Platform.
          </div>
          <div className='flex items-center gap-6'>
            <Link href='/privacy-policy' className={`text-sm ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>
              Privacy Policy
            </Link>
            <Link href='/terms-of-service' className={`text-sm ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>
              Terms of Service
            </Link>
            <Link href='/contact' className={`text-sm ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>
              Contact Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Import Bot icon
// Bot icon - using Users as placeholder
// Helper functions
const getAgentColor = (agent: string) => {
  switch (agent) {
    case 'Receptionist': return 'bg-gradient-to-br from-green-500 to-emerald-600'
    case 'Scheduler': return 'bg-gradient-to-br from-blue-500 to-cyan-600'
    case 'FAQ': return 'bg-gradient-to-br from-purple-500 to-pink-600'
    case 'Transfer': return 'bg-gradient-to-br from-orange-500 to-red-600'
    case 'Voicemail': return 'bg-gradient-to-br from-yellow-500 to-amber-600'
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

// Neural Network Node Component
const NeuralNode = ({ x, y, label, active, color }: { x: number, y: number, label: string, active: boolean, color: string }) => (
  <g transform={`translate(${x}, ${y})`}>
    <circle r='20' className={`${active ? color : 'fill-gray-600'} opacity-80`} />
    {active && <circle r='25' className={`${color} opacity-30`} />}
    <text y='35' textAnchor='middle' className={`text-xs fill-white font-medium`}>{label}</text>
  </g>
)

const Bot = Users