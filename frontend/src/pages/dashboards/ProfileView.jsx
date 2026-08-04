import React, { useState, useMemo } from 'react';
import { 
  User, Mail, Phone, MapPin, CheckCircle2, AlertCircle, 
  Upload, FileText, Image as ImageIcon, X 
} from 'lucide-react';
import { 
  validateName, 
  validateMobile, 
  sanitizeMobileInput,
  validateEmail, 
  validateFileUpload, 
  sanitizeInput 
} from '../../utils/validation';

export default function ProfileView({ currentUser, onSave }) {
  const [name, setName] = useState(currentUser?.name || 'Dhanush Tamilarasan');
  const [email, setEmail] = useState(currentUser?.email || 'customer@connect.app');
  const [phone, setPhone] = useState(currentUser?.phone || '9876543210');
  const [city, setCity] = useState(currentUser?.city || 'Bangalore, Karnataka');
  
  // File Upload State with Preview
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [docFile, setDocFile] = useState(null);
  const [docError, setDocError] = useState('');
  const [avatarError, setAvatarError] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Field validation
  const nameVal = useMemo(() => validateName(name), [name]);
  const phoneVal = useMemo(() => validateMobile(phone), [phone]);
  const emailVal = useMemo(() => validateEmail(email), [email]);

  const isFormValid = useMemo(() => {
    return nameVal.isValid && phoneVal.isValid && emailVal.isValid && !docError && !avatarError;
  }, [nameVal, phoneVal, emailVal, docError, avatarError]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const res = validateFileUpload(file, ['jpg', 'jpeg', 'png'], 5);
    if (!res.isValid) {
      setAvatarError(res.error);
      return;
    }
    setAvatarError('');
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDocChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const res = validateFileUpload(file, ['jpg', 'jpeg', 'png', 'pdf'], 5);
    if (!res.isValid) {
      setDocError(res.error);
      return;
    }
    setDocError('');
    setDocFile(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    const cleanName = sanitizeInput(name);
    const cleanCity = sanitizeInput(city);

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);

    if (onSave) {
      onSave({ 
        name: cleanName, 
        email: email.trim(), 
        phone: phone.trim(), 
        city: cleanCity,
        avatar: avatarPreview,
        docName: docFile?.name 
      });
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-4xl mx-auto">
      
      {/* Profile Header Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-[#0b132b] via-[#1c2541] to-[#0b132b] rounded-3xl border border-slate-800 text-white flex flex-col sm:flex-row items-center gap-6 shadow-2xl">
        <div className="relative group">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 font-black text-2xl flex items-center justify-center border-4 border-amber-400/40 shadow-xl overflow-hidden shrink-0">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              name.charAt(0).toUpperCase()
            )}
          </div>
          <label 
            htmlFor="avatar-upload"
            className="absolute bottom-0 right-0 p-1.5 bg-amber-400 text-slate-950 rounded-full cursor-pointer shadow-md hover:scale-110 transition-transform"
            title="Upload Profile Photo (JPG, PNG <= 5MB)"
          >
            <Upload size={14} />
          </label>
          <input 
            id="avatar-upload" 
            type="file" 
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleAvatarChange}
            className="hidden" 
          />
        </div>

        <div className="text-center sm:text-left space-y-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h1 className="text-xl sm:text-2xl font-black font-sans">{name}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
              Verified Member
            </span>
          </div>
          <p className="text-xs text-slate-300">{email} • +91 {phone}</p>
          {avatarError && <p className="text-[10px] text-rose-400 font-bold">{avatarError}</p>}
        </div>
      </div>

      {/* Profile Form */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
          <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider font-sans">
            Bank-Grade Verified Settings
          </h2>
          {isSaved && (
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
              <CheckCircle2 size={16} /> Profile Saved!
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Full Name */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold uppercase text-slate-400">Full Name</label>
                {nameVal.isValid && (
                  <span className="text-emerald-500 text-[10px] font-bold flex items-center gap-0.5"><CheckCircle2 size={12} /> Valid</span>
                )}
              </div>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 text-slate-400" size={16} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                  className={`w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-950 border rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 ${
                    !nameVal.isValid ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
                  }`}
                />
              </div>
              {!nameVal.isValid && <p className="text-[10px] text-rose-500 font-bold mt-1">{nameVal.error}</p>}
            </div>

            {/* Email */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold uppercase text-slate-400">Email Address</label>
                {emailVal.isValid && (
                  <span className="text-emerald-500 text-[10px] font-bold flex items-center gap-0.5"><CheckCircle2 size={12} /> Valid</span>
                )}
              </div>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 text-slate-400" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-950 border rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 ${
                    !emailVal.isValid ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
                  }`}
                />
              </div>
              {!emailVal.isValid && <p className="text-[10px] text-rose-500 font-bold mt-1">{emailVal.error}</p>}
            </div>

            {/* Phone */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold uppercase text-slate-400">Mobile Number (10 Digits)</label>
                {phoneVal.isValid && (
                  <span className="text-emerald-500 text-[10px] font-bold flex items-center gap-0.5"><CheckCircle2 size={12} /> Valid</span>
                )}
              </div>
              <div className="relative flex items-center">
                <Phone className="absolute left-3.5 text-slate-400" size={16} />
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(sanitizeMobileInput(e.target.value))}
                  className={`w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-950 border rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 ${
                    !phoneVal.isValid ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
                  }`}
                />
              </div>
              {!phoneVal.isValid && <p className="text-[10px] text-rose-500 font-bold mt-1">{phoneVal.error}</p>}
            </div>

            {/* City */}
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 block mb-1.5">City / Location</label>
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

          {/* Document Verification Upload Section */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 text-left">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Identity Verification Document (JPG, PNG, PDF &lt;= 5MB)
            </h3>
            
            <div className="flex items-center gap-4">
              <label 
                htmlFor="doc-upload"
                className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer flex items-center gap-2 transition-all shadow-xs"
              >
                <Upload size={14} className="text-amber-500" />
                <span>Upload ID Document</span>
              </label>
              <input 
                id="doc-upload" 
                type="file" 
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleDocChange}
                className="hidden" 
              />

              {docFile && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <FileText size={14} />
                  <span>{docFile.name}</span>
                  <button type="button" onClick={() => setDocFile(null)} className="hover:text-rose-500 border-none bg-transparent cursor-pointer">
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
            {docError && <p className="text-[10px] font-bold text-rose-500">{docError}</p>}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={!isFormValid}
              className={`w-full sm:w-auto px-8 py-3 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all border-none ${
                isFormValid
                  ? 'bg-amber-400 hover:bg-amber-500 text-slate-950 cursor-pointer shadow-md'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed opacity-60'
              }`}
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* Active Device Sessions & Multi-Device Security */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-5 text-left">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider font-sans flex items-center gap-2">
              <span>Active Device Sessions</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-500/10 text-blue-500 border border-blue-500/20">
                Multi-Device Protection Enabled
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Manage recognized devices & force logout suspicious sessions.</p>
          </div>

          <button
            type="button"
            onClick={() => alert("Successfully logged out from all other active devices.")}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/50 rounded-xl text-xs font-black transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            Logout All Devices
          </button>
        </div>

        <div className="space-y-3">
          {/* Current Device Session Item */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-500 border border-amber-400/20 flex items-center justify-center font-black text-xs shrink-0">
                💻
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100">Windows PC • Chrome Browser</h4>
                  <span className="px-2 py-0.2 text-[8px] font-bold text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/50 rounded-full uppercase">
                    This Device
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  IP: 182.73.12.94 • Location: Bangalore, India • Active Now
                </p>
              </div>
            </div>

            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
              Session Active
            </span>
          </div>

          {/* Secondary Recognized Device Item */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center font-black text-xs shrink-0">
                📱
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100">Android Smartphone • Connect Mobile App</h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  IP: 49.37.108.41 • Location: Bangalore, India • Last active 2 hours ago
                </p>
              </div>
            </div>

            <button 
              type="button"
              onClick={() => alert("Revoked mobile device session successfully.")}
              className="px-3 py-1 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
            >
              Revoke Session
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
