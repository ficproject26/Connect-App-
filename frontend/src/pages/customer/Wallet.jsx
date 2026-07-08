import React, { useState } from 'react';
import useCustomer from '../../hooks/useCustomer';
import { Wallet as WalletIcon, PlusCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function Wallet() {
  const { walletBalance, transactions, addTransaction } = useCustomer();
  const [depositAmount, setDepositAmount] = useState('');

  const handleDeposit = (e) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (amt > 0) {
      addTransaction('Added funds to wallet via UPI', amt, 'Deposit');
      setDepositAmount('');
      alert(`₹${amt} deposited successfully!`);
    }
  };

  return (
    <div className="p-6 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl text-left text-white max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3.5">
        <WalletIcon className="w-8 h-8 text-[#F4C400]" />
        <div>
          <h2 className="text-xl font-bold">Connect Wallet</h2>
          <p className="text-xs text-slate-400">Manage digital privileges cashbacks & direct settlements</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 p-6 bg-gradient-to-br from-[#1C2541] to-slate-950 border border-slate-800 rounded-2xl flex flex-col justify-between h-44">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Wallet Balance</span>
            <span className="text-3xl font-black text-white block mt-2">₹{walletBalance.toLocaleString()}</span>
          </div>
          <span className="text-[9px] text-emerald-450 font-bold bg-emerald-500/10 px-2 py-0.5 rounded w-fit">Active</span>
        </div>

        <div className="md:col-span-2 p-6 bg-slate-950/60 border border-slate-800 rounded-2xl flex flex-col justify-between h-44 text-xs">
          <div>
            <h3 className="font-bold text-white mb-2">Deposit Funds</h3>
            <p className="text-slate-400 mb-4 text-[10px]">Add money instantly to your Connect Wallet using secure UPI gateways.</p>
          </div>
          <form onSubmit={handleDeposit} className="flex gap-3">
            <input 
              type="number"
              placeholder="Enter amount (e.g. 1000)"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="flex-grow bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
            />
            <button type="submit" className="px-5 py-2.5 bg-[#F4C400] hover:bg-yellow-500 text-slate-950 font-bold rounded-xl flex items-center space-x-1.5 cursor-pointer shadow">
              <PlusCircle className="w-4.5 h-4.5" />
              <span>Add</span>
            </button>
          </form>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-sm text-white">Recent Transactions</h3>
        <div className="space-y-2.5">
          {transactions.map((txn, index) => {
            const isDeposit = txn.amount > 0;
            return (
              <div key={txn.id || index} className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDeposit ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40' : 'bg-red-950/40 text-red-400 border border-red-900/40'}`}>
                    {isDeposit ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="font-bold text-xs text-white block">{txn.description}</span>
                    <span className="text-[9px] text-slate-550 block uppercase tracking-wider mt-0.5">{txn.category} • {txn.date}</span>
                  </div>
                </div>
                <span className={`text-sm font-extrabold ${isDeposit ? 'text-emerald-450' : 'text-red-400'}`}>
                  {isDeposit ? '+' : ''}₹{txn.amount.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
