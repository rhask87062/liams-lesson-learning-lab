import { useCallback, useEffect, useState } from 'react';
import { useAction, useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const SESSION_KEY = 'authSession';

function loadSession() {
  try {
    localStorage.removeItem('therapistSession');
    localStorage.removeItem('therapistSessionExpiry');
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    return session && session.token && session.expiresAt > Date.now() ? session : null;
  } catch {
    return null;
  }
}

function storeSession(session) {
  try {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    // Storage unavailable (private mode); the session just won't survive a reload.
  }
}

export function useTherapistAuth() {
  const [session, setSession] = useState(loadSession);

  const signInAction = useAction(api.auth.signIn);
  const signUpAction = useAction(api.auth.signUp);
  const requestResetAction = useAction(api.auth.requestPasswordReset);
  const resetPasswordAction = useAction(api.auth.resetPassword);
  const signOutMutation = useMutation(api.users.signOut);
  const extendSessionMutation = useMutation(api.users.extendSession);

  const serverUser = useQuery(api.users.currentUser, session ? { token: session.token } : 'skip');

  const saveSession = useCallback((next) => {
    storeSession(next);
    setSession(next);
  }, []);

  // The server is the source of truth: a revoked, expired or reset session logs out everywhere.
  useEffect(() => {
    if (session && serverUser === null) saveSession(null);
  }, [session, serverUser, saveSession]);

  useEffect(() => {
    if (!session) return;
    const timer = setTimeout(() => saveSession(null), Math.max(0, session.expiresAt - Date.now()));
    return () => clearTimeout(timer);
  }, [session, saveSession]);

  const login = async (email, password) => {
    saveSession(await signInAction({ email, password }));
  };

  const signUp = async (name, email, password) => {
    saveSession(await signUpAction({ name, email, password }));
  };

  const requestPasswordReset = (email) => requestResetAction({ email });

  const resetPassword = (email, code, newPassword) => resetPasswordAction({ email, code, newPassword });

  const logout = () => {
    if (session) signOutMutation({ token: session.token }).catch(() => {});
    saveSession(null);
  };

  const getSessionTimeRemaining = useCallback(
    () => (session ? Math.max(0, session.expiresAt - Date.now()) : 0),
    [session]
  );

  const extendSession = async () => {
    if (!session) return false;
    const { expiresAt } = await extendSessionMutation({ token: session.token });
    saveSession({ ...session, expiresAt });
    return true;
  };

  const user = serverUser ?? session?.user;
  const therapistInfo = session && user ? {
    ...user,
    permissions: {
      viewProgress: true,
      addNotes: true,
      exportData: true,
      viewSessions: true,
      manageAccess: user.role === 'parent',
    },
  } : null;

  return {
    isAuthenticated: !!therapistInfo,
    therapistInfo,
    sessionToken: session?.token ?? null,
    login,
    signUp,
    requestPasswordReset,
    resetPassword,
    logout,
    getSessionTimeRemaining,
    extendSession,
  };
}
