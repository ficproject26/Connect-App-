import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const getOrGenerateCustomerId = (email) => {
    return 'FIC-CUST-750684';
  };

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('connect_current_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (!u.customerId) {
          u.customerId = getOrGenerateCustomerId(u.email);
          localStorage.setItem('connect_current_user', JSON.stringify(u));
        }
        return u;
      } catch (err) {
        console.warn("Failed to parse connect_current_user from localStorage:", err);
      }
    }
    return null;
  });

  const login = (userInfo, role = 'customer', callback) => {
    let inputUser = {};
    if (typeof userInfo === 'object' && userInfo !== null) {
      inputUser = { ...userInfo };
    } else if (typeof userInfo === 'string') {
      inputUser = { email: userInfo };
    }

    const rawTarget = (inputUser.phone || inputUser.email || (typeof userInfo === 'string' ? userInfo : '')).toString().trim();
    const cleanDigits = rawTarget.replace(/\D/g, '');

    // Lookup local registered users list
    const registeredUsers = JSON.parse(localStorage.getItem('connect_registered_users') || '[]');
    const registeredMatch = registeredUsers.find(u => 
      (cleanDigits && u.phone && u.phone.replace(/\D/g, '') === cleanDigits) ||
      (rawTarget && u.email && u.email.toLowerCase() === rawTarget.toLowerCase())
    );

    let finalName = inputUser.name;
    if (!finalName || finalName === 'OTP Verified Member' || /^\d+$/.test(finalName)) {
      if (registeredMatch && registeredMatch.name && !/^\d+$/.test(registeredMatch.name)) {
        finalName = registeredMatch.name;
      } else if (inputUser.email && !/^\d+$/.test(inputUser.email)) {
        const parts = inputUser.email.split('@')[0];
        finalName = parts.charAt(0).toUpperCase() + parts.slice(1);
      } else {
        finalName = 'Connect Member';
      }
    }

    const finalUser = {
      ...(registeredMatch || {}),
      ...inputUser,
      name: finalName,
      email: inputUser.email || registeredMatch?.email || (cleanDigits ? `${cleanDigits}@connect.app` : 'customer@connect.app'),
      phone: inputUser.phone || registeredMatch?.phone || cleanDigits || '',
      address: inputUser.address || registeredMatch?.address || '',
      city: inputUser.city || registeredMatch?.city || '',
      pincode: inputUser.pincode || registeredMatch?.pincode || '',
      state: inputUser.state || registeredMatch?.state || '',
      role: role || inputUser.role || 'customer',
      customerId: inputUser.customerId || registeredMatch?.customerId || getOrGenerateCustomerId(inputUser.email || cleanDigits)
    };

    setCurrentUser(finalUser);
    localStorage.setItem('connect_current_user', JSON.stringify(finalUser));
    if (callback) callback(finalUser);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('connect_current_user');
  };

  const register = (formData, role, callback) => {
    let displayName = formData.name;
    if (role === 'vendor') {
      displayName = formData.businessName || 'Elite Vendor';
    }

    const user = {
      name: displayName || 'Connect Member',
      email: formData.email,
      phone: formData.phone || formData.phoneNumber || '',
      address: formData.address || '',
      city: formData.city || '',
      pincode: formData.pincode || '',
      state: formData.state || 'Karnataka',
      aadhaar: formData.aadhaarNumber || '',
      pan: formData.panNumber || '',
      role: role || 'customer',
      customerId: getOrGenerateCustomerId(formData.email)
    };

    try {
      const savedUsers = JSON.parse(localStorage.getItem('connect_registered_users') || '[]');
      const filtered = savedUsers.filter(u => 
        (user.phone && u.phone && u.phone.replace(/\D/g, '') !== user.phone.replace(/\D/g, '')) &&
        (user.email && u.email && u.email.toLowerCase() !== user.email.toLowerCase())
      );
      filtered.unshift(user);
      localStorage.setItem('connect_registered_users', JSON.stringify(filtered));
    } catch (e) {}

    setCurrentUser(user);
    localStorage.setItem('connect_current_user', JSON.stringify(user));
    if (callback) callback(user);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}
