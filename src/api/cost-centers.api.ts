import api from './client'

export interface CostCenter {
  id: string; clinicId: string; name: string; description?: string; active: boolean; createdAt: string
}
export interface CostCenterSummary {
  costCenterId: string; costCenterName: string
  totalRevenue: number; totalExpense: number; balance: number; transactionCount: number
}

export const costCentersApi = {
  list: () => api.get<CostCenter[]>('/api/cost-centers').then(r => r.data),
  create: (data: Record<string, unknown>) => api.post('/api/cost-centers', data).then(r => r.data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/api/cost-centers/${id}`, data).then(r => r.data),
  summary: (id: string) => api.get<CostCenterSummary>(`/api/cost-centers/${id}/summary`).then(r => r.data),
  report: () => api.get<CostCenterSummary[]>('/api/cost-centers/report').then(r => r.data),
}
