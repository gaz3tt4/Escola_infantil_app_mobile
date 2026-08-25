import { MOCK_DELAY_MS } from '../api/config';

export function mockDelay<T>(value: T, ms: number = MOCK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
