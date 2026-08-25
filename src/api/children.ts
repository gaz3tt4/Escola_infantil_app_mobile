import { apiClient } from './client';
import { USE_MOCKS } from './config';
import { MOCK_CHILDREN } from '../mocks/data';
import { mockDelay } from '../utils/delay';
import type { Child } from '../types';

// GET /children
export async function getChildren(): Promise<Child[]> {
  if (USE_MOCKS) {
    return mockDelay(MOCK_CHILDREN);
  }

  const { data } = await apiClient.get<Child[]>('/children');
  return data;
}
