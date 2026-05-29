'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, ChevronLeft, ChevronRight, Check, Zap, Shield, Phone, CreditCard, Users, Brain, Activity, TrendingUp, Globe } from 'lucide-react'
import Link from 'next/link'
import LanguageSelector from '../components/LanguageSelector'

// Complete multilingual translations
type TranslationValue = string | string[];
const translations: Record<string, Record<string, TranslationValue>> = {
  en: {
    slide1Title: 'Welcome to FrontDesk Agents', slide1Subtitle: "World's Most Advanced AI Receptionist Platform", slide1Desc: 'Transform your business communication with intelligent AI agents that handle calls, bookings, and customer inquiries 24/7.',
    slide2Title: 'Simple, Transparent Pricing', slide2Subtitle: 'Choose the plan that fits your business', slide2Desc: 'Start with a 14-day free trial. No credit card required.',
    slide3Title: 'Get Started in Minutes', slide3Subtitle: 'Simple 3-step signup process', slide3Desc: 'Create your account, configure your AI agents, and start accepting calls.',
    slide4Title: 'Powerful Features', slide4Subtitle: 'Everything you need to scale', slide4Desc: 'Built-in integrations with the tools you already use.',
    slide5Title: 'Intelligent Dashboard', slide5Subtitle: 'AI-powered insights at your fingertips', slide5Desc: 'Monitor your AI agents, track call metrics, and optimize performance.',
    slide6Title: 'Ready to Transform Your Business?', slide6Subtitle: 'Start your free trial today', slide6Desc: 'No credit card required. Cancel anytime.',
    planStarter: 'Starter', planProfessional: 'Professional', planEnterprise: 'Enterprise',
    planStarterFeatures: ['5 AI Agents', '1,000 calls/mo', 'Basic Analytics'],
    planProFeatures: ['15 AI Agents', '5,000 calls/mo', 'Advanced Analytics'],
    planEntFeatures: ['Unlimited Agents', 'Unlimited Calls', 'Priority Support'],
    mostPopular: 'Most Popular',
    step1Title: 'Create Account', step1Desc: 'Sign up with your business email',
    step2Title: 'Configure Agents', step2Desc: 'Customize your AI receptionist',
    step3Title: 'Start Receiving', step3Desc: 'Go live in minutes',
    featureAiVoice: 'AI Voice', featureAiVoiceDesc: 'Natural voice AI calls',
    featureSms: 'SMS', featureSmsDesc: 'Automated text messaging',
    featurePayments: 'Payments', featurePaymentsDesc: 'Automated subscriptions',
    featureAnalytics: 'Real-time Analytics', featureAnalyticsDesc: 'Monitor performance',
    metricActiveAgents: 'Active Agents', metricCallsToday: 'Calls Today', metricResponseTime: 'Response Time', metricSatisfaction: 'Satisfaction',
    ctaStartTrial: 'Start Free Trial', ctaSignIn: 'Sign In',
    navSignIn: 'Sign In', navCta: 'Start Free Trial'
  },
  es: {
    slide1Title: 'Bienvenido a FrontDesk Agents', slide1Subtitle: 'La Plataforma de Recepcionista IA Más Avanzada del Mundo', slide1Desc: 'Transforma la comunicación de tu negocio con agentes IA inteligentes que manejan llamadas, reservas e inquiries de clientes 24/7.',
    slide2Title: 'Precios Simples y Transparentes', slide2Subtitle: 'Elige el plan que se adapte a tu negocio', slide2Desc: 'Comienza con una prueba gratuita de 14 días. Sin tarjeta de crédito.',
    slide3Title: 'Comienza en Minutos', slide3Subtitle: 'Proceso de registro simple en 3 pasos', slide3Desc: 'Crea tu cuenta, configura tus agentes IA y comienza a aceptar llamadas.',
    slide4Title: 'Funcionalidades Poderosas', slide4Subtitle: 'Todo lo que necesitas para escalar', slide4Desc: 'Integraciones incorporadas con las herramientas que ya usas.',
    slide5Title: 'Panel Inteligente', slide5Subtitle: 'Insights impulsados por IA en tus dedos', slide5Desc: 'Monitorea tus agentes IA, rastrea métricas de llamadas y optimiza el rendimiento.',
    slide6Title: '¿Listo para Transformar Tu Negocio?', slide6Subtitle: 'Comienza tu prueba gratuita hoy', slide6Desc: 'Sin tarjeta de crédito. Cancela cuando quieras.',
    planStarter: 'Inicial', planProfessional: 'Profesional', planEnterprise: 'Empresarial',
    planStarterFeatures: ['5 Agentes IA', '1,000 llamadas/mes', 'Analítica Básica'],
    planProFeatures: ['15 Agentes IA', '5,000 llamadas/mes', 'Analítica Avanzada'],
    planEntFeatures: ['Agentes Ilimitados', 'Llamadas Ilimitadas', 'Soporte Prioritario'],
    mostPopular: 'Más Popular',
    step1Title: 'Crear Cuenta', step1Desc: 'Regístrate con tu email de negocio',
    step2Title: 'Configurar Agentes', step2Desc: 'Personaliza tu recepcionista IA',
    step3Title: 'Comenzar a Recibir', step3Desc: 'Lanza en minutos',
    featureAiVoice: 'Voz IA', featureAiVoiceDesc: 'Llamadas con voz IA natural',
    featureSms: 'SMS', featureSmsDesc: 'Mensajería de texto automatizada',
    featurePayments: 'Pagos', featurePaymentsDesc: 'Suscripciones automatizadas',
    featureAnalytics: 'Analítica en Tiempo Real', featureAnalyticsDesc: 'Monitorea el rendimiento',
    metricActiveAgents: 'Agentes Activos', metricCallsToday: 'Llamadas Hoy', metricResponseTime: 'Tiempo de Respuesta', metricSatisfaction: 'Satisfacción',
    ctaStartTrial: 'Comenzar Prueba Gratis', ctaSignIn: 'Iniciar Sesión',
    navSignIn: 'Iniciar Sesión', navCta: 'Prueba Gratis'
  },
  fr: {
    slide1Title: 'Bienvenue chez FrontDesk Agents', slide1Subtitle: 'La Plateforme de Réceptionniste IA la Plus Avancée au Monde', slide1Desc: "Transformez vos communications d'entreprise avec des agents IA intelligents qui gèrent les appels, les réservations et les inquiries clients 24/7.",
    slide2Title: 'Tarification Simple et Transparente', slide2Subtitle: "Choisissez le plan qui correspond à votre entreprise", slide2Desc: 'Commencez avec un essai gratuit de 14 jours. Sans carte de crédit.',
    slide3Title: 'Commencez en Minutes', slide3Subtitle: 'Processus d inscription simple en 3 étapes', slide3Desc: 'Créez votre compte, configurez vos agents IA et commencez à accepter les appels.',
    slide4Title: 'Fonctionnalités Puissantes', slide4Subtitle: 'Tout ce dont vous avez besoin pour grandir', slide4Desc: 'Intégrations intégrées avec les outils que vous utilisez déjà.',
    slide5Title: 'Tableau de Bord Intelligent', slide5Subtitle: 'Insights alimentés par IA à votre portée', slide5Desc: 'Surveillez vos agents IA, suivez les métriques d appels et optimisez les performances.',
    slide6Title: 'Prêt à Transformer Votre Entreprise?', slide6Subtitle: 'Commencez votre essai gratuit aujourd hui', slide6Desc: 'Sans carte de crédit. Annulez à tout moment.',
    planStarter: 'Starter', planProfessional: 'Professionnel', planEnterprise: 'Entreprise',
    planStarterFeatures: ['5 Agents IA', '1,000 appels/mois', 'Analytique Basique'],
    planProFeatures: ['15 Agents IA', '5,000 appels/mois', 'Analytique Avancée'],
    planEntFeatures: ['Agents Illimités', 'Appels Illimités', 'Support Prioritaire'],
    mostPopular: 'Le Plus Populaire',
    step1Title: 'Créer un Compte', step1Desc: 'Inscrivez-vous avec votre email professionnel',
    step2Title: 'Configurer les Agents', step2Desc: 'Personnalisez votre réceptionniste IA',
    step3Title: 'Commencer à Recevoir', step3Desc: 'Lancez en minutes',
    featureAiVoice: 'Voix IA', featureAiVoiceDesc: 'Appels vocaux IA naturels',
    featureSms: 'SMS', featureSmsDesc: 'Messagerie texte automatisée',
    featurePayments: 'Paiements', featurePaymentsDesc: 'Abonnements automatisés',
    featureAnalytics: 'Analytique en Temps Réel', featureAnalyticsDesc: 'Surveillez les performances',
    metricActiveAgents: 'Agents Actifs', metricCallsToday: 'Appels Aujourd hui', metricResponseTime: 'Temps de Réponse', metricSatisfaction: 'Satisfaction',
    ctaStartTrial: 'Commencer l Essai Gratuit', ctaSignIn: 'Se Connecter',
    navSignIn: 'Connexion', navCta: 'Essai Gratuit'
  },
  zh: {
    slide1Title: '欢迎使用 FrontDesk Agents', slide1Subtitle: '世界上最先进的AI接待员平台', slide1Desc: '通过智能AI代理改变您的业务沟通，这些代理全天候处理电话、预订和客户咨询。',
    slide2Title: '简单透明的定价', slide2Subtitle: '选择适合您业务的计划', slide2Desc: '从14天免费试用开始。无需信用卡。',
    slide3Title: '几分钟内开始', slide3Subtitle: '简单的3步注册流程', slide3Desc: '创建您的账户，配置您的AI代理，并开始接受电话。',
    slide4Title: '强大的功能', slide4Subtitle: '您扩展所需的一切', slide4Desc: '与您已使用的工具内置集成。',
    slide5Title: '智能仪表板', slide5Subtitle: 'AI驱动的洞察触手可及', slide5Desc: '监控您的AI代理、跟踪呼叫指标和优化性能。',
    slide6Title: '准备好改变您的业务了吗？', slide6Subtitle: '今天开始免费试用', slide6Desc: '无需信用卡。随时取消。',
    planStarter: '入门版', planProfessional: '专业版', planEnterprise: '企业版',
    planStarterFeatures: ['5个AI代理', '1,000次通话/月', '基础分析'],
    planProFeatures: ['15个AI代理', '5,000次通话/月', '高级分析'],
    planEntFeatures: ['无限代理', '无限通话', '优先支持'],
    mostPopular: '最受欢迎',
    step1Title: '创建账户', step1Desc: '使用您的商务邮箱注册',
    step2Title: '配置代理', step2Desc: '自定义您的AI接待员',
    step3Title: '开始接收', step3Desc: '几分钟内上线',
    featureAiVoice: 'AI语音', featureAiVoiceDesc: '自然语音AI通话',
    featureSms: '短信', featureSmsDesc: '自动文本消息',
    featurePayments: '支付', featurePaymentsDesc: '自动订阅',
    featureAnalytics: '实时分析', featureAnalyticsDesc: '监控性能',
    metricActiveAgents: '活跃代理', metricCallsToday: '今日通话', metricResponseTime: '响应时间', metricSatisfaction: '满意度',
    ctaStartTrial: '开始免费试用', ctaSignIn: '登录',
    navSignIn: '登录', navCta: '免费试用'
  },
  hi: {
    slide1Title: 'FrontDesk Agents में आपका स्वागत है', slide1Subtitle: 'विश्व का सबसे उन्नत AI रिसेप्शनिस्ट प्लेटफॉर्म', slide1Desc: 'बुद्धिमान AI एजेंटों के साथ अपने व्यापार संचार को बदलें जो 24/7 कॉल, बुकिंग और ग्राहक पूछताछ को संभालते हैं।',
    slide2Title: 'सरल, पारदर्शी मूल्य निर्धारण', slide2Subtitle: 'वह योजना चुनें जो आपके व्यापार के अनुकूल हो', slide2Desc: '14-दिन के निःशुल्क परीक्षण से शुरू करें। कोई क्रेडिट कार्ड नहीं।',
    slide3Title: 'मिनटों में शुरू करें', slide3Subtitle: 'सरल 3-चरण साइनअप प्रक्रिया', slide3Desc: 'अपना खाता बनाएं, अपने AI एजेंट कॉन्फ़िगर करें और कॉल स्वीकार करना शुरू करें।',
    slide4Title: 'शक्तिशाली सुविधाएं', slide4Subtitle: 'स्केल करने के लिए आपको जो चाहिए', slide4Desc: 'आपके द्वारा पहले से उपयोग की जा रही टूल्स के साथ बिल्ट-इन इंटीग्रेशन।',
    slide5Title: 'बुद्धिमान डैशबोर्ड', slide5Subtitle: 'AI-संचालित अंतर्दृष्टि आपकी उंगलियों पर', slide5Desc: 'अपने AI एजेंटों की निगरानी करें, कॉल मेट्रिक्स ट्रैक करें और प्रदर्शन को अनुकूलित करें।',
    slide6Title: 'अपने व्यापार को बदलने के लिए तैयार?', slide6Subtitle: 'आज अपना निःशुल्क परीक्षण शुरू करें', slide6Desc: 'कोई क्रेडिट कार्ड नहीं। कभी भी रद्द करें।',
    planStarter: 'स्टार्टर', planProfessional: 'प्रोफेशनल', planEnterprise: 'एंटरप्राइज',
    planStarterFeatures: ['5 AI एजेंट', '1,000 कॉल/महीना', 'बेसिक एनालिटिक्स'],
    planProFeatures: ['15 AI एजेंट', '5,000 कॉल/महीना', 'एडवांस्ड एनालिटिक्स'],
    planEntFeatures: ['अनलिमिटेड एजेंट', 'अनलिमिटेड कॉल', 'प्रायोरिटी सपोर्ट'],
    mostPopular: 'सबसे लोकप्रिय',
    step1Title: 'खाता बनाएं', step1Desc: 'अपने बिजनेस ईमेल से साइन अप करें',
    step2Title: 'एजेंट कॉन्फ़िगर करें', step2Desc: 'अपने AI रिसेप्शनिस्ट को कस्टमाइज करें',
    step3Title: 'प्राप्त करना शुरू करें', step3Desc: 'मिनटों में लाइव करें',
    featureAiVoice: 'AI वॉइस', featureAiVoiceDesc: 'नेचुरल वॉइस AI कॉल',
    featureSms: 'SMS', featureSmsDesc: 'ऑटोमेटेड टेक्स्ट मैसेजिंग',
    featurePayments: 'पेमेंट', featurePaymentsDesc: 'ऑटोमेटेड सब्सक्रिप्शन',
    featureAnalytics: 'रीयल-टाइम एनालिटिक्स', featureAnalyticsDesc: 'प्रदर्शन की निगरानी करें',
    metricActiveAgents: 'सक्रिय एजेंट', metricCallsToday: 'आज के कॉल', metricResponseTime: 'प्रतिक्रिया समय', metricSatisfaction: 'संतुष्टि',
    ctaStartTrial: 'मुफ्त ट्रायल शुरू करें', ctaSignIn: 'साइन इन',
    navSignIn: 'साइन इन', navCta: 'मुफ्त ट्रायल'
  },
  ar: {
    slide1Title: 'مرحبًا بك في FrontDesk Agents', slide1Subtitle: 'منصة مسؤول الاستقبال الأكثر تطورًا في العالم', slide1Desc: 'حوّل اتصالات عملك مع وكلاء ذكاء اصطناعي أذكياء يتعاملون مع المكالمات والحجوزات واستفسارات العملاء على مدار الساعة.',
    slide2Title: 'تسعير بسيط وشفاف', slide2Subtitle: 'اختر الخطة التي تناسب عملك', slide2Desc: 'ابدأ بإصدار تجريبي مجاني لمدة 14 يومًا. لا بطاقة ائتمان.',
    slide3Title: 'ابدأ في دقائق', slide3Subtitle: 'عملية تسجيل بسيطة في 3 خطوات', slide3Desc: 'أنشئ حسابك ووزّع وكلاء الذكاء الاصطناعي وابدأ في قبول المكالمات.',
    slide4Title: 'ميزات قوية', slide4Subtitle: 'كل ما تحتاجه للتوسع', slide4Desc: 'تكاملات مدمجة مع الأدوات التي تستخدمها بالفعل.',
    slide5Title: 'لوحة قيادة ذكية', slide5Subtitle: 'رؤى مدعومة بالذكاء الاصطناعي في متناول يدك', slide5Desc: 'راقب وكلاء الذكاء الاصطناعي وتتبع مقاييس المكالمات وحسّن الأداء.',
    slide6Title: 'هل أنت مستعد لتحويل عملك؟', slide6Subtitle: 'ابدأ تجربتك المجانية اليوم', slide6Desc: 'لا بطاقة ائتمان. إلغاء في أي وقت.',
    planStarter: 'المبتدئ', planProfessional: 'المحترف', planEnterprise: 'المؤسسات',
    planStarterFeatures: ['5 وكلاء AI', '1,000 مكالمة/شهر', 'تحليلات أساسية'],
    planProFeatures: ['15 وكيل AI', '5,000 مكالمة/شهر', 'تحليلات متقدمة'],
    planEntFeatures: ['وكلاء غير محدودين', 'مكالمات غير محدودة', 'دعم أولوي'],
    mostPopular: 'الأكثر شعبية',
    step1Title: 'إنشاء حساب', step1Desc: 'سجّل ببريدك الإلكتروني التجاري',
    step2Title: 'تكوين الوكلاء', step2Desc: 'خصص مسؤول الاستقبال الذكي',
    step3Title: 'ابدأ الاستقبال', step3Desc: 'انطلق في دقائق',
    featureAiVoice: 'صوت الذكاء الاصطناعي', featureAiVoiceDesc: 'مكالمات صوتية طبيعية',
    featureSms: 'رسائل', featureSmsDesc: 'مراسلات نصية آلية',
    featurePayments: 'المدفوعات', featurePaymentsDesc: 'اشتراكات آلية',
    featureAnalytics: 'تحليلات في الوقت الفعلي', featureAnalyticsDesc: 'مراقبة الأداء',
    metricActiveAgents: 'الوكلاء النشطون', metricCallsToday: 'مكالمات اليوم', metricResponseTime: 'وقت الاستجابة', metricSatisfaction: 'الرضا',
    ctaStartTrial: 'ابدأ التجربة المجانية', ctaSignIn: 'تسجيل الدخول',
    navSignIn: 'تسجيل الدخول', navCta: 'تجربة مجانية'
  },
  pt: {
    slide1Title: 'Bem-vindo ao FrontDesk Agents', slide1Subtitle: 'A Plataforma de Recepcionista de IA Mais Avançada do Mundo', slide1Desc: 'Transforme suas comunicações de negócios com agentes IA inteligentes que lidam com chamadas, reservas e inquiries de clientes 24/7.',
    slide2Title: 'Preços Simples e Transparentes', slide2Subtitle: 'Escolha o plano que se adapta ao seu negócio', slide2Desc: 'Comece com um teste gratuito de 14 dias. Sem cartão de crédito.',
    slide3Title: 'Comece em Minutos', slide3Subtitle: 'Processo de cadastro simples em 3 etapas', slide3Desc: 'Crie sua conta, configure seus agentes IA e comece a aceitar chamadas.',
    slide4Title: 'Recursos Poderosos', slide4Subtitle: 'Tudo que você precisa para escalar', slide4Desc: 'Integrações incorporadas com as ferramentas que você já usa.',
    slide5Title: 'Painel Inteligente', slide5Subtitle: 'Insights impulsionados por IA ao seu alcance', slide5Desc: 'Monitore seus agentes IA, acompanhe métricas de chamadas e otimize o desempenho.',
    slide6Title: 'Pronto para Transformar Seu Negócio?', slide6Subtitle: 'Comece seu teste gratuito hoje', slide6Desc: 'Sem cartão de crédito. Cancele a qualquer momento.',
    planStarter: 'Inicial', planProfessional: 'Profissional', planEnterprise: 'Empresarial',
    planStarterFeatures: ['5 Agentes IA', '1,000 chamadas/mês', 'Análise Básica'],
    planProFeatures: ['15 Agentes IA', '5,000 chamadas/mês', 'Análise Avançada'],
    planEntFeatures: ['Agentes Ilimitados', 'Chamadas Ilimitadas', 'Suporte Prioritário'],
    mostPopular: 'Mais Popular',
    step1Title: 'Criar Conta', step1Desc: 'Cadastre-se com seu email comercial',
    step2Title: 'Configurar Agentes', step2Desc: 'Personalize seu recepcionista IA',
    step3Title: 'Começar a Receber', step3Desc: 'Lance em minutos',
    featureAiVoice: 'Voz IA', featureAiVoiceDesc: 'Chamadas de voz IA naturais',
    featureSms: 'SMS', featureSmsDesc: 'Mensagens de texto automatizadas',
    featurePayments: 'Pagamentos', featurePaymentsDesc: 'Assinaturas automatizadas',
    featureAnalytics: 'Análise em Tempo Real', featureAnalyticsDesc: 'Monitore o desempenho',
    metricActiveAgents: 'Agentes Ativos', metricCallsToday: 'Chamadas Hoje', metricResponseTime: 'Tempo de Resposta', metricSatisfaction: 'Satisfação',
    ctaStartTrial: 'Começar Teste Grátis', ctaSignIn: 'Entrar',
    navSignIn: 'Entrar', navCta: 'Teste Grátis'
  },
  ko: {
    slide1Title: 'FrontDesk Agents에 오신 것을 환영합니다', slide1Subtitle: '세계에서 가장 진보된 AI 리셉셔니스트 플랫폼', slide1Desc: '통화, 예약 및 고객 문의를 24/7 처리하는 똑똑한 AI 에이전트로 비즈니스 커뮤니케이션을 혁신하세요.',
    slide2Title: '단순하고 투명한 가격', slide2Subtitle: '비즈니스에 맞는 플랜을 선택하세요', slide2Desc: '14일 무료 체험으로 시작하세요. 신용카드 필요 없음.',
    slide3Title: '몇 분 만에 시작', slide3Subtitle: '간단한 3단계 가입 프로세스', slide3Desc: '계정을 만들고 AI 에이전트를 구성하며 전화를受け入れ 시작하세요.',
    slide4Title: '강력한 기능', slide4Subtitle: '확장하는 데 필요한 모든 것', slide4Desc: '이미 사용 중인 도구와 기본 통합됩니다.',
    slide5Title: '지능형 대시보드', slide5Subtitle: '손끝에서 AI 기반 인사이트', slide5Desc: 'AI 에이전트를 모니터링하고通话 지표를 추적하며 성능을 최적화하세요.',
    slide6Title: '비즈니스를 혁신할 준비가 되셨나요?', slide6Subtitle: '오늘 무료 체험을 시작하세요', slide6Desc: '신용카드 필요 없음. 언제든 취소 가능.',
    planStarter: '스타터', planProfessional: '프로페셔널', planEnterprise: '엔터프라이즈',
    planStarterFeatures: ['5개 AI 에이전트', '1,000회通话/월', '기본 분석'],
    planProFeatures: ['15개 AI 에이전트', '5,000회通话/월', '고급 분석'],
    planEntFeatures: ['무제한 에이전트', '무제한通话', '우선 지원'],
    mostPopular: '가장 인기',
    step1Title: '계정 만들기', step1Desc: '비즈니스 이메일로 가입하세요',
    step2Title: '에이전트 구성', step2Desc: 'AI 리셉셔니스트를 커스터마이즈하세요',
    step3Title: '수신 시작', step3Desc: '몇 분 만에 런칭하세요',
    featureAiVoice: 'AI 음성', featureAiVoiceDesc: '자연스러운 음성 AI通话',
    featureSms: 'SMS', featureSmsDesc: '자동 문자 메시지',
    featurePayments: '결제', featurePaymentsDesc: '자동 구독',
    featureAnalytics: '실시간 분석', featureAnalyticsDesc: '성능 모니터링',
    metricActiveAgents: '활성 에이전트', metricCallsToday: '오늘의通话', metricResponseTime: '응답 시간', metricSatisfaction: '만족도',
    ctaStartTrial: '무료 체험 시작', ctaSignIn: '로그인',
    navSignIn: '로그인', navCta: '무료 체험'
  },
  ja: {
    slide1Title: 'FrontDesk Agentsへようこそ', slide1Subtitle: '世界で最も先进的なAI受付プラットフォーム', slide1Desc: '通話、予約、客户問い合わせを24/7处理的聪明的AIエージェントでビジネスコミュニケーションを変革します。',
    slide2Title: 'シンプル透明的価格設定', slide2Subtitle: 'ビジネスに合ったプランを選択', slide2Desc: '14日間無料トライアルから開始。クレジットカード不要。',
    slide3Title: '数分で開始', slide3Subtitle: 'シンプルな3ステップ登録プロセス', slide3Desc: 'アカウントを作成し、AIエージェントを構成し、通話の受け入れを開始します。',
    slide4Title: '強力な機能', slide4Subtitle: 'スケールに必要なすべて', slide4Desc: 'Already使用的ツールとの組み込み統合。',
    slide5Title: 'インテリジェントダッシュボード', slide5Subtitle: '指の届くAI駆動のインサイト', slide5Desc: 'AIエージェントを監視し、通話の指標を追跡し、パフォーマンスを最適化します。',
    slide6Title: 'ビジネスを変革する準備ができましたか？', slide6Subtitle: '，今日無料トライアルを開始してください', slide6Desc: 'クレジットカード不要。いつでもキャンセル可能。',
    planStarter: 'スターター', planProfessional: 'プロフェッショナル', planEnterprise: 'エンタープライズ',
    planStarterFeatures: ['5つのAIエージェント', '1,000回通话/月', '基本分析'],
    planProFeatures: ['15のAIエージェント', '5,000回通话/月', '高度な分析'],
    planEntFeatures: ['無制限エージェント', '無制限通话', '優先サポート'],
    mostPopular: '最も人気',
    step1Title: 'アカウント作成', step1Desc: 'ビジネスメールで登録',
    step2Title: 'エージェント構成', step2Desc: 'AI受付をカスタマイズ',
    step3Title: '受信開始', step3Desc: '数分でローンチ',
    featureAiVoice: 'AI音声', featureAiVoiceDesc: '自然な音声AI通话',
    featureSms: 'SMS', featureSmsDesc: '自動テキストメッセージ',
    featurePayments: '決済', featurePaymentsDesc: '自動サブスクリプション',
    featureAnalytics: 'リアルタイム分析', featureAnalyticsDesc: 'パフォーマンス監視',
    metricActiveAgents: 'アクティブエージェント', metricCallsToday: '本日の通话', metricResponseTime: '応答時間', metricSatisfaction: '満足度',
    ctaStartTrial: '無料トライアルを開始', ctaSignIn: 'ログイン',
    navSignIn: 'ログイン', navCta: '無料トライアル'
  },
  vi: {
    slide1Title: 'Chào mừng đến FrontDesk Agents', slide1Subtitle: 'Nền tảng Lễ tân AI tiên tiến nhất thế giới', slide1Desc: 'Chuyển đổi giao tiếp kinh doanh của bạn với các tác nhân AI thông minh xử lý cuộc gọi, đặt phòng và câu hỏi của khách hàng 24/7.',
    slide2Title: 'Giá Cả Đơn Giản, Minh Bạch', slide2Subtitle: 'Chọn kế hoạch phù hợp với doanh nghiệp của bạn', slide2Desc: 'Bắt đầu với dùng thử miễn phí 14 ngày. Không cần thẻ tín dụng.',
    slide3Title: 'Bắt đầu trong vài phút', slide3Subtitle: 'Quy trình đăng ký 3 bước đơn giản', slide3Desc: 'Tạo tài khoản của bạn, cấu hình tác nhân AI của bạn và bắt đầu nhận cuộc gọi.',
    slide4Title: 'Tính năng mạnh mẽ', slide4Subtitle: 'Mọi thứ bạn cần để mở rộng', slide4Desc: 'Tích hợp sẵn với các công cụ bạn đã sử dụng.',
    slide5Title: 'Bảng điều khiển thông minh', slide5Subtitle: 'Thông tin chi tiết do AI驱动尽在指尖', slide5Desc: 'Giám sát tác nhân AI của bạn, theo dõi số liệu cuộc gọi và tối ưu hóa hiệu suất.',
    slide6Title: 'Sẵn sàng chuyển đổi doanh nghiệp của bạn?', slide6Subtitle: 'Bắt đầu dùng thử miễn phí hôm nay', slide6Desc: 'Không cần thẻ tín dụng. Hủy bất cứ lúc nào.',
    planStarter: 'Starter', planProfessional: 'Professional', planEnterprise: 'Enterprise',
    planStarterFeatures: ['5 Tác nhân AI', '1,000 cuộc gọi/tháng', 'Phân tích Cơ bản'],
    planProFeatures: ['15 Tác nhân AI', '5,000 cuộc gọi/tháng', 'Phân tích Nâng cao'],
    planEntFeatures: ['Tác nhân Không giới hạn', 'Cuộc gọi Không giới hạn', 'Hỗ trợ Ưu tiên'],
    mostPopular: 'Phổ biến nhất',
    step1Title: 'Tạo Tài khoản', step1Desc: 'Đăng ký với email kinh doanh của bạn',
    step2Title: 'Cấu hình Tác nhân', step2Desc: 'Tùy chỉnh lễ tân AI của bạn',
    step3Title: 'Bắt đầu Nhận', step3Desc: 'Ra mắt trong vài phút',
    featureAiVoice: 'Giọng AI', featureAiVoiceDesc: 'Cuộc gọi giọng AI tự nhiên',
    featureSms: 'SMS', featureSmsDesc: 'Nhắn tin tự động',
    featurePayments: 'Thanh toán', featurePaymentsDesc: 'Đăng ký tự động',
    featureAnalytics: 'Phân tích Thời gian thực', featureAnalyticsDesc: 'Giám sát hiệu suất',
    metricActiveAgents: 'Tác nhân Hoạt động', metricCallsToday: 'Cuộc gọi Hôm nay', metricResponseTime: 'Thời gian Phản hồi', metricSatisfaction: 'Sự hài lòng',
    ctaStartTrial: 'Bắt Đầu Dùng Thử Miễn Phí', ctaSignIn: 'Đăng nhập',
    navSignIn: 'Đăng nhập', navCta: 'Dùng thử miễn phí'
  },
  tl: {
    slide1Title: 'Maligayang Pagdating sa FrontDesk Agents', slide1Subtitle: 'Ang Pinaka-advanced na AI Receptionist Platform sa Mundo', slide1Desc: 'I-transform ang iyong business communication gamit ang mga intelligent na AI agents na tumutugon sa mga tawag, booking, at customer inquiries 24/7.',
    slide2Title: 'Simple, Transparent na Pagpe-presyo', slide2Subtitle: 'Pumili ng planong angkop sa iyong negosyo', slide2Desc: 'Magsimula sa 14-araw na libreng trial. Walang credit card kinakailangan.',
    slide3Title: 'Magsimula sa Loob ng Minutes', slide3Subtitle: 'Simple 3-step signup process', slide3Desc: 'Gumawa ng account, i-configure ang iyong AI agents, at simulan ang pagtanggap ng mga tawag.',
    slide4Title: 'Mga Powerful na Features', slide4Subtitle: 'Everything you need to scale', slide4Desc: 'Built-in integrations sa mga tool na ginagamit mo na.',
    slide5Title: 'Intelligent na Dashboard', slide5Subtitle: 'AI-powered insights sa iyong mga daliri', slide5Desc: 'Subaybayan ang iyong AI agents, i-track ang call metrics, at i-optimize ang performance.',
    slide6Title: 'Handa na ba Baguhin ang Iyong Negosyo?', slide6Subtitle: 'Simulan ang iyong libreng trial ngayon', slide6Desc: 'Walang credit card kinakailangan. Mag-cancel kahit kailan.',
    planStarter: 'Starter', planProfessional: 'Professional', planEnterprise: 'Enterprise',
    planStarterFeatures: ['5 AI Agents', '1,000 calls/buwan', 'Basic Analytics'],
    planProFeatures: ['15 AI Agents', '5,000 calls/buwan', 'Advanced Analytics'],
    planEntFeatures: ['Unlimited Agents', 'Unlimited Calls', 'Priority Support'],
    mostPopular: 'Pinaka-popular',
    step1Title: 'Gumawa ng Account', step1Desc: 'Mag-sign up gamit ang iyong business email',
    step2Title: 'I-configure ang Agents', step2Desc: 'I-customize ang iyong AI receptionist',
    step3Title: 'Magsimula ng Tumanggap', step3Desc: 'Mag-live sa loob ng minutes',
    featureAiVoice: 'AI Voice', featureAiVoiceDesc: 'Natural na voice AI calls',
    featureSms: 'SMS', featureSmsDesc: 'Automated na text messaging',
    featurePayments: 'Payments', featurePaymentsDesc: 'Automated na subscriptions',
    featureAnalytics: 'Real-time Analytics', featureAnalyticsDesc: 'Subaybayan ang performance',
    metricActiveAgents: 'Active Agents', metricCallsToday: 'Calls Ngayon', metricResponseTime: 'Response Time', metricSatisfaction: 'Satisfaction',
    ctaStartTrial: 'Simulan ang Libreng Trial', ctaSignIn: 'Mag-sign In',
    navSignIn: 'Mag-sign In', navCta: 'Libreng Trial'
  },
  de: {
    slide1Title: 'Willkommen bei FrontDesk Agents', slide1Subtitle: 'Die fortschrittlichste KI-Empfangsplattform der Welt', slide1Desc: 'Transformieren Sie Ihre Unternehmens-kommunikation mit intelligenten KI-Agenten, die 24/7 Anrufe, Buchungen und Kundenanfragen bearbeiten.',
    slide2Title: 'Einfache, transparente Preise', slide2Subtitle: 'Wählen Sie den Plan, der zu Ihrem Unternehmen passt', slide2Desc: 'Starten Sie mit einem 14-tägigen kostenlosen Test. Keine Kreditkarte erforderlich.',
    slide3Title: 'Starten Sie in Minuten', slide3Subtitle: 'Einfacher 3-Schritte-Anmeldeprozess', slide3Desc: 'Erstellen Sie Ihr Konto, konfigurieren Sie Ihre KI-Agenten und beginnen Sie mit der Annahme von Anrufen.',
    slide4Title: 'Leistungsstarke Funktionen', slide4Subtitle: 'Alles, was Sie zum Skalieren brauchen', slide4Desc: 'Integrierte Verbindungen mit den Tools, die Sie bereits verwenden.',
    slide5Title: 'Intelligentes Dashboard', slide5Subtitle: 'KI-gesteuerte Einblicke zu Ihre fingerspitzen', slide5Desc: 'Überwachen Sie Ihre KI-Agenten, verfolgen Sie Anrufmetriken und optimieren Sie die Leistung.',
    slide6Title: 'Bereit, Ihr Unternehmen zu transformieren?', slide6Subtitle: 'Starten Sie noch heute Ihren kostenlosen Test', slide6Desc: 'Keine Kreditkarte erforderlich. Jederzeit kündbar.',
    planStarter: 'Starter', planProfessional: 'Professional', planEnterprise: 'Enterprise',
    planStarterFeatures: ['5 KI-Agenten', '1.000 Anrufe/Monat', 'Basis-Analytik'],
    planProFeatures: ['15 KI-Agenten', '5.000 Anrufe/Monat', 'Erweiterte Analytik'],
    planEntFeatures: ['Unbegrenzte Agenten', 'Unbegrenzte Anrufe', 'Prioritäts-Support'],
    mostPopular: 'Am beliebtesten',
    step1Title: 'Konto erstellen', step1Desc: 'Melden Sie sich mit Ihrer geschäftlichen E-Mail an',
    step2Title: 'Agenten konfigurieren', step2Desc: 'Passen Sie Ihren KI-Empfang an',
    step3Title: 'Empfang starten', step3Desc: 'Starten Sie in wenigen Minuten',
    featureAiVoice: 'KI-Stimme', featureAiVoiceDesc: 'Natürliche Sprach-KI-Anrufe',
    featureSms: 'SMS', featureSmsDesc: 'Automatische Textnachrichten',
    featurePayments: 'Zahlungen', featurePaymentsDesc: 'Automatische Abonnements',
    featureAnalytics: 'Echtzeit-Analytik', featureAnalyticsDesc: 'Überwachen Sie die Leistung',
    metricActiveAgents: 'Aktive Agenten', metricCallsToday: 'Anrufe heute', metricResponseTime: 'Reaktionszeit', metricSatisfaction: 'Zufriedenheit',
    ctaStartTrial: 'Kostenlos testen', ctaSignIn: 'Anmelden',
    navSignIn: 'Anmelden', navCta: 'Kostenlos testen'
  },
  it: {
    slide1Title: 'Benvenuto in FrontDesk Agents', slide1Subtitle: "La Piattaforma di Receptionist AI più Avanzata al Mondo", slide1Desc: "Trasforma la comunicazione aziendale con agenti AI intelligenti che gestiscono chiamate, prenotazioni e richieste dei clienti 24/7.",
    slide2Title: 'Prezzi Semplici e Trasparenti', slide2Subtitle: "Scegli il piano adatto alla tua azienda", slide2Desc: "Inizia con una prova gratuita di 14 giorni. Nessuna carta di credito richiesta.",
    slide3Title: 'Inizia in Pochi Minuti', slide3Subtitle: 'Semplice processo di registrazione in 3 passi', slide3Desc: "Crea il tuo account, configura i tuoi agenti AI e inizia ad accettare chiamate.",
    slide4Title: 'Funzionalità Potenti', slide4Subtitle: 'Tutto ciò di cui hai bisogno per scalare', slide4Desc: "Integrazioni incorporate con gli strumenti che usi già.",
    slide5Title: 'Dashboard Intelligente', slide5Subtitle: "Insights guidati dall'AI a portata di mano", slide5Desc: "Monitora i tuoi agenti AI, traccia le metriche delle chiamate e ottimizza le prestazioni.",
    slide6Title: 'Pronto a Trasformare la Tua Azienda?', slide6Subtitle: "Inizia la tua prova gratuita oggi", slide6Desc: "Nessuna carta di credito richiesta. Annulla quando vuoi.",
    planStarter: 'Starter', planProfessional: 'Professional', planEnterprise: 'Enterprise',
    planStarterFeatures: ['5 Agenti AI', '1.000 chiamate/mese', 'Analisi Base'],
    planProFeatures: ['15 Agenti AI', '5.000 chiamate/mese', 'Analisi Avanzata'],
    planEntFeatures: ['Agenti Illimitati', 'Chiamate Illimitate', 'Supporto Prioritario'],
    mostPopular: 'Più popolare',
    step1Title: 'Crea Account', step1Desc: "Registrati con la tua email aziendale",
    step2Title: 'Configura Agenti', step2Desc: "Personalizza il tuo receptionist AI",
    step3Title: 'Inizia a Ricevere', step3Desc: "Lancia in pochi minuti",
    featureAiVoice: 'Voce AI', featureAiVoiceDesc: 'Chiamate vocali AI naturali',
    featureSms: 'SMS', featureSmsDesc: 'Messaggi di testo automatizzati',
    featurePayments: 'Pagamenti', featurePaymentsDesc: 'Abbonamenti automatizzati',
    featureAnalytics: 'Analisi in Tempo Reale', featureAnalyticsDesc: "Monitora le prestazioni",
    metricActiveAgents: 'Agenti Attivi', metricCallsToday: 'Chiamate Oggi', metricResponseTime: 'Tempo di Risposta', metricSatisfaction: 'Soddisfazione',
    ctaStartTrial: 'Inizia la Prova Gratuita', ctaSignIn: 'Accedi',
    navSignIn: 'Accedi', navCta: 'Prova Gratuita'
  },
  ru: {
    slide1Title: 'Добро пожаловать в FrontDesk Agents', slide1Subtitle: 'Самая продвинутая платформа ИИ-ресепшена в мире', slide1Desc: 'Преобразуйте коммуникацию вашего бизнеса с помощью интеллектуальных ИИ-агентов, которые обрабатывают звонки, бронирования и запросы клиентов 24/7.',
    slide2Title: 'Простые, прозрачные цены', slide2Subtitle: 'Выберите план, подходящий для вашего бизнеса', slide2Desc: 'Начните с 14-дневного бесплатного пробного периода. Кредитная карта не требуется.',
    slide3Title: 'Начните за минуты', slide3Subtitle: 'Простой процесс регистрации в 3 шага', slide3Desc: 'Создайте свой аккаунт, настройте своих ИИ-агентов и начните принимать звонки.',
    slide4Title: 'Мощные функции', slide4Subtitle: 'Все, что вам нужно для масштабирования', slide4Desc: 'Встроенные интеграции с инструментами, которые вы уже используете.',
    slide5Title: 'Интеллектуальная панель управления', slide5Subtitle: 'ИИ-управляемые инсайты у вас под рукой', slide5Desc: 'Отслеживайте своих ИИ-агентов, отслеживайте показатели звонков и оптимизируйте производительность.',
    slide6Title: 'Готовы трансформировать свой бизнес?', slide6Subtitle: 'Начните бесплатную пробную версию сегодня', slide6Desc: 'Кредитная карта не требуется. Отмените в любое время.',
    planStarter: 'Стартер', planProfessional: 'Профессионал', planEnterprise: 'Корпоративный',
    planStarterFeatures: ['5 ИИ-агентов', '1,000 звонков/мес', 'Базовая аналитика'],
    planProFeatures: ['15 ИИ-агентов', '5,000 звонков/мес', 'Продвинутая аналитика'],
    planEntFeatures: ['Безлимитные агенты', 'Безлимитные звонки', 'Приоритетная поддержка'],
    mostPopular: 'Самый популярный',
    step1Title: 'Создать аккаунт', step1Desc: 'Зарегистрируйтесь с помощью рабочей почты',
    step2Title: 'Настроить агентов', step2Desc: 'Настройте своего ИИ-ресепшена',
    step3Title: 'Начать прием', step3Desc: 'Запустите за минуты',
    featureAiVoice: 'ИИ-голос', featureAiVoiceDesc: 'Естественные голосовые ИИ-звонки',
    featureSms: 'SMS', featureSmsDesc: 'Автоматические текстовые сообщения',
    featurePayments: 'Платежи', featurePaymentsDesc: 'Автоматические подписки',
    featureAnalytics: 'Аналитика в реальном времени', featureAnalyticsDesc: 'Отслеживайте производительность',
    metricActiveAgents: 'Активные агенты', metricCallsToday: 'Звонки сегодня', metricResponseTime: 'Время ответа', metricSatisfaction: 'Удовлетворенность',
    ctaStartTrial: 'Начать бесплатный пробный период', ctaSignIn: 'Войти',
    navSignIn: 'Войти', navCta: 'Бесплатный пробный'
  }
}

