import api from './client'
import type { PagedResponse } from '@/types/common'

export interface Hospitalization {
  id: string; clinicId: string; patientId: string; patientName: string
  tutorName: string; speciesName: string; veterinarianId: string; veterinarianName: string
  status: string; reason?: string; cage?: string; diet?: string; notes?: string
  admittedAt: string; dischargedAt?: string; dischargeNotes?: string
  createdAt: string; evolutionCount: number
}

export interface Evolution {
  id: string; hospitalizationId: string; veterinarianId: string; veterinarianName: string
  weight?: number; temperature?: number; heartRate?: number; respiratoryRate?: number
  description?: string; medications?: string; feeding?: string; notes?: string; createdAt: string
}

export const hospitalizationsApi = {
  list: (params: Record<string, unknown>) =>
    api.get<PagedResponse<Hospitalization>>('/api/hospitalizations', { params }).then(r => r.data),
  get: (id: string) =>
    api.get('/api/hospitalizations/' + id).then(r => r.data),
  create: (data: Record<string, unknown>) =>
    api.post('/api/hospitalizations', data).then(r => r.data),
  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/api/hospitalizations/${id}`, data).then(r => r.data),
  discharge: (id: string, dischargeNotes?: string) =>
    api.patch(`/api/hospitalizations/${id}/discharge`, { dischargeNotes }).then(r => r.data),
  addEvolution: (id: string, data: Record<string, unknown>) =>
    api.post(`/api/hospitalizations/${id}/evolutions`, data).then(r => r.data),
  evolutions: (id: string) =>
    api.get<Evolution[]>(`/api/hospitalizations/${id}/evolutions`).then(r => r.data),
}
