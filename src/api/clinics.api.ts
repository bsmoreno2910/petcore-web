import api from './client'
import type { Clinic, ClinicUser } from '@/types/clinic'

export const clinicsApi = {
  list: () => api.get<Clinic[]>('/api/clinics').then(r => r.data),
  get: (id: string) => api.get<Clinic>(`/api/clinics/${id}`).then(r => r.data),
  create: (data: Record<string, unknown>) => api.post('/api/clinics', data).then(r => r.data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/api/clinics/${id}`, data).then(r => r.data),
  toggleActive: (id: string) => api.patch(`/api/clinics/${id}/toggle-active`).then(r => r.data),
  users: (id: string) => api.get<ClinicUser[]>(`/api/clinics/${id}/users`).then(r => r.data),
  addUser: (id: string, data: { userId: string; role: string }) => api.post(`/api/clinics/${id}/users`, data).then(r => r.data),
  removeUser: (id: string, userId: string) => api.delete(`/api/clinics/${id}/users/${userId}`),
}
