'use client'
import { useState, useEffect } from 'react'
import { Phone, Zap, Check, Play, ChevronRight, Calendar, MessageSquare, Building2, Star, ArrowRight, Mic, Headphones, BarChart3, ShieldCheck, Globe } from 'lucide-react'
import Link from 'next/link'
import LanguageSelector from './components/LanguageSelector'

// Complete multilingual translations for all text on the page
const translations: Record<string, Record<string, string>> = {
  en: {
    // Nav and hero
    navIndustries: 'Industries', navFeatures: 'Features', navPricing: 'Pricing', navDemo: 'Demo', navSignIn: 'Sign In', navStartFree: 'Start Free Trial',
    heroBadge: 'The World Most Advanced AI Receptionist Platform',
    heroTitle1: 'Stop Losing Revenue to', heroTitle2: 'Missed Calls & Slow Follow-Ups',
    heroSubtitle: 'AI receptionist works 24/7, answers every call instantly, books appointments, and qualifies leads.',
    heroTrusted: 'Trusted by 2,400+ businesses across Law, Dental, HVAC, Plumbing, Real Estate & more',
    heroEmailPlaceholder: 'Enter your work email',
    heroCta: 'Start Free Trial',
    heroTrialNote: '14-day free trial • No credit card required',
    // ROI stats
    roiAvgRoi: 'Average ROI', roiLeadCapture: 'Lead Capture Rate', roiMonthlySavings: 'Avg Monthly Savings', roiResponseTime: 'Response Time',
    // Industries
    industriesTitle: 'Built for', industriesTitleAccent: 'Your Industry',
    industriesSubtitle: 'Pre-configured AI Receptionist templates for each industry we serve.',
    // Features
    featuresTitle: 'The Most', featuresTitleAccent: 'Advanced AI',
    featuresSubtitle: 'Not just an answering machine. A complete AI receptionist that handles the full customer journey.',
    // How it works
    howItWorksTitle: 'Up and Running in 48 Hours',
    step1Title: 'Create Account', step1Desc: 'Sign up in 2 minutes. Select your industry for pre-configured templates.', step1Time: '2 min',
    step2Title: 'Configure', step2Desc: 'Import services, set schedules, and customize your AI voice persona.', step2Time: '30 min',
    step3Title: 'Go Live', step3Desc: 'Start answering calls immediately. Monitor from your dashboard.', step3Time: 'Instant',
    // Testimonials
    testimonialsTitle: 'Real Results from Real Businesses',
    // Integrations
    integrationsTitle: 'Works With Your Existing Tools',
    integrationsSubtitle: 'One-click integrations with the software you already use',
    // Pricing
    pricingTitle: 'Simple, Transparent Pricing',
    planStarter: 'Starter', planProfessional: 'Professional', planEnterprise: 'Enterprise',
    planStarterDesc: 'Perfect for small businesses', planProfessionalDesc: 'Most popular for growing businesses', planEnterpriseDesc: 'For organizations needing unlimited scale',
    planStarterPrice: '$199', planProfessionalPrice: '$399', planEnterprisePrice: '$799',
    planMostPopular: 'MOST POPULAR',
    featureBasicAi: 'Basic AI Receptionist', feature100Calls: '100 calls/month', featureEmailSupport: 'Email support', featureBasicAnalytics: 'Basic analytics',
    featureUnlimitedAi: 'Unlimited AI Receptionist', feature1000Calls: '1,000 calls/month', featurePrioritySupport: 'Priority support', featureAdvancedAnalytics: 'Advanced analytics', featureSmsIntegration: 'SMS integration', featureVoicemail: 'Voice mail',
    featureEverything: 'Everything in Professional', featureUnlimitedCalls: 'Unlimited calls', feature247Support: '24/7 Support', featureCustomIntegrations: 'Custom integrations', featureWhiteLabel: 'White-label options', featureDedicatedManager: 'Dedicated account manager',
    pricingTrialNote: 'All plans include 14-day free trial • No credit card required',
    // CTA
    ctaTitle: 'Ready to Capture Every Lead?',
    ctaSubtitle: 'Join 2,400+ businesses already using FrontDesk Agents.',
    ctaStartTrial: 'Start Your Free Trial', ctaSignIn: 'Sign In',
    // Footer
    footerPrivacy: 'Privacy Policy', footerTerms: 'Terms of Service', footerContact: 'Contact Support',
    footerCopyright: 'World Most Advanced AI Receptionist Platform',
    // Video modal
    watchDemo: 'Watch Demo',
    // Industry names
    indLaw: 'Law Firms', indDental: 'Dental Clinics', indMedspa: 'Med Spas', indHvac: 'HVAC', indPlumbing: 'Plumbing', indRealEstate: 'Real Estate', indLogistics: 'Logistics', indInsurance: 'Insurance',
    indLawStat: '93% of litigators report missed calls cost them cases',
    indDentalStat: '67% of patients switch dentists for better scheduling',
    indMedspaStat: '$2,400 avg. missed revenue per month',
    indHvacStat: '50% of HVAC emergencies are first-call-booked',
    indPlumbingStat: '72% of plumbing emergencies happen after hours',
    indRealEstateStat: '78% of home buyers work with the first agent',
    indLogisticsStat: '40% cost reduction with AI dispatch',
    indInsuranceStat: '35% of leads choose the first agent to contact'
  },
  es: {
    navIndustries: 'Industrias', navFeatures: 'Características', navPricing: 'Precios', navDemo: 'Demo', navSignIn: 'Iniciar Sesión', navStartFree: 'Prueba Gratis',
    heroBadge: 'La Plataforma de Recepcionista IA Más Avanzada del Mundo',
    heroTitle1: 'Deja de Perder Ingresos por', heroTitle2: 'Llamadas Perdidas y Seguimientos Lentos',
    heroSubtitle: 'Recepcionista de IA trabaja 24/7, responde cada llamada al instante, agenda citas y califica prospectos.',
    heroTrusted: 'Más de 2,400 negocios confían en nosotros: Abogados, Dentistas, HVAC, Plomería, Bienes Raíces y más',
    heroEmailPlaceholder: 'Ingresa tu correo de trabajo',
    heroCta: 'Comenzar Prueba Gratis',
    heroTrialNote: 'Prueba gratuita de 14 días • Sin tarjeta de crédito',
    roiAvgRoi: 'ROI Promedio', roiLeadCapture: 'Tasa de Captación', roiMonthlySavings: 'Ahorro Mensual Promedio', roiResponseTime: 'Tiempo de Respuesta',
    industriesTitle: 'Diseñado para', industriesTitleAccent: 'Tu Industria',
    industriesSubtitle: 'Plantillas de Recepcionista IA pre-configuradas para cada industria que servimos.',
    featuresTitle: 'El Más', featuresTitleAccent: 'Avanzado IA',
    featuresSubtitle: 'No es solo una máquina contestadora. Un recepcionista IA completo que maneja todo el recorrido del cliente.',
    howItWorksTitle: 'En Funcionamiento en 48 Horas',
    step1Title: 'Crear Cuenta', step1Desc: 'Regístrate en 2 minutos. Selecciona tu industria para plantillas pre-configuradas.', step1Time: '2 min',
    step2Title: 'Configurar', step2Desc: 'Importa servicios, establece horarios y personaliza la voz de tu IA.', step2Time: '30 min',
    step3Title: 'Lanzar', step3Desc: 'Comienza a recibir llamadas de inmediato. Monitorea desde tu panel.', step3Time: 'Instantáneo',
    testimonialsTitle: 'Resultados Reales de Negocios Reales',
    integrationsTitle: 'Funciona con Tus Herramientas Existentes',
    integrationsSubtitle: 'Integraciones con un clic con el software que ya usas',
    pricingTitle: 'Precios Simples y Transparentes',
    planStarter: 'Inicial', planProfessional: 'Profesional', planEnterprise: 'Empresarial',
    planStarterDesc: 'Perfecto para negocios pequeños', planProfessionalDesc: 'El más popular para negocios en crecimiento', planEnterpriseDesc: 'Para organizaciones que necesitan escala ilimitada',
    planStarterPrice: '$199', planProfessionalPrice: '$399', planEnterprisePrice: '$799',
    planMostPopular: 'MÁS POPULAR',
    featureBasicAi: 'Recepcionista IA Básico', feature100Calls: '100 llamadas/mes', featureEmailSupport: 'Soporte por email', featureBasicAnalytics: 'Analítica básica',
    featureUnlimitedAi: 'Recepcionista IA Ilimitado', feature1000Calls: '1,000 llamadas/mes', featurePrioritySupport: 'Soporte prioritario', featureAdvancedAnalytics: 'Analítica avanzada', featureSmsIntegration: 'Integración SMS', featureVoicemail: 'Buzón de voz',
    featureEverything: 'Todo en Profesional', featureUnlimitedCalls: 'Llamadas ilimitadas', feature247Support: 'Soporte 24/7', featureCustomIntegrations: 'Integraciones personalizadas', featureWhiteLabel: 'Opción white-label', featureDedicatedManager: 'Gerente dedicado',
    pricingTrialNote: 'Todos los planes incluyen prueba gratuita de 14 días • Sin tarjeta de crédito',
    ctaTitle: '¿Listo para Capturar Cada Lead?',
    ctaSubtitle: 'Únete a más de 2,400 negocios que ya usan FrontDesk Agents.',
    ctaStartTrial: 'Comenzar Prueba Gratis', ctaSignIn: 'Iniciar Sesión',
    footerPrivacy: 'Política de Privacidad', footerTerms: 'Términos de Servicio', footerContact: 'Contacto',
    footerCopyright: 'La Plataforma de Recepcionista IA Más Avanzada del Mundo',
    watchDemo: 'Ver Demo',
    indLaw: 'Bufetes de Abogados', indDental: 'Clínicas Dentales', indMedspa: 'Médico Spas', indHvac: 'HVAC', indPlumbing: 'Plomería', indRealEstate: 'Bienes Raíces', indLogistics: 'Logística', indInsurance: 'Seguros',
    indLawStat: '93% de litigantes reportan que llamadas perdidas les costaron casos',
    indDentalStat: '67% de pacientes cambian de dentista por mejor programación',
    indMedspaStat: '$2,400 ingresos perdidos promedio por mes',
    indHvacStat: '50% de emergencias HVAC se reservan en la primera llamada',
    indPlumbingStat: '72% de emergencias de plomería ocurren después de horas',
    indRealEstateStat: '78% de compradores de vivienda trabajan con el primer agente',
    indLogisticsStat: '40% de reducción de costos con despacho IA',
    indInsuranceStat: '35% de leads eligen al primer agente que contacta'
  },
  fr: {
    navIndustries: 'Industries', navFeatures: 'Fonctionnalités', navPricing: 'Tarifs', navDemo: 'Démo', navSignIn: 'Connexion', navStartFree: 'Essai Gratuit',
    heroBadge: 'La Plateforme de Réceptionniste IA la Plus Avancée au Monde',
    heroTitle1: 'Arrêtez de Perdre des Revenus à', heroTitle2: 'Cause d Appels Manqués',
    heroSubtitle: 'Réceptionniste IA travaille 24/7, répond à chaque appel instantanément, prend des rendez-vous et qualifie les prospects.',
    heroTrusted: 'Plus de 2 400 entreprises nous font confiance: Avocats, Dentistes, HVAC, Plomberie, Immobilier et plus',
    heroEmailPlaceholder: 'Entrez votre email professionnel',
    heroCta: 'Commencer l Essai Gratuit',
    heroTrialNote: 'Essai gratuit de 14 jours • Sans carte de crédit',
    roiAvgRoi: 'ROI Moyen', roiLeadCapture: 'Taux de Capture', roiMonthlySavings: 'Économies Mensuelles Moy.', roiResponseTime: 'Temps de Réponse',
    industriesTitle: 'Conçu pour', industriesTitleAccent: 'Votre Industrie',
    industriesSubtitle: 'Modèles de Réceptionniste IA pré-configurés pour chaque industrie que nous servons.',
    featuresTitle: 'Le Plus', featuresTitleAccent: 'IA Avancée',
    featuresSubtitle: 'Pas seulement un répondeur. Un réceptionniste IA complet qui gère l ensemble du parcours client.',
    howItWorksTitle: 'Opérationnel en 48 Heures',
    step1Title: 'Créer un Compte', step1Desc: 'Inscrivez-vous en 2 minutes. Sélectionnez votre industrie pour des modèles pré-configurés.', step1Time: '2 min',
    step2Title: 'Configurer', step2Desc: 'Importez des services, définissez des horaires et personnalisez la voix de votre IA.', step2Time: '30 min',
    step3Title: 'Lancer', step3Desc: 'Commencez à recevoir des appels immédiatement. Surveillez depuis votre tableau de bord.', step3Time: 'Instantané',
    testimonialsTitle: 'Résultats Réels d Entreprises Réelles',
    integrationsTitle: 'Fonctionne avec Vos Outils Existants',
    integrationsSubtitle: 'Intégrations en un clic avec les logiciels que vous utilisez déjà',
    pricingTitle: 'Tarification Simple et Transparente',
    planStarter: 'Starter', planProfessional: 'Professionnel', planEnterprise: 'Entreprise',
    planStarterDesc: 'Parfait pour les petites entreprises', planProfessionalDesc: 'Le plus populaire pour les entreprises en croissance', planEnterpriseDesc: 'Pour les organisations nécessitant une échelle illimitée',
    planStarterPrice: '$199', planProfessionalPrice: '$399', planEnterprisePrice: '$799',
    planMostPopular: 'LE PLUS POPULAIRE',
    featureBasicAi: 'Réceptionniste IA Basique', feature100Calls: '100 appels/mois', featureEmailSupport: 'Support email', featureBasicAnalytics: 'Analytique basique',
    featureUnlimitedAi: 'Réceptionniste IA Illimité', feature1000Calls: '1 000 appels/mois', featurePrioritySupport: 'Support prioritaire', featureAdvancedAnalytics: 'Analytique avancée', featureSmsIntegration: 'Intégration SMS', featureVoicemail: 'Messagerie vocale',
    featureEverything: 'Tout en Professionnel', featureUnlimitedCalls: 'Appels illimités', feature247Support: 'Support 24/7', featureCustomIntegrations: 'Intégrations personnalisées', featureWhiteLabel: 'Options white-label', featureDedicatedManager: 'Gestionnaire dédié',
    pricingTrialNote: 'Tous les plans incluent un essai gratuit de 14 jours • Sans carte de crédit',
    ctaTitle: 'Prêt à Capturer Chaque Lead?',
    ctaSubtitle: 'Rejoignez plus de 2 400 entreprises utilisant déjà FrontDesk Agents.',
    ctaStartTrial: 'Commencer l Essai Gratuit', ctaSignIn: 'Se Connecter',
    footerPrivacy: 'Politique de Confidentialité', footerTerms: 'Conditions d Utilisation', footerContact: 'Contact',
    footerCopyright: 'La Plateforme de Réceptionniste IA la Plus Avancée au Monde',
    watchDemo: 'Voir la Démo',
    indLaw: 'Cabinets d Avocats', indDental: 'Cliniques Dentaires', indMedspa: 'Médico Spas', indHvac: 'CVC', indPlumbing: 'Plomberie', indRealEstate: 'Immobilier', indLogistics: 'Logistique', indInsurance: 'Assurance',
    indLawStat: '93% des plaideurs déclarent que les appels manqués leur ont coûté des affaires',
    indDentalStat: '67% des patients changent de dentiste pour une meilleure planification',
    indMedspaStat: '2 400 $ de revenus manqués en moyenne par mois',
    indHvacStat: '50% des urgences CVC sont réservées au premier appel',
    indPlumbingStat: '72% des urgences de plomberie surviennent après les heures',
    indRealEstateStat: '78% des acheteurs de maison travaillent avec le premier agent',
    indLogisticsStat: '40% de réduction des coûts avec l IA de dispatch',
    indInsuranceStat: '35% des leads choisissent le premier agent à contacter'
  },
  zh: {
    navIndustries: '行业', navFeatures: '功能', navPricing: '价格', navDemo: '演示', navSignIn: '登录', navStartFree: '免费试用',
    heroBadge: '世界上最先进的AI接待员平台',
    heroTitle1: '不再因', heroTitle2: '漏接电话而损失收入',
    heroSubtitle: 'AI接待员全天候工作，立即接听每个电话，预约安排，筛选潜在客户。',
    heroTrusted: '超过2,400家企业信任我们：法律、牙科、HVAC、管道、房地产等',
    heroEmailPlaceholder: '输入您的工作邮箱',
    heroCta: '开始免费试用',
    heroTrialNote: '14天免费试用 • 无需信用卡',
    roiAvgRoi: '平均投资回报率', roiLeadCapture: '潜在客户捕获率', roiMonthlySavings: '平均每月节省', roiResponseTime: '响应时间',
    industriesTitle: '专为', industriesTitleAccent: '您的行业打造',
    industriesSubtitle: '为我们服务的每个行业预配置的AI接待员模板。',
    featuresTitle: '最', featuresTitleAccent: '先进的AI',
    featuresSubtitle: '不仅仅是一台答录机。是一个处理完整客户旅程的AI接待员。',
    howItWorksTitle: '48小时内启动运行',
    step1Title: '创建账户', step1Desc: '2分钟注册。选择您的行业以获取预配置模板。', step1Time: '2分钟',
    step2Title: '配置', step2Desc: '导入服务、设置时间表并自定义您的AI语音。', step2Time: '30分钟',
    step3Title: '上线', step3Desc: '立即开始接听电话。从仪表板监控。', step3Time: '即时',
    testimonialsTitle: '来自真实企业的真实成果',
    integrationsTitle: '与您现有工具配合使用',
    integrationsSubtitle: '与您已使用的软件一键集成',
    pricingTitle: '简单透明的定价',
    planStarter: '入门版', planProfessional: '专业版', planEnterprise: '企业版',
    planStarterDesc: '适合小型企业', planProfessionalDesc: '增长型企业最受欢迎', planEnterpriseDesc: '适合需要无限规模的企业',
    planStarterPrice: '$199', planProfessionalPrice: '$399', planEnterprisePrice: '$799',
    planMostPopular: '最受欢迎',
    featureBasicAi: '基础AI接待员', feature100Calls: '100次通话/月', featureEmailSupport: '邮件支持', featureBasicAnalytics: '基础分析',
    featureUnlimitedAi: '无限AI接待员', feature1000Calls: '1,000次通话/月', featurePrioritySupport: '优先支持', featureAdvancedAnalytics: '高级分析', featureSmsIntegration: '短信集成', featureVoicemail: '语音邮件',
    featureEverything: '专业版全部功能', featureUnlimitedCalls: '无限通话', feature247Support: '24/7支持', featureCustomIntegrations: '自定义集成', featureWhiteLabel: '白标选项', featureDedicatedManager: '专属客户经理',
    pricingTrialNote: '所有计划均包含14天免费试用 • 无需信用卡',
    ctaTitle: '准备好捕获每个潜在客户了吗？',
    ctaSubtitle: '加入已经使用FrontDesk Agents的2,400+家企业。',
    ctaStartTrial: '开始免费试用', ctaSignIn: '登录',
    footerPrivacy: '隐私政策', footerTerms: '服务条款', footerContact: '联系我们',
    footerCopyright: '世界上最先进的AI接待员平台',
    watchDemo: '观看演示',
    indLaw: '律师事务所', indDental: '牙科诊所', indMedspa: '医疗水疗', indHvac: '暖通空调', indPlumbing: '管道服务', indRealEstate: '房地产', indLogistics: '物流', indInsurance: '保险',
    indLawStat: '93%的诉讼人员报告称漏接电话导致他们失去案件',
    indDentalStat: '67%的患者因更好的预约而换牙医',
    indMedspaStat: '平均每月损失$2,400收入',
    indHvacStat: '50%的暖通空调紧急情况在第一个电话中预约',
    indPlumbingStat: '72%的管道紧急情况发生在下班后',
    indRealEstateStat: '78%的购房者选择第一个联系的经纪人',
    indLogisticsStat: 'AI调度降低40%成本',
    indInsuranceStat: '35%的潜在客户选择第一个联系的经纪人'
  },
  hi: {
    navIndustries: 'उद्योग', navFeatures: 'विशेषताएं', navPricing: 'मूल्य निर्धारण', navDemo: 'डेमो', navSignIn: 'साइन इन', navStartFree: 'मुफ्त ट्रायल',
    heroBadge: 'विश्व का सबसे उन्नत AI रिसेप्शनिस्ट प्लेटफॉर्म',
    heroTitle1: 'मिस्ड कॉल्स से', heroTitle2: 'राजस्व खोना बंद करें',
    heroSubtitle: 'AI रिसेप्शनिस्ट 24/7 काम करता है, हर कॉल का तुरंत जवाब देता है, अपॉइंटमेंट बुक करता है और लीड्स क्वालीफाई करता है।',
    heroTrusted: '2,400+ व्यापारों पर भरोसा: कानून, डेंटल, HVAC, प्लंबिंग, रियल एस्टेट और अधिक',
    heroEmailPlaceholder: 'अपना काम ईमेल दर्ज करें',
    heroCta: 'मुफ्त ट्रायल शुरू करें',
    heroTrialNote: '14-दिन का मुफ्त ट्रायल • कोई क्रेडिट कार्ड नहीं',
    roiAvgRoi: 'औसत ROI', roiLeadCapture: 'लीड कैप्चर दर', roiMonthlySavings: 'औसत मासिक बचत', roiResponseTime: 'प्रतिक्रिया समय',
    industriesTitle: 'बनाया गया', industriesTitleAccent: 'आपके उद्योग के लिए',
    industriesSubtitle: 'हर उद्योग के लिए पूर्व-कॉन्फ़िगर किए गए AI रिसेप्शनिस्ट टेम्पलेट।',
    featuresTitle: 'सबसे', featuresTitleAccent: 'उन्नत AI',
    featuresSubtitle: 'बस एक उत्तर देने वाली मशीन नहीं। एक पूर्ण AI रिसेप्शनिस्ट जो पूरे ग्राहक यात्रा को संभालता है।',
    howItWorksTitle: '48 घंटे में चालू',
    step1Title: 'खाता बनाएं', step1Desc: '2 मिनट में साइन अप करें। पूर्व-कॉन्फ़िगर किए गए टेम्पलेट के लिए अपना उद्योग चुनें।', step1Time: '2 मिनट',
    step2Title: 'कॉन्फ़िगर करें', step2Desc: 'सेवाएं आयात करें, शेड्यूल सेट करें और अपने AI वॉइस को कस्टमाइज करें।', step2Time: '30 मिनट',
    step3Title: 'लाइव करें', step3Desc: 'तुरंत कॉल प्राप्त करना शुरू करें। अपने डैशबोर्ड से मॉनिटर करें।', step3Time: 'तुरंत',
    testimonialsTitle: 'असली व्यापारों से असली नतीजे',
    integrationsTitle: 'आपके मौजूदा टूल्स के साथ काम करता है',
    integrationsSubtitle: 'जिस सॉफ्टवेयर का आप पहले से उपयोग कर रहे हैं उसके साथ वन-क्लिक इंटीग्रेशन',
    pricingTitle: 'सरल, पारदर्शी मूल्य निर्धारण',
    planStarter: 'स्टार्टर', planProfessional: 'प्रोफेशनल', planEnterprise: 'एंटरप्राइज',
    planStarterDesc: 'छोटे व्यापारों के लिए परफेक्ट', planProfessionalDesc: 'बढ़ते व्यापारों के लिए सबसे लोकप्रिय', planEnterpriseDesc: 'असीमित स्केल की जरूरत वाले संगठनों के लिए',
    planStarterPrice: '$199', planProfessionalPrice: '$399', planEnterprisePrice: '$799',
    planMostPopular: 'सबसे लोकप्रिय',
    featureBasicAi: 'बेसिक AI रिसेप्शनिस्ट', feature100Calls: '100 कॉल/महीना', featureEmailSupport: 'ईमेल सपोर्ट', featureBasicAnalytics: 'बेसिक एनालिटिक्स',
    featureUnlimitedAi: 'अनलिमिटेड AI रिसेप्शनिस्ट', feature1000Calls: '1,000 कॉल/महीना', featurePrioritySupport: 'प्रायोरिटी सपोर्ट', featureAdvancedAnalytics: 'एडवांस्ड एनालिटिक्स', featureSmsIntegration: 'SMS इंटीग्रेशन', featureVoicemail: 'वॉइस मेल',
    featureEverything: 'प्रोफेशनल में सब कुछ', featureUnlimitedCalls: 'अनलिमिटेड कॉल', feature247Support: '24/7 सपोर्ट', featureCustomIntegrations: 'कस्टम इंटीग्रेशन', featureWhiteLabel: 'व्हाइट-लेबल विकल्प', featureDedicatedManager: 'डेडिकेटेड अकाउंट मैनेजर',
    pricingTrialNote: 'सभी प्लान में 14-दिन का मुफ्त ट्रायल • कोई क्रेडिट कार्ड नहीं',
    ctaTitle: 'हर लीड को कैप्चर करने के लिए तैयार?',
    ctaSubtitle: '2,400+ व्यापारों से जुड़ें जो पहले से FrontDesk Agents का उपयोग कर रहे हैं।',
    ctaStartTrial: 'मुफ्त ट्रायल शुरू करें', ctaSignIn: 'साइन इन',
    footerPrivacy: 'प्राइवेसी पॉलिसी', footerTerms: 'सर्विस की शर्तें', footerContact: 'संपर्क करें',
    footerCopyright: 'विश्व का सबसे उन्नत AI रिसेप्शनिस्ट प्लेटफॉर्म',
    watchDemo: 'डेमो देखें',
    indLaw: 'लॉ फर्म्स', indDental: 'डेंटल क्लिनिक्स', indMedspa: 'मेड स्पास', indHvac: 'HVAC', indPlumbing: 'प्लंबिंग', indRealEstate: 'रियल एस्टेट', indLogistics: 'लॉजिस्टिक्स', indInsurance: 'इंश्योरेंस',
    indLawStat: '93% वकीलों की रिपोर्ट में मिस्ड कॉल से केस खोने की बात',
    indDentalStat: '67% मरीज बेहतर शेड्यूलिंग के लिए डेंटिस्ट बदलती हैं',
    indMedspaStat: 'प्रति महीना औसत $2,400 राजस्व खोना',
    indHvacStat: '50% HVAC इमरजेंसी पहली कॉल पर बुक होती हैं',
    indPlumbingStat: '72% प्लंबिंग इमरजेंसी शाम के बाद होती हैं',
    indRealEstateStat: '78% घर खरीदने वाले पहले एजेंट के साथ काम करते हैं',
    indLogisticsStat: 'AI डिस्पैच से 40% लागत में कमी',
    indInsuranceStat: '35% लीड पहले संपर्क करने वाले एजेंट को चुनते हैं'
  },
  ar: {
    navIndustries: 'القطاعات', navFeatures: 'الميزات', navPricing: 'التسعير', navDemo: 'العرض', navSignIn: 'تسجيل الدخول', navStartFree: 'تجربة مجانية',
    heroBadge: 'منصة مسؤول الاستقبال الأكثر تطوراً في العالم',
    heroTitle1: 'توقف عن فقدان الإيرادات بسبب', heroTitle2: 'المكالمات الفائتة',
    heroSubtitle: 'موظف استقبال الذكاء الاصطناعي يعمل على مدار الساعة ، يجيب على كل مكالمة فورًا ، يحجز المواعيد ويفحص العملاء المحتملين',
    heroTrusted: 'يثق بنا أكثر من 2,400 شركة: المحامون ، أطباء الأسنان ، HVAC ، السباكة ، العقارات والمزيد',
    heroEmailPlaceholder: 'أدخل بريدك الإلكتروني للعمل',
    heroCta: 'ابدأ التجربة المجانية',
    heroTrialNote: 'تجربة مجانية لمدة 14 يومًا • لا بطاقة ائتمان',
    roiAvgRoi: 'متوسط العائد', roiLeadCapture: 'معدل捕获 العملاء', roiMonthlySavings: 'متوسط التوفير الشهري', roiResponseTime: 'وقت الاستجابة',
    industriesTitle: 'مصمم لـ', industriesTitleAccent: 'قطاعك',
    industriesSubtitle: 'قوالب موظف استقبال الذكاء الاصطناعي المُعدّة مسبقًا لكل قطاع نخدمه.',
    featuresTitle: 'الأكثر', featuresTitleAccent: 'ذكاءً اصطناعيًا متقدمًا',
    featuresSubtitle: 'ليس مجرد آلة رد. موظف استقبال ذكاء اصطناعي كامل يتعامل مع رحلة العميل الكاملة.',
    howItWorksTitle: 'جاهز خلال 48 ساعة',
    step1Title: 'إنشاء حساب', step1Desc: 'سجّل في دقيقتين. اختر قطاعك للقوالب المُعدّة مسبقًا.', step1Time: '2 دقيقة',
    step2Title: 'تكوين', step2Desc: 'استورد الخدمات واضبط الجداول وخصص صوت الذكاء الاصطناعي الخاص بك.', step2Time: '30 دقيقة',
    step3Title: 'بدء', step3Desc: 'ابدأ استقبال المكالمات فورًا.راقب من لوحة التحكم.', step3Time: 'فوري',
    testimonialsTitle: 'نتائج حقيقية من شركات حقيقية',
    integrationsTitle: 'يعمل مع أدواتك الموجودة',
    integrationsSubtitle: 'تكاملات بنقرة واحدة مع البرنامج الذي تستخدمه بالفعل',
    pricingTitle: 'تسعير بسيط وشفاف',
    planStarter: 'المبتدئ', planProfessional: 'المحترف', planEnterprise: 'المؤسسات',
    planStarterDesc: 'مثالي للشركات الصغيرة', planProfessionalDesc: 'الأكثر شعبية للشركات المتنامية', planEnterpriseDesc: 'للمؤسسات التي تحتاج إلى نطاق غير محدود',
    planStarterPrice: '$199', planProfessionalPrice: '$399', planEnterprisePrice: '$799',
    planMostPopular: 'الأكثر شعبية',
    featureBasicAi: 'موظف استقبال ذكاء اصطناعي أساسي', feature100Calls: '100 مكالمة/شهر', featureEmailSupport: 'دعم البريد الإلكتروني', featureBasicAnalytics: 'تحليلات أساسية',
    featureUnlimitedAi: 'موظف استقبال ذكاء اصطناعي غير محدود', feature1000Calls: '1,000 مكالمة/شهر', featurePrioritySupport: 'دعم أولوي', featureAdvancedAnalytics: 'تحليلات متقدمة', featureSmsIntegration: 'تكامل الرسائل النصية', featureVoicemail: 'البريد الصوتي',
    featureEverything: 'كل شيء في المحترف', featureUnlimitedCalls: 'مكالمات غير محدودة', feature247Support: 'دعم على مدار الساعة', featureCustomIntegrations: 'تكاملات مخصصة', featureWhiteLabel: 'خيارات العلامة البيضاء', featureDedicatedManager: 'مدير حساب مخصص',
    pricingTrialNote: 'جميع الخطط تشمل تجربة مجانية لمدة 14 يومًا • لا بطاقة ائتمان',
    ctaTitle: 'هل أنت مستعد لالتقاط كل عميل محتمل؟',
    ctaSubtitle: 'انضم إلى أكثر من 2,400 شركة تستخدم FrontDesk Agents بالفعل.',
    ctaStartTrial: 'ابدأ التجربة المجانية', ctaSignIn: 'تسجيل الدخول',
    footerPrivacy: 'سياسة الخصوصية', footerTerms: 'شروط الخدمة', footerContact: 'اتصل بنا',
    footerCopyright: 'منصة مسؤول الاستقبال الأكثر تطوراً في العالم',
    watchDemo: 'مشاهدة العرض',
    indLaw: 'مكاتب المحاماة', indDental: 'عيادات طب الأسنان', indMedspa: 'المنتجعات الطبية', indHvac: 'التدفئة والتهوية وتكييف الهواء', indPlumbing: 'السباكة', indRealEstate: 'العقارات', indLogistics: 'اللوجستيات', indInsurance: 'التأمين',
    indLawStat: '93٪ من المحامين أفادوا أن المكالمات الفائتة كلفتهم قضايا',
    indDentalStat: '67٪ من المرضى يغيرون أطباء الأسنان للحصول على جدولة أفضل',
    indMedspaStat: 'متوسط فقدان الإيرادات $2,400 شهريًا',
    indHvacStat: '50٪ من حالات طوارئ HVAC يتم حجزها في المكالمة الأولى',
    indPlumbingStat: '72٪ من حالات طوارئ السباكة تحدث بعد ساعات العمل',
    indRealEstateStat: '78٪ من مشتري المنازل يعملون مع الوكيل الأول',
    indLogisticsStat: 'انخفاض التكاليف 40٪ مع الذكاء الاصطناعي للإرسال',
    indInsuranceStat: '35٪ من العملاء المحتملين يختارون الوكيل الذي يتصل أولاً'
  },
  pt: {
    navIndustries: 'Indústrias', navFeatures: 'Recursos', navPricing: 'Preços', navDemo: 'Demo', navSignIn: 'Entrar', navStartFree: 'Teste Grátis',
    heroBadge: 'A Plataforma de Recepcionista de IA Mais Avançada do Mundo',
    heroTitle1: 'Pare de Perder Receita com', heroTitle2: 'Chamadas Perdidas',
    heroSubtitle: 'Recepcionista de IA trabalha 24/7, responde cada chamada instantaneamente, agenda compromissos e qualifica leads.',
    heroTrusted: 'Mais de 2.400 empresas confiam em nós: Advocacia, Odontologia, HVAC, Encanamento, Imobiliário e mais',
    heroEmailPlaceholder: 'Digite seu email profissional',
    heroCta: 'Começar Teste Grátis',
    heroTrialNote: 'Teste gratuito de 14 dias • Sem cartão de crédito',
    roiAvgRoi: 'ROI Médio', roiLeadCapture: 'Taxa de Captura', roiMonthlySavings: 'Economia Mensal Média', roiResponseTime: 'Tempo de Resposta',
    industriesTitle: 'Feito para', industriesTitleAccent: 'Sua Indústria',
    industriesSubtitle: 'Modelos de Recepcionista de IA pré-configurados para cada indústria que servimos.',
    featuresTitle: 'O Mais', featuresTitleAccent: 'IA Avançada',
    featuresSubtitle: 'Não é apenas uma máquina de atendimento. Um recepcionista de IA completo que cuida de toda a jornada do cliente.',
    howItWorksTitle: 'Funcionando em 48 Horas',
    step1Title: 'Criar Conta', step1Desc: 'Cadastre-se em 2 minutos. Selecione sua indústria para modelos pré-configurados.', step1Time: '2 min',
    step2Title: 'Configurar', step2Desc: 'Importe serviços, defina horários e personalize a voz da sua IA.', step2Time: '30 min',
    step3Title: 'Ir ao Ar', step3Desc: 'Comece a receber chamadas imediatamente. Monitore pelo seu painel.', step3Time: 'Instantâneo',
    testimonialsTitle: 'Resultados Reais de Empresas Reais',
    integrationsTitle: 'Funciona com Suas Ferramentas Existentes',
    integrationsSubtitle: 'Integrações com um clique com o software que você já usa',
    pricingTitle: 'Preços Simples e Transparentes',
    planStarter: 'Inicial', planProfessional: 'Profissional', planEnterprise: 'Empresarial',
    planStarterDesc: 'Perfeito para pequenas empresas', planProfessionalDesc: 'O mais popular para empresas em crescimento', planEnterpriseDesc: 'Para organizações que precisam de escala ilimitada',
    planStarterPrice: '$199', planProfessionalPrice: '$399', planEnterprisePrice: '$799',
    planMostPopular: 'MAIS POPULAR',
    featureBasicAi: 'Recepcionista de IA Básico', feature100Calls: '100 chamadas/mês', featureEmailSupport: 'Suporte por email', featureBasicAnalytics: 'Analítica básica',
    featureUnlimitedAi: 'Recepcionista de IA Ilimitado', feature1000Calls: '1.000 chamadas/mês', featurePrioritySupport: 'Suporte prioritário', featureAdvancedAnalytics: 'Analítica avançada', featureSmsIntegration: 'Integração SMS', featureVoicemail: 'Correio de voz',
    featureEverything: 'Tudo no Profissional', featureUnlimitedCalls: 'Chamadas ilimitadas', feature247Support: 'Suporte 24/7', featureCustomIntegrations: 'Integrações personalizadas', featureWhiteLabel: 'Opções white-label', featureDedicatedManager: 'Gerente dedicado',
    pricingTrialNote: 'Todos os planos incluem teste gratuito de 14 dias • Sem cartão de crédito',
    ctaTitle: 'Pronto para Capturar Cada Lead?',
    ctaSubtitle: 'Junte-se a mais de 2.400 empresas já usando FrontDesk Agents.',
    ctaStartTrial: 'Começar Teste Grátis', ctaSignIn: 'Entrar',
    footerPrivacy: 'Política de Privacidade', footerTerms: 'Termos de Serviço', footerContact: 'Contato',
    footerCopyright: 'A Plataforma de Recepcionista de IA Mais Avançada do Mundo',
    watchDemo: 'Ver Demo',
    indLaw: 'Escritórios de Advocacia', indDental: 'Clínicas Odontológicas', indMedspa: 'Médico Spas', indHvac: 'HVAC', indPlumbing: 'Encanamento', indRealEstate: 'Imobiliário', indLogistics: 'Logística', indInsurance: 'Seguro',
    indLawStat: '93% dos litigantes relatam que chamadas perdidas lhes custaram casos',
    indDentalStat: '67% dos pacientes mudam de dentista por melhor agendamento',
    indMedspaStat: 'Média de $2.400 de receita perdida por mês',
    indHvacStat: '50% das emergências HVAC são reservadas na primeira chamada',
    indPlumbingStat: '72% das emergências de encanamento acontecem após o expediente',
    indRealEstateStat: '78% dos compradores de imóvel trabalham com o primeiro agente',
    indLogisticsStat: '40% de redução de custos com despacho IA',
    indInsuranceStat: '35% dos leads escolhem o primeiro agente a contatar'
  },
  ko: {
    navIndustries: '업종', navFeatures: '기능', navPricing: '가격', navDemo: '데모', navSignIn: '로그인', navStartFree: '무료 체험',
    heroBadge: '세계에서 가장 진보된 AI 리셉셔니스트 플랫폼',
    heroTitle1: '누락된 전화와 느린 후속으로', heroTitle2: '수익 손실을 중단하세요',
    heroSubtitle: 'AI 리셉셔니스트가 24/7 근무하며 모든 전화를 즉시 응대하고 약속을 잡으며 잠재 고객을 자격화합니다.',
    heroTrusted: '2,400개 이상의 비즈니스가 신뢰: 법률, 치과, HVAC, 배관, 부동산 등',
    heroEmailPlaceholder: '업무용 이메일 입력',
    heroCta: '무료 체험 시작',
    heroTrialNote: '14일 무료 체험 • 신용카드 필요 없음',
    roiAvgRoi: '평균 ROI', roiLeadCapture: '리드 캡처율', roiMonthlySavings: '평균 월 savings', roiResponseTime: '응답 시간',
    industriesTitle: '특화', industriesTitleAccent: '귀하의 업종용',
    industriesSubtitle: '서비스하는 각 업종에 대해 사전 구성된 AI 리셉셔니스트 템플릿.',
    featuresTitle: '가장', featuresTitleAccent: '진보된 AI',
    featuresSubtitle: '답변 머신이 아닙니다. 전체 고객 여정을 처리하는 완전한 AI 리셉셔니스트입니다.',
    howItWorksTitle: '48시간 내에 운영 시작',
    step1Title: '계정 생성', step1Desc: '2분 만에 가입. 사전 구성된 템플릿을 위해 업종을 선택하세요.', step1Time: '2분',
    step2Title: '구성', step2Desc: '서비스를 가져오고 일정을 설정하며 AI 음성을 커스터마이즈하세요.', step2Time: '30분',
    step3Title: '런칭', step3Desc: '즉시 전화를 받기 시작하세요. 대시보드에서 모니터링.', step3Time: '즉시',
    testimonialsTitle: '실제 비즈니스의 실제 결과',
    integrationsTitle: '기존 도구와 연동',
    integrationsSubtitle: '이미 사용 중인 소프트웨어와 원클릭 통합',
    pricingTitle: '단순하고 투명한 가격',
    planStarter: '스타터', planProfessional: '프로페셔널', planEnterprise: '엔터프라이즈',
    planStarterDesc: '소규모 비즈니스를 위한 완벽한 선택', planProfessionalDesc: '성장 비즈니스를 위한 가장 인기 있는 선택', planEnterpriseDesc: '무제한 확장이 필요한 조직용',
    planStarterPrice: '$199', planProfessionalPrice: '$399', planEnterprisePrice: '$799',
    planMostPopular: '가장 인기',
    featureBasicAi: '기본 AI 리셉셔니스트', feature100Calls: '100회 전화/월', featureEmailSupport: '이메일 지원', featureBasicAnalytics: '기본 분석',
    featureUnlimitedAi: '무제한 AI 리셉셔니스트', feature1000Calls: '1,000회 전화/월', featurePrioritySupport: '우선 지원', featureAdvancedAnalytics: '고급 분석', featureSmsIntegration: 'SMS 통합', featureVoicemail: '음성메일',
    featureEverything: '프로페셔널의 모든 기능', featureUnlimitedCalls: '무제한 전화', feature247Support: '24/7 지원', featureCustomIntegrations: '사용자 정의 통합', featureWhiteLabel: '화이트 레이블 옵션', featureDedicatedManager: '전담 매니저',
    pricingTrialNote: '모든 플랜에 14일 무료 체험 포함 • 신용카드 필요 없음',
    ctaTitle: '모든 리드를 캡처할 준비가 되셨나요?',
    ctaSubtitle: '이미 FrontDesk Agents를 사용 중인 2,400개 이상의 비즈니스가 합류하세요.',
    ctaStartTrial: '무료 체험 시작', ctaSignIn: '로그인',
    footerPrivacy: '개인정보 보호정책', footerTerms: '서비스 약관', footerContact: '문의하기',
    footerCopyright: '세계에서 가장 진보된 AI 리셉셔니스트 플랫폼',
    watchDemo: '데모观看',
    indLaw: '법률 사무소', indDental: '치과 클리닉', indMedspa: '메디 스파', indHvac: 'HVAC', indPlumbing: '배관', indRealEstate: '부동산', indLogistics: '물류', indInsurance: '보험',
    indLawStat: '93%의訴訟인들이 누락된 전화를 통해案件을 잃었다고 보고',
    indDentalStat: '67%의 환자들이更好的 예약을 위해 치과를 변경',
    indMedspaStat: '월평균 $2,400의 수익 손실',
    indHvacStat: '50%의 HVAC 긴급 상황이 첫 전화로 예약됨',
    indPlumbingStat: '72%의 배관 긴급 상황이 야간에 발생',
    indRealEstateStat: '78%의 홈 구매자가 첫 번째 에이전트와 협력',
    indLogisticsStat: 'AI 디스패치로 40% 비용 절감',
    indInsuranceStat: '35%의 리드가 첫 번째 연락한 에이전트를 선택'
  },
  ja: {
    navIndustries: '業種', navFeatures: '機能', navPricing: '料金', navDemo: 'デモ', navSignIn: 'ログイン', navStartFree: '無料トライアル',
    heroBadge: '世界で最も先进的なAI受付プラットフォーム',
    heroTitle1: '不在着信と遅いフォローアップで', heroTitle2: '収益を失うことを止める',
    heroSubtitle: 'AI受付は24/7で動作し、すべての電話に即座に応答し、予定を組み、リードを資格付けします。',
    heroTrusted: '2,400社以上のビジネスから信頼：法律、歯科、HVAC、配管、不動産など',
    heroEmailPlaceholder: 'ビジネスメールアドレスを入力',
    heroCta: '無料トライアルを開始',
    heroTrialNote: '14日間無料 • クレジットカード不要',
    roiAvgRoi: '平均ROI', roiLeadCapture: 'リード捕捉率', roiMonthlySavings: '平均月間 savings', roiResponseTime: '応答時間',
    industriesTitle: ' 전용', industriesTitleAccent: 'お客様の業種',
    industriesSubtitle: 'サービス提供する各業種向けの事前構成済みAI受付テンプレート。',
    featuresTitle: '最も', featuresTitleAccent: '先进的なAI',
    featuresSubtitle: '単なる応答機ではありません。完全な顧客ジャーニーを処理するAI受付です。',
    howItWorksTitle: '48時間以内に稼働',
    step1Title: 'アカウント作成', step1Desc: '2分でサインアップ。事前構成済みテンプレートのため業種を選択。', step1Time: '2分',
    step2Title: '構成', step2Desc: 'サービスをインポートし、スケジュールを設定し、AI声をカスタマイズ。', step2Time: '30分',
    step3Title: '起動', step3Desc: 'すぐに電話を受け始めます。ダッシュボードから監視。', step3Time: '即時',
    testimonialsTitle: '実際のビジネスからの実際の結果',
    integrationsTitle: '既存のツールと連携',
    integrationsSubtitle: 'すでに使用しているソフトウェアとのワンクリック統合',
    pricingTitle: 'シンプル透明的価格設定',
    planStarter: 'スターター', planProfessional: 'プロフェッショナル', planEnterprise: 'エンタープライズ',
    planStarterDesc: '小規模ビジネスに最適', planProfessionalDesc: '成長ビジネスに最も人気', planEnterpriseDesc: '無制限スケールが必要な組織向け',
    planStarterPrice: '$199', planProfessionalPrice: '$399', planEnterprisePrice: '$799',
    planMostPopular: '最も人気',
    featureBasicAi: '基本AI受付', feature100Calls: '100回電話/月', featureEmailSupport: 'メールサポート', featureBasicAnalytics: '基本分析',
    featureUnlimitedAi: '無制限AI受付', feature1000Calls: '1,000回電話/月', featurePrioritySupport: '優先サポート', featureAdvancedAnalytics: '高度な分析', featureSmsIntegration: 'SMS統合', featureVoicemail: 'ボイスメール',
    featureEverything: 'プロフェッショナル全員', featureUnlimitedCalls: '無制限電話', feature247Support: '24/7サポート', featureCustomIntegrations: 'カスタム統合', featureWhiteLabel: 'ホワイトラベルオプション', featureDedicatedManager: '専任マネージャー',
    pricingTrialNote: '全プランに14日間無料トライアル付 • クレジットカード不要',
    ctaTitle: 'すべてのリードを捕捉する準備ができましたか？',
    ctaSubtitle: 'すでにFrontDesk Agentsを使用している2,400社以上のビジネスに参加하세요。',
    ctaStartTrial: '無料トライアルを開始', ctaSignIn: 'ログイン',
    footerPrivacy: 'プライバシーポリシー', footerTerms: '利用規約', footerContact: 'お問い合わせ',
    footerCopyright: '世界で最も先进的なAI受付プラットフォーム',
    watchDemo: 'デモ观看',
    indLaw: '律师事务所', indDental: '歯科クリニック', indMedspa: 'メディスパ', indHvac: 'HVAC', indPlumbing: '配管', indRealEstate: '不動産', indLogistics: '物流', indInsurance: '保険',
    indLawStat: '93%の訴訟担当者が不在着信で案件を失ったと報告',
    indDentalStat: '67%の患者がより良い予約のためにDentistを変更',
    indMedspaStat: '月間平均$2,400の収益損失',
    indHvacStat: '50%のHVAC緊急が最初の電話で予約される',
    indPlumbingStat: '72%の配管緊急が時間後に発生',
    indRealEstateStat: '78%の住宅購入者が最初のエージェントと連携',
    indLogisticsStat: 'AI配送で40%のコスト削減',
    indInsuranceStat: '35%的リードが最初 CONTACTしたエージェントを選択'
  },
  vi: {
    navIndustries: 'Ngành', navFeatures: 'Tính năng', navPricing: 'Bảng giá', navDemo: 'Demo', navSignIn: 'Đăng nhập', navStartFree: 'Dùng thử miễn phí',
    heroBadge: 'Nền tảng Lễ tân AI tiên tiến nhất thế giới',
    heroTitle1: 'Ngừng Mất Doanh Thu vì', heroTitle2: 'Cuộc Gọi Nhỡ',
    heroSubtitle: 'Lễ tân AI làm việc 24/7, trả lời mọi cuộc gọi ngay lập tức, đặt lịch hẹn và xác nhận khách hàng tiềm năng.',
    heroTrusted: 'Hơn 2.400 doanh nghiệp tin tưởng: Luật, Nha khoa, HVAC, Ống nước, Bất động sản và hơn thế',
    heroEmailPlaceholder: 'Nhập email công việc của bạn',
    heroCta: 'Bắt Đầu Dùng Thử Miễn Phí',
    heroTrialNote: 'Dùng thử miễn phí 14 ngày • Không cần thẻ tín dụng',
    roiAvgRoi: 'ROI Trung Bình', roiLeadCapture: 'Tỷ Lệ capture', roiMonthlySavings: 'Tiết Kiệm Trung Bình Hàng Tháng', roiResponseTime: 'Thời Gian Phản Hồi',
    industriesTitle: 'Được Xây Dựng cho', industriesTitleAccent: 'Ngành của Bạn',
    industriesSubtitle: 'Mẫu Lễ tân AI được cấu hình sẵn cho từng ngành chúng tôi phục vụ.',
    featuresTitle: 'AI', featuresTitleAccent: 'Tiên Tiến Nhất',
    featuresSubtitle: 'Không chỉ là máy trả lời. Một lễ tân AI hoàn chỉnh xử lý toàn bộ hành trình khách hàng.',
    howItWorksTitle: 'Hoạt Động trong 48 Giờ',
    step1Title: 'Tạo Tài Khoản', step1Desc: 'Đăng ký trong 2 phút. Chọn ngành của bạn để có mẫu được cấu hình sẵn.', step1Time: '2 phút',
    step2Title: 'Cấu Hình', step2Desc: 'Nhập dịch vụ, đặt lịch và tùy chỉnh giọng AI của bạn.', step2Time: '30 phút',
    step3Title: 'Khởi Chạy', step3Desc: 'Bắt đầu nhận cuộc gọi ngay lập tức. Theo dõi từ bảng điều khiển.', step3Time: 'Tức thì',
    testimonialsTitle: 'Kết Quả Thực từ Doanh Nghiệp Thực',
    integrationsTitle: 'Hoạt Động với Công Cụ Hiện Có của Bạn',
    integrationsSubtitle: 'Tích hợp một cú nhấp chuột với phần mềm bạn đã sử dụng',
    pricingTitle: 'Giá Cả Đơn Giản, Minh Bạch',
    planStarter: 'Starter', planProfessional: 'Professional', planEnterprise: 'Enterprise',
    planStarterDesc: 'Hoàn hảo cho doanh nghiệp nhỏ', planProfessionalDesc: 'Phổ biến nhất cho doanh nghiệp đang phát triển', planEnterpriseDesc: 'Cho tổ chức cần quy mô không giới hạn',
    planStarterPrice: '$199', planProfessionalPrice: '$399', planEnterprisePrice: '$799',
    planMostPopular: 'PHỔ BIẾN NHẤT',
    featureBasicAi: 'Lễ tân AI Cơ bản', feature100Calls: '100 cuộc gọi/tháng', featureEmailSupport: 'Hỗ trợ email', featureBasicAnalytics: 'Phân tích cơ bản',
    featureUnlimitedAi: 'Lễ tân AI Không giới hạn', feature1000Calls: '1.000 cuộc gọi/tháng', featurePrioritySupport: 'Hỗ trợ ưu tiên', featureAdvancedAnalytics: 'Phân tích nâng cao', featureSmsIntegration: 'Tích hợp SMS', featureVoicemail: 'Hộp thư thoại',
    featureEverything: 'Mọi thứ trong Professional', featureUnlimitedCalls: 'Cuộc gọi không giới hạn', feature247Support: 'Hỗ trợ 24/7', featureCustomIntegrations: 'Tích hợp tùy chỉnh', featureWhiteLabel: 'Tùy chọn white-label', featureDedicatedManager: 'Quản lý tài khoản chuyên dụng',
    pricingTrialNote: 'Tất cả các gói đều bao gồm dùng thử miễn phí 14 ngày • Không cần thẻ tín dụng',
    ctaTitle: 'Sẵn sàng capture Mọi Lead?',
    ctaSubtitle: 'Tham gia cùng hơn 2.400 doanh nghiệp đã sử dụng FrontDesk Agents.',
    ctaStartTrial: 'Bắt Đầu Dùng Thử Miễn Phí', ctaSignIn: 'Đăng nhập',
    footerPrivacy: 'Chính sách Bảo mật', footerTerms: 'Điều khoản Dịch vụ', footerContact: 'Liên hệ',
    footerCopyright: 'Nền tảng Lễ tân AI tiên tiến nhất thế giới',
    watchDemo: 'Xem Demo',
    indLaw: 'Văn phòng Luật', indDental: 'Phòng khám Nha khoa', indMedspa: 'Med Spas', indHvac: 'HVAC', indPlumbing: 'Ống nước', indRealEstate: 'Bất động sản', indLogistics: 'Hậu cần', indInsurance: 'Bảo hiểm',
    indLawStat: '93% luật sư báo cáo mất khách hàng vì cuộc gọi nhỡ',
    indDentalStat: '67% bệnh nhân đổi nha sĩ vì lịch hẹn tốt hơn',
    indMedspaStat: 'Trung bình $2.400 doanh thu bị miss mỗi tháng',
    indHvacStat: '50% khẩn cấp HVAC được đặt ở cuộc gọi đầu tiên',
    indPlumbingStat: '72% khẩn cấp ống nước xảy ra sau giờ làm',
    indRealEstateStat: '78% người mua nhà làm việc với đại lý đầu tiên',
    indLogisticsStat: 'Giảm 40% chi phí với AI điều phối',
    indInsuranceStat: '35% lead chọn đại lý liên hệ đầu tiên'
  },
  tl: {
    navIndustries: 'Mga Industriya', navFeatures: 'Mga Tampok', navPricing: 'Pagpe-presyo', navDemo: 'Demo', navSignIn: 'Mag-sign In', navStartFree: 'Simulan ang Libreng Trial',
    heroBadge: 'Ang Pinaka-advanced na AI Receptionist Platform sa Mundo',
    heroTitle1: 'Itigil ang Pagkawala ng Kita sa', heroTitle2: 'Mga Missed Call',
    heroSubtitle: 'Ang AI receptionist ay nagtatrabaho 24/7, sumasagot sa bawat tawag kaagad, nagpe-preschedule at nag-qualify ng leads.',
    heroTrusted: 'Nagtitiwala ang 2,400+ na negosyo sa amin: Law, Dental, HVAC, Plumbing, Real Estate at higit pa',
    heroEmailPlaceholder: 'Ilagay ang iyong work email',
    heroCta: 'Simulan ang Libreng Trial',
    heroTrialNote: '14-araw na libreng trial • Walang credit card kinakailangan',
    roiAvgRoi: 'Average na ROI', roiLeadCapture: 'Lead Capture Rate', roiMonthlySavings: 'Average na Monthly Savings', roiResponseTime: 'Oras ng Pagtugon',
    industriesTitle: 'Built para sa', industriesTitleAccent: 'Iyong Industriya',
    industriesSubtitle: 'Pre-configured na AI Receptionist templates para sa bawat industriya na aming served.',
    featuresTitle: 'Ang Pinaka', featuresTitleAccent: 'Advanced na AI',
    featuresSubtitle: 'Hindi lang isang answering machine. Isang kumpletong AI receptionist na humahawak ng buong customer journey.',
    howItWorksTitle: 'Gumana sa loob ng 48 oras',
    step1Title: 'Gumawa ng Account', step1Desc: 'Mag-sign up sa 2 minuto. Pumili ng iyong industriya para sa pre-configured templates.', step1Time: '2 min',
    step2Title: 'I-configure', step2Desc: 'Mag-import ng services, mag-set ng schedules, at i-customize ang AI voice mo.', step2Time: '30 min',
    step3Title: 'Mag-live', step3Desc: 'Simulan agad ang pagtanggap ng mga tawag. Subaybayan mula sa iyong dashboard.', step3Time: 'Agad',
    testimonialsTitle: 'Totoong Results mula sa Totoong Negosyo',
    integrationsTitle: 'Gumagana sa Iyong Mga Kasalukuyang Tool',
    integrationsSubtitle: 'One-click integrations sa software na ginagamit mo na',
    pricingTitle: 'Simple, Transparent na Pagpe-presyo',
    planStarter: 'Starter', planProfessional: 'Professional', planEnterprise: 'Enterprise',
    planStarterDesc: 'Perpekto para sa maliit na negosyo', planProfessionalDesc: 'Pinaka-popular para sa growing na negosyo', planEnterpriseDesc: 'Para sa organizations na kailangan ng unlimited scale',
    planStarterPrice: '$199', planProfessionalPrice: '$399', planEnterprisePrice: '$799',
    planMostPopular: 'PINAKA-POPULAR',
    featureBasicAi: 'Basic AI Receptionist', feature100Calls: '100 calls/buwan', featureEmailSupport: 'Email support', featureBasicAnalytics: 'Basic analytics',
    featureUnlimitedAi: 'Unlimited AI Receptionist', feature1000Calls: '1,000 calls/buwan', featurePrioritySupport: 'Priority support', featureAdvancedAnalytics: 'Advanced analytics', featureSmsIntegration: 'SMS integration', featureVoicemail: 'Voicemail',
    featureEverything: 'Everything sa Professional', featureUnlimitedCalls: 'Unlimited calls', feature247Support: '24/7 Support', featureCustomIntegrations: 'Custom integrations', featureWhiteLabel: 'White-label options', featureDedicatedManager: 'Dedicated account manager',
    pricingTrialNote: 'All plans kasama ang 14-araw na libreng trial • Walang credit card kinakailangan',
    ctaTitle: 'Handa na ba Kunin ang Bawat Lead?',
    ctaSubtitle: 'Sumali sa 2,400+ na negosyo na gumagamit na ng FrontDesk Agents.',
    ctaStartTrial: 'Simulan ang Libreng Trial', ctaSignIn: 'Mag-sign In',
    footerPrivacy: 'Privacy Policy', footerTerms: 'Terms of Service', footerContact: 'Makipag-ugnayan',
    footerCopyright: 'Ang Pinaka-advanced na AI Receptionist Platform sa Mundo',
    watchDemo: 'Manatching Demo',
    indLaw: 'Mga Law Firms', indDental: 'Mga Dental Clinic', indMedspa: 'Med Spas', indHvac: 'HVAC', indPlumbing: 'Plumbing', indRealEstate: 'Real Estate', indLogistics: 'Logistics', indInsurance: 'Insurance',
    indLawStat: '93% ng mga litigator ang nag-report na nawalan sila ng cases dahil sa missed calls',
    indDentalStat: '67% ng pasyente ay nagpapalit ng dentist para sa mas magandang scheduling',
    indMedspaStat: '$2,400 average na missed revenue bawat buwan',
    indHvacStat: '50% ng HVAC emergencies ay na-book sa unang tawag',
    indPlumbingStat: '72% ng plumbing emergencies ay nangyayari pagkatapos ng oras',
    indRealEstateStat: '78% ng home buyers ay nakikipag-work sa unang agent',
    indLogisticsStat: '40% reduction sa costs sa AI dispatch',
    indInsuranceStat: '35% ng leads ang pumipili sa unang agent na makontak'
  },
  de: {
    navIndustries: 'Branchen', navFeatures: 'Funktionen', navPricing: 'Preise', navDemo: 'Demo', navSignIn: 'Anmelden', navStartFree: 'Kostenlos testen',
    heroBadge: 'Die fortschrittlichste KI-Empfangsplattform der Welt',
    heroTitle1: 'Hören Sie auf, Umsätze durch', heroTitle2: 'Verpasste Anrufe zu verlieren',
    heroSubtitle: 'KI-Empfang funktioniert 24/7, beantwortet jeden Anruf sofort, bucht Termine und qualifiziert Leads.',
    heroTrusted: 'Über 2.400 Unternehmen vertrauen uns: Recht, Zahnmedizin, HVAC, Klempner, Immobilien und mehr',
    heroEmailPlaceholder: 'Geben Sie Ihre geschäftliche E-Mail ein',
    heroCta: 'Kostenlos testen',
    heroTrialNote: '14 Tage kostenlos testen • Keine Kreditkarte erforderlich',
    roiAvgRoi: 'Durchschnittliche ROI', roiLeadCapture: 'Lead-Erfassungsrate', roiMonthlySavings: 'Durchschnittliche monatliche Einsparungen', roiResponseTime: 'Reaktionszeit',
    industriesTitle: 'Entwickelt für', industriesTitleAccent: 'Ihre Branche',
    industriesSubtitle: 'Vorkonfigurierte KI-Empfangsvorlagen für jede Branche, die wir bedienen.',
    featuresTitle: 'Das', featuresTitleAccent: ' fortschrittlichste KI',
    featuresSubtitle: 'Keine bloße Anrufbeantworter. Ein vollständiger KI-Empfang, der die gesamte Kundenreise bearbeitet.',
    howItWorksTitle: 'In 48 Stunden einsatzbereit',
    step1Title: 'Konto erstellen', step1Desc: 'Melden Sie sich in 2 Minuten an. Wählen Sie Ihre Branche für vorkonfigurierte Vorlagen.', step1Time: '2 Min',
    step2Title: 'Konfigurieren', step2Desc: 'Importieren Sie Dienste, stellen Sie Zeitpläne ein und passen Sie Ihre KI-Stimme an.', step2Time: '30 Min',
    step3Title: 'Live gehen', step3Desc: 'Beginnen Sie sofort mit dem Empfang von Anrufen. Überwachen Sie über Ihr Dashboard.', step3Time: 'Sofort',
    testimonialsTitle: 'Echte Ergebnisse von echten Unternehmen',
    integrationsTitle: 'Funktioniert mit Ihren bestehenden Tools',
    integrationsSubtitle: 'Ein-Klick-Integrationen mit der Software, die Sie bereits verwenden',
    pricingTitle: 'Einfache, transparente Preise',
    planStarter: 'Starter', planProfessional: 'Professional', planEnterprise: 'Enterprise',
    planStarterDesc: 'Perfekt für kleine Unternehmen', planProfessionalDesc: 'Am beliebtesten für wachsende Unternehmen', planEnterpriseDesc: 'Für Organisationen mit unbegrenztem Bedarf',
    planStarterPrice: '$199', planProfessionalPrice: '$399', planEnterprisePrice: '$799',
    planMostPopular: 'AM BELIEBTESTEN',
    featureBasicAi: 'Basis-KI-Empfang', feature100Calls: '100 Anrufe/Monat', featureEmailSupport: 'E-Mail-Support', featureBasicAnalytics: 'Basis-Analytik',
    featureUnlimitedAi: 'Unbegrenzter KI-Empfang', feature1000Calls: '1.000 Anrufe/Monat', featurePrioritySupport: 'Prioritäts-Support', featureAdvancedAnalytics: 'Erweiterte Analytik', featureSmsIntegration: 'SMS-Integration', featureVoicemail: 'Voicemail',
    featureEverything: 'Alles in Professional', featureUnlimitedCalls: 'Unbegrenzte Anrufe', feature247Support: '24/7 Support', featureCustomIntegrations: 'Benutzerdefinierte Integrationen', featureWhiteLabel: 'White-Label-Optionen', featureDedicatedManager: 'Dedizierter Account-Manager',
    pricingTrialNote: 'Alle Pläne beinhalten 14 Tage kostenlos testen • Keine Kreditkarte erforderlich',
    ctaTitle: 'Bereit, jeden Lead zu erfassen?',
    ctaSubtitle: 'Schließen Sie sich über 2.400 Unternehmen an, die FrontDesk Agents bereits nutzen.',
    ctaStartTrial: 'Kostenlos testen', ctaSignIn: 'Anmelden',
    footerPrivacy: 'Datenschutzrichtlinie', footerTerms: 'Nutzungsbedingungen', footerContact: 'Kontakt',
    footerCopyright: 'Die fortschrittlichste KI-Empfangsplattform der Welt',
    watchDemo: 'Demo ansehen',
    indLaw: 'Anwaltskanzleien', indDental: 'Zahnarztpraxen', indMedspa: 'Med Spas', indHvac: 'HVAC', indPlumbing: 'Klempner', indRealEstate: 'Immobilien', indLogistics: 'Logistik', indInsurance: 'Versicherung',
    indLawStat: '93% der Prozessanwälte berichten, dass verpasste Anrufe ihnen Fälle gekostet haben',
    indDentalStat: '67% der Patienten wechseln den Zahnarzt wegen besserer Terminplanung',
    indMedspaStat: 'Durchschnittlich $2.400 entgangener Umsatz pro Monat',
    indHvacStat: '50% der HVAC-Notfälle werden beim ersten Anruf gebucht',
    indPlumbingStat: '72% der Klempner-Notfälle passieren nach Feierabend',
    indRealEstateStat: '78% der Hauskäufer arbeiten mit dem ersten Agenten',
    indLogisticsStat: '40% Kostenreduzierung mit KI-Dispatch',
    indInsuranceStat: '35% der Leads wählen den ersten kontaktierten Agenten'
  },
  it: {
    navIndustries: 'Settori', navFeatures: 'Funzionalità', navPricing: 'Prezzi', navDemo: 'Demo', navSignIn: 'Accedi', navStartFree: 'Prova Gratuita',
    heroBadge: 'La Piattaforma di Receptionist AI più Avanzata al Mondo',
    heroTitle1: 'Smetti di Perdere Entrate a', heroTitle2: 'Cause di Chiamate Perse',
    heroSubtitle: 'Il receptionist AI lavora 24/7, risponde a ogni chiamata istantaneamente, prenota appuntamenti e qualifica i lead.',
    heroTrusted: 'Oltre 2.400 aziende si fidano di noi: Legale, Dentale, HVAC, Idraulica, Immobiliare e altro',
    heroEmailPlaceholder: 'Inserisci la tua email aziendale',
    heroCta: 'Inizia la Prova Gratuita',
    heroTrialNote: 'Prova gratuita di 14 giorni • Nessuna carta di credito richiesta',
    roiAvgRoi: 'ROI Medio', roiLeadCapture: 'Tasso di Acquisizione Lead', roiMonthlySavings: 'Risparmio Medio Mensile', roiResponseTime: 'Tempo di Risposta',
    industriesTitle: 'Creato per', industriesTitleAccent: 'il Tuo Settore',
    industriesSubtitle: 'Modelli di Receptionist AI preconfigurati per ogni settore che serviamo.',
    featuresTitle: 'Il Più', featuresTitleAccent: 'AI Avanzata',
    featuresSubtitle: 'Non solo un centralino. Un receptionist AI completo che gestisce l intero percorso del cliente.',
    howItWorksTitle: 'Operativo in 48 Ore',
    step1Title: 'Crea Account', step1Desc: 'Registrati in 2 minuti. Seleziona il tuo settore per modelli preconfigurati.', step1Time: '2 min',
    step2Title: 'Configura', step2Desc: 'Importa servizi, imposta orari e personalizza la voce AI.', step2Time: '30 min',
    step3Title: 'Vai in Live', step3Desc: 'Inizia a ricevere chiamate immediatamente. Monitora dalla tua dashboard.', step3Time: 'Immediato',
    testimonialsTitle: 'Risultati Reali da Aziende Reali',
    integrationsTitle: 'Funziona con i Tuoi Strumenti Esistenti',
    integrationsSubtitle: 'Integrazioni con un clic con il software che giá usi',
    pricingTitle: 'Prezzi Semplici e Trasparenti',
    planStarter: 'Starter', planProfessional: 'Professional', planEnterprise: 'Enterprise',
    planStarterDesc: 'Perfetto per piccole aziende', planProfessionalDesc: 'Il più popolare per aziende in crescita', planEnterpriseDesc: 'Per organizzazioni che necessitano di scala illimitata',
    planStarterPrice: '$199', planProfessionalPrice: '$399', planEnterprisePrice: '$799',
    planMostPopular: 'PIÙ POPOLARE',
    featureBasicAi: 'Receptionist AI Base', feature100Calls: '100 chiamate/mese', featureEmailSupport: 'Supporto email', featureBasicAnalytics: 'Analisi base',
    featureUnlimitedAi: 'Receptionist AI Illimitato', feature1000Calls: '1.000 chiamate/mese', featurePrioritySupport: 'Supporto prioritario', featureAdvancedAnalytics: 'Analisi avanzata', featureSmsIntegration: 'Integrazione SMS', featureVoicemail: 'Segreteria telefonica',
    featureEverything: 'Tutto in Professional', featureUnlimitedCalls: 'Chiamate illimitate', feature247Support: 'Supporto 24/7', featureCustomIntegrations: 'Integrazioni personalizzate', featureWhiteLabel: 'Opzioni white-label', featureDedicatedManager: 'Account manager dedicato',
    pricingTrialNote: 'Tutti i piani includono prova gratuita di 14 giorni • Nessuna carta di credito richiesta',
    ctaTitle: 'Pronto a Catturare Ogni Lead?',
    ctaSubtitle: 'Unisciti a oltre 2.400 aziende che già usano FrontDesk Agents.',
    ctaStartTrial: 'Inizia la Prova Gratuita', ctaSignIn: 'Accedi',
    footerPrivacy: 'Privacy Policy', footerTerms: 'Termini di Servizio', footerContact: 'Contattaci',
    footerCopyright: 'La Piattaforma di Receptionist AI più Avanzata al Mondo',
    watchDemo: 'Guarda Demo',
    indLaw: 'Studi Legali', indDental: 'Cliniche Dentistiche', indMedspa: 'Med Spas', indHvac: 'HVAC', indPlumbing: 'Idraulica', indRealEstate: 'Immobiliare', indLogistics: 'Logistica', indInsurance: 'Assicurazione',
    indLawStat: 'Il 93% degli avvocati riporta che le chiamate perse sono costate loro cause',
    indDentalStat: 'Il 67% dei pazienti cambia dentista per una migliore pianificazione',
    indMedspaStat: '$2.400 di ricavi medi persi al mese',
    indHvacStat: 'Il 50% delle emergenze HVAC vengono prenotate alla prima chiamata',
    indPlumbingStat: 'Il 72% delle emergenze idrauliche accadono dopo orario',
    indRealEstateStat: 'Il 78% degli acquirenti di case lavora con il primo agente',
    indLogisticsStat: 'Riduzione del 40% dei costi con dispatch AI',
    indInsuranceStat: 'Il 35% dei lead sceglie il primo agente contattato'
  },
  ru: {
    navIndustries: 'Отрасли', navFeatures: 'Функции', navPricing: 'Цены', navDemo: 'Демо', navSignIn: 'Войти', navStartFree: 'Бесплатный пробный период',
    heroBadge: 'Самая продвинутая платформа ИИ-ресепшена в мире',
    heroTitle1: 'Прекратите терять доход из-за', heroTitle2: 'Пропущенных звонков',
    heroSubtitle: 'ИИ-ресепшен работает 24/7, мгновенно отвечает на каждый звонок, записывает на прием и квалифицирует лиды.',
    heroTrusted: 'Более 2400 компаний доверяют нам: Юристы, Стоматологи, HVAC, Сантехника, Недвижимость и другое',
    heroEmailPlaceholder: 'Введите вашу рабочую почту',
    heroCta: 'Начать бесплатный пробный период',
    heroTrialNote: '14-дневный бесплатный пробный период • Кредитная карта не требуется',
    roiAvgRoi: 'Средний ROI', roiLeadCapture: 'Коэффициент захвата лидов', roiMonthlySavings: 'Средняя ежемесячная экономия', roiResponseTime: 'Время ответа',
    industriesTitle: 'Создано для', industriesTitleAccent: 'вашей отрасли',
    industriesSubtitle: 'Предварительно настроенные шаблоны ИИ-ресепшена для каждой отрасли, которую мы обслуживаем.',
    featuresTitle: 'Самый', featuresTitleAccent: 'продвинутый ИИ',
    featuresSubtitle: 'Не просто автоответчик. Полноценный ИИ-ресепшен, который обрабатывает весь путь клиента.',
    howItWorksTitle: 'Готов к работе через 48 часов',
    step1Title: 'Создать аккаунт', step1Desc: 'Зарегистрируйтесь за 2 минуты. Выберите вашу отрасль для предварительно настроенных шаблонов.', step1Time: '2 мин',
    step2Title: 'Настроить', step2Desc: 'Импортируйте услуги, установите расписание и настройте голос ИИ.', step2Time: '30 мин',
    step3Title: 'Запустить', step3Desc: 'Начните принимать звонки немедленно. Отслеживайте с панели управления.', step3Time: 'Мгновенно',
    testimonialsTitle: 'Реальные результаты от реальных компаний',
    integrationsTitle: 'Работает с вашими существующими инструментами',
    integrationsSubtitle: 'Интеграция в один клик с программным обеспечением, которое вы уже используете',
    pricingTitle: 'Простые, прозрачные цены',
    planStarter: 'Стартер', planProfessional: 'Профессионал', planEnterprise: 'Корпоративный',
    planStarterDesc: 'Идеально для малого бизнеса', planProfessionalDesc: 'Самый популярный для растущих компаний', planEnterpriseDesc: 'Для организаций с неограниченным масштабом',
    planStarterPrice: '$199', planProfessionalPrice: '$399', planEnterprisePrice: '$799',
    planMostPopular: 'САМЫЙ ПОПУЛЯРНЫЙ',
    featureBasicAi: 'Базовый ИИ-ресепшен', feature100Calls: '100 звонков/мес', featureEmailSupport: 'Поддержка по email', featureBasicAnalytics: 'Базовая аналитика',
    featureUnlimitedAi: 'Безлимитный ИИ-ресепшен', feature1000Calls: '1 000 звонков/мес', featurePrioritySupport: 'Приоритетная поддержка', featureAdvancedAnalytics: 'Продвинутая аналитика', featureSmsIntegration: 'Интеграция SMS', featureVoicemail: 'Голосовая почта',
    featureEverything: 'Все в Профессионале', featureUnlimitedCalls: 'Безлимитные звонки', feature247Support: 'Поддержка 24/7', featureCustomIntegrations: 'Пользовательские интеграции', featureWhiteLabel: 'Опции white-label', featureDedicatedManager: 'Выделенный менеджер',
    pricingTrialNote: 'Все планы включают 14-дневный бесплатный пробный период • Кредитная карта не требуется',
    ctaTitle: 'Готовы захватывать каждого лида?',
    ctaSubtitle: 'Присоединяйтесь к более чем 2400 компаниям, уже использующим FrontDesk Agents.',
    ctaStartTrial: 'Начать бесплатный пробный период', ctaSignIn: 'Войти',
    footerPrivacy: 'Политика конфиденциальности', footerTerms: 'Условия использования', footerContact: 'Контакт',
    footerCopyright: 'Самая продвинутая платформа ИИ-ресепшена в мире',
    watchDemo: 'Смотреть демо',
    indLaw: 'Юридические фирмы', indDental: 'Стоматологические клиники', indMedspa: 'Мед Спа', indHvac: 'HVAC', indPlumbing: 'Сантехника', indRealEstate: 'Недвижимость', indLogistics: 'Логистика', indInsurance: 'Страхование',
    indLawStat: '93% юристов сообщают, что пропущенные звонки стоили им дел',
    indDentalStat: '67% пациентов меняют стоматолога ради лучшей записи',
    indMedspaStat: '$2400 средней потери дохода в месяц',
    indHvacStat: '50% аварий HVAC бронируются при первом звонке',
    indPlumbingStat: '72% аварий сантехники происходят после часов',
    indRealEstateStat: '78% покупателей жилья работают с первым агентом',
    indLogisticsStat: '40% снижение затрат с ИИ-диспетчером',
    indInsuranceStat: '35% лидов выбирают первого контактируемого агента'
  }
}

