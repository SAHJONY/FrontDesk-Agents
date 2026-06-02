'use client'

import { useState, useEffect } from 'react'
import { FileText, Shield, AlertTriangle, Gavel, Mail, CheckCircle, XCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import LanguageSelector from '../components/LanguageSelector'
import { rtlLanguages } from '../lib/rtl'

const BotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="16" height="16" x="4" y="4" rx="2" /><path d="M9 1v3M15 1v3M9 13l3 3 3-3M12 16V8" />
  </svg>
)

// 14 Language translations for Terms of Service
const translations = {
  en: {
    title: 'Terms of Service',
    lastUpdated: 'Last updated: May 21, 2026',
    legal: 'Legal',
    backToHome: '← Back to Home',
    tableOfContents: 'Table of Contents',
    acceptanceOfTerms: 'Acceptance of Terms',
    ourServices: 'Our Services',
    accountTerms: 'Account Terms',
    paymentBilling: 'Payment & Billing',
    acceptableUse: 'Acceptable Use',
    ipRights: 'Intellectual Property',
    liability: 'Limitation of Liability',
    termination: 'Termination',
    changesToTerms: 'Changes to These Terms',
    contactUs: 'Contact Us',
    serviceDescription: 'Service Description',
    serviceAvailability: 'Service Availability',
    accountRegistration: 'Account Registration',
    accountSecurity: 'Account Security',
    subscriptionPlans: 'Subscription Plans',
    billingTerms: 'Billing Terms',
    overages: 'Overages',
    yourTerminationRights: 'Your Termination Rights',
    ourTerminationRights: 'Our Termination Rights',
    effectOfTermination: 'Effect of Termination',
    starter: 'Starter',
    professional: 'Professional',
    enterprise: 'Enterprise',
    perMonth: '/month',
    important: 'Important',
    arbitrationNote: 'These Terms include an arbitration clause and waiver of class action rights. Please read Section 7 carefully.',
    acceptanceDesc1: 'By accessing or using FrontDesk Agents AI services, you agree to be bound by these Terms of Service ("Terms") and all applicable laws and regulations. If you do not agree with any part of these Terms, you may not use our services.',
    acceptanceDesc2: 'These Terms constitute a legally binding agreement between you ("you," "your," or "Customer") and FrontDesk Agents AI ("we," "us," or "our"). By using our AI receptionist platform, you acknowledge that you have read, understood, and agree to be bound by these Terms.',
    servicesDesc: 'FrontDesk Agents AI provides an AI-powered receptionist platform that enables businesses to automate call handling, appointment scheduling, SMS communications, and customer interactions.',
    platformIncludes: [
      'AI voice agents for natural call handling',
      'SMS messaging integration',
      'Appointment scheduling and calendar management',
      'Call recording and transcription services',
      'Real-time analytics and reporting dashboards',
      'Custom AI agent configuration and greetings',
      'Third-party integrations (payments, calendar apps, CRM systems)'
    ],
    availabilityDesc: 'We strive to maintain 99.9% uptime but do not guarantee uninterrupted service. Scheduled maintenance will be communicated in advance when possible. We reserve the right to modify or discontinue services with reasonable notice.',
    registrationItems: [
      'You must provide accurate, complete information during registration',
      'You are responsible for maintaining the security of your account credentials',
      'One person or business entity may not maintain multiple free accounts',
      'You must be at least 18 years old to create an account'
    ],
    securityItems: [
      'You are responsible for all activities under your account',
      'Notify us immediately of any unauthorized access',
      'We may suspend accounts suspected of security breaches',
      'You consent to security investigations if requested'
    ],
    starterDesc: '100 AI calls/month, email support, basic analytics',
    professionalDesc: '1,000 AI calls/month, priority support, advanced analytics, SMS integration',
    enterpriseDesc: 'Unlimited calls, 24/7 support, custom integrations, HIPAA compliance',
    billingItems: [
      'Subscriptions are billed monthly in advance',
      '14-day free trial available for new customers (no credit card required)',
      'Payment processed securely through our billing partner',
      'All fees are non-refundable except as required by law',
      'Price changes effective at next billing cycle with 30 days notice'
    ],
    overageDesc: 'Usage beyond plan limits will be charged at $0.05 per additional call (Starter), $0.03 per call (Professional), with Enterprise plans offering unlimited usage.',
    prohibitedActivities: [
      'Illegal activities or fraud of any kind',
      'Harassment, threats, or intimidation of others',
      'Spam, unsolicited communications, or telemarketing violations',
      'Disclosing personal data of others without consent',
      'Attempting to circumvent rate limits or security measures',
      'Reverse engineering or copying our AI technology',
      'Using automated systems in ways that harm service performance'
    ],
    prohibitedUseNote: 'Violation of this policy may result in immediate account suspension and legal action where applicable.',
    ourIP: 'Our Intellectual Property',
    yourContent: 'Your Content',
    aiGeneratedContent: 'AI-Generated Content',
    ipDesc1: 'FrontDesk Agents AI retains all rights to our platform, technology, branding, and content. You receive a limited, non-exclusive license to use our services during your subscription. You may not copy, modify, or distribute our technology without written permission.',
    ipDesc2: 'You retain ownership of all content you provide through our platform (custom greetings, configurations, business data). By using our services, you grant us a limited license to use your content solely to provide and improve our services.',
    ipDesc3: 'Responses generated by our AI agents during call handling belong to you for your business use. We may use anonymized, aggregated data to improve our AI models.',
    liabilityDesc1: 'TO THE MAXIMUM EXTENT PERMITTED BY LAW, FRONTDESK AGENTS AND ITS AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, OR GOODWILL, ARISING FROM YOUR USE OF SERVICES.',
    liabilityDesc2: 'Our total liability for any claim arising from our services shall not exceed the amount you paid us in the twelve months preceding the claim. We are not liable for any damages arising from third-party services, user error, or circumstances beyond our reasonable control.',
    indemnification: 'Indemnification',
    indemnificationDesc: 'You agree to indemnify and hold harmless FrontDesk Agents AI from any claims, damages, or expenses arising from your use of our services, violation of these Terms, or infringement of any third-party rights.',
    terminationDesc1: 'You may cancel your subscription at any time through your account settings or by contacting support. Cancellation takes effect at the end of your current billing period. No refunds are provided for partial months.',
    terminationDesc2: 'We may terminate or suspend your account immediately if you:',
    terminationDesc3: 'Upon termination, your access to services will cease, data will be retained for 30 days (unless legal requirements apply), and any outstanding fees remain due. Sections of these Terms that by their nature should survive termination will remain in effect.',
    terminationItems: [
      'Violate these Terms or Acceptable Use Policy',
      'Fail to pay fees when due',
      'Engage in fraudulent or illegal activity',
      'Pose a security risk to our platform or users'
    ],
    changesDesc: 'We may update these Terms from time to time. We will notify you of material changes via email or platform notification at least 30 days before they take effect. Your continued use of services after changes constitutes acceptance of the new Terms.',
    changesNote: 'The "Last updated" date at the top of this page indicates when these Terms were last revised.',
    contactDesc: 'For questions about these Terms of Service, please contact us:',
    email: 'Email:',
    responseTime: 'Response Time:',
    legalInquiries: 'We respond to legal inquiries within 5 business days',
    generalSupport: 'For general support, visit our',
    contactSupport: 'Contact Support page',
    termsOfService: 'Terms of Service',
    privacyPolicy: 'Privacy Policy',
    contact: 'Contact'
  },
  es: {
    title: 'Términos de Servicio',
    lastUpdated: 'Última actualización: 21 de mayo de 2026',
    legal: 'Legal',
    backToHome: '← Volver al Inicio',
    tableOfContents: 'Tabla de Contenidos',
    acceptanceOfTerms: 'Aceptación de los Términos',
    ourServices: 'Nuestros Servicios',
    accountTerms: 'Términos de Cuenta',
    paymentBilling: 'Pago y Facturación',
    acceptableUse: 'Uso Aceptable',
    ipRights: 'Propiedad Intelectual',
    liability: 'Limitación de Responsabilidad',
    termination: 'Terminación',
    changesToTerms: 'Cambios a Estos Términos',
    contactUs: 'Contáctenos',
    serviceDescription: 'Descripción del Servicio',
    serviceAvailability: 'Disponibilidad del Servicio',
    accountRegistration: 'Registro de Cuenta',
    accountSecurity: 'Seguridad de Cuenta',
    subscriptionPlans: 'Planes de Suscripción',
    billingTerms: 'Términos de Facturación',
    overages: 'Excedentes',
    yourTerminationRights: 'Sus Derechos de Terminación',
    ourTerminationRights: 'Nuestros Derechos de Terminación',
    effectOfTermination: 'Efecto de la Terminación',
    starter: 'Inicial',
    professional: 'Profesional',
    enterprise: 'Empresarial',
    perMonth: '/mes',
    important: 'Importante',
    arbitrationNote: 'Estos Términos incluyen una cláusula de arbitraje y renuncia a derechos de acciones colectivas. Por favor lea cuidadosamente la Sección 7.',
    acceptanceDesc1: 'Al acceder o usar los servicios de FrontDesk Agents AI, usted acepta estar sujeto a estos Términos de Servicio ("Términos") y todas las leyes y regulaciones aplicables. Si no está de acuerdo con cualquier parte de estos Términos, no puede usar nuestros servicios.',
    acceptanceDesc2: 'Estos Términos constituyen un acuerdo legalmente vinculante entre usted ("usted", "su" o "Cliente") y FrontDesk Agents AI ("nosotros", "nos" o "nuestro"). Al usar nuestra plataforma de receptionist AI, usted reconoce que ha leído, entendido y acepta estar sujeto a estos Términos.',
    servicesDesc: 'FrontDesk Agents AI proporciona una plataforma de receptionist impulsada por IA que permite a las empresas automatizar el manejo de llamadas, la programación de citas, las comunicaciones SMS y las interacciones con clientes.',
    platformIncludes: [
      'Agentes de voz IA para manejo natural de llamadas',
      'Integración de mensajería SMS',
      'Programación de citas y gestión de calendario',
      'Servicios de grabación y transcripción de llamadas',
      'Paneles de análisis e informes en tiempo real',
      'Configuración y saludos personalizados de agentes IA',
      'Integraciones de terceros (pagos, aplicaciones de calendario, sistemas CRM)'
    ],
    availabilityDesc: 'Nos esforzamos por mantener un 99.9% de tiempo de actividad pero no garantizamos servicio ininterrumpido. El mantenimiento programado se comunicará con anticipación cuando sea posible. Nos reservamos el derecho de modificar o discontinuar servicios con aviso razonable.',
    registrationItems: [
      'Debe proporcionar información precisa y completa durante el registro',
      'Usted es responsable de mantener la seguridad de sus credenciales de cuenta',
      'Una persona o entidad comercial no puede mantener múltiples cuentas gratuitas',
      'Debe tener al menos 18 años para crear una cuenta'
    ],
    securityItems: [
      'Usted es responsable de todas las actividades bajo su cuenta',
      'Notifiquenos inmediatamente de cualquier acceso no autorizado',
      'Podemos suspender cuentas sospechadas de violaciones de seguridad',
      'Usted consiente investigaciones de seguridad si se solicitan'
    ],
    starterDesc: '100 llamadas IA/mes, soporte por email, análisis básico',
    professionalDesc: '1,000 llamadas IA/mes, soporte prioritario, análisis avanzado, integración SMS',
    enterpriseDesc: 'Llamadas ilimitadas, soporte 24/7, integraciones personalizadas, cumplimiento HIPAA',
    billingItems: [
      'Las suscripciones se facturan mensualmente por adelantado',
      'Prueba gratuita de 14 días disponible para nuevos clientes (sin tarjeta de crédito requerida)',
      'Pago procesado de forma segura a través de nuestro socio de facturación',
      'Todas las tarifas no son reembolsables excepto según lo requiera la ley',
      'Los cambios de precio son efectivos en el próximo ciclo de facturación con 30 días de aviso'
    ],
    overageDesc: 'El uso más allá de los límites del plan se cobrará a $0.05 por llamada adicional (Inicial), $0.03 por llamada (Profesional), con planes Empresariales que ofrecen uso ilimitado.',
    prohibitedActivities: [
      'Actividades ilegales o fraude de cualquier tipo',
      'Acoso, amenazas o intimidación de otros',
      'Spam, comunicaciones no solicitadas o violaciones de telemercadeo',
      'Divulgación de datos personales de otros sin consentimiento',
      'Intentar evadir límites de tasa o medidas de seguridad',
      'Ingeniería inversa o copia de nuestra tecnología IA',
      'Uso de sistemas automatizados de maneras que dañen el rendimiento del servicio'
    ],
    prohibitedUseNote: 'La violación de esta política puede resultar en suspensión inmediata de la cuenta y acción legal donde corresponda.',
    ourIP: 'Nuestra Propiedad Intelectual',
    yourContent: 'Su Contenido',
    aiGeneratedContent: 'Contenido Generado por IA',
    ipDesc1: 'FrontDesk Agents AI retiene todos los derechos de nuestra plataforma, tecnología, marca y contenido. Usted recibe una licencia limitada, no exclusiva para usar nuestros servicios durante su suscripción. No puede copiar, modificar o distribuir nuestra tecnología sin permiso escrito.',
    ipDesc2: 'Usted conserva la propiedad de todo el contenido que proporcione a través de nuestra plataforma (saludos personalizados, configuraciones, datos comerciales). Al usar nuestros servicios, nos otorga una licencia limitada para usar su contenido únicamente para proporcionar y mejorar nuestros servicios.',
    ipDesc3: 'Las respuestas generadas por nuestros agentes IA durante el manejo de llamadas le pertenecen para su uso comercial. Podemos usar datos agregados y anonimizados para mejorar nuestros modelos IA.',
    liabilityDesc1: 'EN LA MÁXIMA MEDIDA PERMITIDA POR LA LEY, FRONTDESK AGENTS Y SUS AFILIADOS NO SERÁN RESPONSABLES POR NINGÚN DAÑO INDIRECTO, INCIDENTAL, ESPECIAL, CONSECUENTE O PUNITIVO, INCLUYENDO PERO NO LIMITADO A PÉRDIDA DE BENEFICIOS, DATOS, USO O GOODWILL, QUE SURJA DE SU USO DE LOS SERVICIOS.',
    liabilityDesc2: 'Nuestra responsabilidad total por cualquier reclamo que surja de nuestros servicios no excederá la cantidad que nos pagó en los doce meses precedentes al reclamo. No somos responsables de ningún daño que surja de servicios de terceros, error del usuario o circunstancias más allá de nuestro control razonable.',
    indemnification: 'Indemnización',
    indemnificationDesc: 'Usted acepta indemnizar y mantener indemne a FrontDesk Agents AI de cualquier reclamo, daño o gasto que surja de su uso de nuestros servicios, violación de estos Términos o infracción de cualquier derecho de terceros.',
    terminationDesc1: 'Usted puede cancelar su suscripción en cualquier momento a través de la configuración de su cuenta o contactando al soporte. La cancelación toma efecto al final de su período de facturación actual. No se proporcionan reembolsos por meses parciales.',
    terminationDesc2: 'Podemos terminar o suspender su cuenta inmediatamente si usted:',
    terminationDesc3: 'Upon termination, your access to services will cease, data will be retained for 30 days (unless legal requirements apply), and any outstanding fees remain due. Sections of these Terms that by their nature should survive termination will remain in effect.',
    terminationItems: [
      'Viola estos Términos o Política de Uso Aceptable',
      'No paga las tarifas cuando vencen',
      'Participa en actividad fraudulenta o ilegal',
      'Representa un riesgo de seguridad para nuestra plataforma o usuarios'
    ],
    changesDesc: 'Podemos actualizar estos Términos de vez en cuando. Le notificaremos de cambios materiales a través de email o notificación de plataforma al menos 30 días antes de que tomen efecto. Su uso continuado de los servicios después de los cambios constituye aceptación de los nuevos Términos.',
    changesNote: 'La fecha de "última actualización" en la parte superior de esta página indica cuándo estos Términos fueron revisados por última vez.',
    contactDesc: 'Para preguntas sobre estos Términos de Servicio, contáctenos:',
    email: 'Correo electrónico:',
    responseTime: 'Tiempo de Respuesta:',
    legalInquiries: 'Respondemos a consultas legales dentro de 5 días hábiles',
    generalSupport: 'Para soporte general, visite nuestra',
    contactSupport: 'página de soporte',
    termsOfService: 'Términos de Servicio',
    privacyPolicy: 'Política de Privacidad',
    contact: 'Contacto'
  },
  fr: {
    title: 'Conditions d\'Utilisation',
    lastUpdated: 'Dernière mise à jour: 21 mai 2026',
    legal: 'Juridique',
    backToHome: '← Retour à l\'Accueil',
    tableOfContents: 'Table des Matières',
    acceptanceOfTerms: 'Acceptation des Conditions',
    ourServices: 'Nos Services',
    accountTerms: 'Conditions de Compte',
    paymentBilling: 'Paiement et Facturation',
    acceptableUse: 'Utilisation Acceptable',
    ipRights: 'Propriété Intellectuelle',
    liability: 'Limitation de Responsabilité',
    termination: 'Résiliation',
    changesToTerms: 'Modifications de Ces Conditions',
    contactUs: 'Contactez-Nous',
    serviceDescription: 'Description du Service',
    serviceAvailability: 'Disponibilité du Service',
    accountRegistration: 'Inscription au Compte',
    accountSecurity: 'Sécurité du Compte',
    subscriptionPlans: 'Plans d\'Abonnement',
    billingTerms: 'Conditions de Facturation',
    overages: 'Excédents',
    yourTerminationRights: 'Vos Droits de Résiliation',
    ourTerminationRights: 'Nos Droits de Résiliation',
    effectOfTermination: 'Effet de la Résiliation',
    starter: 'Starter',
    professional: 'Professionnel',
    enterprise: 'Entreprise',
    perMonth: '/mois',
    important: 'Important',
    arbitrationNote: 'Ces Conditions incluent une clause d\'arbitrage et une renonciation aux droits des actions collectives. Veuillez lire attentivement la Section 7.',
    acceptanceDesc1: 'En accédant ou en utilisant les services de FrontDesk Agents AI, vous acceptez d\'être lié par ces Conditions d\'Utilisation ("Conditions") et toutes les lois et réglementations applicables. Si vous n\'êtes pas d\'accord avec une partie de ces Conditions, vous ne pouvez pas utiliser nos services.',
    acceptanceDesc2: 'Ces Conditions constituent un accord légalement contraignant entre vous ("vous", "votre" ou "Client") et FrontDesk Agents AI ("nous", "notre"). En utilisant notre plateforme de receptionist IA, vous reconnaissez avoir lu, compris et accepter d\'être lié par ces Conditions.',
    servicesDesc: 'FrontDesk Agents AI fournit une plateforme de receptionist alimentée par IA qui permet aux entreprises d\'automatiser la gestion des appels, la planification de rendez-vous, les communications SMS et les interactions avec les clients.',
    platformIncludes: [
      'Agents vocaux IA pour gestion naturelle des appels',
      'Intégration de messagerie SMS',
      'Planification de rendez-vous et gestion de calendrier',
      'Services d\'enregistrement et de transcription des appels',
      'Tableaux de bord d\'analyse et de rapports en temps réel',
      'Configuration d\'agent IA personnalisé et salutations',
      'Intégrations tierces (paiements, applications de calendrier, systèmes CRM)'
    ],
    availabilityDesc: 'Nous nous efforçons de maintenir 99,9% de disponibilité mais ne garantissons pas un service ininterrompu. La maintenance planifiée sera communiquée à l\'avance lorsque possible. Nous nous réservons le droit de modifier ou d\'interrompre les services avec un préavis raisonnable.',
    registrationItems: [
      'Vous devez fournir des informations précises et complètes lors de l\'inscription',
      'Vous êtes responsable du maintien de la sécurité de vos identifiants de compte',
      'Une personne ou entité commerciale ne peut pas maintenir plusieurs comptes gratuits',
      'Vous devez avoir au moins 18 ans pour créer un compte'
    ],
    securityItems: [
      'Vous êtes responsable de toutes les activités sous votre compte',
      'Nous notifier immédiatement en cas d\'accès non autorisé',
      'Nous pouvons suspendre les comptes suspectés de violations de sécurité',
      'Vous consentez aux enquêtes de sécurité si demandé'
    ],
    starterDesc: '100 appels IA/mois, support email, analytique basique',
    professionalDesc: '1,000 appels IA/mois, support prioritaire, analytique avancé, intégration SMS',
    enterpriseDesc: 'Appels illimités, support 24/7, intégrations personnalisées, conformité HIPAA',
    billingItems: [
      'Les abonnements sont facturés mensuellement à l\'avance',
      'Essai gratuit de 14 jours disponible pour les nouveaux clients (sans carte de crédit requise)',
      'Paiement traité de manière sécurisée via notre partenaire de facturation',
      'Tous les frais sont non remboursables sauf si requis par la loi',
      'Les changements de prix sont effectifs au prochain cycle de facturation avec 30 jours de préavis'
    ],
    overageDesc: 'L\'utilisation au-delà des limites du plan sera facturée à $0.05 par appel supplémentaire (Starter), $0.03 par appel (Professionnel), avec les plans Entreprise offrant une utilisation illimitée.',
    prohibitedActivities: [
      'Activités illégales ou fraude de tout type',
      'Harcèlement, menaces ou intimidation d\'autrui',
      'Spam, communications non sollicitées ou violations de télémarketing',
      'Divulgation de données personnelles d\'autrui sans consentement',
      'Tentative de contourner les limites de taux ou les mesures de sécurité',
      'Ingénierie inverse ou copie de notre technologie IA',
      'Utilisation de systèmes automatisés de manière à nuire aux performances du service'
    ],
    prohibitedUseNote: 'La violation de cette politique peut entraîner une suspension immédiate du compte et des poursuites judiciaires le cas échéant.',
    ourIP: 'Notre Propriété Intellectuelle',
    yourContent: 'Votre Contenu',
    aiGeneratedContent: 'Contenu Généré par IA',
    ipDesc1: 'FrontDesk Agents AI conserve tous les droits sur notre plateforme, technologie, marque et contenu. Vous recevez une licence limitée, non exclusive pour utiliser nos services pendant votre abonnement. Vous ne pouvez pas copier, modifier ou distribuer notre technologie sans permission écrite.',
    ipDesc2: 'Vous conservez la propriété de tout le contenu que vous fournissez via notre plateforme (salutations personnalisées, configurations, données commerciales). En utilisant nos services, vous nous accordez une licence limitée pour utiliser votre contenu uniquement pour fournir et améliorer nos services.',
    ipDesc3: 'Les réponses générées par nos agents IA pendant la gestion des appels vous appartiennent pour votre usage commercial. Nous pouvons utiliser des données agrégées et anonymisées pour améliorer nos modèles IA.',
    liabilityDesc1: 'DANS LA MAXIME MESURE PERMISE PAR LA LOI, FRONTDESK AGENTS ET SES AFFILIÉS NE SERONT PAS RESPONSABLES DE TOUT DOMMAGE INDIRECT, INCIDENTEL, SPÉCIAL, CONSÉCUTIF OU PUNITIF, Y COMPRIS MAIS SANS S\'Y LIMITER À LA PERTE DE BÉNÉFICES, DE DONNÉES, D\'UTILISATION OU DE GOODWILL, RÉSULTANT DE VOTRE UTILISATION DES SERVICES.',
    liabilityDesc2: 'Notre responsabilité totale pour toute réclamation découlant de nos services ne dépassera pas le montant que vous nous avez payé au cours des douze mois précédant la réclamation. Nous ne sommes pas responsables des dommages résultant de services tiers, d\'erreurs utilisateur ou de circonstances beyond notre contrôle raisonnable.',
    indemnification: 'Indemnisation',
    indemnificationDesc: 'Vous acceptez d\'indemniser et de tenir FrontDesk Agents AI harmless de toute réclamation, dommage ou dépense découlant de votre utilisation de nos services, violation de ces Conditions ou atteinte aux droits de tiers.',
    terminationDesc1: 'Vous pouvez annuler votre abonnement à tout moment via les paramètres de votre compte ou en contactant le support. L\'annulation prend effet à la fin de votre période de facturation actuelle. Aucun remboursement n\'est fourni pour les mois partiels.',
    terminationDesc2: 'Nous pouvons résilier ou suspendre votre compte immédiatement si vous:',
    terminationDesc3: 'Upon termination, your access to services will cease, data will be retained for 30 days (unless legal requirements apply), and any outstanding fees remain due. Sections of these Terms that by their nature should survive termination will remain in effect.',
    terminationItems: [
      'Violer ces Conditions ou la Politique d\'Utilisation Acceptable',
      'Ne pas payer les frais lorsqu\'ils sont dus',
      'S\'engager dans une activité frauduleuse ou illégale',
      'Présenter un risque de sécurité pour notre plateforme ou nos utilisateurs'
    ],
    changesDesc: 'Nous pouvons mettre à jour ces Conditions de temps à autre. Nous vous notifierons des changements importants par email ou notification de plateforme au moins 30 jours avant qu\'ils prennent effet. Votre utilisation continue des services après les changements constitue acceptation des nouvelles Conditions.',
    changesNote: 'La date de "dernière mise à jour" en haut de cette page indique quand ces Conditions ont été révisées pour la dernière fois.',
    contactDesc: 'Pour toute question concernant ces Conditions d\'Utilisation, veuillez nous contacter:',
    email: 'Email:',
    responseTime: 'Temps de Réponse:',
    legalInquiries: 'Nous répondons aux demandes juridiques dans les 5 jours ouvrables',
    generalSupport: 'Pour le support général, visit our',
    contactSupport: 'page de support',
    termsOfService: 'Conditions d\'Utilisation',
    privacyPolicy: 'Politique de Confidentialité',
    contact: 'Contact'
  },
  zh: {
    title: '服务条款',
    lastUpdated: '最后更新：2026年5月21日',
    legal: '法律',
    backToHome: '← 返回首页',
    tableOfContents: '目录',
    acceptanceOfTerms: '条款接受',
    ourServices: '我们的服务',
    accountTerms: '账户条款',
    paymentBilling: '付款和计费',
    acceptableUse: '可接受使用',
    ipRights: '知识产权',
    liability: '责任限制',
    termination: '终止',
    changesToTerms: '条款变更',
    contactUs: '联系我们',
    serviceDescription: '服务说明',
    serviceAvailability: '服务可用性',
    accountRegistration: '账户注册',
    accountSecurity: '账户安全',
    subscriptionPlans: '订阅计划',
    billingTerms: '计费条款',
    overages: '超额使用',
    yourTerminationRights: '您的终止权利',
    ourTerminationRights: '我们的终止权利',
    effectOfTermination: '终止的效果',
    starter: '入门版',
    professional: '专业版',
    enterprise: '企业版',
    perMonth: '/月',
    important: '重要',
    arbitrationNote: '这些条款包括仲裁条款和集体诉讼权利放弃。请仔细阅读第7节。',
    acceptanceDesc1: '通过访问或使用FrontDesk Agents AI服务，您同意受这些服务条款（"条款"）及所有适用法律法规的约束。如果您不同意这些条款的任何部分，则不能使用我们的服务。',
    acceptanceDesc2: '这些条款构成您（"您"、"您的"或"客户"）与FrontDesk Agents AI（"我们"、"我们的"）之间的法律约束协议。通过使用我们的AI接待员平台，您确认已阅读、理解并同意受这些条款的约束。',
    servicesDesc: 'FrontDesk Agents AI提供了一个AI驱动的接待员平台，使企业能够自动化呼叫处理、预约安排、短信通讯和客户互动。',
    platformIncludes: [
      '用于自然呼叫处理的AI语音代理',
      '短信消息集成',
      '预约安排和日历管理',
      '呼叫录制和转录服务',
      '实时分析和报告仪表板',
      '自定义AI代理配置和问候语',
      '第三方集成（支付、日历应用、CRM系统）'
    ],
    availabilityDesc: '我们努力保持99.9%的正常运行时间，但不保证不间断的服务。计划维护将尽可能提前沟通。我们保留以合理通知修改或停止服务的权利。',
    registrationItems: [
      '注册时必须提供准确完整的信息',
      '您负责维护账户凭据的安全性',
      '一个人或商业实体不能维护多个免费账户',
      '您必须年满18岁才能创建账户'
    ],
    securityItems: [
      '您对账户下的所有活动负责',
      '立即通知我们任何未经授权的访问',
      '我们可能会暂停涉嫌安全漏洞的账户',
      '如果要求，您同意进行安全调查'
    ],
    starterDesc: '100次AI通话/月，邮件支持，基本分析',
    professionalDesc: '1,000次AI通话/月，优先支持，高级分析，短信集成',
    enterpriseDesc: '无限通话，24/7支持，自定义集成，HIPAA合规',
    billingItems: [
      '订阅按月提前计费',
      '新客户可获得14天免费试用（无需信用卡）',
      '通过我们的计费合作伙伴安全处理付款',
      '除法律要求外，所有费用不可退还',
      '价格变更将在下一个计费周期生效，并提前30天通知'
    ],
    overageDesc: '超过计划限制的使用将按每次额外通话$0.05（入门版）、$0.03（专业版）收费，企业计划提供无限使用。',
    prohibitedActivities: [
      '任何类型的非法活动或欺诈',
      '骚扰、威胁或恐吓他人',
      '垃圾邮件、未经请求的通讯或违反电话营销规定',
      '未经同意披露他人的个人数据',
      '试图规避速率限制或安全措施',
      '反向工程或复制我们的AI技术',
      '以损害服务性能的方式使用自动化系统'
    ],
    prohibitedUseNote: '违反此政策可能导致立即暂停账户，并在适用情况下采取法律行动。',
    ourIP: '我们的知识产权',
    yourContent: '您的内容',
    aiGeneratedContent: 'AI生成的内容',
    ipDesc1: 'FrontDesk Agents AI保留对我们平台、技术、品牌和内容的所有权利。在订阅期间，您获得有限的非独占许可来使用我们的服务。未经书面许可，您不得复制、修改或分发我们的技术。',
    ipDesc2: '您保留通过我们的平台提供的所有内容的所有权（自定义问候语、配置、业务数据）。通过使用我们的服务，您授予我们有限的许可，仅使用您的内容来提供和改进我们的服务。',
    ipDesc3: '我们的AI代理在呼叫处理期间生成的响应归您用于您的商业目的。我们可以使用匿名聚合数据来改进我们的AI模型。',
    liabilityDesc1: '在法律允许的最大范围内，FRONTDESK AGENTS及其附属公司不对任何间接、附带、特殊、后果性或惩罚性损害承担责任，包括但不限于因使用服务而产生的利润、数据、使用或商誉损失。',
    liabilityDesc2: '对于因我们的服务而产生的任何索赔，我们的总责任不应超过您在前十二个月向我们支付的金额。我们不对第三方服务、用户错误或超出我们合理控制范围的情况而产生的任何损害承担责任。',
    indemnification: '赔偿',
    indemnificationDesc: '您同意赔偿并使FrontDesk Agents AI免受因您使用我们的服务、违反这些条款或侵犯任何第三方权利而产生的任何索赔、损害或费用。',
    terminationDesc1: '您可以随时通过账户设置或联系支持取消订阅。取消将在当前计费期结束时生效。不提供部分月份的退款。',
    terminationDesc2: '如果您的账户存在以下情况，我们可能会立即终止或暂停：',
    terminationDesc3: '终止后，您对服务的访问将停止，数据将保留30天（除非法律要求适用），任何未付费用仍需支付。这些条款中因其性质应在终止后继续有效的部分将继续有效。',
    terminationItems: [
      '违反这些条款或可接受使用政策',
      '到期时未支付费用',
      '从事欺诈或非法活动',
      '对我们的平台或用户构成安全风险'
    ],
    changesDesc: '我们可能会不时更新这些条款。我们将通过电子邮件或平台通知提前至少30天通知您重大变更。在变更后继续使用服务即表示您接受新条款。',
    changesNote: '页面顶部的"最后更新"日期表示这些条款的最后修订时间。',
    contactDesc: '如对这些服务条款有任何疑问，请联系我们：',
    email: '电子邮件：',
    responseTime: '响应时间：',
    legalInquiries: '我们在5个工作日内回复法律询问',
    generalSupport: '如需一般支持，请访问我们的',
    contactSupport: '支持页面',
    termsOfService: '服务条款',
    privacyPolicy: '隐私政策',
    contact: '联系'
  },
  hi: {
    title: 'सेवा की शर्तें',
    lastUpdated: 'अंतिम अपडेट: 21 मई 2026',
    legal: 'कानूनी',
    backToHome: '← होमपेज पर वापस',
    tableOfContents: 'विषय-सूची',
    acceptanceOfTerms: 'शर्तों की स्वीकृति',
    ourServices: 'हमारी सेवाएं',
    accountTerms: 'खाता शर्तें',
    paymentBilling: 'भुगतान और बिलिंग',
    acceptableUse: 'स्वीकार्य उपयोग',
    ipRights: 'बौद्धिक संपदा',
    liability: 'दायित्व की सीमा',
    termination: 'समाप्ति',
    changesToTerms: 'इन शर्तों में परिवर्तन',
    contactUs: 'संपर्क करें',
    serviceDescription: 'सेवा विवरण',
    serviceAvailability: 'सेवा की उपलब्धता',
    accountRegistration: 'खाता पंजीकरण',
    accountSecurity: 'खाता सुरक्षा',
    subscriptionPlans: 'सदस्यता योजनाएं',
    billingTerms: 'बिलिंग शर्तें',
    overages: 'ओवरएज',
    yourTerminationRights: 'आपके समाप्ति अधिकार',
    ourTerminationRights: 'हमारे समाप्ति अधिकार',
    effectOfTermination: 'समाप्ति का प्रभाव',
    starter: 'स्टार्टर',
    professional: 'प्रोफेशनल',
    enterprise: 'एंटरप्राइज',
    perMonth: '/महीना',
    important: 'महत्वपूर्ण',
    arbitrationNote: 'इन शर्तों में मध्यस्थता खंड और क्लास एक्शन अधिकारों का परित्याग शामिल है। कृपया धारा 7 को ध्यान से पढ़ें।',
    acceptanceDesc1: 'FrontDesk Agents AI सेवाओं तक पहुंच या उनका उपयोग करके, आप इन सेवा शर्तों ("शर्तें") और सभी लागू कानूनों और विनियमों से बंधे होने के लिए सहमत हैं। यदि आप इन शर्तों के किसी भाग से सहमत नहीं हैं, तो आप हमारी सेवाओं का उपयोग नहीं कर सकते।',
    acceptanceDesc2: 'ये शर्तें आप ("आप", "आपका" या "ग्राहक") और FrontDesk Agents AI ("हम", "हमारा") के बीच एक कानूनी रूप से बाध्यकारी समझौता है। हमारे AI रिसेप्शनिस्ट प्लेटफॉर्म का उपयोग करके, आप स्वीकार करते हैं कि आपने पढ़ा, समझा और इन शर्तों से बंधने के लिए सहमति दी है।',
    servicesDesc: 'FrontDesk Agents AI एक AI-संचालित रिसेप्शनिस्ट प्लेटफॉर्म प्रदान करता है जो व्यवसायों को कॉल हैंडलिंग, अपॉइंटमेंट शेड्यूलिंग, SMS संचार और ग्राहक इंटरैक्शन को स्वचालित करने में सक्षम बनाता है।',
    platformIncludes: [
      'प्राकृतिक कॉल हैंडलिंग के लिए AI वॉइस एजेंट',
      'SMS मैसेजिंग इंटीग्रेशन',
      'अपॉइंटमेंट शेड्यूलिंग और कैलेंडर प्रबंधन',
      'कॉल रिकॉर्डिंग और ट्रांसक्रिप्शन सेवाएं',
      'रीयल-टाइम एनालिटिक्स और रिपोर्टिंग डैशबोर्ड',
      'कस्टम AI एजेंट कॉन्फ़िगरेशन और ग्रीटिंग्स',
      'थर्ड-पार्टी इंटीग्रेशन (भुगतान, कैलेंडर ऐप्स, CRM सिस्टम)'
    ],
    availabilityDesc: 'हम 99.9% अपटाइम बनाए रखने का प्रयास करते हैं लेकिन निर्बाध सेवा की गारंटी नहीं देते। निर्धारित रखरखाव को जब संभव हो अग्रिम रूप से संवादित किया जाएगा। हमें उचित सूचना के साथ सेवाओं को संशोधित या बंद करने का अधिकार है।',
    registrationItems: [
      'पंजीकरण के दौरान आपको सटीक और पूर्ण जानकारी प्रदान करनी होगी',
      'आप अपने खाता क्रेडेंशियल्स की सुरक्षा बनाए रखने के लिए जिम्मेदार हैं',
      'एक व्यक्ति या व्यावसायिक संस्था कई मुफ्त खाते नहीं रख सकता',
      'खाता बनाने के लिए आपकी आयु कम से कम 18 वर्ष होनी चाहिए'
    ],
    securityItems: [
      'आप अपने खाते के तहत सभी गतिविधियों के लिए जिम्मेदार हैं',
      'किसी भी अनधिकृत पहुंच की तुरंत सूचना दें',
      'हम सुरक्षा उल्लंघन के संदेह वाले खातों को निलंबित कर सकते हैं',
      'यदि अनुरोध किया जाए तो आप सुरक्षा जांच के लिए सहमत हैं'
    ],
    starterDesc: '100 AI कॉल/महीना, ईमेल सहायता, बुनियादी एनालिटिक्स',
    professionalDesc: '1,000 AI कॉल/महीना, प्राथमिक सहायता, उन्नत एनालिटिक्स, SMS इंटीग्रेशन',
    enterpriseDesc: 'असीमित कॉल, 24/7 सहायता, कस्टम इंटीग्रेशन, HIPAA अनुपालन',
    billingItems: [
      'सदस्यताएं मासिक रूप से अग्रिम रूप से बिल की जाती हैं',
      'नए ग्राहकों के लिए 14-दिवसीय निःशुल्क परीक्षण उपलब्ध (कोई क्रेडिट कार्ड आवश्यक नहीं)',
      'भुगतान हमारे बिलिंग पार्टner through सुरक्षित रूप से प्रोसेस किया जाता है',
      'कानूनी आवश्यकता के अलावा सभी शुल्क अप्रतिदेय हैं',
      'मूल्य परिवर्तन 30 दिनों की सूचना के साथ अगले बिलिंग चक्र से प्रभावी'
    ],
    overageDesc: 'योजना सीमाओं से परे उपयोग प्रति अतिरिक्त कॉल $0.05 (स्टार्टर), $0.03 (प्रोफेशनल) पर शुल्क लिया जाएगा, एंटरप्राइज़ योजनाएं असीमित उपयोग प्रदान करती हैं।',
    prohibitedActivities: [
      'किसी भी प्रकार की अवैध गतिविधियां या धोखाधड़ी',
      'दूसरों का उत्पीड़न, धमकी या भयभीत करना',
      'स्पैम, अवांछित संचार, या टेलीमार्केटिंग उल्लंघन',
      'सहमति के बिना दूसरों के व्यक्तिगत डेटा का खुलासा',
      'दर सीमाओं या सुरक्षा उपायों को circumvent करने का प्रयास',
      'हमारे AI तकनीक का रिवर्स इंजीनियरिंग या कॉपी करना',
      'सेवा प्रदर्शन को नुकसान पहुंचाने वाले तरीकों से स्वचालित सिस्टम का उपयोग'
    ],
    prohibitedUseNote: 'इस नीति का उल्लंघन तुरंत खाता निलंबन और जहां लागू हो कानूनी कार्रवाई का परिणाम हो सकता है।',
    ourIP: 'हमारी बौद्धिक संपदा',
    yourContent: 'आपकी सामग्री',
    aiGeneratedContent: 'AI-जनरेटेड सामग्री',
    ipDesc1: 'FrontDesk Agents AI हमारे प्लेटफॉर्म, तकनीक, ब्रांडिंग और सामग्री पर सभी अधिकार रखता है। आपको अपनी सदस्यता के दौरान हमारी सेवाओं का उपयोग करने के लिए एक सीमित, गैर-अनन्य लाइसेंस प्राप्त होता है। बिना लिखित अनुमति के आप हमारी तकनीक को कॉपी, संशोधित या वितरित नहीं कर सकते।',
    ipDesc2: 'आप हमारे प्लेटफॉर्म through प्रदान की गई सभी सामग्री (कस्टम ग्रीटिंग्स, कॉन्फ़िगरेशन, व्यावसायिक डेटा) पर स्वामित्व बनाए रखते हैं। हमारी सेवाओं का उपयोग करके, आप हमें केवल हमारी सेवाएं प्रदान करने और सुधारने के लिए आपकी सामग्री का उपयोग करने के लिए एक सीमित लाइसेंस देते हैं।',
    ipDesc3: 'कॉल हैंडलिंग के दौरान हमारे AI एजेंटों द्वारा उत्पन्न प्रतिक्रियाएं आपके व्यावसायिक उपयोग के लिए आपकी हैं। हम अपने AI मॉडल को बेहतर बनाने के लिए अनामीकृत, समग्र डेटा का उपयोग कर सकते हैं।',
    liabilityDesc1: 'कानून द्वारा अनुमत अधिकतम सीमा तक, FRONTDESK AGENTS और इसके सहयोगी किसी भी अप्रत्यक्ष, आकस्मिक, विशेष, परिणामी या दंडात्मक क्षति के लिए उत्तरदायी नहीं होंगे, जिसमें सेवाओं के उपयोग से उत्पन्न होने वाले लाभ, डेटा, उपयोग या गुडविल की हानि शामिल है लेकिन इन तक सीमित नहीं है।',
    liabilityDesc2: 'हमारी सेवाओं से उत्पन्न किसी भी दावे के लिए हमारी कुल देनदारी दावे से पहले बारह महीनों में आपके द्वारा हमें भुगतान की गई राशि से अधिक नहीं होगी। हम तृतीय-पक्ष सेवाओं, उपयोगकर्ता त्रुटि, या हमारे उचित नियंत्रण से परे की परिस्थितियों से उत्पन्न किसी भी क्षति के लिए उत्तरदायी नहीं हैं।',
    indemnification: 'प्रतिपूर्ति',
    indemnificationDesc: 'आप हमारी सेवाओं के उपयोग, इन शर्तों के उल्लंघन, या किसी तृतीय-पक्ष अधिकारों के उल्लंघन से उत्पन्न किसी भी दावे, क्षति या व्यय से FrontDesk Agents AI को भरपाई देने और हानिरहित रखने के लिए सहमत हैं।',
    terminationDesc1: 'आप किसी भी समय अपने खाता सेटिंग्स through या सहायता से संपर्क करके अपनी सदस्यता रद्द कर सकते हैं। रद्दीकरण आपकी वर्तमान बिलिंग अवधि के अंत में प्रभावी होता है। आंशिक महीनों के लिए कोई धनवापसी प्रदान नहीं की जाती।',
    terminationDesc2: 'यदि आप निम्न कारण से हैं तो हम तुरंत आपका खाता समाप्त या निलंबित कर सकते हैं:',
    terminationDesc3: 'समाप्ति पर, सेवाओं तक आपकी पहुंच समाप्त हो जाएगी, डेटा 30 दिनों के लिए रखा जाएगा (जब तक कानूनी आवश्यकताएं लागू न हों), और कोई भी बकाया शुल्क देय रहेगा। इन शर्तों के वे खंड जो स्वभाव से समाप्ति के बाद बने रहने चाहिए, वे प्रभावी रहेंगे।',
    terminationItems: [
      'इन शर्तों या स्वीकार्य उपयोग नीति का उल्लंघन',
      'देय होने पर शुल्क का भुगतान करने में विफल',
      'धोखाधड़ी या अवैध गतिविधि में लिप्त',
      'हमारे प्लेटफॉर्म या उपयोगकर्ताओं के लिए सुरक्षा जोखिम',
      'हमारी सेवाओं का उपयोग, इन शर्तों के उल्लंघन, या किसी तृतीय-पक्ष अधिकारों के उल्लंघन से उत्पन्न किसी भी दावे, क्षति या व्यय से बचाव करना'
    ],
    changesDesc: 'हम समय-समय पर इन शर्तों को अपडेट कर सकते हैं। हम प्रभावी होने से कम से कम 30 दिन पहले ईमेल or प्लेटफॉर्म नोटिफिकेशन through महत्वपूर्ण परिवर्तनों की सूचना देंगे। परिवर्तन के बाद सेवाओं का निरंतर उपयोग नई शर्तों की स्वीकृति constitutes करता है।',
    changesNote: 'इस पेज के शीर्ष पर "अंतिम अपडेट" तिथि इन शर्तों के अंतिम संशोधन को इंगित करती है।',
    contactDesc: 'इन सेवा शर्तों के बारे में प्रश्नों के लिए, कृपया हमसे संपर्क करें:',
    email: 'ईमेल:',
    responseTime: 'प्रतिक्रिया समय:',
    legalInquiries: 'हम 5 व्यावसायिक दिनों के भीतर कानूनी पूछताछ का जवाब देते हैं',
    generalSupport: 'सामान्य सहायता के लिए, हमारे पर जाएं',
    contactSupport: 'सहायता पेज',
    termsOfService: 'सेवा की शर्तें',
    privacyPolicy: 'गोपनीयता नीति',
    contact: 'संपर्क'
  },
  ar: {
    title: 'شروط الخدمة',
    lastUpdated: 'آخر تحديث: 21 مايو 2026',
    legal: 'قانوني',
    backToHome: '← العودة إلى الصفحة الرئيسية',
    tableOfContents: 'جدول المحتويات',
    acceptanceOfTerms: 'قبول الشروط',
    ourServices: 'خدماتنا',
    accountTerms: 'شروط الحساب',
    paymentBilling: 'الدفع والفوترة',
    acceptableUse: 'الاستخدام المقبول',
    ipRights: 'الملكية الفكرية',
    liability: 'تحديد المسؤولية',
    termination: 'الإنهاء',
    changesToTerms: 'التعديلات على هذه الشروط',
    contactUs: 'اتصل بنا',
    serviceDescription: 'وصف الخدمة',
    serviceAvailability: 'توفر الخدمة',
    accountRegistration: 'تسجيل الحساب',
    accountSecurity: 'أمان الحساب',
    subscriptionPlans: 'خطط الاشتراك',
    billingTerms: 'شروط الفوترة',
    overages: 'الرسوم الإضافية',
    yourTerminationRights: 'حقوق الإنهاء الخاصة بك',
    ourTerminationRights: 'حقوق الإنهاء الخاصة بنا',
    effectOfTermination: 'تأثير الإنهاء',
    starter: 'المبتدئ',
    professional: 'المحترف',
    enterprise: 'المؤسساتي',
    perMonth: '/شهرياً',
    important: 'مهم',
    arbitrationNote: 'تشمل هذه الشروط شرط التحكيم والتنازل عن حقوق الإجراءات الجماعية. يرجى قراءة القسم 7 بعناية.',
    acceptanceDesc1: 'من خلال الوصول إلى خدمات FrontDesk Agents AI أو استخدامها، فأنت توافق على الالتزام بشروط الخدمة these ("الشروط") وجميع القوانين واللوائح المعمول بها. إذا كنت لا توافق على أي جزء من هذه الشروط، فلا يمكنك استخدام خدماتنا.',
    acceptanceDesc2: 'تشكل هذه الشروط اتفاقاً ملزماً قانونياً بينك ("أنت" أو "الخاص بك" أو "العميل") وFrontDesk Agents AI ("نحن" أو "لنا"). من خلال استخدام منصتنا لمساعد الذكاء الاصطناعي، فإنك تقر بأنك قد قرأت وفهمت ووافقت على الالتزام بهذه الشروط.',
    servicesDesc: 'توفر FrontDesk Agents AI منصة مساعدة ذكاء اصطناعي تمكّن الشركات من أتمتة معالجة المكالمات وجدولة المواعيد واتصالات الرسائل النصية وتفاعلات العملاء.',
    platformIncludes: [
      'وكلاء صوت ذكاء اصطناعي لمعالجة المكالمات الطبيعية',
      'تكامل الرسائل النصية',
      'جدولة المواعيد وإدارة التقويم',
      'خدمات تسجيل المكالمات ونسخها',
      'لوحات تحليلات وتقارير في الوقت الفعلي',
      'تكوين агент الذكاء الاصطناعي المخصص والتحيات',
      'تكاملات сторонних الأطراف (المدفوعات وتطبيقات التقويم وأنظمة إدارة علاقات العملاء)'
    ],
    availabilityDesc: 'نسعى للحفاظ على وقت تشغيل 99.9٪，但我们不保证不间断的服务。计划维护将尽可能提前沟通。我们保留以合理通知修改或 discontinue 服务的权利。',
    registrationItems: [
      'يجب عليك تقديم معلومات دقيقة وكاملة أثناء التسجيل',
      'أنت مسؤول عن maintaining أمان بيانات اعتماد حسابك',
      'لا يمكن لشخص أو كيان تجاري الاحتفاظ بحسابات مجانية متعددة',
      'يجب أن يكون عمرك 18 عامًا على الأقل لإنشاء حساب'
    ],
    securityItems: [
      'أنت مسؤول عن جميع الأنشطة ضمن حسابك',
      'أبلغنا فورًا عن أي وصول غير مصرح به',
      'قد نعلق الحسابات المشتبه في انتهاك أمانها',
      'توافق على التحقيقات الأمنية إذا طُلب منك'
    ],
    starterDesc: '100 مكالمة ذكاء اصطناعي/شهر، دعم عبر البريد الإلكتروني، تحليلات أساسية',
    professionalDesc: '1,000 مكالمة ذكاء اصطناعي/شهر، دعم ذو أولوية، تحليلات متقدمة، تكامل الرسائل النصية',
    enterpriseDesc: 'مكالمات غير محدودة، دعم على مدار الساعة، تكاملات مخصصة، امتثال HIPAA',
    billingItems: [
      'يتم فوترة الاشتراكات شهريًا مقدمًا',
      'تتوفر فترة تجريبية مجانية لمدة 14 يومًا للعملاء الجدد (بدون بطاقة ائتمانية مطلوبة)',
      'تتم معالجة الدفع بشكل آمن من خلال شريك الفوترة الخاص بنا',
      'جميع الرسوم غير قابلة للاسترداد إلا إذا اقتضى القانون ذلك',
      'تسري تغييرات الأسعار في دورة الفوترة التالية مع إشعار مسبق قبل 30 يومًا'
    ],
    overageDesc: 'سيتم فرض رسوم على الاستخدامbeyond حدود الخطة بمعدل $0.05 لكل مكالمة إضافية (المبتدئ)، $0.03 لكل مكالمة (المحترف)، مع خطط المؤسسات التي توفر استخدامًا غير محدود.',
    prohibitedActivities: [
      'الأنشطة غير القانونية أو الاحتيال من أي نوع',
      'المضايقة أو التهديد أو تخويف الآخرين',
      'الرسائل غير المرغوب فيها أو انتهاكات التسويق عبر الهاتف',
      'الإفصاح عن البيانات الشخصية للآخرين دون موافقة',
      'محاولة الالتفاف على حدود الأسعار أو إجراءات الأمان',
      'هندسة عكسية أو نسخ تقنية الذكاء الاصطناعي الخاصة بنا',
      'استخدام أنظمة آلية بطريقة تضر بأداء الخدمة'
    ],
    prohibitedUseNote: 'قد يؤدي violation هذا السياسة إلى تعليق الحساب فورًا والإجراءات القانونية حيثما ينطبق ذلك.',
    ourIP: 'الملكية الفكرية الخاصة بنا',
    yourContent: 'محتواك',
    aiGeneratedContent: 'المحتوى الناتج عن الذكاء الاصطناعي',
    ipDesc1: 'تحتفظ FrontDesk Agents AI بجميع الحقوق في منصتنا وتقنياتنا وعلامتنا التجارية ومحتوانا. receive получаете ограниченную неисключительную лицензию على использование наших услуг خلال subscription period. لا يمكنك نسخ أو تعديل أو توزيع تقنيتنا دون إذن كتابي.',
    ipDesc2: 'تحتفظ بملكية جميع المحتويات التي provide提供的 through منصتنا (الرسائل التحية المخصصة والتكوينات وبيانات العمل). من خلال استخدام خدماتنا، فإنك تمنحنا ترخيصًا محدودًا لاستخدام محتواك فقط لتقديم خدماتنا وتحسينها.',
    ipDesc3: 'الاستجابات التي يولدها وكلاؤنا الذكاء الاصطناعي أثناء معالجة المكالمات belong إليك لاستخدامك التجاري. قد نستخدم بيانات مجمعة ومجهولة الهوية لتحسين نماذج الذكاء الاصطناعي الخاصة بنا.',
    liabilityDesc1: 'إلى أقصى حد يسمح به القانون، لن تكون FrontDesk Agents AI والشركات التابعة لها مسؤولة عن أي أضرار غير مباشرة أو عرضية أو خاصة أو تترتب عليها أو عقابية، بما في ذلك على سبيل المثال لا الحصر فقدان الأرباح أو البيانات أو الاستخدام أو حسن النية، الناشئة عن استخدامك للخدمات.',
    liabilityDesc2: 'إجمالي liability يجب ألا تتجاوز مسؤولية our أي مطالبة تنشأ عن خدماتنا المبلغ الذي دفعته لنا خلال الاثني عشر شهرًا السابقة للمطالبة. لا we not liable تكون مسؤولة عن أي أضرار تنشأ عن خدمات الأطراف الثالثة أو أخطاء المستخدم أو الظروف beyond خControl.',
    indemnification: 'التعويض',
    indemnificationDesc: 'توافق على تعويض FrontDesk Agents AI وإبقائها معفاة من any مطالبات أو أضرار أو مصروفات تنشأ عن استخدامك لخدماتنا أو violation انتهاك هذه الشروط أو infringement انتهاك حقوق أي طرف third.',
    terminationDesc1: 'يمكنك إلغاء اشتراكك في أي وقت through إعدادات حسابك أو contact الاتصال بالدعم. يصبح الإلغاء ساريًا في نهاية فترة الفوترة الحالية. لا يتم تقديم المبالغ المستردة للأشهر الجزئية.',
    terminationDesc2: 'قد نقوم بإنهاء أو تعليق حسابك على الفور if إذا:',
    terminationDesc3: 'عند الإنهاء، يتوقف وصولك إلى الخدمات، يتم retain الاحتفاظ بالبيانات لمدة 30 يومًا (ما لم تنطبق متطلبات قانونية)، وتظل أي رسوم outstanding مستحقة. تظل الأقسام من these these these هذه الشروط التي يجب أن تستمر by طبيعتها after بعد الإنهاء سارية.',
    terminationItems: [
      'تنتهك هذه الشروط أو سياسة الاستخدام المقبول',
      'فشل في دفع الرسوم عند استحقاقها',
      'الانخراط في نشاط احتيالي أو غير قانوني',
      'تشكل خطرًا أمنيًا على منصتنا أو مستخدمينا'
    ],
    changesDesc: 'قد نقوم بتحديث هذه الشروط من وقت لآخر. سنخطرك بالتغييرات الجوهرية عبر البريد الإلكتروني أو إشعار المنصة قبل 30 يومًا على الأقل من سريانها. استمرارك في استخدام الخدمات after بعد التغييرات يشكل قبولًا للشروط الجديدة.',
    changesNote: 'يشير تاريخ "آخر تحديث" في أعلى هذه الصفحة إلى آخر مراجعة لهذه الشروط.',
    contactDesc: 'للأسئلة المتعلقة بشروط الخدمة these، يرجى الاتصال بنا:',
    email: 'البريد الإلكتروني:',
    responseTime: 'وقت الاستجابة:',
    legalInquiries: 'نرد على الاستفسارات القانونية خلال 5 أيام عمل',
    generalSupport: 'للحصول على الدعم العام، تفضل بزيارة',
    contactSupport: 'صفحة الدعم',
    termsOfService: 'شروط الخدمة',
    privacyPolicy: 'سياسة الخصوصية',
    contact: 'اتصل'
  },
  pt: {
    title: 'Termos de Serviço',
    lastUpdated: 'Última atualização: 21 de maio de 2026',
    legal: 'Jurídico',
    backToHome: '← Voltar ao Início',
    tableOfContents: 'Índice',
    acceptanceOfTerms: 'Aceitação dos Termos',
    ourServices: 'Nossos Serviços',
    accountTerms: 'Termos da Conta',
    paymentBilling: 'Pagamento e Faturamento',
    acceptableUse: 'Uso Aceitável',
    ipRights: 'Propriedade Intelectual',
    liability: 'Limitação de Responsabilidade',
    termination: 'Rescisão',
    changesToTerms: 'Alterações a Estes Termos',
    contactUs: 'Contate-nos',
    serviceDescription: 'Descrição do Serviço',
    serviceAvailability: 'Disponibilidade do Serviço',
    accountRegistration: 'Registro da Conta',
    accountSecurity: 'Segurança da Conta',
    subscriptionPlans: 'Planos de Assinatura',
    billingTerms: 'Termos de Faturamento',
    overages: 'Excedentes',
    yourTerminationRights: 'Seus Direitos de Rescisão',
    ourTerminationRights: 'Nossos Direitos de Rescisão',
    effectOfTermination: 'Efeito da Rescisão',
    starter: 'Inicial',
    professional: 'Profissional',
    enterprise: 'Empresarial',
    perMonth: '/mês',
    important: 'Importante',
    arbitrationNote: 'Estes Termos incluem uma cláusula de arbitragem e renúncia a direitos de ações coletivas. Por favor, leia a Seção 7 cuidadosamente.',
    acceptanceDesc1: 'Ao acessar ou usar os serviços da FrontDesk Agents AI, você concorda em ficar vinculado a estes Termos de Serviço ("Termos") e todas as leis e regulamentos aplicáveis. Se você não concordar com qualquer parte destes Termos, não poderá usar nossos serviços.',
    acceptanceDesc2: 'Estes Termos constituem um acordo juridicamente vinculante entre você ("você", "seu" ou "Cliente") e FrontDesk Agents AI ("nós", "nosso"). Ao usar nossa plataforma de receptionist de IA, você reconhece que leu, compreendeu e concorda em ficar vinculado a estes Termos.',
    servicesDesc: 'A FrontDesk Agents AI fornece uma plataforma de receptionist alimentada por IA que permite às empresas automatizar o manuseio de chamadas, agendamento de compromissos, comunicações SMS e interações com clientes.',
    platformIncludes: [
      'Agentes de voz IA para manuseio natural de chamadas',
      'Integração de mensagens SMS',
      'Agendamento de compromissos e gerenciamento de calendário',
      'Serviços de gravação e transcrição de chamadas',
      'Painéis de análise e relatórios em tempo real',
      'Configuração de agente IA personalizado e saudações',
      'Integrações de terceiros (pagamentos, aplicativos de calendário, sistemas CRM)'
    ],
    availabilityDesc: 'Nos esforçamos para manter 99,9% de tempo de atividade, mas não garantimos serviço ininterrupto. A manutenção programada será comunicada com antecedência quando possível. Reservamos o direito de modificar ou descontinuar serviços com aviso razoável.',
    registrationItems: [
      'Você deve fornecer informações precisas e completas durante o registro',
      'Você é responsável por manter a segurança de suas credenciais de conta',
      'Uma pessoa ou entidade comercial não pode manter várias contas gratuitas',
      'Você deve ter pelo menos 18 anos para criar uma conta'
    ],
    securityItems: [
      'Você é responsável por todas as atividades sob sua conta',
      'Notifique-nos imediatamente sobre qualquer acesso não autorizado',
      'Podemos suspender contas suspeitas de violações de segurança',
      'Você consente investigações de segurança se solicitado'
    ],
    starterDesc: '100 chamadas IA/mês, suporte por email, análise básica',
    professionalDesc: '1,000 chamadas IA/mês, suporte prioritário, análise avançada, integração SMS',
    enterpriseDesc: 'Chamadas ilimitadas, suporte 24/7, integrações personalizadas, conformidade HIPAA',
    billingItems: [
      'As assinaturas são cobradas mensalmente antecipadamente',
      'Período de teste gratuito de 14 dias disponível para novos clientes (sem cartão de crédito necessário)',
      'Pagamento processado com segurança através de nosso parceiro de faturamento',
      'Todas as taxas não são reembolsáveis, exceto conforme exigido por lei',
      'Alterações de preço efektif no próximo ciclo de faturamento com 30 dias de aviso'
    ],
    overageDesc: 'O uso além dos limites do plano será cobrado a $0.05 por chamada adicional (Inicial), $0.03 por chamada (Profissional), com planos Empresariais oferecendo uso ilimitado.',
    prohibitedActivities: [
      'Atividades ilegais ou fraude de qualquer tipo',
      'Assédio, ameaças ou intimidação de outros',
      'Spam, comunicações não solicitadas ou violações de telemarketing',
      'Divulgação de dados pessoais de outros sem consentimento',
      'Tentativa de contornar limites de taxa ou medidas de segurança',
      'Engenharia reversa ou cópia de nossa tecnologia IA',
      'Uso de sistemas automatizados de maneiras que prejudiquem o desempenho do serviço'
    ],
    prohibitedUseNote: 'A violação desta política pode resultar em suspensão imediata da conta e ação legal quando aplicável.',
    ourIP: 'Nossa Propriedade Intelectual',
    yourContent: 'Seu Conteúdo',
    aiGeneratedContent: 'Conteúdo Gerado por IA',
    ipDesc1: 'A FrontDesk Agents AI retém todos os direitos de nossa plataforma, tecnologia, marca e conteúdo. Você recebe uma licença limitada, não exclusiva para usar nossos serviços durante sua assinatura. Você não pode copiar, modificar ou distribuir nossa tecnologia sem permissão escrita.',
    ipDesc2: 'Você mantém a propriedade de todo o conteúdo que fornece através de nossa plataforma (saudações personalizadas, configurações, dados comerciais). Ao usar nossos serviços, você nos concede uma licença limitada para usar seu conteúdo apenas para fornecer e melhorar nossos serviços.',
    ipDesc3: 'As respostas geradas por nossos agentes IA durante o manuseio de chamadas pertencem a você para seu uso comercial. Podemos usar dados agregados e anonimizados para melhorar nossos modelos IA.',
    liabilityDesc1: 'ATÉ O MÁXIMO PERMITIDO POR LEI, FRONTDESK AGENTS E SUAS AFILIADAS NÃO SERÃO RESPONSÁVEIS POR QUAISQUER DANOS INDIRETOS, INCIDENTAIS, ESPECIAIS, CONSEQUENTES OU PUNITIVOS, INCLUINDO MAS NÃO SE LIMITANDO A PERDA DE LUCROS, DADOS, USO OU GOODWILL, DECORRENTES DO SEU USO DOS SERVIÇOS.',
    liabilityDesc2: 'Nossa responsabilidade total por qualquer reclamação decorrente de nossos serviços não excederá o valor que você nos pagou nos doze meses precedentes à reclamação. Não somos responsáveis por quaisquer danos decorrentes de serviços de terceiros, erro do usuário ou circunstâncias além de nosso controle razoável.',
    indemnification: 'Indenização',
    indemnificationDesc: 'Você concorda em indenizar e manter a FrontDesk Agents AI isenta de quaisquer reclamações, danos ou despesas decorrentes de seu uso de nossos serviços, violação destes Termos ou violação de quaisquer direitos de terceiros.',
    terminationDesc1: 'Você pode cancelar sua assinatura a qualquer momento através das configurações de sua conta ou entrando em contato com o suporte. O cancelamento efetiva no final de seu período de faturamento atual. Não são fornecidos reembolsos por meses parciais.',
    terminationDesc2: 'Podemos encerrar ou suspender sua conta imediatamente se você:',
    terminationDesc3: 'Upon termination, your access to services will cease, data will be retained for 30 days (unless legal requirements apply), and any outstanding fees remain due. Sections of these Terms that by their nature should survive termination will remain in effect.',
    terminationItems: [
      'Violar estes Termos ou Política de Uso Aceitável',
      'Falhar em pagar taxas quando devidas',
      'Envolvimento em atividade fraudulenta ou ilegal',
      'Representar um risco de segurança para nossa plataforma ou usuários'
    ],
    changesDesc: 'Podemos atualizar estes Termos de tempos em tempos. Notificaremos você sobre alterações materiais por email ou notificação da plataforma pelo menos 30 dias antes de它们 take effect. Seu uso contínuo dos serviços após as alterações constitui aceitação dos novos Termos.',
    changesNote: 'A data de "última atualização" no topo desta página indica quando estes Termos foram revisados pela última vez.',
    contactDesc: 'Para perguntas sobre estes Termos de Serviço, entre em contato conosco:',
    email: 'Email:',
    responseTime: 'Tempo de Resposta:',
    legalInquiries: 'Respondemos a inquiries jurídicas dentro de 5 dias úteis',
    generalSupport: 'Para suporte general, visite nossa',
    contactSupport: 'página de suporte',
    termsOfService: 'Termos de Serviço',
    privacyPolicy: 'Política de Privacidade',
    contact: 'Contato'
  },
  ko: {
    title: '서비스 약관',
    lastUpdated: '최종 업데이트: 2026년 5월 21일',
    legal: '법률',
    backToHome: '← 홈으로 돌아가기',
    tableOfContents: '목차',
    acceptanceOfTerms: '약관 수락',
    ourServices: '당사 서비스',
    accountTerms: '계정 약관',
    paymentBilling: '결제 및 청구',
    acceptableUse: '적절한 사용',
    ipRights: '지식재산권',
    liability: '책임의 한계',
    termination: '종료',
    changesToTerms: '이러한 약관의 변경',
    contactUs: '문의하기',
    serviceDescription: '서비스 설명',
    serviceAvailability: '서비스 가용성',
    accountRegistration: '계정 등록',
    accountSecurity: '계정 보안',
    subscriptionPlans: '구독 플랜',
    billingTerms: '청구 조건',
    overages: '초과 사용',
    yourTerminationRights: '계약 해지 권리',
    ourTerminationRights: '당사의 계약 해지 권리',
    effectOfTermination: '계약 해지의 효과',
    starter: '스타터',
    professional: '프로',
    enterprise: '엔터프라이즈',
    perMonth: '/월',
    important: '중요',
    arbitrationNote: '이러한 약관에는 중재 조항 및 집단 소송 권리 포기가 포함됩니다. 7항을 주의 깊게 읽으십시오.',
    acceptanceDesc1: 'FrontDesk Agents AI 서비스에 액세스하거나 사용함으로써 귀하는 이러한 서비스 약관("약관") 및 모든 관련 법률 및 규정의 적용을 받는 것에 동의합니다. 이러한 약관의 일부에 동의하지 않는 경우 당사 서비스를 사용할 수 없습니다.',
    acceptanceDesc2: '이러한 약관은 귀하("귀하", "귀하의" 또는 "고객")와 FrontDesk Agents AI("당사", "당사의") 사이의 법적 구속 계약입니다. AI 리셉셔니스트 플랫폼을 사용함으로써 귀하는 이러한 약관을 읽고, 이해하고, 동의했음을 인정합니다.',
    servicesDesc: 'FrontDesk Agents AI는 기업이 통화 처리, 예약 일정 관리, SMS 통신 및 고객 상호작용을 자동화할 수 있는 AI 기반 리셉셔니스트 플랫폼을 제공합니다.',
    platformIncludes: [
      '자연스러운 통화 처리를 위한 AI 음성 에이전트',
      'SMS 메시징 통합',
      '예약 일정 관리 및 캘린더 관리',
      '통화 녹음 및 전환 서비스',
      '실시간 분석 및 보고 대시보드',
      '맞춤형 AI 에이전트 구성 및 인사말',
      '타사 통합 (결제, 캘린더 앱, CRM 시스템)'
    ],
    availabilityDesc: '당사는 99.9% 가동률을 유지하기 위해 노력하지만 중단되지 않은 서비스를 보장하지 않습니다. 예약 maintenance는 가능한 경우 사전에 통지됩니다. 당사는 적절한 통지와 함께 서비스를 수정하거나 중단할 권리를 보유합니다.',
    registrationItems: [
      '등록 시 정확하고 완전한 정보를 제공해야 합니다',
      '계정 자격 증명의 보안을 유지할 책임이 있습니다',
      '한 사람 또는 사업체가 여러 무료 계정을 유지할 수 없습니다',
      '계정을 만들려면 최소 18세 이상이어야 합니다'
    ],
    securityItems: [
      '계정 아래 모든 활동에 대한 책임이 있습니다',
      '모든 무단 액세스를 즉시 통지해야 합니다',
      '보안 위반 의심 계정을 일시 중단할 수 있습니다',
      '요청 시 보안 조사에 동의합니다'
    ],
    starterDesc: '100 AI 통화/월, 이메일 지원, 기본 분석',
    professionalDesc: '1,000 AI 통화/월, 우선 지원, 고급 분석, SMS 통합',
    enterpriseDesc: '무제한 통화, 24/7 지원, 사용자 정의 통합, HIPAA 준수',
    billingItems: [
      '구독은 매월 선불로 청구됩니다',
      '신규 고객용 14일 무료 평가판 이용 가능 (신용카드 불필요)',
      '결제는 결제 파트너를 통해 안전하게 처리됩니다',
      '법률에서 요구하는 경우를 제외하고 모든 비용은 환불 불가',
      '가격 변경은 30일 전에 통지하여 다음 청구 주기부터 적용'
    ],
    overageDesc: '플랜 한도를 초과하는 사용은 추가 통화당 $0.05(스타터), $0.03(프로)Charged됩니다. 엔터프라이즈 플랜은 무제한 사용을 제공합니다.',
    prohibitedActivities: [
      '모든 종류의 불법 활동 또는 사기',
      '다른 사람에 대한 괴롭힘, 위협 또는 협박',
      '스팸, 의도하지 않은 통신 또는 텔러마케팅 위반',
      '동의 없이 다른 사람의 개인 데이터 공개',
      '요금 제한 또는 보안 조치 우회 시도',
      '당사 AI 기술의 역공학 또는 복제',
      '서비스 성능에 해를 끼치는 방식으로 자동화된 시스템 사용'
    ],
    prohibitedUseNote: '이 정책 위반은 즉시 계정 일시 중단 및 관련될 경우 법적 행드의 원인이 될 수 있습니다.',
    ourIP: '당사의 지식재산권',
    yourContent: '귀하의 콘텐츠',
    aiGeneratedContent: 'AI 생성 콘텐츠',
    ipDesc1: 'FrontDesk Agents AI는 플랫폼, 기술, 브랜드 및 콘텐츠에 대한 모든 권리를 보유합니다. 구독 기간 동안 당사 서비스를 사용할 수 있는 제한된 비독점 라이선스를 받습니다. 서면 허가 없이 당사 기술을 복사, 수정 또는 배포할 수 없습니다.',
    ipDesc2: '귀하는 플랫폼을 통해 제공한 모든 콘텐츠(맞춤형 인사말, 구성, 비즈니스 데이터)의 소유권을 유지합니다. 서비스를 사용함으로써 귀하는 당사가 서비스를 제공하고 개선하기 위해서만 귀하의 콘텐츠를 사용할 수 있는 제한된 라이선스를 부여합니다.',
    ipDesc3: '통화 처리 중에 당사 AI 에이전트가 생성한 응답은 귀하의 비즈니스 사용을 위해 귀하에게 속합니다. 당사는 AI 모델을 개선하기 위해 익명화된 집계 데이터를 사용할 수 있습니다.',
    liabilityDesc1: '법률이 허용하는 최대 범위까지, FRONTDESK AGENTS 및 그 계열사는 서비스 사용으로 인해 발생하는 이익, 데이터, 사용 또는.goodwill 손실에 대한 간접, 부수, 특별, 결과적 또는 징벌적 damages를 포함하되 이에 국한되지 않는 어떠한 손해에 대해서도 책임을 지지 않습니다.',
    liabilityDesc2: '서비스에서 발생하는 어떠한 청구일에 대해서도 당사의 총 책임은 해당 청구 전 12개월 동안 귀하가 당사에 지불한 금액을 초과하지 않습니다. 당사는 타사 서비스, 사용자 오류 또는 당사의 합리적인 통제超出了 범위 circumstances로 인해 발생하는 어떠한 손해에 대해서도 책임지지 않습니다.',
    indemnification: '면책',
    indemnificationDesc: '귀하는 서비스 사용, 이러한 약관 위반 또는 제3자 권리 침해로 인해 발생하는 모든 청구, 손해 또는 비용으로부터 FrontDesk Agents AI를 Indemnify 보상하고 면책 처리することに同意합니다.',
    terminationDesc1: '계정 설정 또는 지원팀에 문의하여 언제든지 구독을 취소할 수 있습니다. 취소는 현재 청구 기간结束时에 effectiveness합니다. 부분 월에 대해서는 환금이 제공되지 않습니다.',
    terminationDesc2: '다음과 같은 경우 당사는 즉시 계정을 종료하거나 일시 중단할 수 있습니다:',
    terminationDesc3: '종료 시 서비스 액세스가 종료되고, 데이터는 30일 동안 보관됩니다(법적 요구 사항이 적용되는 경우 제외). 미결제 요금은 여전히 만기입니다. 본질상 종료 후에도 남아야 하는 이러한 약관의 조항은 계속 effectiveness합니다.',
    terminationItems: [
      '이러한 약관 또는 적절한 사용 정책 위반',
      '요금 지급 불이행',
      '사기성 또는 불법 활동 관련',
      '플랫폼 또는 사용자에 대한 보안 위험 제공'
    ],
    changesDesc: '당사는 수시로 이러한 약관을 업데이트할 수 있습니다. 주요 변경에 대해 적용 최소 30일 전에 이메일 또는 플랫폼 알림을 통해 귀하에게 통지합니다. 변경 후에도 계속 서비스를 사용하면 새 약관에 대한 동의로 간주됩니다.',
    changesNote: '이 페이지 상단의 "최종 업데이트" 날짜는 이러한 약관이 마지막으로修订된 시점을 나타냅니다.',
    contactDesc: '이러한 서비스 약관에 대한 질문이 있으시면联系我们:',
    email: '이메일:',
    responseTime: '응답 시간:',
    legalInquiries: '5 영업일 이내에 법적 문의에 응답합니다',
    generalSupport: '일반 지원의 경우, 방문하세요',
    contactSupport: '지원 페이지',
    termsOfService: '서비스 약관',
    privacyPolicy: '개인정보 보호정책',
    contact: '문의'
  },
  ja: {
    title: '利用規約',
    lastUpdated: '最終更新: 2026年5月21日',
    legal: '法的',
    backToHome: '← ホームに戻る',
    tableOfContents: '目次',
    acceptanceOfTerms: '利用規約の受け入れ',
    ourServices: '私たちのサービス',
    accountTerms: 'アカウント条件',
    paymentBilling: '支払いと請求',
    acceptableUse: '許容される使用',
    ipRights: '知的財産権',
    liability: '責任の制限',
    termination: '終了',
    changesToTerms: 'これらの条件の変更',
    contactUs: 'お問い合わせ',
    serviceDescription: 'サービスの説明',
    serviceAvailability: 'サービスの可用性',
    accountRegistration: 'アカウント登録',
    accountSecurity: 'アカウントセキュリティ',
    subscriptionPlans: 'サブスクリプションプラン',
    billingTerms: '請求条件',
    overages: '超過使用',
    yourTerminationRights: 'お客様の終了権',
    ourTerminationRights: '当社の終了権',
    effectOfTermination: '終了の効果',
    starter: 'スターター',
    professional: 'プロフェッショナル',
    enterprise: 'エンタープライズ',
    perMonth: '/月',
    important: '重要',
    arbitrationNote: 'これらの利用規約には仲裁条項とクラスアクション権利の放棄が含まれています。セクション7を注意深くお読みください。',
    acceptanceDesc1: 'FrontDesk Agents AIサービスにアクセスするかを使用することで、これらの利用規約（「利用規約」）およびすべての適用される法律および規制に拘束されることに同意します。あなたの方法でこれらの利用規約のいずれかに同意しない場合、私たちの serviceを使用することはできません。',
    acceptanceDesc2: 'これらの利用規約は、あなた（「あなた」、「あなたの」または「顧客」）とFrontDesk Agents AI（「私たち」、「私たちの」）の間の法的に拘束力のある契約を構成します。AI受付プラットフォームを使用することで、これらの利用規約を読んでいることを認識し、理解し、同意します。',
    servicesDesc: 'FrontDesk Agents AIは、企業が通話処理、予定scheduling、SMS communication、および顧客interactionsを自動化できるAI駆動の受付プラットフォームを提供します。',
    platformIncludes: [
      '自然な通話処理のためのAI音声エージェント',
      'SMSメッセージング統合',
      '予約schedulingとカレンダー管理',
      '通話recordingとtranscriptionサービス',
      'リアルタイム分析とreportingダッシュボード',
      'カスタムAI agent構成と greetings',
      ' サードパーティ統合 (payments, カレンダーapps, CRM systems)'
    ],
    availabilityDesc: '99.9%のアベイラビリティ维持に努めていますが、interrupt无限制 serviceを保証することはできません。定期的なmaintenanceは可能な限り事前に通知されます。私たちは妥当な通知を持ってサービスを変更または中止する権利を留保します。',
    registrationItems: [
      '登録時に正確で完全な情報を提供する必要があります',
      'アカウント資格情報のセキュリティを維持する責任があります',
      '1人またはbusiness entityが複数の無料アカウントを維持することはできません',
      'アカウントを作成するには18歳以上である必要があります'
    ],
    securityItems: [
      'アカウントの下のすべてのアクティビティ 책임があります',
      '不正アクセスを直ちに通知する必要があります',
      'セキュリティ侵害の疑いがあるアカウントをsuspendできます',
      '求められた場合、セキュリティ調査に同意します'
    ],
    starterDesc: '100 AI通話/月、メールサポート、基本分析',
    professionalDesc: '1,000 AI通話/月、優先サポート、高度な分析、SMS統合',
    enterpriseDesc: '無制限通話、24/7サポート、カスタム統合、HIPAAコンプライアンス',
    billingItems: [
      'サブスクリプションは每月前払いされます',
      '新規顧客向け14日間無料トライアル利用可（クレジットカード不要）',
      '請求パートナーを通じて安全に処理された支払い',
      '法律で要求されない限り、すべての料金を返金不可',
      '料金の変更は30日 noticeで次の請求サイクルから有効'
    ],
    overageDesc: 'プランの制限を超える使用は、追加通話ごとに$0.05（スターター）、$0.03（プロフェッショナル）請求されます。エンタープライズプランは無制限の使用を提供します。',
    prohibitedActivities: [
      'あらゆる種類の illegal activityまたは fraud',
      '他人へのharassment、threats、intimidation',
      'Spam、unsolicited communications、またはtelemarketing違反',
      '同意なしに他人のpersonal dataを開示',
      'レート制限またはsecurity measuresを回避しようとすること',
      '私たちのAI technologyのreverse engineeringまたはcopying',
      'サービスperformanceに害を及ぼす方法でautomated systemsを使用すること'
    ],
    prohibitedUseNote: 'このポリシーのviolationは即座のaccount suspensionと該当する場合の法的行動を結果として生じる可能性があります。',
    ourIP: '私たちのIntellectual Property',
    yourContent: 'あなたのContent',
    aiGeneratedContent: 'AI生成コンテンツ',
    ipDesc1: 'FrontDesk Agents AIは、当platform、technology、branding、contentに関するすべての権利を保持します。あなたはsubscription期間中に当servicesを使用する制限付き非独占的ライセンスを取得します。書面による許可なしには当technologyをcopy、modify、distributeすることはできません。',
    ipDesc2: 'あなたは当platformを通じて提供するすべてのcontent（custom greetings、configurations、business data）の所有権を保持します。当servicesを使用することで、あなたは当servicesを提供し改善するためにのみあなたのcontentを使用する制限付きライセンスを付与します。',
    ipDesc3: '通話処理中に当AI agentsが生成したresponsesは、あなたのbusiness使用に属します。当社はAI modelsを改善するためにanonymous aggregated dataを使用する場合があります。',
    liabilityDesc1: '法律で許可されている最大程度上において、FRONTDESK AGENTSおよびその子は、servicesの使用から生じるloss of profits、data、use、goodwillを含むがこれに限定されないany indirect、incidental、special、consequential、punitive damagesについて責任を負いません。',
    liabilityDesc2: '当servicesから生じるany claimについての当社のtotal liabilityは、claim前の12ヶ月間にあなたが当社に支払った額を上限とします。当社は、third-party services、user error、当社の合理的なcontrolを超えたcircumstancesから生じるany damagesについて責任を負いません。',
    indemnification: ' indemnification',
    indemnificationDesc: 'あなたは、servicesの使用、これらのConditionsのviolation、またはthird-party rightsのinfringementから生じるany claims、damages、expensesについてFrontDesk Agents AIを indemnifyし无害に保つことに同意します。',
    terminationDesc1: 'あなたはアカウント設定またはsupportに連絡することで、いつでもsubscriptionをキャンセルできます。キャンセルは現在の請求期間終了時にeffectivenessになります。部分月の払い戻しは提供されません。',
    terminationDesc2: ' 다음과 같은 경우、当社は即座にアカウントを終了またはsuspendできます:',
    terminationDesc3: '終了時、servicesへのアクセスは終了し、dataは30日間保持されます（法的要件が適用されない限り）。未払い料金も引き続きdueです。終了後も存続するこれらのConditionsのセクションはその后就労者としてeffectivenessを維持します。',
    terminationItems: [
      'これらのConditionsまたは許容される使用Policyにviolation',
      '期限切れのfeesの支払い失敗',
      '不正またはillegal activityへの関与',
      '当platformまたはusersへのsecurity riskを構成'
    ],
    changesDesc: '当社は時折これらのConditionsを更新できます。重要な変更については、effectiveになる少なくとも30日前にメールまたはplatform notificationによって通知します。変更後のservicesの継続的な使用は新しいConditionsへの同意を構成します。',
    changesNote: 'ページ上部の「最終更新」日付は、これらのConditionsが最後に改訂された時期を示します。',
    contactDesc: 'これらの利用規約に関する質問 대해서는、お問い合わせください:',
    email: 'メール:',
    responseTime: '応答時間:',
    legalInquiries: '5営業日以内に法的なお問い合わせにお答えします',
    generalSupport: '一般的なsupportについては、以下をご覧ください',
    contactSupport: 'サポートページ',
    termsOfService: '利用規約',
    privacyPolicy: 'プライバシーポリシー',
    contact: 'お問い合わせ'
  },
  vi: {
    title: 'Điều Khoản Dịch Vụ',
    lastUpdated: 'Cập nhật lần cuối: 21 tháng 5 năm 2026',
    legal: 'Pháp lý',
    backToHome: '← Quay lại Trang chủ',
    tableOfContents: 'Mục Lục',
    acceptanceOfTerms: 'Chấp Nhận Các Điều Khoản',
    ourServices: 'Dịch Vụ Của Chúng Tôi',
    accountTerms: 'Điều Khoản Tài Khoản',
    paymentBilling: 'Thanh Toán và Thanh Toán',
    acceptableUse: 'Sử Dụng Chấp Nhận Được',
    ipRights: 'Quyền Sở Hữu Trí Tuệ',
    liability: 'Giới Hạn Trách Nhiệm',
    termination: 'Chấm Dứt',
    changesToTerms: 'Thay Đổi Các Điều Khoản Này',
    contactUs: 'Liên Hệ Với Chúng Tôi',
    serviceDescription: 'Mô Tả Dịch Vụ',
    serviceAvailability: 'Khả Dụng Dịch Vụ',
    accountRegistration: 'Đăng Ký Tài Khoản',
    accountSecurity: 'Bảo Mật Tài Khoản',
    subscriptionPlans: 'Gói Đăng Ký',
    billingTerms: 'Điều Khoản Thanh Toán',
    overages: 'Vượt Mức',
    yourTerminationRights: 'Quyền Chấm Dứt Của Bạn',
    ourTerminationRights: 'Quyền Chấm Dứt Của Chúng Tôi',
    effectOfTermination: 'Hiệu Lực Của Việc Chấm Dứt',
    starter: 'Khởi Đầu',
    professional: 'Chuyên Nghiệp',
    enterprise: 'Doanh Nghiệp',
    perMonth: '/tháng',
    important: 'Quan Trọng',
    arbitrationNote: 'Các Điều Khoản này bao gồm điều khoản trọng tài và miễn trừ quyền khởi kiện tập thể. Vui lòng đọc kỹ Mục 7.',
    acceptanceDesc1: 'Bằng cách truy cập hoặc sử dụng dịch vụ của FrontDesk Agents AI, bạn đồng ý bị ràng buộc bởi các Điều Khoản Dịch Vụ này ("Điều Khoản") và tất cả các luật và quy định áp dụng. Nếu bạn không đồng ý với bất kỳ phần nào của các Điều Khoản này, bạn không thể sử dụng dịch vụ của chúng tôi.',
    acceptanceDesc2: 'Các Điều Khoản này cấu thành một thỏa thuận ràng buộc pháp lý giữa bạn ("bạn", "của bạn" hoặc "Khách hàng") và FrontDesk Agents AI ("chúng tôi", "của chúng tôi"). Bằng cách sử dụng nền tảng receptionist AI của chúng tôi, bạn thừa nhận rằng bạn đã đọc, hiểu và đồng ý bị ràng buộc bởi các Điều Khoản này.',
    servicesDesc: 'FrontDesk Agents AI cung cấp một nền tảng receptionist được cung cấp bởi AI cho phép các doanh nghiệp tự động hóa xử lý cuộc gọi, lên lịch cuộc hẹn, giao tiếp SMS và tương tác với khách hàng.',
    platformIncludes: [
      'Đại lý thoại AI để xử lý cuộc gọi tự nhiên',
      'Tích hợp nhắn tin SMS',
      'Lên lịch cuộc hẹn và quản lý lịch',
      'Dịch vụ ghi và phiên âm cuộc gọi',
      'Bảng phân tích và báo cáo thời gian thực',
      'Cấu hình và lời chào đại lý AI tùy chỉnh',
      'Tích hợp bên thứ ba (thanh toán, ứng dụng lịch, hệ thống CRM)'
    ],
    availabilityDesc: 'Chúng tôi nỗ lực duy trì thời gian hoạt động 99,9% nhưng không đảm bảo dịch vụ không bị gián đoạn. Bảo trì theo lịch trình sẽ được thông báo trước khi có thể. Chúng tôi bảo lưu quyền sửa đổi hoặc ngừng dịch vụ với thông báo hợp lý.',
    registrationItems: [
      'Bạn phải cung cấp thông tin chính xác và đầy đủ khi đăng ký',
      'Bạn chịu trách nhiệm duy trì bảo mật thông tin đăng nhập tài khoản của mình',
      'Một người hoặc thực thể kinh doanh không được duy trì nhiều tài khoản miễn phí',
      'Bạn phải ít nhất 18 tuổi để tạo tài khoản'
    ],
    securityItems: [
      'Bạn chịu trách nhiệm cho tất cả các hoạt động dưới tài khoản của mình',
      'Thông báo cho chúng tôi ngay lập tức về bất kỳ truy cập trái phép nào',
      'Chúng tôi có thể tạm ngưng các tài khoản bị nghi ngờ vi phạm bảo mật',
      'Bạn đồng ý với các cuộc điều tra bảo mật nếu được yêu cầu'
    ],
    starterDesc: '100 cuộc gọi AI/tháng, hỗ trợ qua email, phân tích cơ bản',
    professionalDesc: '1.000 cuộc gọi AI/tháng, hỗ trợ ưu tiên, phân tích nâng cao, tích hợp SMS',
    enterpriseDesc: 'Cuộc gọi không giới hạn, hỗ trợ 24/7, tích hợp tùy chỉnh, tuân thủ HIPAA',
    billingItems: [
      'Đăng ký được thanh toán hàng tháng trước',
      'Dùng thử miễn phí 14 ngày cho khách hàng mới (không cần thẻ tín dụng)',
      'Thanh toán được xử lý an toàn thông qua đối tác thanh toán của chúng tôi',
      'Tất cả các khoản phí không hoàn tiền trừ khi pháp luật yêu cầu',
      'Thay đổi giá có hiệu lực vào chu kỳ thanh toán tiếp theo với thông báo 30 ngày'
    ],
    overageDesc: 'Việc sử dụng vượt quá giới hạn gói sẽ bị tính phí $0.05 mỗi cuộc gọi bổ sung (Khởi Đầu), $0.03 mỗi cuộc gọi (Chuyên Nghiệp), với các gói Doanh Nghiệp cung cấp sử dụng không giới hạn.',
    prohibitedActivities: [
      'Các hoạt động bất hợp pháp hoặc lừa đảo mọi loại',
      'Quấy rối, đe dọa hoặc hăm dọa người khác',
      'Thư rác, giao tiếp không được yêu cầu hoặc vi phạm tiếp thị từ xa',
      'Tiết lộ dữ liệu cá nhân của người khác mà không có sự đồng ý',
      'Cố gắng bỏ qua giới hạn tỷ lệ hoặc biện pháp bảo mật',
      'Kỹ thuật đảo ngược hoặc sao chép công nghệ AI của chúng tôi',
      'Sử dụng các hệ thống tự động theo cách làm hỏng hiệu suất dịch vụ'
    ],
    prohibitedUseNote: 'Vi phạm chính sách này có thể dẫn đến tạm ngưng tài khoản ngay lập tức và hành động pháp lý where applicable.',
    ourIP: 'Quyền Sở Hữu Trí Tuệ Của Chúng Tôi',
    yourContent: 'Nội Dung Của Bạn',
    aiGeneratedContent: 'Nội Dung Được Tạo Bởi AI',
    ipDesc1: 'FrontDesk Agents AI giữ lại tất cả các quyền đối với nền tảng, công nghệ, thương hiệu và nội dung của chúng tôi. Bạn nhận được giấy phép hạn chế, không độc quyền để sử dụng dịch vụ của chúng tôi trong thời gian đăng ký của bạn. Bạn không thể sao chép, sửa đổi hoặc phân phối công nghệ của chúng tôi mà không có sự cho phép bằng văn bản.',
    ipDesc2: 'Bạn giữ quyền sở hữu tất cả nội dung bạn cung cấp thông qua nền tảng của chúng tôi (lời chào tùy chỉnh, cấu hình, dữ liệu kinh doanh). Bằng cách sử dụng dịch vụ của chúng tôi, bạn cấp cho chúng tôi giấy phép hạn chế để sử dụng nội dung của bạn chỉ để cung cấp và cải thiệu dịch vụ của chúng tôi.',
    ipDesc3: 'Các phản hồi được tạo bởi các đại lý AI của chúng tôi trong xử lý cuộc gọi thuộc về bạn cho việc sử dụng kinh doanh của bạn. Chúng tôi có thể sử dụng dữ liệu tổng hợp và ẩn danh để cải thiện các mô hình AI của chúng tôi.',
    liabilityDesc1: 'TỐI ĐA MỨC CHO PHÉP BỞI LUẬT, FRONTDESK AGENTS VÀ CÁC CÔNG TY LIÊN KẾT KHÔNG CHỊU TRÁCH NHIỆM CHO BẤT KỲ THIỆT HẠI GIÁN TIẾP, NGẪU NHIÊN, ĐẶC BIỆT, CONSEQUENTIAL HOẶC TRỪNG PHẠT NÀO, BAO GỒM NHƯNG KHÔNG GIỚI HẠN ĐẾN MẤT LỢI NHUẬN, DỮ LIỆU, SỬ DỤNG HOẶC GOODWILL, PHÁT SINH TỪ VIỆC BẠN SỬ DỤNG DỊCH VỤ.',
    liabilityDesc2: 'Trách nhiệm pháp lý của chúng tôi cho bất kỳ khiếu nại nào phát sinh từ dịch vụ của chúng tôi sẽ không vượt quá số tiền bạn đã trả cho chúng tôi trong mười hai tháng trước khiếu nại. Chúng tôi không chịu trách nhiệm cho bất kỳ thiệt hại nào phát sinh từ dịch vụ của bên thứ ba, lỗi của người dùng hoặc tình huống ngoài tầm kiểm soát hợp lý của chúng tôi.',
    indemnification: 'Bồi Thường',
    indemnificationDesc: 'Bạn đồng ý bồi thường và giữ cho FrontDesk Agents AI không bị tổn thương trước bất kỳ khiếu nại, thiệt hại hoặc chi phí nào phát sinh từ việc bạn sử dụng dịch vụ của chúng tôi, vi phạm các Điều Khoản này hoặc xâm phạm bất kỳ quyền nào của bên thứ ba.',
    terminationDesc1: 'Bạn có thể hủy đăng ký của mình bất kỳ lúc nào thông qua cài đặt tài khoản của bạn hoặc bằng cách liên hệ với bộ phận hỗ trợ. Việc hủy có hiệu lực vào cuối kỳ thanh toán hiện tại của bạn. Không có hoàn tiền cho các tháng một phần.',
    terminationDesc2: 'Chúng tôi có thể chấm dứt hoặc tạm ngưng tài khoản của bạn ngay lập tức nếu bạn:',
    terminationDesc3: 'Khi chấm dứt, quyền truy cập của bạn vào dịch vụ sẽ chấm dứt, dữ liệu sẽ được giữ trong 30 ngày (trừ khi yêu cầu pháp lý áp dụng), và bất kỳ khoản phí tồn đọng nào vẫn còn due. Các phần của các Điều Khoản này theo bản chất của chúng nên tồn tại sau khi chấm dứt sẽ vẫn có hiệu lực.',
    terminationItems: [
      'Vi phạm các Điều Khoản này hoặc Chính sách Sử dụng Chấp Nhận Được',
      'Không thanh toán phí khi đến hạn',
      'Tham gia vào hoạt động gian lận hoặc bất hợp pháp',
      'Đặt ra rủi ro bảo mật cho nền tảng hoặc người dùng của chúng tôi'
    ],
    changesDesc: 'Chúng tôi có thể cập nhật các Điều Khoản này время от времени. We will notify you of material changes via email or platform notification at least 30 days before they take effect. Your continued use of services after changes constitutes acceptance of the new Terms.',
    changesNote: 'Ngày "cập nhật lần cuối" ở đầu trang này cho biết lần cuối các Điều Khoản này được sửa đổi khi nào.',
    contactDesc: 'Đối với các câu hỏi về các Điều Khoản Dịch Vụ này, vui lòng liên hệ với chúng tôi:',
    email: 'Email:',
    responseTime: 'Thời Gian Phản Hồi:',
    legalInquiries: 'Chúng tôi phản hồi các yêu cầu pháp lý trong vòng 5 ngày làm việc',
    generalSupport: 'Để được hỗ trợ chung, hãy truy cập',
    contactSupport: 'Trang Hỗ Trợ',
    termsOfService: 'Điều Khoản Dịch Vụ',
    privacyPolicy: 'Chính Sách Bảo Mật',
    contact: 'Liên hệ'
  },
  tl: {
    title: 'Mga Tuntunin ng Serbisyo',
    lastUpdated: 'Huling update: Mayo 21, 2026',
    legal: 'Legal',
    backToHome: '← Bumalik sa Home',
    tableOfContents: 'Table of Contents',
    acceptanceOfTerms: 'Pagtatanggap ng mga Tuntunin',
    ourServices: 'Aming mga Serbisyo',
    accountTerms: 'Mga Tuntunin ng Account',
    paymentBilling: 'Pagbabayad at Billing',
    acceptableUse: 'Katanggap-tanggap na Paggamit',
    ipRights: 'Intellectual Property',
    liability: 'Limitasyon ng Liability',
    termination: 'Pagwawakas',
    changesToTerms: 'Mga Pagbabago sa mga Tuntuning Ito',
    contactUs: 'Makipag-ugnayan sa Amin',
    serviceDescription: 'Paglalarawan ng Serbisyo',
    serviceAvailability: 'Kakayahang Magamit ng Serbisyo',
    accountRegistration: 'Rehistrasyon ng Account',
    accountSecurity: 'Seguridad ng Account',
    subscriptionPlans: 'Mga Planong Subscription',
    billingTerms: 'Mga Tuntunin sa Billing',
    overages: 'Mga Overages',
    yourTerminationRights: 'Iyong Mga Karapatan sa Pagwawakas',
    ourTerminationRights: 'Aming Mga Karapatan sa Pagwawakas',
    effectOfTermination: 'Epekto ng Pagwawakas',
    starter: 'Starter',
    professional: 'Propesyonal',
    enterprise: 'Enterprise',
    perMonth: '/buwan',
    important: 'Mahalaga',
    arbitrationNote: 'Ang mga Tuntuning ito ay may kasamang clause sa pag-aarbitrate at waiver ng mga karapatan sa class action. Pak basahin nang mabuti ang Seksyon 7.',
    acceptanceDesc1: 'Sa pag-access o paggamit ng mga serbisyo ng FrontDesk Agents AI, sumasang-ayon kang mabuting panatilihin ang mga Tuntunin ng Serbisyo na ito ("Mga Tuntunin") at ang lahat ng mga naaangkop na batas at regulasyon. Kung hindi ka sumasang-ayon sa anumang bahagi ng mga Tuntuning ito, maaari mong gamitin ang aming mga serbisyo.',
    acceptanceDesc2: 'Ang mga Tuntuning ito ay bumubuo ng isang legal na binding agreement sa pagitan mo ("ikaw", "iyong" o "Customer") at FrontDesk Agents AI ("kami", "aming" o "aming"). Sa paggamit ng aming AI receptionist platform, kinikilala mo na nabasa mo, naintindihan, at sumasang-ayon na mabuting panatilihin ang mga Tuntuning ito.',
    servicesDesc: 'Ang FrontDesk Agents AI ay nagbibigay ng isang AI-powered na receptionist platform na nagbibigay-daan sa mga negosyo na i-automate ang call handling, appointment scheduling, SMS communications, at customer interactions.',
    platformIncludes: [
      'AI voice agents para sa natural na call handling',
      'SMS messaging integration',
      'Appointment scheduling at calendar management',
      'Call recording at transcription services',
      'Real-time analytics at reporting dashboards',
      'Custom AI agent configuration at greetings',
      'Mga third-party integration (payments, calendar apps, CRM systems)'
    ],
    availabilityDesc: 'Nagpap пытаемся kami na mapanatili ang 99.9% uptime ngunit hindi namin ginagarantiya ang walang patuloy na serbisyo. Ang nakaiskedyul na maintenance ay ipapaalam nang advance kapag posible. May karapatan kaming baguhin o itigil ang mga serbisyo na may makatwirang abiso.',
    registrationItems: [
      'Dapat kang magbigay ng tamang at complete na impormasyon sa panahon ng pagrehistro',
      'Responsable ka para sa pag-maintain ng seguridad ng iyong mga credential ng account',
      'Hindi maaaring magkaroon ng maraming libre na account ang isang tao o business entity',
      'Dapat kang hindi bababa sa 18 taong gulang upang lumikha ng account'
    ],
    securityItems: [
      'Responsable ka para sa lahat ng activities sa ilalim ng iyong account',
      'Awtomatikong ipaalam sa amin ang anumang unauthorized na access',
      'Maaari kaming suspindihin ang mga account na suspected ng security breaches',
      'Sumasang-ayon ka sa mga security investigation kung hiningi'
    ],
    starterDesc: '100 AI calls/buwan, email support, basic analytics',
    professionalDesc: '1,000 AI calls/buwan, priority support, advanced analytics, SMS integration',
    enterpriseDesc: 'Unlimited calls, 24/7 support, custom integrations, HIPAA compliance',
    billingItems: [
      'Ang mga subscription ay sinisingil monthly sa advance',
      'Available ang 14-day na libreng trial para sa new customers (walang credit card required)',
      'Ang payment ay securely processed through aming billing partner',
      'Ang lahat ng fees ay non-refundable maliban kung required ng batas',
      'Ang mga pagbabago sa presyo ay effective sa susunod na billing cycle na may 30 araw na abiso'
    ],
    overageDesc: 'Ang usage na lampas sa mga limitasyon ng plan ay sisingilin ng $0.05 bawat dagdag na tawag (Starter), $0.03 bawat tawag (Professional), with Enterprise plans na nag-aalok ng unlimited usage.',
    prohibitedActivities: [
      'Mga illegal na aktibidad o fraud ng anumang uri',
      'Harassment, threats, o intimidation ng iba',
      'Spam, unsolicited communications, o mga paglabag sa telemarketing',
      'Pagdisclose ng personal data ng iba nang walang consent',
      'Pagtangka na lampasan ang mga rate limit o security measures',
      'Reverse engineering o copying ng aming AI technology',
      'Paggamit ng mga automated system sa paraang nakakasama sa performance ng serbisyo'
    ],
    prohibitedUseNote: 'Ang violation ng patakarang ito ay maaaring magresulta sa agarang suspension ng account at legal na aksyon kung saan naaangkop.',
    ourIP: 'Aming Intellectual Property',
    yourContent: 'Iyong Content',
    aiGeneratedContent: 'AI-Generated Content',
    ipDesc1: 'Ang FrontDesk Agents AI ay may hawak na lahat ng karapatan sa aming platform, technology, branding, at content. Mayroon kang limited, non-exclusive license na gamitin ang aming mga serbisyo sa panahon ng iyong subscription. Hindi mo maaaring kopyahin, baguhin, o ipamahagi ang aming technology nang walang written permission.',
    ipDesc2: 'Mayroon ka pa rin ng ownership ng lahat ng content na iyong ibinibigay sa pamamagitan ng aming platform (custom greetings, configurations, business data). Sa paggamit ng aming mga serbisyo, binibigyan mo kami ng limited na license na gamitin ang iyong content nang eksklusibo para sa pagbibigay at pagpapabuti ng aming mga serbisyo.',
    ipDesc3: 'Ang mga response na generated ng aming mga AI agent sa panahon ng call handling ay pagmamay-ari mo para sa iyong business use. Maaari kaming gumamit ng anonymized, aggregated na data para sa pagpapabuti ng aming mga AI model.',
    liabilityDesc1: 'SA PINAKAMATAAS NA KALUGAN NA PINAPAYAGAN NG BATAS, ANG FRONTDESK AGENTS AT ANG MGA AFFILIATE NITO AY HINDI MAGIGING RESPONSIBLE PARA SA ANUMANG INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, O PUNITIVE DAMAGES, KABILANG ANG KUNG DIAN UMANOAY LOST NG PROFITS, DATA, USE, OR GOODWILL, NA NAGMUMULA SA IYONG PAGGAMIT NG MGA SERBISYO.',
    liabilityDesc2: 'Ang aming total na liability para sa anumang claim na nagmumula sa aming mga serbisyo ay hindi lalampas sa halagang iyong binayaran sa amin sa nakalipas na labindalawang buwan bago ang claim. Hindi kami responsible para sa anumang damages na nagmumula sa mga third-party services, user error, o mga sitwasyon na lampas sa aming makatwirang kontrol.',
    indemnification: 'Indemnification',
    indemnificationDesc: 'Sumasang-ayon kang i-indemnify at panatilihing walang pinsala ang FrontDesk Agents AI mula sa anumang claims, damages, o expenses na nagmumula sa iyong paggamit ng aming mga serbisyo, violation ng mga Tuntuning ito, o infringement ng anumang karapatan ng third-party.',
    terminationDesc1: 'Maaari mong kanselahin ang iyong subscription anumang oras sa pamamagitan ng mga setting ng iyong account o sa pamamagitan ng pakikipag-ugnayan sa support. Ang pagkansela ay effective sa pagtatapos ng kasalukuyang billing period mo. Walang refunds para sa mga partial month.',
    terminationDesc2: 'Maaari kaming wakasan o suspendihin ang iyong account agad kung ikaw ay:',
    terminationDesc3: 'Sa pagwawakas, titigil ang iyong access sa mga serbisyo, ang data ay pansasamantala para sa 30 araw (maliban kung naaangkop ang mga legal na kinakailangan), at anumang outstanding na fees ay nanatiling due. Ang mga seksyon ng mga Tuntuning ito na dapat pang magpatuloy pagkatapos ng pagwawakas ay mananatiling may bisa.',
    terminationItems: [
      'Mag-violate ng mga Tuntuning ito o ng Patakarang Katanggap-tanggap na Paggamit',
      'Hindi magbayad ng fees kapag due',
      'Kabahagi sa fraudulent o illegal na aktibidad',
      'Magpakita ng security risk sa aming platform o mga user'
    ],
    changesDesc: 'Maaari kaming mag-update ng mga Tuntuning ito now and then. Aabisuhan ka namin ng mga materyal na pagbabago sa pamamagitan ng email o platform notification Hindi bababa sa 30 araw bago sila maging epektibo. Ang iyong patuloy na paggamit ng mga serbisyo pagkatapos ng mga pagbabago ay bumubuo ng pagtanggap sa mga bagong Tuntunin.',
    changesNote: 'Ang "huling update" na petsa sa taas ng page na ito ay nagpapahiwatig ng最后一次Revision ng mga Tuntuning ito.',
    contactDesc: 'Para sa mga tanong tungkol sa mga Tuntunin ng Serbisyo na ito, mangyaring makipag-ugnayan sa amin:',
    email: 'Email:',
    responseTime: 'Oras ng Pagtugon:',
    legalInquiries: 'Sumasagot kami sa mga legal na inquiry sa loob ng 5 business days',
    generalSupport: 'Para sa general support, bisitahin ang aming',
    contactSupport: 'Support Page',
    termsOfService: 'Mga Tuntunin ng Serbisyo',
    privacyPolicy: 'Patakaran sa Privacy',
    contact: 'Kontact'
  },
  de: {
    title: 'Nutzungsbedingungen',
    lastUpdated: 'Letzte Aktualisierung: 21. Mai 2026',
    legal: 'Rechtlich',
    backToHome: '← Zurück zur Startseite',
    tableOfContents: 'Inhaltsverzeichnis',
    acceptanceOfTerms: 'Akzeptanz der Bedingungen',
    ourServices: 'Unsere Dienstleistungen',
    accountTerms: 'Kontobedingungen',
    paymentBilling: 'Zahlung und Abrechnung',
    acceptableUse: 'Akzeptable Nutzung',
    ipRights: 'Geistiges Eigentum',
    liability: 'Haftungsbeschränkung',
    termination: 'Kündigung',
    changesToTerms: 'Änderungen dieser Bedingungen',
    contactUs: 'Kontaktieren Sie uns',
    serviceDescription: 'Dienstleistungsbeschreibung',
    serviceAvailability: 'Dienstverfügbarkeit',
    accountRegistration: 'Kontoregistrierung',
    accountSecurity: 'Kontosicherheit',
    subscriptionPlans: 'Abonnementpläne',
    billingTerms: 'Abrechnungsbedingungen',
    overages: 'Überschreitungen',
    yourTerminationRights: 'Ihre Kündigungsrechte',
    ourTerminationRights: 'Unsere Kündigungsrechte',
    effectOfTermination: 'Wirkung der Kündigung',
    starter: 'Starter',
    professional: 'Professional',
    enterprise: 'Enterprise',
    perMonth: '/Monat',
    important: 'Wichtig',
    arbitrationNote: 'Diese Bedingungen beinhalten eine Schiedsklausel und einen Verzicht auf Sammelklagerechte. Bitte lesen Sie Abschnitt 7 sorgfältig durch.',
    acceptanceDesc1: 'Durch den Zugriff auf oder die Nutzung der FrontDesk Agents AI-Dienste erklären Sie sich mit diesen Servicebedingungen ("Bedingungen") und allen anwendbaren Gesetzen und Vorschriften einverstanden. Wenn Sie mit einem Teil dieser Bedingungen nicht einverstanden sind, dürfen Sie unsere Dienste nicht nutzen.',
    acceptanceDesc2: 'Diese Bedingungen stellen eine rechtlich bindende Vereinbarung zwischen Ihnen ("Sie", "Ihre" oder "Kunde") und FrontDesk Agents AI ("wir", "unser") dar. Mit der Nutzung unserer KI-Empfangsplattform erkennen Sie an, dass Sie diese Bedingungen gelesen, verstanden haben und damit einverstanden sind, an sie gebunden zu sein.',
    servicesDesc: 'FrontDesk Agents AI bietet eine KI-gesteuerte Empfangsplattform, die es Unternehmen ermöglicht, Anrufbearbeitung, Terminplanung, SMS-Kommunikation und Kundeninteraktionen zu automatisieren.',
    platformIncludes: [
      'KI-Sprachagenten für natürliche Anrufbearbeitung',
      'SMS-Messaging-Integration',
      'Terminplanung und Kalenderverwaltung',
      'Anrufaufzeichnungs- und Transkriptionsdienste',
      'Echtzeit-Analyse- und Berichts-Dashboards',
      'Benutzerdefinierte KI-Agentenkonfiguration und Begrüßungen',
      'Drittanbieter-Integrationen (Zahlungen, Kalender-Apps, CRM-Systeme)'
    ],
    availabilityDesc: 'Wir streben eine Betriebszeit von 99,9% an, garantieren jedoch keinen ununterbrochenen Service. Geplante Wartung wird nach Möglichkeit im Voraus mitgeteilt. Wir behalten uns das Recht vor, Dienste mit angemessener Benachrichtigung zu ändern oder einzustellen.',
    registrationItems: [
      'Sie müssen während der Registrierung genaue und vollständige Informationen angeben',
      'Sie sind für die Aufrechterhaltung der Sicherheit Ihrer Kontodaten verantwortlich',
      'Eine Person oder Geschäftseinheit darf nicht mehrere kostenlose Konten unterhalten',
      'Sie müssen mindestens 18 Jahre alt sein, um ein Konto zu erstellen'
    ],
    securityItems: [
      'Sie sind für alle Aktivitäten unter Ihrem Konto verantwortlich',
      'Benachrichtigen Sie uns unverzüglich über jeden unbefugten Zugriff',
      'Wir können Konten bei Verdacht auf Sicherheitsverletzungen sperren',
      'Sie willigen in Sicherheitsuntersuchungen ein, wenn diese angefordert werden'
    ],
    starterDesc: '100 KI-Anrufe/Monat, E-Mail-Support, grundlegende Analytik',
    professionalDesc: '1.000 KI-Anrufe/Monat, Prioritätssupport, erweiterte Analytik, SMS-Integration',
    enterpriseDesc: 'Unbegrenzte Anrufe, 24/7-Support, benutzerdefinierte Integrationen, HIPAA-Compliance',
    billingItems: [
      'Abonnements werden monatlich im Voraus abgerechnet',
      '14-tägige kostenlose Testversion für Neukunden verfügbar (keine Kreditkarte erforderlich)',
      'Zahlung wird sicher über unseren Abrechnungspartner abgewickelt',
      'Alle Gebühren sind nicht erstattbar, außer wenn gesetzlich vorgeschrieben',
      'Preisänderungen werden mit 30-tägiger Vorankündigung zum nächsten Abrechnungszyklus wirksam'
    ],
    overageDesc: 'Nutzung über die Planlimits hinaus wird zu $0.05 pro zusätzlichem Anruf (Starter), $0.03 pro Anruf (Professional) berechnet, wobei Enterprise-Pläne unbegrenzte Nutzung bieten.',
    prohibitedActivities: [
      'Illegale Aktivitäten oder Betrug jeder Art',
      'Belästigung, Drohungen oder Einschüchterung anderer',
      'Spam, unaufgeforderte Kommunikation oder Telemarketing-Verstöße',
      'Offenlegung personenbezogener Daten anderer ohne Zustimmung',
      'Versuch, Tarifeinschränkungen oder Sicherheitsmaßnahmen zu umgehen',
      'Reverse Engineering oder Kopieren unserer KI-Technologie',
      'Verwendung automatisierter Systeme auf Weise, die die Serviceleistung beeinträchtigen'
    ],
    prohibitedUseNote: 'Ein Verstoß gegen diese Richtlinie kann zur sofortigen Kontosperrung und rechtlichen Schritten führen, wo zutreffend.',
    ourIP: 'Unser geistiges Eigentum',
    yourContent: 'Ihre Inhalte',
    aiGeneratedContent: 'KI-generierte Inhalte',
    ipDesc1: 'FrontDesk Agents AI behält alle Rechte an unserer Plattform, Technologie, Marke und unseren Inhalten. Sie erhalten eine eingeschränkte, nicht exklusive Lizenz zur Nutzung unserer Dienste während Ihres Abonnements. Sie dürfen unsere Technologie ohne schriftliche Genehmigung nicht kopieren, modifizieren oder verbreiten.',
    ipDesc2: 'Sie behalten das Eigentum an allen Inhalten, die Sie über unsere Plattform bereitstellen (benutzerdefinierte Begrüßungen, Konfigurationen, Geschäftsdaten). Durch die Nutzung unserer Dienste gewähren Sie uns eine eingeschränkte Lizenz, Ihre Inhalte nur zur Bereitstellung und Verbesserung unserer Dienste zu verwenden.',
    ipDesc3: 'Antworten, die von unseren KI-Agenten während der Anrufbearbeitung generiert werden, gehören Ihnen für Ihre geschäftliche Nutzung. Wir dürfen anonymisierte, aggregierte Daten zur Verbesserung unserer KI-Modelle verwenden.',
    liabilityDesc1: 'NACH MAXIMALEM, GESETZLICH ZULÄSSIGEM UMFANG HAFTEN FRONTDESK AGENTS UND SEINE TOCHTERGESELLSCHAFTEN NICHT FÜR INDIREKTE, ZUFÄLLIGE, SPEZIELLE, FOLGE- ODER STRAFschäDEN, EINSCHLIESSLICH, JEDOCH NICHT BESCHRÄNKT AUF GEWINNVERLUST, DATENVERLUST, NUTZUNGSAUSFALL ODER GOODWILL, DIE AUS IHRER NUTZUNG DER DIENSTE ENTSTEHEN.',
    liabilityDesc2: 'Unsere Gesamthaftung für jedwede aus unseren Diensten entstehende Forderung darf den von Ihnen in den zwölf Monaten vor der Forderung gezahlten Betrag nicht überschreiten. Wir haften nicht für Schäden aus Drittanbieterdiensten, Benutzerfehlern oder Umständen außerhalb unserer angemessenen Kontrolle.',
    indemnification: 'Schadensersatz',
    indemnificationDesc: 'Sie erklären sich damit einverstanden, FrontDesk Agents AI von jedweden Ansprüchen, Schäden oder Kosten freizustellen und schadlos zu halten, die aus Ihrer Nutzung unserer Dienste, einem Verstoß gegen diese Bedingungen oder einer Verletzung von Rechten Dritter entstehen.',
    terminationDesc1: 'Sie können Ihr Abonnement jederzeit über Ihre Kontoeinstellungen oder durch Kontaktaufnahme mit dem Support kündigen. Die Kündigung wird am Ende Ihrer aktuellen Abrechnungsperiode wirksam. Für anteilige Monate werden keine Erstattungen gewährt.',
    terminationDesc2: 'Wir können Ihr Konto sofort kündigen oder sperren, wenn Sie:',
    terminationDesc3: 'Bei Beendigung endet Ihr Zugang zu den Diensten, Daten werden 30 Tage lang aufbewahrt (sofern gesetzliche Anforderungen gelten), und ausstehende Gebühren bleiben fällig. Bestimmungen dieser Bedingungen, die ihrem Wesen nach die Beendigung überdauern sollten, bleiben in Kraft.',
    terminationItems: [
      'Diese Bedingungen oder die Richtlinie zur akzeptablen Nutzung verletzen',
      'Fällige Gebühren nicht bezahlen',
      'Sich an betrügerischen oder illegalen Aktivitäten beteiligen',
      'Eine Sicherheitsrisiko für unsere Plattform oder Benutzer darstellen'
    ],
    changesDesc: 'Wir können diese Bedingungen von Zeit zu Zeit aktualisieren. Wir werden Sie über wesentliche Änderungen per E-Mail oder Plattform-Benachrichtigung mindestens 30 Tage vor deren Inkrafttreten informieren. Ihre fortgesetzte Nutzung der Dienste nach Änderungen gilt als Akzeptanz der neuen Bedingungen.',
    changesNote: 'Das "Zuletzt aktualisiert"-Datum oben auf dieser Seite zeigt an, wann diese Bedingungen zuletzt überarbeitet wurden.',
    contactDesc: 'Für Fragen zu diesen Nutzungsbedingungen kontaktieren Sie uns bitte:',
    email: 'E-Mail:',
    responseTime: 'Antwortzeit:',
    legalInquiries: 'Wir antworten auf rechtliche Anfragen innerhalb von 5 Werktagen',
    generalSupport: 'Für allgemeinen Support besuchen Sie unsere',
    contactSupport: 'Support-Seite',
    termsOfService: 'Nutzungsbedingungen',
    privacyPolicy: 'Datenschutzrichtlinie',
    contact: 'Kontakt'
  },
  it: {
    title: 'Termini di Servizio',
    lastUpdated: 'Ultimo aggiornamento: 21 maggio 2026',
    legal: 'Legale',
    backToHome: '← Torna alla Home',
    tableOfContents: 'Sommario',
    acceptanceOfTerms: 'Accettazione dei Termini',
    ourServices: 'I Nostri Servizi',
    accountTerms: 'Termini dell\'Account',
    paymentBilling: 'Pagamento e Fatturazione',
    acceptableUse: 'Utilizzo Accettabile',
    ipRights: 'Proprietà Intellettuale',
    liability: 'Limitazione di Responsabilità',
    termination: 'Risoluzione',
    changesToTerms: 'Modifiche a Questi Termini',
    contactUs: 'Contattaci',
    serviceDescription: 'Descrizione del Servizio',
    serviceAvailability: 'Disponibilità del Servizio',
    accountRegistration: 'Registrazione Account',
    accountSecurity: 'Sicurezza Account',
    subscriptionPlans: 'Piani di Abbonamento',
    billingTerms: 'Termini di Fatturazione',
    overages: 'Superamenti',
    yourTerminationRights: 'I Tuoi Diritti di Risoluzione',
    ourTerminationRights: 'I Nostri Diritti di Risoluzione',
    effectOfTermination: 'Effetto della Risoluzione',
    starter: 'Starter',
    professional: 'Professionista',
    enterprise: 'Aziendale',
    perMonth: '/mese',
    important: 'Importante',
    arbitrationNote: 'Questi Termini includono una clausola di arbitrato e rinuncia ai diritti di azione collettiva. Si prega di leggere attentamente la Sezione 7.',
    acceptanceDesc1: 'Accedendo o utilizzando i servizi di FrontDesk Agents AI, accetti di essere vincolato a questi Termini di Servizio ("Termini") ea tutte le leggi e i regolamenti applicabili. Se non accetti una parte di questi Termini, non puoi utilizzare i nostri servizi.',
    acceptanceDesc2: 'Questi Termini costituiscono un accordo giuridicamente vincolante tra te ("tu", "tuo" o "Cliente") e FrontDesk Agents AI ("noi", "nostro"). Utilizzando la nostra piattaforma di receptionist AI, riconosci di aver letto, compreso e accettato di essere vincolato a questi Termini.',
    servicesDesc: 'FrontDesk Agents AI fornisce una piattaforma di receptionist alimentata da AI che consente alle aziende di automatizzare la gestione delle chiamate, la pianificazione degli appuntamenti, le comunicazioni SMS e le interazioni con i clienti.',
    platformIncludes: [
      'Agenti vocali AI per la gestione naturale delle chiamate',
      'Integrazione messaggistica SMS',
      'Pianificazione appuntamenti e gestione del calendario',
      'Servizi di registrazione e trascrizione delle chiamate',
      'Dashboard di analisi e reporting in tempo reale',
      'Configurazione dell\'agente AI personalizzato e saluti',
      'Integrazioni di terze parti (pagamenti, app di calendario, sistemi CRM)'
    ],
    availabilityDesc: 'Ci impegniamo a mantenere il 99,9% di uptime ma non garantiamo un servizio ininterrotto. La manutenzione programmata verrà comunicata in anticipo quando possibile. Ci riserviamo il diritto di modificare o interrompere i servizi con preavviso ragionevole.',
    registrationItems: [
      'Devi fornire informazioni accurate e complete durante la registrazione',
      'Sei responsabile della manutenzione della sicurezza delle credenziali del tuo account',
      'Una persona o entità aziendale non può mantenere più account gratuiti',
      'Devi avere almeno 18 anni per creare un account'
    ],
    securityItems: [
      'Sei responsabile di tutte le attività sotto il tuo account',
      'Notificaci immediatamente qualsiasi accesso non autorizzato',
      'Possiamo sospendere account sospettati di violazioni della sicurezza',
      'Consenti alle indagini di sicurezza se richiesto'
    ],
    starterDesc: '100 chiamate AI/mese, supporto email, analisi di base',
    professionalDesc: '1.000 chiamate AI/mese, supporto prioritario, analisi avanzate, integrazione SMS',
    enterpriseDesc: 'Chiamate illimitate, supporto 24/7, integrazioni personalizzate, conformità HIPAA',
    billingItems: [
      'Gli abbonamenti vengono fatturati mensilmente in anticipo',
      'Trial gratuito di 14 giorni disponibile per nuovi clienti (nessuna carta di credito richiesta)',
      'Pagamento elaborato in modo sicuro tramite il nostro partner di fatturazione',
      'Tutte le tariffe non sono rimborsabili se non richiesto dalla legge',
      'Le modifiche ai prezzi diventano efficaci nel successivo ciclo di fatturazione con 30 giorni di preavviso'
    ],
    overageDesc: 'L\'uso oltre i limiti del piano verrà addebitato a $0.05 per chiamata aggiuntiva (Starter), $0.03 per chiamata (Professionista), con i piani Aziendali che offrono uso illimitato.',
    prohibitedActivities: [
      'Attività illegali o frode di qualsiasi tipo',
      'Molestie, minacce o intimidazione di altri',
      'Spam, comunicazioni non richieste o violazioni del telemarketing',
      'Divulgazione di dati personali di altri senza consenso',
      'Tentativo di eludere limiti di velocità o misure di sicurezza',
      'Ingegneria inversa o copia della nostra tecnologia AI',
      'Utilizzo di sistemi automatizzati in modi che danneggiano le prestazioni del servizio'
    ],
    prohibitedUseNote: 'La violazione di questa politica può comportare la sospensione immediata dell\'account e azioni legali ove applicabile.',
    ourIP: 'La Nostra Proprietà Intellettuale',
    yourContent: 'Il Tuo Contenuto',
    aiGeneratedContent: 'Contenuto Generato da AI',
    ipDesc1: 'FrontDesk Agents AI mantiene tutti i diritti sulla nostra piattaforma, tecnologia, marchio e contenuti. Ricevi una licenza limitata, non esclusiva per utilizzare i nostri servizi durante il tuo abbonamento. Non puoi copiare, modificare o distribuire la nostra tecnologia senza autorizzazione scritta.',
    ipDesc2: 'Mantieni la proprietà di tutti i contenuti che fornisci attraverso la nostra piattaforma (saluti personalizzati, configurazioni, dati aziendali). Utilizzando i nostri servizi, ci concedi una licenza limitata per utilizzare i tuoi contenuti esclusivamente per fornire e migliorare i nostri servizi.',
    ipDesc3: 'Le risposte generate dai nostri agenti AI durante la gestione delle chiamate ti appartengono per il tuo uso aziendale. Possiamo utilizzare dati aggregati e anonimizzati per migliorare i nostri modelli AI.',
    liabilityDesc1: 'NELLA MASSIMA MISURA CONSENTITA DALLA LEGGE, FRONTDESK AGENTS E I SUOI AFFILIATI NON SARANNO RESPONSABILI PER EVENTUALI DANNI INDIRETTI, INCIDENTALI, SPECIALI, CONSEQUENZIALI O PUNITIVI, INCLUSI MA NON LIMITATI A PERDITA DI PROFITTI, DATI, USO O AVVIAMENTO, DERIVANTI DAL TUO UTILIZZO DEI SERVIZI.',
    liabilityDesc2: 'La nostra responsabilità totale per qualsiasi richiesta derivante dai nostri servizi non supererà l\'importo che ci hai pagato nei dodici mesi precedenti la richiesta. Non siamo responsabili per eventuali danni derivanti da servizi di terze parti, errori dell\'utente o circostanze oltre il nostro ragionevole controllo.',
    indemnification: 'Indennizzo',
    indemnificationDesc: 'Accetti di indennizzare e mantenere harmless FrontDesk Agents AI da eventuali richieste, danni o spese derivanti dal tuo utilizzo dei nostri servizi, violazione di questi Termini o violazione di diritti di terzi.',
    terminationDesc1: 'Puoi cancellare il tuo abbonamento in qualsiasi momento tramite le impostazioni del tuo account o contattando il supporto. La cancellazione ha effetto alla fine del tuo attuale periodo di fatturazione. Non vengono forniti rimborsi per mesi parziali.',
    terminationDesc2: 'Possiamo risolvere o sospendere il tuo account immediatamente se tu:',
    terminationDesc3: 'Upon termination, your access to services will cease, data will be retained for 30 days (unless legal requirements apply), and any outstanding fees remain due. Sections of these Terms that by their nature should survive termination will remain in effect.',
    terminationItems: [
      'Violi questi Termini o la Politica di Utilizzo Accettabile',
      'Non paghi le tariffe quando dovute',
      'Ti impegni in attività fraudolente o illegali',
      'Representi un rischio per la sicurezza della nostra piattaforma o degli utenti'
    ],
    changesDesc: 'Potremmo aggiornare questi Termini di volta in volta. Ti notificheremo le modifiche sostanziali via email o notifica sulla piattaforma almeno 30 giorni prima che abbiano effetto. Il tuo utilizzo continuato dei servizi dopo le modifiche costituisce accettazione dei nuovi Termini.',
    changesNote: 'La data di "ultimo aggiornamento" in cima a questa pagina indica quando questi Termini sono stati revisionati l\'ultima volta.',
    contactDesc: 'Per domande su questi Termini di Servizio, ti preghiamo di contattarci:',
    email: 'Email:',
    responseTime: 'Tempo di Risposta:',
    legalInquiries: 'Rispondiamo alle richieste legali entro 5 giorni lavorativi',
    generalSupport: 'Per supporto generale, visita la nostra',
    contactSupport: 'Pagina di Supporto',
    termsOfService: 'Termini di Servizio',
    privacyPolicy: 'Informativa sulla Privacy',
    contact: 'Contatto'
  },
  ru: {
    title: 'Условия Использования',
    lastUpdated: 'Последнее обновление: 21 мая 2026 г.',
    legal: 'Юридический',
    backToHome: '← Вернуться на главную',
    tableOfContents: 'Содержание',
    acceptanceOfTerms: 'Принятие Условий',
    ourServices: 'Наши Услуги',
    accountTerms: 'Условия Аккаунта',
    paymentBilling: 'Оплата и Выставление Счетов',
    acceptableUse: 'Приемлемое Использование',
    ipRights: 'Интеллектуальная Собственность',
    liability: 'Ограничение Ответственности',
    termination: 'Расторжение',
    changesToTerms: 'Изменения Этих Условий',
    contactUs: 'Свяжитесь с Нами',
    serviceDescription: 'Описание Услуги',
    serviceAvailability: 'Доступность Услуги',
    accountRegistration: 'Регистрация Аккаунта',
    accountSecurity: 'Безопасность Аккаунта',
    subscriptionPlans: 'Планы Подписки',
    billingTerms: 'Условия Оплаты',
    overages: 'Превышение',
    yourTerminationRights: 'Ваши Права на Расторжение',
    ourTerminationRights: 'Наши Права на Расторжение',
    effectOfTermination: 'Последствия Расторжение',
    starter: 'Стартер',
    professional: 'Профессионал',
    enterprise: 'Корпоративный',
    perMonth: '/месяц',
    important: 'Важно',
    arbitrationNote: 'Эти Условия включают арбитражную оговорку и отказ от прав на коллективные иски. Пожалуйста, внимательно прочитайте Раздел 7.',
    acceptanceDesc1: 'Получая доступ к услугам FrontDesk Agents AI или используя их, вы соглашаетесь соблюдать настоящие Условия использования ("Условия") и все применимые законы и нормативные акты. Если вы не согласны с какой-либо частью этих Условий, вы не можете использовать наши услуги.',
    acceptanceDesc2: 'Настоящие Условия представляют собой юридически обязательное соглашение между вами ("вы", "ваш" или "Клиент") и FrontDesk Agents AI ("мы", "наш"). Используя нашу платформу AI-ресепшиониста, вы признаете, что прочитали, поняли и соглашаетесь соблюдать настоящие Условия.',
    servicesDesc: 'FrontDesk Agents AI предоставляет платформу AI-ресепшиониста, которая позволяет компаниям автоматизировать обработку звонков, планирование встреч, SMS-коммуникации и взаимодействие с клиентами.',
    platformIncludes: [
      'AI голосовые агенты для естественной обработки звонков',
      'Интеграция SMS-сообщений',
      'Планирование встреч и управление календарем',
      'Услуги записи и транскрибирования звонков',
      'Панели аналитики и отчетности в реальном времени',
      'Пользовательские конфигурации AI-агента и приветствия',
      'Интеграции с третьими сторонами (платежи, приложения календаря, CRM-системы)'
    ],
    availabilityDesc: 'Мы стремимся поддерживать 99,9% доступности, но не гарантируем бесперебойную работу. Плановое техническое обслуживание будет сообщено заранее по возможности. Мы оставляем за собой право изменять или прекращать услуги с разумным уведомлением.',
    registrationItems: [
      'Вы должны предоставить точную и полную информацию при регистрации',
      'Вы несете ответственность за поддержание безопасности данных вашего аккаунта',
      ' одно лицо или коммерческое лицо не может иметь несколько бесплатных аккаунтов',
      'Вам должно быть не менее 18 лет для создания аккаунта'
    ],
    securityItems: [
      'Вы несете ответственность за все действия под вашим аккаунтом',
      'Немедленно уведомляйте нас о любом несанкционированном доступе',
      'Мы можем приостановить аккаунты при подозрении на нарушение безопасности',
      'Вы даете согласие на проведение расследований безопасности по запросу'
    ],
    starterDesc: '100 AI-звонков/месяц, поддержка по email, базовая аналитика',
    professionalDesc: '1,000 AI-звонков/месяц, приоритетная поддержка, расширенная аналитика, SMS-интеграция',
    enterpriseDesc: 'Безлимитные звонки, поддержка 24/7, пользовательские интеграции, соответствие HIPAA',
    billingItems: [
      'Подписки оплачиваются ежемесячно авансом',
      '14-дневный бесплатный пробный период для новых клиентов (кредитная карта не требуется)',
      'Платежи обрабатываются безопасно через нашего партнера по выставлению счетов',
      'Все сборы не подлежат возврату, если законом не предусмотрено иное',
      'Изменения цен вступают в силу в следующем цикле выставления счетов с уведомлением за 30 дней'
    ],
    overageDesc: 'Использование сверх лимитов плана оплачивается по $0.05 за дополнительный звонок (Стартер), $0.03 за звонок (Профессионал), корпоративные планы предлагают безлимитное использование.',
    prohibitedActivities: [
      'Незаконная деятельность или мошенничество любого вида',
      'Harassment, угрозы или запугивание других',
      'Спам, незапрошенные коммуникации или нарушения телемаркетинга',
      'Раскрытие персональных данных других без согласия',
      'Attempt обход ограничений скорости или мер безопасности',
      'Обратная инженерия или копирование нашей AI-технологии',
      'Использование автоматизированных систем способами, наносящими ущерб производительности сервиса'
    ],
    prohibitedUseNote: 'Нарушение этой политики может привести к немедленной приостановке аккаунта и судебным действиям где применимо.',
    ourIP: 'Наша Интеллектуальная Собственность',
    yourContent: 'Ваш Контент',
    aiGeneratedContent: 'AI-Generated Контент',
    ipDesc1: 'FrontDesk Agents AI сохраняет все права на нашу платформу, технологию, брендинг и контент. Вы получаете ограниченную, неисключительную лицензию на использование наших услуг в течение вашей подписки. Вы не можете копировать, модифицировать или распространять нашу технологию без письменного разрешения.',
    ipDesc2: 'Вы сохраняете право собственности на весь контент, который вы предоставляете через нашу платформу (пользовательские приветствия, конфигурации, бизнес-данные). Используя наши услуги, вы предоставляете нам ограниченную лицензию на использование вашего контента исключительно для предоставления и улучшения наших услуг.',
    ipDesc3: 'Ответы, сгенерированные нашими AI-агентами во время обработки звонков, принадлежат вам для вашего бизнес-использования. Мы можем использовать анонимизированные агрегированные данные для улучшения наших AI-моделей.',
    liabilityDesc1: 'В МАКСИМАЛЬНОЙ СТЕПЕНИ, РАЗРЕШЕННОЙ ЗАКОНОМ, FRONTDESK AGENTS И ЕГО АФФИЛИРОВАНЫ НЕ НЕСУТ ОТВЕТСТВЕННОСТИ ЗА ЛЮБЫЕ КОСВЕННЫЕ, СЛУЧАЙНЫЕ, СПЕЦИАЛЬНЫЕ, ПОБОЧНЫЕ ИЛИ ШТРАФНЫЕ УБЫТКИ, ВКЛЮЧАЯ, НО НЕ ОГРАНИЧИВАЯСЬ ПОТЕРЕЙ ПРИБЫЛИ, ДАННЫХ, ИСПОЛЬЗОВАНИЯ ИЛИ ДЕЛОВОЙ РЕПУТАЦИИ, ВОЗНИКАЮЩИЕ ИЗ ВАШЕГО ИСПОЛЬЗОВАНИЯ УСЛУГ.',
    liabilityDesc2: 'Наша общая ответственность за любую претензию, возникающую из наших услуг, не превысит сумму, которую вы нам заплатили за двенадцать месяцев, предшествующих претензии. Мы не несем ответственности за любые убытки, возникающие из услуг третьих лиц, ошибок пользователя или обстоятельств, находящихся вне нашего разумного контроля.',
    indemnification: 'Возмещение Убытков',
    indemnificationDesc: 'Вы соглашаетесь возместить и обезопасить FrontDesk Agents AI от любых претензий, убытков или расходов, возникающих из вашего использования наших услуг, нарушения этих Условий или нарушения прав третьих лиц.',
    terminationDesc1: 'Вы можете отменить подписку в любое время через настройки аккаунта или связавшись со службой поддержки. Отмена вступает в силу в конце текущего платежного периода. Возврат за частичные месяцы не предоставляется.',
    terminationDesc2: 'Мы можем расторгнуть или приостановить ваш аккаунт немедленно, если вы:',
    terminationDesc3: 'При расторжении ваш доступ к услугам прекращается, данные сохраняются в течение 30 дней (если не применяются юридические требования), и любые непогашенные сборы остаются задолженностью. Разделы настоящих Условий, которые по своему характеру должны сохраняться после расторжения, остаются в силе.',
    terminationItems: [
      'Нарушаете настоящие Условия или Политику Приемлемого Использования',
      'Не оплачиваете сборы при наступлении срока оплаты',
      'Участвуете в мошеннической или незаконной деятельности',
      'Представляете угрозу безопасности для нашей платформы или пользователей'
    ],
    changesDesc: 'Мы можем время от времени обновлять настоящие Условия. Мы уведомим вас о существенных изменениях по email или через уведомление на платформе как минимум за 30 дней до их вступления в силу. Продолжение использования услуг после внесения изменений означает принятие новых Условий.',
    changesNote: 'Дата "последнего обновления" в верхней части этой страницы указывает, когда настоящие Условия были последний раз пересмотрены.',
    contactDesc: 'По вопросам относительно настоящих Условий использования, пожалуйста, свяжитесь с нами:',
    email: 'Электронная почта:',
    responseTime: 'Время Ответа:',
    legalInquiries: 'Мы отвечаем на юридические запросы в течение 5 рабочих дней',
    generalSupport: 'Для общей поддержки посетите нашу',
    contactSupport: 'страницу поддержки',
    termsOfService: 'Условия Использования',
    privacyPolicy: 'Политика Конфиденциальности',
    contact: 'Контакт'
  }
}

