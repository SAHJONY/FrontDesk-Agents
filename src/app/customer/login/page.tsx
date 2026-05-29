'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader2, AlertCircle, Sun, Moon } from 'lucide-react'
import LanguageSelector from '../../components/LanguageSelector'

// 14 Language translations
const translations = {
  en: {
    title: 'Welcome Back',
    subtitle: 'Sign in to your FrontDesk Agents account',
    emailAddress: 'Email Address',
    emailPlaceholder: 'you@company.com',
    password: 'Password',
    passwordPlaceholder: 'Enter your password',
    forgotPassword: 'Forgot password?',
    signIn: 'Sign In',
    signingIn: 'Signing In...',
    or: 'or',
    dontHaveAccount: "Don't have an account",
    createOne: 'Create one',
    errorInvalid: 'Invalid credentials',
    errorConnection: 'Connection failed. Please try again.',
    bySigningIn: 'By signing in, you agree to our',
    termsOfService: 'Terms of Service',
    and: 'and',
    privacyPolicy: 'Privacy Policy'
  },
  es: {
    title: 'Bienvenido de Nuevo',
    subtitle: 'Inicia sesión en tu cuenta de FrontDesk Agents',
    emailAddress: 'Correo Electrónico',
    emailPlaceholder: 'tu@empresa.com',
    password: 'Contraseña',
    passwordPlaceholder: 'Ingresa tu contraseña',
    forgotPassword: '¿Olvidaste tu contraseña?',
    signIn: 'Iniciar Sesión',
    signingIn: 'Iniciando Sesión...',
    or: 'o',
    dontHaveAccount: '¿No tienes una cuenta?',
    createOne: 'Crea una',
    errorInvalid: 'Credenciales inválidas',
    errorConnection: 'Conexión fallida. Por favor intenta de nuevo.',
    bySigningIn: 'Al iniciar sesión, aceptas nuestros',
    termsOfService: 'Términos de Servicio',
    and: 'y',
    privacyPolicy: 'Política de Privacidad'
  },
  fr: {
    title: 'Bon Retour',
    subtitle: 'Connectez-vous à votre compte FrontDesk Agents',
    emailAddress: 'Adresse Email',
    emailPlaceholder: 'vous@entreprise.com',
    password: 'Mot de Passe',
    passwordPlaceholder: 'Entrez votre mot de passe',
    forgotPassword: 'Mot de passe oublié?',
    signIn: 'Se Connecter',
    signingIn: 'Connexion en cours...',
    or: 'ou',
    dontHaveAccount: "Vous n'avez pas de compte?",
    createOne: 'Créez-en un',
    errorInvalid: 'Identifiants invalides',
    errorConnection: 'Connexion échouée. Veuillez réessayer.',
    bySigningIn: 'En vous connectant, vous acceptez nos',
    termsOfService: "Conditions d'Utilisation",
    and: 'et',
    privacyPolicy: 'Politique de Confidentialité'
  },
  zh: {
    title: '欢迎回来',
    subtitle: '登录您的FrontDesk Agents账户',
    emailAddress: '电子邮件地址',
    emailPlaceholder: 'you@company.com',
    password: '密码',
    passwordPlaceholder: '输入您的密码',
    forgotPassword: '忘记密码？',
    signIn: '登录',
    signingIn: '正在登录...',
    or: '或',
    dontHaveAccount: '没有账户？',
    createOne: '创建一个',
    errorInvalid: '凭据无效',
    errorConnection: '连接失败。请重试。',
    bySigningIn: '登录即表示您同意我们的',
    termsOfService: '服务条款',
    and: '和',
    privacyPolicy: '隐私政策'
  },
  hi: {
    title: 'वापस स्वागत है',
    subtitle: 'अपने FrontDesk Agents खाते में साइन इन करें',
    emailAddress: 'ईमेल पता',
    emailPlaceholder: 'aap@company.com',
    password: 'पासवर्ड',
    passwordPlaceholder: 'अपना पासवर्ड दर्ज करें',
    forgotPassword: 'पासवर्ड भूल गए?',
    signIn: 'साइन इन करें',
    signingIn: 'साइन इन हो रहे हैं...',
    or: 'या',
    dontHaveAccount: 'खाता नहीं है?',
    createOne: 'एक बनाएं',
    errorInvalid: 'अमान्य क्रेडेंशियल्स',
    errorConnection: 'कनेक्शन विफल। कृपया पुनः प्रयास करें।',
    bySigningIn: 'साइन इन करके आप हमारी',
    termsOfService: 'सेवा की शर्तें',
    and: 'और',
    privacyPolicy: 'गोपनीयता नीति'
  },
  ar: {
    title: 'مرحبًا بعودتك',
    subtitle: 'سجل دخولك إلى حساب FrontDesk Agents الخاص بك',
    emailAddress: 'عنوان البريد الإلكتروني',
    emailPlaceholder: 'you@company.com',
    password: 'كلمة المرور',
    passwordPlaceholder: 'أدخل كلمة المرور الخاصة بك',
    forgotPassword: 'هل نسيت كلمة المرور؟',
    signIn: 'تسجيل الدخول',
    signingIn: 'جارٍ تسجيل الدخول...',
    or: 'أو',
    dontHaveAccount: 'ليس لديك حساب؟',
    createOne: 'إنشاء واحد',
    errorInvalid: 'بيانات الاعتماد غير صالحة',
    errorConnection: 'فشل الاتصال. يرجى المحاولة مرة أخرى.',
    bySigningIn: 'بالتسجيل، أنت توافق على',
    termsOfService: 'شروط الخدمة',
    and: 'و',
    privacyPolicy: 'سياسة الخصوصية'
  },
  pt: {
    title: 'Bem-vindo de Volta',
    subtitle: 'Entre na sua conta FrontDesk Agents',
    emailAddress: 'Endereço de Email',
    emailPlaceholder: 'voce@empresa.com',
    password: 'Senha',
    passwordPlaceholder: 'Digite sua senha',
    forgotPassword: 'Esqueceu a senha?',
    signIn: 'Entrar',
    signingIn: 'Entrando...',
    or: 'ou',
    dontHaveAccount: 'Não tem uma conta?',
    createOne: 'Crie uma',
    errorInvalid: 'Credenciais inválidas',
    errorConnection: 'Conexão falhou. Por favor tente novamente.',
    bySigningIn: 'Ao entrar, você concorda com nossos',
    termsOfService: 'Termos de Serviço',
    and: 'e',
    privacyPolicy: 'Política de Privacidade'
  },
  ko: {
    title: '다시 오신 것을 환영합니다',
    subtitle: 'FrontDesk Agents 계정에 로그인하세요',
    emailAddress: '이메일 주소',
    emailPlaceholder: 'you@company.com',
    password: '비밀번호',
    passwordPlaceholder: '비밀번호를 입력하세요',
    forgotPassword: '비밀번호를 잊으셨나요?',
    signIn: '로그인',
    signingIn: '로그인 중...',
    or: '또는',
    dontHaveAccount: '계정이 없으신가요?',
    createOne: '만드세요',
    errorInvalid: '잘못된 자격 증명',
    errorConnection: '연결 실패. 다시 시도해 주세요.',
    bySigningIn: '로그인하면 귀하는 당사의',
    termsOfService: '서비스 약관',
    and: '및',
    privacyPolicy: '개인정보 보호정책'
  },
  ja: {
    title: 'おかえりなさい',
    subtitle: 'FrontDesk Agentsアカウントにログイン',
    emailAddress: 'メールアドレス',
    emailPlaceholder: 'you@company.com',
    password: 'パスワード',
    passwordPlaceholder: 'パスワードを入力',
    forgotPassword: 'パスワードをお忘れですか？',
    signIn: 'ログイン',
    signingIn: 'ログイン中...',
    or: 'または',
    dontHaveAccount: 'アカウントをお持ちでないですか？',
    createOne: '作成',
    errorInvalid: '無効な資格情報',
    errorConnection: '接続に失敗しました。もう一度お試しください。',
    bySigningIn: 'ログインすることで、あなたは当社の',
    termsOfService: '利用規約',
    and: 'および',
    privacyPolicy: 'プライバシーポリシー'
  },
  vi: {
    title: 'Chào Mừng Trở Lại',
    subtitle: 'Đăng nhập vào tài khoản FrontDesk Agents của bạn',
    emailAddress: 'Địa chỉ Email',
    emailPlaceholder: 'ban@congty.com',
    password: 'Mật Khẩu',
    passwordPlaceholder: 'Nhập mật khẩu của bạn',
    forgotPassword: 'Quên mật khẩu?',
    signIn: 'Đăng Nhập',
    signingIn: 'Đang Đăng Nhập...',
    or: 'hoặc',
    dontHaveAccount: 'Không có tài khoản?',
    createOne: 'Tạo một cái',
    errorInvalid: 'Thông tin đăng nhập không hợp lệ',
    errorConnection: 'Kết nối thất bại. Vui lòng thử lại.',
    bySigningIn: 'Bằng cách đăng nhập, bạn đồng ý với',
    termsOfService: 'Điều Khoản Dịch Vụ',
    and: 'và',
    privacyPolicy: 'Chính Sách Bảo Mật'
  },
  tl: {
    title: 'Maligayang Pagbabalik',
    subtitle: 'Mag-sign in sa iyong FrontDesk Agents account',
    emailAddress: 'Email Address',
    emailPlaceholder: 'ikaw@compania.com',
    password: 'Password',
    passwordPlaceholder: 'Ilagay ang iyong password',
    forgotPassword: 'Nakalimutan ang password?',
    signIn: 'Mag-sign In',
    signingIn: 'Nagti-sign in...',
    or: 'o',
    dontHaveAccount: 'Walang account?',
    createOne: 'Gumawa ng isa',
    errorInvalid: 'Hindi valid ang credentials',
    errorConnection: 'Hindi nagtagumpay ang koneksyon. Pakitungo muli.',
    bySigningIn: 'Sa pag-sign in, sumasang-ayon ka sa aming',
    termsOfService: 'Mga Tuntunin ng Serbisyo',
    and: 'at',
    privacyPolicy: 'Patakaran sa Privacy'
  },
  de: {
    title: 'Willkommen Zurück',
    subtitle: 'Melden Sie sich bei Ihrem FrontDesk Agents-Konto an',
    emailAddress: 'E-Mail-Adresse',
    emailPlaceholder: 'sie@unternehmen.com',
    password: 'Passwort',
    passwordPlaceholder: 'Geben Sie Ihr Passwort ein',
    forgotPassword: 'Passwort vergessen?',
    signIn: 'Anmelden',
    signingIn: 'Anmeldung läuft...',
    or: 'oder',
    dontHaveAccount: 'Noch kein Konto?',
    createOne: 'Erstellen Sie eines',
    errorInvalid: 'Ungültige Anmeldedaten',
    errorConnection: 'Verbindung fehlgeschlagen. Bitte versuchen Sie es erneut.',
    bySigningIn: 'Mit der Anmeldung stimmen Sie unseren',
    termsOfService: 'Nutzungsbedingungen',
    and: 'und',
    privacyPolicy: 'Datenschutzrichtlinie'
  },
  it: {
    title: 'Bentornato',
    subtitle: 'Accedi al tuo account FrontDesk Agents',
    emailAddress: 'Indirizzo Email',
    emailPlaceholder: 'tu@azienda.com',
    password: 'Password',
    passwordPlaceholder: 'Inserisci la tua password',
    forgotPassword: 'Password dimenticata?',
    signIn: 'Accedi',
    signingIn: 'Accesso in corso...',
    or: 'o',
    dontHaveAccount: 'Non hai un account?',
    createOne: 'Creane uno',
    errorInvalid: 'Credenziali non valide',
    errorConnection: 'Connessione fallita. Per favore riprova.',
    bySigningIn: "Effettuando l'accesso, accetti i nostri",
    termsOfService: 'Termini di Servizio',
    and: 'e',
    privacyPolicy: 'Politica sulla Privacy'
  },
  ru: {
    title: 'С возвращением',
    subtitle: 'Войдите в свой аккаунт FrontDesk Agents',
    emailAddress: 'Адрес электронной почты',
    emailPlaceholder: 'you@company.com',
    password: 'Пароль',
    passwordPlaceholder: 'Введите ваш пароль',
    forgotPassword: 'Забыли пароль?',
    signIn: 'Войти',
    signingIn: 'Вход...',
    or: 'или',
    dontHaveAccount: 'Нет аккаунта?',
    createOne: 'Создайте его',
    errorInvalid: 'Неверные учетные данные',
    errorConnection: 'Ошибка подключения. Пожалуйста, попробуйте снова.',
    bySigningIn: 'Входя в систему, вы соглашаетесь с нашими',
    termsOfService: 'Условиями использования',
    and: 'и',
    privacyPolicy: 'Политикой конфиденциальности'
  }
}

