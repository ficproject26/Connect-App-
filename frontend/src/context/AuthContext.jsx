import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('connect_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
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
      role: role
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
      role: role
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
