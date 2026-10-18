// Utilitários para os serviços ainda sem endpoint no backend.

const MOCK_DELAY_MS = 350;

export function mockDelay<T>(value: T, ms: number = MOCK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/** Número pseudoaleatório estável a partir de uma semente (mesmo aluno/dia = mesmos dados). */
export function seeded(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

export function pick<T>(items: readonly T[], seed: number): T {
  return items[Math.floor(seeded(seed) * items.length) % items.length];
}

export function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}