// RTL languages

const sections = [
  { id: 'acceptance', titleKey: 'acceptanceOfTerms' },
  { id: 'services', titleKey: 'ourServices' },
  { id: 'account', titleKey: 'accountTerms' },
  { id: 'payment', titleKey: 'paymentBilling' },
  { id: 'acceptable-use', titleKey: 'acceptableUse' },
  { id: 'ip-rights', titleKey: 'ipRights' },
  { id: 'liability', titleKey: 'liability' },
  { id: 'termination', titleKey: 'termination' },
  { id: 'changes', titleKey: 'changesToTerms' },
  { id: 'contact', titleKey: 'contactUs' },
]

export default function TermsOfServicePage() {
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
            <FileText className="w-8 h-8 text-green-400" />
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
          {/* Acceptance */}
          <section id="acceptance">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold">{t.acceptanceOfTerms}</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p>{t.acceptanceDesc1}</p>
              <p>{t.acceptanceDesc2}</p>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mt-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">
                    <strong className="text-yellow-400">{t.important}:</strong> {t.arbitrationNote}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Our Services */}
          <section id="services">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold">{t.ourServices}</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p>{t.servicesDesc}</p>
              <h3 className="text-xl font-semibold text-white mt-6">{t.serviceDescription}</h3>
              <p>Our platform includes:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                {t.platformIncludes.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
              <h3 className="text-xl font-semibold text-white mt-6">{t.serviceAvailability}</h3>
              <p>{t.availabilityDesc}</p>
            </div>
          </section>

          {/* Account Terms */}
          <section id="account">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold">{t.accountTerms}</h2>
            </div>
            <div className="space-y-6 text-gray-300">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="font-bold text-white mb-4">{t.accountRegistration}</h3>
                <ul className="space-y-2">
                  {t.registrationItems.map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="font-bold text-white mb-4">{t.accountSecurity}</h3>
                <ul className="space-y-2">
                  {t.securityItems.map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Payment & Billing */}
          <section id="payment">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold">{t.paymentBilling}</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <h3 className="text-xl font-semibold text-white">{t.subscriptionPlans}</h3>
              <p>We offer three subscription tiers:</p>
              <div className="grid gap-4 mt-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-white">{t.starter}</h4>
                    <span className="text-green-400 font-bold">$99{t.perMonth}</span>
                  </div>
                  <p className="text-sm">{t.starterDesc}</p>
                </div>
                <div className="bg-white/5 border border-green-500/30 rounded-xl p-5">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-white">{t.professional}</h4>
                    <span className="text-green-400 font-bold">$299{t.perMonth}</span>
                  </div>
                  <p className="text-sm">{t.professionalDesc}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-white">{t.enterprise}</h4>
                    <span className="text-green-400 font-bold">$999{t.perMonth}</span>
                  </div>
                  <p className="text-sm">{t.enterpriseDesc}</p>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-white mt-8">{t.billingTerms}</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                {t.billingItems.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>

              <h3 className="text-xl font-semibold text-white mt-8">{t.overages}</h3>
              <p>{t.overageDesc}</p>
            </div>
          </section>

          {/* Acceptable Use */}
          <section id="acceptable-use">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold">{t.acceptableUse}</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p>You agree NOT to use our services for:</p>
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mt-4">
                <ul className="space-y-3">
                  {t.prohibitedActivities.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-4">{t.prohibitedUseNote}</p>
            </div>
          </section>

          {/* Intellectual Property */}
          <section id="ip-rights">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <Gavel className="w-5 h-5 text-yellow-400" />
              </div>
              <h2 className="text-2xl font-bold">{t.ipRights}</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <h3 className="text-xl font-semibold text-white">{t.ourIP}</h3>
              <p>{t.ipDesc1}</p>
              <h3 className="text-xl font-semibold text-white mt-6">{t.yourContent}</h3>
              <p>{t.ipDesc2}</p>
              <h3 className="text-xl font-semibold text-white mt-6">{t.aiGeneratedContent}</h3>
              <p>{t.ipDesc3}</p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section id="liability">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
              </div>
              <h2 className="text-2xl font-bold">{t.liability}</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-6">
                <p className="mb-4">
                  <strong className="text-orange-400">{t.important}:</strong> It limits our liability to you and affects your legal rights.
                </p>
                <p>{t.liabilityDesc1}</p>
              </div>
              <p className="mt-4">{t.liabilityDesc2}</p>
              <h3 className="text-xl font-semibold text-white mt-6">{t.indemnification}</h3>
              <p>{t.indemnificationDesc}</p>
            </div>
          </section>

          {/* Termination */}
          <section id="termination">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gray-500/20 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold">{t.termination}</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <h3 className="text-xl font-semibold text-white">{t.yourTerminationRights}</h3>
              <p>{t.terminationDesc1}</p>
              <h3 className="text-xl font-semibold text-white mt-6">{t.ourTerminationRights}</h3>
              <p>{t.terminationDesc2}</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                {t.terminationItems.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
              <h3 className="text-xl font-semibold text-white mt-6">{t.effectOfTermination}</h3>
              <p>{t.terminationDesc3}</p>
            </div>
          </section>

          {/* Changes to Terms */}
          <section id="changes" className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold">{t.changesToTerms}</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <p>{t.changesDesc}</p>
              <p className="text-sm">{t.changesNote}</p>
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
              <p>{t.contactDesc}</p>
              <div className="space-y-2">
                <p><strong className="text-white">{t.email}</strong> <a href="mailto:legal@frontdeskagents.com" className="text-green-400 hover:underline">legal@frontdeskagents.com</a></p>
                <p><strong className="text-white">{t.responseTime}</strong> {t.legalInquiries}</p>
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