import api from './cliente'
import type { RespostaPaginada } from '@/types/comum'

export interface Movimentacao {
  id: string
  produtoId: string
  nomeProduto: string
  tipo: string
  quantidade: number
  estoqueAnterior: number
  novoEstoque: number
  motivo?: string
  observacoes?: string
  criadoPorId: string
  nomeCriadoPor: string
  criadoEm: string
}

export const movimentacoesApi = {
  listar: (params: Record<string, unknown>) =>
    api.get<RespostaPaginada<Movimentacao>>('/api/movimentacoes', { params }).then(r => r.data),
  entrada: (data: Record<string, unknown>) => api.post('/api/movimentacoes/entrada', data).then(r => r.data),
  saida: (data: Record<string, unknown>) => api.post('/api/movimentacoes/saida', data).then(r => r.data),
  ajuste: (data: Record<string, unknown>) => api.post('/api/movimentacoes/ajuste', data).then(r => r.data),
  perda: (data: Record<string, unknown>) => api.post('/api/movimentacoes/perda', data).then(r => r.data),
}
