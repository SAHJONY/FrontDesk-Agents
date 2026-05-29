'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Shield, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import LanguageSelector from '../../components/LanguageSelector'

import { useRTL } from '../../lib/useRTL'

// Translations for all supported languages
const translations: Record<string, Record<string, string>> = {
  en: {
    platformOwnerAccess: 'Platform Owner Access',
    welcomeBack: 'Welcome Back', signInToAccess: 'Sign in to access the owner dashboard',
    ownerEmail: 'Owner Email', placeholderEmail: 'owner@frontdeskagents.com',
    password: 'Password', placeholderPassword: 'Enter your password',
    signIn: 'Sign in...', signingIn: 'Signing in...',
    accessOwnerDashboard: 'Access Owner Dashboard',
    invalidCredentials: 'Invalid credentials',
    connectionError: 'Connection failed. Please try again.',
    backToFrontDesk: '← Back to FrontDesk Agents',
    darkMode: 'Dark Mode', lightMode: 'Light Mode'
  },
  es: {
    platformOwnerAccess: 'Acceso de Propietario de Plataforma',
    welcomeBack: 'Bienvenido de Nuevo', signInToAccess: 'Inicia sesión para acceder al panel del propietario',
    ownerEmail: 'Email del Propietario', placeholderEmail: 'propietario@frontdeskagents.com',
    password: 'Contraseña', placeholderPassword: 'Ingresa tu contraseña',
    signIn: 'Iniciar sesión...', signingIn: 'Iniciando sesión...',
    accessOwnerDashboard: 'Acceder al Panel del Propietario',
    invalidCredentials: 'Credenciales inválidas',
    connectionError: 'Error de conexión. Por favor intenta de nuevo.',
    backToFrontDesk: '← Volver a FrontDesk Agents',
    darkMode: 'Modo Oscuro', lightMode: 'Modo Claro'
  },
  fr: {
    platformOwnerAccess: "Accès Propriétaire de la Plateforme",
    welcomeBack: 'Bienvenue', signInToAccess: "Connectez-vous pour accéder au tableau de bord du propriétaire",
    ownerEmail: 'Email du Propriétaire', placeholderEmail: 'proprietaire@frontdeskagents.com',
    password: 'Mot de Passe', placeholderPassword: 'Entrez votre mot de passe',
    signIn: 'Se connecter...', signingIn: 'Connexion en cours...',
    accessOwnerDashboard: 'Accéder au Tableau de Bord du Propriétaire',
    invalidCredentials: 'Identifiants invalides',
    connectionError: 'Erreur de connexion. Veuillez réessayer.',
    backToFrontDesk: '← Retour à FrontDesk Agents',
    darkMode: 'Mode Sombre', lightMode: 'Mode Clair'
  },
  zh: {
    platformOwnerAccess: '平台所有者访问',
    welcomeBack: '欢迎回来', signInToAccess: '登录以访问所有者仪表板',
    ownerEmail: '所有者邮箱', placeholderEmail: 'owner@frontdeskagents.com',
    password: '密码', placeholderPassword: '输入您的密码',
    signIn: '登录...', signingIn: '正在登录...',
    accessOwnerDashboard: '访问所有者仪表板',
    invalidCredentials: '无效的凭据',
    connectionError: '连接失败。请重试。',
    backToFrontDesk: '← 返回 FrontDesk Agents',
    darkMode: '深色模式', lightMode: '浅色模式'
  },
  hi: {
    platformOwnerAccess: 'प्लेटफॉर्म मालिक पहुंच',
    welcomeBack: 'वापस स्वागत है', signInToAccess: 'स्वामी डैशबोर्ड तक पहुंचने के लिए साइन इन करें',
    ownerEmail: 'मालिक का ईमेल', placeholderEmail: 'owner@frontdeskagents.com',
    password: 'पासवर्ड', placeholderPassword: 'अपना पासवर्ड दर्ज करें',
    signIn: 'साइन इन...', signingIn: 'साइन इन हो रहे हैं...',
    accessOwnerDashboard: 'स्वामी डैशबोर्ड तक पहुंचें',
    invalidCredentials: 'अमान्य क्रेडेंशियल',
    connectionError: 'कनेक्शन विफल। कृपया पुनः प्रयास करें।',
    backToFrontDesk: '← FrontDesk Agents पर वापस जाएं',
    darkMode: 'डार्क मोड', lightMode: 'लाइट मोड'
  },
  ar: {
    platformOwnerAccess: 'وصول مالك المنصة',
    welcomeBack: 'مرحبًا بعودتك', signInToAccess: 'سجل الدخول للوصول إلى لوحة المالك',
    ownerEmail: 'البريد الإلكتروني للمالك', placeholderEmail: 'owner@frontdeskagents.com',
    password: 'كلمة المرور', placeholderPassword: 'أدخل كلمة المرور الخاصة بك',
    signIn: 'تسجيل الدخول...', signingIn: 'جارٍ تسجيل الدخول...',
    accessOwnerDashboard: 'الوصول إلى لوحة المالك',
    invalidCredentials: 'بيانات اعتماد غير صالحة',
    connectionError: 'فشل الاتصال. يرجى المحاولة مرة أخرى.',
    backToFrontDesk: '← العودة إلى FrontDesk Agents',
    darkMode: 'الوضع الداكن', lightMode: 'الوضع الفاتح'
  },
  pt: {
    platformOwnerAccess: 'Acesso do Proprietário da Plataforma',
    welcomeBack: 'Bem-vindo de Volta', signInToAccess: 'Entre para acessar o painel do proprietário',
    ownerEmail: 'Email do Proprietário', placeholderEmail: 'owner@frontdeskagents.com',
    password: 'Senha', placeholderPassword: 'Digite sua senha',
    signIn: 'Entrar...', signingIn: 'Entrando...',
    accessOwnerDashboard: 'Acessar Painel do Proprietário',
    invalidCredentials: 'Credenciais inválidas',
    connectionError: 'Falha na conexão. Por favor, tente novamente.',
    backToFrontDesk: '← Voltar para FrontDesk Agents',
    darkMode: 'Modo Escuro', lightMode: 'Modo Claro'
  },
  ko: {
    platformOwnerAccess: '플랫폼 소유자 접근',
    welcomeBack: '다시 오신 것을 환영합니다', signInToAccess: '소유자 대시보드에 액세스하려면 로그인하세요',
    ownerEmail: '소유자 이메일', placeholderEmail: 'owner@frontdeskagents.com',
    password: '비밀번호', placeholderPassword: '비밀번호를 입력하세요',
    signIn: '로그인...', signingIn: '로그인 중...',
    accessOwnerDashboard: '소유자 대시보드 액세스',
    invalidCredentials: '잘못된 자격 증명',
    connectionError: '연결 실패. 다시 시도해 주세요.',
    backToFrontDesk: '← FrontDesk Agents로 돌아가기',
    darkMode: '다크 모드', lightMode: '라이트 모드'
  },
  ja: {
    platformOwnerAccess: 'プラットフォーム所有者アクセス',
    welcomeBack: 'おかえりなさい', signInToAccess: '所有者ダッシュボードにアクセスするにはログイン',
    ownerEmail: '所有者メール', placeholderEmail: 'owner@frontdeskagents.com',
    password: 'パスワード', placeholderPassword: 'パスワードを入力',
    signIn: 'ログイン...', signingIn: 'ログイン中...',
    accessOwnerDashboard: '所有者ダッシュボードにアクセス',
    invalidCredentials: '無効な資格情報',
    connectionError: '接続に失敗しました。もう一度お試しください。',
    backToFrontDesk: '← FrontDesk Agentsに戻る',
    darkMode: 'ダークモード', lightMode: 'ライトモード'
  },
  vi: {
    platformOwnerAccess: 'Truy cập Chủ sở hữu Nền tảng',
    welcomeBack: 'Chào mừng trở lại', signInToAccess: 'Đăng nhập để truy cập bảng điều khiển chủ sở hữu',
    ownerEmail: 'Email Chủ sở hữu', placeholderEmail: 'owner@frontdeskagents.com',
    password: 'Mật khẩu', placeholderPassword: 'Nhập mật khẩu của bạn',
    signIn: 'Đăng nhập...', signingIn: 'Đang đăng nhập...',
    accessOwnerDashboard: 'Truy cập Bảng điều khiển Chủ sở hữu',
    invalidCredentials: 'Thông tin xác thực không hợp lệ',
    connectionError: 'Kết nối thất bại. Vui lòng thử lại.',
    backToFrontDesk: '← Quay lại FrontDesk Agents',
    darkMode: 'Chế độ Tối', lightMode: 'Chế độ Sáng'
  },
  tl: {
    platformOwnerAccess: 'Access ng Platform Owner',
    welcomeBack: 'Maligayang Pagbabalik', signInToAccess: 'Mag-sign in para ma-access ang owner dashboard',
    ownerEmail: 'Email ng Owner', placeholderEmail: 'owner@frontdeskagents.com',
    password: 'Password', placeholderPassword: 'I-enter ang iyong password',
    signIn: 'Mag-sign in...', signingIn: 'Nag-s-sign in...',
    accessOwnerDashboard: 'I-access ang Owner Dashboard',
    invalidCredentials: 'Invalid credentials',
    connectionError: 'Nag-fail ang koneksyon. Pakitry ulit.',
    backToFrontDesk: '← Bumalik sa FrontDesk Agents',
    darkMode: 'Dark Mode', lightMode: 'Light Mode'
  },
  de: {
    platformOwnerAccess: 'Plattform-Besitzer-Zugang',
    welcomeBack: 'Willkommen zurück', signInToAccess: 'Melden Sie sich an, um auf das Besitzer-Dashboard zuzugreifen',
    ownerEmail: 'Besitzer-E-Mail', placeholderEmail: 'owner@frontdeskagents.com',
    password: 'Passwort', placeholderPassword: 'Geben Sie Ihr Passwort ein',
    signIn: 'Anmelden...', signingIn: 'Anmeldung läuft...',
    accessOwnerDashboard: 'Auf Besitzer-Dashboard zugreifen',
    invalidCredentials: 'Ungültige Anmeldedaten',
    connectionError: 'Verbindung fehlgeschlagen. Bitte versuchen Sie es erneut.',
    backToFrontDesk: '← Zurück zu FrontDesk Agents',
    darkMode: 'Dunkler Modus', lightMode: 'Heller Modus'
  },
  it: {
    platformOwnerAccess: 'Accesso Proprietario Piattaforma',
    welcomeBack: 'Bentornato', signInToAccess: 'Accedi per accedere alla dashboard del proprietario',
    ownerEmail: 'Email Proprietario', placeholderEmail: 'owner@frontdeskagents.com',
    password: 'Password', placeholderPassword: 'Inserisci la tua password',
    signIn: 'Accedi...', signingIn: 'Accesso in corso...',
    accessOwnerDashboard: 'Accedi alla Dashboard del Proprietario',
    invalidCredentials: 'Credenziali non valide',
    connectionError: 'Connessione fallita. Per favore riprova.',
    backToFrontDesk: '← Torna a FrontDesk Agents',
    darkMode: 'Modalità Scura', lightMode: 'Modalità Chiara'
  },
  ru: {
    platformOwnerAccess: 'Доступ владельца платформы',
    welcomeBack: 'С возвращением', signInToAccess: 'Войдите для доступа к панели владельца',
    ownerEmail: 'Email владельца', placeholderEmail: 'owner@frontdeskagents.com',
    password: 'Пароль', placeholderPassword: 'Введите ваш пароль',
    signIn: 'Войти...', signingIn: 'Вход...',
    accessOwnerDashboard: 'Доступ к панели владельца',
    invalidCredentials: 'Неверные учетные данные',
    connectionError: 'Ошибка подключения. Пожалуйста, попробуйте снова.',
    backToFrontDesk: '← Назад к FrontDesk Agents',
    darkMode: 'Темный режим', lightMode: 'Светлый режим'
  }
}

