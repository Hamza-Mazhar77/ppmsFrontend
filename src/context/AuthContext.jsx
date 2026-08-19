/**
 * Authentication state.
 * The JWT itself is never held in JavaScript or in localStorage - it lives in
 * an httpOnly cookie that the browser attaches automatically. This context only
 * caches the *public* profile returned by GET /api/auth/me, and re-verifies it
 * with the server on every page load. That means a stale client cannot fake a
 * session: if the cookie is gone or the account was suspended, the bootstrap
 * request fails and the user is signed out.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { authApi } from '../services/ppms.service';
import { onUnauthorized } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // `initialising` is true only during the first session check, so protected
  // routes can wait instead of bouncing an authenticated user to /login.
  const [initialising, setInitialising] = useState(true);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  /** Ask the server who we are. */
  const refresh = useCallback(async () => {
    try {
      const response = await authApi.me();
      if (mounted.current) setUser(response.data.user);
      return response.data.user;
    } catch {
      if (mounted.current) setUser(null);
      return null;
    }
  }, []);

  // Restore the session on first load.
  useEffect(() => {
    refresh().finally(() => {
      if (mounted.current) setInitialising(false);
    });
  }, [refresh]);

  // Any 401 from the API means the session ended server side; drop it locally.
  useEffect(() => onUnauthorized(() => setUser(null)), []);

  const login = useCallback(async (credentials) => {
    const response = await authApi.login(credentials);
    setUser(response.data.user);
    return response.data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      // Clear locally even if the network call failed, so the UI cannot be
      // left showing a signed-in state after the user asked to sign out.
      setUser(null);
    }
  }, []);

  /** Merge an updated profile (after a profile edit) into the cached user. */
  const applyUser = useCallback((updated) => setUser(updated), []);

  const value = useMemo(
    () => ({
      user,
      initialising,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
      isStudent: user?.role === 'student',
      login,
      logout,
      refresh,
      applyUser,
    }),
    [user, initialising, login, logout, refresh, applyUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside an AuthProvider.');
  return context;
}
