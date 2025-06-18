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
  const createParentAccount = (accountData) => {
    const { name, email, password } = accountData;

    // Check if an account (any account) already exists
    if (localStorage.getItem('userAccounts')) {
        throw new Error('An account already exists. Setup can only be run once.');
    }

    const parentData = {
      id: `parent_${Date.now()}`,
      name,
      email,
      role: 'parent', // <-- The crucial difference
      createdAt: new Date().toISOString(),
    };

    const passwordHash = CryptoJS.SHA256(password).toString();
    
    const users = {
        [email]: {
            ...parentData,
            passwordHash: passwordHash
        }
    };

    // Store all users in a single, encrypted object
    const encryptedUsers = CryptoJS.AES.encrypt(
      JSON.stringify(users), 
      'app-users-secret-key'
    ).toString();

    localStorage.setItem('userAccounts', encryptedUsers);
    
    console.log("Parent account created successfully!", parentData);
    return parentData;
  };

  // Create therapist account (parent-controlled)
  const createTherapistAccount = (accountData, authenticatedParent) => {
    // Ensure the person creating this account is a logged-in parent
    if (!authenticatedParent || authenticatedParent.role !== 'parent') {
        throw new Error('Only a parent can create new accounts.');
    }
    
    const { 
      name, 
      email, 
      credentials, 
      institution, 
      password
    } = accountData;

    // Decrypt existing users
    const encryptedUsers = localStorage.getItem('userAccounts');
    const decryptedUsers = CryptoJS.AES.decrypt(encryptedUsers, 'app-users-secret-key').toString(CryptoJS.enc.Utf8);
    const users = JSON.parse(decryptedUsers);

    if (users[email]) {
        throw new Error(`An account with the email ${email} already exists.`);
    }

    // Create secure therapist account
    const therapistData = {
      id: `therapist_${Date.now()}`,
      name,
      email,
      role: 'therapist',
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
    
    users[email] = {
        ...therapistData,
        passwordHash: passwordHash
    };

    const updatedEncryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(users), 
      'app-users-secret-key'
    ).toString();

    localStorage.setItem('userAccounts', updatedEncryptedData);

    return therapistData;
  };

  // Login for any user
  const login = async (email, password) => {
    try {
      const encryptedUsers = localStorage.getItem('userAccounts');
      if (!encryptedUsers) {
        throw new Error('No accounts have been set up for this application.');
      }
      
      const decryptedUsers = CryptoJS.AES.decrypt(encryptedUsers, 'app-users-secret-key').toString(CryptoJS.enc.Utf8);
      const users = JSON.parse(decryptedUsers);

      const userData = users[email];

      if (!userData) {
        throw new Error('Invalid email address');
      }

      const passwordHash = CryptoJS.SHA256(password).toString();
      if (passwordHash !== userData.passwordHash) {
        throw new Error('Invalid password');
      }

      // Decrypt therapist data
      const userToLogin = { ...userData };
      delete userToLogin.passwordHash; // Don't keep hash in session


      // Update last login
      userToLogin.lastLogin = new Date().toISOString();
      users[email].lastLogin = userToLogin.lastLogin; // Update the record
      const updatedEncryptedData = CryptoJS.AES.encrypt(
        JSON.stringify(users), 
        'app-users-secret-key'
      ).toString();
      localStorage.setItem('userAccounts', updatedEncryptedData);

      // Create session (expires in 8 hours)
      const sessionExpiry = new Date().getTime() + (8 * 60 * 60 * 1000);
      const sessionData = {
        id: userToLogin.id,
        name: userToLogin.name,
        email: userToLogin.email,
        role: userToLogin.role,
        permissions: userToLogin.permissions,
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
      role: therapistData.role, // Log the role
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
    // This function needs to be re-evaluated in the new user model.
    // For now, it is disabled to prevent unintended side-effects.
    throw new Error("Password change functionality is temporarily disabled pending administrative updates.");
  };

  // Get access log (parent only)
  const getAccessLog = (parentPassword) => {
     // This function needs to be re-evaluated in the new user model.
    throw new Error("Log access functionality is temporarily disabled pending administrative updates.");
  };

  // Check if therapist account exists
  const hasTherapistAccount = () => {
    return !!localStorage.getItem('userAccounts');
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

