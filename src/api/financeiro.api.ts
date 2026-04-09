import api from './cliente'
import type { RespostaPaginada } from '@/types/comum'

export interface CategoriaFinanceira {
  id: string
  nome: string
  tipo: string
  ativo: boolean
}

export interface TransacaoFinanceira {
  id: string
  clinicaId: string
  tipo: string
  status: string
  categoriaFinanceiraId: string
  nomeCategoriaFinanceira: string
  descricao: string
  valor: number
  desconto?: number
  valorPago?: number
  metodoPagamento?: string
  dataVencimento: string
  dataPagamento?: string
  tutorId?: string
  nomeTutor?: string
  centroCustoId?: string
  nomeCentroCusto?: string
  observacoes?: string
  numeroNota?: string
  criadoPorId: string
  nomeCriadoPor: string
  criadoEm: string
  parcelas: ParcelaTransacao[]
}

export interface ParcelaTransacao {
  id: string
  numeroParcela: number
  valor: number
  dataVencimento: string
  dataPagamento?: string
  status: string
}

export interface ResumoFinanceiro {
  totalReceita: number
  totalDespesa: number
  saldo: number
  totalPendente: number
  totalAtrasado: number
  totalTransacoes: number
}

export const financeiroApi = {
  listarCategorias: () => api.get<CategoriaFinanceira[]>('/api/financeiro/categorias').then(r => r.data),
  criarCategoria: (data: Record<string, unknown>) => api.post('/api/financeiro/categorias', data).then(r => r.data),
  listar: (params: Record<string, unknown>) =>
    api.get<RespostaPaginada<TransacaoFinanceira>>('/api/financeiro/transacoes', { params }).then(r => r.data),
  obterPorId: (id: string) => api.get<TransacaoFinanceira>(`/api/financeiro/transacoes/${id}`).then(r => r.data),
  criar: (data: Record<string, unknown>) => api.post('/api/financeiro/transacoes', data).then(r => r.data),
  pagar: (id: string, data: Record<string, unknown>) => api.patch(`/api/financeiro/transacoes/${id}/pagar`, data).then(r => r.data),
  cancelar: (id: string) => api.patch(`/api/financeiro/transacoes/${id}/cancelar`).then(r => r.data),
  resumo: () => api.get<ResumoFinanceiro>('/api/financeiro/resumo').then(r => r.data),
  vencidas: () => api.get<TransacaoFinanceira[]>('/api/financeiro/vencidas').then(r => r.data),
  pagarParcela: (id: string) => api.patch(`/api/financeiro/parcelas/${id}/pagar`).then(r => r.data),
}
