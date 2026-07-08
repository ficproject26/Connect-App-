import React, { useState } from 'react';
import { User, Store, ShieldAlert, Sparkles, Check, Mail, Lock, Briefcase, ArrowLeft } from 'lucide-react';
import logoImg from '../../assets/images/forge india logo.jpg';

export default function JoinNowPage({ onAuthSuccess, onBackToHome, onNavigateToLoginPage }) {
  const [role, setRole] = useState('customer'); // 'customer' | 'vendor' | 'agent'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    businessName: '',
    businessCategory: 'Services',
    membershipTier: 'Gold Elite',
    specialization: 'Luxury Travel'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Mock API Onboarding Call
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      
      // Determine user name to pass back
      let displayName = formData.name;
      if (role === 'vendor') {
        displayName = formData.businessName || 'Elite Vendor';
      }

      setTimeout(() => {
        onAuthSuccess({
          name: displayName || 'Connect Member',
          email: formData.email,
          role: role
        });
        setSuccess(false);
      }, 1000);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 font-sans relative overflow-hidden px-4 py-12">
      {/* Ambient Radial Gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-gold/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-950/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Back to Home Button */}
      <button
        onClick={onBackToHome}
        className="absolute top-6 left-6 inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer text-xs font-semibold backdrop-blur-md group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        <span>Back to Home</span>
      </button>

      <div className="w-full max-w-lg bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
        {/* Top Gold Accent */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-brand-gold/5 rounded-bl-full pointer-events-none" />

        {success ? (
          /* Registration Success feedback */
          <div className="text-center py-12 animate-scale-up">
            <div className="w-16 h-16 bg-emerald-950/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-900/50 shadow-md">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Onboarding Successful!</h3>
            <p className="text-sm text-slate-400 mt-2">
              Welcome to the premier circle. Preparing your personalized workspace...
            </p>
          </div>
        ) : (
          <div>
            {/* Header Brand */}
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
              <h2 className="text-2xl font-bold text-white tracking-tight">Create Account</h2>
              <p className="text-xs text-slate-400 mt-1.5">
                Join the premier network of customers, vendors, and agents
              </p>
            </div>

            {/* Role Options Selector */}
            <div className="mb-6">
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 text-center">
                Select Onboarding Role
              </label>
              <div className="bg-slate-950 p-1 rounded-xl flex items-center justify-between border border-slate-800">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all duration-200 cursor-pointer ${
                    role === 'customer'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-350'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Customer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('agent')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all duration-200 cursor-pointer ${
                    role === 'agent'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-350'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>Agent</span>
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Dynamic Name Inputs */}
              {role === 'vendor' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Business / Vendor Name
                  </label>
                  <div className="relative">
                    <Store className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      placeholder="e.g. Celestial Rooftop Lounge"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold text-sm text-white placeholder-slate-600 transition-all"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Dhanush An"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold text-sm text-white placeholder-slate-600 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Dynamic Field: Customer Membership Tier */}
              {role === 'customer' && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Membership Tier
                  </label>
                  <div className="relative">
                    <Sparkles className="w-4 h-4 text-brand-gold absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      name="membershipTier"
                      value={formData.membershipTier}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold text-sm text-white cursor-pointer appearance-none"
                    >
                      <option value="Silver Tier">Silver Tier ($49/mo)</option>
                      <option value="Gold Elite">Gold Elite ($99/mo)</option>
                      <option value="Diamond Prestige">Diamond Prestige ($249/mo)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Dynamic Field: Vendor Business Category */}
              {role === 'vendor' && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Business Category
                  </label>
                  <div className="relative">
                    <Store className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      name="businessCategory"
                      value={formData.businessCategory}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold text-sm text-white cursor-pointer appearance-none"
                    >
                      <option value="Services">Services (IT, Non-IT, Consultations)</option>
                      <option value="Products">Products (Fashion, Luxury Goods)</option>
                      <option value="Food">Food (Michelin Dining, Cafes)</option>
                      <option value="Stay">Stay (Luxury Villas, Boutique Hotels)</option>
                      <option value="Travel">Travel (Private Jets, Lounges)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Dynamic Field: Agent Specialization */}
              {role === 'agent' && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Specialization Area
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold text-sm text-white cursor-pointer appearance-none"
                    >
                      <option value="Luxury Travel">Luxury Travel Concierge</option>
                      <option value="Merchant Onboarding">Merchant Partnerships</option>
                      <option value="HNI Wealth Advisory">HNI Wealth & Memberships</option>
                      <option value="IT Consulting">IT & Solutions Outsourcing</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Standard Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold text-sm text-white placeholder-slate-600 transition-all"
                  />
                </div>
              </div>

              {/* Standard Password */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold text-sm text-white placeholder-slate-600 transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 py-3.5 bg-white text-slate-950 hover:bg-slate-100 font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Onboarding...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-brand-gold" />
                    <span>Initialize Account</span>
                  </>
                )}
              </button>
            </form>

            {/* Login redirect link */}
            <div className="mt-8 pt-6 border-t border-slate-800/60 text-center text-xs text-slate-500">
              Already have an account?{' '}
              <button
                onClick={onNavigateToLoginPage}
                className="font-bold text-brand-gold hover:text-brand-gold-dark transition-colors cursor-pointer bg-transparent border-none p-0 inline"
              >
                Access Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
