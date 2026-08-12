import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export const getOrGenerateCustomerId = (userOrId) => {
  if (!userOrId) {
    return `FIC-CUST-${Math.floor(100000 + Math.random() * 900000)}`;
  }
  let target = '';
  if (typeof userOrId === 'object' && userOrId !== null) {
    if (userOrId.customerId && userOrId.customerId !== 'FIC-CUST-750684' && userOrId.customerId !== 'FIC-CUST-849201') {
      return userOrId.customerId;
    }
    target = userOrId.email || userOrId.phone || userOrId.name || userOrId.id || '';
  } else {
    target = String(userOrId).trim();
  }

  const clean = target.trim().toLowerCase();
  if (!clean) {
    return `FIC-CUST-${Math.floor(100000 + Math.random() * 900000)}`;
  }

  // Hash clean target deterministically to a unique 6-digit number per customer
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = ((hash << 5) - hash) + clean.charCodeAt(i);
    hash |= 0;
  }
  const num = Math.abs(hash % 900000) + 100000;
  return `FIC-CUST-${num}`;
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('connect_current_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (!u.customerId || u.customerId === 'FIC-CUST-750684' || u.customerId === 'FIC-CUST-849201') {
          u.customerId = getOrGenerateCustomerId(u);
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
      } else {
        const emailPrefix = inputUser.email ? inputUser.email.split('@')[0] : '';
        if (emailPrefix && !/^\d+$/.test(emailPrefix)) {
          finalName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
        } else {
          finalName = 'Connect Member';
        }
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
      customerId: (inputUser.customerId && inputUser.customerId !== 'FIC-CUST-750684' && inputUser.customerId !== 'FIC-CUST-849201')
        ? inputUser.customerId 
        : getOrGenerateCustomerId(inputUser.email || cleanDigits || finalName)
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
      customerId: getOrGenerateCustomerId(formData.email || formData.phone || displayName)
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

