'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader2, AlertCircle, Sun, Moon, Building2, Globe } from 'lucide-react'
import LanguageSelector from '../../components/LanguageSelector'

// 14 Language translations
const translations = {
  en: {
    title: 'Get Started Free',
    subtitle: 'Create your AI receptionist in minutes. No credit card required.',
    yourName: 'Your Name',
    yourNamePlaceholder: 'John Smith',
    businessName: 'Business Name',
    businessNamePlaceholder: 'Acme Corporation',
    workEmail: 'Work Email',
    emailPlaceholder: 'you@company.com',
    password: 'Password',
    passwordPlaceholder: 'Create a strong password (8+ characters)',
    selectIndustry: 'Select Your Industry',
    createAccount: 'Create Free Account',
    creatingAccount: 'Creating Account...',
    or: 'or',
    alreadyHaveAccount: 'Already have an account?',
    signIn: 'Sign in',
    freeCalls: 'Free calls/mo',
    aiAnswering: 'AI answering',
    setupTime: 'Setup time',
    selectIndustryError: 'Please select your industry',
    fillAllFieldsError: 'Please fill in all fields',
    passwordLengthError: 'Password must be at least 8 characters',
    connectionError: 'Connection failed. Please try again.',
    byCreating: 'By creating an account, you agree to our',
    termsOfService: 'Terms of Service',
    and: 'and',
    privacyPolicy: 'Privacy Policy',
    industries: {
      healthcare: 'Healthcare',
      legal: 'Legal',
      realestate: 'Real Estate',
      hospitality: 'Hospitality',
      financial: 'Financial',
      corporate: 'Corporate',
      retail: 'Retail',
      automotive: 'Automotive'
    }
  },
  es: {
    title: 'Comienza Gratis',
    subtitle: 'Crea tu receptionist AI en minutos. Sin tarjeta de crédito requerida.',
    yourName: 'Tu Nombre',
    yourNamePlaceholder: 'Juan García',
    businessName: 'Nombre del Negocio',
    businessNamePlaceholder: 'Empresa ABC',
    workEmail: 'Correo Electrónico',
    emailPlaceholder: 'tu@empresa.com',
    password: 'Contraseña',
    passwordPlaceholder: 'Crea una contraseña segura (8+ caracteres)',
    selectIndustry: 'Selecciona Tu Industria',
    createAccount: 'Crear Cuenta Gratis',
    creatingAccount: 'Creando Cuenta...',
    or: 'o',
    alreadyHaveAccount: '¿Ya tienes una cuenta?',
    signIn: 'Iniciar sesión',
    freeCalls: 'Llamadas gratis/mes',
    aiAnswering: 'Respuestas AI',
    setupTime: 'Tiempo de setup',
    selectIndustryError: 'Por favor selecciona tu industria',
    fillAllFieldsError: 'Por favor completa todos los campos',
    passwordLengthError: 'La contraseña debe tener al menos 8 caracteres',
    connectionError: 'Conexión fallida. Por favor intenta de nuevo.',
    byCreating: 'Al crear una cuenta, aceptas nuestros',
    termsOfService: 'Términos de Servicio',
    and: 'y',
    privacyPolicy: 'Política de Privacidad',
    industries: {
      healthcare: 'Salud',
      legal: 'Legal',
      realestate: 'Bienes Raíces',
      hospitality: 'Hostelería',
      financial: 'Financiero',
      corporate: 'Corporativo',
      retail: 'Comercio',
      automotive: 'Automotriz'
    }
  },
  fr: {
    title: 'Commencer Gratuitement',
    subtitle: 'Créez votre réceptionniste AI en quelques minutes. Sans carte bancaire requise.',
    yourName: 'Votre Nom',
    yourNamePlaceholder: 'Jean Dupont',
    businessName: "Nom de l'Entreprise",
    businessNamePlaceholder: 'Entreprise ABC',
    workEmail: 'Email Professionnel',
    emailPlaceholder: 'vous@entreprise.com',
    password: 'Mot de Passe',
    passwordPlaceholder: 'Créez un mot de passe sécurisé (8+ caractères)',
    selectIndustry: 'Sélectionnez Votre Industrie',
    createAccount: 'Créer un Compte Gratuit',
    creatingAccount: 'Création du Compte...',
    or: 'ou',
    alreadyHaveAccount: 'Vous avez déjà un compte?',
    signIn: 'Se connecter',
    freeCalls: 'Appels gratuits/mois',
    aiAnswering: 'Réponses AI',
    setupTime: 'Temps de configuration',
    selectIndustryError: 'Veuillez sélectionner votre industrie',
    fillAllFieldsError: 'Veuillez remplir tous les champs',
    passwordLengthError: 'Le mot de passe doit contenir au moins 8 caractères',
    connectionError: 'Connexion échouée. Veuillez réessayer.',
    byCreating: 'En créant un compte, vous acceptez nos',
    termsOfService: "Conditions d'Utilisation",
    and: 'et',
    privacyPolicy: 'Politique de Confidentialité',
    industries: {
      healthcare: 'Santé',
      legal: 'Juridique',
      realestate: 'Immobilier',
      hospitality: 'Hôtellerie',
      financial: 'Financier',
      corporate: 'Entreprise',
      retail: 'Commerce',
      automotive: 'Automobile'
    }
  },
  zh: {
    title: '免费开始',
    subtitle: '几分钟内创建您的AI接待员。无需信用卡。',
    yourName: '您的姓名',
    yourNamePlaceholder: '张先生',
    businessName: '公司名称',
    businessNamePlaceholder: 'ABC公司',
    workEmail: '工作邮箱',
    emailPlaceholder: 'you@company.com',
    password: '密码',
    passwordPlaceholder: '创建安全密码（8个以上字符）',
    selectIndustry: '选择您的行业',
    createAccount: '创建免费账户',
    creatingAccount: '正在创建账户...',
    or: '或',
    alreadyHaveAccount: '已有账户？',
    signIn: '登录',
    freeCalls: '免费通话/月',
    aiAnswering: 'AI应答',
    setupTime: '设置时间',
    selectIndustryError: '请选择您的行业',
    fillAllFieldsError: '请填写所有字段',
    passwordLengthError: '密码必须至少8个字符',
    connectionError: '连接失败。请重试。',
    byCreating: '创建账户即表示您同意我们的',
    termsOfService: '服务条款',
    and: '和',
    privacyPolicy: '隐私政策',
    industries: {
      healthcare: '医疗',
      legal: '法律',
      realestate: '房地产',
      hospitality: '酒店',
      financial: '金融',
      corporate: '企业',
      retail: '零售',
      automotive: '汽车'
    }
  },
  hi: {
    title: 'मुफ्त में शुरू करें',
    subtitle: 'कुछ ही मिनटों में अपना AI रिसेप्शनिस्ट बनाएं। कोई क्रेडिट कार्ड आवश्यक नहीं।',
    yourName: 'आपका नाम',
    yourNamePlaceholder: 'राहुल शर्मा',
    businessName: 'व्यापार का नाम',
    businessNamePlaceholder: 'ABC कंपनी',
    workEmail: 'कार्य ईमेल',
    emailPlaceholder: 'aap@company.com',
    password: 'पासवर्ड',
    passwordPlaceholder: 'एक मजबूत पासवर्ड बनाएं (8+ अक्षर)',
    selectIndustry: 'अपना उद्योग चुनें',
    createAccount: 'मुफ्त खाता बनाएं',
    creatingAccount: 'खाता बना रहे हैं...',
    or: 'या',
    alreadyHaveAccount: 'पहले से खाता है?',
    signIn: 'साइन इन करें',
    freeCalls: 'मुफ्त कॉल/महीना',
    aiAnswering: 'AI जवाब',
    setupTime: 'सेटअप समय',
    selectIndustryError: 'कृपया अपना उद्योग चुनें',
    fillAllFieldsError: 'कृपया सभी फ़ील्ड भरें',
    passwordLengthError: 'पासवर्ड कम से कम 8 अक्षर का होना चाहिए',
    connectionError: 'कनेक्शन विफल। कृपया पुनः प्रयास करें।',
    byCreating: 'खाता बनाकर आप हमारी',
    termsOfService: 'सेवा की शर्तें',
    and: 'और',
    privacyPolicy: 'गोपनीयता नीति',
    industries: {
      healthcare: 'स्वास्थ्य',
      legal: 'कानूनी',
      realestate: 'रियल एस्टेट',
      hospitality: 'आतिथ्य',
      financial: 'वित्तीय',
      corporate: 'कॉर्पोरेट',
      retail: 'खुदरा',
      automotive: 'ऑटोमोटिव'
    }
  },
  ar: {
    title: 'ابدأ مجانًا',
    subtitle: 'أنشئ مساعدك الذكي في دقائق. لا حاجة لبطاقة ائتمانية.',
    yourName: 'اسمك',
    yourNamePlaceholder: 'أحمد محمد',
    businessName: 'اسم الشركة',
    businessNamePlaceholder: 'شركة ABC',
    workEmail: 'البريد الإلكتروني العمل',
    emailPlaceholder: 'you@company.com',
    password: 'كلمة المرور',
    passwordPlaceholder: 'إنشاء كلمة مرور قوية (8+ أحرف)',
    selectIndustry: 'اختر صناعتك',
    createAccount: 'إنشاء حساب مجاني',
    creatingAccount: 'جارٍ إنشاء الحساب...',
    or: 'أو',
    alreadyHaveAccount: 'لديك حساب بالفعل؟',
    signIn: 'تسجيل الدخول',
    freeCalls: 'مكالمات مجانية/شهر',
    aiAnswering: 'إجابة الذكاء الاصطناعي',
    setupTime: 'وقت الإعداد',
    selectIndustryError: 'يرجى اختيار صناعتك',
    fillAllFieldsError: 'يرجى ملء جميع الحقول',
    passwordLengthError: 'يجب أن تكون كلمة المرور 8 أحرف على الأقل',
    connectionError: 'فشل الاتصال. يرجى المحاولة مرة أخرى.',
    byCreating: 'بإنشاء حساب، أنت توافق على',
    termsOfService: 'شروط الخدمة',
    and: 'و',
    privacyPolicy: 'سياسة الخصوصية',
    industries: {
      healthcare: 'الرعاية الصحية',
      legal: 'قانوني',
      realestate: 'العقارات',
      hospitality: 'الضيافة',
      financial: 'مالي',
      corporate: 'شركة',
      retail: 'تجزئة',
      automotive: 'سيارات'
    }
  },
  pt: {
    title: 'Comece Grátis',
    subtitle: 'Crie sua recepcionista AI em minutos. Sem cartão de crédito necessário.',
    yourName: 'Seu Nome',
    yourNamePlaceholder: 'João Silva',
    businessName: 'Nome da Empresa',
    businessNamePlaceholder: 'Empresa ABC',
    workEmail: 'Email de Trabalho',
    emailPlaceholder: 'voce@empresa.com',
    password: 'Senha',
    passwordPlaceholder: 'Crie uma senha segura (8+ caracteres)',
    selectIndustry: 'Selecione Seu Setor',
    createAccount: 'Criar Conta Grátis',
    creatingAccount: 'Criando Conta...',
    or: 'ou',
    alreadyHaveAccount: 'Já tem uma conta?',
    signIn: 'Entrar',
    freeCalls: 'Chamadas grátis/mês',
    aiAnswering: 'Respostas AI',
    setupTime: 'Tempo de setup',
    selectIndustryError: 'Por favor selecione seu setor',
    fillAllFieldsError: 'Por favor preencha todos os campos',
    passwordLengthError: 'A senha deve ter pelo menos 8 caracteres',
    connectionError: 'Conexão falhou. Por favor tente novamente.',
    byCreating: 'Ao criar uma conta, você concorda com nossos',
    termsOfService: 'Termos de Serviço',
    and: 'e',
    privacyPolicy: 'Política de Privacidade',
    industries: {
      healthcare: 'Saúde',
      legal: 'Jurídico',
      realestate: 'Imobiliário',
      hospitality: 'Hotelaria',
      financial: 'Financeiro',
      corporate: 'Corporativo',
      retail: 'Varejo',
      automotive: 'Automotivo'
    }
  },
  ko: {
    title: '무료로 시작하기',
    subtitle: '몇 분 만에 AI 리셉셔니스트를 만드세요. 신용카드 필요 없음.',
    yourName: '이름',
    yourNamePlaceholder: '김철수',
    businessName: '회사 이름',
    businessNamePlaceholder: 'ABC 회사',
    workEmail: '업무 이메일',
    emailPlaceholder: 'you@company.com',
    password: '비밀번호',
    passwordPlaceholder: '안전한 비밀번호 생성 (8자 이상)',
    selectIndustry: '업종 선택',
    createAccount: '무료 계정 만들기',
    creatingAccount: '계정 생성 중...',
    or: '또는',
    alreadyHaveAccount: '이미 계정이 있으신가요?',
    signIn: '로그인',
    freeCalls: '무료 통화/월',
    aiAnswering: 'AI 응답',
    setupTime: '설정 시간',
    selectIndustryError: '업종을 선택해 주세요',
    fillAllFieldsError: '모든 필드를 입력해 주세요',
    passwordLengthError: '비밀번호는 8자 이상이어야 합니다',
    connectionError: '연결 실패. 다시 시도해 주세요.',
    byCreating: '계정을 만들면 귀하는 당사의',
    termsOfService: '서비스 약관',
    and: '및',
    privacyPolicy: '개인정보 보호정책',
    industries: {
      healthcare: '헬스케어',
      legal: '법률',
      realestate: '부동산',
      hospitality: '호스피탈리티',
      financial: '금융',
      corporate: '기업',
      retail: '소매',
      automotive: '자동차'
    }
  },
  ja: {
    title: '無料で始める',
    subtitle: '数分でAI受付を作成。クレジットカード不要。',
    yourName: 'お名前',
    yourNamePlaceholder: '田中太郎',
    businessName: '会社名',
    businessNamePlaceholder: 'ABC株式会社',
    workEmail: 'ビジネスメール',
    emailPlaceholder: 'you@company.com',
    password: 'パスワード',
    passwordPlaceholder: '強力なパスワードを作成（8文字以上）',
    selectIndustry: '業種を選択',
    createAccount: '無料アカウント作成',
    creatingAccount: 'アカウント作成中...',
    or: 'または',
    alreadyHaveAccount: 'すでにアカウントをお持ちですか？',
    signIn: 'ログイン',
    freeCalls: '無料通話/月',
    aiAnswering: 'AI応答',
    setupTime: '設定時間',
    selectIndustryError: '業種を選択してください',
    fillAllFieldsError: 'すべてのフィールドを入力してください',
    passwordLengthError: 'パスワードは8文字以上である必要があります',
    connectionError: '接続に失敗しました。もう一度お試しください。',
    byCreating: 'アカウントを作成することで、あなたは当社の',
    termsOfService: '利用規約',
    and: 'および',
    privacyPolicy: 'プライバシーポリシー',
    industries: {
      healthcare: 'ヘルスケア',
      legal: '法務',
      realestate: '不動産',
      hospitality: 'ホスピタリティ',
      financial: '金融',
      corporate: '企業',
      retail: '小売',
      automotive: '自動車'
    }
  },
  vi: {
    title: 'Bắt Đầu Miễn Phí',
    subtitle: 'Tạo lễ tân AI trong vài phút. Không cần thẻ tín dụng.',
    yourName: 'Tên Của Bạn',
    yourNamePlaceholder: 'Nguyễn Văn A',
    businessName: 'Tên Doanh Nghiệp',
    businessNamePlaceholder: 'Công Ty ABC',
    workEmail: 'Email Công Việc',
    emailPlaceholder: 'ban@congty.com',
    password: 'Mật Khẩu',
    passwordPlaceholder: 'Tạo mật khẩu mạnh (8+ ký tự)',
    selectIndustry: 'Chọn Ngành Của Bạn',
    createAccount: 'Tạo Tài Khoản Miễn Phí',
    creatingAccount: 'Đang Tạo Tài Khoản...',
    or: 'hoặc',
    alreadyHaveAccount: 'Đã có tài khoản?',
    signIn: 'Đăng nhập',
    freeCalls: 'Cuộc gọi miễn phí/tháng',
    aiAnswering: 'Trả lời AI',
    setupTime: 'Thời gian thiết lập',
    selectIndustryError: 'Vui lòng chọn ngành của bạn',
    fillAllFieldsError: 'Vui lòng điền tất cả các trường',
    passwordLengthError: 'Mật khẩu phải có ít nhất 8 ký tự',
    connectionError: 'Kết nối thất bại. Vui lòng thử lại.',
    byCreating: 'Bằng cách tạo tài khoản, bạn đồng ý với',
    termsOfService: 'Điều Khoản Dịch Vụ',
    and: 'và',
    privacyPolicy: 'Chính Sách Bảo Mật',
    industries: {
      healthcare: 'Y tế',
      legal: 'Pháp lý',
      realestate: 'Bất động sản',
      hospitality: 'Khách sạn',
      financial: 'Tài chính',
      corporate: 'Doanh nghiệp',
      retail: 'Bán lẻ',
      automotive: 'Ô tô'
    }
  },
  tl: {
    title: 'Magsimula Libre',
    subtitle: 'Gumawa ng iyong AI receptionist sa loob ng ilang minuto. Walang credit card kinakailangan.',
    yourName: 'Iyong Pangalan',
    yourNamePlaceholder: 'Juan Dela Cruz',
    businessName: ' Pangalan ng Negosyo',
    businessNamePlaceholder: 'ABC Corporation',
    workEmail: 'Work Email',
    emailPlaceholder: 'ikaw@compania.com',
    password: 'Password',
    passwordPlaceholder: 'Gumawa ng malakas na password (8+ characters)',
    selectIndustry: 'Piliin Ang Iyong Industriya',
    createAccount: 'Gumawa ng Libre na Account',
    creatingAccount: 'Gumagawa ng Account...',
    or: 'o',
    alreadyHaveAccount: 'May account na?',
    signIn: 'Mag-sign in',
    freeCalls: 'Libre na tawag/buwan',
    aiAnswering: 'AI answering',
    setupTime: 'Oras ng setup',
    selectIndustryError: 'Paki-pili ang iyong industriya',
    fillAllFieldsError: 'Paki-fill sa lahat ng fields',
    passwordLengthError: 'Ang password ay dapat hindi bababa sa 8 characters',
    connectionError: 'Hindi nagtagumpay ang koneksyon. Pakitungo muli.',
    byCreating: 'Sa paggawa ng account, sumasang-ayon ka sa aming',
    termsOfService: 'Mga Tuntunin ng Serbisyo',
    and: 'at',
    privacyPolicy: 'Patakaran sa Privacy',
    industries: {
      healthcare: 'Healthcare',
      legal: 'Legal',
      realestate: 'Real Estate',
      hospitality: 'Hospitality',
      financial: 'Financial',
      corporate: 'Corporate',
      retail: 'Retail',
      automotive: 'Automotive'
    }
  },
  de: {
    title: 'Kostenlos Loslegen',
    subtitle: 'Erstellen Sie Ihren AI-Empfang in Minuten. Keine Kreditkarte erforderlich.',
    yourName: 'Ihr Name',
    yourNamePlaceholder: 'Max Mustermann',
    businessName: 'Firmenname',
    businessNamePlaceholder: 'ABC GmbH',
    workEmail: 'Geschäftliche E-Mail',
    emailPlaceholder: 'sie@unternehmen.com',
    password: 'Passwort',
    passwordPlaceholder: 'Erstellen Sie ein sicheres Passwort (8+ Zeichen)',
    selectIndustry: 'Wählen Sie Ihre Branche',
    createAccount: 'Kostenloses Konto Erstellen',
    creatingAccount: 'Konto wird erstellt...',
    or: 'oder',
    alreadyHaveAccount: 'Haben Sie bereits ein Konto?',
    signIn: 'Anmelden',
    freeCalls: 'Kostenlose Anrufe/Monat',
    aiAnswering: 'AI-Antworten',
    setupTime: 'Einrichtungszeit',
    selectIndustryError: 'Bitte wählen Sie Ihre Branche',
    fillAllFieldsError: 'Bitte füllen Sie alle Felder aus',
    passwordLengthError: 'Das Passwort muss mindestens 8 Zeichen lang sein',
    connectionError: 'Verbindung fehlgeschlagen. Bitte versuchen Sie es erneut.',
    byCreating: 'Mit der Erstellung eines Kontos stimmen Sie unseren',
    termsOfService: 'Nutzungsbedingungen',
    and: 'und',
    privacyPolicy: 'Datenschutzrichtlinie',
    industries: {
      healthcare: 'Gesundheit',
      legal: 'Recht',
      realestate: 'Immobilien',
      hospitality: 'Gastgewerbe',
      financial: 'Finanzen',
      corporate: 'Unternehmen',
      retail: 'Einzelhandel',
      automotive: 'Automobil'
    }
  },
  it: {
    title: 'Inizia Gratuitamente',
    subtitle: 'Crea il tuo receptionist AI in pochi minuti. Nessuna carta di credito richiesta.',
    yourName: 'Il Tuo Nome',
    yourNamePlaceholder: 'Mario Rossi',
    businessName: "Nome dell'Azienda",
    businessNamePlaceholder: 'ABC Spa',
    workEmail: 'Email di Lavoro',
    emailPlaceholder: 'tu@azienda.com',
    password: 'Password',
    passwordPlaceholder: 'Crea una password sicura (8+ caratteri)',
    selectIndustry: 'Seleziona il Tuo Settore',
    createAccount: 'Crea Account Gratuito',
    creatingAccount: 'Creazione Account...',
    or: 'o',
    alreadyHaveAccount: 'Hai già un account?',
    signIn: 'Accedi',
    freeCalls: 'Chiamate gratuite/mese',
    aiAnswering: 'Risposte AI',
    setupTime: 'Tempo di setup',
    selectIndustryError: 'Per favore seleziona il tuo settore',
    fillAllFieldsError: 'Per favore compila tutti i campi',
    passwordLengthError: 'La password deve essere di almeno 8 caratteri',
    connectionError: 'Connessione fallita. Per favore riprova.',
    byCreating: 'Creando un account, accetti i nostri',
    termsOfService: 'Termini di Servizio',
    and: 'e',
    privacyPolicy: 'Politica sulla Privacy',
    industries: {
      healthcare: 'Sanità',
      legal: 'Legale',
      realestate: 'Immobiliare',
      hospitality: 'Ospitalità',
      financial: 'Finanza',
      corporate: 'Aziendale',
      retail: 'Vendita al dettaglio',
      automotive: 'Automotive'
    }
  },
  ru: {
    title: 'Начните бесплатно',
    subtitle: 'Создайте своего ИИ-ресепшиониста за минуты. Кредитная карта не требуется.',
    yourName: 'Ваше имя',
    yourNamePlaceholder: 'Иван Петров',
    businessName: 'Название компании',
    businessNamePlaceholder: 'Компания ABC',
    workEmail: 'Рабочий email',
    emailPlaceholder: 'you@company.com',
    password: 'Пароль',
    passwordPlaceholder: 'Создайте надежный пароль (8+ символов)',
    selectIndustry: 'Выберите вашу отрасль',
    createAccount: 'Создать бесплатный аккаунт',
    creatingAccount: 'Создание аккаунта...',
    or: 'или',
    alreadyHaveAccount: 'У вас уже есть аккаунт?',
    signIn: 'Войти',
    freeCalls: 'Бесплатные звонки/мес',
    aiAnswering: 'ИИ-ответы',
    setupTime: 'Время настройки',
    selectIndustryError: 'Пожалуйста, выберите вашу отрасль',
    fillAllFieldsError: 'Пожалуйста, заполните все поля',
    passwordLengthError: 'Пароль должен содержать не менее 8 символов',
    connectionError: 'Ошибка подключения. Пожалуйста, попробуйте снова.',
    byCreating: 'Создавая аккаунт, вы соглашаетесь с нашими',
    termsOfService: 'Условиями использования',
    and: 'и',
    privacyPolicy: 'Политикой конфиденциальности',
    industries: {
      healthcare: 'Здравоохранение',
      legal: 'Юридический',
      realestate: 'Недвижимость',
      hospitality: 'Гостеприимство',
      financial: 'Финансы',
      corporate: 'Корпоративный',
      retail: 'Розничная торговля',
      automotive: 'Автомобильный'
    }
  }
}

