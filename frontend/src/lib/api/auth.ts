import { api } from './client'
import type { LoginInput, LoginResult } from './types'

export const authApi = {
  login: (input: LoginInput) => api.post<LoginResult>('/auth/login', input),
  me: () => api.get<{ sub: number; username: string; role: 'ADMIN' | 'STAFF' }>('/auth/me'),
  health: () => api.get<{ status: string; time: string }>('/health'),
}
