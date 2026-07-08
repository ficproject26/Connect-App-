import React, { createContext, useState, useEffect } from 'react';

export const CustomerContext = createContext(null);

export function CustomerProvider({ children }) {
  const [walletBalance, setWalletBalance] = useState(() => {
    const saved = localStorage.getItem('connect_customer_wallet');
    return saved ? parseFloat(saved) : 5000.00;
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('connect_customer_transactions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.warn("Failed to parse connect_customer_transactions from localStorage:", err);
      }
    }
    return [
      { id: 'TXN1098', description: 'Priority Clinic Check-in - Apollo Hospital', amount: -250, date: '2026-06-16', category: 'Healthcare' },
      { id: 'TXN1097', description: 'Privilege Cashback Earned', amount: 1500, date: '2026-06-15', category: 'Bonus' },
      { id: 'TXN1096', description: 'Gourmet Dine-in discount - Celeste Hall', amount: -1200, date: '2026-06-14', category: 'Dining' }
    ];
  });

  const [membershipTier, setMembershipTier] = useState(() => {
    return localStorage.getItem('connect_customer_tier') || 'Gold Elite';
  });

  useEffect(() => {
    localStorage.setItem('connect_customer_wallet', walletBalance.toString());
  }, [walletBalance]);

  useEffect(() => {
    localStorage.setItem('connect_customer_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('connect_customer_tier', membershipTier);
  }, [membershipTier]);

  const addTransaction = (description, amount, category) => {
    const newTxn = {
      id: `TXN${Math.floor(1000 + Math.random() * 9000)}`,
      description,
      amount,
      date: new Date().toISOString().split('T')[0],
      category
    };
    setTransactions(prev => [newTxn, ...prev]);
    setWalletBalance(prev => prev + amount);
  };

  const updateTier = (newTier) => {
    setMembershipTier(newTier);
  };

  return (
    <CustomerContext.Provider value={{ walletBalance, transactions, membershipTier, addTransaction, updateTier }}>
      {children}
    </CustomerContext.Provider>
  );
}
