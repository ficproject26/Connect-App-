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
                Connect <span className="text-[#FFB800]">App</span>
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
              Connect App brings all services together to make your life easier, faster and smarter.
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
