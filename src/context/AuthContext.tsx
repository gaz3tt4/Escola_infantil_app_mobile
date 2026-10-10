import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import * as authService from '../services/auth';
import { registrarDispositivoPush, removerDispositivoPush } from '../services/push';
import { toApiError } from '../services/errors';
import { setSessionEndedHandler } from '../services/http';
import { getMustChangePassword, getToken } from '../services/session';
import type { TrocarSenhaRequest } from '../services/types';

export type AuthStatus =
  | 'bootstrapping' // lendo o token salvo e validando com /me
  | 'unreachable' // há token, mas não foi possível falar com o servidor
  | 'signedOut'
  | 'signedIn';

interface AuthContextValue {
  status: AuthStatus;
  isAuthenticated: boolean;
  /** true enquanto o usuário não trocar a senha provisória (vem do login). */
  mustChangePassword: boolean;
  /** Mensagem para a tela de login (sessão expirada, acesso desativado). */
  notice: string | null;
  /** Motivo de `unreachable`. */
  bootError: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (payload: TrocarSenhaRequest) => Promise<string>;
  retryBootstrap: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Valida a sessão salva: sem token → login; com token → GET /me. */
async function resolveSavedSession(): Promise<
  { status: 'signedOut' } | { status: 'signedIn'; mustChangePassword: boolean } | { status: 'unreachable'; error: string }
> {
  const token = await getToken();
  if (!token) return { status: 'signedOut' };

  const mustChangePassword = await getMustChangePassword();
  try {
    await authService.getMe();
    return { status: 'signedIn', mustChangePassword };
  } catch (error) {
    const apiError = toApiError(error);
    // 401/403: o interceptor já limpou a sessão e avisou o contexto.
    if (apiError.status === 401 || apiError.status === 403) return { status: 'signedOut' };
    // Qualquer outro erro (ex.: responsável sem cadastro, 404) não invalida o token:
    // entra no app e a tela correspondente mostra o problema.
    if (apiError.kind === 'http' && apiError.status !== null && apiError.status < 500) {
      return { status: 'signedIn', mustChangePassword };
    }
    return { status: 'unreachable', error: apiError.message };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('bootstrapping');
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [bootError, setBootError] = useState<string | null>(null);
  const [bootAttempt, setBootAttempt] = useState(0);
  const loggingOut = useRef(false);

  useEffect(() => {
    setSessionEndedHandler(({ message }) => {
      if (loggingOut.current) return;
      setStatus('signedOut');
      setMustChangePassword(false);
      setNotice(message);
    });
    return () => setSessionEndedHandler(null);
  }, []);

  useEffect(() => {
    let active = true;
    resolveSavedSession().then((result) => {
      if (!active) return;
      if (result.status === 'signedIn') setMustChangePassword(result.mustChangePassword);
      setBootError(result.status === 'unreachable' ? result.error : null);
      setStatus(result.status);
    });
    return () => {
      active = false;
    };
  }, [bootAttempt]);

  // Registra o token de push em toda entrada na área logada (login, sessão salva e depois da
  // troca obrigatória de senha). Falhas são silenciosas: push é um extra.
  useEffect(() => {
    if (status === 'signedIn' && !mustChangePassword) {
      void registrarDispositivoPush();
    }
  }, [status, mustChangePassword]);

  const retryBootstrap = useCallback(() => {
    setStatus('bootstrapping');
    setBootAttempt((attempt) => attempt + 1);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const user = await authService.login(email, password);
    setNotice(null);
    setMustChangePassword(user.must_change_password);
    setStatus('signedIn');
  }, []);

  const logout = useCallback(async () => {
    loggingOut.current = true;
    try {
      // Antes do logout: a rota de dispositivos exige o Bearer.
      await removerDispositivoPush();
      await authService.logout();
    } finally {
      loggingOut.current = false;
      setMustChangePassword(false);
      setNotice(null);
      setStatus('signedOut');
    }
  }, []);

  const changePassword = useCallback(async (payload: TrocarSenhaRequest) => {
    const message = await authService.trocarSenha(payload);
    setMustChangePassword(false);
    return message;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      isAuthenticated: status === 'signedIn',
      mustChangePassword,
      notice,
      bootError,
      login,
      logout,
      changePassword,
      retryBootstrap,
    }),
    [status, mustChangePassword, notice, bootError, login, logout, changePassword, retryBootstrap]
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

