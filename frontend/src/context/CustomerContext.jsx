import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getBackendUrl } from '../services/apiSetup';

export const CustomerContext = createContext(null);

export function CustomerProvider({ children }) {
  const getActiveCustomer = () => {
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('connect_current_user') : null;
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  };

  const getCustomerStorageKey = () => {
    const u = getActiveCustomer();
    return u?.customerId || u?.id || u?._id || (u?.email ? u.email.toLowerCase().trim() : null);
  };

  const [walletBalance, setWalletBalance] = useState(() => {
    const key = getCustomerStorageKey();
    if (!key) return 0.00;
    const saved = localStorage.getItem(`connect_customer_wallet_${key}`);
    const parsed = saved ? parseFloat(saved) : 0.00;
    return isNaN(parsed) || parsed < 0 ? 0.00 : parsed;
  });

  const [transactions, setTransactions] = useState(() => {
    const key = getCustomerStorageKey();
    if (!key) return [];
    const saved = localStorage.getItem(`connect_customer_transactions_${key}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      } catch (err) {
        console.warn("Failed to parse connect_customer_transactions from localStorage:", err);
      }
    }
    return [];
  });

  const [membershipTier, setMembershipTier] = useState(() => {
    const key = getCustomerStorageKey();
    if (!key) return 'None';
    return localStorage.getItem(`connect_customer_tier_${key}`) || 'None';
  });

  useEffect(() => {
    const key = getCustomerStorageKey();
    if (key) {
      localStorage.setItem(`connect_customer_wallet_${key}`, Math.max(0, walletBalance).toString());
    }
    try { localStorage.removeItem('connect_customer_wallet'); } catch (e) {}
  }, [walletBalance]);

  useEffect(() => {
    const key = getCustomerStorageKey();
    if (key) {
      localStorage.setItem(`connect_customer_transactions_${key}`, JSON.stringify(transactions));
    }
    try { localStorage.removeItem('connect_customer_transactions'); } catch (e) {}
  }, [transactions]);

  useEffect(() => {
    const key = getCustomerStorageKey();
    if (key && membershipTier && membershipTier !== 'None') {
      localStorage.setItem(`connect_customer_tier_${key}`, membershipTier);
    }
    try { localStorage.removeItem('connect_customer_tier'); } catch (e) {}
  }, [membershipTier]);

  const resetCustomerState = useCallback(() => {
    const key = getCustomerStorageKey();
    setWalletBalance(0.00);
    setTransactions([]);
    setMembershipTier('None');
    try {
      if (key) {
        localStorage.removeItem(`connect_customer_wallet_${key}`);
        localStorage.removeItem(`connect_customer_transactions_${key}`);
        localStorage.removeItem(`connect_customer_tier_${key}`);
      }
      localStorage.removeItem('connect_customer_wallet');
      localStorage.removeItem('connect_customer_transactions');
      localStorage.removeItem('connect_customer_tier');
    } catch (e) {}
  }, []);

  const refreshWallet = useCallback(async (userIdentifier) => {
    try {
      let activeUser = null;
      if (typeof userIdentifier === 'object' && userIdentifier !== null) {
        activeUser = userIdentifier;
      } else {
        activeUser = getActiveCustomer();
      }

      if (!activeUser && !userIdentifier) {
        setWalletBalance(0.00);
        setTransactions([]);
        return;
      }

      const custId = activeUser?.customerId || (typeof userIdentifier === 'string' ? userIdentifier : '') || localStorage.getItem('connect_customer_id') || '';
      const uId = activeUser?.id || activeUser?._id || localStorage.getItem('connect_user_id') || '';
      const email = activeUser?.email || '';
      const phone = activeUser?.phone || '';

      if (!custId && !uId && !email && !phone) {
        setWalletBalance(0.00);
        setTransactions([]);
        return;
      }

      const params = new URLSearchParams();
      if (custId) params.append('customerId', custId);
      if (uId) params.append('userId', uId);
      if (email) params.append('email', email);
      if (phone) params.append('phone', phone);
      const queryParam = `?${params.toString()}`;

      const baseBackend = typeof getBackendUrl === 'function' ? getBackendUrl() : '';

      // 1. Fetch live balance from DB
      const balRes = await fetch(`${baseBackend}/api/wallet/balance${queryParam}`);
      if (balRes.ok) {
        const balData = await balRes.json();
        if (balData.success && typeof balData.walletBalance === 'number') {
          setWalletBalance(balData.walletBalance);
        }
      }

      // 2. Fetch live transactions from DB strictly for this customer
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

