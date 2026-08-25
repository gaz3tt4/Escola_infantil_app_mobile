import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { getMe, login as loginRequest } from '../api/auth';
import { setUnauthorizedHandler } from '../api/client';
import { clearToken, getToken } from '../api/tokenStorage';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  isLoggingIn: boolean;
  loginError: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const logout = useCallback(async () => {
    await clearToken();
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (token) {
          const me = await getMe();
          setUser(me);
        }
      } catch {
        await clearToken();
      } finally {
        setIsBootstrapping(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const response = await loginRequest({ email, password });
      setUser(response.user);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível entrar. Tente novamente.';
      setLoginError(message);
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isBootstrapping,
      isLoggingIn,
      loginError,
      login,
      logout,
    }),
    [user, isBootstrapping, isLoggingIn, loginError, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return ctx;
}
