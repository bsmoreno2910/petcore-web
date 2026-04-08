import api from './client'
import type { User } from '@/types/user'

export const usersApi = {
  list: () => api.get<User[]>('/api/users').then(r => r.data),
  get: (id: string) => api.get<User>(`/api/users/${id}`).then(r => r.data),
  create: (data: Record<string, unknown>) => api.post('/api/users', data).then(r => r.data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/api/users/${id}`, data).then(r => r.data),
  toggleActive: (id: string) => api.patch(`/api/users/${id}/toggle-active`).then(r => r.data),
}
