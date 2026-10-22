// URL base da API (inclui o sufixo /api). Definida por ambiente em .env:
//   EXPO_PUBLIC_API_URL=https://homolog.escolacentopeia.com.br/api
// O Expo só faz o inline com acesso estático por ponto (process.env.EXPO_PUBLIC_...).
const rawUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

export const API_URL: string | null = rawUrl ? rawUrl.replace(/\/+$/, '') : null;

export const REQUEST_TIMEOUT_MS = 20000;

export type Ambiente = 'producao' | 'homologacao' | 'outro';

/** Ambiente deduzido pelo host da URL da API (sem variável extra). */
export function detectarAmbiente(url: string | null): Ambiente {
  const host = url?.match(/^https?:\/\/([^/:?#]+)/i)?.[1]?.toLowerCase();
  if (host === 'app.escolacentopeia.com.br') return 'producao';
  if (host === 'homolog.escolacentopeia.com.br') return 'homologacao';
  return 'outro';
}

export const AMBIENTE: Ambiente = detectarAmbiente(API_URL);