const industries = [
  { id: 'law', nameKey: 'indLaw', icon: '⚖️', statKey: 'indLawStat' },
  { id: 'dental', nameKey: 'indDental', icon: '🦷', statKey: 'indDentalStat' },
  { id: 'medspa', nameKey: 'indMedspa', icon: '✨', statKey: 'indMedspaStat' },
  { id: 'hvac', nameKey: 'indHvac', icon: '❄️', statKey: 'indHvacStat' },
  { id: 'plumbing', nameKey: 'indPlumbing', icon: '🔧', statKey: 'indPlumbingStat' },
  { id: 'realestate', nameKey: 'indRealEstate', icon: '🏠', statKey: 'indRealEstateStat' },
  { id: 'logistics', nameKey: 'indLogistics', icon: '🚛', statKey: 'indLogisticsStat' },
  { id: 'insurance', nameKey: 'indInsurance', icon: '🛡️', statKey: 'indInsuranceStat' }
]

const features = [
  { icon: Mic, titleKey: 'featureBasicAi', descKey: 'featureBasicAnalytics' },
  { icon: Calendar, titleKey: 'featureUnlimitedAi', descKey: 'featureAdvancedAnalytics' },
  { icon: MessageSquare, titleKey: 'featureSmsIntegration', descKey: 'featurePrioritySupport' },
  { icon: BarChart3, titleKey: 'feature1000Calls', descKey: 'feature247Support' },
  { icon: Headphones, titleKey: 'featureUnlimitedCalls', descKey: 'featureCustomIntegrations' },
  { icon: ShieldCheck, titleKey: 'featureEverything', descKey: 'featureDedicatedManager' }
]

