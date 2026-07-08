import React from 'react';
import useCustomer from '../../hooks/useCustomer';
import { Receipt, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function Transactions() {
  const { transactions } = useCustomer();

  return (
    <div className="p-6 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl text-left text-white max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-3.5">
        <Receipt className="w-8 h-8 text-[#F4C400]" />
        <div>
          <h2 className="text-xl font-bold">Transaction History</h2>
          <p className="text-xs text-slate-400">Statement of all spends and cashback rewards</p>
        </div>
      </div>

      <div className="space-y-3">
        {transactions.map(txn => {
          const isDeposit = txn.amount > 0;
          return (
            <div key={txn.id} className="p-4.5 bg-slate-950/50 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isDeposit ? 'bg-emerald-950/45 text-emerald-400 border border-emerald-900/40' : 'bg-red-950/45 text-red-400 border border-red-900/40'}`}>
                  {isDeposit ? <ArrowDownRight className="w-4.5 h-4.5" /> : <ArrowUpRight className="w-4.5 h-4.5" />}
                </div>
                <div>
                  <span className="font-bold text-xs text-white block">{txn.description}</span>
                  <span className="text-[9px] text-slate-550 block uppercase tracking-wider mt-0.5">{txn.category} • Reference: {txn.id} • {txn.date}</span>
                </div>
              </div>
              <span className={`text-sm font-black ${isDeposit ? 'text-emerald-455' : 'text-red-400'}`}>
                {isDeposit ? '+' : ''}₹{txn.amount.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
