import api from './client'
import type { PagedResponse } from '@/types/common'

export interface Movement {
  id: string; clinicId: string; productId: string; productName: string
  type: string; quantity: number; previousStock: number; newStock: number
  reason?: string; notes?: string; createdById: string; createdByName: string
  approvedById?: string; approvedByName?: string; approvedAt?: string
  orderId?: string; createdAt: string
}

export const movementsApi = {
  list: (params: Record<string, unknown>) =>
    api.get<PagedResponse<Movement>>('/api/movements', { params }).then(r => r.data),
  get: (id: string) => api.get<Movement>(`/api/movements/${id}`).then(r => r.data),
  entry: (data: Record<string, unknown>) => api.post('/api/movements/entry', data).then(r => r.data),
  exit: (data: Record<string, unknown>) => api.post('/api/movements/exit', data).then(r => r.data),
  adjustment: (data: Record<string, unknown>) => api.post('/api/movements/adjustment', data).then(r => r.data),
  loss: (data: Record<string, unknown>) => api.post('/api/movements/loss', data).then(r => r.data),
}
