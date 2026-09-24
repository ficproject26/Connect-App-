import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getBackendUrl } from '../services/apiSetup';

export const CustomerContext = createContext(null);

export function CustomerProvider({ children }) {
  const [walletBalance, setWalletBalance] = useState(() => {
    const isUserLoggedIn = typeof localStorage !== 'undefined' && Boolean(localStorage.getItem('connect_current_user'));
    if (!isUserLoggedIn) return 0.00;
    const saved = localStorage.getItem('connect_customer_wallet');
    const parsed = saved ? parseFloat(saved) : 0.00;
    return isNaN(parsed) || parsed < 0 ? 0 : parsed;
  });

  const [transactions, setTransactions] = useState(() => {
    const isUserLoggedIn = typeof localStorage !== 'undefined' && Boolean(localStorage.getItem('connect_current_user'));
    if (!isUserLoggedIn) return [];
    const saved = localStorage.getItem('connect_customer_transactions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.warn("Failed to parse connect_customer_transactions from localStorage:", err);
      }
    }
    return [];
  });

  const [membershipTier, setMembershipTier] = useState(() => {
    const isUserLoggedIn = typeof localStorage !== 'undefined' && Boolean(localStorage.getItem('connect_current_user'));
    if (!isUserLoggedIn) return 'None';
    return localStorage.getItem('connect_customer_tier') || 'None';
  });

  useEffect(() => {
    const isUserLoggedIn = typeof localStorage !== 'undefined' && Boolean(localStorage.getItem('connect_current_user'));
    if (isUserLoggedIn) {
      localStorage.setItem('connect_customer_wallet', Math.max(0, walletBalance).toString());
    } else {
      localStorage.removeItem('connect_customer_wallet');
    }
  }, [walletBalance]);

  useEffect(() => {
    const isUserLoggedIn = typeof localStorage !== 'undefined' && Boolean(localStorage.getItem('connect_current_user'));
    if (isUserLoggedIn) {
      localStorage.setItem('connect_customer_transactions', JSON.stringify(transactions));
    } else {
      localStorage.removeItem('connect_customer_transactions');
    }
  }, [transactions]);

  useEffect(() => {
    const isUserLoggedIn = typeof localStorage !== 'undefined' && Boolean(localStorage.getItem('connect_current_user'));
    if (isUserLoggedIn && membershipTier && membershipTier !== 'None') {
      localStorage.setItem('connect_customer_tier', membershipTier);
    } else {
      localStorage.removeItem('connect_customer_tier');
    }
  }, [membershipTier]);

  const resetCustomerState = useCallback(() => {
    setWalletBalance(0);
    setTransactions([]);
    setMembershipTier('None');
    try {
      localStorage.removeItem('connect_customer_wallet');
      localStorage.removeItem('connect_customer_transactions');
      localStorage.removeItem('connect_customer_tier');
    } catch (e) {}
  }, []);

  const refreshWallet = useCallback(async (userIdentifier) => {
    try {
      const isUserLoggedIn = typeof localStorage !== 'undefined' && Boolean(localStorage.getItem('connect_current_user'));
      if (!isUserLoggedIn && !userIdentifier) {
        setWalletBalance(0);
        setTransactions([]);
        return;
      }
      const baseBackend = typeof getBackendUrl === 'function' ? getBackendUrl() : '';
      const targetUser = userIdentifier || localStorage.getItem('connect_customer_id') || localStorage.getItem('connect_user_id') || '';
      
      const queryParam = targetUser ? `?customerId=${encodeURIComponent(targetUser)}&userId=${encodeURIComponent(targetUser)}` : '';
      
      // 1. Fetch live balance from DB
      const balRes = await fetch(`${baseBackend}/api/wallet/balance${queryParam}`);
      if (balRes.ok) {
        const balData = await balRes.json();
        if (balData.success && typeof balData.walletBalance === 'number') {
          setWalletBalance(balData.walletBalance);
        }
      }

      // 2. Fetch live transactions from DB
      const txnRes = await fetch(`${baseBackend}/api/wallet/transactions${queryParam}`);
      if (txnRes.ok) {
        const txnData = await txnRes.json();
        if (txnData.success && Array.isArray(txnData.transactions)) {
          setTransactions(txnData.transactions);
        }
      }
    } catch (err) {
      console.warn("Could not sync wallet from backend:", err);
    }
  }, []);

  useEffect(() => {
    refreshWallet();
  }, [refreshWallet]);

  const addTransaction = (description, amount, category) => {
    const newTxn = {
      id: `TXN${Math.floor(1000 + Math.random() * 9000)}`,
      description,
      amount,
      date: new Date().toISOString().split('T')[0],
      category
    };
    setTransactions(prev => [newTxn, ...prev]);
    setWalletBalance(prev => Math.max(0, prev + amount));
  };

  const updateTier = (newTier) => {
    setMembershipTier(newTier);
  };

  return (
    <CustomerContext.Provider value={{
      walletBalance,
      transactions,
      membershipTier,
      addTransaction,
      updateTier,
      refreshWallet,
      resetCustomerState,
      setWalletBalance,
      setTransactions
    }}>
      {children}
    </CustomerContext.Provider>
  );
}
