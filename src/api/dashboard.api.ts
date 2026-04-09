import api from './client'
import type { ResumoDashboard, AlertaEstoque } from '@/types/dashboard'

export const dashboardApi = {
  resumo: () => api.get<ResumoDashboard>('/api/dashboard/resumo').then(r => r.data),
  alertasEstoque: () => api.get<AlertaEstoque[]>('/api/dashboard/alertas-estoque').then(r => r.data),
}
