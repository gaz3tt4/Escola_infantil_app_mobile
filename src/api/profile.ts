import { apiClient } from './client';
import { USE_MOCKS } from './config';
import { MOCK_PROFILES, MOCK_RECADOS } from '../mocks/data';
import { mockDelay } from '../utils/delay';
import type { ChildProfile, Recado } from '../types';

// GET /children/{id}/profile
export async function getChildProfile(childId: number): Promise<ChildProfile> {
  if (USE_MOCKS) {
    const profile = MOCK_PROFILES[childId] ?? { faltas: 0, atividades_count: 0, sonecas: { quantidade: 0, duracao_media: 0 } };
    return mockDelay(profile);
  }

  const { data } = await apiClient.get<ChildProfile>(`/children/${childId}/profile`);
  return data;
}

// GET /children/{id}/recados
export async function getRecados(childId: number): Promise<Recado[]> {
  if (USE_MOCKS) {
    return mockDelay(MOCK_RECADOS[childId] ?? []);
  }

  const { data } = await apiClient.get<Recado[]>(`/children/${childId}/recados`);
  return data;
}
