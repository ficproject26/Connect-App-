import React from 'react';
import useCustomer from '../../hooks/useCustomer';
import { Award, Sparkles, Check } from 'lucide-react';

export default function Membership() {
  const { membershipTier } = useCustomer();
  const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('connect_current_user') : null;
  const currentUser = raw ? JSON.parse(raw) : null;

  return (
    <div className="p-6 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl text-left text-white max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3.5">
        <Award className="w-8 h-8 text-[#F4C400]" />
        <div>
          <h2 className="text-xl font-bold">Connect Privilege Membership</h2>
          <p className="text-xs text-slate-400">Manage your premium network discounts and benefits</p>
        </div>
      </div>

      <div className="p-6 bg-gradient-to-r from-[#1C2541] to-slate-900 border border-[#F4C400]/25 rounded-2xl relative overflow-hidden">
        <Sparkles className="w-8 h-8 text-[#F4C400] absolute top-4 right-4 animate-pulse" />
        <span className="text-[10px] font-bold text-[#F4C400] uppercase tracking-wider block">Current Tier</span>
        <h3 className="text-3xl font-black text-white mt-1">{membershipTier}</h3>
        <p className="text-xs text-slate-300 mt-2 max-w-md">Your Connect status grants you pre-negotiated priority check-ins, zero-wait clinics, private lounges, and up to 30% discount at verified storefront partners.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { name: 'Silver Tier', discount: '10% OFF', price: '$49/mo', benefits: ['Standard support', 'Storewide partner discounts', 'Monthly events ticket'] },
          { name: 'Gold Elite', discount: '20% OFF', price: '$99/mo', benefits: ['Priority support line', 'Increased partner cashbacks', 'Free airport lounge invites'] },
          { name: 'Diamond Prestige', discount: '30% OFF', price: '$249/mo', benefits: ['Dedicated personal concierge', 'Unlimited lounge & yacht passes', 'Priority healthcare fast-track'] }
        ].map(tier => {
          const isCurrent = membershipTier.toLowerCase().includes(tier.name.split(' ')[0].toLowerCase());
          return (
            <div key={tier.name} className={`p-5 rounded-2xl border flex flex-col justify-between ${isCurrent ? 'bg-[#F4C400]/5 border-[#F4C400]' : 'bg-slate-950/40 border-slate-800'}`}>
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-bold text-white">{tier.name}</h4>
                  {isCurrent && <span className="bg-[#F4C400]/20 text-[#F4C400] text-[9px] font-bold px-2 py-0.5 rounded">Active</span>}
                </div>
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl font-black text-white">{tier.discount}</span>
                  <span className="text-[9px] text-slate-500 block font-bold uppercase tracking-wider">Avg Discount</span>
                </div>
                <span className="text-xs text-slate-400 block">{tier.price}</span>
                <ul className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  {tier.benefits.map((b, i) => (
                    <li key={i} className="flex items-start space-x-1.5 text-[10px] text-slate-400">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Membership History Section */}
      <div className="p-6 bg-slate-950/40 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <h4 className="text-sm font-bold text-white">Membership Card History</h4>
          <span className="text-[10px] text-slate-400 font-medium">
            {Array.isArray(currentUser?.membershipHistory) ? currentUser.membershipHistory.length : 0} Events Recorded
          </span>
        </div>

        {Array.isArray(currentUser?.membershipHistory) && currentUser.membershipHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-slate-800/60">
                  <th className="pb-2 font-semibold">Date</th>
                  <th className="pb-2 font-semibold">Plan</th>
                  <th className="pb-2 font-semibold">Membership ID</th>
                  <th className="pb-2 font-semibold">Amount</th>
                  <th className="pb-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {[...currentUser.membershipHistory].reverse().map((entry, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-2.5 text-slate-300">
                      {entry.date ? new Date(entry.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                    </td>
                    <td className="py-2.5 font-semibold text-white">{entry.plan || 'Privilege Membership'}</td>
                    <td className="py-2.5 font-mono text-slate-400">{entry.membershipId || entry.orderId || '-'}</td>
                    <td className="py-2.5 font-bold text-white">{entry.amount ? `₹${entry.amount}` : 'Free'}</td>
                    <td className="py-2.5">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                        {entry.status || 'ACTIVE'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-3 text-center">
            No previous membership card events recorded. Verified membership changes will appear here chronologically.
          </p>
        )}
      </div>
    </div>
  );
}
