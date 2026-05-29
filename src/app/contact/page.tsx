'use client'

import { useState, useEffect } from 'react'
import { Mail, Phone, MessageCircle, HelpCircle, Clock, Send, CheckCircle, AlertCircle, Headphones, Bot, CreditCard, FileText, Globe } from 'lucide-react'
import Link from 'next/link'
import LanguageSelector from '../components/LanguageSelector'

// Complete multilingual translations
const translations: Record<string, Record<string, string>> = {
  en: {
    headerTitle: 'Contact Support', headerSubtitle: 'Get in touch with our team. We typically respond within 24 hours, or choose an option below for faster assistance.',
    sendMessage: 'Send us a message', yourName: 'Your Name', emailAddress: 'Email Address', subject: 'Subject', message: 'Message', sendBtn: 'Send Message', sending: 'Sending...',
    quickHelp: 'Quick Help', browseByTopic: 'Browse by Topic',
    responseEmail: 'Email Response', responseEmailTime: 'Within 24 hours', responseChat: 'Live Chat', responseChatTime: 'Available 9am-6pm EST', responsePhone: 'Enterprise Phone', responsePhoneTime: '24/7 Priority Support',
    technicalSupport: 'Technical Support', technicalDesc: 'API issues, integration help, troubleshooting',
    billingQuestions: 'Billing Questions', billingDesc: 'Payment issues, invoices, plan changes',
    generalInquiries: 'General Inquiries', generalDesc: 'Sales questions, partnership opportunities',
    accountServices: 'Account Services', accountDesc: 'Account changes, cancellations, deletions',
    knowledgeBase: 'Knowledge Base', knowledgeDesc: 'Browse tutorials and guides',
    liveChat: 'Live Chat', liveChatDesc: 'Chat with our support team',
    emailSupport: 'Email Support', emailSupportDesc: 'support@frontdeskagents.com',
    enterprisePhone: 'Enterprise Support', enterprisePhoneDesc: '24/7 phone support for Enterprise',
    emailUsTitle: 'Email Us Directly', emailUsDesc: 'For urgent matters, email our team directly',
    faqTitle: 'Frequently Asked Questions',
    faqUpgrade: 'How do I upgrade my plan?', faqUpgradeAns: 'Go to Settings > Subscription > Change Plan. Changes take effect immediately.',
    faqCancel: 'Can I cancel anytime?', faqCancelAns: 'Yes, cancel anytime from your account settings. No questions asked.',
    faqResetPassword: 'How do I reset my password?', faqResetAns: 'Click Forgot Password on the login page and follow the instructions.',
    faqIntegrations: 'What integrations do you support?', faqIntegrationsAns: 'We support payments, SMS, voice AI, Google Calendar, and more. See our integration docs.',
    footerPrivacy: 'Privacy Policy', footerTerms: 'Terms of Service', footerContact: 'Contact',
    thankYou: 'Message Sent!', thankYouDesc: 'Thank you for contacting us. We will get back to you within 24 hours.',
    sendAnother: 'Send another message',
    selectTopic: 'Select a topic...', topicTechnical: 'Technical Support', topicBilling: 'Billing Question', topicSales: 'Sales Inquiry', topicAccount: 'Account Services', topicFeedback: 'Product Feedback', topicOther: 'Other',
    placeholderName: 'Jane Smith', placeholderEmail: 'jane@company.com', placeholderMessage: 'Tell us how we can help...'
  },
  es: {
    headerTitle: 'Contacto de Soporte', headerSubtitle: 'Póngase en contacto con nuestro equipo. Normalmente respondemos dentro de 24 horas, o elija una opción abajo para asistencia más rápida.',
    sendMessage: 'Envíanos un mensaje', yourName: 'Tu Nombre', emailAddress: 'Correo Electrónico', subject: 'Asunto', message: 'Mensaje', sendBtn: 'Enviar Mensaje', sending: 'Enviando...',
    quickHelp: 'Ayuda Rápida', browseByTopic: 'Explorar por Tema',
    responseEmail: 'Respuesta por Email', responseEmailTime: 'Dentro de 24 horas', responseChat: 'Chat en Vivo', responseChatTime: 'Disponible 9am-6pm EST', responsePhone: 'Teléfono Empresarial', responsePhoneTime: 'Soporte 24/7 Prioritario',
    technicalSupport: 'Soporte Técnico', technicalDesc: 'Problemas de API, ayuda con integraciones, solución de problemas',
    billingQuestions: 'Preguntas de Facturación', billingDesc: 'Problemas de pago, facturas, cambios de plan',
    generalInquiries: 'Consultas Generales', generalDesc: 'Preguntas de ventas, oportunidades de asociación',
    accountServices: 'Servicios de Cuenta', accountDesc: 'Cambios de cuenta, cancelaciones, eliminaciones',
    knowledgeBase: 'Base de Conocimiento', knowledgeDesc: 'Explorar tutoriales y guías',
    liveChat: 'Chat en Vivo', liveChatDesc: 'Chatea con nuestro equipo de soporte',
    emailSupport: 'Soporte por Email', emailSupportDesc: 'support@frontdeskagents.com',
    enterprisePhone: 'Soporte Empresarial', enterprisePhoneDesc: 'Soporte telefónico 24/7 para Empresas',
    emailUsTitle: 'Escríbenos Directamente', emailUsDesc: 'Para asuntos urgentes, email a nuestro equipo directamente',
    faqTitle: 'Preguntas Frecuentes',
    faqUpgrade: '¿Cómo actualizo mi plan?', faqUpgradeAns: 'Ve a Configuración > Suscripción > Cambiar Plan. Los cambios toman efecto inmediatamente.',
    faqCancel: '¿Puedo cancelar en cualquier momento?', faqCancelAns: 'Sí, cancela en cualquier momento desde la configuración de tu cuenta. Sin preguntas.',
    faqResetPassword: '¿Cómo restauro mi contraseña?', faqResetAns: 'Haz clic en Olvidé mi Contraseña en la página de inicio de sesión y sigue las instrucciones.',
    faqIntegrations: '¿Qué integraciones soportan?', faqIntegrationsAns: 'Soportamos pagos, SMS, voz IA, Google Calendar, y más. Ver nuestros docs de integración.',
    footerPrivacy: 'Política de Privacidad', footerTerms: 'Términos de Servicio', footerContact: 'Contacto',
    thankYou: '¡Mensaje Enviado!', thankYouDesc: 'Gracias por contactarnos. Te responderemos dentro de 24 horas.',
    sendAnother: 'Enviar otro mensaje',
    selectTopic: 'Selecciona un tema...', topicTechnical: 'Soporte Técnico', topicBilling: 'Pregunta de Facturación', topicSales: 'Consulta de Ventas', topicAccount: 'Servicios de Cuenta', topicFeedback: 'Comentarios del Producto', topicOther: 'Otro',
    placeholderName: 'Jane Smith', placeholderEmail: 'jane@company.com', placeholderMessage: 'Cuéntanos cómo podemos ayudar...'
  },
  fr: {
    headerTitle: 'Contact Support', headerSubtitle: 'Contactez notre équipe. Nous répondons généralement dans les 24 heures, ou choisissez une option ci-dessous pour une assistance plus rapide.',
    sendMessage: 'Envoyez-nous un message', yourName: 'Votre Nom', emailAddress: 'Adresse Email', subject: 'Sujet', message: 'Message', sendBtn: 'Envoyer le Message', sending: 'Envoi en cours...',
    quickHelp: 'Aide Rapide', browseByTopic: 'Parcourir par Sujet',
    responseEmail: 'Réponse par Email', responseEmailTime: 'Dans les 24 heures', responseChat: 'Chat en Direct', responseChatTime: 'Disponible 9h-18h EST', responsePhone: 'Téléphone Entreprise', responsePhoneTime: 'Support Prioritaire 24/7',
    technicalSupport: 'Support Technique', technicalDesc: 'Problèmes API, aide à l intégration, dépannage',
    billingQuestions: 'Questions de Facturation', billingDesc: 'Problèmes de paiement, factures, changements de plan',
    generalInquiries: 'Demandes Générales', generalDesc: 'Questions de vente, opportunités de partenariat',
    accountServices: 'Services de Compte', accountDesc: 'Changements de compte, annulations, suppressions',
    knowledgeBase: 'Base de Connaissances', knowledgeDesc: 'Parcourir les tutoriels et guides',
    liveChat: 'Chat en Direct', liveChatDesc: 'Discutez avec notre équipe de support',
    emailSupport: 'Support Email', emailSupportDesc: 'support@frontdeskagents.com',
    enterprisePhone: 'Support Entreprise', enterprisePhoneDesc: 'Support téléphonique 24/7 pour Enterprise',
    emailUsTitle: 'Email Nous Directement', emailUsDesc: 'Pour les affaires urgentes, email notre équipe directement',
    faqTitle: 'Questions Fréquemment Posées',
    faqUpgrade: 'Comment mettre à niveau mon plan?', faqUpgradeAns: 'Allez dans Paramètres > Abonnement > Changer de Plan. Les changements prennent effet immédiatement.',
    faqCancel: 'Puis-je annuler à tout moment?', faqCancelAns: 'Oui, annulez à tout moment depuis les paramètres de votre compte. Sans questions.',
    faqResetPassword: 'Comment réinitialiser mon mot de passe?', faqResetAns: 'Cliquez sur Mot de Passe Oublié sur la page de connexion et suivez les instructions.',
    faqIntegrations: 'Quelles intégrations supportez-vous?', faqIntegrationsAns: 'Nous supportons les paiements, SMS, voix IA, Google Calendar, et plus. Voir nos docs d intégration.',
    footerPrivacy: 'Politique de Confidentialité', footerTerms: 'Conditions d Utilisation', footerContact: 'Contact',
    thankYou: 'Message Envoyé!', thankYouDesc: 'Merci de nous avoir contactés. Nous reviendrons vers vous dans les 24 heures.',
    sendAnother: 'Envoyer un autre message',
    selectTopic: 'Sélectionnez un sujet...', topicTechnical: 'Support Technique', topicBilling: 'Question de Facturation', topicSales: 'Demande de Vente', topicAccount: 'Services de Compte', topicFeedback: 'Retour sur le Produit', topicOther: 'Autre',
    placeholderName: 'Jean Dupont', placeholderEmail: 'jean@entreprise.com', placeholderMessage: 'Dites-nous comment nous pouvons vous aider...'
  },
  zh: {
    headerTitle: '联系支持', headerSubtitle: '联系我们的团队。我们通常会在24小时内回复，或者选择以下选项以获得更快的帮助。',
    sendMessage: '给我们发消息', yourName: '您的姓名', emailAddress: '电子邮件地址', subject: '主题', message: '消息', sendBtn: '发送消息', sending: '发送中...',
    quickHelp: '快速帮助', browseByTopic: '按主题浏览',
    responseEmail: '邮件回复', responseEmailTime: '24小时内', responseChat: '在线聊天', responseChatTime: '可用时间 9am-6pm EST', responsePhone: '企业电话', responsePhoneTime: '24/7优先支持',
    technicalSupport: '技术支持', technicalDesc: 'API问题、集成帮助、故障排除',
    billingQuestions: '账单问题', billingDesc: '支付问题、发票、计划变更',
    generalInquiries: '一般咨询', generalDesc: '销售问题、合作伙伴机会',
    accountServices: '账户服务', accountDesc: '账户更改、取消、删除',
    knowledgeBase: '知识库', knowledgeDesc: '浏览教程和指南',
    liveChat: '在线聊天', liveChatDesc: '与我们的支持团队聊天',
    emailSupport: '邮件支持', emailSupportDesc: 'support@frontdeskagents.com',
    enterprisePhone: '企业支持', enterprisePhoneDesc: '企业24/7电话支持',
    emailUsTitle: '直接给我们发邮件', emailUsDesc: '如需紧急事项，请直接给我们的团队发邮件',
    faqTitle: '常见问题',
    faqUpgrade: '如何升级我的计划？', faqUpgradeAns: '前往设置 > 订阅 > 更改计划。更改立即生效。',
    faqCancel: '我可以随时取消吗？', faqCancelAns: '是的，可随时从您的账户设置中取消。无需提问。',
    faqResetPassword: '如何重置密码？', faqResetAns: '在登录页面点击忘记密码并按照说明操作。',
    faqIntegrations: '你们支持哪些集成？', faqIntegrationsAns: '我们支持支付、短信、语音AI、Google日历等。查看我们的集成文档。',
    footerPrivacy: '隐私政策', footerTerms: '服务条款', footerContact: '联系我们',
    thankYou: '消息已发送！', thankYouDesc: '感谢您联系我们。我们将在24小时内回复。',
    sendAnother: '发送另一条消息',
    selectTopic: '选择一个主题...', topicTechnical: '技术支持', topicBilling: '账单问题', topicSales: '销售咨询', topicAccount: '账户服务', topicFeedback: '产品反馈', topicOther: '其他',
    placeholderName: '张明', placeholderEmail: 'zhang@company.com', placeholderMessage: '告诉我们我们可以如何帮助您...'
  },
  hi: {
    headerTitle: 'संपर्क सहायता', headerSubtitle: 'हमारी टीम से संपर्क करें। हम आमतौर पर 24 घंटों के भीतर जवाब देते हैं, या तेज सहायता के लिए नीचे एक विकल्प चुनें।',
    sendMessage: 'हमें संदेश भेजें', yourName: 'आपका नाम', emailAddress: 'ईमेल पता', subject: 'विषय', message: 'संदेश', sendBtn: 'संदेश भेजें', sending: 'भेज रहे हैं...',
    quickHelp: 'त्वरित सहायता', browseByTopic: 'विषय के अनुसार ब्राउज़ करें',
    responseEmail: 'ईमेल प्रतिक्रिया', responseEmailTime: '24 घंटों के भीतर', responseChat: 'लाइव चैट', responseChatTime: 'सुबह 9 बजे से शाम 6 बजे तक उपलब्ध', responsePhone: 'एंटरप्राइज फोन', responsePhoneTime: '24/7 प्राथमिकता समर्थन',
    technicalSupport: 'तकनीकी सहायता', technicalDesc: 'API मुद्दे, एकीकरण सहायता, समस्या निवारण',
    billingQuestions: 'बिलिंग प्रश्न', billingDesc: 'भुगतान मुद्दे, चालान, योजना परिवर्तन',
    generalInquiries: 'सामान्य पूछताछ', generalDesc: 'बिक्री प्रश्न, साझेदारी के अवसर',
    accountServices: 'खाता सेवाएं', accountDesc: 'खाता परिवर्तन, रद्दीकरण, विलोपन',
    knowledgeBase: 'ज्ञान आधार', knowledgeDesc: 'ट्यूटोरियल और गाइड ब्राउज़ करें',
    liveChat: 'लाइव चैट', liveChatDesc: 'हमारी सहायता टीम के साथ चैट करें',
    emailSupport: 'ईमेल समर्थन', emailSupportDesc: 'support@frontdeskagents.com',
    enterprisePhone: 'एंटरप्राइज समर्थन', enterprisePhoneDesc: 'एंटरप्राइज के लिए 24/7 फोन समर्थन',
    emailUsTitle: 'हमें सीधे ईमेल करें', emailUsDesc: 'तत्काल मामलों के लिए, सीधे हमारी टीम को ईमेल करें',
    faqTitle: 'अक्सर पूछे जाने वाले प्रश्न',
    faqUpgrade: 'मैं अपनी योजना को कैसे अपग्रेड करूं?', faqUpgradeAns: 'सेटिंग्स > सदस्यता > योजना बदलें पर जाएं। परिवर्तन तुरंत प्रभावी होते हैं।',
    faqCancel: 'क्या मैं कभी भी रद्द कर सकता हूं?', faqCancelAns: 'हां, अपनी खाता सेटिंग्स से कभी भी रद्द करें। कोई सवाल नहीं पूछा जाता।',
    faqResetPassword: 'मैं अपना पासवर्ड कैसे रीसेट करूं?', faqResetAns: 'लॉगिन पेज पर पासवर्ड भूल गए पर क्लिक करें और निर्देशों का पालन करें।',
    faqIntegrations: 'आप कौन से एकीकरण का समर्थन करते हैं?', faqIntegrationsAns: 'हम भुगतान, SMS, वॉइस AI, Google कैलेंडर और बहुत कुछ समर्थन करते हैं। हमारे एकीकरण डॉक्स देखें।',
    footerPrivacy: 'गोपनीयता नीति', footerTerms: 'सेवा की शर्तें', footerContact: 'संपर्क करें',
    thankYou: 'संदेश भेजा गया!', thankYouDesc: 'हमसे संपर्क करने के लिए धन्यवाद। हम 24 घंटों के भीतर आपसे संपर्क करेंगे।',
    sendAnother: 'एक और संदेश भेजें',
    selectTopic: 'एक विषय चुनें...', topicTechnical: 'तकनीकी सहायता', topicBilling: 'बिलिंग प्रश्न', topicSales: 'बिक्री पूछताछ', topicAccount: 'खाता सेवाएं', topicFeedback: 'उत्पाद प्रतिक्रिया', topicOther: 'अन्य',
    placeholderName: 'जय सिंह', placeholderEmail: 'jay@company.com', placeholderMessage: 'हमें बताएं कि हम कैसे मदद कर सकते हैं...'
  },
  ar: {
    headerTitle: 'اتصل بالدعم', headerSubtitle: 'تواصل مع فريقنا. نرد عادةً خلال 24 ساعة، أو اختر خيارًا أدناه للحصول على مساعدة أسرع.',
    sendMessage: 'أرسل لنا رسالة', yourName: 'اسمك', emailAddress: 'البريد الإلكتروني', subject: 'الموضوع', message: 'الرسالة', sendBtn: 'إرسال الرسالة', sending: 'جاري الإرسال...',
    quickHelp: 'مساعدة سريعة', browseByTopic: 'تصفح حسب الموضوع',
    responseEmail: 'استجابة البريد الإلكتروني', responseEmailTime: 'خلال 24 ساعة', responseChat: 'الدردشة المباشرة', responseChatTime: 'متاحة 9 صباحًا - 6 مساءً بتوقيت شرق الولايات المتحدة', responsePhone: 'هاتف المؤسسة', responsePhoneTime: 'دعم أولوي على مدار الساعة',
    technicalSupport: 'الدعم الفني', technicalDesc: 'مشاكل API، مساعدة في التكامل، استكشاف الأخطاء وإصلاحها',
    billingQuestions: 'أسئلة الفوترة', billingDesc: 'مشاكل الدفع، الفواتير، تغييرات الخطة',
    generalInquiries: 'الاستفسارات العامة', generalDesc: 'أسئلة المبيعات، فرص الشراكة',
    accountServices: 'خدمات الحساب', accountDesc: 'تغييرات الحساب، الإلغاء، الحذف',
    knowledgeBase: 'قاعدة المعرفة', knowledgeDesc: 'تصفح البرامج التعليمية والأدلة',
    liveChat: 'الدردشة المباشرة', liveChatDesc: 'تحدث مع فريق الدعم لدينا',
    emailSupport: 'دعم البريد الإلكتروني', emailSupportDesc: 'support@frontdeskagents.com',
    enterprisePhone: 'دعم المؤسسة', enterprisePhoneDesc: 'دعم هاتفي على مدار الساعة للمؤسسات',
    emailUsTitle: 'راسلنا مباشرة', emailUsDesc: 'للمسائل العاجلة، راسل فريقنا مباشرة',
    faqTitle: 'الأسئلة الشائعة',
    faqUpgrade: 'كيف أقوم ترقية خطتي؟', faqUpgradeAns: 'انتقل إلى الإعدادات > الاشتراك > تغيير الخطة. تسري التغييرات فورًا.',
    faqCancel: 'هل يمكنني الإلغاء في أي وقت؟', faqCancelAns: 'نعم، قم بالإلغاء في أي وقت من إعدادات حسابك. لا أسئلة مطلوبة.',
    faqResetPassword: 'كيف أعيد تعيين كلمة المرور؟', faqResetAns: 'انقر على نسيت كلمة المرور في صفحة تسجيل الدخول واتبع التعليمات.',
    faqIntegrations: 'ما هي عمليات التكامل التي تدعمونها؟', faqIntegrationsAns: 'ندعم المدفوعات، الرسائل النصية، صوت الذكاء الاصطناعي، تقويم جوجل والمزيد. راجع وثائق التكامل لدينا.',
    footerPrivacy: 'سياسة الخصوصية', footerTerms: 'شروط الخدمة', footerContact: 'اتصل بنا',
    thankYou: 'تم إرسال الرسالة!', thankYouDesc: 'شكرًا لتواصلك معنا. سنرد عليك في خلال 24 ساعة.',
    sendAnother: 'إرسال رسالة أخرى',
    selectTopic: 'اختر موضوعًا...', topicTechnical: 'الدعم الفني', topicBilling: 'سؤال الفوترة', topicSales: 'استفسار المبيعات', topicAccount: 'خدمات الحساب', topicFeedback: 'ملاحظات المنتج', topicOther: 'أخرى',
    placeholderName: 'أحمد محمد', placeholderEmail: 'ahmed@company.com', placeholderMessage: 'أخبرنا كيف يمكننا مساعدتك...'
  },
  pt: {
    headerTitle: 'Contato Suporte', headerSubtitle: 'Entre em contato com nossa equipe. Normalmente respondemos dentro de 24 horas, ou escolha uma opção abaixo para assistance mais rápida.',
    sendMessage: 'Envie-nos uma mensagem', yourName: 'Seu Nome', emailAddress: 'Endereço de Email', subject: 'Assunto', message: 'Mensagem', sendBtn: 'Enviar Mensagem', sending: 'Enviando...',
    quickHelp: 'Ajuda Rápida', browseByTopic: 'Navegar por Tópico',
    responseEmail: 'Resposta por Email', responseEmailTime: 'Dentro de 24 horas', responseChat: 'Chat ao Vivo', responseChatTime: 'Disponível 9h-18h EST', responsePhone: 'Telefone Empresarial', responsePhoneTime: 'Suporte Prioritário 24/7',
    technicalSupport: 'Suporte Técnico', technicalDesc: 'Problemas de API, ajuda com integração, solução de problemas',
    billingQuestions: 'Perguntas de Faturamento', billingDesc: 'Problemas de pagamento, faturas, mudanças de plano',
    generalInquiries: 'Consultas Gerais', generalDesc: 'Perguntas de vendas, oportunidades de parceria',
    accountServices: 'Serviços de Conta', accountDesc: 'Mudanças de conta, cancelamentos, exclusões',
    knowledgeBase: 'Base de Conhecimento', knowledgeDesc: 'Navegue tutoriais e guias',
    liveChat: 'Chat ao Vivo', liveChatDesc: 'Converse com nossa equipe de suporte',
    emailSupport: 'Suporte por Email', emailSupportDesc: 'support@frontdeskagents.com',
    enterprisePhone: 'Suporte Empresarial', enterprisePhoneDesc: 'Suporte telefônico 24/7 para Empresas',
    emailUsTitle: 'Nos Envie um Email Diretamente', emailUsDesc: 'Para assuntos urgentes, email nossa equipe diretamente',
    faqTitle: 'Perguntas Frequentes',
    faqUpgrade: 'Como faço para atualizar meu plano?', faqUpgradeAns: 'Vá para Configurações > Assinatura > Alterar Plano. As alterações têm efeito imediato.',
    faqCancel: 'Posso cancelar a qualquer momento?', faqCancelAns: 'Sim, cancele a qualquer momento nas configurações da sua conta. Sem perguntas.',
    faqResetPassword: 'Como reseto minha senha?', faqResetAns: 'Clique em Esqueci a Senha na página de login e siga as instruções.',
    faqIntegrations: 'Quais integrações vocês suportam?', faqIntegrationsAns: 'Suportamos pagamentos, SMS, voz IA, Google Calendar e mais. Veja nossos docs de integração.',
    footerPrivacy: 'Política de Privacidade', footerTerms: 'Termos de Serviço', footerContact: 'Contato',
    thankYou: 'Mensagem Enviada!', thankYouDesc: 'Obrigado por nos contatar. Voltaremos para você em até 24 horas.',
    sendAnother: 'Enviar outra mensagem',
    selectTopic: 'Selecione um tópico...', topicTechnical: 'Suporte Técnico', topicBilling: 'Pergunta de Faturamento', topicSales: 'Consulta de Vendas', topicAccount: 'Serviços de Conta', topicFeedback: 'Feedback do Produto', topicOther: 'Outro',
    placeholderName: 'João Silva', placeholderEmail: 'joao@company.com', placeholderMessage: 'Conte-nos como podemos ajudar...'
  },
  ko: {
    headerTitle: '연락처 지원', headerSubtitle: '저희 팀에 연락하세요. 일반적으로 24시간 이내에 답변하며, 더 빠른 도움을 받으려면 아래 옵션을 선택하세요.',
    sendMessage: '저에게 메시지 보내기', yourName: '이름', emailAddress: '이메일 주소', subject: '제목', message: '메시지', sendBtn: '메시지 보내기', sending: '보내는 중...',
    quickHelp: '빠른 도움말', browseByTopic: '주제별 찾아보기',
    responseEmail: '이메일 응답', responseEmailTime: '24시간 이내', responseChat: '라이브 채팅', responseChatTime: '오전 9시 - 오후 6시 EST', responsePhone: '기업 전화', responsePhoneTime: '24/7 우선 지원',
    technicalSupport: '기술 지원', technicalDesc: 'API 문제, 통합 도움, 문제 해결',
    billingQuestions: '결제 질문', billingDesc: '결제 문제, 송장, 플랜 변경',
    generalInquiries: '일반 문의', generalDesc: '판매 질문, 파트너십 기회',
    accountServices: '계정 서비스', accountDesc: '계정 변경, 취소, 삭제',
    knowledgeBase: '지식 기반', knowledgeDesc: '자습서 및 가이드 찾아보기',
    liveChat: '라이브 채팅', liveChatDesc: '저희 지원 팀과 채팅',
    emailSupport: '이메일 지원', emailSupportDesc: 'support@frontdeskagents.com',
    enterprisePhone: '기업 지원', enterprisePhoneDesc: '기업을 위한 24/7 전화 지원',
    emailUsTitle: '직접 이메일 보내기', emailUsDesc: '긴급한 사항은 직접 저희 팀에게 이메일 보내주세요',
    faqTitle: '자주 묻는 질문',
    faqUpgrade: '플랜을 업그레이드하려면 어떻게 해야 하나요?', faqUpgradeAns: '설정 > 구독 > 플랜 변경으로 이동하세요. 변경 사항은 즉시 적용됩니다.',
    faqCancel: '언제든지 취소할 수 있나요?', faqCancelAns: '네, 계정 설정에서 언제든지 취소할 수 있습니다. 질문 없음.',
    faqResetPassword: '비밀번호를 재설정하려면 어떻게 해야 하나요?', faqResetAns: '로그인 페이지에서 비밀번호 찾기를 클릭하고 지침을 따르세요.',
    faqIntegrations: '어떤 통합을 지원하나요?', faqIntegrationsAns: '결제, SMS, 음성 AI, Google 캘린더 등을 지원합니다. 통합 문서를 참조하세요.',
    footerPrivacy: '개인정보 보호정책', footerTerms: '서비스 약관', footerContact: '문의하기',
    thankYou: '메시지가 전송되었습니다!', thankYouDesc: '문의해 주셔서 감사합니다. 24시간 내에返信해 드리겠습니다.',
    sendAnother: '다른 메시지 보내기',
    selectTopic: '주제 선택...', topicTechnical: '기술 지원', topicBilling: '결제 질문', topicSales: '판매 문의', topicAccount: '계정 서비스', topicFeedback: '제품 피드백', topicOther: '기타',
    placeholderName: '김철수', placeholderEmail: 'chul@company.com', placeholderMessage: '어떻게 도와드릴 수 있는지 알려주세요...'
  },
  ja: {
    headerTitle: 'お問い合わせ', headerSubtitle: 'チームにお問い合わせください。通常24時間以内に回答するか、より迅速なサポートについては以下のオプションを選択してください。',
    sendMessage: 'メッセージを送る', yourName: 'お名前', emailAddress: 'メールアドレス', subject: '件名', message: 'メッセージ', sendBtn: 'メッセージを送る', sending: '送信中...',
    quickHelp: 'クイックヘルプ', browseByTopic: 'トピック別に参照',
    responseEmail: 'メール応答', responseEmailTime: '24時間以内', responseChat: 'ライブチャット', responseChatTime: '東部時間午前9時〜午後6時', responsePhone: 'エンタープライズ電話', responsePhoneTime: '24/7優先サポート',
    technicalSupport: '技術サポート', technicalDesc: 'API問題、統合ヘルプ、トラブルシューティング',
    billingQuestions: '請求に関する質問', billingDesc: '支払い問題、請求書、プラン変更',
    generalInquiries: '一般的なお問い合わせ', generalDesc: '販売質問、パートナーシップの機会',
    accountServices: 'アカウントサービス', accountDesc: 'アカウント変更、解約、削除',
    knowledgeBase: 'ナレッジベース', knowledgeDesc: 'チュートリアルとガイドを参照',
    liveChat: 'ライブチャット', liveChatDesc: 'サポートチームとチャット',
    emailSupport: 'メールサポート', emailSupportDesc: 'support@frontdeskagents.com',
    enterprisePhone: 'エンタープライズサポート', enterprisePhoneDesc: 'エンタープライズ向け24/7電話サポート',
    emailUsTitle: 'に直接メールを送る', emailUsDesc: '緊急の場合は、チームに直接メールをお送りください',
    faqTitle: 'よくある質問',
    faqUpgrade: 'プランをアップグレードするにはどうすればいいですか？', faqUpgradeAns: '設定 > サブスクリプション > プラン変更に移動してください。変更は即時有効になります。',
    faqCancel: 'いつでもキャンセルできますか？', faqCancelAns: 'はい、アカウント設定からいつでもキャンセルできます。質問はありません。',
    faqResetPassword: 'パスワードをリセットするにはどうすればいいですか？', faqResetAns: 'ログインページでパスワードをお忘れをクリックして手順に従ってください。',
    faqIntegrations: 'どのような統合をサポートしていますか？', faqIntegrationsAns: '支払い、SMS、音声AI、Googleカレンダーなどをサポートしています。統合ドキュメントをご覧ください。',
    footerPrivacy: 'プライバシーポリシー', footerTerms: '利用規約', footerContact: 'お問い合わせ',
    thankYou: 'メッセージが送信されました！', thankYouDesc: 'お問い合わせありがとうございます。24時間以内にご連絡いたします。',
    sendAnother: '別のメッセージを送る',
    selectTopic: 'トピックを選択...', topicTechnical: '技術サポート', topicBilling: '請求に関する質問', topicSales: '販売お問い合わせ', topicAccount: 'アカウントサービス', topicFeedback: '製品フィードバック', topicOther: 'その他',
    placeholderName: '山田太郎', placeholderEmail: 'taro@company.com', placeholderMessage: 'どのようにお手伝いできるかお知らせください...'
  },
  vi: {
    headerTitle: 'Liên Hệ Hỗ Trợ', headerSubtitle: 'Liên hệ với đội ngũ của chúng tôi. Chúng tôi thường phản hồi trong vòng 24 giờ, hoặc chọn tùy chọn bên dưới để được hỗ trợ nhanh hơn.',
    sendMessage: 'Gửi cho chúng tôi một tin nhắn', yourName: 'Tên Của Bạn', emailAddress: 'Địa Chỉ Email', subject: 'Chủ Đề', message: 'Tin Nhắn', sendBtn: 'Gửi Tin Nhắn', sending: 'Đang gửi...',
    quickHelp: 'Trợ Giúp Nhanh', browseByTopic: 'Duyệt theo Chủ Đề',
    responseEmail: 'Phản Hồi Email', responseEmailTime: 'Trong vòng 24 giờ', responseChat: 'Chat Trực Tuyến', responseChatTime: 'Có sẵn 9 sáng - 6 chiều EST', responsePhone: 'Điện Thoại Doanh Nghiệp', responsePhoneTime: 'Hỗ Trợ Ưu Tiên 24/7',
    technicalSupport: 'Hỗ Trợ Kỹ Thuật', technicalDesc: 'Vấn đề API, trợ giúp tích hợp, khắc phục sự cố',
    billingQuestions: 'Câu Hỏi Thanh Toán', billingDesc: 'Vấn đề thanh toán, hóa đơn, thay đổi kế hoạch',
    generalInquiries: 'Giải Đáp Chung', generalDesc: 'Câu hỏi bán hàng, cơ hội đối tác',
    accountServices: 'Dịch Vụ Tài Khoản', accountDesc: 'Thay đổi tài khoản, hủy, xóa',
    knowledgeBase: 'Cơ Sở Kiến Thức', knowledgeDesc: 'Duyệt hướng dẫn và bài viết',
    liveChat: 'Chat Trực Tuyến', liveChatDesc: 'Trò chuyện với đội ngũ hỗ trợ',
    emailSupport: 'Hỗ Trợ Email', emailSupportDesc: 'support@frontdeskagents.com',
    enterprisePhone: 'Hỗ Trợ Doanh Nghiệp', enterprisePhoneDesc: 'Hỗ trợ điện thoại 24/7 cho Doanh nghiệp',
    emailUsTitle: 'Gửi Email Cho Chúng Tôi Trực Tiếp', emailUsDesc: 'Đối với vấn đề khẩn cấp, email trực tiếp cho đội ngũ của chúng tôi',
    faqTitle: 'Các Câu Hỏi Thường Gặp',
    faqUpgrade: 'Làm thế nào để nâng cấp kế hoạch của tôi?', faqUpgradeAns: 'Đi tới Cài đặt > Đăng ký > Đổi Kế hoạch. Thay đổi có hiệu lực ngay.',
    faqCancel: 'Tôi có thể hủy bất cứ lúc nào không?', faqCancelAns: 'Có, hủy bất cứ lúc nào từ cài đặt tài khoản của bạn. Không câu hỏi.',
    faqResetPassword: 'Làm thế nào để đặt lại mật khẩu?', faqResetAns: 'Nhấp vào Quên Mật khẩu trên trang đăng nhập và làm theo hướng dẫn.',
    faqIntegrations: 'Những tích hợp nào được hỗ trợ?', faqIntegrationsAns: 'Chúng tôi hỗ trợ thanh toán, SMS, giọng AI, Google Calendar, và hơn thế. Xem tài liệu tích hợp của chúng tôi.',
    footerPrivacy: 'Chính sách Bảo mật', footerTerms: 'Điều khoản Dịch vụ', footerContact: 'Liên hệ',
    thankYou: 'Tin Nhắn Đã Gửi!', thankYouDesc: 'Cảm ơn bạn đã liên hệ. Chúng tôi sẽ liên hệ lại trong vòng 24 giờ.',
    sendAnother: 'Gửi tin nhắn khác',
    selectTopic: 'Chọn một chủ đề...', topicTechnical: 'Hỗ Trợ Kỹ Thuật', topicBilling: 'Câu Hỏi Thanh Toán', topicSales: 'Giải Đáp Bán Hàng', topicAccount: 'Dịch Vụ Tài Khoản', topicFeedback: 'Phản Hồi Sản Phẩm', topicOther: 'Khác',
    placeholderName: 'Nguyễn Văn A', placeholderEmail: 'van@company.com', placeholderMessage: 'Cho chúng tôi biết chúng tôi có thể giúp gì...'
  },
  tl: {
    headerTitle: 'Makipag-ugnayan sa Suporta', headerSubtitle: 'Makipag-ugnayan sa aming team. Karaniwang nirereply kami sa loob ng 24 na oras, o pumili ng option sa ibaba para sa mas mabilis na tulong.',
    sendMessage: 'Magpadala sa amin ng mensahe', yourName: 'Iyong Pangalan', emailAddress: 'Email Address', subject: 'Paksa', message: 'Mensaje', sendBtn: 'Magpadala ng Mensaje', sending: 'Nagpapadala...',
    quickHelp: 'Mabilis na Tulong', browseByTopic: 'Mag-browse ayon sa Topic',
    responseEmail: 'Email Response', responseEmailTime: 'Sa loob ng 24 na oras', responseChat: 'Live Chat', responseChatTime: 'Available 9am-6pm EST', responsePhone: 'Enterprise Phone', responsePhoneTime: '24/7 Priority Support',
    technicalSupport: 'Technical Support', technicalDesc: 'API issues, integration help, troubleshooting',
    billingQuestions: 'Billing Questions', billingDesc: 'Payment issues, invoices, plan changes',
    generalInquiries: 'General Inquiries', generalDesc: 'Sales questions, partnership opportunities',
    accountServices: 'Account Services', accountDesc: 'Account changes, cancellations, deletions',
    knowledgeBase: 'Knowledge Base', knowledgeDesc: 'Browse tutorials and guides',
    liveChat: 'Live Chat', liveChatDesc: 'Chat with our support team',
    emailSupport: 'Email Support', emailSupportDesc: 'support@frontdeskagents.com',
    enterprisePhone: 'Enterprise Support', enterprisePhoneDesc: '24/7 phone support for Enterprise',
    emailUsTitle: 'Email Kami Direktang', emailUsDesc: 'Para sa mga urgenteng matters, email directly ang aming team',
    faqTitle: 'Mga Madalas na Tanong',
    faqUpgrade: 'Paano ko i-upgrade ang plan ko?', faqUpgradeAns: 'Pumunta sa Settings > Subscription > Change Plan. Ang mga changes ay effective kaagad.',
    faqCancel: 'Puwedeng mag-cancel kahit kailan?', faqCancelAns: 'Opo, mag-cancel kahit kailan mula sa iyong account settings. Walang tanong.',
    faqResetPassword: 'Paano ko i-reset ang password ko?', faqResetAns: 'Mag-click ng Forgot Password sa login page at sundin ang instructions.',
    faqIntegrations: 'Anong integrations ang supported?', faqIntegrationsAns: 'Supported namin ang payments, SMS, voice AI, Google Calendar, at higit pa. Tingnan ang aming integration docs.',
    footerPrivacy: 'Privacy Policy', footerTerms: 'Terms of Service', footerContact: 'Makipag-ugnayan',
    thankYou: 'Message Sent!', thankYouDesc: 'Salamat sa pag-contact sa amin. Babalik kami sa iyo sa loob ng 24 na oras.',
    sendAnother: 'Magpadala ng isa pang mensahe',
    selectTopic: 'Pumili ng topic...', topicTechnical: 'Technical Support', topicBilling: 'Billing Question', topicSales: 'Sales Inquiry', topicAccount: 'Account Services', topicFeedback: 'Product Feedback', topicOther: 'Iba pa',
    placeholderName: 'Juan Cruz', placeholderEmail: 'juan@company.com', placeholderMessage: 'Sabihin sa amin kung paano kami makakatulong...'
  },
  de: {
    headerTitle: 'Kontakt Support', headerSubtitle: 'Kontaktieren Sie unser Team. Wir antworten normalerweise innerhalb von 24 Stunden, oder wählen Sie unten eine Option für schnellere Hilfe.',
    sendMessage: 'Schreiben Sie uns', yourName: 'Ihr Name', emailAddress: 'E-Mail-Adresse', subject: 'Betreff', message: 'Nachricht', sendBtn: 'Nachricht Senden', sending: 'Wird gesendet...',
    quickHelp: 'Schnelle Hilfe', browseByTopic: 'Nach Thema durchsuchen',
    responseEmail: 'E-Mail-Antwort', responseEmailTime: 'Innerhalb von 24 Stunden', responseChat: 'Live-Chat', responseChatTime: 'Verfügbar 9-18 Uhr EST', responsePhone: 'Enterprise-Telefon', responsePhoneTime: '24/7 Prioritäts-Support',
    technicalSupport: 'Technischer Support', technicalDesc: 'API-Probleme, Integrationshilfe, Fehlerbehebung',
    billingQuestions: 'Abrechnungsfragen', billingDesc: 'Zahlungsprobleme, Rechnungen, Planänderungen',
    generalInquiries: 'Allgemeine Anfragen', generalDesc: 'Vertriebsfragen, Partnerschaftsmöglichkeiten',
    accountServices: 'Kontoservices', accountDesc: 'Kontoänderungen, Kündigungen, Löschungen',
    knowledgeBase: 'Wissensdatenbank', knowledgeDesc: 'Tutorials und Anleitungen durchsuchen',
    liveChat: 'Live-Chat', liveChatDesc: 'Chatten Sie mit unserem Support-Team',
    emailSupport: 'E-Mail-Support', emailSupportDesc: 'support@frontdeskagents.com',
    enterprisePhone: 'Enterprise-Support', enterprisePhoneDesc: '24/7 Telefonsupport für Enterprise',
    emailUsTitle: 'Schreiben Sie uns direkt', emailUsDesc: 'Für dringende Angelegenheiten, schreiben Sie unserem Team direkt',
    faqTitle: 'Häufig Gestellte Fragen',
    faqUpgrade: 'Wie upgrade ich meinen Plan?', faqUpgradeAns: 'Gehen Sie zu Einstellungen > Abonnement > Plan ändern. Änderungen werden sofort wirksam.',
    faqCancel: 'Kann ich jederzeit kündigen?', faqCancelAns: 'Ja, kündigen Sie jederzeit über Ihre Kontoeinstellungen. Keine Fragen gestellt.',
    faqResetPassword: 'Wie setze ich mein Passwort zurück?', faqResetAns: 'Klicken Sie auf Passwort vergessen auf der Anmeldeseite und folgen Sie den Anweisungen.',
    faqIntegrations: 'Welche Integrationen werden unterstützt?', faqIntegrationsAns: 'Wir unterstützen Zahlungen, SMS, Sprach-KI, Google Kalender und mehr. Sehen Sie unsere Integrations-docs.',
    footerPrivacy: 'Datenschutzrichtlinie', footerTerms: 'Nutzungsbedingungen', footerContact: 'Kontakt',
    thankYou: 'Nachricht Gesendet!', thankYouDesc: 'Vielen Dank für Ihre Kontaktaufnahme. Wir werden uns innerhalb von 24 Stunden bei Ihnen melden.',
    sendAnother: 'Eine weitere Nachricht senden',
    selectTopic: 'Wählen Sie ein Thema...', topicTechnical: 'Technischer Support', topicBilling: 'Abrechnungsfrage', topicSales: 'Vertriebsanfrage', topicAccount: 'Kontoservices', topicFeedback: 'Produktfeedback', topicOther: 'Andere',
    placeholderName: 'Max Mustermann', placeholderEmail: 'max@company.com', placeholderMessage: 'Sagen Sie uns, wie wir helfen können...'
  },
  it: {
    headerTitle: 'Contattare Supporto', headerSubtitle: 'Mettiti in contatto con il nostro team. Rispondiamo normalmente entro 24 ore, oppure scegli un opzione qui sotto per un assistenza più veloce.',
    sendMessage: 'Inviaci un messaggio', yourName: 'Il Tuo Nome', emailAddress: 'Indirizzo Email', subject: 'Oggetto', message: 'Messaggio', sendBtn: 'Invia Messaggio', sending: 'Invio in corso...',
    quickHelp: 'Aiuto Rapido', browseByTopic: 'Sfoglia per Argomento',
    responseEmail: 'Risposta Email', responseEmailTime: 'Entro 24 ore', responseChat: 'Chat dal Vivo', responseChatTime: 'Disponibile 9-18 EST', responsePhone: 'Telefono Enterprise', responsePhoneTime: 'Supporto Prioritario 24/7',
    technicalSupport: 'Supporto Tecnico', technicalDesc: 'Problemi API, aiuto con integrazione, risoluzione problemi',
    billingQuestions: 'Domande di Fatturazione', billingDesc: 'Problemi di pagamento, fatture, cambi di piano',
    generalInquiries: 'Richieste Generali', generalDesc: 'Domande di vendita, opportunità di partnership',
    accountServices: 'Servizi Account', accountDesc: 'Cambiamenti account, cancellazioni, eliminazioni',
    knowledgeBase: 'Base di Conoscenza', knowledgeDesc: 'Sfoglia tutorial e guide',
    liveChat: 'Chat dal Vivo', liveChatDesc: 'Chatta con il nostro team di supporto',
    emailSupport: 'Supporto Email', emailSupportDesc: 'support@frontdeskagents.com',
    enterprisePhone: 'Supporto Enterprise', enterprisePhoneDesc: 'Supporto telefonico 24/7 per Enterprise',
    emailUsTitle: 'Email Us Direttamente', emailUsDesc: 'Per questioni urgenti, email direttamente il nostro team',
    faqTitle: 'Domande Frequenti',
    faqUpgrade: 'Come faccio ad aggiornare il mio piano?', faqUpgradeAns: 'Vai su Impostazioni > Abbonamento > Cambia Piano. Le modifiche hanno effetto immediato.',
    faqCancel: 'Posso cancellare in qualsiasi momento?', faqCancelAns: 'Sì, cancelli in qualsiasi momento dalle impostazioni del tuo account. Nessuna domanda.',
    faqResetPassword: 'Come resetto la mia password?', faqResetAns: 'Clicca su Password dimenticata nella pagina di login e segui le istruzioni.',
    faqIntegrations: 'Quali integrazioni supportate?', faqIntegrationsAns: 'Supportiamo pagamenti, SMS, voce AI, Google Calendar e altro. Vedi i nostri docs di integrazione.',
    footerPrivacy: 'Politica sulla Privacy', footerTerms: 'Termini di Servizio', footerContact: 'Contatti',
    thankYou: 'Messaggio Inviato!', thankYouDesc: 'Grazie per averci contattato. Ti risponderemo entro 24 ore.',
    sendAnother: 'Invia un altro messaggio',
    selectTopic: 'Seleziona un argomento...', topicTechnical: 'Supporto Tecnico', topicBilling: 'Domanda di Fatturazione', topicSales: 'Richiesta di Vendita', topicAccount: 'Servizi Account', topicFeedback: 'Feedback sul Prodotto', topicOther: 'Altro',
    placeholderName: 'Mario Rossi', placeholderEmail: 'mario@company.com', placeholderMessage: 'Raccontaci come possiamo aiutarti...'
  },
  ru: {
    headerTitle: 'Связаться с Поддержкой', headerSubtitle: 'Свяжитесь с нашей командой. Обычно мы отвечаем в течение 24 часов, или выберите вариант ниже для более быстрой помощи.',
    sendMessage: 'Отправьте нам сообщение', yourName: 'Ваше Имя', emailAddress: 'Адрес Электронной Почты', subject: 'Тема', message: 'Сообщение', sendBtn: 'Отправить Сообщение', sending: 'Отправка...',
    quickHelp: 'Быстрая Помощь', browseByTopic: 'Просмотр по Теме',
    responseEmail: 'Ответ по Email', responseEmailTime: 'В течение 24 часов', responseChat: 'Онлайн Чат', responseChatTime: 'Доступен 9:00-18:00 по восточному времени', responsePhone: 'Корпоративный Телефон', responsePhoneTime: 'Приоритетная поддержка 24/7',
    technicalSupport: 'Техническая Поддержка', technicalDesc: 'Проблемы с API, помощь с интеграцией, устранение неполадок',
    billingQuestions: 'Вопросы по Оплате', billingDesc: 'Проблемы с оплатой, счета, изменения плана',
    generalInquiries: 'Общие Вопросы', generalDesc: 'Вопросы по продажам, возможности партнерства',
    accountServices: 'Услуги Аккаунта', accountDesc: 'Изменения аккаунта, отмена, удаление',
    knowledgeBase: 'База Знаний', knowledgeDesc: 'Просмотр учебников и руководств',
    liveChat: 'Онлайн Чат', liveChatDesc: 'Чат с нашей командой поддержки',
    emailSupport: 'Поддержка по Email', emailSupportDesc: 'support@frontdeskagents.com',
    enterprisePhone: 'Корпоративная Поддержка', enterprisePhoneDesc: 'Телефонная поддержка 24/7 для корпоративных клиентов',
    emailUsTitle: 'Напишите Нам Напрямую', emailUsDesc: 'Для срочных вопросов, пишите напрямую нашей команде',
    faqTitle: 'Часто Задаваемые Вопросы',
    faqUpgrade: 'Как мне обновить мой план?', faqUpgradeAns: 'Перейдите в Настройки > Подписка > Изменить План. Изменения вступают в силу немедленно.',
    faqCancel: 'Могу ли я отменить в любое время?', faqCancelAns: 'Да, отмените в любое время через настройки вашего аккаунта. Без вопросов.',
    faqResetPassword: 'Как сбросить пароль?', faqResetAns: 'Нажмите Забыли пароль на странице входа и следуйте инструкциям.',
    faqIntegrations: 'Какие интеграции вы поддерживаете?', faqIntegrationsAns: 'Мы поддерживаем платежи, SMS, голосовой AI, Google Календарь и многое другое. Смотрите наши документы по интеграции.',
    footerPrivacy: 'Политика Конфиденциальности', footerTerms: 'Условия Использования', footerContact: 'Контакты',
    thankYou: 'Сообщение Отправлено!', thankYouDesc: 'Спасибо за обращение к нам. Мы свяжемся с вами в течение 24 часов.',
    sendAnother: 'Отправить другое сообщение',
    selectTopic: 'Выберите тему...', topicTechnical: 'Техническая Поддержка', topicBilling: 'Вопрос по Оплате', topicSales: 'Запрос по Продажам', topicAccount: 'Услуги Аккаунта', topicFeedback: 'Отзыв о Продукте', topicOther: 'Другое',
    placeholderName: 'Иван Петров', placeholderEmail: 'ivan@company.com', placeholderMessage: 'Расскажите, как мы можем помочь...'
  }
}

