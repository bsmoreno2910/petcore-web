import api from './cliente'

export interface CentroCusto {
  id: string
  clinicaId: string
  nome: string
  descricao?: string
  ativo: boolean
  criadoEm: string
}

export interface ResumoCentroCusto {
  centroCustoId: string
  nomeCentroCusto: string
  totalReceita: number
  totalDespesa: number
  saldo: number
  totalTransacoes: number
}

export const centrosCustoApi = {
  listar: () => api.get<CentroCusto[]>('/api/centros-custo').then(r => r.data),
  criar: (data: Record<string, unknown>) => api.post('/api/centros-custo', data).then(r => r.data),
  atualizar: (id: string, data: Record<string, unknown>) => api.put(`/api/centros-custo/${id}`, data).then(r => r.data),
  resumo: (id: string) => api.get<ResumoCentroCusto>(`/api/centros-custo/${id}/resumo`).then(r => r.data),
  relatorio: () => api.get<ResumoCentroCusto[]>('/api/centros-custo/relatorio').then(r => r.data),
}
