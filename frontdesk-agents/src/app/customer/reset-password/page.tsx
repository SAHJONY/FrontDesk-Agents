'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, Loader2, CheckCircle, AlertCircle, Sun, Moon, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import LanguageSelector from '../../components/LanguageSelector'

import { rtlLanguages } from '../../lib/rtl'

// Translations for all supported languages
const translations: Record<string, Record<string, string>> = {
  en: {
    newPassword: 'New Password', enterNewPassword: 'Enter your new password below',
    password: 'Password', confirmPassword: 'Confirm Password', placeholderNew: 'Enter new password',
    placeholderConfirm: 'Confirm new password', minLength: 'Must be at least 8 characters',
    resetPassword: 'Reset Password', resetting: 'Resetting...',
    invalidResetLink: 'Invalid Reset Link', expiredMessage: 'This password reset link has expired or is invalid. Please request a new one.',
    requestNewLink: 'Request New Link',
    passwordResetComplete: 'Password Reset Complete', successfullyReset: 'Your password has been reset successfully.',
    signIn: 'Sign In', passwordsDoNotMatch: 'Passwords do not match',
    processingResetLink: 'Processing reset link...',
    errorRequired: 'Password is required', errorMismatch: 'Passwords do not match', errorLength: 'Password must be at least 8 characters',
    connectionError: 'Connection failed. Please try again.',
    darkMode: 'Dark Mode', lightMode: 'Light Mode'
  },
  es: {
    newPassword: 'Nueva Contraseña', enterNewPassword: 'Ingresa tu nueva contraseña abajo',
    password: 'Contraseña', confirmPassword: 'Confirmar Contraseña', placeholderNew: 'Ingresa nueva contraseña',
    placeholderConfirm: 'Confirmar nueva contraseña', minLength: 'Debe tener al menos 8 caracteres',
    resetPassword: 'Restablecer Contraseña', resetting: 'Restableciendo...',
    invalidResetLink: 'Enlace de Restablecimiento Inválido', expiredMessage: 'Este enlace de restablecimiento ha expirado o es inválido. Por favor solicita uno nuevo.',
    requestNewLink: 'Solicitar Nuevo Enlace',
    passwordResetComplete: 'Restablecimiento de Contraseña Completo', successfullyReset: 'Tu contraseña ha sido restablecida exitosamente.',
    signIn: 'Iniciar Sesión', passwordsDoNotMatch: 'Las contraseñas no coinciden',
    processingResetLink: 'Procesando enlace de restablecimiento...',
    errorRequired: 'La contraseña es requerida', errorMismatch: 'Las contraseñas no coinciden', errorLength: 'La contraseña debe tener al menos 8 caracteres',
    connectionError: 'Error de conexión. Por favor intenta de nuevo.',
    darkMode: 'Modo Oscuro', lightMode: 'Modo Claro'
  },
  fr: {
    newPassword: 'Nouveau Mot de Passe', enterNewPassword: 'Entrez votre nouveau mot de passe ci-dessous',
    password: 'Mot de Passe', confirmPassword: 'Confirmer le Mot de Passe', placeholderNew: 'Entrez nouveau mot de passe',
    placeholderConfirm: 'Confirmer nouveau mot de passe', minLength: 'Doit avoir au moins 8 caractères',
    resetPassword: 'Réinitialiser le Mot de Passe', resetting: 'Réinitialisation...',
    invalidResetLink: 'Lien de Réinitialisation Invalide', expiredMessage: 'Ce lien de réinitialisation a expiré ou est invalide. Veuillez en demander un nouveau.',
    requestNewLink: 'Demander un Nouveau Lien',
    passwordResetComplete: 'Réinitialisation du Mot de Passe Complète', successfullyReset: 'Votre mot de passe a été réinitialisé avec succès.',
    signIn: 'Se Connecter', passwordsDoNotMatch: 'Les mots de passe ne correspondent pas',
    processingResetLink: 'Traitement du lien de réinitialisation...',
    errorRequired: 'Le mot de passe est requis', errorMismatch: 'Les mots de passe ne correspondent pas', errorLength: 'Le mot de passe doit avoir au moins 8 caractères',
    connectionError: 'Erreur de connexion. Veuillez réessayer.',
    darkMode: 'Mode Sombre', lightMode: 'Mode Clair'
  },
  zh: {
    newPassword: '新密码', enterNewPassword: '请在下方输入您的新密码',
    password: '密码', confirmPassword: '确认密码', placeholderNew: '输入新密码',
    placeholderConfirm: '确认新密码', minLength: '必须至少8个字符',
    resetPassword: '重置密码', resetting: '正在重置...',
    invalidResetLink: '无效的重置链接', expiredMessage: '此密码重置链接已过期或无效。请请求新的链接。',
    requestNewLink: '请求新链接',
    passwordResetComplete: '密码重置完成', successfullyReset: '您的密码已成功重置。',
    signIn: '登录', passwordsDoNotMatch: '密码不匹配',
    processingResetLink: '正在处理重置链接...',
    errorRequired: '密码为必填项', errorMismatch: '密码不匹配', errorLength: '密码必须至少8个字符',
    connectionError: '连接失败。请重试。',
    darkMode: '深色模式', lightMode: '浅色模式'
  },
  hi: {
    newPassword: 'नया पासवर्ड', enterNewPassword: 'नीचे अपना नया पासवर्ड दर्ज करें',
    password: 'पासवर्ड', confirmPassword: 'पासवर्ड की पुष्टि करें', placeholderNew: 'नया पासवर्ड दर्ज करें',
    placeholderConfirm: 'नया पासवर्ड दोबारा दर्ज करें', minLength: 'कम से कम 8 अक्षर होने चाहिए',
    resetPassword: 'पासवर्ड रीसेट करें', resetting: 'रीसेट हो रहा है...',
    invalidResetLink: 'अमान्य रीसेट लिंक', expiredMessage: 'यह पासवर्ड रीसेट लिंक समाप्त हो गया है या अमान्य है। कृपया एक नया अनुरोध करें।',
    requestNewLink: 'नया लिंक अनुरोध करें',
    passwordResetComplete: 'पासवर्ड रीसेट पूर्ण', successfullyReset: 'आपका पासवर्ड सफलतापूर्वक रीसेट हो गया है।',
    signIn: 'साइन इन', passwordsDoNotMatch: 'पासवर्ड मेल नहीं खाते',
    processingResetLink: 'रीसेट लिंक प्रोसेस हो रही है...',
    errorRequired: 'पासवर्ड आवश्यक है', errorMismatch: 'पासवर्ड मेल नहीं खाते', errorLength: 'पासवर्ड कम से कम 8 अक्षर का होना चाहिए',
    connectionError: 'कनेक्शन विफल। कृपया पुनः प्रयास करें।',
    darkMode: 'डार्क मोड', lightMode: 'लाइट मोड'
  },
  ar: {
    newPassword: 'كلمة المرور الجديدة', enterNewPassword: 'أدخل كلمة المرور الجديدة أدناه',
    password: 'كلمة المرور', confirmPassword: 'تأكيد كلمة المرور', placeholderNew: 'أدخل كلمة المرور الجديدة',
    placeholderConfirm: 'تأكيد كلمة المرور الجديدة', minLength: 'يجب أن تكون 8 أحرف على الأقل',
    resetPassword: 'إعادة تعيين كلمة المرور', resetting: 'جارٍ إعادة التعيين...',
    invalidResetLink: 'رابط إعادة التعيين غير صالح', expiredMessage: 'انتهت صلاحية رابط إعادة تعيين كلمة المرور أو غير صالح. يرجى طلب رابط جديد.',
    requestNewLink: 'طلب رابط جديد',
    passwordResetComplete: 'اكتمل إعادة تعيين كلمة المرور', successfullyReset: 'تمت إعادة تعيين كلمة المرور الخاصة بك بنجاح.',
    signIn: 'تسجيل الدخول', passwordsDoNotMatch: 'كلمات المرور غير متطابقة',
    processingResetLink: 'جارٍ معالجة رابط إعادة التعيين...',
    errorRequired: 'كلمة المرور مطلوبة', errorMismatch: 'كلمات المرور غير متطابقة', errorLength: 'يجب أن تكون كلمة المرور 8 أحرف على الأقل',
    connectionError: 'فشل الاتصال. يرجى المحاولة مرة أخرى.',
    darkMode: 'الوضع الداكن', lightMode: 'الوضع الفاتح'
  }
}

