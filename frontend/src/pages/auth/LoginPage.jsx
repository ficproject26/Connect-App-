import React, { useState } from 'react';
import { Mail, Lock, Sparkles, ArrowLeft, Check, User, Store, ShieldAlert, Truck } from 'lucide-react';
import logoImg from '../../assets/images/forge india logo.jpg';

export default function LoginPage({ onAuthSuccess, onBackToHome, onNavigateToJoinNow }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // 'customer' | 'vendor' | 'agent'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingRole, setSubmittingRole] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleAccess = (selectedRole) => {
    setRole(selectedRole);
    setIsSubmitting(true);
    setSubmittingRole(selectedRole);

    // Mock API Authentication Call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittingRole(null);
      setSuccess(true);
      
      // Derive name from email
      let displayName = email.split('@')[0];
      displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

      setTimeout(() => {
        onAuthSuccess({
          name: selectedRole === 'vendor' ? 'Ravi Sharma' : (selectedRole === 'delivery' ? 'Dev Singh' : displayName || 'Connect Member'),
          email: email,
          role: selectedRole
        });
        setSuccess(false);
      }, 1000);
    }, 1500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAccess(role);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 font-sans relative overflow-hidden px-4 py-12">
      {/* Premium Ambient Light Gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-gold/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Back to Home Button */}
      <button
        onClick={onBackToHome}
        className="absolute top-6 left-6 inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer text-xs font-semibold backdrop-blur-md group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        <span>Back to Home</span>
      </button>

      <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
        {/* Top Gold Corner Accent */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-brand-gold/5 rounded-bl-full pointer-events-none" />

        {success ? (
          /* Authentication Success Screen */
          <div className="text-center py-12 animate-scale-up">
            <div className="w-16 h-16 bg-emerald-950/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-900/50 shadow-md">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Success! Welcome back</h3>
            <p className="text-sm text-slate-400 mt-2">
              Authentication was successful. Building your dashboard...
            </p>
          </div>
        ) : (
          <div>
            {/* Brand Header */}
            <div className="flex flex-col items-center mb-6">
              <img
                src={logoImg}
                alt="Connect Logo"
                className="h-12 w-auto object-contain rounded-xl mb-3 border border-slate-800 shadow-md"
              />
              <span className="text-xs font-extrabold tracking-[0.3em] text-white uppercase">
                Connect
              </span>
            </div>

            {/* Title Section */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h2>
              <p className="text-xs text-slate-400 mt-1.5">
                Access your luxury ecosystem and premium dashboard
              </p>
            </div>



            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Address */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold text-sm transition-all text-white placeholder-slate-600"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Password
                  </label>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="text-[10px] font-bold text-brand-gold hover:text-brand-gold-dark uppercase tracking-widest transition-colors"
                  >
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold text-sm transition-all text-white placeholder-slate-600"
                  />
                </div>
              </div>

              {/* Role Access Buttons */}
              <div className="mt-6">
                {/* Customer Access Button */}
                <button
                  type="button"
                  onClick={() => handleAccess('customer')}
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-white text-slate-950 hover:bg-slate-100 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting && submittingRole === 'customer' ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-slate-950" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </>
                  ) : (
                    <>
                      <User className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Customer</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Register redirection */}
            <div className="mt-8 pt-6 border-t border-slate-800/60 text-center text-xs text-slate-500">
              New to the circle?{' '}
              <button
                onClick={onNavigateToJoinNow}
                className="font-bold text-brand-gold hover:text-brand-gold-dark transition-colors cursor-pointer bg-transparent border-none p-0 inline"
              >
                Join Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