import { useRTL } from '../lib/useRTL'

export default function DemoPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [progress, setProgress] = useState(0)
  const { lang: language, setLang, isRTL, handleLanguageChange } = useRTL()

  const t = translations[language] || translations['en']

  const slides = [
    { id: 'hero', titleKey: 'slide1Title', subtitleKey: 'slide1Subtitle', descKey: 'slide1Desc', bgGradient: 'from-slate-900 via-purple-900 to-slate-900' },
    { id: 'pricing', titleKey: 'slide2Title', subtitleKey: 'slide2Subtitle', descKey: 'slide2Desc', bgGradient: 'from-blue-900 via-indigo-900 to-purple-900', type: 'pricing' },
    { id: 'signup', titleKey: 'slide3Title', subtitleKey: 'slide3Subtitle', descKey: 'slide3Desc', bgGradient: 'from-emerald-900 via-teal-900 to-cyan-900', type: 'steps' },
    { id: 'features', titleKey: 'slide4Title', subtitleKey: 'slide4Subtitle', descKey: 'slide4Desc', bgGradient: 'from-orange-900 via-red-900 to-pink-900', type: 'features' },
    { id: 'dashboard', titleKey: 'slide5Title', subtitleKey: 'slide5Subtitle', descKey: 'slide5Desc', bgGradient: 'from-violet-900 via-purple-900 to-fuchsia-900', type: 'metrics' },
    { id: 'cta', titleKey: 'slide6Title', subtitleKey: 'slide6Subtitle', descKey: 'slide6Desc', bgGradient: 'from-green-900 via-emerald-900 to-teal-900', type: 'cta' }
  ]

  useEffect(() => {
    if (!isAutoPlaying) return
    const interval = setInterval(() => {
      setProgress(p => p < 100 ? p + 2 : 100)
    }, 100)
    return () => clearInterval(interval)
  }, [isAutoPlaying])

  useEffect(() => {
    if (!isAutoPlaying || progress < 100) return
    const timer = setTimeout(() => {
      setCurrentSlide(c => (c + 1) % slides.length)
      setProgress(0)
    }, 500)
    return () => clearTimeout(timer)
  }, [isAutoPlaying, progress, slides.length])

  const nextSlide = () => {
    setIsAutoPlaying(false)
    setCurrentSlide(c => (c + 1) % slides.length)
    setProgress(0)
  }

  const prevSlide = () => {
    setIsAutoPlaying(false)
    setCurrentSlide(c => (c - 1 + slides.length) % slides.length)
    setProgress(0)
  }

  const current = slides[currentSlide]

  return (
    <div className={`min-h-screen bg-gradient-to-br ${current.bgGradient} transition-all duration-700`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
        <motion.div className="h-full bg-green-400" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.1 }} />
      </div>

      <header className="absolute top-4 left-0 right-0 p-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
            <Phone className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">FrontDesk Agents</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/customer/login" className="text-white/80 hover:text-white transition">{t.navSignIn}</Link>
          <LanguageSelector currentLang={language} onChange={handleLanguageChange} />
          <Link href="/customer/signup" className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition">{t.navCta}</Link>
        </div>
      </header>

      <div className="min-h-screen flex items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div key={currentSlide} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }} className="max-w-4xl w-full text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">{t[current.titleKey]}</h1>
            <p className="text-2xl md:text-3xl text-white/80 mb-8">{t[current.subtitleKey]}</p>
            <p className="text-lg text-white/60 mb-12 max-w-2xl mx-auto">{t[current.descKey]}</p>

            {current.type === 'pricing' && (
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {[{ nameKey: 'planStarter', featuresKey: 'planStarterFeatures' }, { nameKey: 'planProfessional', featuresKey: 'planProFeatures', popular: true }, { nameKey: 'planEnterprise', featuresKey: 'planEntFeatures' }].map((plan, i) => (
                  <motion.div key={plan.nameKey} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className={`bg-white/10 backdrop-blur-sm rounded-2xl p-6 ${plan.popular ? 'ring-2 ring-green-400 scale-105' : ''}`}>
                    {plan.popular && <span className="inline-block px-3 py-1 bg-green-500 text-white text-sm rounded-full mb-4">{t.mostPopular}</span>}
                    <h3 className="text-xl font-bold text-white mb-2">{t[plan.nameKey]}</h3>
                    <div className="text-4xl font-bold text-white mb-4">$299<span className="text-lg text-white/60">/mo</span></div>
                    <ul className="space-y-2">
                      {(t[plan.featuresKey] as string[]).map((f: string) => (
                        <li key={f} className="flex items-center gap-2 text-white/80"><Check className="w-4 h-4 text-green-400" />{f}</li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            )}

            {current.type === 'steps' && (
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                {[{ icon: Users, titleKey: 'step1Title', descKey: 'step1Desc' }, { icon: Brain, titleKey: 'step2Title', descKey: 'step2Desc' }, { icon: Phone, titleKey: 'step3Title', descKey: 'step3Desc' }].map((step, i) => (
                  <motion.div key={step.titleKey} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.15 }} className="text-center">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4"><step.icon className="w-8 h-8 text-white" /></div>
                    <h3 className="text-xl font-bold text-white mb-2">{t[step.titleKey]}</h3>
                    <p className="text-white/60">{t[step.descKey]}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {current.type === 'features' && (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {[{ icon: Zap, nameKey: 'featureAiVoice', descKey: 'featureAiVoiceDesc' }, { icon: Shield, nameKey: 'featureSms', descKey: 'featureSmsDesc' }, { icon: CreditCard, nameKey: 'featurePayments', descKey: 'featurePaymentsDesc' }, { icon: Activity, nameKey: 'featureAnalytics', descKey: 'featureAnalyticsDesc' }].map((f, i) => (
                  <motion.div key={f.nameKey} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <f.icon className="w-10 h-10 text-green-400 mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">{t[f.nameKey]}</h3>
                    <p className="text-white/60 text-sm">{t[f.descKey]}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {current.type === 'metrics' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                {[{ icon: Brain, labelKey: 'metricActiveAgents', value: '5' }, { icon: Phone, labelKey: 'metricCallsToday', value: '127' }, { icon: Activity, labelKey: 'metricResponseTime', value: '0.8s' }, { icon: TrendingUp, labelKey: 'metricSatisfaction', value: '99.2%' }].map((m, i) => (
                  <motion.div key={m.labelKey} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <m.icon className="w-8 h-8 text-green-400 mb-2 mx-auto" />
                    <div className="text-3xl font-bold text-white mb-1">{m.value}</div>
                    <div className="text-white/60 text-sm">{t[m.labelKey]}</div>
                  </motion.div>
                ))}
              </div>
            )}

            {current.type === 'cta' && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/customer/signup" className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-lg transition flex items-center justify-center gap-2">{t.ctaStartTrial}<ChevronRight className="w-5 h-5" /></Link>
                <Link href="/customer/login" className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-lg transition">{t.ctaSignIn}</Link>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-8 left-0 right-0">
        <div className="flex justify-center gap-3 mb-6">
          {slides.map((_, i) => (
            <button key={i} onClick={() => { setCurrentSlide(i); setProgress(0); setIsAutoPlaying(false) }} className={`w-3 h-3 rounded-full transition-all ${i === currentSlide ? 'bg-white w-8' : 'bg-white/30 hover:bg-white/50'}`} />
          ))}
        </div>
        <div className="flex justify-center items-center gap-4">
          <button onClick={prevSlide} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition"><ChevronLeft className="w-6 h-6 text-white" /></button>
          <button onClick={() => setIsAutoPlaying(!isAutoPlaying)} className="p-4 bg-white/10 hover:bg-white/20 rounded-full transition">{isAutoPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white" />}</button>
          <button onClick={nextSlide} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition"><ChevronRight className="w-6 h-6 text-white" /></button>
        </div>
      </div>

      <div className="absolute bottom-8 right-6">
        <div className="flex items-center gap-2 px-4 py-2 bg-black/30 backdrop-blur-sm rounded-full">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-white/80 text-sm">www.frontdeskagents.com</span>
        </div>
      </div>
    </div>
  )
}