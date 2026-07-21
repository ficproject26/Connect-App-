import React, { useState } from 'react';
import { 
  Mail, Lock, Eye, EyeOff, LogIn, ShieldCheck, Check, 
  User, Store, Wrench, UtensilsCrossed, Bed, Plane, ShoppingCart, 
  Briefcase, Tag, LayoutGrid, Headphones, Award, ShoppingBag, Globe 
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
