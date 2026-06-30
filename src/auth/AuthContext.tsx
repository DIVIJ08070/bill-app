import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import * as SecureStore from 'expo-secure-store';

import { AuthAPI, CompanyAPI } from '../api/endpoints';
import { setOnAuthFail, setTokens } from '../api/client';
import type { Company, RegisterPayload, User } from '../types';

const ACCESS_KEY = 'gst_access_token';
const REFRESH_KEY = 'gst_refresh_token';

interface AuthState {
  user: User | null;
  company: Company | null;
  initializing: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (payload: RegisterPayload) => Promise<void>;
  signOut: () => Promise<void>;
  refreshCompany: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [initializing, setInitializing] = useState(true);

  async function persistTokens(access: string, refresh: string) {
    setTokens(access, refresh);
    await SecureStore.setItemAsync(ACCESS_KEY, access);
    await SecureStore.setItemAsync(REFRESH_KEY, refresh);
  }

  async function clearSession() {
    setTokens(null, null);
    setUser(null);
    setCompany(null);
    await SecureStore.deleteItemAsync(ACCESS_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
  }

  async function loadCompany() {
    try {
      const c = await CompanyAPI.get();
      setCompany(c);
    } catch {
      setCompany(null);
    }
  }

  // Restore a session on app start.
  useEffect(() => {
    (async () => {
      try {
        const access = await SecureStore.getItemAsync(ACCESS_KEY);
        const refresh = await SecureStore.getItemAsync(REFRESH_KEY);
        if (access && refresh) {
          setTokens(access, refresh);
          const me = await AuthAPI.me();
          setUser(me);
          await loadCompany();
        }
      } catch {
        await clearSession();
      } finally {
        setInitializing(false);
      }
    })();
  }, []);

  // If a token refresh ultimately fails, log out.
  useEffect(() => {
    setOnAuthFail(() => {
      clearSession();
    });
  }, []);

  async function signIn(email: string, password: string) {
    const res = await AuthAPI.login(email.trim(), password);
    await persistTokens(res.access_token, res.refresh_token);
    setUser(res.user);
    await loadCompany();
  }

  async function signUp(payload: RegisterPayload) {
    const res = await AuthAPI.register(payload);
    await persistTokens(res.access_token, res.refresh_token);
    setUser(res.user);
    await loadCompany();
  }

  async function signOut() {
    await clearSession();
  }

  const value = useMemo(
    () => ({
      user,
      company,
      initializing,
      signIn,
      signUp,
      signOut,
      refreshCompany: loadCompany,
    }),
    [user, company, initializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
