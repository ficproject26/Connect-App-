import React, { useState, useEffect } from 'react';
import { 
  Mail, Lock, Eye, EyeOff, LogIn, ShieldCheck, Check, Phone, AlertCircle, CheckCircle2,
  User, Store, Wrench, UtensilsCrossed, Bed, Plane, ShoppingCart, 
  Briefcase, Tag, LayoutGrid, Headphones, Award, ShoppingBag, Globe 
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import logoImg from '../../assets/images/forge india logo.jpg';

export default function LoginPage({ onAuthSuccess, onBackToHome, onNavigateToJoinNow }) {
  const { login } = useAuth();
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' | 'otp'

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

  // Dynamic API Base URL
  const getApiBase = () => {
    if (import.meta.env.VITE_API_URL) return `${import.meta.env.VITE_API_URL}/api`;
    if (typeof window === 'undefined') return 'http://localhost:8001/api';
    const hostname = window.location.hostname;
    if (!hostname || hostname === 'localhost' || hostname === '127.0.0.1' ||
        hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.startsWith('172.')) {
      return `http://${hostname || 'localhost'}:8001/api`;
    }
    return 'https://api.ficapp.in/api';
  };

  // Cooldown timer for OTP
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => setResendCooldown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handler for Password Login
  const handlePasswordSubmit = async (e) => {
    e?.preventDefault();
    setErrorMsg('');
    setIsNotRegistered(false);

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email/phone and password.');
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
        setErrorMsg('Unable to connect to server. Please check your internet connection.');
        return;
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setIsSubmitting(false);
        if (res.status === 404 || data.notRegistered || data.code === 'ACCOUNT_NOT_FOUND' || (data.message && data.message.toLowerCase().includes('not found'))) {
          setIsNotRegistered(true);
          setErrorMsg('Account not found. Please register to continue.');
        } else if (res.status === 403 || data.code === 'ACCOUNT_INACTIVE') {
          setErrorMsg(data.message || 'Your account is inactive or suspended. Please contact support.');
        } else {
          setErrorMsg(data.message || 'Invalid password. Please try again.');
        }
        return;
      }

      // Successful DB authentication
      setIsSubmitting(false);
      setSuccess(true);
      const loggedUser = data.user || { email: email.trim(), role: 'customer' };
      login(loggedUser, 'customer', (finalUser) => {
        setTimeout(() => {
          setSuccess(false);
          if (onAuthSuccess) onAuthSuccess(finalUser);
        }, 600);
      });

    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg('Authentication error. Please try again.');
    }
  };

  // Handler for OTP Send
  const handleSendOtp = async () => {
    const target = otpTarget.trim();
    if (!target) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
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
      }).catch(() => null);

      if (!res) {
        setIsSubmitting(false);
        setErrorMsg('Unable to connect to server. Please check your internet connection.');
        return;
      }

      const data = await res.json().catch(() => ({}));

      if (res.ok && (data.status === 'success' || data.success)) {
        setIsSubmitting(false);
        const issuedCode = data.devOtpPreview || data.otp || '';
        setGeneratedOtpCode(issuedCode);
        setIsOtpSent(true);
        setResendCooldown(data.cooldownSeconds || 30);
        setOtpSuccessMsg(issuedCode ? `OTP Sent Successfully! Security Code: ${issuedCode}` : `OTP Sent Successfully to ${target}!`);
        return;
      } else {
        setIsSubmitting(false);
        if (res.status === 404 || data.notRegistered || data.code === 'MOBILE_NOT_REGISTERED' || (data.message && data.message.toLowerCase().includes('not registered'))) {
          setIsNotRegistered(true);
          setErrorMsg('This mobile number is not registered. Please register to continue.');
        } else if (res.status === 403 || data.code === 'ACCOUNT_INACTIVE') {
          setErrorMsg(data.message || 'Your account is inactive or suspended. Please contact support.');
        } else {
          setErrorMsg(data.message || 'Failed to send OTP. Please try again.');
        }
        return;
      }
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg('Network error requesting OTP. Please try again.');
    }
  };

  // Handler for OTP Verification
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    if (!otpInput || otpInput.length < 6) {
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
          phone: otpTarget,
          mobileNumber: otpTarget,
          mobileOrEmail: otpTarget,
          otp: otpInput
        })
      }).catch(() => null);

      if (!res) {
        setIsSubmitting(false);
        setErrorMsg('Unable to connect to server. Please check your internet connection.');
        return;
      }

      const data = await res.json().catch(() => ({}));

      if (res.ok && (data.status === 'success' || data.success) && data.user) {
        setIsSubmitting(false);
        setSuccess(true);
        login(data.user, 'customer', (finalUser) => {
          setTimeout(() => {
            setSuccess(false);
            if (onAuthSuccess) onAuthSuccess(finalUser);
          }, 600);
        });
        return;
      } else {
        setIsSubmitting(false);
        if (res.status === 404 || data.notRegistered) {
          setIsNotRegistered(true);
          setErrorMsg('This mobile number is not registered. Please register to continue.');
        } else {
          setErrorMsg(data.message || 'Invalid OTP code. Please enter the correct 6-digit code.');
        }
        return;
      }
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg('Verification error. Please try again.');
    }
  };

  return (
    <div className="w-full h-screen max-h-screen overflow-hidden flex bg-white dark:bg-[#030712] text-slate-900 dark:text-slate-100 font-sans select-none">
      
      {/* ==================== LEFT PANEL: FORM SECTION ==================== */}
      <div className="w-full lg:w-1/2 h-full flex flex-col justify-between p-6 sm:p-8 lg:p-10 xl:p-12 bg-white dark:bg-[#030712] overflow-y-auto">
        
        {/* Top Header Logo */}
        <div className="flex items-center justify-between shrink-0">
          <div 
            onClick={onBackToHome}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <img 
              src={logoImg} 
              alt="Forge India Connect Logo" 
              className="w-10 h-10 object-cover rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs group-hover:scale-105 transition-transform" 
            />
            <div>
              <h1 className="text-base font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1 leading-none uppercase">
                Connect <span className="text-[#FFB800]">App</span>
              </h1>
              <p className="text-[9px] font-bold text-slate-400 tracking-wide uppercase mt-0.5">All Services, One Platform</p>
            </div>
          </div>

          <button
            onClick={onBackToHome}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer border-none bg-transparent"
          >
            ← Home
          </button>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-md mx-auto my-auto py-2">
          
          {success ? (
            <div className="text-center py-8 animate-fade-in">
              <div className="w-14 h-14 bg-amber-100 dark:bg-amber-950/50 text-[#FFB800] rounded-full flex items-center justify-center mx-auto mb-3 border border-amber-300 dark:border-amber-700 shadow-lg animate-bounce">
                <Check className="w-7 h-7 stroke-[3]" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Welcome Back!</h2>
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
                  Login to access your Customer Dashboard
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
                  Password Login
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
                  Mobile OTP Login
                </button>
              </div>

              {/* Error Alert Box with Register Now Button */}
              {errorMsg && (
                <div className="mb-3.5 p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold rounded-2xl flex flex-col gap-2.5">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                    <span className="flex-1">{errorMsg}</span>
                  </div>
                  {isNotRegistered && (
                    <button
                      type="button"
                      onClick={onNavigateToJoinNow}
                      className="w-full py-2.5 px-4 bg-[#FFB800] hover:bg-[#E5A700] text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 border-none active:scale-[0.98]"
                    >
                      <span>Register Now</span>
                      <span className="text-sm">→</span>
                    </button>
                  )}
                </div>
              )}

              {/* OTP Success Info Box */}
              {otpSuccessMsg && (
                <div className="mb-3.5 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-xl flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                  <span>{otpSuccessMsg}</span>
                </div>
              )}

              {/* 1. PASSWORD LOGIN FORM */}
              {loginMethod === 'password' ? (
                <form onSubmit={handlePasswordSubmit} className="space-y-3 sm:space-y-3.5">
                  
                  {/* Email / Phone Field */}
                  <div className="text-left">
                    <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                      Email or Phone Number
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email or phone number"
                        className="w-full bg-slate-50/70 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl py-3 pl-10 pr-4 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="text-left">
                    <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
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
                      <span>Remember me</span>
                    </label>

                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="text-xs font-extrabold text-[#003B95] dark:text-[#FFB800] hover:underline transition-all"
                    >
                      Forgot Password?
                    </a>
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-6 bg-[#FFB800] hover:bg-[#E5A700] text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 border-none active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Authenticating...</span>
                      </div>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>Login to Dashboard</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* 2. MOBILE OTP LOGIN FORM */
                <div className="space-y-3.5 text-left">
                  {!isOtpSent ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                          Registered Mobile Number
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            maxLength={10}
                            value={otpTarget}
                            onChange={(e) => setOtpTarget(e.target.value.replace(/\D/g, ''))}
                            placeholder="Enter 10-digit mobile number"
                            className="w-full bg-slate-50/70 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl py-3 pl-10 pr-4 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 transition-all"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isSubmitting || !otpTarget}
                        className="w-full py-3 px-6 bg-[#FFB800] hover:bg-[#E5A700] text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 border-none active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <span>Verifying Registration & Sending OTP...</span>
                        ) : (
                          <span>Send Login OTP</span>
                        )}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-3">
                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                          Enter 6-Digit OTP Code
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={otpInput}
                          onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                          placeholder="Enter 6-digit OTP code"
                          className="w-full bg-slate-50/70 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl py-3 px-4 text-center text-lg font-black tracking-widest text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 transition-all"
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={() => { setIsOtpSent(false); setOtpInput(''); }}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold bg-transparent border-none cursor-pointer"
                        >
                          ← Change Number
                        </button>
                        <button
                          type="button"
                          disabled={resendCooldown > 0}
                          onClick={handleSendOtp}
                          className="text-[#FFB800] font-extrabold bg-transparent border-none cursor-pointer disabled:opacity-50"
                        >
                          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting || otpInput.length < 6}
                        className="w-full py-3 px-6 bg-[#FFB800] hover:bg-[#E5A700] text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 border-none active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? <span>Verifying OTP...</span> : <span>Verify OTP & Login</span>}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </>
          )}

        </div>

        {/* Footer Signup Prompt */}
        <div className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 pt-2 shrink-0">
          Don't have an account?{' '}
          <button
            onClick={onNavigateToJoinNow}
            className="font-extrabold text-[#003B95] dark:text-[#FFB800] hover:underline bg-transparent border-none p-0 inline cursor-pointer"
          >
            Sign Up
          </button>
        </div>

      </div>


      {/* ==================== RIGHT PANEL: ECOSYSTEM & GRAPHIC SIDE ==================== */}
      <div className="hidden lg:flex w-1/2 h-full bg-gradient-to-br from-[#3b19b7] via-[#5b3af0] to-[#7c3aed] relative overflow-hidden flex-col justify-between p-8 lg:p-10 xl:p-12 text-white select-none">
        
        {/* Background Ambient Glows & Circular Orbits */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/40 rounded-full blur-[140px] pointer-events-none" />

        {/* Top Header: Language Selector */}
        <div className="flex justify-end z-10 shrink-0">
          <button className="bg-white/15 hover:bg-white/25 border border-white/20 px-3.5 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-2 backdrop-blur-md transition-all cursor-pointer text-white">
            <Globe className="w-3.5 h-3.5 text-white/90" />
            <span>English</span>
            <span className="text-[10px] opacity-70">▼</span>
          </button>
        </div>

        {/* Center Graphic Section */}
        <div className="my-auto z-10 flex flex-col items-center text-center py-2">
          
          {/* Main Title & Tagline */}
          <div className="max-w-md mx-auto text-center mb-6">
            <h2 className="text-2xl lg:text-3xl xl:text-4xl font-black tracking-tight leading-tight">
              Everything You Need,<br />All in One Place
            </h2>
            <div className="w-10 h-1 bg-white/40 rounded-full mx-auto my-2.5" />
            <p className="text-xs font-medium text-white/80 leading-relaxed max-w-sm mx-auto">
              Connect App brings all services together to make your life easier and better.
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
              <span className="text-[9px] font-extrabold text-white/90">Products</span>
            </div>

            {/* 2. Services (Top Left) */}
            <div className="absolute top-8 left-2 flex flex-col items-center gap-0.5 group">
              <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-2xl bg-[#3b82f6] text-white flex items-center justify-center shadow-lg shadow-blue-900/40 group-hover:scale-110 transition-transform">
                <Wrench className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-[9px] font-extrabold text-white/90">Services</span>
            </div>

            {/* 3. Daily Needs (Bottom Left) */}
            <div className="absolute bottom-8 left-2 flex flex-col items-center gap-0.5 group">
              <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-2xl bg-[#22c55e] text-white flex items-center justify-center shadow-lg shadow-emerald-900/40 group-hover:scale-110 transition-transform">
                <ShoppingCart className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-[9px] font-extrabold text-white/90">Daily Needs</span>
            </div>

            {/* 4. Jobs (Bottom) */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-3 flex flex-col items-center gap-0.5 group">
              <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-2xl bg-[#ec4899] text-white flex items-center justify-center shadow-lg shadow-pink-900/40 group-hover:scale-110 transition-transform">
                <Briefcase className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-[9px] font-extrabold text-white/90">Jobs</span>
            </div>

            {/* 5. Travel (Bottom Right) */}
            <div className="absolute bottom-8 right-2 flex flex-col items-center gap-0.5 group">
              <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-2xl bg-[#0ea5e9] text-white flex items-center justify-center shadow-lg shadow-sky-900/40 group-hover:scale-110 transition-transform">
                <Plane className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-[9px] font-extrabold text-white/90">Travel</span>
            </div>

            {/* 6. Stay (Right) */}
            <div className="absolute top-1/2 right-[-12px] -translate-y-1/2 flex flex-col items-center gap-0.5 group">
              <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-2xl bg-[#2dd4bf] text-white flex items-center justify-center shadow-lg shadow-teal-900/40 group-hover:scale-110 transition-transform">
                <Bed className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-[9px] font-extrabold text-white/90">Stay</span>
            </div>

            {/* 7. Food (Top Right) */}
            <div className="absolute top-8 right-2 flex flex-col items-center gap-0.5 group">
              <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-2xl bg-[#f59e0b] text-white flex items-center justify-center shadow-lg shadow-amber-900/40 group-hover:scale-110 transition-transform">
                <UtensilsCrossed className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-[9px] font-extrabold text-white/90">Food</span>
            </div>

          </div>
        </div>

        {/* Bottom Glassmorphic Security Banner */}
        <div className="z-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3.5 flex items-center justify-between shadow-2xl max-w-lg mx-auto w-full shrink-0">
          <div className="flex items-center gap-3 text-left">
            <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h3 className="text-xs font-black text-white">Secure & Trusted Platform</h3>
              <p className="text-[10px] text-white/80 font-medium leading-tight mt-0.5">
                Your data is safe with us. We never share your information with anyone.
              </p>
            </div>
          </div>
          
          <div className="w-8 h-8 rounded-xl bg-purple-400/30 border border-purple-300/40 flex items-center justify-center shrink-0 ml-2">
            <Lock className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

      </div>

    </div>
  );
}
