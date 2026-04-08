import api from './client'
import type { PagedResponse } from '@/types/common'

export interface Patient {
  id: string; clinicId: string; tutorId: string; tutorName: string
  speciesId: string; speciesName: string; breedId?: string; breedName?: string
  name: string; sex: string; birthDate?: string; weight?: number
  color?: string; microchip?: string; neutered: boolean
  allergies?: string; notes?: string; photoUrl?: string
  active: boolean; deceased: boolean; createdAt: string
}

export interface PatientDetail extends Patient {
  tutorPhone?: string; tutorEmail?: string; deceasedAt?: string
}

export const patientsApi = {
  list: (params: Record<string, unknown>) =>
    api.get<PagedResponse<Patient>>('/api/patients', { params }).then(r => r.data),
  get: (id: string) =>
    api.get<PatientDetail>(`/api/patients/${id}`).then(r => r.data),
  create: (data: Record<string, unknown>) =>
    api.post('/api/patients', data).then(r => r.data),
  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/api/patients/${id}`, data).then(r => r.data),
  medicalRecords: (id: string) =>
    api.get(`/api/patients/${id}/medical-records`).then(r => r.data),
  exams: (id: string) =>
    api.get(`/api/patients/${id}/exams`).then(r => r.data),
  hospitalizations: (id: string) =>
    api.get(`/api/patients/${id}/hospitalizations`).then(r => r.data),
  timeline: (id: string) =>
    api.get(`/api/patients/${id}/timeline`).then(r => r.data),
}
