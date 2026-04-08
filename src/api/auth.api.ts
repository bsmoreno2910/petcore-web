import api from './client'
import type { LoginRequest, LoginResponse, ChangePasswordRequest } from '@/types/auth'

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<LoginResponse>('/api/auth/login', data).then(r => r.data),

  refresh: (refreshToken: string) =>
    api.post('/api/auth/refresh', { refreshToken }).then(r => r.data),

  logout: () => api.post('/api/auth/logout'),

  me: () => api.get('/api/auth/me').then(r => r.data),

  changePassword: (data: ChangePasswordRequest) =>
    api.patch('/api/auth/change-password', data).then(r => r.data),

  selectClinic: (clinicId: string) =>
    api.post('/api/auth/select-clinic', { clinicId }).then(r => r.data),
}
