'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, Loader2, CheckCircle, AlertCircle, Sun, Moon, Lock } from 'lucide-react'
import LanguageSelector from '../../components/LanguageSelector'

import { rtlLanguages } from '../../lib/rtl'

// Translations for all supported languages
const translations: Record<string, Record<string, string>> = {
  en: {
    resetPassword: 'Reset Password', enterEmail: 'Enter your email to receive a reset link',
    emailAddress: 'Email Address', placeholder: 'you@company.com',
    sendResetLink: 'Send Reset Link', sendingLink: 'Sending Link...',
    backToSignIn: 'Back to Sign In', rememberPassword: 'Remember your password? ', signIn: 'Sign in',
    checkYourEmail: 'Check Your Email', sentResetLink: 'We have sent a password reset link to',
    errorRequired: 'Email is required', errorInvalid: 'Please enter a valid email',
    connectionError: 'Connection failed. Please try again.', darkMode: 'Dark Mode', lightMode: 'Light Mode'
  },
  es: {
    resetPassword: 'Restablecer Contrasena', enterEmail: 'Ingresa tu email para recibir un enlace de restablecimiento',
    emailAddress: 'Direccion de Email', placeholder: 'tu@empresa.com',
    sendResetLink: 'Enviar Enlace de Restablecimiento', sendingLink: 'Enviando Enlace...',
    backToSignIn: 'Volver a Iniciar Sesion', rememberPassword: 'Recordaste tu contrasena? ', signIn: 'Iniciar sesion',
    checkYourEmail: 'Revisa Tu Email', sentResetLink: 'Hemos enviado un enlace de restablecimiento de contrasena a',
    errorRequired: 'El email es requerido', errorInvalid: 'Por favor ingresa un email valido',
    connectionError: 'Error de conexion. Por favor intenta de nuevo.', darkMode: 'Modo Oscuro', lightMode: 'Modo Claro'
  },
  fr: {
    resetPassword: 'Reinitialiser le Mot de Passe', enterEmail: 'Entrez votre email pour recevoir un lien de reinitialisation',
    emailAddress: 'Adresse Email', placeholder: 'vous@entreprise.com',
    sendResetLink: 'Envoyer le Lien de Reinitialisation', sendingLink: 'Envoi du Lien...',
    backToSignIn: 'Retour a la Connexion', rememberPassword: 'Vous souvenez-vous de votre mot de passe? ', signIn: 'Se connecter',
    checkYourEmail: 'Verifiez Votre Email', sentResetLink: 'Nous avons envoye un lien de reinitialisation de mot de passe a',
    errorRequired: 'L email est requis', errorInvalid: 'Veuillez entrer un email valide',
    connectionError: 'Erreur de connexion. Veuillez reessayer.', darkMode: 'Mode Sombre', lightMode: 'Mode Clair'
  },
  zh: {
    resetPassword: 'Chong Zhi Mi Ma', enterEmail: 'Shu ru nin de youjian yijie shou dao chongzhi lianjie',
    emailAddress: 'Youjian Dizhi', placeholder: 'you@company.com',
    sendResetLink: 'Fa Song Chong Zhi Lian Jie', sendingLink: 'Zheng Zai Fa Song...',
    backToSignIn: 'Fan Hui Deng Lu', rememberPassword: 'Ji De Mi Ma Ma? ', signIn: 'Deng Lu',
    checkYourEmail: 'Jian Cha Nin De Youjian', sentResetLink: 'Women Yi Fa Song Mi Ma Chong Zhi Lian Jie Dao',
    errorRequired: 'Youjian Wei Bi Tian Xiang', errorInvalid: 'Qing Shu Ru You Xiao De Youjian',
    connectionError: 'Lian Jie Shi Bai. Qing Chong Shi.', darkMode: 'Shen Se Mo Shi', lightMode: 'Qian Se Mo Shi'
  },
  hi: {
    resetPassword: 'Paasvaard Reseet Karein', enterEmail: 'Apna email daal aur reset link praapt karein',
    emailAddress: 'Email Patra', placeholder: 'aap@company.com',
    sendResetLink: 'Reset Link Bhejein', sendingLink: 'Bhej Rahe Hain...',
    backToSignIn: 'Sign In Par Vaapis Jaein', rememberPassword: 'Paasvaard yaad hai? ', signIn: 'Sign In Karein',
    checkYourEmail: 'Apna Email Janch Karein', sentResetLink: 'Humne paasvaard reset link bheja hai',
    errorRequired: 'Email aavashyak hai', errorInvalid: 'Kripya ek maatar email daalein',
    connectionError: 'Konekshan fail. Krpaya punah prayaas karein.', darkMode: 'Daark Mood', lightMode: 'Light Mood'
  },
  ar: {
    resetPassword: 'إعادة تعيين كلمة المرور', enterEmail: 'أدخل بريدك الإلكتروني لتلقي رابط إعادة التعيين',
    emailAddress: 'عنوان البريد الإلكتروني', placeholder: 'you@company.com',
    sendResetLink: 'إرسال رابط إعادة التعيين', sendingLink: 'جارٍ الإرسال...',
    backToSignIn: 'العودة لتسجيل الدخول', rememberPassword: 'تذكرت كلمة المرور؟ ', signIn: 'تسجيل الدخول',
    checkYourEmail: 'تحقق من بريدك الإلكتروني', sentResetLink: 'لقد أرسلنا رابط إعادة تعيين كلمة المرور إلى',
    errorRequired: 'البريد الإلكتروني مطلوب', errorInvalid: 'يرجى إدخال بريد إلكتروني صالح',
    connectionError: 'فشل الاتصال. يرجى المحاولة مرة أخرى.', darkMode: 'الوضع الداكن', lightMode: 'الوضع الفاتح'
  },
  pt: {
    resetPassword: 'Redefinir Senha', enterEmail: 'Digite seu email para receber um link de redefinição',
    emailAddress: 'Endereço de Email', placeholder: 'voce@empresa.com',
    sendResetLink: 'Enviar Link de Redefinição', sendingLink: 'Enviando...',
    backToSignIn: 'Voltar ao Login', rememberPassword: 'Lembrou a senha? ', signIn: 'Entrar',
    checkYourEmail: 'Verifique Seu Email', sentResetLink: 'Enviamos um link de redefinição de senha para',
    errorRequired: 'Email é obrigatório', errorInvalid: 'Por favor insira um email válido',
    connectionError: 'Conexão falhou. Por favor tente novamente.', darkMode: 'Modo Escuro', lightMode: 'Modo Claro'
  },
  ko: {
    resetPassword: '비밀번호 재설정', enterEmail: '재설정 링크를 받으려면 이메일을 입력하세요',
    emailAddress: '이메일 주소', placeholder: 'you@company.com',
    sendResetLink: '재설정 링크 보내기', sendingLink: '보내는 중...',
    backToSignIn: '로그인으로 돌아가기', rememberPassword: '비밀번호 기억? ', signIn: '로그인',
    checkYourEmail: '이메일 확인', sentResetLink: '비밀번호 재설정 링크를 다음으로 보냈습니다:',
    errorRequired: '이메일은 필수입니다', errorInvalid: '유효한 이메일을 입력하세요',
    connectionError: '연결 실패. 다시 시도해 주세요.', darkMode: '다크 모드', lightMode: '라이트 모드'
  },
  ja: {
    resetPassword: 'パスワードリセット', enterEmail: 'リセットリンクを受け取るためにメールアドレスを入力してください',
    emailAddress: 'メールアドレス', placeholder: 'you@company.com',
    sendResetLink: 'リセットリンクを送信', sendingLink: '送信中...',
    backToSignIn: 'ログインに戻る', rememberPassword: 'パスワードを思い出しましたか？ ', signIn: 'ログイン',
    checkYourEmail: 'メールを確認', sentResetLink: 'パスワードリセットリンクを以下宛に送信しました:',
    errorRequired: 'メールアドレスは必須です', errorInvalid: '有効なメールアドレスを入力してください',
    connectionError: '接続に失敗しました。もう一度お試しください。', darkMode: 'ダークモード', lightMode: 'ライトモード'
  },
  vi: {
    resetPassword: 'Đặt Lại Mật Khẩu', enterEmail: 'Nhập email của bạn để nhận liên kết đặt lại',
    emailAddress: 'Địa chỉ Email', placeholder: 'ban@congty.com',
    sendResetLink: 'Gửi Liên Kết Đặt Lại', sendingLink: 'Đang gửi...',
    backToSignIn: ' Quay Lại Đăng Nhập', rememberPassword: 'Nhớ mật khẩu? ', signIn: 'Đăng nhập',
    checkYourEmail: 'Kiểm Tra Email', sentResetLink: 'Chúng tôi đã gửi liên kết đặt lại mật khẩu đến',
    errorRequired: 'Email là bắt buộc', errorInvalid: 'Vui lòng nhập email hợp lệ',
    connectionError: 'Kết nối thất bại. Vui lòng thử lại.', darkMode: 'Chế độ tối', lightMode: 'Chế độ sáng'
  },
  tl: {
    resetPassword: 'I-reset ang Password', enterEmail: 'Ilagay ang iyong email para makatanggap ng reset link',
    emailAddress: 'Email Address', placeholder: 'ikaw@compania.com',
    sendResetLink: 'Magpadala ng Reset Link', sendingLink: 'Nagpapadala...',
    backToSignIn: 'Bumalik sa Sign In', rememberPassword: 'Naalala ang password? ', signIn: 'Mag-sign In',
    checkYourEmail: 'Suriin ang Email', sentResetLink: 'Nagpadala kami ng password reset link sa',
    errorRequired: 'Email ay kinakailangan', errorInvalid: 'Mangyaring maglagay ng valid na email',
    connectionError: 'Hindi nagtagumpay ang koneksyon. Pakisubukan muli.', darkMode: 'Dark Mode', lightMode: 'Light Mode'
  },
  de: {
    resetPassword: 'Passwort Zurücksetzen', enterEmail: 'Geben Sie Ihre E-Mail ein, um einen Zurücksetzungslink zu erhalten',
    emailAddress: 'E-Mail-Adresse', placeholder: 'sie@unternehmen.com',
    sendResetLink: 'Zurücksetzungslink Senden', sendingLink: 'Wird gesendet...',
    backToSignIn: 'Zurück zur Anmeldung', rememberPassword: 'Passwort erinnert? ', signIn: 'Anmelden',
    checkYourEmail: 'Überprüfen Sie Ihre E-Mail', sentResetLink: 'Wir haben einen Passwort-Zurücksetzungslink gesendet an',
    errorRequired: 'E-Mail ist erforderlich', errorInvalid: 'Bitte geben Sie eine gültige E-Mail ein',
    connectionError: 'Verbindung fehlgeschlagen. Bitte versuchen Sie es erneut.', darkMode: 'Dunkelmodus', lightMode: 'Hellmodus'
  },
  it: {
    resetPassword: 'Reimposta Password', enterEmail: 'Inserisci la tua email per ricevere un link di reimpostazione',
    emailAddress: 'Indirizzo Email', placeholder: 'tu@azienda.com',
    sendResetLink: 'Invia Link di Reimpostazione', sendingLink: 'Invio in corso...',
    backToSignIn: 'Torna al Login', rememberPassword: 'Ricordi la password? ', signIn: 'Accedi',
    checkYourEmail: 'Controlla la tua Email', sentResetLink: 'Abbiamo inviato un link di reimpostazione password a',
    errorRequired: 'Email è obbligatoria', errorInvalid: 'Per favore inserisci un email valido',
    connectionError: 'Connessione fallita. Per favore riprova.', darkMode: 'Modalità Scura', lightMode: 'Modalità Chiara'
  },
  ru: {
    resetPassword: 'Сбросить Пароль', enterEmail: 'Введите ваш email для получения ссылки на сброс',
    emailAddress: 'Адрес электронной почты', placeholder: 'you@company.com',
    sendResetLink: 'Отправить Ссылку для Сброса', sendingLink: 'Отправка...',
    backToSignIn: 'Вернуться к Входу', rememberPassword: 'Помните пароль? ', signIn: 'Войти',
    checkYourEmail: 'Проверьте Почту', sentResetLink: 'Мы отправили ссылку для сброса пароля на',
    errorRequired: 'Email обязателен', errorInvalid: 'Пожалуйста, введите корректный email',
    connectionError: 'Ошибка подключения. Пожалуйста, попробуйте снова.', darkMode: 'Тёмный режим', lightMode: 'Светлый режим'
  }
}