import { useRTL } from '../../lib/useRTL'

// Industry options
const industries = [
  { id: 'healthcare', icon: '🏥' },
  { id: 'legal', icon: '⚖️' },
  { id: 'realestate', icon: '🏢' },
  { id: 'hospitality', icon: '🏨' },
  { id: 'financial', icon: '💼' },
  { id: 'corporate', icon: '🏗️' },
  { id: 'retail', icon: '🛒' },
  { id: 'automotive', icon: '🚗' },
]

export default function CustomerSignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    password: '',
    industry: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isDark, setIsDark] = useState(true)
  const { lang, setLang, isRTL, handleLanguageChange } = useRTL()

  const t = translations[lang as keyof typeof translations] || translations.en

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.industry) {
      setError(t.selectIndustryError)
      return
    }
    if (!formData.businessName || !formData.ownerName || !formData.email || !formData.password) {
      setError(t.fillAllFieldsError)
      return
    }
    if (formData.password.length < 8) {
      setError(t.passwordLengthError)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/customer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Registration failed')
        setIsLoading(false)
        return
      }

      if (data.success) {
        router.push('/customer/dashboard?welcome=true')
      }
    } catch (err) {
      setError(t.connectionError)
      setIsLoading(false)
    }
  }

  const handleIndustrySelect = (industryId: string) => {
    setFormData({ ...formData, industry: industryId })
  }

  // handleLanguageChange comes from useRTL hook

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-black' : 'bg-gray-50'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className={`fixed top-0 w-full z-50 ${isDark ? 'bg-black/90' : 'bg-white/90'} backdrop-blur-md border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
        <div className='max-w-7xl mx-auto px-6 py-4 flex justify-between items-center'>
          <Link href='/' className='flex items-center gap-2'>
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center`}>
              <Lock className='w-4 h-4 text-white' />
            </div>
            <span className={`font-bold text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>FRONTDESK</span>
          </Link>
          <div className='flex items-center gap-4'>
            <LanguageSelector currentLang={lang} onChange={handleLanguageChange} />
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-full transition-colors ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
            >
              {isDark ? <Sun className='w-5 h-5' /> : <Moon className='w-5 h-5' />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='min-h-screen flex items-center justify-center px-4 pt-24 pb-16'>
        <div className='w-full max-w-2xl'>
          {/* Hero Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='text-center mb-8'
          >
            <h1 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t.title}
            </h1>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t.subtitle}
            </p>
          </motion.div>

          {/* Signup Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`p-8 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}
          >
            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* Error Message */}
              {error && (
                <div className={`flex items-center gap-2 p-4 rounded-xl ${isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'}`}>
                  <AlertCircle className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                  <span className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</span>
                </div>
              )}

              {/* Industry Selection */}
              <div>
                <label className={`block text-sm font-medium mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t.selectIndustry}
                </label>
                <div className='grid grid-cols-4 gap-3'>
                  {industries.map((industry) => (
                    <button
                      key={industry.id}
                      type='button'
                      onClick={() => handleIndustrySelect(industry.id)}
                      className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-1 ${
                        formData.industry === industry.id
                          ? 'border-green-500 bg-green-500/10'
                          : isDark
                            ? 'border-white/10 bg-white/5 hover:border-white/20'
                            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <span className='text-xl'>{industry.icon}</span>
                      <span className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {t.industries[industry.id as keyof typeof t.industries]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Owner Name */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t.yourName}
                </label>
                <div className='relative'>
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type='text'
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    placeholder={t.yourNamePlaceholder}
                    className={`w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-all ${
                      isDark 
                        ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-green-500/50' 
                        : 'bg-gray-100 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-green-500'
                    }`}
                    required
                  />
                </div>
              </div>

              {/* Business Name */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t.businessName}
                </label>
                <div className='relative'>
                  <Building2 className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type='text'
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder={t.businessNamePlaceholder}
                    className={`w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-all ${
                      isDark 
                        ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-green-500/50' 
                        : 'bg-gray-100 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-green-500'
                    }`}
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t.workEmail}
                </label>
                <div className='relative'>
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type='email'
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={t.emailPlaceholder}
                    className={`w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-all ${
                      isDark 
                        ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-green-500/50' 
                        : 'bg-gray-100 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-green-500'
                    }`}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t.password}
                </label>
                <div className='relative'>
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={t.passwordPlaceholder}
                    className={`w-full pl-12 pr-12 py-4 rounded-xl outline-none transition-all ${
                      isDark 
                        ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-green-500/50' 
                        : 'bg-gray-100 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-green-500'
                    }`}
                    required
                    minLength={8}
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type='submit'
                disabled={isLoading}
                className='w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all'
              >
                {isLoading ? (
                  <>
                    <Loader2 className='w-5 h-5 animate-spin' />
                    {t.creatingAccount}
                  </>
                ) : (
                  <>
                    {t.createAccount}
                    <ArrowRight className='w-5 h-5' />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className={`my-6 flex items-center gap-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              <div className={`flex-1 h-px ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
              <span className='text-sm'>{t.or}</span>
              <div className={`flex-1 h-px ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
            </div>

            {/* Sign In Link */}
            <p className={`text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t.alreadyHaveAccount}{' '}
              <Link href='/customer/login' className='text-green-500 hover:text-green-400 font-medium'>
                {t.signIn}
              </Link>
            </p>
          </motion.div>

          {/* Features */}
          <div className={`mt-6 p-6 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
            <div className='grid grid-cols-3 gap-4 text-center'>
              <div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>100</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t.freeCalls}</div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>24/7</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t.aiAnswering}</div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>5 min</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t.setupTime}</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`text-center text-xs mt-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
          >
            {t.byCreating}{' '}
            <Link href='/terms-of-service' className={`hover:underline ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t.termsOfService}</Link>
            {' '}{t.and}{' '}
            <Link href='/privacy-policy' className={`hover:underline ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t.privacyPolicy}</Link>
          </motion.p>
        </div>
      </main>
    </div>
  )
}