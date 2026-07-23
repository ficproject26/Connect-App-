import React, { useState } from 'react';
import { 
  Mail, Lock, Eye, EyeOff, User, Check, 
  ShieldCheck, Phone, UserPlus, Wrench, UtensilsCrossed, 
  Bed, Plane, ShoppingCart, Briefcase, LayoutGrid, Headphones, 
  Tag, Award, CreditCard, FileText 
} from 'lucide-react';
import logoImg from '../../assets/images/forge india logo.jpg';

export default function JoinNowPage({ onAuthSuccess, onBackToHome, onNavigateToLoginPage }) {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
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
    if (pass.length < 9) return { score: 2, label: 'Medium', color: 'bg-[#FFB800]' };
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) {
      return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
    }
    return { score: 3, label: 'Good', color: 'bg-blue-500' };
  };

  const strength = getPasswordStrength(password);

  // Backend API URL — points to admin ConnectApp backend
  const getApiBase = () => {
    if (typeof window === 'undefined') return 'http://localhost:8001/api';
    const hostname = window.location.hostname;
    if (!hostname || hostname === 'localhost' || hostname === '127.0.0.1' ||
        hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.startsWith('172.')) {
      return `http://${hostname || 'localhost'}:8001/api`;
    }
    return 'https://connect-admin-96pc.onrender.com/api';
  };

  const [errorMsg, setErrorMsg] = useState('');

  const handleSignupSubmit = async (e) => {
    e?.preventDefault();
    if (!agreeTerms) return;
    setErrorMsg('');
    setIsSubmitting(true);

    const displayName = fullName || 'Connect Member';

    try {
      const res = await fetch(`${getApiBase()}/auth/register-customer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: displayName,
          phone: phoneNumber,
          email: email || `user_${phoneNumber}@connectapp.com`,
          password: password,
          aadhaarNumber: aadhaarNumber,
          panNumber: panNumber,
          address: address,
          city: city,
          pincode: pincode
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setIsSubmitting(false);
        setErrorMsg(data.msg || 'Registration failed. Please try again.');
        return;
      }

      // Registration successful
      setIsSubmitting(false);
      setSuccess(true);

      setTimeout(() => {
        onAuthSuccess({
          name: displayName,
          email: email || `user_${phoneNumber}@connectapp.com`,
          role: 'customer',
          aadhaar: aadhaarNumber,
          pan: panNumber,
          address: address,
          city: city,
          pincode: pincode
        });
        setSuccess(false);
      }, 800);

    } catch (err) {
      console.warn('Backend unreachable, proceeding with local signup:', err);
      // Fallback: proceed locally if backend is down
      setIsSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        onAuthSuccess({
          name: displayName,
          email: email || `user_${phoneNumber}@connectapp.com`,
          role: 'customer',
          aadhaar: aadhaarNumber,
          pan: panNumber,
          address: address,
          city: city,
          pincode: pincode
        });
        setSuccess(false);
      }, 800);
    }
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
              alt="Connect App Logo" 
              className="w-10 h-10 object-cover rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs group-hover:scale-105 transition-transform" 
            />
            <div>
              <h1 className="text-base font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1 leading-none uppercase">
                Connect <span className="text-[#FFB800]">App</span>
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
                Welcome to Connect App! Preparing your dashboard...
              </p>
            </div>
          ) : (
            <>
              {/* Title Header */}
              <div className="mb-4 text-left">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Create Your <span className="text-[#FFB800]">Account</span>
                </h2>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">
                  Join Connect App and explore endless opportunities.
                </p>
              </div>

              {/* Form Fields */}
              <form onSubmit={handleSignupSubmit} className="space-y-3">
                
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
                        maxLength={10}
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter 10-digit phone number"
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

                {/* Row 3: Aadhaar Card & PAN Card Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Aadhaar Card Number */}
                  <div className="text-left">
                    <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                      Aadhaar Card Number
                    </label>
                    <div className="relative">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        maxLength={12}
                        value={aadhaarNumber}
                        onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="12-digit Aadhaar number"
                        className="w-full bg-slate-50/70 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* PAN Card Number */}
                  <div className="text-left">
                    <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                      PAN Card Number
                    </label>
                    <div className="relative">
                      <FileText className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        maxLength={10}
                        value={panNumber}
                        onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                        placeholder="10-character PAN number"
                        className="w-full bg-slate-50/70 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs font-semibold uppercase text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 3.5: Full Residential Address & City / Pincode */}
                <div className="space-y-2.5">
                  <div className="text-left">
                    <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                      Delivery / Residential Address
                    </label>
                    <div className="relative">
                      <UserPlus className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="House/Flat No, Street, Locality"
                        className="w-full bg-slate-50/70 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="text-left">
                      <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                        City / Town
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Bangalore"
                        className="w-full bg-slate-50/70 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-xl py-2 px-3 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 transition-all"
                      />
                    </div>
                    <div className="text-left">
                      <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                        Pincode
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                        placeholder="6-digit Pincode"
                        className="w-full bg-slate-50/70 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-xl py-2 px-3 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 4: Create Password & Strength Bar */}
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

                {/* Row 5: Confirm Password */}
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

                {/* Terms Agreement Checkbox */}
                <div className="pt-1 text-left">
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
                {errorMsg && (
                  <div className="w-full bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold px-3 py-2 rounded-xl text-center">
                    {errorMsg}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting || !agreeTerms}
                  className="w-full py-3 px-6 bg-[#FFB800] hover:bg-[#E5A700] text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 border-none active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed mt-2"
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
            </>
          )}

        </div>

        {/* Footer Note */}
        <div className="text-center text-[10px] text-slate-400 dark:text-slate-500 font-semibold pt-1 shrink-0">
          Connect App Platform Onboarding • All rights reserved
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
              <img src={logoImg} alt="Connect App Logo" className="w-full h-full object-cover rounded-full" />
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
              Connect App brings all services together to make your life easier, faster and smarter.
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

        {/* Smooth Wave Transition & Navy Blue Bottom Section */}
        <div className="w-full shrink-0 relative mt-auto">
          
          {/* Smooth Curved SVG Wave Separator */}
          <div className="w-full overflow-hidden leading-none z-10 block pointer-events-none">
            <svg 
              className="relative block w-full h-8 sm:h-10 text-[#0A1E38]" 
              viewBox="0 0 1200 120" 
              preserveAspectRatio="none"
              fill="currentColor"
            >
              <path d="M0,0 C150,90 350,-40 500,50 C650,120 900,10 1200,40 L1200,120 L0,120 Z"></path>
            </svg>
          </div>

          {/* Bottom Deep Navy Blue Feature Bar */}
          <div className="bg-[#0A1E38] text-white p-4 pt-2 border-t border-blue-900/30">
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
