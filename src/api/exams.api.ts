import api from './client'
import type { PagedResponse } from '@/types/common'

export interface ExamType {
  id: string; name: string; category?: string; defaultPrice?: number; active: boolean
}

export interface ExamRequest {
  id: string; clinicId: string; patientId: string; patientName: string; tutorName: string
  requestedById: string; requestedByName: string; examTypeId: string; examTypeName: string
  examTypeCategory?: string; medicalRecordId?: string; status: string
  clinicalIndication?: string; notes?: string; requestedAt: string
  collectedAt?: string; completedAt?: string; createdAt: string
  result?: ExamResult
}

export interface ExamResult {
  id: string; examRequestId: string; performedById: string; performedByName: string
  resultText?: string; resultFileUrl?: string; referenceValues?: string
  observations?: string; conclusion?: string; createdAt: string
}

export const examsApi = {
  types: () => api.get<ExamType[]>('/api/exam-types').then(r => r.data),
  createType: (data: Record<string, unknown>) => api.post('/api/exam-types', data).then(r => r.data),
  list: (params: Record<string, unknown>) =>
    api.get<PagedResponse<ExamRequest>>('/api/exam-requests', { params }).then(r => r.data),
  get: (id: string) => api.get<ExamRequest>(`/api/exam-requests/${id}`).then(r => r.data),
  create: (data: Record<string, unknown>) => api.post('/api/exam-requests', data).then(r => r.data),
  collect: (id: string) => api.patch(`/api/exam-requests/${id}/collect`).then(r => r.data),
  cancel: (id: string) => api.patch(`/api/exam-requests/${id}/cancel`).then(r => r.data),
  addResult: (id: string, data: Record<string, unknown>) =>
    api.post(`/api/exam-requests/${id}/result`, data).then(r => r.data),
  getResult: (id: string) => api.get(`/api/exam-requests/${id}/result`).then(r => r.data),
}
