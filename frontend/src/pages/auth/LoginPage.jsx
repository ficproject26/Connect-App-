import React, { useState, useEffect } from 'react';
import { 
  Mail, Lock, Eye, EyeOff, LogIn, ShieldCheck, Check, Phone, AlertCircle, CheckCircle2,
  User, Store, Wrench, UtensilsCrossed, Bed, Plane, ShoppingCart, 
  Briefcase, Tag, LayoutGrid, Headphones, Award, ShoppingBag, Globe, X, KeyRound, ArrowLeft 
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import logoImg from '../../assets/images/forge india logo.jpg';
import { SUPPORTED_LANGUAGES, getStoredLanguage, setStoredLanguage, t } from '../../utils/i18n';

export default function LoginPage({ onAuthSuccess, onBackToHome, onNavigateToJoinNow }) {
  const { login } = useAuth();
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' | 'otp'

  // Language State
  const [currentLang, setCurrentLang] = useState(() => getStoredLanguage());
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  // Password Mode States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // OTP Mode States
  const [otpTarget, setOtpTarget] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [generatedOtpCode, setGeneratedOtpCode] = useState('');
  const [otpSuccessMsg, setOtpSuccessMsg] = useState('');

  // Status States
  const [errorMsg, setErrorMsg] = useState('');
  const [isNotRegistered, setIsNotRegistered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Forgot Password Modal States
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: input identifier, 2: input otp and new password
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotCooldown, setForgotCooldown] = useState(0);

  // Dynamic API Base URL
  const getApiBase = () => {
    const formatApiUrl = (raw) => {
      if (!raw) return '';
      let clean = raw.trim().replace(/\/+$/, '');
      if (!clean.startsWith('http://') && !clean.startsWith('https://')) clean = `http://${clean}`;
      return `${clean}/api`;
    };

    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    if (isHttps) {
      if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.startsWith('https://')) {
        return formatApiUrl(import.meta.env.VITE_API_URL);
      }
      return '/api';
    }

    if (import.meta.env.VITE_API_URL) return formatApiUrl(import.meta.env.VITE_API_URL);
    if (typeof window === 'undefined') return 'http://localhost:8001/api';
    const hostname = window.location.hostname;
    if (!hostname || hostname === 'localhost' || hostname === '127.0.0.1' ||
        hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.startsWith('172.')) {
      return `http://${hostname || 'localhost'}:8001/api`;
    }
    return 'https://api.ficapp.in/api';
  };

  // Cooldown timer for Login OTP
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => setResendCooldown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Cooldown timer for Forgot Password OTP
  useEffect(() => {
    let timer;
    if (forgotCooldown > 0) {
      timer = setInterval(() => setForgotCooldown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [forgotCooldown]);

  // Handler for Language Change
  const handleLanguageSelect = (langCode) => {
    setCurrentLang(langCode);
    setStoredLanguage(langCode);
    setIsLangDropdownOpen(false);
  };

  // Handler for Password Login
  const handlePasswordSubmit = async (e) => {
    e?.preventDefault();
    setErrorMsg('');
    setIsNotRegistered(false);

    if (!email.trim() || !password) {
      setErrorMsg(t('enterBothFields', currentLang));
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${getApiBase()}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          phone: email.trim(),
          password,
          role: 'customer'
        })
      }).catch(() => null);

      if (!res) {
        setIsSubmitting(false);
        setErrorMsg(t('networkError', currentLang));
        return;
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setIsSubmitting(false);
        if (res.status === 403 || data.code === 'ACCOUNT_INACTIVE') {
          setErrorMsg(t('accountInactive', currentLang));
        } else if (res.status === 429 || data.code === 'RATE_LIMIT_EXCEEDED') {
          setErrorMsg(data.message || 'Too many attempts. Please try again later.');
        } else if (res.status === 401 || res.status === 404 || data.code === 'INVALID_CREDENTIALS' || data.code === 'ACCOUNT_NOT_FOUND') {
          setErrorMsg(t('invalidCredentials', currentLang));
        } else {
          setErrorMsg(t('invalidCredentials', currentLang));
        }
        return;
      }

      // Successful DB authentication
      setIsSubmitting(false);
      setSuccess(true);
      const loggedUser = data.user || { email: email.trim(), role: 'customer' };
      login({ ...loggedUser, _isExplicitAuth: true }, 'customer', (finalUser) => {
        setTimeout(() => {
          setSuccess(false);
          if (onAuthSuccess) onAuthSuccess(finalUser);
        }, 600);
      });

    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg(t('authError', currentLang));
    }
  };

  // Handler for Login OTP Send
  const handleSendOtp = async () => {
    const target = otpTarget.trim();
    if (!target) {
      setErrorMsg(t('validMobile', currentLang));
      return;
    }

    setErrorMsg('');
    setIsNotRegistered(false);
    setOtpSuccessMsg('');
    setIsSubmitting(true);

    try {
      const res = await fetch(`${getApiBase()}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: target,
          mobileNumber: target,
          mobileOrEmail: target
        })
      });

      const data = await res.json().catch(() => ({}));
      setIsSubmitting(false);

      if (!res.ok) {
        const errMsg = data.message || data.msg || data.error || '';
        if (res.status === 404 || data.notRegistered || data.code === 'MOBILE_NOT_REGISTERED') {
          setIsNotRegistered(true);
          setErrorMsg(t('accountNotFound', currentLang));
        } else if (res.status === 403 || data.code === 'ACCOUNT_INACTIVE') {
          setErrorMsg(t('accountInactive', currentLang));
        } else if (res.status === 429) {
          setErrorMsg(errMsg || 'Please wait before requesting another OTP.');
        } else {
          setErrorMsg(errMsg || 'Failed to send OTP. Please try again.');
        }
        return;
      }

      setIsOtpSent(true);
      setResendCooldown(data.cooldownSeconds || 30);
      setOtpSuccessMsg(`OTP sent successfully to ${target}. Valid for 5 minutes.`);

    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg(t('networkError', currentLang));
    }
  };

  // Handler for Login OTP Verification
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    if (!otpInput || otpInput.trim().length !== 6) {
      setErrorMsg('Please enter the full 6-digit OTP code.');
      return;
    }

    setErrorMsg('');
    setOtpSuccessMsg('');
    setIsSubmitting(true);

    try {
      const res = await fetch(`${getApiBase()}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: otpTarget.trim(),
          mobileNumber: otpTarget.trim(),
          otp: otpInput.trim()
        })
      });

      const data = await res.json().catch(() => ({}));
      setIsSubmitting(false);

      if (!res.ok) {
        if (res.status === 404 || data.notRegistered || data.code === 'MOBILE_NOT_REGISTERED') {
          setIsNotRegistered(true);
          setErrorMsg(t('accountNotFound', currentLang));
        } else if (res.status === 403 || data.code === 'ACCOUNT_INACTIVE') {
          setErrorMsg(t('accountInactive', currentLang));
        } else {
          setErrorMsg(data.message || 'Invalid or expired OTP code. Please try again.');
        }
        return;
      }

      // Successful OTP Verification
      setSuccess(true);
      const verifiedUser = data.user || { phone: otpTarget.trim(), role: 'customer' };
      login({ ...verifiedUser, _isExplicitAuth: true }, 'customer', (finalUser) => {
        setTimeout(() => {
          setSuccess(false);
          if (onAuthSuccess) onAuthSuccess(finalUser);
        }, 600);
      });

    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg(t('networkError', currentLang));
    }
  };

  // Handler for Forgot Password Send OTP
  const handleForgotSendOtp = async (e) => {
    e?.preventDefault();
    const idClean = forgotIdentifier.trim();
    if (!idClean) {
      setForgotError(t('enterBothFields', currentLang));
      return;
    }

    setForgotLoading(true);
    setForgotError('');
    setForgotSuccess('');

    try {
      const res = await fetch(`${getApiBase()}/auth/forgot-password/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: idClean })
      });
      const data = await res.json().catch(() => ({}));
      setForgotLoading(false);

      if (!res.ok) {
        setForgotError(data.message || 'Failed to send verification code. Please try again.');
        return;
      }

      setForgotStep(2);
      setForgotSuccess(t('otpSentSuccess', currentLang));
      if (data.cooldownSeconds) setForgotCooldown(data.cooldownSeconds);
    } catch (err) {
      setForgotLoading(false);
      setForgotError(t('networkError', currentLang));
    }
  };

  // Handler for Forgot Password Verify & Reset
  const handleForgotResetPassword = async (e) => {
    e?.preventDefault();
    const idClean = forgotIdentifier.trim();
    const otpClean = forgotOtp.trim();
    const passClean = forgotNewPassword;
    const confirmClean = forgotConfirmPassword;

    if (!otpClean || !passClean || !confirmClean) {
      setForgotError('Please fill in all fields.');
      return;
    }

    if (passClean.length < 8) {
      setForgotError(t('passwordMinLength', currentLang));
      return;
    }

    if (passClean !== confirmClean) {
      setForgotError(t('passwordsDoNotMatch', currentLang));
      return;
    }

    setForgotLoading(true);
    setForgotError('');
    setForgotSuccess('');

    try {
      const res = await fetch(`${getApiBase()}/auth/forgot-password/verify-and-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: idClean,
          otp: otpClean,
          newPassword: passClean,
          confirmPassword: confirmClean
        })
      });

      const data = await res.json().catch(() => ({}));
      setForgotLoading(false);

      if (!res.ok) {
        setForgotError(data.message || 'Failed to reset password. Please check your verification code.');
        return;
      }

      setForgotSuccess(t('passwordResetSuccess', currentLang));
      setEmail(idClean);
      setTimeout(() => {
        setIsForgotPasswordOpen(false);
        setForgotStep(1);
        setForgotOtp('');
        setForgotNewPassword('');
        setForgotConfirmPassword('');
        setForgotSuccess('');
        setErrorMsg('');
      }, 2000);

    } catch (err) {
      setForgotLoading(false);
      setForgotError(t('networkError', currentLang));
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50 dark:bg-[#070b14] overflow-hidden select-none font-sans relative">
      
      {/* ==================== LEFT PANEL: LOGIN FORM ==================== */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-8 md:p-10 lg:p-12 z-10 overflow-y-auto">
        
        {/* Top Navbar Header */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
              <img src={logoImg} alt="Connect Logo" className="w-full h-full object-cover" />
            </div>
            <div className="text-left">
              <h1 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider leading-none">
                CONNECT APP
              </h1>
              <p className="text-[9px] font-bold text-slate-400 tracking-wide uppercase mt-0.5">All Services, One Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Language Selector Toggle */}
            <div className="relative lg:hidden">
              <button 
                type="button"
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-200"
              >
                <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>{SUPPORTED_LANGUAGES.find(l => l.code === currentLang)?.nativeName || 'English'}</span>
                <span className="text-[9px] opacity-70">▼</span>
              </button>

              {isLangDropdownOpen && (
                <div className="absolute top-9 right-0 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden py-1.5 z-50 text-left animate-fade-in">
                  {SUPPORTED_LANGUAGES.map((lang) => {
                    const isSelected = currentLang === lang.code;
                    return (
                      <button
                        key={`m-${lang.code}`}
                        type="button"
                        onClick={() => handleLanguageSelect(lang.code)}
                        className={`w-full px-4 py-2 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer border-none text-left ${
                          isSelected
                            ? 'bg-[#FFB800]/20 text-[#003B95] dark:text-[#FFB800] font-black'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>{lang.nativeName} <span className="text-[10px] opacity-60">({lang.label})</span></span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              onClick={onBackToHome}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer border-none bg-transparent"
            >
              ← {t('home', currentLang)}
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-md mx-auto my-auto py-2">
          
          {success ? (
            <div className="text-center py-8 animate-fade-in">
              <div className="w-14 h-14 bg-amber-100 dark:bg-amber-950/50 text-[#FFB800] rounded-full flex items-center justify-center mx-auto mb-3 border border-amber-300 dark:border-amber-700 shadow-lg animate-bounce">
                <Check className="w-7 h-7 stroke-[3]" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">{t('welcomeBack', currentLang)}</h2>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                Authentication successful. Accessing your dashboard...
              </p>
            </div>
          ) : (
            <>
              {/* Title Header */}
              <div className="mb-4 sm:mb-5 text-left">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  Welcome <span className="text-[#FFB800]">Back!</span>
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-slate-400 mt-1">
                  {t('loginSubtitle', currentLang)}
                </p>
              </div>

              {/* Login Method Tabs */}
              <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl mb-4">
                <button
                  type="button"
                  onClick={() => { setLoginMethod('password'); setErrorMsg(''); setIsNotRegistered(false); setOtpSuccessMsg(''); }}
                  className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer border-none ${
                    loginMethod === 'password'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white bg-transparent'
                  }`}
                >
                  {t('passwordLogin', currentLang)}
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginMethod('otp'); setErrorMsg(''); setIsNotRegistered(false); setOtpSuccessMsg(''); }}
                  className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer border-none ${
                    loginMethod === 'otp'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white bg-transparent'
                  }`}
                >
                  {t('mobileOtpLogin', currentLang)}
                </button>
              </div>

              {/* Error Banner */}
              {errorMsg && (
                <div className="mb-3.5 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-start gap-2.5 animate-shake text-left">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                  <div className="flex-1">
                    <p>{errorMsg}</p>
                    {isNotRegistered && (
                      <button
                        type="button"
                        onClick={onNavigateToJoinNow}
                        className="mt-1.5 text-xs font-black underline hover:text-rose-700 dark:hover:text-rose-300 block cursor-pointer border-none bg-transparent p-0 text-left"
                      >
                        Click here to Register an Account →
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* 1. PASSWORD LOGIN FORM */}
              {loginMethod === 'password' ? (
                <form onSubmit={handlePasswordSubmit} className="space-y-3 sm:space-y-3.5">
                  
                  {/* Email / Phone Field */}
                  <div className="text-left">
                    <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                      {t('emailOrPhone', currentLang)}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errorMsg) setErrorMsg('');
                          if (isNotRegistered) setIsNotRegistered(false);
                        }}
                        placeholder={t('emailOrPhonePlaceholder', currentLang)}
                        className="w-full bg-slate-50/70 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl py-3 pl-10 pr-4 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="text-left">
                    <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                      {t('password', currentLang)}
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errorMsg) setErrorMsg('');
                          if (isNotRegistered) setIsNotRegistered(false);
                        }}
                        placeholder={t('passwordPlaceholder', currentLang)}
                        className="w-full bg-slate-50/70 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl py-3 pl-10 pr-10 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg border-none bg-transparent cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Options Row: Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between pt-0.5 pb-1">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-[#FFB800] focus:ring-[#FFB800] accent-[#FFB800] cursor-pointer"
                      />
                      <span>{t('rememberMe', currentLang)}</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setForgotIdentifier(email || '');
                        setForgotError('');
                        setForgotSuccess('');
                        setForgotStep(1);
                        setIsForgotPasswordOpen(true);
                      }}
                      className="text-xs font-extrabold text-[#003B95] dark:text-[#FFB800] hover:underline transition-all bg-transparent border-none cursor-pointer p-0"
                    >
                      {t('forgotPassword', currentLang)}
                    </button>
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-6 bg-[#FFB800] hover:bg-[#E5A700] text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 border-none active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>{t('loggingIn', currentLang)}</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>{t('loginToDashboard', currentLang)}</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* 2. MOBILE OTP LOGIN FORM */
                <div className="space-y-3.5">
                  <div className="text-left">
                    <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                      {t('mobileNumber', currentLang)}
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          maxLength={10}
                          value={otpTarget}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                            setOtpTarget(val);
                            if (errorMsg) setErrorMsg('');
                            if (isNotRegistered) setIsNotRegistered(false);
                          }}
                          placeholder={t('mobilePlaceholder', currentLang)}
                          className="w-full bg-slate-50/70 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl py-3 pl-10 pr-4 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 transition-all tracking-wider"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isSubmitting || resendCooldown > 0 || otpTarget.length < 10}
                        className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs rounded-2xl transition-all cursor-pointer whitespace-nowrap shadow-sm border-none shrink-0"
                      >
                        {isSubmitting ? t('sendingOtp', currentLang) : isOtpSent ? (resendCooldown > 0 ? `${t('resendIn', currentLang)} ${resendCooldown}${t('seconds', currentLang)}` : t('resendOtp', currentLang)) : t('sendOtp', currentLang)}
                      </button>
                    </div>
                  </div>

                  {otpSuccessMsg && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 text-left">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                      <span>{otpSuccessMsg}</span>
                    </div>
                  )}

                  {isOtpSent && (
                    <form onSubmit={handleVerifyOtp} className="space-y-3.5 pt-1 animate-fade-in">
                      <div className="text-left">
                        <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                          {t('enterOtp', currentLang)}
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={otpInput}
                          onChange={(e) => {
                            setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6));
                            if (errorMsg) setErrorMsg('');
                          }}
                          placeholder={t('otpPlaceholder', currentLang)}
                          className="w-full bg-slate-50/70 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl py-3 px-4 text-center text-sm font-black tracking-widest text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 transition-all"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting || otpInput.length < 6}
                        className="w-full py-3 px-6 bg-[#FFB800] hover:bg-[#E5A700] text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 border-none active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                            <span>{t('verifying', currentLang)}</span>
                          </>
                        ) : (
                          <>
                            <LogIn className="w-4 h-4" />
                            <span>{t('verifyAndLogin', currentLang)}</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Bottom Sign Up Redirect */}
              <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-slate-800/80 text-center">
                <p className="text-xs font-bold text-slate-500">
                  {t('dontHaveAccount', currentLang)}{' '}
                  <button
                    type="button"
                    onClick={onNavigateToJoinNow}
                    className="font-black text-[#003B95] dark:text-[#FFB800] hover:underline cursor-pointer border-none bg-transparent p-0 ml-1"
                  >
                    {t('signUp', currentLang)}
                  </button>
                </p>
              </div>
            </>
          )}

        </div>

        {/* Footer Security Badges */}
        <div className="flex items-center justify-center gap-2 text-slate-400 text-[10px] font-bold tracking-wide uppercase pt-4 shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Connect App Bank-Grade Security • UIDAI & Tax Verification Standards</span>
        </div>

      </div>

      {/* ==================== RIGHT PANEL: ECOSYSTEM & GRAPHIC SIDE ==================== */}
      <div className="hidden lg:flex w-1/2 h-full bg-gradient-to-br from-[#3b19b7] via-[#5b3af0] to-[#7c3aed] relative overflow-hidden flex-col justify-between p-8 lg:p-10 xl:p-12 text-white select-none">
        
        {/* Background Ambient Glows & Circular Orbits */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/40 rounded-full blur-[140px] pointer-events-none" />

        {/* Top Header: Language Selector */}
        <div className="flex justify-end z-20 shrink-0 relative">
          <button 
            type="button"
            onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
            className="bg-white/15 hover:bg-white/25 border border-white/20 px-3.5 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-2 backdrop-blur-md transition-all cursor-pointer text-white"
          >
            <Globe className="w-3.5 h-3.5 text-white/90" />
            <span>{SUPPORTED_LANGUAGES.find(l => l.code === currentLang)?.nativeName || 'English'}</span>
            <span className={`text-[10px] opacity-70 transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
          </button>

          {isLangDropdownOpen && (
            <div className="absolute top-10 right-0 w-44 bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden py-1.5 z-30 animate-fade-in text-left">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = currentLang === lang.code;
                return (
                  <button
                    key={`d-${lang.code}`}
                    type="button"
                    onClick={() => handleLanguageSelect(lang.code)}
                    className={`w-full px-4 py-2 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer border-none text-left ${
                      isSelected
                        ? 'bg-[#FFB800]/20 text-[#FFB800] font-black'
                        : 'text-white/90 hover:bg-white/10'
                    }`}
                  >
                    <span>{lang.nativeName} <span className="text-[10px] opacity-60">({lang.label})</span></span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#FFB800]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Center Graphic Section */}
        <div className="my-auto z-10 flex flex-col items-center text-center py-2">
          
          {/* Main Title & Tagline */}
          <div className="max-w-md mx-auto text-center mb-6">
            <h2 className="text-2xl lg:text-3xl xl:text-4xl font-black tracking-tight leading-tight">
              {t('everythingYouNeed', currentLang)}<br />{t('allInOnePlace', currentLang)}
            </h2>
            <div className="w-10 h-1 bg-white/40 rounded-full mx-auto my-2.5" />
            <p className="text-xs font-medium text-white/80 leading-relaxed max-w-sm mx-auto">
              {t('heroTagline', currentLang)}
            </p>
          </div>

          {/* Ecosystem Orbital Diagram */}
          <div className="relative w-64 h-64 lg:w-72 lg:h-72 flex items-center justify-center my-2">
            
            {/* Outer Dotted Orbit Circle */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/30 animate-spin-slow" />
            <div className="absolute inset-5 rounded-full border border-white/10" />

            {/* Central glowing logo circle */}
            <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-white p-1 flex items-center justify-center shadow-2xl shadow-purple-950/50 z-20 transform hover:scale-105 transition-transform cursor-pointer overflow-hidden border-2 border-white/80">
              <div className="w-16 h-16 rounded-full bg-[#5b3af0]/10 flex items-center justify-center text-[#5b3af0] font-black text-3xl">
                C
              </div>
            </div>

            {/* Orbit Category Floating Badges (7 Categories) */}
            
            {/* 1. Products (Top) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 flex flex-col items-center gap-0.5 group">
              <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-2xl bg-[#a855f7] text-white flex items-center justify-center shadow-lg shadow-purple-900/40 group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-md opacity-90">Products</span>
            </div>

            {/* 2. Food (Top Right) */}
            <div className="absolute top-12 right-2 flex flex-col items-center gap-0.5 group">
              <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-2xl bg-[#f59e0b] text-white flex items-center justify-center shadow-lg shadow-amber-900/40 group-hover:scale-110 transition-transform">
                <UtensilsCrossed className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-md opacity-90">Food</span>
            </div>

            {/* 3. Stay (Middle Right) */}
            <div className="absolute top-1/2 -translate-y-1/2 right-[-14px] flex flex-col items-center gap-0.5 group">
              <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-2xl bg-[#10b981] text-white flex items-center justify-center shadow-lg shadow-emerald-900/40 group-hover:scale-110 transition-transform">
                <Bed className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-md opacity-90">Stay</span>
            </div>

            {/* 4. Travel (Bottom Right) */}
            <div className="absolute bottom-10 right-3 flex flex-col items-center gap-0.5 group">
              <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-2xl bg-[#06b6d4] text-white flex items-center justify-center shadow-lg shadow-cyan-900/40 group-hover:scale-110 transition-transform">
                <Plane className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-md opacity-90">Travel</span>
            </div>

            {/* 5. Jobs (Bottom Left) */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5 group">
              <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-2xl bg-[#f43f5e] text-white flex items-center justify-center shadow-lg shadow-rose-900/40 group-hover:scale-110 transition-transform">
                <Briefcase className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-md opacity-90">Jobs</span>
            </div>

            {/* 6. Daily Needs (Bottom Left 2) */}
            <div className="absolute bottom-10 left-3 flex flex-col items-center gap-0.5 group">
              <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-2xl bg-[#22c55e] text-white flex items-center justify-center shadow-lg shadow-green-900/40 group-hover:scale-110 transition-transform">
                <ShoppingCart className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-md opacity-90">Daily Needs</span>
            </div>

            {/* 7. Services (Top Left) */}
            <div className="absolute top-12 left-2 flex flex-col items-center gap-0.5 group">
              <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-2xl bg-[#3b82f6] text-white flex items-center justify-center shadow-lg shadow-blue-900/40 group-hover:scale-110 transition-transform">
                <Wrench className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-md opacity-90">Services</span>
            </div>

          </div>

        </div>

        {/* Bottom Security Trust Box */}
        <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between text-left shrink-0 z-10 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-400/30 border border-purple-300/40 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h3 className="text-xs font-black text-white">{t('securePlatform', currentLang)}</h3>
              <p className="text-[10px] text-white/80 font-medium leading-tight mt-0.5">
                {t('securePlatformDesc', currentLang)}
              </p>
            </div>
          </div>
          
          <div className="w-8 h-8 rounded-xl bg-purple-400/30 border border-purple-300/40 flex items-center justify-center shrink-0 ml-2">
            <Lock className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

      </div>

      {/* ==================== FORGOT PASSWORD MODAL ==================== */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in text-slate-800 dark:text-slate-200">
          <div onClick={() => setIsForgotPasswordOpen(false)} className="absolute inset-0" />

          <div className="relative bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 z-10 text-left">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <KeyRound className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                    {t('resetPasswordTitle', currentLang)}
                  </h3>
                  <p className="text-[11px] font-semibold text-slate-400">
                    {forgotStep === 1 ? t('resetPasswordSubtitle', currentLang) : 'Enter OTP code & create your new password'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsForgotPasswordOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center border-none cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error & Success Messages */}
            {forgotError && (
              <div className="mb-3.5 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <p className="flex-1">{forgotError}</p>
              </div>
            )}

            {forgotSuccess && (
              <div className="mb-3.5 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                <p className="flex-1">{forgotSuccess}</p>
              </div>
            )}

            {/* Step 1: Input Identifier (Email / Phone) */}
            {forgotStep === 1 && (
              <form onSubmit={handleForgotSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    {t('emailOrPhone', currentLang)}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={forgotIdentifier}
                      onChange={(e) => {
                        setForgotIdentifier(e.target.value);
                        setForgotError('');
                      }}
                      placeholder={t('emailOrPhonePlaceholder', currentLang)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-10 pr-4 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(false)}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-xs rounded-xl transition-all cursor-pointer border-none"
                  >
                    {t('backToLogin', currentLang)}
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading || !forgotIdentifier.trim()}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 border-none"
                  >
                    {forgotLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{t('sendingOtp', currentLang)}</span>
                      </>
                    ) : (
                      <span>{t('sendOtp', currentLang)}</span>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Input OTP & New Password */}
            {forgotStep === 2 && (
              <form onSubmit={handleForgotResetPassword} className="space-y-3.5">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                      {t('enterOtp', currentLang)}
                    </label>
                    {forgotCooldown > 0 ? (
                      <span className="text-[10px] font-bold text-slate-400">
                        {t('resendIn', currentLang)} {forgotCooldown}{t('seconds', currentLang)}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleForgotSendOtp}
                        className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline bg-transparent border-none cursor-pointer p-0"
                      >
                        {t('resendOtp', currentLang)}
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={forgotOtp}
                    onChange={(e) => {
                      setForgotOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                      setForgotError('');
                    }}
                    placeholder={t('otpPlaceholder', currentLang)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-2.5 px-4 text-center text-sm font-black tracking-widest text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    {t('newPassword', currentLang)}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showForgotNewPassword ? "text" : "password"}
                      required
                      value={forgotNewPassword}
                      onChange={(e) => {
                        setForgotNewPassword(e.target.value);
                        setForgotError('');
                      }}
                      placeholder={t('newPasswordPlaceholder', currentLang)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-2.5 pl-10 pr-10 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 border-none bg-transparent cursor-pointer"
                    >
                      {showForgotNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    {t('confirmNewPassword', currentLang)}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showForgotConfirmPassword ? "text" : "password"}
                      required
                      value={forgotConfirmPassword}
                      onChange={(e) => {
                        setForgotConfirmPassword(e.target.value);
                        setForgotError('');
                      }}
                      placeholder={t('confirmNewPasswordPlaceholder', currentLang)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-2.5 pl-10 pr-10 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 border-none bg-transparent cursor-pointer"
                    >
                      {showForgotConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => { setForgotStep(1); setForgotError(''); setForgotSuccess(''); }}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-xs rounded-xl transition-all cursor-pointer border-none flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading || forgotOtp.length < 6 || !forgotNewPassword || !forgotConfirmPassword}
                    className="flex-[2] py-2.5 bg-[#FFB800] hover:bg-[#E5A700] disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 border-none"
                  >
                    {forgotLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>{t('resetting', currentLang)}</span>
                      </>
                    ) : (
                      <span>{t('resetPasswordBtn', currentLang)}</span>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
