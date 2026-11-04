import { ApiError, toApiError } from '../services/errors';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function emailValido(email: string): boolean {
  return EMAIL.test(email.trim());
}

/** Mensagem curta e sem texto técnico para um erro de login (o contrato da API não muda). */
export function mensagemDeLogin(error: unknown): string {
  const apiError: ApiError = toApiError(error);

  if (apiError.kind === 'network' || apiError.kind === 'timeout') {
    return 'Sem conexão. Verifique sua internet e tente de novo.';
  }
  if (apiError.status === 403 && /desativad|inativ/i.test(apiError.message)) {
    return 'Seu acesso está inativo. Fale com a secretaria da escola.';
  }
  if (apiError.status === 401) {
    return 'E-mail ou senha incorretos.';
  }
  return apiError.message;
}
