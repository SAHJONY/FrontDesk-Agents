'use client'

import { useState, useEffect } from 'react'
import { Shield, Lock, Eye, FileText, Mail, Clock, Globe, Server } from 'lucide-react'
import Link from 'next/link'
import LanguageSelector from '../components/LanguageSelector'

const BotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="16" height="16" x="4" y="4" rx="2" /><path d="M9 1v3M15 1v3M9 13l3 3 3-3M12 16V8" />
  </svg>
)

// 14 Language translations
const translations = {
  en: {
    title: 'Privacy Policy',
    lastUpdated: 'Last updated: May 21, 2026',
    legal: 'Legal',
    backToHome: '← Back to Home',
    tableOfContents: 'Table of Contents',
    informationWeCollect: 'Information We Collect',
    howWeUseYourData: 'How We Use Your Data',
    dataProtection: 'Data Protection',
    informationSharing: 'Information Sharing',
    yourRights: 'Your Rights',
    cookiesTracking: 'Cookies & Tracking',
    dataRetention: 'Data Retention',
    contactUs: 'Contact Us',
    personalInformation: 'Personal Information',
    usageData: 'Usage Data',
    businessData: 'Business Data',
    serviceDelivery: 'Service Delivery',
    accountManagement: 'Account Management',
    serviceImprovement: 'Service Improvement',
    communication: 'Communication',
    security: 'Security',
    encryption: 'Encryption',
    secureInfrastructure: 'Secure Infrastructure',
    accessControl: 'Access Control',
    hipaaCompliance: 'HIPAA Compliance',
    encryptionDesc: 'All data encrypted at rest (AES-256) and in transit (TLS 1.3)',
    infrastructureDesc: 'Hosted on Vercel with enterprise-grade security and DDoS protection',
    accessControlDesc: 'Role-based access control with MFA enforcement and audit logging',
    hipaaDesc: 'Enterprise plan includes full HIPAA compliance with Business Associate Agreement',
    serviceProviders: 'Service Providers',
    legalRequirements: 'Legal Requirements',
    businessTransfers: 'Business Transfers',
    withYourConsent: 'With Your Consent',
    accessPortability: 'Access & Portability',
    correction: 'Correction',
    deletion: 'Deletion',
    optOut: 'Opt-Out',
    accessDesc: 'Request a copy of all personal data we hold about you in a portable format.',
    correctionDesc: 'Update or correct any inaccurate personal information in your account settings.',
    deletionDesc: 'Request deletion of your account and associated data. We retain certain data as required by law.',
    optOutDesc: 'Unsubscribe from marketing communications at any time via the link in our emails or in account settings.',
    exerciseRights: 'To exercise any of these rights, contact us at',
    responseTime: 'We respond to privacy inquiries within 48 hours',
    essentialCookies: 'Essential Cookies',
    analyticsCookies: 'Analytics Cookies',
    preferenceCookies: 'Preference Cookies',
    essentialDesc: 'Required for authentication and security. Cannot be disabled.',
    analyticsDesc: 'Help us understand how visitors use our platform to improve performance.',
    preferenceDesc: 'Remember your settings and preferences for future visits.',
    cookieManage: 'You can manage cookie preferences in your browser settings or by clicking the button below. Disabling cookies may affect some functionality of our services.',
    retentionDesc: 'We retain your data for as long as your account is active or as needed to provide services:',
    retentionNote: 'After account deletion, we retain certain data for an additional 30 days before permanent deletion, unless legal requirements dictate otherwise.',
    contactDesc: 'If you have any questions about this Privacy Policy or our data practices, please contact us:',
    email: 'Email:',
    generalSupport: 'For general support, visit our',
    contactSupport: 'Contact Support',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    contact: 'Contact',
    personalInfoItems: [
      'Name and business contact information when you register',
      'Email address for account communication and notifications',
      'Phone number for AI call handling and verification',
      'Business name and industry for service customization',
      'Payment information processed securely through our payment provider'
    ],
    usageDataItems: [
      'Call recordings and transcriptions (with your consent)',
      'AI interaction logs and performance metrics',
      'Dashboard usage patterns and feature engagement',
      'Device information and browser analytics'
    ],
    businessDataItems: [
      'Appointment schedules and customer interaction history',
      'Custom AI agent configurations and greetings',
      'Integration settings with third-party services',
      'Analytics and reporting data'
    ],
    retentionItems: [
      'Account data retained until account deletion',
      'Call recordings retained for 90 days by default (configurable)',
      'Analytics data aggregated and anonymized after 12 months',
      'Financial records retained for 7 years for legal compliance'
    ]
  },
  es: {
    title: 'Política de Privacidad',
    lastUpdated: 'Última actualización: 21 de mayo de 2026',
    legal: 'Legal',
    backToHome: '← Volver al Inicio',
    tableOfContents: 'Tabla de Contenidos',
    informationWeCollect: 'Información que Recopilamos',
    howWeUseYourData: 'Cómo Usamos Sus Datos',
    dataProtection: 'Protección de Datos',
    informationSharing: 'Compartir Información',
    yourRights: 'Sus Derechos',
    cookiesTracking: 'Cookies y Seguimiento',
    dataRetention: 'Retención de Datos',
    contactUs: 'Contáctenos',
    personalInformation: 'Información Personal',
    usageData: 'Datos de Uso',
    businessData: 'Datos Comerciales',
    serviceDelivery: 'Entrega de Servicio',
    accountManagement: 'Gestión de Cuenta',
    serviceImprovement: 'Mejora del Servicio',
    communication: 'Comunicación',
    security: 'Seguridad',
    encryption: 'Cifrado',
    secureInfrastructure: 'Infraestructura Segura',
    accessControl: 'Control de Acceso',
    hipaaCompliance: 'Cumplimiento HIPAA',
    encryptionDesc: 'Todos los datos cifrados en reposo (AES-256) y en tránsito (TLS 1.3)',
    infrastructureDesc: 'Alojado en Vercel con seguridad de nivel empresarial y protección DDoS',
    accessControlDesc: 'Control de acceso basado en roles con aplicación de MFA y registro de auditoría',
    hipaaDesc: 'El plan Enterprise incluye cumplimiento completo de HIPAA con Acuerdo de Socio Comercial',
    serviceProviders: 'Proveedores de Servicio',
    legalRequirements: 'Requisitos Legales',
    businessTransfers: 'Transferencias Comerciales',
    withYourConsent: 'Con Su Consentimiento',
    accessPortability: 'Acceso y Portabilidad',
    correction: 'Corrección',
    deletion: 'Eliminación',
    optOut: 'Opt-Out',
    accessDesc: 'Solicite una copia de todos los datos personales que tenemos sobre usted en formato portátil.',
    correctionDesc: 'Actualice o corrija cualquier información personal inexacta en la configuración de su cuenta.',
    deletionDesc: 'Solicite la eliminación de su cuenta y los datos asociados. Conservamos ciertos datos según lo requiera la ley.',
    optOutDesc: 'Cancele la suscripción a las comunicaciones de marketing en cualquier momento a través del enlace en nuestros correos electrónicos o en la configuración de la cuenta.',
    exerciseRights: 'Para ejercer cualquiera de estos derechos, contáctenos en',
    responseTime: 'Respondemos a las consultas de privacidad dentro de 48 horas',
    essentialCookies: 'Cookies Esenciales',
    analyticsCookies: 'Cookies Analíticas',
    preferenceCookies: 'Cookies de Preferencia',
    essentialDesc: 'Requeridas para autenticación y seguridad. No se pueden deshabilitar.',
    analyticsDesc: 'Nos ayudan a entender cómo los visitantes usan nuestra plataforma para mejorar el rendimiento.',
    preferenceDesc: 'Recordar su configuración y preferencias para futuras visitas.',
    cookieManage: 'Puede administrar las preferencias de cookies en la configuración de su navegador. Deshabilitar las cookies puede afectar algunas funcionalidades de nuestros servicios.',
    retentionDesc: 'Conservamos sus datos mientras su cuenta esté activa o según sea necesario para提供服务:',
    retentionNote: 'Después de eliminar la cuenta, conservamos ciertos datos durante 30 días adicionales antes de la eliminación permanente, a menos que los requisitos legales indiquen lo contrario.',
    contactDesc: 'Si tiene alguna pregunta sobre esta Política de Privacidad o nuestras prácticas de datos, contáctenos:',
    email: 'Correo electrónico:',
    generalSupport: 'Para soporte general, visite nuestra',
    contactSupport: 'Página de Soporte',
    privacyPolicy: 'Política de Privacidad',
    termsOfService: 'Términos de Servicio',
    contact: 'Contacto',
    personalInfoItems: [
      'Nombre e información de contacto comercial cuando se registra',
      'Dirección de correo electrónico para comunicación de cuenta y notificaciones',
      'Número de teléfono para manejo de llamadas AI y verificación',
      'Nombre del negocio e industria para personalización del servicio',
      'Información de pago procesada de forma segura a través de nuestro proveedor de pago'
    ],
    usageDataItems: [
      'Grabaciones de llamadas y transcripciones (con su consentimiento)',
      'Registros de interacción de AI y métricas de rendimiento',
      'Patrones de uso del panel y compromiso con funciones',
      'Información del dispositivo y análisis del navegador'
    ],
    businessDataItems: [
      'Horarios de citas e historial de interacciones con clientes',
      'Configuraciones de agentes AI personalizados y saludos',
      'Configuración de integraciones con servicios de terceros',
      'Datos de análisis e informes'
    ],
    retentionItems: [
      'Datos de cuenta retenidos hasta la eliminación de la cuenta',
      'Grabaciones de llamadas retenidas por 90 días por defecto (configurable)',
      'Datos de análisis agregados y anonimizados después de 12 meses',
      'Registros financieros retenidos por 7 años para cumplimiento legal'
    ]
  },
  fr: {
    title: 'Politique de Confidentialité',
    lastUpdated: 'Dernière mise à jour: 21 mai 2026',
    legal: 'Juridique',
    backToHome: '← Retour à l\'Accueil',
    tableOfContents: 'Table des Matières',
    informationWeCollect: 'Informations que Nous Collectons',
    howWeUseYourData: 'Comment Nous Utilisons Vos Données',
    dataProtection: 'Protection des Données',
    informationSharing: 'Partage d\'Informations',
    yourRights: 'Vos Droits',
    cookiesTracking: 'Cookies et Suivi',
    dataRetention: 'Conservation des Données',
    contactUs: 'Contactez-Nous',
    personalInformation: 'Informations Personnelles',
    usageData: 'Données d\'Utilisation',
    businessData: 'Données Commerciales',
    serviceDelivery: 'Livraison du Service',
    accountManagement: 'Gestion de Compte',
    serviceImprovement: 'Amélioration du Service',
    communication: 'Communication',
    security: 'Sécurité',
    encryption: 'Chiffrement',
    secureInfrastructure: 'Infrastructure Sécurisée',
    accessControl: 'Contrôle d\'Accès',
    hipaaCompliance: 'Conformité HIPAA',
    encryptionDesc: 'Toutes les données chiffrées au repos (AES-256) et en transit (TLS 1.3)',
    infrastructureDesc: 'Hébergé sur Vercel avec sécurité de niveau entreprise et protection DDoS',
    accessControlDesc: 'Contrôle d\'accès basé sur les rôles avec application MFA et journalisation d\'audit',
    hipaaDesc: 'Le plan Enterprise inclut la conformité HIPAA complète avec Accord de Partenaire Commercial',
    serviceProviders: 'Fournisseurs de Services',
    legalRequirements: 'Exigences Légales',
    businessTransfers: 'Transferts Commerciaux',
    withYourConsent: 'Avec Votre Consentement',
    accessPortability: 'Accès et Portabilité',
    correction: 'Correction',
    deletion: 'Suppression',
    optOut: 'Opt-Out',
    accessDesc: 'Demandez une copie de toutes les données personnelles que nous détenons sur vous dans un format portable.',
    correctionDesc: 'Mettez à jour ou corrigez toute information personnelle inexacte dans les paramètres de votre compte.',
    deletionDesc: 'Demandez la suppression de votre compte et des données associées. Nous conservons certaines données comme requis par la loi.',
    optOutDesc: 'Désabonnez-vous des communications marketing à tout moment via le lien dans nos e-mails ou dans les paramètres du compte.',
    exerciseRights: 'Pour exercer l\'un de ces droits, contactez-nous à',
    responseTime: 'Nous répondons aux demandes de confidentialité dans les 48 heures',
    essentialCookies: 'Cookies Essentiels',
    analyticsCookies: 'Cookies Analytiques',
    preferenceCookies: 'Cookies de Préférence',
    essentialDesc: 'Requis pour l\'authentification et la sécurité. Ne peuvent pas être désactivés.',
    analyticsDesc: 'Nous aident à comprendre comment les visiteurs utilisent notre plateforme pour améliorer les performances.',
    preferenceDesc: 'Se souvenir de vos paramètres et préférences pour les futures visites.',
    cookieManage: 'Vous pouvez gérer les préférences de cookies dans les paramètres de votre navigateur. Désactiver les cookies peut affecter certaines fonctionnalités de nos services.',
    retentionDesc: 'Nous conservons vos données tant que votre compte est actif ou selon nécessaire pour fournir les services:',
    retentionNote: 'Après la suppression du compte, nous conservons certaines données pendant 30 jours supplémentaires avant la suppression permanente, sauf si les exigences légales indiquent autrement.',
    contactDesc: 'Si vous avez des questions sur cette Politique de Confidentialité ou nos pratiques de données, veuillez nous contacter:',
    email: 'Email:',
    generalSupport: 'Pour le support général, visit our',
    contactSupport: 'Page de Support',
    privacyPolicy: 'Politique de Confidentialité',
    termsOfService: 'Conditions d\'Utilisation',
    contact: 'Contact',
    personalInfoItems: [
      'Nom et informations de contact professionnel lors de l\'inscription',
      'Adresse email pour la communication de compte et les notifications',
      'Numéro de téléphone pour la gestion des appels AI et la vérification',
      'Nom de l\'entreprise et industrie pour la personnalisation du service',
      'Informations de paiement traitées de manière sécurisée via notre fournisseur de paiement'
    ],
    usageDataItems: [
      'Enregistrements d\'appels et transcriptions (avec votre consentement)',
      'Journaux d\'interactions AI et métriques de performance',
      'Modèles d\'utilisation du tableau de bord et engagement des fonctionnalités',
      'Informations de l\'appareil et analytique du navigateur'
    ],
    businessDataItems: [
      'Calendriers de rendez-vous et historique des interactions avec les clients',
      'Configurations d\'agents AI personnalisés et salutations',
      'Paramètres d\'intégration avec les services tiers',
      'Données d\'analytique et de reporting'
    ],
    retentionItems: [
      'Données de compte conservées jusqu\'à la suppression du compte',
      'Enregistrements d\'appels conservés pendant 90 jours par défaut (configurable)',
      'Données analytiques agrégées et anonymisées après 12 mois',
      'Enregistrements financiers conservés pendant 7 ans pour conformité légale'
    ]
  },
  zh: {
    title: '隐私政策',
    lastUpdated: '最后更新：2026年5月21日',
    legal: '法律',
    backToHome: '← 返回首页',
    tableOfContents: '目录',
    informationWeCollect: '我们收集的信息',
    howWeUseYourData: '我们如何使用您的数据',
    dataProtection: '数据保护',
    informationSharing: '信息共享',
    yourRights: '您的权利',
    cookiesTracking: 'Cookies和跟踪',
    dataRetention: '数据保留',
    contactUs: '联系我们',
    personalInformation: '个人信息',
    usageData: '使用数据',
    businessData: '业务数据',
    serviceDelivery: '服务交付',
    accountManagement: '账户管理',
    serviceImprovement: '服务改进',
    communication: '沟通',
    security: '安全',
    encryption: '加密',
    secureInfrastructure: '安全基础设施',
    accessControl: '访问控制',
    hipaaCompliance: 'HIPAA合规',
    encryptionDesc: '所有数据在静止状态(AES-256)和传输中(TLS 1.3)加密',
    infrastructureDesc: '托管在Vercel上，具有企业级安全和DDoS保护',
    accessControlDesc: '基于角色的访问控制，带有MFA强制和审计日志',
    hipaaDesc: '企业计划包括完整的HIPAA合规性和商业伙伴协议',
    serviceProviders: '服务提供商',
    legalRequirements: '法律要求',
    businessTransfers: '业务转移',
    withYourConsent: '经您同意',
    accessPortability: '访问和可移植性',
    correction: '更正',
    deletion: '删除',
    optOut: '选择退出',
    accessDesc: '请求以可移植格式提供我们持有的关于您的所有个人数据的副本。',
    correctionDesc: '在您的账户设置中更新或更正任何不准确的个人信息。',
    deletionDesc: '请求删除您的账户和相关数据。我们根据法律要求保留某些数据。',
    optOutDesc: '随时通过我们电子邮件中的链接或账户设置取消订阅营销通讯。',
    exerciseRights: '要行使这些权利，请通过以下方式联系我们',
    responseTime: '我们在48小时内回复隐私查询',
    essentialCookies: '必要的Cookies',
    analyticsCookies: '分析Cookies',
    preferenceCookies: '偏好Cookies',
    essentialDesc: '用于身份验证和安全所需。无法禁用。',
    analyticsDesc: '帮助我们了解访问者如何使用我们的平台以提高性能。',
    preferenceDesc: '记住您的设置和偏好以便将来访问。',
    cookieManage: '您可以在浏览器设置中管理cookie偏好。禁用cookie可能会影响我们服务的某些功能。',
    retentionDesc: '只要您的账户处于活动状态或需要提供服务，我们就会保留您的数据：',
    retentionNote: '账户删除后，我们在永久删除前保留某些数据30天，除非法律要求另有规定。',
    contactDesc: '如果您对本隐私政策或我们的数据实践有任何疑问，请联系我们：',
    email: '电子邮件：',
    generalSupport: '如需一般支持，请访问我们的',
    contactSupport: '支持页面',
    privacyPolicy: '隐私政策',
    termsOfService: '服务条款',
    contact: '联系',
    personalInfoItems: [
      '注册时提供的姓名和业务联系信息',
      '用于账户通信和通知的电子邮件地址',
      '用于AI通话处理和验证的电话号码',
      '用于服务定制的公司名称和行业',
      '通过我们的支付提供商安全处理的支付信息'
    ],
    usageDataItems: [
      '通话录音和转录（经您同意）',
      'AI交互日志和性能指标',
      '仪表板使用模式和功能参与度',
      '设备信息和浏览器分析'
    ],
    businessDataItems: [
      '预约日程和客户交互历史',
      '自定义AI代理配置和问候语',
      '与第三方服务的集成设置',
      '分析和报告数据'
    ],
    retentionItems: [
      '账户数据保留至账户删除',
      '通话录音默认保留90天（可配置）',
      '分析数据在12个月后汇总和匿名化',
      '财务记录保留7年以符合法律要求'
    ]
  },
  hi: {
    title: 'गोपनीयता नीति',
    lastUpdated: 'अंतिम अपडेट: 21 मई 2026',
    legal: 'कानूनी',
    backToHome: '← होमपेज पर वापस',
    tableOfContents: 'विषय-सूची',
    informationWeCollect: 'हम जो जानकारी एकत्र करते हैं',
    howWeUseYourData: 'हम आपके डेटा का उपयोग कैसे करते हैं',
    dataProtection: 'डेटा सुरक्षा',
    informationSharing: 'जानकारी साझा करना',
    yourRights: 'आपके अधिकार',
    cookiesTracking: 'कुकीज़ और ट्रैकिंग',
    dataRetention: 'डेटा प्रतिधारण',
    contactUs: 'संपर्क करें',
    personalInformation: 'व्यक्तिगत जानकारी',
    usageData: 'उपयोग डेटा',
    businessData: 'व्यापार डेटा',
    serviceDelivery: 'सेवा वितरण',
    accountManagement: 'खाता प्रबंधन',
    serviceImprovement: 'सेवा सुधार',
    communication: 'संचार',
    security: 'सुरक्षा',
    encryption: 'एन्क्रिप्शन',
    secureInfrastructure: 'सुरक्षित इन्फ्रास्ट्रक्चर',
    accessControl: 'एक्सेस कंट्रोल',
    hipaaCompliance: 'HIPAA अनुपालन',
    encryptionDesc: 'सभी डेटा आराम में (AES-256) और ट्रांज़िट में (TLS 1.3) एन्क्रिप्टेड',
    infrastructureDesc: 'Vercel पर होस्टेड एंटरप्राइज़-ग्रेड सुरक्षा और DDoS सुरक्षा के साथ',
    accessControlDesc: 'MFA प्रवर्तन और ऑडिट लॉगिंग के साथ रोल-आधारित एक्सेस कंट्रोल',
    hipaaDesc: 'एंटरप्राइज़ प्लान में व्यापार साथी समझौते के साथ पूर्ण HIPAA अनुपालन शामिल है',
    serviceProviders: 'सेवा प्रदाता',
    legalRequirements: 'कानूनी आवश्यकताएं',
    businessTransfers: 'व्यापार हस्तांतरण',
    withYourConsent: 'आपकी सहमति से',
    accessPortability: 'एक्सेस और पोर्टेबिलिटी',
    correction: 'सुधार',
    deletion: 'हटाना',
    optOut: 'ऑप्ट-आउट',
    accessDesc: 'आपके बारे में हमारे पास मौजूद सभी व्यक्तिगत डेटा की प्रति पोर्टेबल फॉर्मेट में अनुरोध करें।',
    correctionDesc: 'अपने खाता सेटिंग्स में किसी भी गलत व्यक्तिगत जानकारी को अपडेट या सही करें।',
    deletionDesc: 'अपने खाते और संबंधित डेटा की हटाने का अनुरोध करें। हम कानूनी आवश्यकता के रूप में कुछ डेटा रखते हैं।',
    optOutDesc: 'किसी भी समय हमारे ईमेल में लिंक या खाता सेटिंग्स के माध्यम से मार्केटिंग संचार से सदस्यता रद्द करें।',
    exerciseRights: 'इनमें से किसी भी अधिकार का प्रयोग करने के लिए, हमसे संपर्क करें',
    responseTime: 'हम 48 घंटे के भीतर गोपनीयता पूछताछ का जवाब देते हैं',
    essentialCookies: 'आवश्यक कुकीज़',
    analyticsCookies: 'एनालिटिक्स कुकीज़',
    preferenceCookies: 'प्राथमिकता कुकीज़',
    essentialDesc: 'प्रमाणीकरण और सुरक्षा के लिए आवश्यक। अक्षम नहीं किया जा सकता।',
    analyticsDesc: 'प्रदर्शन बेहतर करने के लिए विज़िटर्स हमारे प्लेटफॉर्म का उपयोग कैसे करते हैं समझने में मदद करते हैं।',
    preferenceDesc: 'भविष्य की यात्राओं के लिए अपनी सेटिंग्स और प्राथमिकताओं को याद रखें।',
    cookieManage: 'आप अपनी ब्राउज़र सेटिंग्स में कुकी प्राथमिकताएं प्रबंधित कर सकते हैं। कुकीज़ को अक्षम करने से हमारी सेवाओं की कुछ कार्यक्षमता प्रभावित हो सकती है।',
    retentionDesc: 'हम आपके डेटा को तब तक रखते हैं जब तक आपका खाता सक्रिय है या सेवाएं प्रदान करने के लिए आवश्यक है:',
    retentionNote: 'खाता हटाने के बाद, हम कानूनी आवश्यकताओं के अनुसार अन्यथा निर्देशित न होने पर स्थायी हटाने से पहले 30 दिनों तक कुछ डेटा रखते हैं।',
    contactDesc: 'यदि आपके पास इस गोपनीयता नीति या हमारे डेटा प्रथाओं के बारे में कोई प्रश्न हैं, तो कृपया हमसे संपर्क करें:',
    email: 'ईमेल:',
    generalSupport: 'सामान्य सहायता के लिए, हमारे पर जाएं',
    contactSupport: 'सहायता पेज',
    privacyPolicy: 'गोपनीयता नीति',
    termsOfService: 'सेवा की शर्तें',
    contact: 'संपर्क',
    personalInfoItems: [
      'पंजीकरण करते समय नाम और व्यापार संपर्क जानकारी',
      'खाता संचार और सूचनाओं के लिए ईमेल पता',
      'AI कॉल हैंडलिंग और सत्यापन के लिए फोन नंबर',
      'सेवा अनुकूलन के लिए व्यापार का नाम और उद्योग',
      'हमारे भुगतान प्रदाता के माध्यम से सुरक्षित रूप से संcesized भुगतान जानकारी'
    ],
    usageDataItems: [
      'कॉल रिकॉर्डिंग और ट्रांसक्रिप्शन (आपकी सहमति से)',
      'AI इंटरैक्शन लॉग और प्रदर्शन मेट्रिक्स',
      'डैशबोर्ड उपयोग पैटर्न और फीचर एंगेजमेंट',
      'डिवाइस जानकारी और ब्राउज़र एनालिटिक्स'
    ],
    businessDataItems: [
      'अपॉइंटमेंट शेड्यूल और कस्टमर इंटरैक्शन इतिहास',
      'कस्टम AI एजेंट कॉन्फ़िगरेशन और ग्रीटिंग्स',
      'थर्ड-पार्टी सेवाओं के साथ एकीकरण सेटिंग्स',
      'एनालिटिक्स और रिपोर्टिंग डेटा'
    ],
    retentionItems: [
      'खाता हटाने तक खाता डेटा बनाए रखा जाता है',
      'कॉल रिकॉर्डिंग डिफ़ॉल्ट रूप से 90 दिनों के लिए बनाए रखी जाती है (कॉन्फ़िगर करने योग्य)',
      '12 महीने के बाद एनालिटिक्स डेटा एग्रीगेट और अनामीकृत',
      'कानूनी अनुपालन के लिए वित्तीय रिकॉर्ड 7 साल तक बनाए रखे जाते हैं'
    ]
  },
  ar: {
    title: 'سياسة الخصوصية',
    lastUpdated: 'آخر تحديث: 21 مايو 2026',
    legal: 'قانوني',
    backToHome: '← العودة إلى الصفحة الرئيسية',
    tableOfContents: 'جدول المحتويات',
    informationWeCollect: 'المعلومات التي نجمعها',
    howWeUseYourData: 'كيف نستخدم بياناتك',
    dataProtection: 'حماية البيانات',
    informationSharing: 'مشاركة المعلومات',
    yourRights: 'حقوقك',
    cookiesTracking: 'ملفات تعريف الارتباط والتتبع',
    dataRetention: 'الاحتفاظ بالبيانات',
    contactUs: 'اتصل بنا',
    personalInformation: 'المعلومات الشخصية',
    usageData: 'بيانات الاستخدام',
    businessData: 'بيانات العمل',
    serviceDelivery: 'تقديم الخدمة',
    accountManagement: 'إدارة الحساب',
    serviceImprovement: 'تحسين الخدمة',
    communication: 'التواصل',
    security: 'الأمان',
    encryption: 'التشفير',
    secureInfrastructure: 'البنية التحتية الآمنة',
    accessControl: 'التحكم في الوصول',
    hipaaCompliance: 'الامتثال لـ HIPAA',
    encryptionDesc: 'جميع البيانات مشفرة في حالة السكون (AES-256) وفي النقل (TLS 1.3)',
    infrastructureDesc: 'مستضاف على Vercel مع أمان على مستوى المؤسسة وحماية DDoS',
    accessControlDesc: 'التحكم في الوصول القائم على الأدوار مع فرض MFA والسجلات التدقيقية',
    hipaaDesc: 'خطة المؤسسة تتضمن امتثالًا كاملاً لـ HIPAA مع اتفاقية شريك الأعمال',
    serviceProviders: 'مزودو الخدمة',
    legalRequirements: 'المتطلبات القانونية',
    businessTransfers: 'التحويلات التجارية',
    withYourConsent: 'بموافقتك',
    accessPortability: 'الوصول وإمكانية النقل',
    correction: 'التصحيح',
    deletion: 'الحذف',
    optOut: 'الانسحاب',
    accessDesc: 'اطلب نسخة من جميع البيانات الشخصية التي نحتفظ بها عنك بتنسيق محمول.',
    correctionDesc: 'قم بتحديث أو تصحيح أي معلومات شخصية غير دقيقة في إعدادات حسابك.',
    deletionDesc: 'اطلب حذف حسابك والبيانات المرتبطة به. نحتفظ ببيانات معينة كما هو مطلوب قانونًا.',
    optOutDesc: 'إلغاء الاشتراك في اتصالات التسويق في أي وقت عبر الرابط في رسائلنا البريدية أو في إعدادات الحساب.',
    exerciseRights: 'لممارسة أي من هذه الحقوق، تواصل معنا على',
    responseTime: 'نرد على استفسارات الخصوصية خلال 48 ساعة',
    essentialCookies: 'ملفات تعريف الارتباط الأساسية',
    analyticsCookies: 'ملفات تعريف الارتباط التحليلية',
    preferenceCookies: 'ملفات تعريف الارتباط المفضلة',
    essentialDesc: 'مطلوبة للمصادقة والأمان. لا يمكن تعطيلها.',
    analyticsDesc: 'تساعدنا على فهم كيفية استخدام الزوار لمنصتنا لتحسين الأداء.',
    preferenceDesc: 'تذكر إعداداتك وتفضيلاتك للزيارات المستقبلية.',
    cookieManage: 'يمكنك إدارة تفضيلات ملفات تعريف الارتباط في إعدادات متصفحك. قد يؤثر تعطيل ملفات تعريف الارتباط على بعض وظائف خدماتنا.',
    retentionDesc: 'نحتفظ ببياناتك طالما كان حسابك نشطًا أو حسب الحاجة لتقديم الخدمات:',
    retentionNote: 'بعد حذف الحساب، نحتفظ ببيانات معينة لمدة 30 يومًا إضافية قبل الحذف الدائم، ما لم تنص المتطلبات القانونية على خلاف ذلك.',
    contactDesc: 'إذا كانت لديك أي أسئلة حول سياسة الخصوصية هذه أو ممارساتنا المتعلقة بالبيانات، فيرجى التواصل معنا:',
    email: 'البريد الإلكتروني:',
    generalSupport: 'للحصول على الدعم العام، تفضل بزيارة',
    contactSupport: 'صفحة الدعم',
    privacyPolicy: 'سياسة الخصوصية',
    termsOfService: 'شروط الخدمة',
    contact: 'اتصل',
    personalInfoItems: [
      'الاسم ومعلومات الاتصال التجاري عند التسجيل',
      'عنوان البريد الإلكتروني للتواصل بشأن الحساب والإشعارات',
      'رقم الهاتف لمعالجة مكالمات الذكاء الاصطناعي والتحقق',
      'اسم العمل والصناعة لتخصيص الخدمة',
      'معلومات الدفع التي تتم معالجتها بشكل آمن من خلال مزود الدفع الخاص بنا'
    ],
    usageDataItems: [
      'تسجيلات المكالمات والنسخ (بموافقتك)',
      'سجلات تفاعل الذكاء الاصطناعي ومقاييس الأداء',
      'أنماط استخدام لوحة المعلومات ومشاركة الميزات',
      'معلومات الجهاز وتحليلات المتصفح'
    ],
    businessDataItems: [
      'جداول المواعيد وسجل تفاعل العملاء',
      'تكوينات وكيل الذكاء الاصطناعي المخصص والتحيات',
      'إعدادات التكامل مع خدمات الطرف الثالث',
      'بيانات التحليلات والتقارير'
    ],
    retentionItems: [
      'البيانات الحسابية محتفظ بها حتى حذف الحساب',
      'تسجيلات المكالمات محتفظ بها لمدة 90 يومًا افتراضيًا (قابلة للتكوين)',
      'بيانات التحليلات مجمعة ومجهولة الهوية بعد 12 شهرًا',
      'السجلات المالية محتفظ بها لمدة 7 سنوات للامتثال القانوني'
    ]
  },
  pt: {
    title: 'Política de Privacidade',
    lastUpdated: 'Última atualização: 21 de maio de 2026',
    legal: 'Jurídico',
    backToHome: '← Voltar ao Início',
    tableOfContents: 'Índice',
    informationWeCollect: 'Informações que Coletamos',
    howWeUseYourData: 'Como Usamos Seus Dados',
    dataProtection: 'Proteção de Dados',
    informationSharing: 'Compartilhamento de Informações',
    yourRights: 'Seus Direitos',
    cookiesTracking: 'Cookies e Rastreamento',
    dataRetention: 'Retenção de Dados',
    contactUs: 'Contate-nos',
    personalInformation: 'Informações Pessoais',
    usageData: 'Dados de Uso',
    businessData: 'Dados Comerciais',
    serviceDelivery: 'Entrega de Serviço',
    accountManagement: 'Gerenciamento de Conta',
    serviceImprovement: 'Melhoria do Serviço',
    communication: 'Comunicação',
    security: 'Segurança',
    encryption: 'Criptografia',
    secureInfrastructure: 'Infraestrutura Segura',
    accessControl: 'Controle de Acesso',
    hipaaCompliance: 'Conformidade HIPAA',
    encryptionDesc: 'Todos os dados criptografados em repouso (AES-256) e em trânsito (TLS 1.3)',
    infrastructureDesc: 'Hospedado na Vercel com segurança de nível empresarial e proteção DDoS',
    accessControlDesc: 'Controle de acesso baseado em funções com aplicação MFA e registro de auditoria',
    hipaaDesc: 'O plano Enterprise inclui conformidade total com HIPAA e Acordo de Parceiro Comercial',
    serviceProviders: 'Prestadores de Serviço',
    legalRequirements: 'Requisitos Legais',
    businessTransfers: 'Transferências Comerciais',
    withYourConsent: 'Com Seu Consentimento',
    accessPortability: 'Acesso e Portabilidade',
    correction: 'Correção',
    deletion: 'Exclusão',
    optOut: 'Opt-Out',
    accessDesc: 'Solicite uma cópia de todos os dados pessoais que temos sobre você em formato portátil.',
    correctionDesc: 'Atualize ou corrija qualquer informação pessoal imprecisa nas configurações da sua conta.',
    deletionDesc: 'Solicite a exclusão da sua conta e dos dados associados. Retemos ciertos dados conforme exigido por lei.',
    optOutDesc: 'Cancele a inscrição em comunicações de marketing a qualquer momento pelo link em nossos e-mails ou nas configurações da conta.',
    exerciseRights: 'Para exercer qualquer desses direitos, entre em contato conosco em',
    responseTime: 'Respondemos a perguntas sobre privacidade em até 48 horas',
    essentialCookies: 'Cookies Essenciais',
    analyticsCookies: 'Cookies Analíticos',
    preferenceCookies: 'Cookies de Preferência',
    essentialDesc: 'Necessários para autenticação e segurança. Não podem ser desativados.',
    analyticsDesc: 'Nos ajudam a entender como os visitantes usam nossa plataforma para melhorar o desempenho.',
    preferenceDesc: 'Lembrar suas configurações e preferências para visitas futuras.',
    cookieManage: 'Você pode gerenciar preferências de cookies nas configurações do seu navegador. Desativar cookies pode afetar algumas funcionalidades dos nossos serviços.',
    retentionDesc: 'Retemos seus dados enquanto sua conta estiver ativa ou conforme necessário para fornecer serviços:',
    retentionNote: 'Após a exclusão da conta, retemos ciertos dados por mais 30 dias antes da exclusão permanente, a menos que requisitos legais indiquem o contrário.',
    contactDesc: 'Se tiver alguma dúvida sobre esta Política de Privacidade ou nossas práticas de dados, entre em contato conosco:',
    email: 'Email:',
    generalSupport: 'Para suporte geral, visite nossa',
    contactSupport: 'Página de Suporte',
    privacyPolicy: 'Política de Privacidade',
    termsOfService: 'Termos de Serviço',
    contact: 'Contato',
    personalInfoItems: [
      'Nome e informações de contato comercial ao se registrar',
      'Endereço de email para comunicação de conta e notificações',
      'Número de telefone para manuseio de chamadas AI e verificação',
      'Nome do negócio e indústria para personalização do serviço',
      'Informações de pagamento processadas com segurança através do nosso provedor de pagamento'
    ],
    usageDataItems: [
      'Gravações de chamadas e transcrições (com seu consentimento)',
      'Logs de interação de AI e métricas de desempenho',
      'Padrões de uso do painel e engajamento de recursos',
      'Informações do dispositivo e análises do navegador'
    ],
    businessDataItems: [
      'Horários de compromissos e histórico de interação com clientes',
      'Configurações de agente AI personalizado e saudações',
      'Configurações de integração com serviços de terceiros',
      'Dados de análises e relatórios'
    ],
    retentionItems: [
      'Dados da conta retidos até a exclusão da conta',
      'Gravações de chamadas retidas por 90 dias por padrão (configurável)',
      'Dados de análises agregados e anonimizados após 12 meses',
      'Registros financeiros retidos por 7 anos para conformidade legal'
    ]
  },
  ko: {
    title: '개인정보 처리방침',
    lastUpdated: '최종 업데이트: 2026년 5월 21일',
    legal: '법률',
    backToHome: '← 홈으로 돌아가기',
    tableOfContents: '목차',
    informationWeCollect: '、当社が収集する情報',
    howWeUseYourData: '당사가 고객 데이터를 사용하는 방법',
    dataProtection: '데이터 보호',
    informationSharing: '정보 공유',
    yourRights: '고객의 권리',
    cookiesTracking: '쿠키 및 추적',
    dataRetention: '데이터 보존',
    contactUs: '문의하기',
    personalInformation: '개인정보',
    usageData: '사용 데이터',
    businessData: '비즈니스 데이터',
    serviceDelivery: '서비스 제공',
    accountManagement: '계정 관리',
    serviceImprovement: '서비스 개선',
    communication: '커뮤니케이션',
    security: '보안',
    encryption: '암호화',
    secureInfrastructure: '안전한 인프라',
    accessControl: '접근 제어',
    hipaaCompliance: 'HIPAA 준수',
    encryptionDesc: '모든 데이터는 미사용 시(AES-256) 및 전송 중(TLS 1.3) 암호화됩니다',
    infrastructureDesc: '엔터프라이즈급 보안 및 DDoS 보호가 적용된 Vercel에 호스팅됩니다',
    accessControlDesc: 'MFA 적용 및 감사 로깅이 포함된 역할 기반 접근 제어',
    hipaaDesc: '엔터프라이즈 플랜에는 비즈니스 파트너 계약과 함께 완전한 HIPAA 준수가 포함됩니다',
    serviceProviders: '서비스 제공업체',
    legalRequirements: '법적 요구사항',
    businessTransfers: '비즈니스 이전',
    withYourConsent: '고객의 동의로',
    accessPortability: '접근 및 이식성',
    correction: '정정',
    deletion: '삭제',
    optOut: '옵트아웃',
    accessDesc: '당사가 보유한 고객에 대한 모든 개인정보 사본을 이식 가능한 형식으로 요청할 수 있습니다.',
    correctionDesc: '계정 설정에서 부정확한 개인정보를 업데이트하거나 수정할 수 있습니다.',
    deletionDesc: '계정 및 관련 데이터의 삭제를 요청할 수 있습니다. 법률 요구사항에 따라 특정 데이터를 보존합니다.',
    optOutDesc: '이메일의 링크 또는 계정 설정을 통해 마케팅 커뮤니케이션에서 언제든지 구독을 취소할 수 있습니다.',
    exerciseRights: '이러한 권리를 행사하려면 다음으로 문의하세요',
    responseTime: '개인정보 문의에는 48시간 이내에 응답합니다',
    essentialCookies: '필수 쿠키',
    analyticsCookies: '분석 쿠키',
    preferenceCookies: '선호도 쿠키',
    essentialDesc: '인증 및 보안을 위해 필요합니다. 비활성화할 수 없습니다.',
    analyticsDesc: '방문자가 플랫폼을如何使用하는지 이해하여 성능을 개선하는 데 도움이 됩니다.',
    preferenceDesc: '이후 방문을 위해 설정 및 선호도를 기억합니다.',
    cookieManage: '브라우저 설정에서 쿠키 기본 설정을 관리할 수 있습니다. 쿠키를 비활성화하면 서비스의 일부 기능에 영향을 줄 수 있습니다.',
    retentionDesc: '계정이 활성화되어 있거나 서비스를 제공하는 데 필요한 동안 고객 데이터를 보존합니다:',
    retentionNote: '계정 삭제 후에는 법률 요구사항이 다르게 지시하지 않는 한 영구 삭제 전에 30일 동안 특정 데이터를 보존합니다.',
    contactDesc: '이 개인정보 처리방침 또는 당사의 데이터 관행에 대한 질문이 있으시면 문의하세요:',
    email: '이메일:',
    generalSupport: '일반 지원을 보려면 다음을 방문하세요',
    contactSupport: '지원 페이지',
    privacyPolicy: '개인정보 처리방침',
    termsOfService: '서비스 약관',
    contact: '문의',
    personalInfoItems: [
      '등록 시 이름 및 비즈니스 연락처 정보',
      '계정 커뮤니케이션 및 알림용 이메일 주소',
      'AI 통화 처리 및 확인용 전화번호',
      '서비스 맞춤화를 위한 비즈니스 이름 및 업종',
      '결제 제공업체를 통해 안전하게 처리되는 결제 정보'
    ],
    usageDataItems: [
      '통화 녹음 및 전사(고객 동의 시)',
      'AI 상호작용 로그 및 성능 지표',
      '대시보드 사용 패턴 및 기능 참여도',
      '장치 정보 및 브라우저 분석'
    ],
    businessDataItems: [
      '예약 일정 및 고객 상호작용 히스토리',
      '맞춤형 AI 에이전트 구성 및 인사말',
      '타사 서비스와의 통합 설정',
      '분석 및 보고 데이터'
    ],
    retentionItems: [
      '계정 삭제까지 계정 데이터 보존',
      '통화 녹음은 기본적으로 90일 동안 보존(구성 가능)',
      '12개월 후 분석 데이터 집계 및 익명화',
      '법적 준수를 위해 재무 기록 7년간 보존'
    ]
  },
  ja: {
    title: 'プライバシー Policy',
    lastUpdated: '最終更新: 2026年5月21日',
    legal: '法的',
    backToHome: '← ホームに戻る',
    tableOfContents: '目次',
    informationWeCollect: '、当社が収集する情報',
    howWeUseYourData: 'お客様のデータの使用方法',
    dataProtection: 'データ保護',
    informationSharing: '情報の共有',
    yourRights: 'お客様の権利',
    cookiesTracking: 'Cookieとトラッキング',
    dataRetention: 'データの保持',
    contactUs: 'お問い合わせ',
    personalInformation: '個人情報',
    usageData: '使用データ',
    businessData: 'ビジネスデータ',
    serviceDelivery: 'サービスの提供',
    accountManagement: 'アカウント管理',
    serviceImprovement: 'サービスの改善',
    communication: 'コミュニケーション',
    security: 'セキュリティ',
    encryption: '暗号化',
    secureInfrastructure: '安全なインフラ',
    accessControl: 'アクセス制御',
    hipaaCompliance: 'HIPAAコンプライアンス',
    encryptionDesc: 'すべてのデータは保存時(AES-256)および転送中(TLS 1.3)に暗号化されます',
    infrastructureDesc: 'エンタープライズグレードのセキュリティとDDoS保護を備えたVercelでホスト',
    accessControlDesc: 'MFAの実施と監査ログを備えた役割ベースのアクセス制御',
    hipaaDesc: 'エンタープライズプランにはビジネスパートナー契約を含む完全なHIPAAコンプライアンスが含まれます',
    serviceProviders: 'サービスプロバイダー',
    legalRequirements: '法的要件',
    businessTransfers: 'ビジネスtransfer',
    withYourConsent: 'お客様の同意により',
    accessPortability: 'アクセスと移植性',
    correction: '訂正',
    deletion: '削除',
    optOut: 'オプトアウト',
    accessDesc: '、当社が保有するすべての個人データのコピーを移植可能な形式でリクエストできます。',
    correctionDesc: 'アカウント設定で不正確な個人情報を更新または訂正できます。',
    deletionDesc: 'アカウントおよび関連データの削除をリクエストできます。法により特定のデータを保持します。',
    optOutDesc: 'メール内のリンクまたはアカウント設定から、いつでもマーケティング коммуникацииから購読を解除できます。',
    exerciseRights: 'これらの権利を行使するには、以下联系我们:',
    responseTime: 'プライバシーへの문의には48時間以内に対応します',
    essentialCookies: '必須Cookie',
    analyticsCookies: '分析Cookie',
    preferenceCookies: ' 선호 Cookie',
    essentialDesc: '認証とセキュリティに必要です。無効にできません。',
    analyticsDesc: '訪問者がプラットフォームをどのように使用しているか理解し、パフォーマンスを向上させるのに役立ちます。',
    preferenceDesc: '今後の訪問のために設定と優先順位を記憶します。',
    cookieManage: 'ブラウザの設定でCookieの設定を管理できます。Cookieを無効にすると、服务の一部機能が影響を受ける可能性があります。',
    retentionDesc: 'アカウントがアクティブである間またはサービスを提供するために必要な間、顧客のデータを保持します:',
    retentionNote: 'アカウントの削除後、法令により異なる指示がない限り、恒久的な削除前に30日間、特定のデータを保持します。',
    contactDesc: 'このプライバシーに関する質問またはデータに関する質問がございましたら、お問い合わせください:',
    email: 'メール:',
    generalSupport: '一般的なサポートについては、以下をご覧ください',
    contactSupport: 'サポートページ',
    privacyPolicy: 'プライバシー Policy',
    termsOfService: '利用規約',
    contact: 'お問い合わせ',
    personalInfoItems: [
      '登録時の名前とビジネスの連絡先情報',
      'アカウントのコミュニケーションと通知のためのメールアドレス',
      'AI通話の処理と確認のための電話番号',
      'サービスのカスタマイズのためのビジネス名と業界',
      '決済提供商を通じて安全に処理される決済情報'
    ],
    usageDataItems: [
      '、通話の録音と文字起こし（お客様の同意あり）',
      'AIインタラクションマルチとパフォーマンス指標',
      'ダッシュボードの使用パターンと機能エンゲージメント',
      'デバイス情報とブラウザ分析'
    ],
    businessDataItems: [
      '予約スケジュールと顧客インタラクション履歴',
      'カスタムAIエージェント設定と挨拶',
      'サードパーティサービスとの統合設定',
      '分析とレポートデータ'
    ],
    retentionItems: [
      'アカウント削除までアカウントデータを保持',
      '通話録音はデフォルトで90日間保持（構成可能）',
      '12ヶ月後に分析データをaggregatedして匿名化',
      '法的遵守のために財務記録を7年間保持'
    ]
  },
  vi: {
    title: 'Chính Sách Bảo Mật',
    lastUpdated: 'Cập nhật lần cuối: 21 tháng 5 năm 2026',
    legal: 'Pháp lý',
    backToHome: '← Quay lại Trang chủ',
    tableOfContents: 'Mục Lục',
    informationWeCollect: 'Thông Tin Chúng Tôi Thu Thập',
    howWeUseYourData: 'Cách Chúng Tôi Sử Dụng Dữ Liệu Của Bạn',
    dataProtection: 'Bảo Vệ Dữ Liệu',
    informationSharing: 'Chia Sẻ Thông Tin',
    yourRights: 'Quyền Của Bạn',
    cookiesTracking: 'Cookie và Theo Dõi',
    dataRetention: 'Lưu Giữ Dữ Liệu',
    contactUs: 'Liên Hệ Với Chúng Tôi',
    personalInformation: 'Thông Tin Cá Nhân',
    usageData: 'Dữ Liệu Sử Dụng',
    businessData: 'Dữ Liệu Doanh Nghiệp',
    serviceDelivery: 'Cung Cấp Dịch Vụ',
    accountManagement: 'Quản Lý Tài Khoản',
    serviceImprovement: 'Cải Thiện Dịch Vụ',
    communication: 'Giao Tiếp',
    security: 'Bảo Mật',
    encryption: 'Mã Hóa',
    secureInfrastructure: 'Hạ Tầng Bảo Mật',
    accessControl: 'Kiểm Soát Truy Cập',
    hipaaCompliance: 'Tuân Thủ HIPAA',
    encryptionDesc: 'Tất cả dữ liệu được mã hóa khi nghỉ (AES-256) và khi truyền tải (TLS 1.3)',
    infrastructureDesc: 'Được lưu trữ trên Vercel với bảo mật cấp doanh nghiệp và bảo vệ DDoS',
    accessControlDesc: 'Kiểm soát truy cập dựa trên vai trò với thực thi MFA và ghi nhật ký kiểm toán',
    hipaaDesc: 'Gói Enterprise bao gồm tuân thủ HIPAA đầy đủ với Thỏa thuận Đối tác Kinh doanh',
    serviceProviders: 'Nhà Cung Cấp Dịch Vụ',
    legalRequirements: 'Yêu Cầu Pháp Lý',
    businessTransfers: 'Chuyển Giao Doanh Nghiệp',
    withYourConsent: 'Với Sự Đồng Ý Của Bạn',
    accessPortability: 'Truy Cập và Di Chuyển',
    correction: 'Sửa Chữa',
    deletion: 'Xóa',
    optOut: 'Từ Chối',
    accessDesc: 'Yêu cầu bản sao tất cả dữ liệu cá nhân chúng tôi lưu giữ về bạn ở định dạng di động.',
    correctionDesc: 'Cập nhật hoặc sửa bất kỳ thông tin cá nhân không chính xác nào trong cài đặt tài khoản của bạn.',
    deletionDesc: 'Yêu cầu xóa tài khoản và dữ liệu liên quan của bạn. Chúng tôi giữ lại một số dữ liệu theo yêu cầu của pháp luật.',
    optOutDesc: 'Hủy đăng ký các thông tin tiếp thị bất kỳ lúc nào qua liên kết trong email của chúng tôi hoặc trong cài đặt tài khoản.',
    exerciseRights: 'Để thực hiện bất kỳ quyền nào trong số này, hãy liên hệ với chúng tôi tại',
    responseTime: 'Chúng tôi phản hồi các yêu cầu về quyền riêng tư trong vòng 48 giờ',
    essentialCookies: 'Cookie Cần Thiết',
    analyticsCookies: 'Cookie Phân Tích',
    preferenceCookies: 'Cookie Ưu Tiên',
    essentialDesc: 'Cần thiết cho xác thực và bảo mật. Không thể tắt.',
    analyticsDesc: 'Giúp chúng tôi hiểu khách truy cập sử dụng nền tảng của chúng tôi như thế nào để cải thiện hiệu suất.',
    preferenceDesc: 'Ghi nhớ cài đặt và sở thích của bạn cho các lượt truy cập trong tương lai.',
    cookieManage: 'Bạn có thể quản lý tùy chọn cookie trong cài đặt trình duyệt của mình. Việc tắt cookie có thể ảnh hưởng đến một số chức năng của dịch vụ.',
    retentionDesc: 'Chúng tôi giữ lại dữ liệu của bạn miễn là tài khoản của bạn đang hoạt động hoặc khi cần thiết để cung cấp dịch vụ:',
    retentionNote: 'Sau khi xóa tài khoản, chúng tôi giữ lại một số dữ liệu trong 30 ngày trước khi xóa vĩnh viễn, trừ khi yêu cầu pháp lý có quy định khác.',
    contactDesc: 'Nếu bạn có bất kỳ câu hỏi nào về Chính sách Bảo mật này hoặc các thực hành dữ liệu của chúng tôi, vui lòng liên hệ với chúng tôi:',
    email: 'Email:',
    generalSupport: 'Để được hỗ trợ chung, hãy truy cập',
    contactSupport: 'Trang Hỗ Trợ',
    privacyPolicy: 'Chính Sách Bảo Mật',
    termsOfService: 'Điều Khoản Dịch Vụ',
    contact: 'Liên hệ',
    personalInfoItems: [
      'Tên và thông tin liên hệ kinh doanh khi đăng ký',
      'Địa chỉ email để giao tiếp tài khoản và thông báo',
      'Số điện thoại để xử lý cuộc gọi AI và xác minh',
      'Tên doanh nghiệp và ngành để tùy chỉnh dịch vụ',
      'Thông tin thanh toán được xử lý an toàn qua nhà cung cấp thanh toán của chúng tôi'
    ],
    usageDataItems: [
      'Bản ghi cuộc gọi và bản ghi (với sự đồng ý của bạn)',
      'Nhật ký tương tác AI và số liệu hiệu suất',
      'Mẫu sử dụng bảng điều khiển và mức độ tương tác với tính năng',
      'Thông tin thiết bị và phân tích trình duyệt'
    ],
    businessDataItems: [
      'Lịch hẹn và lịch sử tương tác với khách hàng',
      'Cấu hình tác nhân AI tùy chỉnh và lời chào',
      'Cài đặt tích hợp với dịch vụ của bên thứ ba',
      'Dữ liệu phân tích và báo cáo'
    ],
    retentionItems: [
      'Dữ liệu tài khoản được giữ lại cho đến khi xóa tài khoản',
      'Bản ghi cuộc gọi được giữ lại trong 90 ngày theo mặc định (có thể định cấu hình)',
      'Dữ liệu phân tích được tổng hợp và ẩn danh sau 12 tháng',
      'Hồ sơ tài chính được giữ lại trong 7 năm để tuân thủ pháp luật'
    ]
  },
  tl: {
    title: 'Patakaran sa Privacy',
    lastUpdated: 'Huling update: Mayo 21, 2026',
    legal: 'Legal',
    backToHome: '← Bumalik sa Home',
    tableOfContents: 'Table of Contents',
    informationWeCollect: 'Impormasyong Kinokolekta Namin',
    howWeUseYourData: 'Paano Namin Ginagamit ang Iyong Data',
    dataProtection: 'Proteksyon ng Data',
    informationSharing: 'Pagbabahagi ng Impormasyon',
    yourRights: 'Iyong Mga Karapatan',
    cookiesTracking: 'Mga Cookie at Pagsubaybay',
    dataRetention: 'Pagpanatili ng Data',
    contactUs: 'Makipag-ugnayan sa Amin',
    personalInformation: 'Personal na Impormasyon',
    usageData: 'Data ng Paggamit',
    businessData: 'Data ng Negosyo',
    serviceDelivery: 'Paghahatid ng Serbisyo',
    accountManagement: 'Pamamahala ng Account',
    serviceImprovement: 'Pagpapabuti ng Serbisyo',
    communication: 'Komunikasyon',
    security: 'Seguridad',
    encryption: 'Pag-encrypt',
    secureInfrastructure: 'Secure na Infrastructure',
    accessControl: 'Access Control',
    hipaaCompliance: 'HIPAA Compliance',
    encryptionDesc: 'Ang lahat ng data ay naka-encrypt sa rest (AES-256) at sa transit (TLS 1.3)',
    infrastructureDesc: 'Hosted sa Vercel na may enterprise-grade security at DDoS protection',
    accessControlDesc: 'Role-based access control na may MFA enforcement at audit logging',
    hipaaDesc: 'Ang Enterprise plan ay may kasamang full HIPAA compliance na may Business Associate Agreement',
    serviceProviders: 'Mga Tagapaglala ng Serbisyo',
    legalRequirements: 'Mga Legal na Kinakailangan',
    businessTransfers: 'Mga Business Transfer',
    withYourConsent: 'Sa Iyong Consent',
    accessPortability: 'Access at Portability',
    correction: 'Korrection',
    deletion: 'Pag-delete',
    optOut: 'Opt-Out',
    accessDesc: 'Humiling ng kopya ng lahat ng personal na data na hawak namin tungkol sa iyo sa portable na format.',
    correctionDesc: 'I-update o i-correct ang anumang inaccurate na personal na impormasyon sa iyong account settings.',
    deletionDesc: 'Humiling ng pag-delete ng iyong account at associated na data. May kinokolek kaming ilang data ayon sa legal na kinakailangan.',
    optOutDesc: 'Mag-unsubscribe sa marketing communications anumang oras sa pamamagitan ng link sa aming emails o sa account settings.',
    exerciseRights: 'Para mag-exercise ng anumang karapatan, makipag-ugnayan sa amin sa',
    responseTime: 'Sumasagot kami sa mga privacy inquiry sa loob ng 48 oras',
    essentialCookies: 'Mga Essential Cookie',
    analyticsCookies: 'Mga Analytics Cookie',
    preferenceCookies: 'Mga Preference Cookie',
    essentialDesc: 'Kinakailangan para sa authentication at security. Hindi maaaring i-disable.',
    analyticsDesc: 'Tumutulong sa amin maintindihan kung paano ginagamit ng visitors ang aming platform para mapabuti ang performance.',
    preferenceDesc: 'Tumatandaan ang iyong settings at preferences para sa future visits.',
    cookieManage: 'Maaari mong pamahalaan ang cookie preferences sa iyong browser settings. Ang pag-disable ng cookies ay maaaring maka-affect sa ilang functionality ng aming services.',
    retentionDesc: "May kinokolek kaming data mo hangga't active ang iyong account o kung kinakailangan para mag-provide ng services:",
    retentionNote: 'Pagkatapos ng account deletion, may kinokolek kaming ilang data para sa karagdagang 30 araw bago ang permanenteng pag-delete, maliban kung ang legal na kinakailangan ay nagsasabi ng iba.',
    contactDesc: 'Kung mayroon kang mga tanong tungkol sa Privacy Policy na ito o sa aming data practices, mangyaring makipag-ugnayan sa amin:',
    email: 'Email:',
    generalSupport: 'Para sa general support, bisitahin ang aming',
    contactSupport: 'Support Page',
    privacyPolicy: 'Patakaran sa Privacy',
    termsOfService: 'Mga Tuntunin ng Serbisyo',
    contact: 'Kontact',
    personalInfoItems: [
      'Pangalan at business contact information kapag nag-rehistro',
      'Email address para sa account communication at notifications',
      'Phone number para sa AI call handling at verification',
      'Business name at industry para sa service customization',
      'Payment information na processed nang secure through aming payment provider'
    ],
    usageDataItems: [
      'Call recordings at transcriptions (with your consent)',
      'AI interaction logs at performance metrics',
      'Dashboard usage patterns at feature engagement',
      'Device information at browser analytics'
    ],
    businessDataItems: [
      'Appointment schedules at customer interaction history',
      'Custom na AI agent configurations at greetings',
      'Integration settings sa mga third-party services',
      'Analytics at reporting data'
    ],
    retentionItems: [
      'Account data ay pananatilihin hanggang sa account deletion',
      'Call recordings ay pananatilihin ng 90 araw bilang default (configurable)',
      'Analytics data ay aggregated at anonymized pagkatapos ng 12 buwan',
      'Financial records ay pananatilihin ng 7 taon para sa legal compliance'
    ]
  },
  de: {
    title: 'Datenschutzrichtlinie',
    lastUpdated: 'Letzte Aktualisierung: 21. Mai 2026',
    legal: 'Rechtlich',
    backToHome: '← Zurück zur Startseite',
    tableOfContents: 'Inhaltsverzeichnis',
    informationWeCollect: 'Informationen, die wir sammeln',
    howWeUseYourData: 'Wie wir Ihre Daten verwenden',
    dataProtection: 'Datenschutz',
    informationSharing: 'Informationen teilen',
    yourRights: 'Ihre Rechte',
    cookiesTracking: 'Cookies und Tracking',
    dataRetention: 'Datenspeicherung',
    contactUs: 'Kontaktieren Sie uns',
    personalInformation: 'Persönliche Informationen',
    usageData: 'Nutzungsdaten',
    businessData: 'Geschäftsdaten',
    serviceDelivery: 'Servicebereitstellung',
    accountManagement: 'Kontoverwaltung',
    serviceImprovement: 'Serviceverbesserung',
    communication: 'Kommunikation',
    security: 'Sicherheit',
    encryption: 'Verschlüsselung',
    secureInfrastructure: 'Sichere Infrastruktur',
    accessControl: 'Zugriffskontrolle',
    hipaaCompliance: 'HIPAA-Compliance',
    encryptionDesc: 'Alle Daten im Ruhezustand (AES-256) und bei der Übertragung (TLS 1.3) verschlüsselt',
    infrastructureDesc: 'Gehostet auf Vercel mitEnterprise-Sicherheit und DDoS-Schutz',
    accessControlDesc: 'Rollenbasierte Zugriffskontrolle mit MFA-Durchsetzung und Audit-Protokollierung',
    hipaaDesc: 'Enterprise-Plan beinhaltet vollständige HIPAA-Compliance mit Business-Partner-Vereinbarung',
    serviceProviders: 'Dienstleister',
    legalRequirements: 'Gesetzliche Anforderungen',
    businessTransfers: 'Geschäftsübertragungen',
    withYourConsent: 'Mit Ihrer Zustimmung',
    accessPortability: 'Zugriff und Portabilität',
    correction: 'Korrektur',
    deletion: 'Löschung',
    optOut: 'Opt-Out',
    accessDesc: 'Fordern Sie eine Kopie aller personenbezogenen Daten, die wir über Sie haben, in einem portablen Format an.',
    correctionDesc: 'Aktualisieren oder korrigieren Sie unrichtige persönliche Informationen in Ihren Kontoeinstellungen.',
    deletionDesc: 'Fordern Sie die Löschung Ihres Kontos und der zugehörigen Daten an. Wir bewahren bestimmte Daten gemäß gesetzlicher Anforderungen auf.',
    optOutDesc: 'Kündigen Sie Marketing-Mitteilungen jederzeit über den Link in unseren E-Mails oder in den Kontoeinstellungen.',
    exerciseRights: 'Um diese Rechte auszuüben, kontaktieren Sie uns unter',
    responseTime: 'Wir antworten auf Datenschutzanfragen innerhalb von 48 Stunden',
    essentialCookies: 'Notwendige Cookies',
    analyticsCookies: 'Analyse-Cookies',
    preferenceCookies: 'Präferenz-Cookies',
    essentialDesc: 'Erforderlich für Authentifizierung und Sicherheit. Können nicht deaktiviert werden.',
    analyticsDesc: 'Helfen uns zu verstehen, wie Besucher unsere Plattform nutzen, um die Leistung zu verbessern.',
    preferenceDesc: 'Merken Sie sich Ihre Einstellungen und Präferenzen für zukünftige Besuche.',
    cookieManage: 'Sie können Cookie-Einstellungen in Ihren Browser-Einstellungen verwalten. Das Deaktivieren von Cookies kann einige Funktionen unserer Dienste beeinträchtigen.',
    retentionDesc: 'Wir bewahren Ihre Daten solange Ihr Konto aktiv ist oder wie nötig, um Dienste bereitzustellen:',
    retentionNote: 'Nach der Kontolöschung bewahren wir bestimmte Daten weitere 30 Tage vor der endgültigen Löschung auf, sofern gesetzliche Anforderungen nichts anderes vorschreiben.',
    contactDesc: 'Wenn Sie Fragen zu dieser Datenschutzrichtlinie oder unseren Datenschutzpraktiken haben, kontaktieren Sie uns bitte:',
    email: 'E-Mail:',
    generalSupport: 'Für allgemeinen Support besuchen Sie unsere',
    contactSupport: 'Support-Seite',
    privacyPolicy: 'Datenschutzrichtlinie',
    termsOfService: 'Nutzungsbedingungen',
    contact: 'Kontakt',
    personalInfoItems: [
      'Name und geschäftliche Kontaktinformationen bei der Registrierung',
      'E-Mail-Adresse für Kontobenachrichtigungen und Mitteilungen',
      'Telefonnummer für AI-Anrufabwicklung und Verifizierung',
      'Geschäftsname und Branche für Service-Anpassung',
      'Zahlungsinformationen werden sicher über unseren Zahlungsanbieter verarbeitet'
    ],
    usageDataItems: [
      'Anrufaufzeichnungen und Transkriptionen (mit Ihrer Zustimmung)',
      'AI-Interaktionsprotokolle und Leistungskennzahlen',
      'Dashboard-Nutzungsmuster und Feature-Nutzung',
      'Geräteinformationen und Browser-Analytik'
    ],
    businessDataItems: [
      'Terminplanungen und Kundeninteraktionshistorie',
      'Benutzerdefinierte AI-Agent-Konfigurationen und Begrüßungen',
      'Integrationseinstellungen mit Drittanbieterdiensten',
      'Analyse- und Berichtsdaten'
    ],
    retentionItems: [
      'Kontodaten werden bis zur Kontolöschung aufbewahrt',
      'Anrufaufzeichnungen werden standardmäßig 90 Tage aufbewahrt (konfigurierbar)',
      'Analysedaten werden nach 12 Monaten aggregiert und anonymisiert',
      'Finanzunterlagen werden 7 Jahre lang für die Einhaltung gesetzlicher Vorschriften aufbewahrt'
    ]
  },
  it: {
    title: 'Informativa sulla Privacy',
    lastUpdated: 'Ultimo aggiornamento: 21 maggio 2026',
    legal: 'Legale',
    backToHome: '← Torna alla Home',
    tableOfContents: 'Sommario',
    informationWeCollect: 'Informazioni che Raccogliamo',
    howWeUseYourData: 'Come Utilizziamo i Tuoi Dati',
    dataProtection: 'Protezione dei Dati',
    informationSharing: 'Condivisione delle Informazioni',
    yourRights: 'I Tuoi Diritti',
    cookiesTracking: 'Cookie e Tracciamento',
    dataRetention: 'Conservazione dei Dati',
    contactUs: 'Contattaci',
    personalInformation: 'Informazioni Personali',
    usageData: 'Dati di Utilizzo',
    businessData: 'Dati Aziendali',
    serviceDelivery: 'Fornitura del Servizio',
    accountManagement: 'Gestione Account',
    serviceImprovement: 'Miglioramento del Servizio',
    communication: 'Comunicazione',
    security: 'Sicurezza',
    encryption: 'Crittografia',
    secureInfrastructure: 'Infrastructure Sicura',
    accessControl: 'Controllo Accessi',
    hipaaCompliance: 'Conformità HIPAA',
    encryptionDesc: 'Tutti i dati crittografati a riposo (AES-256) e in transito (TLS 1.3)',
    infrastructureDesc: 'Ospitato su Vercel con sicurezza di livello aziendale e protezione DDoS',
    accessControlDesc: 'Controllo accessi basato su ruoli con applicazione MFA e logging di audit',
    hipaaDesc: 'Il piano Enterprise include conformità HIPAA completa con Accordo di Partner Commerciale',
    serviceProviders: 'Fornitori di Servizi',
    legalRequirements: 'Requisiti Legali',
    businessTransfers: 'Trasferimenti Aziendali',
    withYourConsent: 'Con il Tuo Consenso',
    accessPortability: 'Accesso e Portabilità',
    correction: 'Correzione',
    deletion: 'Eliminazione',
    optOut: 'Opt-Out',
    accessDesc: 'Richiedi una copia di tutti i dati personali che deteniamo su di te in formato portabile.',
    correctionDesc: 'Aggiorna o correggi eventuali informazioni personali inaccurate nelle impostazioni del tuo account.',
    deletionDesc: 'Richiedi l\'eliminazione del tuo account e dei dati associati. Conserviamo alcuni dati come richiesto dalla legge.',
    optOutDesc: 'Annulla l\'iscrizione alle comunicazioni di marketing in qualsiasi momento tramite il link nelle nostre email o nelle impostazioni dell\'account.',
    exerciseRights: 'Per esercitare uno qualsiasi di questi diritti, contattaci a',
    responseTime: 'Rispondiamo alle richieste di privacy entro 48 ore',
    essentialCookies: 'Cookie Essenziali',
    analyticsCookies: 'Cookie Analitici',
    preferenceCookies: 'Cookie di Preferenza',
    essentialDesc: 'Richiesti per autenticazione e sicurezza. Non possono essere disabilitati.',
    analyticsDesc: 'Ci aiutano a capire come i visitatori utilizzano la nostra piattaforma per migliorare le prestazioni.',
    preferenceDesc: 'Ricorda le tue impostazioni e preferenze per visite future.',
    cookieManage: 'Puoi gestire le preferenze dei cookie nelle impostazioni del tuo browser. La disabilitazione dei cookie potrebbe influenzare alcune funzionalità dei nostri servizi.',
    retentionDesc: 'Conserviamo i tuoi dati fintanto che il tuo account è attivo o come necessario per fornire servizi:',
    retentionNote: 'Dopo l\'eliminazione dell\'account, conserviamo alcuni dati per ulteriori 30 giorni prima dell\'eliminazione permanente, a meno che i requisiti legali non dispongano diversamente.',
    contactDesc: 'Se hai domande su questa Informativa sulla Privacy o sulle nostre pratiche relative ai dati, contattaci:',
    email: 'Email:',
    generalSupport: 'Per il supporto generale, visita la nostra',
    contactSupport: 'Pagina di Supporto',
    privacyPolicy: 'Informativa sulla Privacy',
    termsOfService: 'Termini di Servizio',
    contact: 'Contatto',
    personalInfoItems: [
      'Nome e informazioni di contatto aziendale al momento della registrazione',
      'Indirizzo email per comunicazioni relative all\'account e notifiche',
      'Numero di telefono per la gestione delle chiamate AI e la verifica',
      'Nome dell\'azienda e settore per la personalizzazione del servizio',
      'Informazioni di pagamento elaborate in modo sicuro tramite il nostro fornitore di pagamenti'
    ],
    usageDataItems: [
      'Registrazioni delle chiamate e trascrizioni (con il tuo consenso)',
      'Log delle interazioni AI e metriche delle prestazioni',
      'Modelli di utilizzo della dashboard e coinvolgimento delle funzionalità',
      'Informazioni sul dispositivo e analisi del browser'
    ],
    businessDataItems: [
      'Pianificazione degli appuntamenti e cronologia delle interazioni con i clienti',
      'Configurazioni dell\'agente AI personalizzato e saluti',
      'Impostazioni di integrazione con servizi di terze parti',
      'Dati di analisi e reporting'
    ],
    retentionItems: [
      'Dati dell\'account conservati fino all\'eliminazione dell\'account',
      'Registrazioni delle chiamate conservate per 90 giorni per impostazione predefinita (configurabile)',
      'Dati di analisi aggregati e anonimizzati dopo 12 mesi',
      'Registri finanziari conservati per 7 anni per conformità legale'
    ]
  },
  ru: {
    title: 'Политика Конфиденциальности',
    lastUpdated: 'Последнее обновление: 21 мая 2026 г.',
    legal: 'Юридический',
    backToHome: '← Вернуться на главную',
    tableOfContents: 'Содержание',
    informationWeCollect: 'Информация, которую мы собираем',
    howWeUseYourData: 'Как мы используем ваши данные',
    dataProtection: 'Защита данных',
    informationSharing: 'Предоставление информации',
    yourRights: 'Ваши права',
    cookiesTracking: 'Файлы cookie и отслеживание',
    dataRetention: 'Хранение данных',
    contactUs: 'Свяжитесь с нами',
    personalInformation: 'Личная информация',
    usageData: 'Данные об использовании',
    businessData: 'Данные бизнеса',
    serviceDelivery: 'Предоставление услуг',
    accountManagement: 'Управление аккаунтом',
    serviceImprovement: 'Улучшение услуг',
    communication: 'Коммуникация',
    security: 'Безопасность',
    encryption: 'Шифрование',
    secureInfrastructure: 'Защищенная инфраструктура',
    accessControl: 'Контроль доступа',
    hipaaCompliance: 'Соответствие HIPAA',
    encryptionDesc: 'Все данные зашифрованы при хранении (AES-256) и передаче (TLS 1.3)',
    infrastructureDesc: 'Размещено на Vercel с корпоративной безопасностью и защитой от DDoS',
    accessControlDesc: 'Контроль доступа на основе ролей с принудительной MFA и ведением журнала аудита',
    hipaaDesc: 'Корпоративный план включает полное соответствие HIPAA с соглашением о деловом партнерстве',
    serviceProviders: 'Поставщики услуг',
    legalRequirements: 'Правовые требования',
    businessTransfers: 'Передача бизнеса',
    withYourConsent: 'С вашего согласия',
    accessPortability: 'Доступ и переносимость',
    correction: 'Исправление',
    deletion: 'Удаление',
    optOut: 'Отказ',
    accessDesc: 'Запросите копию всех личных данных, которые мы храним о вас, в переносимом формате.',
    correctionDesc: 'Обновите или исправьте любую неточную личную информацию в настройках вашего аккаунта.',
    deletionDesc: 'Запросите удаление вашего аккаунта и связанных данных. Мы сохраняем определенные данные в соответствии с требованиями закона.',
    optOutDesc: 'Отпишитесь от маркетинговых коммуникаций в любое время через ссылку в наших письмах или в настройках аккаунта.',
    exerciseRights: 'Чтобы воспользоваться любым из этих прав, свяжитесь с нами по адресу',
    responseTime: 'Мы отвечаем на запросы о конфиденциальности в течение 48 часов',
    essentialCookies: 'Основные файлы cookie',
    analyticsCookies: 'Аналитические файлы cookie',
    preferenceCookies: 'Файлы cookie предпочтений',
    essentialDesc: 'Необходимы для аутентификации и безопасности. Не могут быть отключены.',
    analyticsDesc: 'Помогают нам понять, как посетители используют нашу платформу для улучшения производительности.',
    preferenceDesc: 'Запоминают ваши настройки и предпочтения для будущих посещений.',
    cookieManage: 'Вы можете управлять настройками файлов cookie в настройках своего браузера. Отключение файлов cookie может повлиять на некоторые функции наших услуг.',
    retentionDesc: 'Мы храним ваши данные, пока ваш аккаунт активен или пока это необходимо для предоставления услуг:',
    retentionNote: 'После удаления аккаунта мы храним определенные данные еще 30 дней перед окончательным удалением, если законодательные требования не предусматривают иное.',
    contactDesc: 'Если у вас есть вопросы об этой Политике конфиденциальности или о наших методах работы с данными, пожалуйста, свяжитесь с нами:',
    email: 'Электронная почта:',
    generalSupport: 'Для общей поддержки посетите нашу',
    contactSupport: 'Страницу поддержки',
    privacyPolicy: 'Политика конфиденциальности',
    termsOfService: 'Условия использования',
    contact: 'Контакт',
    personalInfoItems: [
      'Имя и контактная информация организации при регистрации',
      'Адрес электронной почты для коммуникации по аккаунту и уведомлений',
      'Номер телефона для обработки звонков AI и верификации',
      'Название организации и отрасль для настройки сервиса',
      'Платежная информация, обрабатываемая безопасно через нашего платежного провайдера'
    ],
    usageDataItems: [
      'Записи звонков и транскрипции (с вашего согласия)',
      'Журналы взаимодействия AI и показатели эффективности',
      'Шаблоны использования панели управления и вовлеченность функций',
      'Информация об устройстве и аналитика браузера'
    ],
    businessDataItems: [
      'Расписания встреч и история взаимодействия с клиентами',
      'Пользовательские конфигурации агента AI и приветствия',
      'Настройки интеграции со сторонними сервисами',
      'Данные аналитики и отчетности'
    ],
    retentionItems: [
      'Данные аккаунта сохраняются до удаления аккаунта',
      'Записи звонков сохраняются 90 дней по умолчанию (настраивается)',
      'Аналитические данные агрегируются и анонимизируются через 12 месяцев',
      'Финансовые записи сохраняются 7 лет для правового соответствия'
    ]
  }
}

