import api from './client'
import type { PagedResponse } from '@/types/common'

export interface Tutor {
  id: string; clinicId: string; name: string; cpf?: string; rg?: string
  phone?: string; phoneSecondary?: string; email?: string
  street?: string; number?: string; complement?: string; neighborhood?: string
  city?: string; state?: string; zipCode?: string; notes?: string
  active: boolean; createdAt: string; patientCount: number
}

export interface TutorDetail extends Tutor {
  patients: { id: string; name: string; speciesName: string; breedName?: string; active: boolean }[]
}

export const tutorsApi = {
  list: (params: Record<string, unknown>) =>
    api.get<PagedResponse<Tutor>>('/api/tutors', { params }).then(r => r.data),
  get: (id: string) =>
    api.get<TutorDetail>(`/api/tutors/${id}`).then(r => r.data),
  create: (data: Record<string, unknown>) =>
    api.post('/api/tutors', data).then(r => r.data),
  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/api/tutors/${id}`, data).then(r => r.data),
  patients: (id: string) =>
    api.get(`/api/tutors/${id}/patients`).then(r => r.data),
  financialSummary: (id: string) =>
    api.get(`/api/tutors/${id}/financial-summary`).then(r => r.data),
}
