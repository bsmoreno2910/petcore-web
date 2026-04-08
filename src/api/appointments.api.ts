import api from './client'
import type { PagedResponse } from '@/types/common'

export interface Appointment {
  id: string; clinicId: string; patientId: string; patientName: string
  tutorName: string; tutorPhone?: string; speciesName: string
  veterinarianId?: string; veterinarianName?: string
  type: string; status: string; scheduledAt: string; durationMinutes: number
  startedAt?: string; finishedAt?: string; reason?: string; notes?: string
  cancellationReason?: string; createdAt: string
}

export interface CalendarEvent {
  id: string; title: string; start: string; end: string
  color?: string; status: string; type: string
  patientId: string; veterinarianId?: string
}

export interface AvailableSlot { start: string; end: string }

export const appointmentsApi = {
  list: (params: Record<string, unknown>) =>
    api.get<PagedResponse<Appointment>>('/api/appointments', { params }).then(r => r.data),
  calendar: (startDate: string, endDate: string) =>
    api.get<CalendarEvent[]>('/api/appointments/calendar', { params: { startDate, endDate } }).then(r => r.data),
  get: (id: string) =>
    api.get<Appointment>(`/api/appointments/${id}`).then(r => r.data),
  create: (data: Record<string, unknown>) =>
    api.post('/api/appointments', data).then(r => r.data),
  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/api/appointments/${id}`, data).then(r => r.data),
  confirm: (id: string) => api.patch(`/api/appointments/${id}/confirm`).then(r => r.data),
  checkIn: (id: string) => api.patch(`/api/appointments/${id}/check-in`).then(r => r.data),
  start: (id: string) => api.patch(`/api/appointments/${id}/start`).then(r => r.data),
  complete: (id: string) => api.patch(`/api/appointments/${id}/complete`).then(r => r.data),
  cancel: (id: string, reason?: string) =>
    api.patch(`/api/appointments/${id}/cancel`, { cancellationReason: reason }).then(r => r.data),
  noShow: (id: string) => api.patch(`/api/appointments/${id}/no-show`).then(r => r.data),
  availableSlots: (veterinarianId: string, date: string) =>
    api.get<AvailableSlot[]>('/api/appointments/available-slots', { params: { veterinarianId, date } }).then(r => r.data),
}
