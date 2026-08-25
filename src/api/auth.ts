import { apiClient } from './client';
import { USE_MOCKS } from './config';
import { setToken } from './tokenStorage';
import { MOCK_PASSWORD, MOCK_USER } from '../mocks/data';
import { mockDelay } from '../utils/delay';
import type { LoginRequest, LoginResponse, User } from '../types';

// POST /login
export async function login(payload: LoginRequest): Promise<LoginResponse> {
  if (USE_MOCKS) {
    if (payload.password !== MOCK_PASSWORD) {
      await mockDelay(null, 300);
      throw new Error('E-mail ou senha inválidos.');
    }
    const response = await mockDelay<LoginResponse>({
      token: 'mock-token-123456',
      user: { ...MOCK_USER, email: payload.email },
    });
    await setToken(response.token);
    return response;
  }

  const { data } = await apiClient.post<LoginResponse>('/login', payload);
  await setToken(data.token);
  return data;
}

// GET /me
export async function getMe(): Promise<User> {
  if (USE_MOCKS) {
    return mockDelay(MOCK_USER);
  }

  const { data } = await apiClient.get<User>('/me');
  return data;
}
