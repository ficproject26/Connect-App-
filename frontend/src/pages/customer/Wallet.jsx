import React, { useState } from 'react';
import useCustomer from '../../hooks/useCustomer';
import { Wallet as WalletIcon, PlusCircle, ArrowUpRight, ArrowDownRight, ShieldCheck, Zap } from 'lucide-react';

export default function Wallet() {
  const { walletBalance, transactions, addTransaction } = useCustomer();
  const [depositAmount, setDepositAmount] = useState('');

  const handleDeposit = (e) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (amt > 0) {
      addTransaction('Added funds to wallet via UPI', amt, 'Deposit');
      setDepositAmount('');
      alert(`₹${amt.toLocaleString()} deposited successfully!`);
    }
  };

  return (
    <div className="w-full space-y-8 text-left text-slate-800 dark:text-slate-100 animate-fade-in">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-xs">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
            <WalletIcon className="w-7 h-7 text-amber-500" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Connect Wallet</h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Manage digital privileges, instant cashbacks & direct settlements</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 px-4 py-2 rounded-2xl">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">100% Encrypted & Verified</span>
        </div>
      </div>

      {/* Main Grid: Wallet Balance & Deposit Funds */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* Wallet Balance Card */}
        <div className="lg:col-span-5 p-8 bg-gradient-to-br from-[#0b1e36] via-[#13284c] to-[#0b1329] border border-slate-800/80 rounded-3xl flex flex-col justify-between min-h-[240px] shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl group-hover:bg-amber-400/20 transition-all pointer-events-none" />
          <div>
            <span className="text-xs text-slate-400 uppercase font-black tracking-widest block">Total Balance</span>
            <span className="text-4xl lg:text-5xl font-black text-white block mt-3 font-mono tracking-tight">
              ₹{walletBalance.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
            <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Active Account</span>
            </span>
            <span className="text-xs text-slate-400 font-bold">Connect Instant Pay</span>
          </div>
        </div>

        {/* Deposit Funds Card */}
        <div className="lg:col-span-7 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl flex flex-col justify-between min-h-[240px] shadow-xs text-slate-800 dark:text-slate-200">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">Deposit Funds</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Add money instantly to your Connect Wallet using secure UPI gateways, NetBanking or Credit Cards.</p>
          </div>

          <form onSubmit={handleDeposit} className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">₹</span>
              <input 
                type="number"
                placeholder="Enter deposit amount (e.g. 5000)"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-8 pr-4 py-3.5 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
            <button type="submit" className="px-8 py-3.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center space-x-2 cursor-pointer shadow-md transition-all shrink-0 border-none active:scale-98">
              <PlusCircle className="w-4 h-4" />
              <span>Deposit Funds</span>
            </button>
          </form>
        </div>
      </div>

      {/* Recent Transactions Full Table/List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">Recent Transactions</h3>
          <span className="text-xs font-bold text-slate-400">Showing last {transactions.length} records</span>
        </div>

        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs font-bold">No transactions found.</div>
          ) : (
            transactions.map((txn, index) => {
              const isDeposit = txn.amount > 0;
              return (
                <div 
                  key={txn.id || index} 
                  className="p-4.5 bg-slate-50/50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl flex items-center justify-between hover:border-amber-400/40 transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${isDeposit ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                      {isDeposit ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div className="text-left">
                      <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white block">{txn.description}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block uppercase tracking-wider mt-0.5">{txn.category} • {txn.date}</span>
                    </div>
                  </div>
                  <span className={`text-base sm:text-lg font-black font-mono ${isDeposit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                    {isDeposit ? '+' : ''}₹{txn.amount.toLocaleString()}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
