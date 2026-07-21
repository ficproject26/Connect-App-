import React, { useState } from 'react';
import { 
  Mail, Lock, Eye, EyeOff, User, Store, Truck, Check, 
  ShieldCheck, Phone, UserPlus, ShoppingBag, UtensilsCrossed, 
  Bed, Plane, Headphones, Tag, Star, ArrowRight 
} from 'lucide-react';

export default function JoinNowPage({ onAuthSuccess, onBackToHome, onNavigateToLoginPage }) {
  const [role, setRole] = useState('customer'); // 'customer' | 'vendor' | 'delivery'
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Dynamic Password Strength Calculator
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'Weak', color: 'bg-slate-200 dark:bg-slate-800' };
    if (pass.length < 6) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (pass.length < 9) return { score: 2, label: 'Medium', color: 'bg-amber-500' };
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) {
      return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
    }
    return { score: 3, label: 'Good', color: 'bg-blue-500' };
  };

  const strength = getPasswordStrength(password);

  const handleSignupSubmit = (e) => {
    e?.preventDefault();
    if (!agreeTerms) return;
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      
      const displayName = fullName || (role === 'vendor' ? 'Elite Vendor' : (role === 'delivery' ? 'Express Rider' : 'Connect Member'));

      setTimeout(() => {
        onAuthSuccess({
          name: displayName,
          email: email || 'user@connectapp.com',
          role: role
        });
        setSuccess(false);
      }, 900);
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-[#030712] text-slate-900 dark:text-slate-100 font-sans select-none">
      
      {/* ==================== LEFT PANEL: SIGNUP FORM ==================== */}
      <div className="w-full lg:w-1/2 min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-12 bg-white dark:bg-[#030712] overflow-y-auto">
        
        {/* Top Header Logo & Login Link */}
        <div className="flex items-center justify-between">
          <div 
            onClick={onBackToHome}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#4f39f6] to-[#7c3aed] flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              C
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                Connect <span className="text-[#5b3af0]">App</span>
              </h1>
              <p className="text-[10px] font-bold text-slate-400 tracking-wide uppercase">All Services, One Platform</p>
            </div>
          </div>

          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <button
              onClick={onNavigateToLoginPage}
              className="font-extrabold text-[#5b3af0] dark:text-indigo-400 hover:underline bg-transparent border-none p-0 inline cursor-pointer"
            >
              Login
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-lg mx-auto my-auto py-6">
          
          {success ? (
            <div className="text-center py-12 animate-fade-in">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200 dark:border-emerald-800 shadow-lg animate-bounce">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Account Created!</h2>
              <p className="text-xs font-semibold text-slate-500 mt-2">
                Welcome to Connect App! Preparing your personalized dashboard...
              </p>
            </div>
          ) : (
            <>
              {/* Title Header */}
              <div className="mb-6 text-left">
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  Create Your Account
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-slate-400 mt-1.5">
                  Sign up to explore all the amazing services we offer.
                </p>
              </div>

              {/* Form Fields */}
              <form onSubmit={handleSignupSubmit} className="space-y-4">
                
                {/* Row 1: Full Name & Phone Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Full Name */}
                  <div className="text-left">
                    <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full bg-slate-50/70 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#5b3af0] focus:ring-2 focus:ring-[#5b3af0]/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="text-left">
                    <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Enter your phone number"
                        className="w-full bg-slate-50/70 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#5b3af0] focus:ring-2 focus:ring-[#5b3af0]/20 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 2: Email Address */}
                <div className="text-left">
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full bg-slate-50/70 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#5b3af0] focus:ring-2 focus:ring-[#5b3af0]/20 transition-all"
                    />
                  </div>
                </div>

                {/* Row 3: Create Password & Strength Bar */}
                <div className="text-left">
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                    Create Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a strong password"
                      className="w-full bg-slate-50/70 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl py-3 pl-11 pr-11 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#5b3af0] focus:ring-2 focus:ring-[#5b3af0]/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg border-none bg-transparent cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="mt-2 flex items-center justify-between gap-3 text-[10px] font-bold text-slate-400">
                      <span>Password strength: <strong className="text-slate-700 dark:text-slate-200">{strength.label}</strong></span>
                      <div className="flex gap-1 flex-grow max-w-[120px]">
                        {[1, 2, 3, 4].map((step) => (
                          <div 
                            key={`strength-${step}`}
                            className={`h-1.5 flex-1 rounded-full transition-all ${
                              strength.score >= step ? strength.color : 'bg-slate-200 dark:bg-slate-800'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Row 4: Confirm Password */}
                <div className="text-left">
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className="w-full bg-slate-50/70 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl py-3 pl-11 pr-11 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#5b3af0] focus:ring-2 focus:ring-[#5b3af0]/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg border-none bg-transparent cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Role Selection Cards ("I am a") */}
                <div className="pt-2 text-left">
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-2">
                    I am a
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Customer */}
                    <div
                      onClick={() => setRole('customer')}
                      className={`relative rounded-2xl p-3.5 border transition-all cursor-pointer flex flex-col justify-between text-left ${
                        role === 'customer'
                          ? 'border-[#5b3af0] bg-purple-50/70 dark:bg-purple-950/20 ring-2 ring-[#5b3af0]/20 shadow-sm'
                          : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-[#5b3af0] dark:text-purple-400 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        {role === 'customer' ? (
                          <div className="w-4 h-4 rounded-full bg-[#5b3af0] text-white flex items-center justify-center text-[10px]">✓</div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white">Customer</h4>
                        <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                          Book services and explore offers
                        </p>
                      </div>
                    </div>

                    {/* Vendor */}
                    <div
                      onClick={() => setRole('vendor')}
                      className={`relative rounded-2xl p-3.5 border transition-all cursor-pointer flex flex-col justify-between text-left ${
                        role === 'vendor'
                          ? 'border-[#5b3af0] bg-purple-50/70 dark:bg-purple-950/20 ring-2 ring-[#5b3af0]/20 shadow-sm'
                          : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <Store className="w-4 h-4" />
                        </div>
                        {role === 'vendor' ? (
                          <div className="w-4 h-4 rounded-full bg-[#5b3af0] text-white flex items-center justify-center text-[10px]">✓</div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white">Vendor</h4>
                        <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                          Sell products or services
                        </p>
                      </div>
                    </div>

                    {/* Delivery Partner */}
                    <div
                      onClick={() => setRole('delivery')}
                      className={`relative rounded-2xl p-3.5 border transition-all cursor-pointer flex flex-col justify-between text-left ${
                        role === 'delivery'
                          ? 'border-[#5b3af0] bg-purple-50/70 dark:bg-purple-950/20 ring-2 ring-[#5b3af0]/20 shadow-sm'
                          : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                          <Truck className="w-4 h-4" />
                        </div>
                        {role === 'delivery' ? (
                          <div className="w-4 h-4 rounded-full bg-[#5b3af0] text-white flex items-center justify-center text-[10px]">✓</div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white">Delivery Partner</h4>
                        <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                          Deliver orders and earn
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Terms Agreement Checkbox */}
                <div className="pt-1 text-left">
                  <label className="flex items-start gap-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded border-slate-300 text-[#5b3af0] focus:ring-[#5b3af0] accent-[#5b3af0] cursor-pointer shrink-0"
                    />
                    <span>
                      I agree to the{' '}
                      <a href="#" onClick={(e) => e.preventDefault()} className="text-[#5b3af0] dark:text-indigo-400 hover:underline">Terms & Conditions</a>
                      {' '}and{' '}
                      <a href="#" onClick={(e) => e.preventDefault()} className="text-[#5b3af0] dark:text-indigo-400 hover:underline">Privacy Policy</a>
                    </span>
                  </label>
                </div>

                {/* Create Account Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !agreeTerms}
                  className="w-full py-3.5 px-6 bg-[#5b3af0] hover:bg-[#4b2ae0] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-indigo-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 border-none active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Create Account</span>
                    </>
                  )}
                </button>
              </form>

              {/* Social Signup Divider */}
              <div className="relative my-5 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <span className="relative bg-white dark:bg-[#030712] px-3 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  or sign up with
                </span>
              </div>

              {/* Social Buttons */}
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSignupSubmit()}
                  className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.3 7.31 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.99 0 12s.46 3.84 1.26 5.42l4.02-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSignupSubmit()}
                  className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0 fill-[#1877F2]" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Facebook</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSignupSubmit()}
                  className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0 fill-slate-900 dark:fill-white" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.35c.67-.82 1.12-1.96.99-3.1-.97.04-2.14.65-2.84 1.46-.62.72-1.16 1.88-1.01 3 .01 0 .03.01.05.01 1.08 0 2.15-.56 2.81-1.37z"/>
                  </svg>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Apple</span>
                </button>
              </div>
            </>
          )}

        </div>

        {/* Footer Note */}
        <div className="text-center text-[11px] text-slate-400 dark:text-slate-500 font-semibold pt-2">
          Connect App Platform Onboarding • All rights reserved
        </div>

      </div>


      {/* ==================== RIGHT PANEL: PHONE MOCKUP & FEATURES SIDE ==================== */}
      <div className="hidden lg:flex w-1/2 min-h-screen bg-gradient-to-br from-[#dfe2fe] via-[#ebedff] to-[#f6f7ff] dark:from-[#0b1029] dark:via-[#111738] dark:to-[#070b1f] relative overflow-hidden flex-col justify-between p-12 lg:p-14 text-slate-900 dark:text-white select-none">
        
        {/* Soft Ambient Background Glows */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-300/30 dark:bg-purple-900/20 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-300/30 dark:bg-indigo-950/30 rounded-full blur-[130px] pointer-events-none" />

        {/* Top Header Section */}
        <div className="max-w-md text-left z-10">
          <h2 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Join Connect App<br />and simplify your life!
          </h2>
          <div className="w-12 h-1 bg-[#5b3af0] rounded-full my-3" />
          <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm">
            One platform for all your needs. Save time, save money, and get the best experience.
          </p>
        </div>

        {/* Center Realistic Phone Mockup Section */}
        <div className="my-auto z-10 flex items-center justify-center relative py-6">
          
          {/* Circular Orbit Path */}
          <div className="absolute w-72 h-72 lg:w-80 lg:h-80 rounded-full border border-dashed border-[#5b3af0]/20 dark:border-indigo-400/20 animate-spin-slow pointer-events-none" />

          {/* Floating Category Icons Around Phone */}
          
          {/* Food Icon (Left) */}
          <div className="absolute left-6 lg:left-12 top-1/4 -translate-y-1/2 w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-bounce" style={{ animationDuration: '3s' }}>
            <UtensilsCrossed className="w-5.5 h-5.5" />
          </div>

          {/* Shopping Bag (Top Right) */}
          <div className="absolute right-6 lg:right-12 top-8 w-11 h-11 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/20 animate-bounce" style={{ animationDuration: '3.5s' }}>
            <ShoppingBag className="w-5.5 h-5.5" />
          </div>

          {/* Stay / Bed (Bottom Left) */}
          <div className="absolute left-10 lg:left-16 bottom-12 w-11 h-11 rounded-2xl bg-pink-500 text-white flex items-center justify-center shadow-lg shadow-pink-500/20 animate-bounce" style={{ animationDuration: '4s' }}>
            <Bed className="w-5.5 h-5.5" />
          </div>

          {/* Travel / Plane (Right) */}
          <div className="absolute right-4 lg:right-8 bottom-1/3 w-11 h-11 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/20 animate-bounce" style={{ animationDuration: '3.2s' }}>
            <Plane className="w-5.5 h-5.5" />
          </div>

          {/* iPhone Frame Container */}
          <div className="w-[240px] sm:w-[260px] h-[480px] sm:h-[510px] bg-slate-900 rounded-[44px] p-3 shadow-2xl border-4 border-slate-800 relative z-20 flex flex-col overflow-hidden transform hover:scale-[1.02] transition-transform">
            
            {/* Dynamic Island / Notch */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-30 flex items-center justify-between px-2">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
              <div className="w-2.5 h-2.5 rounded-full bg-blue-950" />
            </div>

            {/* Phone Screen Mockup View */}
            <div className="w-full h-full bg-slate-50 dark:bg-[#0b1329] rounded-[34px] overflow-hidden flex flex-col pt-7 px-3 text-left">
              
              {/* App Greeting Header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-[11px] font-black text-slate-850 dark:text-white block">Hello, John! 👋</span>
                  <span className="text-[8px] font-bold text-slate-400 block">What are you looking for today?</span>
                </div>
                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                  <User className="w-3 h-3 text-slate-600 dark:text-slate-300" />
                </div>
              </div>

              {/* Mini Search Bar */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl px-2.5 py-1.5 flex items-center justify-between text-[8px] text-slate-400 mb-3 shadow-3xs">
                <span>🔍 Search services, products...</span>
                <span>▼</span>
              </div>

              {/* Mini Banner Card */}
              <div className="bg-gradient-to-r from-[#5b3af0] to-[#7c3aed] text-white rounded-xl p-2.5 mb-3 shadow-xs">
                <span className="text-[9px] font-black block">Special Offer!</span>
                <span className="text-[7.5px] opacity-90 block mt-0.5">Up to 40% off on your first booking</span>
                <span className="mt-1.5 inline-block bg-white text-[#5b3af0] text-[7px] font-black px-2 py-0.5 rounded-md">Explore Now</span>
              </div>

              {/* Categories Grid */}
              <div className="mb-2">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[8.5px] font-black text-slate-800 dark:text-white">Top Categories</span>
                  <span className="text-[7.5px] font-bold text-[#5b3af0]">View All</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 text-center">
                  <div className="bg-blue-50 dark:bg-blue-950/40 p-1.5 rounded-lg flex flex-col items-center">
                    <Wrench className="w-3 h-3 text-blue-600" />
                    <span className="text-[6.5px] font-bold text-slate-700 dark:text-slate-300 mt-0.5">Services</span>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-950/40 p-1.5 rounded-lg flex flex-col items-center">
                    <UtensilsCrossed className="w-3 h-3 text-amber-600" />
                    <span className="text-[6.5px] font-bold text-slate-700 dark:text-slate-300 mt-0.5">Food</span>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-950/40 p-1.5 rounded-lg flex flex-col items-center">
                    <Bed className="w-3 h-3 text-emerald-600" />
                    <span className="text-[6.5px] font-bold text-slate-700 dark:text-slate-300 mt-0.5">Stay</span>
                  </div>
                  <div className="bg-sky-50 dark:bg-sky-950/40 p-1.5 rounded-lg flex flex-col items-center">
                    <Plane className="w-3 h-3 text-sky-600" />
                    <span className="text-[6.5px] font-bold text-slate-700 dark:text-slate-300 mt-0.5">Travel</span>
                  </div>
                </div>
              </div>

              {/* Popular Services Mini Grid */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[8.5px] font-black text-slate-800 dark:text-white">Popular Services</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-lg p-1 text-center">
                    <span className="text-[6.5px] font-bold text-slate-700 dark:text-slate-300 block">Home Cleaning</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-lg p-1 text-center">
                    <span className="text-[6.5px] font-bold text-slate-700 dark:text-slate-300 block">Electrician</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-lg p-1 text-center">
                    <span className="text-[6.5px] font-bold text-slate-700 dark:text-slate-300 block">Beauty & Spa</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Bottom 4 Feature Cards (White Glass Box) */}
        <div className="z-10 bg-white dark:bg-[#0b1329] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xl max-w-xl mx-auto w-full">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left sm:text-center">
            
            {/* Feature 1 */}
            <div className="flex flex-col items-start sm:items-center">
              <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-[#5b3af0] dark:text-purple-400 flex items-center justify-center mb-1.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white">Secure & Safe</h4>
              <p className="text-[9.5px] font-medium text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                Your data is protected with top security.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-start sm:items-center">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1.5">
                <Star className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white">Trusted Platform</h4>
              <p className="text-[9.5px] font-medium text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                Thousands of users trust us daily.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-start sm:items-center">
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-1.5">
                <Headphones className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white">24/7 Support</h4>
              <p className="text-[9.5px] font-medium text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                We are here to help you anytime.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="flex flex-col items-start sm:items-center">
              <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-1.5">
                <Tag className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white">Best Offers</h4>
              <p className="text-[9.5px] font-medium text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                Exclusive offers and discounts.
              </p>
            </div>

          </div>
        </div>

        {/* Footer Legal Terms Note */}
        <div className="z-10 text-center text-[10px] font-semibold text-slate-500 dark:text-slate-400 pt-3 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#5b3af0]" />
          <span>By creating an account, you agree to our <a href="#" onClick={(e) => e.preventDefault()} className="text-[#5b3af0] hover:underline">Terms & Conditions</a> and <a href="#" onClick={(e) => e.preventDefault()} className="text-[#5b3af0] hover:underline">Privacy Policy</a></span>
        </div>

      </div>

    </div>
  );
}
