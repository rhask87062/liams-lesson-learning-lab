import { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';

// Secure therapist authentication system
export function useTherapistAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [therapistInfo, setTherapistInfo] = useState(null);
  const [sessionExpiry, setSessionExpiry] = useState(null);

  // Check authentication status on load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Check if therapist is currently authenticated
  const checkAuthStatus = () => {
    const session = localStorage.getItem('therapistSession');
    const expiry = localStorage.getItem('therapistSessionExpiry');
    
    if (session && expiry) {
      const now = new Date().getTime();
      const expiryTime = parseInt(expiry);
      
      if (now < expiryTime) {
        try {
          const decryptedSession = CryptoJS.AES.decrypt(session, 'therapist-session-key').toString(CryptoJS.enc.Utf8);
          const sessionData = JSON.parse(decryptedSession);
          setTherapistInfo(sessionData);
          setIsAuthenticated(true);
          setSessionExpiry(expiryTime);
          return true;
        } catch (error) {
          console.error('Invalid session data');
          logout();
        }
      } else {
        logout();
      }
    }
    return false;
  };

  // Create therapist account (parent-controlled)
  const createTherapistAccount = (accountData) => {
    const { 
      name, 
      email, 
      credentials, 
      institution, 
      password,
      parentPassword 
    } = accountData;

    // Verify parent password first
    const storedParentHash = localStorage.getItem('parentPasswordHash');
    if (!storedParentHash) {
      // First time setup - create parent password
      const parentHash = CryptoJS.SHA256(parentPassword).toString();
      localStorage.setItem('parentPasswordHash', parentHash);
    } else {
      // Verify existing parent password
      const parentHash = CryptoJS.SHA256(parentPassword).toString();
      if (parentHash !== storedParentHash) {
        throw new Error('Invalid parent password');
      }
    }

    // Create secure therapist account
    const therapistData = {
      id: `therapist_${Date.now()}`,
      name,
      email,
      credentials,
      institution,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      accessLevel: 'therapist',
      permissions: {
        viewProgress: true,
        addNotes: true,
        exportData: true,
        viewSessions: true
      }
    };

    // Hash and store therapist password
    const passwordHash = CryptoJS.SHA256(password).toString();
    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(therapistData), 
      'therapist-data-key'
    ).toString();

    localStorage.setItem('therapistAccount', encryptedData);
    localStorage.setItem('therapistPasswordHash', passwordHash);
    localStorage.setItem('therapistEmail', email);

    return therapistData;
  };

  // Therapist login
  const login = async (email, password) => {
    try {
      const storedEmail = localStorage.getItem('therapistEmail');
      const storedPasswordHash = localStorage.getItem('therapistPasswordHash');
      const encryptedAccount = localStorage.getItem('therapistAccount');

      if (!storedEmail || !storedPasswordHash || !encryptedAccount) {
        throw new Error('No therapist account found. Please contact the parent to set up access.');
      }

      if (email !== storedEmail) {
        throw new Error('Invalid email address');
      }

      const passwordHash = CryptoJS.SHA256(password).toString();
      if (passwordHash !== storedPasswordHash) {
        throw new Error('Invalid password');
      }

      // Decrypt therapist data
      const decryptedData = CryptoJS.AES.decrypt(encryptedAccount, 'therapist-data-key').toString(CryptoJS.enc.Utf8);
      const therapistData = JSON.parse(decryptedData);

      // Update last login
      therapistData.lastLogin = new Date().toISOString();
      const updatedEncryptedData = CryptoJS.AES.encrypt(
        JSON.stringify(therapistData), 
        'therapist-data-key'
      ).toString();
      localStorage.setItem('therapistAccount', updatedEncryptedData);

      // Create session (expires in 8 hours)
      const sessionExpiry = new Date().getTime() + (8 * 60 * 60 * 1000);
      const sessionData = {
        id: therapistData.id,
        name: therapistData.name,
        email: therapistData.email,
        credentials: therapistData.credentials,
        institution: therapistData.institution,
        permissions: therapistData.permissions,
        loginTime: new Date().toISOString()
      };

      const encryptedSession = CryptoJS.AES.encrypt(
        JSON.stringify(sessionData), 
        'therapist-session-key'
      ).toString();

      localStorage.setItem('therapistSession', encryptedSession);
      localStorage.setItem('therapistSessionExpiry', sessionExpiry.toString());

      setTherapistInfo(sessionData);
      setIsAuthenticated(true);
      setSessionExpiry(sessionExpiry);

      // Log access for security
      logAccess('login', sessionData);

      return true;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  // Logout
  const logout = () => {
    if (therapistInfo) {
      logAccess('logout', therapistInfo);
    }

    localStorage.removeItem('therapistSession');
    localStorage.removeItem('therapistSessionExpiry');
    setIsAuthenticated(false);
    setTherapistInfo(null);
    setSessionExpiry(null);
  };

  // Log access for security audit
  const logAccess = (action, therapistData) => {
    const accessLog = JSON.parse(localStorage.getItem('therapistAccessLog') || '[]');
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      therapistId: therapistData.id,
      therapistName: therapistData.name,
      therapistEmail: therapistData.email,
      sessionId: `session_${Date.now()}`
    };

    accessLog.push(logEntry);
    
    // Keep only last 100 entries
    if (accessLog.length > 100) {
      accessLog.splice(0, accessLog.length - 100);
    }

    localStorage.setItem('therapistAccessLog', JSON.stringify(accessLog));
  };

  // Change therapist password (requires parent password)
  const changePassword = (currentPassword, newPassword, parentPassword) => {
    // Verify parent password
    const storedParentHash = localStorage.getItem('parentPasswordHash');
    const parentHash = CryptoJS.SHA256(parentPassword).toString();
    if (parentHash !== storedParentHash) {
      throw new Error('Invalid parent password');
    }

    // Verify current therapist password
    const storedPasswordHash = localStorage.getItem('therapistPasswordHash');
    const currentPasswordHash = CryptoJS.SHA256(currentPassword).toString();
    if (currentPasswordHash !== storedPasswordHash) {
      throw new Error('Invalid current password');
    }

    // Update password
    const newPasswordHash = CryptoJS.SHA256(newPassword).toString();
    localStorage.setItem('therapistPasswordHash', newPasswordHash);

    logAccess('password_change', therapistInfo);
    return true;
  };

  // Get access log (parent only)
  const getAccessLog = (parentPassword) => {
    const storedParentHash = localStorage.getItem('parentPasswordHash');
    const parentHash = CryptoJS.SHA256(parentPassword).toString();
    if (parentHash !== storedParentHash) {
      throw new Error('Invalid parent password');
    }

    return JSON.parse(localStorage.getItem('therapistAccessLog') || '[]');
  };

  // Check if therapist account exists
  const hasTherapistAccount = () => {
    return !!localStorage.getItem('therapistAccount');
  };

  // Get session time remaining
  const getSessionTimeRemaining = () => {
    if (!sessionExpiry) return 0;
    const now = new Date().getTime();
    const remaining = sessionExpiry - now;
    return Math.max(0, remaining);
  };

  // Extend session (if less than 1 hour remaining)
  const extendSession = () => {
    const remaining = getSessionTimeRemaining();
    if (remaining < (60 * 60 * 1000)) { // Less than 1 hour
      const newExpiry = new Date().getTime() + (8 * 60 * 60 * 1000);
      localStorage.setItem('therapistSessionExpiry', newExpiry.toString());
      setSessionExpiry(newExpiry);
      return true;
    }
    return false;
  };

  return {
    isAuthenticated,
    therapistInfo,
    sessionExpiry,
    login,
    logout,
    createTherapistAccount,
    changePassword,
    getAccessLog,
    hasTherapistAccount,
    getSessionTimeRemaining,
    extendSession,
    checkAuthStatus
  };
}

// Crypto-JS mock for environments where it's not available
if (typeof CryptoJS === 'undefined') {
  window.CryptoJS = {
    SHA256: (text) => {
      // Simple hash function for demo purposes
      let hash = 0;
      for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return { toString: () => Math.abs(hash).toString(16) };
    },
    AES: {
      encrypt: (text, key) => {
        // Simple encoding for demo purposes
        const encoded = btoa(text + '|' + key);
        return { toString: () => encoded };
      },
      decrypt: (encrypted, key) => {
        try {
          const decoded = atob(encrypted);
          const [text, originalKey] = decoded.split('|');
          if (originalKey === key) {
            return { toString: () => text };
          }
          throw new Error('Invalid key');
        } catch {
          throw new Error('Decryption failed');
        }
      }
    },
    enc: {
      Utf8: {}
    }
  };
}

