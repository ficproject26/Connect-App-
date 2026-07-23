import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const getOrGenerateCustomerId = (email) => {
    const key = `connect_customer_id_${(email || 'guest').toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    let existing = localStorage.getItem(key);
    if (!existing) {
      existing = `FIC-CUST-${Math.floor(100000 + Math.random() * 900000)}`;
      try {
        localStorage.setItem(key, existing);
      } catch (e) {}
    }
    return existing;
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

  const login = (email, role, callback) => {
    let displayName = email.split('@')[0];
    displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
    
    const user = {
      name: role === 'vendor' ? 'Ravi Sharma' : displayName || 'Connect Member',
      email: email,
      role: role,
      customerId: getOrGenerateCustomerId(email)
    };
    setCurrentUser(user);
    localStorage.setItem('connect_current_user', JSON.stringify(user));
    if (callback) callback(user);
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
      role: role,
      customerId: getOrGenerateCustomerId(formData.email)
    };
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
