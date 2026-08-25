import { apiClient } from './client';
import { USE_MOCKS } from './config';
import { MOCK_DAILY_REPORTS } from '../mocks/data';
import { mockDelay } from '../utils/delay';
import type { DailyReport } from '../types';

// GET /children/{id}/daily-reports?date=YYYY-MM-DD
export async function getDailyReport(childId: number, date: string): Promise<DailyReport | null> {
  if (USE_MOCKS) {
    const report = MOCK_DAILY_REPORTS[`${childId}:${date}`] ?? null;
    return mockDelay(report);
  }

  const { data } = await apiClient.get<DailyReport>(`/children/${childId}/daily-reports`, {
    params: { date },
  });
  return data;
}