import { commonTranslations } from '../../lib/translations'
import { useRTL } from '../../lib/useRTL'
import { useTheme } from '../../lib/useTheme'

export default function CustomerLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { isDark, toggleTheme } = useTheme()
  const { lang, setLang, isRTL, handleLanguageChange } = useRTL()

  const t = translations[lang as keyof typeof translations] || translations.en

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || t.errorInvalid)
        setIsLoading(false)
        return
      }

      if (data.success) {
        router.push('/customer/dashboard')
      }
    } catch (err) {
      setError(t.errorConnection)
      setIsLoading(false)
    }
  }

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
              onClick={toggleTheme}
              title={commonTranslations[lang as keyof typeof commonTranslations]?.darkMode || 'Dark Mode'}
              className={`p-2 rounded-full transition-colors ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
              aria-label={commonTranslations[lang as keyof typeof commonTranslations]?.darkMode || 'Toggle dark mode'}
            >
              {isDark ? <Sun className='w-5 h-5' /> : <Moon className='w-5 h-5' />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='min-h-screen flex items-center justify-center px-4 pt-24'>
        <div className='w-full max-w-md'>
          {/* Hero Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='text-center mb-12'
          >
            <h1 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t.title}
            </h1>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t.subtitle}
            </p>
          </motion.div>

          {/* Login Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`p-8 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}
          >
            <form onSubmit={handleLogin} className='space-y-6'>
              {/* Error Message */}
              {error && (
                <div className={`flex items-center gap-2 p-4 rounded-xl ${isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'}`}>
                  <AlertCircle className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                  <span className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</span>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t.emailAddress}
                </label>
                <div className='relative'>
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    className={`w-full pl-12 pr-12 py-4 rounded-xl outline-none transition-all ${
                      isDark 
                        ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-green-500/50' 
                        : 'bg-gray-100 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-green-500'
                    }`}
                    required
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

              {/* Forgot Password */}
              <div className='text-right'>
                <Link href='/customer/forgot-password' className={`text-sm hover:underline ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                  {t.forgotPassword}
                </Link>
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
                    {t.signingIn}
                  </>
                ) : (
                  <>
                    {t.signIn}
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

            {/* Sign Up Link */}
            <p className={`text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t.dontHaveAccount}{' '}
              <Link href='/customer/signup' className='text-green-500 hover:text-green-400 font-medium'>
                {t.createOne}
              </Link>
            </p>
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`text-center text-xs mt-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
          >
            {t.bySigningIn}{' '}
            <Link href='/terms-of-service' className={`hover:underline ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t.termsOfService}</Link>
            {' '}{t.and}{' '}
            <Link href='/privacy-policy' className={`hover:underline ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t.privacyPolicy}</Link>
          </motion.p>
        </div>
      </main>
    </div>
  )
}