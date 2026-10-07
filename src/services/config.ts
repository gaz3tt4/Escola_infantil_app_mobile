// URL base da API (inclui o sufixo /api). Definida por ambiente em .env:
//   EXPO_PUBLIC_API_URL=https://homolog.escolacentopeia.com.br/api
// O Expo só faz o inline com acesso estático por ponto (process.env.EXPO_PUBLIC_...).
const rawUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

export const API_URL: string | null = rawUrl ? rawUrl.replace(/\/+$/, '') : null;

export const REQUEST_TIMEOUT_MS = 20000;
