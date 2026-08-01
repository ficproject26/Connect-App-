import React, { useState } from 'react';
import { 
  X, Mail, Lock, Eye, EyeOff, LogIn, Check, 
  User, Store, ShieldCheck 
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import logoImg from '../../assets/images/forge india logo.jpg';

export default function LoginModal({ isOpen, onClose, onLoginSuccess, onNavigateToJoinNow }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('customer'); // 'customer' | 'vendor'
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = (e) => {
    e?.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      
      let displayName = email ? email.split('@')[0] : (role === 'vendor' ? 'Ravi Sharma' : 'Alex Johnson');
      displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

      const userObj = {
        name: role === 'vendor' ? 'Ravi Sharma' : displayName,
        email: email || (role === 'vendor' ? 'vendor@connectapp.com' : 'user@connectapp.com'),
        role: role
      };

      login(userObj.email, userObj.role, (loggedUser) => {
        setTimeout(() => {
          setSuccess(false);
          if (onLoginSuccess) {
            onLoginSuccess(loggedUser || userObj);
          }
          onClose();
        }, 600);
      });
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs animate-fade-in text-slate-800 dark:text-slate-200 select-none">
      
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Content Box */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 z-10 animate-scale-up text-left">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all cursor-pointer border-none bg-transparent"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Logo & Branding Header */}
        <div className="flex items-center gap-3 mb-5 pr-8">
          <img 
            src={logoImg} 
            alt="Forge India Connect Logo" 
            className="w-10 h-10 object-cover rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs" 
          />
          <div>
            <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1 leading-none uppercase">
              Connect <span className="text-[#FFC107]">App</span>
            </h2>
            <p className="text-[9.5px] font-bold text-slate-400 tracking-wide uppercase mt-0.5">Please Login to Continue</p>
          </div>
        </div>

        {success ? (
          <div className="text-center py-8 animate-scale-up space-y-3">
            <div className="w-14 h-14 bg-amber-100 dark:bg-amber-950/60 text-[#FFC107] rounded-full flex items-center justify-center mx-auto border border-amber-300 dark:border-amber-700 shadow-lg animate-bounce">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Welcome Back!</h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Logged in successfully. Proceeding with your action...
            </p>
          </div>
        ) : (
          <>
            {/* Title */}
            <div className="mb-4">
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Sign In to Your <span className="text-[#FFC107]">Account</span>
              </h3>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1">
                Enter your credentials to book, order, or checkout items.
              </p>
            </div>



            {/* Main Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              
              {/* Email/Phone */}
              <div>
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
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
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
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-2.5 pl-10 pr-10 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all"
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

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-[#FFC107] focus:ring-[#FFC107] accent-[#FFC107] cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>

                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="text-xs font-extrabold text-[#003B95] dark:text-[#FFC107] hover:underline"
                >
                  Forgot Password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-6 bg-[#FFC107] hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 border-none active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed mt-2"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Logging in...</span>
                  </div>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </>
                )}
              </button>
            </form>

            {/* Bottom Signup Prompt */}
            <div className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onNavigateToJoinNow) onNavigateToJoinNow();
                }}
                className="font-extrabold text-[#003B95] dark:text-[#FFC107] hover:underline bg-transparent border-none p-0 inline cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
