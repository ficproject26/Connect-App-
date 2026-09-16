import React, { useState } from 'react';
import useCustomer from '../../hooks/useCustomer';
import useAuth from '../../hooks/useAuth';
import { getBackendUrl } from '../../services/apiSetup';
import { Wallet as WalletIcon, PlusCircle, ArrowUpRight, ArrowDownRight, ShieldCheck, Zap, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function Wallet() {
  const { walletBalance, transactions, refreshWallet } = useCustomer();
  const { currentUser } = useAuth();
  const [depositAmount, setDepositAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleDeposit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) {
      setErrorMessage('Please enter a valid deposit amount greater than ₹0.');
      return;
    }

    if (isProcessing) return; // Prevent double-clicks / concurrent recharge attempts
    setIsProcessing(true);

    try {
      if (typeof window !== 'undefined' && !window.Razorpay) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.async = true;
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      }

      const baseBackend = typeof getBackendUrl === 'function' ? getBackendUrl() : '';
      const targetUser = currentUser?.id || currentUser?.customerId || localStorage.getItem('connect_customer_id') || localStorage.getItem('connect_user_id') || '';

      const orderRes = await fetch(`${baseBackend}/api/wallet/recharge/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amt,
          userId: targetUser,
          customerId: currentUser?.customerId || targetUser,
          email: currentUser?.email || '',
          phone: currentUser?.phone || ''
        })
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.success) {
        setIsProcessing(false);
        setErrorMessage(orderData.error || 'Failed to initialize wallet recharge.');
        return;
      }

      if (typeof window !== 'undefined' && window.Razorpay) {
        const razorpayOptions = {
          key: orderData.key_id || 'rzp_test_THLM17MgXLM2tP',
          amount: orderData.amount,
          currency: orderData.currency || 'INR',
          name: 'Forge India Connect',
          description: `Wallet Deposit - ₹${amt.toLocaleString()}`,
          order_id: orderData.order_id,
          prefill: {
            name: currentUser?.name || 'Connect Member',
            email: currentUser?.email || '',
            contact: currentUser?.phone || ''
          },
          theme: {
            color: '#f59e0b'
          },
          handler: async function (response) {
            try {
              const verifyRes = await fetch(`${baseBackend}/api/wallet/recharge/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  amount: amt,
                  userId: targetUser,
                  customerId: currentUser?.customerId || targetUser,
                  email: currentUser?.email || '',
                  phone: currentUser?.phone || ''
                })
              });

              const verifyData = await verifyRes.json();

              if (verifyRes.ok && verifyData.success) {
                setDepositAmount('');
                setSuccessMessage(`Wallet recharged successfully! ₹${amt.toLocaleString()} credited.`);
                if (typeof refreshWallet === 'function') {
                  await refreshWallet(targetUser);
                }
              } else {
                setErrorMessage(verifyData.error || 'Payment verification failed. Wallet not credited.');
              }
            } catch (vErr) {
              console.error('Error verifying wallet payment:', vErr);
              setErrorMessage('Network error verifying payment. Please refresh your wallet.');
            } finally {
              setIsProcessing(false);
            }
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
            }
          }
        };

        const rzp = new window.Razorpay(razorpayOptions);
        rzp.on('payment.failed', function (resp) {
          setIsProcessing(false);
          setErrorMessage(`Payment failed: ${resp.error?.description || 'Transaction unsuccessful'}. Wallet remains unchanged.`);
        });
        rzp.open();
      } else {
        setIsProcessing(false);
        setErrorMessage('Unable to load Razorpay checkout. Please check your internet connection.');
      }
    } catch (err) {
      console.error('Error initiating wallet recharge:', err);
      setIsProcessing(false);
      setErrorMessage('Server error initiating wallet deposit.');
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

      {/* Notifications */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-center gap-3 text-rose-700 dark:text-rose-300 text-xs font-bold animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-2xl flex items-center gap-3 text-emerald-700 dark:text-emerald-300 text-xs font-bold animate-fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Grid: Wallet Balance & Deposit Funds */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* Wallet Balance Card */}
        <div className="lg:col-span-5 p-8 bg-gradient-to-br from-[#0b1e36] via-[#13284c] to-[#0b1329] border border-slate-800/80 rounded-3xl flex flex-col justify-between min-h-[240px] shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl group-hover:bg-amber-400/20 transition-all pointer-events-none" />
          <div>
            <span className="text-xs text-slate-400 uppercase font-black tracking-widest block">Total Balance</span>
            <span className="text-4xl lg:text-5xl font-black text-white block mt-3 font-mono tracking-tight">
              ₹{Math.max(0, walletBalance || 0).toLocaleString()}
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
                disabled={isProcessing}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-8 pr-4 py-3.5 text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:border-amber-400 transition-colors disabled:opacity-50"
              />
            </div>
            <button 
              type="submit" 
              disabled={isProcessing}
              className={`px-8 py-3.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center space-x-2 shadow-md transition-all shrink-0 border-none ${
                isProcessing ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer active:scale-98'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Deposit Funds</span>
                </>
              )}
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
              const isDeposit = txn.amount > 0 || txn.type === 'CREDIT';
              let rawDesc = (txn.description || '').replace(/\s*\(Qty:\s*\d+\)/gi, '');
              if (/stay|hotel|travel|tour|cab|clinic|doctor|booking|service/i.test(rawDesc)) {
                rawDesc = rawDesc.replace(/^Order Payment\s*-\s*/i, 'Booking Payment - ');
              }
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
                      <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white block">{rawDesc}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block uppercase tracking-wider mt-0.5">{txn.category || (isDeposit ? 'Deposit' : 'Order Payment')} • {txn.date}</span>
                    </div>
                  </div>
                  <span className={`text-base sm:text-lg font-black font-mono ${isDeposit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                    {isDeposit ? '+' : '-'}₹{Math.abs(txn.amount).toLocaleString()}
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
