import * as SecureStore from 'expo-secure-store';

// Sessão persistida no SecureStore (nunca no AsyncStorage).
// Chaves aceitam apenas alfanuméricos, ".", "-" e "_".
const TOKEN_KEY = 'centopeia.auth_token';
const MUST_CHANGE_PASSWORD_KEY = 'centopeia.must_change_password';

// Cache em memória para não ler o SecureStore a cada requisição.
let cachedToken: string | null | undefined;

export async function getToken(): Promise<string | null> {
  if (cachedToken === undefined) {
    cachedToken = await SecureStore.getItemAsync(TOKEN_KEY);
  }
  return cachedToken;
}

export async function saveSession(token: string, mustChangePassword: boolean): Promise<void> {
  cachedToken = token;
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await setMustChangePassword(mustChangePassword);
}

export async function getMustChangePassword(): Promise<boolean> {
  return (await SecureStore.getItemAsync(MUST_CHANGE_PASSWORD_KEY)) === '1';
}

export async function setMustChangePassword(value: boolean): Promise<void> {
  if (value) {
    await SecureStore.setItemAsync(MUST_CHANGE_PASSWORD_KEY, '1');
  } else {
    await SecureStore.deleteItemAsync(MUST_CHANGE_PASSWORD_KEY);
  }
}

export async function clearSession(): Promise<void> {
  cachedToken = null;
  await Promise.all([SecureStore.deleteItemAsync(TOKEN_KEY), SecureStore.deleteItemAsync(MUST_CHANGE_PASSWORD_KEY)]);
}