import { useRTL } from '../lib/useRTL'

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const { lang: language, setLang, isRTL, handleLanguageChange } = useRTL()

  const t = translations[language] || translations['en']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    await new Promise(resolve => setTimeout(resolve, 1500))
    setSubmitted(true)
    setIsSubmitting(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const supportCategories = [
    { icon: Bot, titleKey: 'technicalSupport', descKey: 'technicalDesc', color: 'text-blue-400', bg: 'bg-blue-500/20' },
    { icon: CreditCard, titleKey: 'billingQuestions', descKey: 'billingDesc', color: 'text-green-400', bg: 'bg-green-500/20' },
    { icon: Headphones, titleKey: 'generalInquiries', descKey: 'generalDesc', color: 'text-purple-400', bg: 'bg-purple-500/20' },
    { icon: FileText, titleKey: 'accountServices', descKey: 'accountDesc', color: 'text-orange-400', bg: 'bg-orange-500/20' },
  ]

  const quickLinks = [
    { icon: HelpCircle, titleKey: 'knowledgeBase', descKey: 'knowledgeDesc' },
    { icon: MessageCircle, titleKey: 'liveChat', descKey: 'liveChatDesc' },
    { icon: Mail, titleKey: 'emailSupport', descKey: 'emailSupportDesc' },
    { icon: Phone, titleKey: 'enterprisePhone', descKey: 'enterprisePhoneDesc' },
  ]

  const faqs = [
    { qKey: 'faqUpgrade', aKey: 'faqUpgradeAns' },
    { qKey: 'faqCancel', aKey: 'faqCancelAns' },
    { qKey: 'faqResetPassword', aKey: 'faqResetAns' },
    { qKey: 'faqIntegrations', aKey: 'faqIntegrationsAns' },
  ]

  return (
    <div className='min-h-screen bg-black text-white' dir={isRTL ? 'rtl' : 'ltr'}>
      <nav className='sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10'>
        <div className='max-w-4xl mx-auto px-6 py-4 flex justify-between items-center'>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center'>
              <Headphones className='w-5 h-5 text-white' />
            </div>
            <span className='font-bold text-lg'>FrontDesk Agents</span>
          </div>
          <div className='flex items-center gap-4'>
            <Link href='/customer/login' className='text-sm text-gray-400 hover:text-white transition'>{t.navSignIn || 'Sign In'}</Link>
            <LanguageSelector currentLang={language} onChange={handleLanguageChange} />
            <Link href='/customer/signup' className='text-sm px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition'>{t.navCta || 'Get Started'}</Link>
          </div>
        </div>
      </nav>

      <main className='max-w-4xl mx-auto px-6 py-12'>
        <div className='text-center mb-12'>
          <div className='inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm font-medium mb-6'>
            <Headphones className='w-4 h-4' />
            <span>{t.quickHelp}</span>
          </div>
          <h1 className='text-4xl md:text-5xl font-bold mb-4'>{t.headerTitle}</h1>
          <p className='text-gray-400 text-lg max-w-2xl mx-auto'>{t.headerSubtitle}</p>
        </div>

        <div className='bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 border border-green-500/20 rounded-2xl p-6 mb-12'>
          <div className='flex flex-wrap justify-center gap-8'>
            <div className='flex items-center gap-3'>
              <Clock className='w-6 h-6 text-green-400' />
              <div><div className='font-bold'>{t.responseEmail}</div><div className='text-sm text-gray-400'>{t.responseEmailTime}</div></div>
            </div>
            <div className='flex items-center gap-3'>
              <MessageCircle className='w-6 h-6 text-blue-400' />
              <div><div className='font-bold'>{t.responseChat}</div><div className='text-sm text-gray-400'>{t.responseChatTime}</div></div>
            </div>
            <div className='flex items-center gap-3'>
              <Phone className='w-6 h-6 text-purple-400' />
              <div><div className='font-bold'>{t.responsePhone}</div><div className='text-sm text-gray-400'>{t.responsePhoneTime}</div></div>
            </div>
          </div>
        </div>

        <div className='grid lg:grid-cols-3 gap-12'>
          <div className='lg:col-span-2'>
            <div className='bg-white/5 border border-white/10 rounded-2xl p-8'>
              <h2 className='text-2xl font-bold mb-6'>{t.sendMessage}</h2>

              {submitted ? (
                <div className='text-center py-12'>
                  <div className='w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4'>
                    <CheckCircle className='w-8 h-8 text-green-400' />
                  </div>
                  <h3 className='text-xl font-bold mb-2'>{t.thankYou}</h3>
                  <p className='text-gray-400 mb-6'>{t.thankYouDesc}</p>
                  <button onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', subject: '', message: '' }) }} className='text-green-400 hover:text-green-300 transition'>{t.sendAnother}</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className='space-y-6'>
                  <div className='grid md:grid-cols-2 gap-6'>
                    <div>
                      <label htmlFor='name' className='block text-sm font-medium mb-2'>{t.yourName}</label>
                      <input type='text' id='name' name='name' value={formData.name} onChange={handleChange} required className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 transition' placeholder={t.placeholderName} />
                    </div>
                    <div>
                      <label htmlFor='email' className='block text-sm font-medium mb-2'>{t.emailAddress}</label>
                      <input type='email' id='email' name='email' value={formData.email} onChange={handleChange} required className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 transition' placeholder={t.placeholderEmail} />
                    </div>
                  </div>
                  <div>
                    <label htmlFor='subject' className='block text-sm font-medium mb-2'>{t.subject}</label>
                    <select id='subject' name='subject' value={formData.subject} onChange={handleChange} required className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 transition cursor-pointer'>
                      <option value=''>{t.selectTopic}</option>
                      <option value='technical'>{t.topicTechnical}</option>
                      <option value='billing'>{t.topicBilling}</option>
                      <option value='sales'>{t.topicSales}</option>
                      <option value='account'>{t.topicAccount}</option>
                      <option value='feedback'>{t.topicFeedback}</option>
                      <option value='other'>{t.topicOther}</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor='message' className='block text-sm font-medium mb-2'>{t.message}</label>
                    <textarea id='message' name='message' value={formData.message} onChange={handleChange} required rows={6} className='w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 transition resize-none' placeholder={t.placeholderMessage} />
                  </div>
                  {error && (
                    <div className='flex items-center gap-3 p-4 bg-red-500/20 border border-red-500/30 rounded-xl'>
                      <AlertCircle className='w-5 h-5 text-red-400 flex-shrink-0' />
                      <span className='text-red-200'>{error}</span>
                    </div>
                  )}
                  <button type='submit' disabled={isSubmitting} className='w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-600 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition'>
                    {isSubmitting ? (<><div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />{t.sending}</>) : (<><Send className='w-5 h-5' />{t.sendBtn}</>)}
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className='space-y-8'>
            <div className='bg-white/5 border border-white/10 rounded-2xl p-6'>
              <h3 className='font-bold mb-4'>{t.quickHelp}</h3>
              <div className='space-y-3'>
                {quickLinks.map((link) => (
                  <a key={link.titleKey} href='#' className='flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition group'>
                    <link.icon className='w-6 h-6 text-green-400' />
                    <div className='flex-1'>
                      <div className='font-medium group-hover:text-green-400 transition'>{t[link.titleKey]}</div>
                      <div className='text-sm text-gray-400'>{t[link.descKey]}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className='bg-white/5 border border-white/10 rounded-2xl p-6'>
              <h3 className='font-bold mb-4'>{t.browseByTopic}</h3>
              <div className='grid grid-cols-2 gap-3'>
                {supportCategories.map((cat) => (
                  <div key={cat.titleKey} className={`p-4 rounded-xl ${cat.bg} text-center cursor-pointer hover:scale-105 transition`}>
                    <cat.icon className={`w-6 h-6 ${cat.color} mx-auto mb-2`} />
                    <div className='text-sm font-medium'>{t[cat.titleKey]}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className='bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-2xl p-6 text-center'>
              <Mail className='w-8 h-8 text-green-400 mx-auto mb-3' />
              <h3 className='font-bold mb-2'>{t.emailUsTitle}</h3>
              <p className='text-sm text-gray-400 mb-4'>{t.emailUsDesc}</p>
              <a href='mailto:support@frontdeskagents.com' className='text-green-400 hover:text-green-300 font-medium transition'>support@frontdeskagents.com</a>
            </div>
          </div>
        </div>

        <div className='mt-16'>
          <h2 className='text-2xl font-bold mb-8 text-center'>{t.faqTitle}</h2>
          <div className='grid md:grid-cols-2 gap-6'>
            {faqs.map((faq, i) => (
              <div key={i} className='bg-white/5 border border-white/10 rounded-xl p-6'>
                <h3 className='font-bold mb-2 flex items-center gap-2'><HelpCircle className='w-5 h-5 text-green-400' />{t[faq.qKey]}</h3>
                <p className='text-gray-400 text-sm'>{t[faq.aKey]}</p>
              </div>
            ))}
          </div>
        </div>

        <div className='mt-16 pt-8 border-t border-white/10 text-center text-gray-500 text-sm'>
          <p>FrontDesk Agents · www.frontdeskagents.com</p>
          <p className='mt-2'>
            <Link href='/privacy-policy' className='hover:text-white transition'>{t.footerPrivacy}</Link>
            {' · '}
            <Link href='/terms-of-service' className='hover:text-white transition'>{t.footerTerms}</Link>
            {' · '}
            <Link href='/contact' className='hover:text-white transition'>{t.footerContact}</Link>
          </p>
        </div>
      </main>
    </div>
  )
}