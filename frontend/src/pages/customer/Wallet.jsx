import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import useCustomer from '../../hooks/useCustomer';
import useAuth from '../../hooks/useAuth';
import { getBackendUrl } from '../../services/apiSetup';
import { Wallet as WalletIcon, PlusCircle, ArrowUpRight, ArrowDownRight, ShieldCheck, Zap, Loader2, CheckCircle, AlertCircle, X, QrCode } from 'lucide-react';

export default function Wallet() {
  const { walletBalance, transactions, refreshWallet } = useCustomer();
  const { currentUser } = useAuth();
  const [depositAmount, setDepositAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Razorpay Checkout Modal States
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
  const [razorpayOrderData, setRazorpayOrderData] = useState(null);
  const [razorpayMethod, setRazorpayMethod] = useState('upi');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isVerifying, setIsVerifying] = useState(false);

  // Lock background scroll when Razorpay modal is open (Bug 17)
  useEffect(() => {
    if (isRazorpayModalOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isRazorpayModalOpen]);

  // UPI / QR and Card Payment State Management
  const [upiSubTab, setUpiSubTab] = useState('upi_id'); // 'upi_id' | 'qr_code'
  const [paymentUpiId, setPaymentUpiId] = useState('success@razorpay');
  const [paymentQrData, setPaymentQrData] = useState(null);
  const [paymentQrLoading, setPaymentQrLoading] = useState(false);
  const [paymentCardData, setPaymentCardData] = useState({
    number: '4111 2222 3333 1111',
    expiry: '12/28',
    cvv: '123',
    name: 'Customer Name'
  });

  const handleFetchRazorpayQr = useCallback(async (amountRupees) => {
    setPaymentQrLoading(true);
    try {
      const baseBackend = typeof getBackendUrl === 'function' ? getBackendUrl() : '';
      let data = null;
      try {
        const res = await fetch(`${baseBackend}/api/orders/create-razorpay-qr`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: amountRupees,
            name: 'Wallet Deposit',
            description: 'Deposit funds to Connect Wallet'
          })
        });
        if (res.ok) {
          data = await res.json();
        }
      } catch (e) {
        console.warn('Backend QR fetch failed, falling back to client UPI generation:', e);
      }

      if (data && data.success) {
        setPaymentQrData(data);
      } else {
        const amt = Math.max(1, Number(amountRupees) || 1);
        const merchantVpa = 'connectapp@razorpay';
        const orderRef = 'ORD_WALLET_' + Date.now();
        const upiIntentString = `upi://pay?pa=${merchantVpa}&pn=ConnectApp&am=${amt.toFixed(2)}&cu=INR&tr=${orderRef}&tn=${encodeURIComponent('Wallet Deposit')}`;
        setPaymentQrData({
          success: true,
          qr_string: upiIntentString,
          image_url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiIntentString)}`,
          merchant_vpa: merchantVpa,
          amount: amt * 100
        });
      }
    } catch (err) {
      console.error('Fetch Razorpay QR Error:', err);
      const amt = Math.max(1, Number(amountRupees) || 1);
      const merchantVpa = 'connectapp@razorpay';
      const orderRef = 'ORD_WALLET_' + Date.now();
      const upiIntentString = `upi://pay?pa=${merchantVpa}&pn=ConnectApp&am=${amt.toFixed(2)}&cu=INR&tr=${orderRef}&tn=${encodeURIComponent('Wallet Deposit')}`;
      setPaymentQrData({
        success: true,
        qr_string: upiIntentString,
        image_url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiIntentString)}`,
        merchant_vpa: merchantVpa,
        amount: amt * 100
      });
    } finally {
      setPaymentQrLoading(false);
    }
  }, []);

  // Customer-isolated totals
  const totalCredited = transactions
    .filter(t => t.type === 'CREDIT' || t.amount > 0)
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

  const totalDebited = transactions
    .filter(t => t.type === 'DEBIT' || t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

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

      // Check if test-mode or simulated order
      const isTestOrder = Boolean(
        orderData.isTestMode ||
        !orderData.key_id ||
        String(orderData.order_id).startsWith('order_test_') ||
        orderData.key_id === 'rzp_test_placeholder'
      );

      if (isTestOrder) {
        setRazorpayOrderData({
          order_id: orderData.order_id,
          amountRupees: amt,
          amountPaise: orderData.amount,
          key_id: orderData.key_id
        });
        setIsRazorpayModalOpen(true);
        setIsProcessing(false);
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
                  await refreshWallet(currentUser);
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
          console.warn('Razorpay payment failed, falling back to in-app Razorpay modal:', resp);
          setRazorpayOrderData({
            order_id: orderData.order_id,
            amountRupees: amt,
            amountPaise: orderData.amount,
            key_id: orderData.key_id
          });
          setIsRazorpayModalOpen(true);
          setIsProcessing(false);
        });
        rzp.open();
      } else {
        setRazorpayOrderData({
          order_id: orderData.order_id,
          amountRupees: amt,
          amountPaise: orderData.amount,
          key_id: orderData.key_id
        });
        setIsRazorpayModalOpen(true);
        setIsProcessing(false);
      }
    } catch (err) {
      console.error('Error initiating wallet recharge:', err);
      setIsProcessing(false);
      setErrorMessage('Server error initiating wallet deposit.');
    }
  };

  const handleConfirmRazorpayPayment = async () => {
    if (!razorpayOrderData || isVerifying) return;
    if (razorpayMethod === 'upi') {
      if (upiSubTab === 'upi_id') {
        const trimmedUpi = (paymentUpiId || '').trim();
        if (!trimmedUpi || !trimmedUpi.includes('@')) {
          setErrorMessage('Please enter a valid UPI ID (e.g. name@upi or success@razorpay)');
          return;
        }
      }
    } else if (razorpayMethod === 'card') {
      const cleanCard = (paymentCardData.number || '').replace(/\s/g, '');
      if (cleanCard.length < 15) {
        setErrorMessage('Please enter a valid 16-digit card number');
        return;
      }
      if (!paymentCardData.expiry || !paymentCardData.expiry.includes('/')) {
        setErrorMessage('Please enter card expiry in MM/YY format');
        return;
      }
      if (!paymentCardData.cvv || paymentCardData.cvv.length < 3) {
        setErrorMessage('Please enter a valid 3-digit CVV');
        return;
      }
    }
    setIsVerifying(true);
    setErrorMessage('');

    try {
      const baseBackend = typeof getBackendUrl === 'function' ? getBackendUrl() : '';
      const dummyPaymentId = `pay_test_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
      const targetUser = currentUser?.id || currentUser?.customerId || localStorage.getItem('connect_customer_id') || localStorage.getItem('connect_user_id') || '';

      const verifyRes = await fetch(`${baseBackend}/api/wallet/recharge/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: razorpayOrderData.order_id,
          razorpay_payment_id: dummyPaymentId,
          razorpay_signature: `sim_${Date.now()}`,
          amount: razorpayOrderData.amountRupees,
          userId: targetUser,
          customerId: currentUser?.customerId || targetUser,
          email: currentUser?.email || '',
          phone: currentUser?.phone || ''
        })
      });

      const verifyData = await verifyRes.json();

      if (verifyRes.ok && verifyData.success) {
        setIsRazorpayModalOpen(false);
        setDepositAmount('');
        setSuccessMessage(`Wallet recharged successfully! ₹${razorpayOrderData.amountRupees.toLocaleString()} credited.`);
        if (typeof refreshWallet === 'function') {
          await refreshWallet(currentUser);
        }
      } else {
        setErrorMessage(verifyData.error || 'Payment verification failed. Wallet not credited.');
      }
    } catch (vErr) {
      console.error('Error verifying wallet payment:', vErr);
      setErrorMessage('Network error verifying payment. Please refresh your wallet.');
    } finally {
      setIsVerifying(false);
      setIsProcessing(false);
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
        <div className="lg:col-span-5 p-6 sm:p-8 bg-gradient-to-br from-[#0b1e36] via-[#13284c] to-[#0b1329] border border-slate-800/80 rounded-3xl flex flex-col justify-between min-h-[260px] shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl group-hover:bg-amber-400/20 transition-all pointer-events-none" />
          <div>
            <span className="text-xs text-slate-400 uppercase font-black tracking-widest block">Total Balance</span>
            <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-white block mt-3 font-mono tracking-tight">
              ₹{Math.max(0, walletBalance || 0).toLocaleString()}
            </span>
          </div>

          {/* Customer Specific Totals: Credited & Debited */}
          <div className="grid grid-cols-2 gap-3 py-3 my-2 border-y border-slate-800/80">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Credited</span>
              <span className="text-sm sm:text-base font-black text-emerald-400 font-mono block mt-0.5">
                +₹{totalCredited.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Debited</span>
              <span className="text-sm sm:text-base font-black text-rose-400 font-mono block mt-0.5">
                -₹{totalDebited.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Active Account</span>
            </span>
            <span className="text-xs text-slate-400 font-bold whitespace-nowrap">Connect Instant Pay</span>
          </div>
        </div>

        {/* Deposit Funds Card */}
        <div className="lg:col-span-7 p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl flex flex-col justify-between min-h-[260px] shadow-xs text-slate-800 dark:text-slate-200">
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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 md:p-8 shadow-xs space-y-6">
        <div className="flex flex-wrap gap-2 justify-between items-center border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">Recent Transactions</h3>
          <span className="text-xs font-bold text-slate-400">Showing last {transactions.length} records</span>
        </div>

        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs font-bold">
              No transactions found.
              <p className="text-[11px] font-normal text-slate-500 mt-1">Your wallet has zero activity. Deposit funds to start transacting.</p>
            </div>
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
                  className="p-3 sm:p-4 bg-slate-50/50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl flex items-center justify-between gap-3 hover:border-amber-400/40 transition-all"
                >
                  <div className="flex items-center space-x-2.5 sm:space-x-4 min-w-0 flex-1">
                    <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 ${isDeposit ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                      {isDeposit ? <ArrowDownRight className="w-4.5 h-4.5 sm:w-5 sm:h-5" /> : <ArrowUpRight className="w-4.5 h-4.5 sm:w-5 sm:h-5" />}
                    </div>
                    <div className="text-left min-w-0 flex-1 overflow-hidden">
                      <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white block truncate leading-tight">{rawDesc}</span>
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider whitespace-nowrap">
                          {txn.category || (isDeposit ? 'Deposit' : 'Order Payment')}
                        </span>
                        <span className="text-slate-400 text-[10px]">•</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider whitespace-nowrap">
                          {txn.date}
                        </span>
                        <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded-full border whitespace-nowrap ${
                          (txn.status || 'SUCCESS').toUpperCase() === 'SUCCESS' 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                        }`}>
                          {txn.status || 'SUCCESS'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs sm:text-base font-black font-mono shrink-0 whitespace-nowrap ${isDeposit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                    {isDeposit ? '+' : '-'}₹{Math.abs(txn.amount).toLocaleString()}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RAZORPAY PAYMENT GATEWAY MODAL */}
      {isRazorpayModalOpen && razorpayOrderData && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in select-none">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg max-h-[92dvh] rounded-3xl shadow-2xl overflow-hidden relative text-slate-800 dark:text-slate-200 flex flex-col">
            
            {/* Top Bar with Razorpay Brand Header */}
            <div className="bg-[#0b1e36] text-white p-4 sm:p-5 flex justify-between items-center relative overflow-hidden shrink-0">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-white text-base sm:text-lg shadow-md shrink-0">
                  R
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <h3 className="font-extrabold text-xs sm:text-sm tracking-tight text-white truncate">Razorpay Payment</h3>
                    <span className="bg-red-500/90 text-white text-[8px] sm:text-[9px] font-black uppercase px-1.5 sm:px-2 py-0.5 rounded-md tracking-wider shrink-0">
                      Test Mode
                    </span>
                  </div>
                  <p className="text-[9px] sm:text-[10px] text-blue-200 mt-0.5">Secured by Razorpay 256-Bit SSL</p>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                <div className="text-right">
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold text-blue-300 block">Total Amount</span>
                  <span className="text-base sm:text-lg font-black text-amber-400">
                    ₹{razorpayOrderData.amountRupees.toLocaleString()}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRazorpayModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer border-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 flex-1 overflow-y-auto">
              {isVerifying ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white">Processing Razorpay Payment...</h4>
                  <p className="text-xs text-slate-400">Communicating with bank & completing authorization...</p>
                </div>
              ) : (
                <>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">Select Payment Method</span>

                  {/* Payment Method Selector */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'upi', label: 'UPI / QR', icon: '📱' },
                      { id: 'card', label: 'Cards', icon: '💳' },
                      { id: 'netbanking', label: 'Banking', icon: '🏦' }
                    ].map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setRazorpayMethod(m.id)}
                        className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          razorpayMethod === m.id
                            ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-600 dark:text-blue-400 font-extrabold shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-lg">{m.icon}</span>
                        <span className="text-[10px] font-extrabold">{m.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Payment Detail Section */}
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 p-4 rounded-2xl space-y-3">
                    {razorpayMethod === 'upi' && (
                      <div className="space-y-3">
                        <div className="flex bg-slate-200/70 dark:bg-slate-900 p-1 rounded-xl gap-1">
                          <button
                            type="button"
                            onClick={() => setUpiSubTab('upi_id')}
                            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-black transition-all cursor-pointer border-none flex items-center justify-center gap-1.5 ${
                              upiSubTab === 'upi_id'
                                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 bg-transparent'
                            }`}
                          >
                            <span>UPI ID / VPA</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setUpiSubTab('qr_code');
                              if (!paymentQrData) handleFetchRazorpayQr(razorpayOrderData?.amountRupees || 100);
                            }}
                            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-black transition-all cursor-pointer border-none flex items-center justify-center gap-1.5 ${
                              upiSubTab === 'qr_code'
                                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 bg-transparent'
                            }`}
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>Scan QR Code</span>
                          </button>
                        </div>

                        {upiSubTab === 'upi_id' ? (
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between text-xs font-extrabold">
                              <span>Google Pay / PhonePe / Paytm</span>
                              <span className="text-emerald-500 text-[10px] font-black uppercase bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200">Instant</span>
                            </div>
                            <input
                              type="text"
                              value={paymentUpiId}
                              onChange={(e) => setPaymentUpiId(e.target.value)}
                              placeholder="Enter UPI ID (e.g. success@razorpay)"
                              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-[10px] text-slate-400">Test VPA pre-filled. Enter your UPI ID and click Pay below to complete deposit.</p>
                          </div>
                        ) : (
                          <div className="py-2 text-center space-y-3">
                            {paymentQrLoading ? (
                              <div className="py-6 flex flex-col items-center justify-center gap-2">
                                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                <span className="text-xs text-slate-500 font-semibold">Generating dynamic Razorpay QR...</span>
                              </div>
                            ) : paymentQrData ? (
                              <div className="space-y-2">
                                <div className="p-2 bg-white rounded-2xl inline-block border border-slate-200 shadow-md">
                                  <img
                                    src={paymentQrData.image_url || `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(paymentQrData.qr_string || 'upi://pay?pa=connectapp@razorpay&pn=ConnectApp')}`}
                                    alt="Razorpay Dynamic UPI QR"
                                    className="w-40 h-40 object-contain mx-auto"
                                  />
                                </div>
                                <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Scan with any UPI App to Pay</p>
                              </div>
                            ) : (
                              <div className="py-4">
                                <button
                                  type="button"
                                  onClick={() => handleFetchRazorpayQr(razorpayOrderData?.amountRupees || 100)}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-blue-700 cursor-pointer border-none"
                                >
                                  Generate Dynamic QR Code
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {razorpayMethod === 'card' && (
                      <div className="space-y-2.5 text-xs">
                        <div className="flex items-center justify-between text-xs font-extrabold">
                          <span>Card Information</span>
                          <span className="text-blue-500 text-[10px] font-black uppercase bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200">256-Bit SSL</span>
                        </div>
                        <div>
                          <label className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">Card Number</label>
                          <input
                            type="text"
                            maxLength={19}
                            value={paymentCardData.number}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
                              const formatted = raw.replace(/(.{4})/g, '$1 ').trim();
                              setPaymentCardData(prev => ({ ...prev, number: formatted }));
                            }}
                            placeholder="4111 2222 3333 1111"
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">Expiry (MM/YY)</label>
                            <input
                              type="text"
                              maxLength={5}
                              value={paymentCardData.expiry}
                              onChange={(e) => {
                                const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
                                const formatted = raw.length >= 3 ? `${raw.slice(0, 2)}/${raw.slice(2)}` : raw;
                                setPaymentCardData(prev => ({ ...prev, expiry: formatted }));
                              }}
                              placeholder="12/28"
                              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                            />
                          </div>
                          <div>
                            <label className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">CVV</label>
                            <input
                              type="password"
                              maxLength={4}
                              value={paymentCardData.cvv}
                              onChange={(e) => {
                                const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
                                setPaymentCardData(prev => ({ ...prev, cvv: raw }));
                              }}
                              placeholder="123"
                              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-wider mb-1">Cardholder Name</label>
                          <input
                            type="text"
                            value={paymentCardData.name}
                            onChange={(e) => setPaymentCardData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Full Name as on Card"
                            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    )}

                    {razorpayMethod === 'netbanking' && (
                      <div className="grid grid-cols-3 gap-2 text-[10px] font-extrabold">
                        {['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak', 'YES Bank'].map((b) => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => setSelectedBank(b)}
                            className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                              selectedBank === b
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-extrabold shadow-3xs'
                                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-blue-300'
                            }`}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pay Button */}
                  <button
                    type="button"
                    disabled={isVerifying}
                    onClick={handleConfirmRazorpayPayment}
                    className={`w-full py-3.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 border-none ${
                      isVerifying ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying with Razorpay...</span>
                      </>
                    ) : (
                      <span>Pay ₹{razorpayOrderData.amountRupees.toLocaleString()} via Razorpay</span>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