// RTL languages
import { rtlLanguages } from '../lib/rtl'

const sections = [
  { id: 'information-collection', titleKey: 'informationWeCollect' },
  { id: 'data-usage', titleKey: 'howWeUseYourData' },
  { id: 'data-protection', titleKey: 'dataProtection' },
  { id: 'data-sharing', titleKey: 'informationSharing' },
  { id: 'your-rights', titleKey: 'yourRights' },
  { id: 'cookies', titleKey: 'cookiesTracking' },
  { id: 'data-retention', titleKey: 'dataRetention' },
  { id: 'contact', titleKey: 'contactUs' },
]

export default function PrivacyPolicyPage() {
  const [lang, setLang] = useState('en')
  const [isRTL, setIsRTL] = useState(false)

  useEffect(() => {
    const savedLang = localStorage.getItem('preferred-language') || 'en'
    setLang(savedLang)
    setIsRTL(rtlLanguages.includes(savedLang))
  }, [])

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }, [isRTL, lang])

  const t = translations[lang as keyof typeof translations] || translations.en

  const handleLanguageChange = (newLang: string) => {
    setLang(newLang)
    setIsRTL(rtlLanguages.includes(newLang))
    localStorage.setItem('preferred-language', newLang)
    window.dispatchEvent(new CustomEvent('languageChange', { detail: newLang }))
  }

  return (
    <div className="min-h-screen bg-black text-white" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aurora-cyan to-midnight-blue flex items-center justify-center">
              <BotIcon />
            </div>
            <span className="font-bold text-lg">FrontDesk Agents AI</span>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector currentLang={lang} onChange={handleLanguageChange} />
            <Link href="/" className="text-sm text-gray-400 hover:text-white transition">
              {t.backToHome}
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-8 h-8 text-green-400" />
            <span className="text-green-400 font-medium">{t.legal}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t.title}</h1>
          <p className="text-gray-400">{t.lastUpdated}</p>
        </div>

        {/* Quick Navigation */}
        <nav className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-12">
          <h2 className="text-lg font-bold mb-4">{t.tableOfContents}</h2>
          <ul className="space-y-2">
            {sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="text-green-400 hover:text-green-300 transition">
                  {t[section.titleKey as keyof typeof t] as string}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content Sections */}
        <div className="space-y-12">
          {/* Information We Collect */}
          <section id="information-collection">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold">{t.informationWeCollect}</h2>
            </div>
            <div className="space-y-6 text-gray-300">
              <p>
                At FrontDesk Agents AI, we collect information to provide and improve our AI receptionist services. 
                We are committed to handling your data with the utmost care and transparency.
              </p>
              
              <h3 className="text-xl font-semibold text-white mt-6">{t.personalInformation}</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                {t.personalInfoItems.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6">{t.usageData}</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                {t.usageDataItems.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6">{t.businessData}</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                {t.businessDataItems.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* How We Use Your Data */}
          <section id="data-usage">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold">{t.howWeUseYourData}</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p>We use collected information for the following purposes:</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                  <span><strong className="text-white">{t.serviceDelivery}:</strong> Providing and maintaining our AI receptionist services, including call handling, scheduling, and SMS communications.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                  <span><strong className="text-white">{t.accountManagement}:</strong> Processing registrations, managing subscriptions, and providing customer support.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                  <span><strong className="text-white">{t.serviceImprovement}:</strong> Analyzing usage patterns to improve AI accuracy, response times, and feature effectiveness.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                  <span><strong className="text-white">{t.communication}:</strong> Sending service updates, security notices, and marketing communications (with your consent).</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                  <span><strong className="text-white">{t.security}:</strong> Protecting against fraud, unauthorized access, and ensuring platform integrity.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Data Protection */}
          <section id="data-protection">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold">{t.dataProtection}</h2>
            </div>
            <div className="space-y-6 text-gray-300">
              <p>
                We implement industry-leading security measures to protect your data. Our infrastructure 
                is designed with multiple layers of protection to ensure confidentiality and integrity.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <Lock className="w-8 h-8 text-green-400 mb-4" />
                  <h3 className="font-bold text-white mb-2">{t.encryption}</h3>
                  <p className="text-sm">{t.encryptionDesc}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <Server className="w-8 h-8 text-blue-400 mb-4" />
                  <h3 className="font-bold text-white mb-2">{t.secureInfrastructure}</h3>
                  <p className="text-sm">{t.infrastructureDesc}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <Eye className="w-8 h-8 text-purple-400 mb-4" />
                  <h3 className="font-bold text-white mb-2">{t.accessControl}</h3>
                  <p className="text-sm">{t.accessControlDesc}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <Globe className="w-8 h-8 text-orange-400 mb-4" />
                  <h3 className="font-bold text-white mb-2">{t.hipaaCompliance}</h3>
                  <p className="text-sm">{t.hipaaDesc}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Information Sharing */}
          <section id="data-sharing">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <Globe className="w-5 h-5 text-orange-400" />
              </div>
              <h2 className="text-2xl font-bold">{t.informationSharing}</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p>We do not sell your personal information. We share data only in these circumstances:</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                  <span><strong className="text-white">{t.serviceProviders}:</strong> Trusted partners who help us deliver services (payments, SMS, voice AI). These providers are contractually bound to protect your data.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                  <span><strong className="text-white">{t.legalRequirements}:</strong> When required by law, court order, or to protect our legal rights.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                  <span><strong className="text-white">{t.businessTransfers}:</strong> In the event of a merger or acquisition, your data may transfer to the new entity under the same privacy protections.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                  <span><strong className="text-white">{t.withYourConsent}:</strong> Any other sharing will require your explicit approval.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Your Rights */}
          <section id="your-rights">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-bold">{t.yourRights}</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p>You have full control over your personal information:</p>
              <div className="grid gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <h3 className="font-bold text-white mb-2">{t.accessPortability}</h3>
                  <p className="text-sm">{t.accessDesc}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <h3 className="font-bold text-white mb-2">{t.correction}</h3>
                  <p className="text-sm">{t.correctionDesc}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <h3 className="font-bold text-white mb-2">{t.deletion}</h3>
                  <p className="text-sm">{t.deletionDesc}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <h3 className="font-bold text-white mb-2">{t.optOut}</h3>
                  <p className="text-sm">{t.optOutDesc}</p>
                </div>
              </div>
              <p className="mt-4 text-sm">
                {t.exerciseRights} <a href="mailto:privacy@frontdeskagents.com" className="text-green-400 hover:underline">privacy@frontdeskagents.com</a>.
              </p>
            </div>
          </section>

          {/* Cookies */}
          <section id="cookies">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <Eye className="w-5 h-5 text-yellow-400" />
              </div>
              <h2 className="text-2xl font-bold">{t.cookiesTracking}</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p>We use cookies and similar technologies to enhance your experience:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-white">{t.essentialCookies}:</strong> {t.essentialDesc}</li>
                <li><strong className="text-white">{t.analyticsCookies}:</strong> {t.analyticsDesc}</li>
                <li><strong className="text-white">{t.preferenceCookies}:</strong> {t.preferenceDesc}</li>
              </ul>
              <p className="mt-4">
                {t.cookieManage}
              </p>
              <button
                onClick={() => {
                  localStorage.removeItem('cookie_consent')
                  window.location.reload()
                }}
                className="mt-4 px-4 py-2 text-sm text-aurora-cyan border border-aurora-cyan/30 rounded-lg hover:bg-aurora-cyan/10 transition-colors"
              >
                Manage Cookie Preferences
              </button>
            </div>
          </section>

          {/* Data Retention */}
          <section id="data-retention">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold">{t.dataRetention}</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p>{t.retentionDesc}</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                {t.retentionItems.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
              <p className="mt-4">
                {t.retentionNote}
              </p>
            </div>
          </section>

          {/* Contact */}
          <section id="contact" className="bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Mail className="w-5 h-5 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold">{t.contactUs}</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p>
                {t.contactDesc}
              </p>
              <div className="space-y-2">
                <p><strong className="text-white">{t.email}</strong> <a href="mailto:privacy@frontdeskagents.com" className="text-green-400 hover:underline">privacy@frontdeskagents.com</a></p>
                <p><strong className="text-white">{t.responseTime}</strong></p>
              </div>
              <p className="text-sm mt-4">
                {t.generalSupport} <a href="/contact" className="text-green-400 hover:underline">{t.contactSupport}</a>.
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-white/10 text-center text-gray-500 text-sm">
          <p>FrontDesk Agents AI · frontdeskagents-684hwn3e1-juan-gonzalezs-projects-94b6dfe9.vercel.app</p>
          <p className="mt-2">
            <Link href="/privacy-policy" className="hover:text-white transition">{t.privacyPolicy}</Link>
            {' · '}
            <Link href="/terms-of-service" className="hover:text-white transition">{t.termsOfService}</Link>
            {' · '}
            <Link href="/contact" className="hover:text-white transition">{t.contact}</Link>
          </p>
        </div>
      </main>
    </div>
  )
}