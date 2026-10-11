import { create, type AxiosError } from 'axios';

import { API_URL, REQUEST_TIMEOUT_MS } from './config';
import { ApiError, isPasswordChangeRequired, toApiError } from './errors';
import { clearSession, getToken, setMustChangePassword } from './session';

/**
 * Cliente HTTP único da API. Envia sempre `Accept: application/json`: sem ele o
 * Laravel responde 302 para o /login web em vez de 401, e o middleware `ativo` pode dar 500.
 */
export const http = create({
  baseURL: API_URL ?? undefined,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

const PUBLIC_PATHS = new Set(['/login']);

http.interceptors.request.use(async (config) => {
  if (!API_URL) {
    throw new ApiError({ kind: 'config', message: 'O app está sem a URL da API configurada (EXPO_PUBLIC_API_URL).' });
  }
  if (!PUBLIC_PATHS.has(config.url ?? '')) {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ---------- Sessão encerrada pelo servidor ----------

export interface SessionEndedEvent {
  /** Mensagem a exibir na tela de login. */
  message: string;
}

type SessionEndedHandler = (event: SessionEndedEvent) => void;
let sessionEndedHandler: SessionEndedHandler | null = null;

/** Registrado pelo AuthContext para voltar ao login quando o servidor recusa o token. */
export function setSessionEndedHandler(handler: SessionEndedHandler | null) {
  sessionEndedHandler = handler;
}

// ---------- Troca de senha obrigatória ----------

type PasswordRequiredHandler = () => void;
let passwordRequiredHandler: PasswordRequiredHandler | null = null;

/** Registrado pelo AuthContext para levar o usuário à tela de troca quando o servidor exigir. */
export function setPasswordRequiredHandler(handler: PasswordRequiredHandler | null) {
  passwordRequiredHandler = handler;
}

// O 403 da policy (ex.: aluno de outro responsável) não deve derrubar a sessão;
// só o 403 do middleware `ativo` (acesso desativado pelo admin).
function isAccessDisabled(error: ApiError): boolean {
  return error.status === 403 && /desativad/i.test(error.message);
}

http.interceptors.response.use(
  (response) => response,
  async (rawError: AxiosError | ApiError) => {
    const error = toApiError(rawError);
    const sentToken = !(rawError instanceof ApiError) && !!rawError.config?.headers?.Authorization;

    // 403 `senha_padrao`: a sessão é válida; só falta trocar a senha provisória (a flag local pode
    // estar desatualizada, por exemplo depois de o admin redefinir a senha). Não derruba a sessão.
    if (sentToken && isPasswordChangeRequired(error)) {
      await setMustChangePassword(true);
      passwordRequiredHandler?.();
      return Promise.reject(error);
    }

    if (sentToken && (error.status === 401 || isAccessDisabled(error))) {
      await clearSession();
      sessionEndedHandler?.({
        message: error.status === 401 ? 'Sua sessão expirou. Entre novamente.' : error.message,
      });
    }

    return Promise.reject(error);
  }
);