const getTranslation = (key: string, lang: string = 'en'): string => {
  return translations[lang]?.[key] || translations['en'][key] || key
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [isDark, setIsDark] = useState(true)
  const [language, setLanguage] = useState('en')
  const [isRTL, setIsRTL] = useState(false)

  useEffect(() => {
    const savedLang = localStorage.getItem('preferred-language') || 'en'
    setLanguage(savedLang)
    setIsRTL(rtlLanguages.includes(savedLang))
    
    const handleLanguageChange = (e: CustomEvent) => {
      setLanguage(e.detail)
      setIsRTL(rtlLanguages.includes(e.detail))
    }
    window.addEventListener('languageChange', handleLanguageChange as EventListener)
    return () => window.removeEventListener('languageChange', handleLanguageChange as EventListener)
  }, [])

  const handleLangChange = (newLang: string) => {
    setLanguage(newLang)
    setIsRTL(rtlLanguages.includes(newLang))
    localStorage.setItem('preferred-language', newLang)
    window.dispatchEvent(new CustomEvent('languageChange', { detail: newLang }))
  }

  const t = (key: string) => getTranslation(key, language)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/customer/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to send reset link')
        setIsLoading(false)
        return
      }

      setIsSuccess(true)
    } catch (err) {
      setError('Connection failed. Please try again.')
    }
    setIsLoading(false)
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-black' : 'bg-gray-50'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className={`fixed top-0 w-full z-50 ${isDark ? 'bg-black/90' : 'bg-white/90'} backdrop-blur-md border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
        <div className='max-w-7xl mx-auto px-6 py-4 flex justify-between items-center'>
          <Link href='/' className='flex items-center gap-2'>
            <div className='w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center'>
              <Lock className='w-4 h-4 text-white' />
            </div>
            <span className={`font-bold text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>FRONTDESK</span>
          </Link>
          <div className='flex items-center gap-3'>
            <LanguageSelector currentLang={language} onChange={handleLangChange} />
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-full transition-colors ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
              title={isDark ? t('lightMode') : t('darkMode')}
            >
              {isDark ? <Sun className='w-5 h-5' /> : <Moon className='w-5 h-5' />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='min-h-screen flex items-center justify-center px-4 pt-24'>
        <div className='w-full max-w-md'>
          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-8 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}
            >
              <div className='text-center'>
                <div className={`w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center ${isDark ? 'bg-green-500/20' : 'bg-green-100'}`}>
                  <CheckCircle className={`w-8 h-8 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                </div>
                <h1 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('checkYourEmail')}
                </h1>
                <p className={`mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('sentResetLink')} <span className='font-medium text-green-500'>{email}</span>
                </p>
                <Link
                  href='/customer/login'
                  className='inline-flex items-center gap-2 text-green-500 hover:text-green-400 font-medium'
                >
                  <ArrowRight className='w-4 h-4' />
                  {t('backToSignIn')}
                </Link>
              </div>
            </motion.div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className='text-center mb-12'
              >
                <h1 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {t('resetPassword')}
                </h1>
                <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('enterEmail')}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className={`p-8 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}
              >
                <form onSubmit={handleSubmit} className='space-y-6'>
                  {error && (
                    <div className={`flex items-center gap-2 p-4 rounded-xl ${isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'}`}>
                      <AlertCircle className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                      <span className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</span>
                    </div>
                  )}

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('emailAddress')}
                    </label>
                    <div className='relative'>
                      <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <input
                        type='email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('placeholder')}
                        className={`w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-all ${
                          isDark 
                            ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-green-500/50' 
                            : 'bg-gray-100 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-green-500'
                        }`}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type='submit'
                    disabled={isLoading}
                    className='w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all'
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className='w-5 h-5 animate-spin' />
                        {t('sendingLink')}
                      </>
                    ) : (
                      <>
                        {t('sendResetLink')}
                        <ArrowRight className='w-5 h-5' />
                      </>
                    )}
                  </button>
                </form>

                <div className={`mt-6 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('rememberPassword')}
                  <Link href='/customer/login' className='text-green-500 hover:text-green-400 font-medium'>
                    {t('signIn')}
                  </Link>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}