// Aponte para a URL real do backend Laravel quando a integração for ligada.
// Ex.: EXPO_PUBLIC_API_URL=https://api.escola.com.br/api em um arquivo .env
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.example.com/api';

// Enquanto o backend real não está plugado, todas as chamadas em src/api/*
// retornam dados mockados (ver src/mocks). Troque para false quando o
// endpoint correspondente já responder de verdade.
export const USE_MOCKS = true;

// Simula latência de rede para os mocks, deixando a UI de loading realista.
export const MOCK_DELAY_MS = 350;
