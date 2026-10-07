import { isAxiosError } from 'axios';

import type { LaravelErrorBody } from './types';

export type ApiErrorKind = 'http' | 'network' | 'timeout' | 'config';

/**
 * Erro normalizado da camada de serviço. As telas só lidam com isto,
 * nunca com AxiosError.
 */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number | null;
  /** Erros de validação por campo (422), com a primeira mensagem de cada. */
  readonly fieldErrors: Record<string, string>;

  constructor(params: { kind: ApiErrorKind; message: string; status?: number | null; fieldErrors?: Record<string, string> }) {
    super(params.message);
    this.name = 'ApiError';
    this.kind = params.kind;
    this.status = params.status ?? null;
    this.fieldErrors = params.fieldErrors ?? {};
  }
}

const GENERIC_MESSAGE = 'Algo deu errado. Tente novamente em instantes.';

function isLaravelErrorBody(value: unknown): value is LaravelErrorBody {
  return typeof value === 'object' && value !== null;
}

function firstFieldErrors(errors: LaravelErrorBody['errors']): Record<string, string> {
  const result: Record<string, string> = {};
  if (!errors) return result;
  for (const [field, messages] of Object.entries(errors)) {
    if (Array.isArray(messages) && typeof messages[0] === 'string') {
      result[field] = messages[0];
    }
  }
  return result;
}

function messageForStatus(status: number, body: LaravelErrorBody | null, fieldErrors: Record<string, string>): string {
  const backendMessage = typeof body?.message === 'string' ? body.message : null;

  switch (status) {
    case 401:
      return 'Sua sessão expirou. Entre novamente.';
    case 403:
      // A policy do Laravel responde com a mensagem padrão em inglês; as demais
      // (acesso desativado, login exclusivo para responsáveis) já vêm em português.
      if (!backendMessage || backendMessage === 'This action is unauthorized.') {
        return 'Você não tem permissão para acessar este conteúdo.';
      }
      return backendMessage;
    case 404:
      return backendMessage ?? 'Não encontramos o que você procurava.';
    case 422: {
      // No 422 de validação o Laravel monta `message` como "primeiro erro (and N more errors)".
      // A primeira mensagem de `errors` é mais limpa para exibir.
      const first = Object.values(fieldErrors)[0];
      return first ?? backendMessage ?? 'Verifique os dados informados.';
    }
    case 429:
      return 'Muitas tentativas seguidas. Aguarde um minuto e tente novamente.';
    default:
      if (status >= 500) return 'O servidor está com problemas no momento. Tente novamente mais tarde.';
      return backendMessage ?? GENERIC_MESSAGE;
  }
}

/** Converte qualquer erro (axios ou não) em ApiError. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (isAxiosError(error)) {
    if (error.response) {
      const status = error.response.status;
      const body = isLaravelErrorBody(error.response.data) ? error.response.data : null;
      const fieldErrors = firstFieldErrors(body?.errors);
      return new ApiError({ kind: 'http', status, fieldErrors, message: messageForStatus(status, body, fieldErrors) });
    }
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return new ApiError({ kind: 'timeout', message: 'O servidor demorou para responder. Tente novamente.' });
    }
    return new ApiError({ kind: 'network', message: 'Sem conexão com o servidor. Verifique sua internet e tente novamente.' });
  }

  return new ApiError({ kind: 'http', message: GENERIC_MESSAGE });
}

/** Mensagem amigável para exibir na tela a partir de qualquer erro. */
export function errorMessage(error: unknown): string {
  return toApiError(error).message;
}

export function isHttpStatus(error: unknown, status: number): boolean {
  return error instanceof ApiError && error.status === status;
}
