import api from './client'

export const dashboardApi = {
  resumo: () => api.get('/api/dashboard/resumo').then(r => r.data),
  alertasEstoque: () => api.get('/api/dashboard/alertas-estoque').then(r => r.data),
}