const getTranslation = (key: string, lang: string = 'en'): string => {
  return translations[lang]?.[key] || translations['en'][key] || key
}

export default function OwnerLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('sahjonycapitalllc@outlook.com')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isDark, setIsDark] = useState(true)
  const { lang, setLang, isRTL, handleLanguageChange } = useRTL()

  const t = (key: string) => getTranslation(key, lang)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/owner/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        router.push('/owner/dashboard')
      } else {
        setError(data.error || 'Invalid credentials')
      }
    } catch (err) {
      setError('Connection failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-black' : 'bg-gray-50'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Background Pattern */}
      <div className='fixed inset-0 opacity-30'>
        <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20' : 'bg-gradient-to-br from-purple-100 via-gray-50 to-pink-100'}`} />
        <div className='absolute top-0 left-0 w-full h-full' style={{
          backgroundImage: ` radial-gradient(circle at 25% 25%, ${isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)'} 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, ${isDark ? 'rgba(236, 72, 153, 0.1)' : 'rgba(236, 72, 153, 0.05)'} 0%, transparent 50%)`
        }} />
      </div>

      {/* Main Content */}
      <div className='relative min-h-screen flex items-center justify-center p-4' dir={isRTL ? 'rtl' : 'ltr'}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='w-full max-w-md'
        >
          {/* Language Selector */}
          <div className='flex justify-end mb-4'>
            <LanguageSelector currentLang={lang} onChange={handleLanguageChange} />
          </div>

          {/* Logo */}
          <div className='text-center mb-8'>
            <Link href='/' className='inline-flex items-center gap-3'>
              <div className='w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/25'>
                <Shield className='w-7 h-7 text-white' />
              </div>
              <div className='text-left'>
                <span className='font-bold text-2xl text-white'>FRONTDESK</span>
                <span className='ml-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold'>OWNER</span>
              </div>
            </Link>
            <p className={`mt-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('platformOwnerAccess')}
            </p>
          </div>

          {/* Login Card */}
          <div className={`p-8 rounded-3xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'} backdrop-blur-xl shadow-2xl`}>
            <div className='text-center mb-6'>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('welcomeBack')}
              </h1>
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {t('signInToAccess')}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className='mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3'
              >
                <AlertCircle className='w-5 h-5 text-red-500 flex-shrink-0' />
                <span className='text-sm text-red-400'>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className='space-y-5'>
              {/* Email Field */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('ownerEmail')}
                </label>
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl text-sm ${
                    isDark
                      ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500/20'
                      : 'bg-gray-100 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20'
                  } outline-none transition-all`}
                  placeholder={t('placeholderEmail')}
                  required
                />
              </div>

              {/* Password Field */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('password')}
                </label>
                <div className='relative'>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl text-sm ${
                      isDark
                        ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500/20'
                        : 'bg-gray-100 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20'
                    } outline-none transition-all pr-12`}
                    placeholder={t('placeholderPassword')}
                    required
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type='submit'
                disabled={loading}
                className='w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-bold text-sm hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
              >
                {loading ? (
                  <>
                    <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                    <span>{t('signingIn')}</span>
                  </>
                ) : (
                  <>
                    <Lock className='w-4 h-4' />
                    <span>{t('accessOwnerDashboard')}</span>
                  </>
                )}
              </button>
            </form>

            {/* Owner Credentials Info */}
            <div className={`mt-6 p-4 rounded-xl ${isDark ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-purple-50 border border-purple-200'}`}>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <strong className={isDark ? 'text-purple-400' : 'text-purple-600'}>Owner Account:</strong> sahjonycapitalllc@outlook.com
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className='mt-6 text-center'>
            <Link href='/' className={`text-sm ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
              ← Back to FrontDesk Agents
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}