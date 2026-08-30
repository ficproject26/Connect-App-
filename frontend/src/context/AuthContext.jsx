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
        }
        const regAddressStr = u.address || u.registeredAddress || '';
        if ((!u.addresses || !Array.isArray(u.addresses) || u.addresses.length === 0) && regAddressStr.trim()) {
          u.addresses = [{
            id: 'addr_reg_' + (u.id || Date.now()),
            name: u.name || 'Connect Member',
            phone: (u.phone || '').replace('+91', '').trim(),
            pincode: u.pincode || '',
            locality: u.city || '',
            address: regAddressStr,
            city: u.city || '',
            state: u.state || 'Karnataka',
            landmark: '',
            altPhone: '',
            type: 'Home',
            isRegistrationAddress: true
          }];
        }
        const tokenToSave = u.token || `token_${u.customerId || Date.now()}`;
        if (!localStorage.getItem('connect_token')) {
          localStorage.setItem('connect_token', tokenToSave);
        }
        localStorage.setItem('connect_current_user', JSON.stringify(u));
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

    const extractValidMobile = (val) => {
      if (!val) return '';
      const digits = String(val).replace(/\D/g, '');
      return digits.length >= 10 ? digits.slice(-10) : '';
    };

    const validMobile = extractValidMobile(inputUser.phone) || extractValidMobile(typeof userInfo === 'string' ? userInfo : '');

    let finalName = inputUser.name;
    if (!finalName || finalName === 'OTP Verified Member' || /^\d+$/.test(finalName)) {
      const emailPrefix = inputUser.email ? inputUser.email.split('@')[0] : '';
      if (emailPrefix && !/^\d+$/.test(emailPrefix)) {
        finalName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
      } else {
        finalName = 'Connect Member';
      }
    }

    const regAddressStr = inputUser.address || inputUser.registeredAddress || '';
    const initialAddresses = Array.isArray(inputUser.addresses) && inputUser.addresses.length > 0
      ? inputUser.addresses
      : (regAddressStr.trim() ? [{
          id: 'addr_reg_' + Date.now(),
          name: finalName,
          phone: validMobile,
          pincode: inputUser.pincode || '',
          locality: inputUser.city || '',
          address: regAddressStr,
          city: inputUser.city || '',
          state: inputUser.state || 'Karnataka',
          landmark: '',
          altPhone: '',
          type: 'Home',
          isRegistrationAddress: true
        }] : []);

    const custId = (inputUser.customerId && inputUser.customerId !== 'FIC-CUST-750684' && inputUser.customerId !== 'FIC-CUST-849201')
      ? inputUser.customerId 
      : getOrGenerateCustomerId(inputUser.email || validMobile || finalName);

    const userToken = inputUser.token || `token_${custId}`;

    const finalUser = {
      ...inputUser,
      name: finalName,
      email: inputUser.email || (validMobile ? `${validMobile}@connect.app` : 'customer@connect.app'),
      phone: validMobile,
      address: inputUser.address || '',
      city: inputUser.city || '',
      pincode: inputUser.pincode || '',
      state: inputUser.state || '',
      role: role || inputUser.role || 'customer',
      customerId: custId,
      token: userToken,
      addresses: initialAddresses
    };

    setCurrentUser(finalUser);
    localStorage.setItem('connect_current_user', JSON.stringify(finalUser));
    localStorage.setItem('connect_token', userToken);
    if (callback) callback(finalUser);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('connect_current_user');
    localStorage.removeItem('connect_token');
  };

  const register = (formData, role, callback) => {
    let displayName = formData.name;
    if (role === 'vendor') {
      displayName = formData.businessName || 'Elite Vendor';
    }

    const regAddressStr = formData.address || '';
    const initialAddresses = regAddressStr.trim() ? [{
      id: 'addr_reg_' + Date.now(),
      name: displayName || 'Connect Member',
      phone: (formData.phone || formData.phoneNumber || '').replace('+91', '').trim(),
      pincode: formData.pincode || '',
      locality: formData.city || '',
      address: regAddressStr,
      city: formData.city || '',
      state: formData.state || 'Karnataka',
      landmark: '',
      altPhone: '',
      type: 'Home',
      isRegistrationAddress: true
    }] : [];

    const custId = getOrGenerateCustomerId(formData.email || formData.phone || displayName);
    const userToken = formData.token || `token_${custId}`;

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
      customerId: custId,
      token: userToken,
      addresses: initialAddresses
    };

    setCurrentUser(user);
    localStorage.setItem('connect_current_user', JSON.stringify(user));
    localStorage.setItem('connect_token', userToken);
    if (callback) callback(user);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