const roiStats = [
  { value: '847%', labelKey: 'roiAvgRoi' },
  { value: '94%', labelKey: 'roiLeadCapture' },
  { value: '$4,200', labelKey: 'roiMonthlySavings' },
  { value: '<2s', labelKey: 'roiResponseTime' }
]

export default function LandingPage() {
  const [showVideo, setShowVideo] = useState(false)
  const [email, setEmail] = useState('')
  const [currentLang, setCurrentLang] = useState('en')

  useEffect(() => {
    const savedLang = localStorage.getItem('preferred-language') || 'en'
    setCurrentLang(savedLang)
    const handleLangChange = (e: CustomEvent) => {
      setCurrentLang(e.detail)
    }
    window.addEventListener('languageChange', handleLangChange as EventListener)
    return () => window.removeEventListener('languageChange', handleLangChange as EventListener)
  }, [])

  const t = translations[currentLang] || translations['en']
  const isRtl = currentLang === 'ar'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      window.location.href = `/customer/signup?email=${encodeURIComponent(email)}`
    }
  }

  return (
    <div className='min-h-screen bg-black text-white overflow-x-hidden' dir={isRtl ? 'rtl' : 'ltr'}>
      <div className='fixed inset-0 bg-gradient-to-br from-green-900/20 via-transparent to-blue-900/20 pointer-events-none' />
      
      <nav className='fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/10'>
        <div className='max-w-7xl mx-auto px-4 py-4 flex justify-between items-center'>
          <Link href='/' className='flex items-center gap-2'>
            <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center'>
              <Phone className='w-5 h-5 text-white' />
            </div>
            <span className='font-bold text-xl'>FrontDesk Agents</span>
          </Link>
          <div className='hidden md:flex gap-8 items-center'>
            <a href='#industries' className='text-gray-400 hover:text-white transition'>{t.navIndustries}</a>
            <a href='#features' className='text-gray-400 hover:text-white transition'>{t.navFeatures}</a>
            <a href='#pricing' className='text-gray-400 hover:text-white transition'>{t.navPricing}</a>
            <button onClick={() => setShowVideo(true)} className='flex items-center gap-2 text-gray-400 hover:text-white transition'>
              <Play className='w-4 h-4' /> {t.navDemo}
            </button>
            <a href='/customer/login' className='text-gray-300 hover:text-white'>{t.navSignIn}</a>
            <LanguageSelector />
            <a href='/customer/signup' className='px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 rounded-xl font-bold text-sm uppercase tracking-wide transition-all'>
              {t.navStartFree}
            </a>
          </div>
        </div>
      </nav>

      <section className='pt-32 pb-20 px-4 relative'>
        <div className='max-w-6xl mx-auto text-center'>
          <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30 mb-8'>
            <Zap className='w-4 h-4 text-green-400' />
            <span className='text-sm font-medium text-green-400'>{t.heroBadge}</span>
          </div>
          
          <h1 className='text-5xl md:text-7xl font-bold mb-6 leading-tight'>
            {t.heroTitle1}<br />
            <span className='bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent'>{t.heroTitle2}</span>
          </h1>
          
          <p className='text-xl md:text-2xl text-gray-400 mb-6 max-w-3xl mx-auto'>
            {t.heroSubtitle}
          </p>
          
          <p className='text-lg text-green-400 font-semibold mb-8'>
            {t.heroTrusted}
          </p>
          
          <form onSubmit={handleSubmit} className='max-w-xl mx-auto mb-6 flex flex-col sm:flex-row gap-3'>
            <input 
              type='email' 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder={t.heroEmailPlaceholder} 
              className='flex-1 px-5 py-4 bg-white/10 border border-white/20 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all' 
              required 
            />
            <button 
              type='submit' 
              className='px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 rounded-xl font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-500/25'
            >
              {t.heroCta} <ArrowRight className='w-5 h-5' />
            </button>
          </form>
          <p className='text-sm text-gray-500'>{t.heroTrialNote}</p>
        </div>
      </section>

      <section className='py-8 px-4 border-y border-white/10 bg-gradient-to-r from-green-900/10 via-transparent to-blue-900/10'>
        <div className='max-w-6xl mx-auto'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
            {roiStats.map((stat, i) => (
              <div key={i} className='text-center'>
                <div className='text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent mb-1'>{stat.value}</div>
                <div className='text-sm font-semibold text-white'>{t[stat.labelKey]}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id='industries' className='py-20 px-4'>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center mb-12'>
            <h2 className='text-4xl md:text-5xl font-bold mb-4'>
              {t.industriesTitle} <span className='bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent'>{t.industriesTitleAccent}</span>
            </h2>
            <p className='text-xl text-gray-400 max-w-2xl mx-auto'>
              {t.industriesSubtitle}
            </p>
          </div>

          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            {industries.map((industry) => (
              <Link 
                key={industry.id}
                href={`/customer/signup?industry=${industry.id}`}
                className='group p-6 rounded-2xl border bg-white/[0.03] border-white/10 hover:border-green-500/50 hover:bg-green-500/5 transition-all cursor-pointer'
              >
                <div className='text-4xl mb-3'>{industry.icon}</div>
                <h3 className='text-lg font-bold mb-2'>{t[industry.nameKey]}</h3>
                <div className='text-xs text-green-400 font-medium'>{t[industry.statKey]}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id='features' className='py-20 px-4 bg-gradient-to-b from-transparent via-green-900/10 to-transparent'>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center mb-12'>
            <h2 className='text-4xl md:text-5xl font-bold mb-4'>
              {t.featuresTitle} <span className='bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent'>{t.featuresTitleAccent}</span>
            </h2>
            <p className='text-xl text-gray-400 max-w-2xl mx-auto'>
              {t.featuresSubtitle}
            </p>
          </div>

          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {features.map((feature, i) => (
              <div key={i} className='p-8 rounded-2xl border bg-white/[0.02] border-white/10 hover:border-green-500/30 transition-all'>
                <feature.icon className='w-12 h-12 mb-4 text-green-400' />
                <h3 className='text-xl font-bold mb-2'>{t[feature.titleKey]}</h3>
                <p className='text-gray-400'>{t[feature.descKey]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className='py-20 px-4'>
        <div className='max-w-5xl mx-auto text-center'>
          <h2 className='text-4xl font-bold mb-16'>{t.howItWorksTitle}</h2>

          <div className='grid md:grid-cols-3 gap-8'>
            <div className='text-center'>
              <div className='w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-2xl font-bold mx-auto mb-4'>1</div>
              <h3 className='text-xl font-bold mb-2'>{t.step1Title}</h3>
              <p className='text-gray-400 mb-4'>{t.step1Desc}</p>
              <span className='inline-block px-4 py-2 bg-green-500/20 rounded-full text-sm font-medium text-green-400'>{t.step1Time}</span>
            </div>
            <div className='text-center'>
              <div className='w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-2xl font-bold mx-auto mb-4'>2</div>
              <h3 className='text-xl font-bold mb-2'>{t.step2Title}</h3>
              <p className='text-gray-400 mb-4'>{t.step2Desc}</p>
              <span className='inline-block px-4 py-2 bg-green-500/20 rounded-full text-sm font-medium text-green-400'>{t.step2Time}</span>
            </div>
            <div className='text-center'>
              <div className='w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-2xl font-bold mx-auto mb-4'>3</div>
              <h3 className='text-xl font-bold mb-2'>{t.step3Title}</h3>
              <p className='text-gray-400 mb-4'>{t.step3Desc}</p>
              <span className='inline-block px-4 py-2 bg-green-500/20 rounded-full text-sm font-medium text-green-400'>{t.step3Time}</span>
            </div>
          </div>
        </div>
      </section>

      <section className='py-20 px-4 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent'>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center mb-12'>
            <h2 className='text-4xl font-bold mb-4'>{t.testimonialsTitle}</h2>
          </div>

          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {[
              { name: 'Marcus Thompson', role: 'Partner, Thompson Law Group', quote: 'We recovered 3x our investment in the first month. Intake is now more consistent than with a full-time receptionist.', result: '+$180K revenue' },
              { name: 'Dr. Sarah Chen', role: 'Owner, Bright Smile Dental', quote: 'No-show rate dropped 60% and we book 40% more appointments. The AI even handles rescheduling intelligently.', result: '+40% appointments' },
              { name: 'Mike Rodriguez', role: 'Owner, Rodriguez HVAC', quote: 'We answer emergency calls before our competitors even see the notification. Revenue is up 34%.', result: '+34% revenue' },
              { name: 'Lisa Park', role: 'Broker, Park Realty Group', quote: 'Lead conversion rate jumped from 12% to 31%. The 5-minute rule is real.', result: '+19% conversion' },
              { name: 'Jennifer Walsh', role: 'Director, Luxe Med Spa', quote: 'Clients think we have a dedicated front desk team. Game changer.', result: '+$15K monthly' }
            ].map((tItem, i) => (
              <div key={i} className='p-8 rounded-2xl bg-white/[0.03] border border-white/10'>
                <div className='flex gap-1 mb-4'>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className='w-4 h-4 text-yellow-400 fill-yellow-400' />
                  ))}
                </div>
                <p className='text-gray-300 text-lg mb-6 italic'>\"{tItem.quote}\"</p>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-xl font-bold'>
                    {tItem.name[0]}
                  </div>
                  <div>
                    <div className='font-bold'>{tItem.name}</div>
                    <div className='text-sm text-gray-400'>{tItem.role}</div>
                  </div>
                </div>
                <div className='inline-block px-4 py-2 bg-green-500/20 rounded-full text-sm font-medium text-green-400'>
                  {tItem.result}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className='py-20 px-4'>
        <div className='max-w-5xl mx-auto text-center'>
          <h2 className='text-4xl font-bold mb-4'>{t.integrationsTitle}</h2>
          <p className='text-xl text-gray-400 mb-12'>{t.integrationsSubtitle}</p>
          
          <div className='grid grid-cols-3 md:grid-cols-6 gap-6'>
            {['Google Calendar', 'Calendly', 'HubSpot', 'Salesforce', 'Zapier', 'Slack'].map((tool, i) => (
              <div key={i} className='p-4 rounded-xl bg-white/[0.05] border border-white/10 text-center'>
                <div className='w-12 h-12 rounded-lg bg-white/10 mx-auto mb-2 flex items-center justify-center'>
                  <Building2 className='w-6 h-6 text-gray-400' />
                </div>
                <div className='text-sm font-medium'>{tool}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id='pricing' className='py-20 px-4 bg-gradient-to-b from-black to-white/[0.02]'>
        <div className='max-w-6xl mx-auto'>
          <div className='text-center mb-12'>
            <h2 className='text-4xl font-bold mb-4'>{t.pricingTitle}</h2>
          </div>

          <div className='grid md:grid-cols-3 gap-8'>
            <div className='p-8 rounded-2xl border bg-white/[0.02] border-white/10'>
              <h3 className='text-2xl font-bold mb-2'>{t.planStarter}</h3>
              <p className='text-sm text-gray-400 mb-4'>{t.planStarterDesc}</p>
              <div className='text-5xl font-bold mb-6'>
                <span className='bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent'>{t.planStarterPrice}</span>
                <span className='text-lg text-gray-500 font-normal'>/mo</span>
              </div>
              <ul className='text-left space-y-3 mb-8'>
                {[t.featureBasicAi, t.feature100Calls, t.featureEmailSupport, t.featureBasicAnalytics].map((f, fi) => (
                  <li key={fi} className='flex items-center gap-3'>
                    <Check className='w-5 h-5 text-green-400 flex-shrink-0' />
                    <span className='text-gray-300'>{f}</span>
                  </li>
                ))}
              </ul>
              <a href='/customer/signup' className='block w-full py-4 rounded-xl font-bold uppercase text-center bg-white/10 hover:bg-white/20 transition-all'>
                {t.heroCta}
              </a>
            </div>
            
            <div className='p-8 rounded-2xl border bg-green-500/5 border-green-500 relative scale-105'>
              <div className='absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-green-500 rounded-full text-xs font-bold'>
                {t.planMostPopular}
              </div>
              <h3 className='text-2xl font-bold mb-2'>{t.planProfessional}</h3>
              <p className='text-sm text-gray-400 mb-4'>{t.planProfessionalDesc}</p>
              <div className='text-5xl font-bold mb-6'>
                <span className='bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent'>{t.planProfessionalPrice}</span>
                <span className='text-lg text-gray-500 font-normal'>/mo</span>
              </div>
              <ul className='text-left space-y-3 mb-8'>
                {[t.featureUnlimitedAi, t.feature1000Calls, t.featurePrioritySupport, t.featureAdvancedAnalytics, t.featureSmsIntegration, t.featureVoicemail].map((f, fi) => (
                  <li key={fi} className='flex items-center gap-3'>
                    <Check className='w-5 h-5 text-green-400 flex-shrink-0' />
                    <span className='text-gray-300'>{f}</span>
                  </li>
                ))}
              </ul>
              <a href='/customer/signup' className='block w-full py-4 rounded-xl font-bold uppercase text-center bg-green-500 hover:bg-green-400 transition-all'>
                {t.heroCta}
              </a>
            </div>
            
            <div className='p-8 rounded-2xl border bg-white/[0.02] border-white/10'>
              <h3 className='text-2xl font-bold mb-2'>{t.planEnterprise}</h3>
              <p className='text-sm text-gray-400 mb-4'>{t.planEnterpriseDesc}</p>
              <div className='text-5xl font-bold mb-6'>
                <span className='bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent'>{t.planEnterprisePrice}</span>
                <span className='text-lg text-gray-500 font-normal'>/mo</span>
              </div>
              <ul className='text-left space-y-3 mb-8'>
                {[t.featureEverything, t.featureUnlimitedCalls, t.feature247Support, t.featureCustomIntegrations, t.featureWhiteLabel, t.featureDedicatedManager].map((f, fi) => (
                  <li key={fi} className='flex items-center gap-3'>
                    <Check className='w-5 h-5 text-green-400 flex-shrink-0' />
                    <span className='text-gray-300'>{f}</span>
                  </li>
                ))}
              </ul>
              <a href='/customer/signup' className='block w-full py-4 rounded-xl font-bold uppercase text-center bg-white/10 hover:bg-white/20 transition-all'>
                {t.heroCta}
              </a>
            </div>
          </div>
          <p className='text-center text-gray-500 mt-8'>{t.pricingTrialNote}</p>
        </div>
      </section>

      <section className='py-24 px-4'>
        <div className='max-w-4xl mx-auto text-center'>
          <h2 className='text-4xl md:text-5xl font-bold mb-6'>
            {t.ctaTitle}
          </h2>
          <p className='text-xl text-gray-400 mb-8'>
            {t.ctaSubtitle}
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <a 
              href='/customer/signup' 
              className='px-10 py-5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 rounded-xl font-bold uppercase text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-500/25'
            >
              {t.ctaStartTrial} <ArrowRight className='w-5 h-5' />
            </a>
            <a 
              href='/customer/login' 
              className='px-10 py-5 bg-white/10 hover:bg-white/20 rounded-xl font-bold uppercase text-lg transition-all'
            >
              {t.ctaSignIn}
            </a>
          </div>
        </div>
      </section>

      <footer className='py-12 border-t border-white/10'>
        <div className='max-w-7xl mx-auto px-4'>
          <div className='flex flex-col md:flex-row justify-between items-center gap-6'>
            <div className='flex items-center gap-2'>
              <div className='w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center'>
                <Phone className='w-4 h-4 text-white' />
              </div>
              <span className='font-bold'>FrontDesk Agents</span>
            </div>
            <div className='flex gap-6 text-sm text-gray-400'>
              <a href='/privacy-policy' className='hover:text-white transition'>{t.footerPrivacy}</a>
              <a href='/terms-of-service' className='hover:text-white transition'>{t.footerTerms}</a>
              <a href='/contact' className='hover:text-white transition'>{t.footerContact}</a>
            </div>
          </div>
          <div className='text-center text-gray-500 text-sm mt-6'>
            © 2026 FrontDesk Agents. {t.footerCopyright}.
          </div>
        </div>
      </footer>

      {showVideo && (
        <div 
          className='fixed inset-0 z-50 bg-black/95 flex items-center justify-center' 
          onClick={() => setShowVideo(false)}
        >
          <div className='max-w-4xl w-full mx-4'>
            <div className='aspect-video bg-gradient-to-br from-green-900 to-blue-900 rounded-2xl flex items-center justify-center'>
              <button className='flex flex-col items-center gap-4 text-white'>
                <div className='w-20 h-20 rounded-full bg-green-500 flex items-center justify-center hover:bg-green-400 transition'>
                  <Play className='w-8 h-8' />
                </div>
                <span className='text-lg font-medium'>{t.watchDemo}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}