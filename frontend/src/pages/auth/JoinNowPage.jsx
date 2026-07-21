import React, { useState } from 'react';
import { 
  Mail, Lock, Eye, EyeOff, User, Store, Truck, Check, 
  ShieldCheck, Phone, UserPlus, Wrench, UtensilsCrossed, 
  Bed, Plane, ShoppingCart, Briefcase, LayoutGrid, Headphones, 
  Tag, Award, CreditCard, FileText 
} from 'lucide-react';
import logoImg from '../../assets/images/forge india logo.jpg';

export default function JoinNowPage({ onAuthSuccess, onBackToHome, onNavigateToLoginPage }) {
  const [role, setRole] = useState('customer'); // 'customer' | 'vendor' | 'delivery'
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Dynamic Password Strength Calculator
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'Weak', color: 'bg-slate-200 dark:bg-slate-800' };
    if (pass.length < 6) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (pass.length < 9) return { score: 2, label: 'Medium', color: 'bg-[#FFB800]' };
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
          role: role,
          aadhaar: aadhaarNumber,
          pan: panNumber
        });
        setSuccess(false);
      }, 800);
    }, 1000);
  };

  return (
    <div className="w-full h-screen max-h-screen overflow-hidden flex bg-white dark:bg-[#030712] text-slate-900 dark:text-slate-100 font-sans select-none">
      
      {/* ==================== LEFT PANEL: FORM SECTION ==================== */}
      <div className="w-full lg:w-1/2 h-full flex flex-col justify-between p-5 sm:p-7 lg:p-9 bg-white dark:bg-[#030712] overflow-y-auto">
        
        {/* Top Header Logo & Login Link */}
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
                Forge India <span className="text-[#FFB800]">Connect</span>
              </h1>
              <p className="text-[9px] font-bold text-slate-400 tracking-wide uppercase mt-0.5">All Services, One Platform</p>
            </div>
          </div>

          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <button
              onClick={onNavigateToLoginPage}
              className="font-extrabold text-[#003B95] dark:text-[#FFB800] hover:underline bg-transparent border-none p-0 inline cursor-pointer"
            >
              Login
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-lg mx-auto my-auto py-2">
          
          {success ? (
            <div className="text-center py-8 animate-fade-in">
              <div className="w-14 h-14 bg-amber-100 dark:bg-amber-950/50 text-[#FFB800] rounded-full flex items-center justify-center mx-auto mb-3 border border-amber-300 dark:border-amber-700 shadow-lg animate-bounce">
                <Check className="w-7 h-7 stroke-[3]" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Account Created!</h2>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                Welcome to Forge India Connect! Preparing your dashboard...
              </p>
            </div>
          ) : (
            <>
              {/* Title Header */}
              <div className="mb-3 text-left">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Create Your <span className="text-[#FFB800]">Account</span>
                </h2>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">
                  Join Forge India Connect and explore endless opportunities.
                </p>
              </div>

              {/* Form Fields */}
              <form onSubmit={handleSignupSubmit} className="space-y-2.5">
                
                {/* Row 1: Full Name & Phone Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Full Name */}
                  <div className="text-left">
                    <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full bg-slate-50/70 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="text-left">
                    <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Enter your phone number"
                        className="w-full bg-slate-50/70 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 2: Email Address */}
                <div className="text-left">
                  <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full bg-slate-50/70 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 transition-all"
                    />
                  </div>
                </div>

                {/* Row 3: Create Password & Strength Bar */}
                <div className="text-left">
                  <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    Create Password
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a strong password"
                      className="w-full bg-slate-50/70 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-xl py-2 pl-9 pr-9 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg border-none bg-transparent cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="mt-1 flex items-center justify-between gap-2 text-[9px] font-bold text-slate-400">
                      <span>Password strength: <strong className="text-slate-700 dark:text-slate-200">{strength.label}</strong></span>
                      <div className="flex gap-1 flex-grow max-w-[90px]">
                        {[1, 2, 3, 4].map((step) => (
                          <div 
                            key={`strength-${step}`}
                            className={`h-1 flex-1 rounded-full transition-all ${
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
                  <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className="w-full bg-slate-50/70 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-xl py-2 pl-9 pr-9 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg border-none bg-transparent cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Role Selection Cards ("I am a") */}
                <div className="pt-0.5 text-left">
                  <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    I am a
                  </label>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {/* Customer */}
                    <div
                      onClick={() => setRole('customer')}
                      className={`relative rounded-2xl p-2.5 border transition-all cursor-pointer flex flex-col justify-between text-left ${
                        role === 'customer'
                          ? 'border-[#FFB800] bg-amber-50/70 dark:bg-amber-950/20 ring-2 ring-[#FFB800]/30 shadow-xs'
                          : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="w-7 h-7 rounded-full bg-[#FFB800]/20 text-[#D49900] dark:text-[#FFB800] flex items-center justify-center shrink-0">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        {role === 'customer' ? (
                          <div className="w-4 h-4 rounded-full bg-[#FFB800] text-slate-950 flex items-center justify-center text-[9px] font-black shrink-0">✓</div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 shrink-0" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-[11px] font-black text-slate-900 dark:text-white leading-none">Customer</h4>
                        <p className="text-[8.5px] font-semibold text-slate-500 dark:text-slate-400 leading-tight mt-0.5 truncate">
                          Book services & explore
                        </p>
                      </div>
                    </div>

                    {/* Vendor */}
                    <div
                      onClick={() => setRole('vendor')}
                      className={`relative rounded-2xl p-2.5 border transition-all cursor-pointer flex flex-col justify-between text-left ${
                        role === 'vendor'
                          ? 'border-[#FFB800] bg-amber-50/70 dark:bg-amber-950/20 ring-2 ring-[#FFB800]/30 shadow-xs'
                          : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-950/60 text-[#003B95] dark:text-blue-400 flex items-center justify-center shrink-0">
                          <Store className="w-3.5 h-3.5" />
                        </div>
                        {role === 'vendor' ? (
                          <div className="w-4 h-4 rounded-full bg-[#FFB800] text-slate-950 flex items-center justify-center text-[9px] font-black shrink-0">✓</div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 shrink-0" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-[11px] font-black text-slate-900 dark:text-white leading-none">Vendor</h4>
                        <p className="text-[8.5px] font-semibold text-slate-500 dark:text-slate-400 leading-tight mt-0.5 truncate">
                          Sell products or services
                        </p>
                      </div>
                    </div>

                    {/* Delivery Partner */}
                    <div
                      onClick={() => setRole('delivery')}
                      className={`relative rounded-2xl p-2.5 border transition-all cursor-pointer flex flex-col justify-between text-left ${
                        role === 'delivery'
                          ? 'border-[#FFB800] bg-amber-50/70 dark:bg-amber-950/20 ring-2 ring-[#FFB800]/30 shadow-xs'
                          : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-950/60 text-[#003B95] dark:text-blue-400 flex items-center justify-center shrink-0">
                          <Truck className="w-3.5 h-3.5" />
                        </div>
                        {role === 'delivery' ? (
                          <div className="w-4 h-4 rounded-full bg-[#FFB800] text-slate-950 flex items-center justify-center text-[9px] font-black shrink-0">✓</div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 shrink-0" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-[11px] font-black text-slate-900 dark:text-white leading-none truncate">Delivery Partner</h4>
                        <p className="text-[8.5px] font-semibold text-slate-500 dark:text-slate-400 leading-tight mt-0.5 truncate">
                          Deliver orders & earn
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Aadhaar Card & PAN Card Details (Required for Vendor / Delivery Partner) */}
                {(role === 'vendor' || role === 'delivery') && (
                  <div className="bg-amber-50/50 dark:bg-slate-900/80 border border-[#FFB800]/40 dark:border-amber-900/40 rounded-2xl p-2.5 space-y-2 text-left animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-900 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#FFB800]" /> Identity Verification Details
                      </span>
                      <span className="text-[8.5px] font-bold text-slate-400">Government ID Compliance</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {/* Aadhaar Card Number */}
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                          Aadhaar Card Number *
                        </label>
                        <div className="relative">
                          <CreditCard className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            maxLength={12}
                            value={aadhaarNumber}
                            onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                            placeholder="12-digit Aadhaar number"
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-1.5 pl-8 pr-2 text-[11px] font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FFB800]"
                          />
                        </div>
                      </div>

                      {/* PAN Card Number */}
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                          PAN Card Number *
                        </label>
                        <div className="relative">
                          <FileText className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            maxLength={10}
                            value={panNumber}
                            onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                            placeholder="10-character PAN (e.g. ABCDE1234F)"
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-1.5 pl-8 pr-2 text-[11px] font-semibold uppercase text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FFB800]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Terms Agreement Checkbox */}
                <div className="pt-0.5 text-left">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-[#FFB800] focus:ring-[#FFB800] accent-[#FFB800] cursor-pointer shrink-0"
                    />
                    <span>
                      I agree to the{' '}
                      <a href="#" onClick={(e) => e.preventDefault()} className="text-slate-900 dark:text-amber-400 font-extrabold hover:underline">Terms & Conditions</a>
                      {' '}and{' '}
                      <a href="#" onClick={(e) => e.preventDefault()} className="text-slate-900 dark:text-amber-400 font-extrabold hover:underline">Privacy Policy</a>
                    </span>
                  </label>
                </div>

                {/* Create Account Button (Bright Gold/Yellow) */}
                <button
                  type="submit"
                  disabled={isSubmitting || !agreeTerms}
                  className="w-full py-3 px-6 bg-[#FFB800] hover:bg-[#E5A700] text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 border-none active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
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
              <div className="relative my-2.5 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <span className="relative bg-white dark:bg-[#030712] px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  or sign up with
                </span>
              </div>

              {/* Social Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleSignupSubmit()}
                  className="py-1.5 px-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.3 7.31 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.99 0 12s.46 3.84 1.26 5.42l4.02-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSignupSubmit()}
                  className="py-1.5 px-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 shrink-0 fill-[#1877F2]" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Facebook</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSignupSubmit()}
                  className="py-1.5 px-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 shrink-0 fill-slate-900 dark:fill-white" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.35c.67-.82 1.12-1.96.99-3.1-.97.04-2.14.65-2.84 1.46-.62.72-1.16 1.88-1.01 3 .01 0 .03.01.05.01 1.08 0 2.15-.56 2.81-1.37z"/>
                  </svg>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Apple</span>
                </button>
              </div>
            </>
          )}

        </div>

        {/* Footer Note */}
        <div className="text-center text-[10px] text-slate-400 dark:text-slate-500 font-semibold pt-1 shrink-0">
          Forge India Connect • All rights reserved
        </div>

      </div>


      {/* ==================== RIGHT PANEL: YELLOW BRANDING & CATEGORIES SIDE ==================== */}
      <div className="hidden lg:flex w-1/2 h-full bg-gradient-to-b from-[#FFB800] via-[#FFC700] to-[#E5A500] relative overflow-hidden flex-col justify-between text-slate-900 select-none">
        
        {/* Subtle Decorative Pattern Dots at Top Right */}
        <div className="absolute top-4 right-4 grid grid-cols-6 gap-1 opacity-25 pointer-events-none">
          {[...Array(24)].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-900" />
          ))}
        </div>

        {/* Top Floating White Circle Logo Avatar */}
        <div className="pt-8 flex flex-col items-center justify-center z-10 shrink-0">
          <div className="relative flex flex-col items-center">
            {/* Arc text label */}
            <span className="text-xs font-black text-slate-900 tracking-wider mb-1 uppercase drop-shadow-xs">Let's Connect!</span>
            {/* Main white circle avatar containing Logo */}
            <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-full bg-white p-2 flex items-center justify-center shadow-xl shadow-amber-950/20 border-4 border-white/90 transform hover:scale-105 transition-transform cursor-pointer">
              <img src={logoImg} alt="Forge India Connect Logo" className="w-full h-full object-cover rounded-full" />
            </div>
          </div>
        </div>

        {/* Center Text & Category Grid Section */}
        <div className="z-10 flex flex-col items-center text-center px-8 my-auto py-2">
          
          {/* Main Title & Tagline */}
          <div className="max-w-md mx-auto text-center mb-4">
            <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              All Services,<br />
              One Platform,<br />
              <span className="text-[#003B95]">Infinite Possibilities!</span>
            </h2>
            <div className="w-10 h-1 bg-slate-900 rounded-full mx-auto my-2" />
            <p className="text-xs font-semibold text-slate-800 leading-relaxed max-w-sm mx-auto">
              Forge India Connect brings all services together to make your life easier, faster and smarter.
            </p>
          </div>

          {/* Service Category Cards (7 Badges: Services, Food, Stay, Travel, Daily Needs, Jobs, More) */}
          <div className="w-full max-w-md mx-auto space-y-2.5 my-1">
            {/* Top Row: 4 Cards */}
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-2.5 flex flex-col items-center justify-center shadow-xs border border-white/80 hover:scale-105 transition-transform cursor-pointer">
                <Wrench className="w-5 h-5 text-[#003B95]" />
                <span className="text-[10px] font-black text-slate-900 mt-1">Services</span>
              </div>
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-2.5 flex flex-col items-center justify-center shadow-xs border border-white/80 hover:scale-105 transition-transform cursor-pointer">
                <UtensilsCrossed className="w-5 h-5 text-[#D49900]" />
                <span className="text-[10px] font-black text-slate-900 mt-1">Food</span>
              </div>
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-2.5 flex flex-col items-center justify-center shadow-xs border border-white/80 hover:scale-105 transition-transform cursor-pointer">
                <Bed className="w-5 h-5 text-[#003B95]" />
                <span className="text-[10px] font-black text-slate-900 mt-1">Stay</span>
              </div>
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-2.5 flex flex-col items-center justify-center shadow-xs border border-white/80 hover:scale-105 transition-transform cursor-pointer">
                <Plane className="w-5 h-5 text-[#003B95]" />
                <span className="text-[10px] font-black text-slate-900 mt-1">Travel</span>
              </div>
            </div>

            {/* Bottom Row: 3 Cards */}
            <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-2.5 flex flex-col items-center justify-center shadow-xs border border-white/80 hover:scale-105 transition-transform cursor-pointer">
                <ShoppingCart className="w-5 h-5 text-[#003B95]" />
                <span className="text-[10px] font-black text-slate-900 mt-1">Daily Needs</span>
              </div>
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-2.5 flex flex-col items-center justify-center shadow-xs border border-white/80 hover:scale-105 transition-transform cursor-pointer">
                <Briefcase className="w-5 h-5 text-[#003B95]" />
                <span className="text-[10px] font-black text-slate-900 mt-1">Jobs</span>
              </div>
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-2.5 flex flex-col items-center justify-center shadow-xs border border-white/80 hover:scale-105 transition-transform cursor-pointer">
                <LayoutGrid className="w-5 h-5 text-[#D49900]" />
                <span className="text-[10px] font-black text-slate-900 mt-1">More</span>
              </div>
            </div>
          </div>

        </div>

        {/* City Silhouette Transition Graphic & Bottom Navy Blue Bar */}
        <div className="w-full shrink-0 relative mt-auto">
          
          {/* Skyline Curve Transition Graphic */}
          <div className="w-full h-8 bg-gradient-to-t from-[#0A1E38] to-transparent pointer-events-none" />

          {/* Bottom Deep Navy Blue Feature Bar */}
          <div className="bg-[#0A1E38] text-white p-4 pt-3 border-t border-blue-900/30">
            <div className="grid grid-cols-4 gap-2 text-center max-w-lg mx-auto">
              
              {/* Feature 1 */}
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-xl bg-[#FFB800]/20 text-[#FFB800] flex items-center justify-center mb-1">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="text-[10px] font-black text-white">Secure & Safe</h4>
                <p className="text-[8.5px] text-slate-300 font-medium leading-tight mt-0.5">
                  Top data security.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-xl bg-[#FFB800]/20 text-[#FFB800] flex items-center justify-center mb-1">
                  <Award className="w-4 h-4" />
                </div>
                <h4 className="text-[10px] font-black text-white">Trusted Platform</h4>
                <p className="text-[8.5px] text-slate-300 font-medium leading-tight mt-0.5">
                  Thousands of users.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-xl bg-[#FFB800]/20 text-[#FFB800] flex items-center justify-center mb-1">
                  <Headphones className="w-4 h-4" />
                </div>
                <h4 className="text-[10px] font-black text-white">24/7 Support</h4>
                <p className="text-[8.5px] text-slate-300 font-medium leading-tight mt-0.5">
                  Here to help anytime.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-xl bg-[#FFB800]/20 text-[#FFB800] flex items-center justify-center mb-1">
                  <Tag className="w-4 h-4" />
                </div>
                <h4 className="text-[10px] font-black text-white">Best Offers</h4>
                <p className="text-[8.5px] text-slate-300 font-medium leading-tight mt-0.5">
                  Exclusive discounts.
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
