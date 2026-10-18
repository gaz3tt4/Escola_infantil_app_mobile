import { ApiError, toApiError } from './errors';
import { http } from './http';
import { clearSession, saveSession, setMustChangePassword } from './session';
import type { AuthUser, LoginResponse, MessageResponse, Responsavel, TrocarSenhaRequest } from './types';

/**
 * O backend não tem tradução pt_BR: credencial errada e excesso de tentativas
 * chegam como 422 com as mensagens padrão do Laravel em inglês.
 */
function traduzirErroDeLogin(error: ApiError): ApiError {
  if (error.status !== 422) return error;

  const throttle = error.message.match(/Too many login attempts\. Please try again in (\d+) seconds?/i);
  if (throttle) {
    const segundos = Number(throttle[1]);
    const espera = segundos >= 60 ? `${Math.ceil(segundos / 60)} min` : `${segundos} s`;
    return new ApiError({
      kind: 'http',
      status: 422,
      message: `Muitas tentativas de login. Aguarde ${espera} e tente novamente.`,
    });
  }
  if (/credentials do not match/i.test(error.message)) {
    return new ApiError({ kind: 'http', status: 422, message: 'E-mail ou senha incorretos.' });
  }
  return error;
}

/** POST /login: grava token e flag de troca de senha no SecureStore. */
export async function login(email: string, password: string): Promise<AuthUser> {
  try {
    const { data } = await http.post<LoginResponse>('/login', { email, password });
    await saveSession(data.token, data.user.must_change_password);
    return data.user;
  } catch (error) {
    throw traduzirErroDeLogin(toApiError(error));
  }
}

/** POST /logout: revoga só o token atual. A sessão local é limpa mesmo se a chamada falhar. */
export async function logout(): Promise<void> {
  try {
    await http.post<MessageResponse>('/logout');
  } catch {
    // Sem rede ou token já revogado: o importante é limpar a sessão local.
  } finally {
    await clearSession();
  }
}

/** GET /me: dados do responsável autenticado. */
export async function getMe(): Promise<Responsavel> {
  const { data } = await http.get<Responsavel>('/me');
  return data;
}

/**
 * PUT /senha: troca a senha do usuário autenticado.
 * O backend mantém o token atual (revoga os dos outros dispositivos) e não devolve token novo,
 * então só a flag local de troca obrigatória precisa ser limpa.
 */
export async function trocarSenha(payload: TrocarSenhaRequest): Promise<string> {
  const { data } = await http.put<MessageResponse>('/senha', payload);
  await setMustChangePassword(false);
  return data.message;
}