const getTranslation = (key: string, lang: string = 'en'): string => {
  return translations[lang]?.[key] || translations['en'][key] || key
}

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [isDark, setIsDark] = useState(true)
  const [language, setLanguage] = useState('en')
  const [isRTL, setIsRTL] = useState(false)
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)
  const [isProcessingToken, setIsProcessingToken] = useState(true)

  useEffect(() => {
    const savedLang = localStorage.getItem('preferred-language') || 'en'
    setLanguage(savedLang)
    setIsRTL(rtlLanguages.includes(savedLang))
    
    const handleLanguageChange = (e: CustomEvent) => {
      setLanguage(e.detail)
      setIsRTL(rtlLanguages.includes(e.detail))
    }
    window.addEventListener('languageChange', handleLanguageChange as EventListener)
  }, [])

  const handleLangChange = (newLang: string) => {
    setLanguage(newLang)
    setIsRTL(rtlLanguages.includes(newLang))
    localStorage.setItem('preferred-language', newLang)
    window.dispatchEvent(new CustomEvent('languageChange', { detail: newLang }))
  }

  useEffect(() => {
    const handleLanguageChange = (e: CustomEvent) => {
      setLanguage(e.detail)
      setIsRTL(rtlLanguages.includes(e.detail))
    }
    window.addEventListener('languageChange', handleLanguageChange as EventListener)
    
    // Process the reset token
    const processToken = async () => {
      setIsProcessingToken(true)
      
      try {
        const hash = window.location.hash
        const params = new URLSearchParams(hash.substring(1))
        
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')
        const type = searchParams.get('type')
        
        if (accessToken && refreshToken) {
          sessionStorage.setItem('supabase_access_token', accessToken)
          sessionStorage.setItem('supabase_refresh_token', refreshToken)
          setIsValidToken(true)
        } else if (type === 'recovery') {
          setIsValidToken(true)
        } else {
          const response = await fetch('/api/customer/session')
          const data = await response.json()
          if (data.authenticated) {
            setIsValidToken(true)
          } else {
            setIsValidToken(false)
          }
        }
      } catch (err) {
        console.error('Token processing error:', err)
        setIsValidToken(false)
      }
      
      setIsProcessingToken(false)
    }
    
    processToken()
    
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange as EventListener)
      sessionStorage.removeItem('supabase_access_token')
      sessionStorage.removeItem('supabase_refresh_token')
    }
  }, [searchParams])

  const t = (key: string) => getTranslation(key, language)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError(t('passwordsDoNotMatch'))
      return
    }

    if (password.length < 8) {
      setError(t('errorLength'))
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/customer/reset-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('supabase_access_token') || ''}`
        },
        body: JSON.stringify({ 
          newPassword: password, 
          confirmPassword,
          accessToken: sessionStorage.getItem('supabase_access_token'),
          refreshToken: sessionStorage.getItem('supabase_refresh_token')
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || t('connectionError'))
        setIsLoading(false)
        return
      }

      sessionStorage.removeItem('supabase_access_token')
      sessionStorage.removeItem('supabase_refresh_token')
      
      // Clear URL hash
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname)
      }
      
      setIsSuccess(true)
    } catch (err) {
      setError(t('connectionError'))
    }
    setIsLoading(false)
  }

  if (isProcessingToken) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
        <div className='text-center'>
          <Loader2 className={`w-8 h-8 animate-spin mx-auto mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`} />
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t('processingResetLink')}</p>
        </div>
      </div>
    )
  }

  if (isValidToken === false) {
    return (
      <div className={`min-h-screen flex items-center justify-center px-4 ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
        <div className={`text-center p-8 rounded-2xl max-w-md ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
          <AlertCircle className={`w-16 h-16 mx-auto mb-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
          <h1 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('invalidResetLink')}
          </h1>
          <p className={`mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('expiredMessage')}
          </p>
          <Link
            href='/customer/forgot-password'
            className='inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-bold text-white'
          >
            {t('requestNewLink')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-black' : 'bg-gray-50'}`} dir={isRTL ? 'rtl' : 'ltr'}>
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
            >
              {isDark ? <Sun className='w-5 h-5' /> : <Moon className='w-5 h-5' />}
            </button>
          </div>
        </div>
      </header>

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
                  {t('passwordResetComplete')}
                </h1>
                <p className={`mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('successfullyReset')}
                </p>
                <Link
                  href='/customer/login'
                  className='inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-bold text-white'
                >
                  {t('signIn')}
                  <ArrowRight className='w-4 h-4' />
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
                  {t('newPassword')}
                </h1>
                <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('enterNewPassword')}
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
                      {t('newPassword')}
                    </label>
                    <div className='relative'>
                      <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t('placeholderNew')}
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
                    <p className={`mt-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {t('minLength')}
                    </p>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('confirmPassword')}
                    </label>
                    <div className='relative'>
                      <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={t('placeholderConfirm')}
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
                        {t('resetting')}
                      </>
                    ) : (
                      <>
                        {t('resetPassword')}
                        <ArrowRight className='w-5 h-5' />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

function ResetPasswordLoading() {
  return (
    <div className={`min-h-screen flex items-center justify-center bg-black`}>
      <div className='text-center'>
        <Loader2 className='w-8 h-8 animate-spin mx-auto mb-4 text-white' />
        <p className='text-gray-400'>Loading...</p>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordForm />
    </Suspense>
  )
}