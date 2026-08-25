import { apiClient } from './client';
import { USE_MOCKS } from './config';
import { MOCK_REMINDERS } from '../mocks/data';
import { mockDelay } from '../utils/delay';
import type { Reminder, ReminderTipo } from '../types';

// GET /reminders?tipo=feriado|aula_extra
export async function getReminders(tipo?: ReminderTipo): Promise<Reminder[]> {
  if (USE_MOCKS) {
    const filtered = tipo ? MOCK_REMINDERS.filter((r) => r.tipo === tipo) : MOCK_REMINDERS;
    return mockDelay(filtered);
  }

  const { data } = await apiClient.get<Reminder[]>('/reminders', {
    params: tipo ? { tipo } : undefined,
  });
  return data;
}
