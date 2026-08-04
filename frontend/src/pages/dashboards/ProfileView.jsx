import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Shield, Key, Sparkles, CheckCircle2 } from 'lucide-react';

export default function ProfileView({ currentUser, onSave }) {
  const [name, setName] = useState(currentUser?.name || 'Dhanush Tamilarasan');
  const [email, setEmail] = useState(currentUser?.email || 'customer@connect.app');
  const [phone, setPhone] = useState(currentUser?.phone || '+91 98765 43210');
  const [city, setCity] = useState(currentUser?.city || 'Bangalore, Karnataka');
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
    if (onSave) onSave({ name, email, phone, city });
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-4xl mx-auto">
      
      {/* Profile Header */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-[#0b132b] via-[#1c2541] to-[#0b132b] rounded-3xl border border-slate-800 text-white flex flex-col sm:flex-row items-center gap-6 shadow-2xl">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 font-black text-2xl flex items-center justify-center border-4 border-amber-400/40 shadow-xl shrink-0">
          {name.charAt(0)}
        </div>
        <div className="text-center sm:text-left space-y-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h1 className="text-xl sm:text-2xl font-black font-sans">{name}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
              VIP Member
            </span>
          </div>
          <p className="text-xs text-slate-300">{email} • {phone}</p>
          <span className="inline-block text-[10.5px] text-amber-400 font-bold uppercase tracking-wider">
            Verified Enterprise Account
          </span>
        </div>
      </div>

      {/* Profile Form (2-Col Desktop/Tablet, Single Col Mobile) */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
          <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider font-sans">
            Personal Information & Settings
          </h2>
          {isSaved && (
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
              <CheckCircle2 size={16} /> Saved!
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 block mb-1.5">Full Name</label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 text-slate-400" size={16} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-400 block mb-1.5">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 text-slate-400" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-400 block mb-1.5">Phone Number</label>
              <div className="relative flex items-center">
                <Phone className="absolute left-3.5 text-slate-400" size={16} />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-400 block mb-1.5">Default Location / City</label>
              <div className="relative flex items-center">
                <MapPin className="absolute left-3.5 text-slate-400" size={16} />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer border-none shadow-md"
            >
              Update Profile
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
