import React from 'react';
import logoImg from '../../assets/images/forge india logo.jpg';

export default function AccountStatusNotice({ statusType, user, onLogout, onBackHome }) {
  const isPending = statusType === 'pending';
  const isSuspended = statusType === 'suspended';
  const isUnauthorizedRole = statusType === 'unauthorized_role';

  let title = 'Account Status Notice';
  let badgeText = 'NOTICE';
  let badgeColor = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
  let description = 'Your account status requires attention.';

  if (isPending) {
    title = 'Account Awaiting Approval';
    badgeText = 'UNDER VERIFICATION';
    badgeColor = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    description = 'Your registration application has been submitted successfully and is currently under review by an administrator. For security and compliance, access to protected features is restricted until approval is granted.';
  } else if (isSuspended) {
    title = 'Account Suspended';
    badgeText = 'SUSPENDED';
    badgeColor = 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    description = 'Your account access has been suspended. Please contact customer support if you believe this is an error or require assistance in reinstating your access.';
  } else if (isUnauthorizedRole) {
    title = 'Portal Access Restricted';
    badgeText = 'ROLE RESTRICTED';
    badgeColor = 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
    description = `Your account is registered with the role "${user?.role || 'non-customer'}", which is not authorized to access the Customer Portal. Please access your designated portal or log in with an authorized customer account.`;
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 font-sans flex flex-col items-center justify-center p-4 sm:p-6 py-12">
      <div className="w-full max-w-md bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
        
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-2.5 pb-2">
          <img 
            src={logoImg} 
            alt="Connect App Logo" 
            className="w-10 h-10 object-cover rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs" 
          />
          <div className="text-left">
            <h1 className="text-base font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1 leading-none uppercase">
              Connect <span className="text-[#FFB800]">App</span>
            </h1>
            <p className="text-[9px] font-bold text-slate-400 tracking-wide uppercase mt-0.5">Customer Portal</p>
          </div>
        </div>

        {/* Status Icon & Badge */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 flex items-center justify-center border border-amber-500/20 shadow-inner">
            {isPending && (
              <svg className="w-8 h-8 text-amber-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {isSuspended && (
              <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            )}
            {isUnauthorizedRole && (
              <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            )}
          </div>

          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${badgeColor}`}>
            {badgeText}
          </span>
        </div>

        {/* Explanation */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {title}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {description}
          </p>
        </div>

        {/* User Context */}
        {user?.email && (
          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <div>Signed in as: <span className="font-semibold text-slate-700 dark:text-slate-200">{user.email}</span></div>
            {user.role && <div>Role: <span className="font-semibold text-slate-700 dark:text-slate-200 uppercase">{user.role}</span></div>}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-2">
          {isPending && (
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 px-4 bg-[#FFB800] hover:bg-[#e5a600] text-slate-950 font-bold rounded-xl transition-colors shadow-sm"
            >
              Refresh Status
            </button>
          )}

          <button
            onClick={onLogout}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-xl transition-colors"
          >
            Log Out & Switch Account
          </button>

          {onBackHome && (
            <button
              onClick={onBackHome}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-[#FFB800] transition-colors"
            >
              Return to Public Home
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
