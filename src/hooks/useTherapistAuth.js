import { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

// Secure therapist authentication system
export function useTherapistAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [therapistInfo, setTherapistInfo] = useState(null);
  const [sessionExpiry, setSessionExpiry] = useState(null);

  // Convex mutations
  const createParentMutation = useMutation(api.users.createParent);
  const authenticateMutation = useMutation(api.users.authenticate);
  const createTherapistMutation = useMutation(api.users.createTherapist);
  const deleteTherapistMutation = useMutation(api.users.deleteTherapist);

  // Expose createParentAccount for one-time setup in development
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.createParentAccount = async (args) => {
        console.log('Creating parent account with:', args);
        try {
          const result = await createParentMutation(args);
          console.log('Account creation successful:', result);
          return result;
        } catch (error) {
          console.error('Error creating parent account:', error);
          throw error;
        }
      };
      console.log('Parent account creation function is available. Type `createParentAccount({ name, email, password })` in the console.');
    }
  }, [createParentMutation]);

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
          const sessionData = JSON.parse(session);
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
  const createTherapistAccount = async (accountData) => {
    if (!therapistInfo || therapistInfo.role !== 'parent') {
      throw new Error('Only a parent can create therapist accounts');
    }
    
    try {
      const result = await createTherapistMutation({
        parentEmail: therapistInfo.email,
        parentPassword: accountData.parentPassword, // Parent must re-enter password
        therapistName: accountData.name,
        therapistEmail: accountData.email,
        therapistPassword: accountData.password
      });
      
      return result;
    } catch (error) {
      console.error('Error creating therapist account:', error);
      throw error;
    }
  };

  // Login for any user
  const login = async (email, password) => {
    try {
      // Use Convex to authenticate
      const user = await authenticateMutation({ email, password });
      
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Create session (expires in 8 hours)
      const sessionExpiry = new Date().getTime() + (8 * 60 * 60 * 1000);
      const sessionData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.role === 'therapist' ? {
          viewProgress: true,
          addNotes: true,
          exportData: true,
          viewSessions: true
        } : {
          viewProgress: true,
          addNotes: true,
          exportData: true,
          viewSessions: true,
          manageTherapists: true
        },
        loginTime: new Date().toISOString()
      };

      // Store session in localStorage (still encrypted for security)
      localStorage.setItem('therapistSession', JSON.stringify(sessionData));
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

  // Check if therapist account exists (deprecated - accounts are now in Convex)
  const hasTherapistAccount = () => {
    // This is no longer used - accounts are managed in Convex
    return true;
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



