import React, { useState } from 'react';
import { 
  Mail, Lock, Eye, EyeOff, LogIn, ShieldCheck, Check, 
  User, Store, Wrench, UtensilsCrossed, Bed, Plane, ShoppingCart, 
  Briefcase, Tag, LayoutGrid, Headphones, Award 
} from 'lucide-react';
import logoImg from '../../assets/images/forge india logo.jpg';

export default function LoginPage({ onAuthSuccess, onBackToHome, onNavigateToJoinNow }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('customer'); // 'customer' | 'vendor'
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleLoginSubmit = (e) => {
    e?.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      
      let displayName = email ? email.split('@')[0] : (role === 'vendor' ? 'Ravi Sharma' : 'Alex Johnson');
      displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

      setTimeout(() => {
        onAuthSuccess({
          name: role === 'vendor' ? 'Ravi Sharma' : displayName,
          email: email || (role === 'vendor' ? 'vendor@connectapp.com' : 'user@connectapp.com'),
          role: role
        });
        setSuccess(false);
      }, 800);
    }, 1000);
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
                Forge India <span className="text-[#FFB800]">Connect</span>
              </h1>
              <p className="text-[9px] font-bold text-slate-400 tracking-wide uppercase mt-0.5">All Services, One Platform</p>
            </div>
          </div>

          <button
            onClick={onBackToHome}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
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
                Authentication successful. Accessing your portal...
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
                  Login to continue to your account
                </p>
              </div>

              {/* Role Switcher Pill Bar */}
              <div className="bg-slate-100/80 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200/70 dark:border-slate-800 grid grid-cols-2 gap-1 mb-4">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    role === 'customer'
                      ? 'bg-white dark:bg-slate-800 text-[#003B95] dark:text-[#FFB800] shadow-sm border border-[#FFB800]/50'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>User Login</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('vendor')}
                  className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    role === 'vendor'
                      ? 'bg-white dark:bg-slate-800 text-[#003B95] dark:text-[#FFB800] shadow-sm border border-[#FFB800]/50'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Vendor Login</span>
                </button>
              </div>

              {/* Main Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-3 sm:space-y-3.5">
                
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

                {/* Login Button (Bright Gold/Yellow) */}
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
                      <span>Login</span>
                    </>
                  )}
                </button>
              </form>

              {/* Social Login Divider */}
              <div className="relative my-4 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <span className="relative bg-white dark:bg-[#030712] px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  or continue with
                </span>
              </div>

              {/* Social Buttons (Google, Facebook, Apple) */}
              <div className="grid grid-cols-3 gap-2">
                {/* Google */}
                <button
                  type="button"
                  onClick={() => handleLoginSubmit()}
                  className="py-2 px-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.3 7.31 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.99 0 12s.46 3.84 1.26 5.42l4.02-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Google</span>
                </button>

                {/* Facebook */}
                <button
                  type="button"
                  onClick={() => handleLoginSubmit()}
                  className="py-2 px-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0 fill-[#1877F2]" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Facebook</span>
                </button>

                {/* Apple */}
                <button
                  type="button"
                  onClick={() => handleLoginSubmit()}
                  className="py-2 px-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
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


      {/* ==================== RIGHT PANEL: YELLOW BRANDING & CATEGORIES SIDE ==================== */}
      <div className="hidden lg:flex w-1/2 h-full bg-gradient-to-b from-[#FFB800] via-[#FFC700] to-[#E5A500] relative overflow-hidden flex-col justify-between text-slate-900 select-none">
        
        {/* Top Floating White Circle Logo Avatar */}
        <div className="pt-8 flex flex-col items-center justify-center z-10 shrink-0">
          <div className="relative flex flex-col items-center">
            {/* Main white circle avatar containing Logo with yellow ring */}
            <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-full bg-white p-2 flex items-center justify-center shadow-xl shadow-amber-950/20 border-4 border-white transform hover:scale-105 transition-transform cursor-pointer">
              <img src={logoImg} alt="Forge India Connect Logo" className="w-full h-full object-cover rounded-full" />
            </div>
          </div>
        </div>

        {/* Center Text & Category Grid Section */}
        <div className="z-10 flex flex-col items-center text-center px-8 my-auto py-2">
          
          {/* Main Title & Tagline */}
          <div className="max-w-md mx-auto text-center mb-5">
            <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              All Services,<br />
              One Platform,<br />
              <span className="text-[#003B95]">Infinite Possibilities!</span>
            </h2>
            <div className="w-10 h-1 bg-slate-900 rounded-full mx-auto my-2.5" />
            <p className="text-xs font-semibold text-slate-800 leading-relaxed max-w-sm mx-auto">
              Forge India Connect brings all services together to make your life easier, faster and smarter.
            </p>
          </div>

          {/* Service Category Cards (8 Badges: Services, Food, Stay, Travel, Daily Needs, Jobs, Offers, More) */}
          <div className="w-full max-w-md mx-auto space-y-2.5 my-1">
            {/* Top Row: 4 Cards */}
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 flex flex-col items-center justify-center shadow-xs border border-white hover:scale-105 transition-transform cursor-pointer">
                <Wrench className="w-5 h-5 text-[#003B95]" />
                <span className="text-[10px] font-black text-slate-900 mt-1">Services</span>
              </div>
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 flex flex-col items-center justify-center shadow-xs border border-white hover:scale-105 transition-transform cursor-pointer">
                <UtensilsCrossed className="w-5 h-5 text-[#D49900]" />
                <span className="text-[10px] font-black text-slate-900 mt-1">Food</span>
              </div>
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 flex flex-col items-center justify-center shadow-xs border border-white hover:scale-105 transition-transform cursor-pointer">
                <Bed className="w-5 h-5 text-[#003B95]" />
                <span className="text-[10px] font-black text-slate-900 mt-1">Stay</span>
              </div>
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 flex flex-col items-center justify-center shadow-xs border border-white hover:scale-105 transition-transform cursor-pointer">
                <Plane className="w-5 h-5 text-[#003B95]" />
                <span className="text-[10px] font-black text-slate-900 mt-1">Travel</span>
              </div>
            </div>

            {/* Bottom Row: 4 Cards */}
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 flex flex-col items-center justify-center shadow-xs border border-white hover:scale-105 transition-transform cursor-pointer">
                <ShoppingCart className="w-5 h-5 text-[#003B95]" />
                <span className="text-[10px] font-black text-slate-900 mt-1">Daily Needs</span>
              </div>
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 flex flex-col items-center justify-center shadow-xs border border-white hover:scale-105 transition-transform cursor-pointer">
                <Briefcase className="w-5 h-5 text-[#003B95]" />
                <span className="text-[10px] font-black text-slate-900 mt-1">Jobs</span>
              </div>
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 flex flex-col items-center justify-center shadow-xs border border-white hover:scale-105 transition-transform cursor-pointer">
                <Tag className="w-5 h-5 text-[#003B95]" />
                <span className="text-[10px] font-black text-slate-900 mt-1">Offers</span>
              </div>
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 flex flex-col items-center justify-center shadow-xs border border-white hover:scale-105 transition-transform cursor-pointer">
                <LayoutGrid className="w-5 h-5 text-[#003B95]" />
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
