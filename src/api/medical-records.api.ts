import api from './client'
import type { PagedResponse } from '@/types/common'

export interface MedicalRecord {
  id: string; clinicId: string; patientId: string; patientName: string
  veterinarianId: string; veterinarianName: string; appointmentId?: string
  chiefComplaint?: string; history?: string; anamnesis?: string
  weight?: number; temperature?: number; heartRate?: number; respiratoryRate?: number
  physicalExam?: string; mucous?: string; hydration?: string; lymph?: string
  diagnosis?: string; differentialDiagnosis?: string; treatment?: string
  notes?: string; internalNotes?: string
  createdAt: string; updatedAt: string; prescriptions: Prescription[]
}

export interface Prescription {
  id: string; medicalRecordId: string; medicineName: string; dosage?: string
  frequency?: string; duration?: string; route?: string; instructions?: string
  quantity?: number; createdAt: string
}

export const medicalRecordsApi = {
  list: (params: Record<string, unknown>) =>
    api.get<PagedResponse<MedicalRecord>>('/api/medical-records', { params }).then(r => r.data),
  get: (id: string) =>
    api.get<MedicalRecord>(`/api/medical-records/${id}`).then(r => r.data),
  create: (data: Record<string, unknown>) =>
    api.post('/api/medical-records', data).then(r => r.data),
  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/api/medical-records/${id}`, data).then(r => r.data),
  addPrescription: (id: string, data: Record<string, unknown>) =>
    api.post(`/api/medical-records/${id}/prescriptions`, data).then(r => r.data),
  removePrescription: (id: string, prescId: string) =>
    api.delete(`/api/medical-records/${id}/prescriptions/${prescId}`),
}
