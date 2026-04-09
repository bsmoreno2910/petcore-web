import api from './client'
import type { RespostaPaginada } from '@/types/common'

export interface TipoExame {
  id: string
  nome: string
  categoria?: string
  precoDefault?: number
  ativo: boolean
}

export interface SolicitacaoExame {
  id: string
  clinicaId: string
  pacienteId: string
  nomePaciente: string
  nomeTutor: string
  solicitadoPorId: string
  nomeSolicitante: string
  tipoExameId: string
  nomeTipoExame: string
  categoriaTipoExame?: string
  prontuarioId?: string
  status: string
  indicacaoClinica?: string
  observacoes?: string
  dataSolicitacao: string
  dataColeta?: string
  dataConclusao?: string
  criadoEm: string
  resultado?: ResultadoExame
}

export interface ResultadoExame {
  id: string
  realizadoPorId: string
  nomeRealizadoPor: string
  textoResultado?: string
  arquivoResultadoUrl?: string
  valoresReferencia?: string
  observacoes?: string
  conclusao?: string
  criadoEm: string
}

export const examesApi = {
  listarTipos: () => api.get<TipoExame[]>('/api/tipos-exame').then(r => r.data),
  criarTipo: (data: Record<string, unknown>) => api.post('/api/tipos-exame', data).then(r => r.data),
  atualizarTipo: (id: string, data: Record<string, unknown>) => api.put(`/api/tipos-exame/${id}`, data).then(r => r.data),
  listar: (params: Record<string, unknown>) =>
    api.get<RespostaPaginada<SolicitacaoExame>>('/api/solicitacoes-exame', { params }).then(r => r.data),
  obterPorId: (id: string) => api.get<SolicitacaoExame>(`/api/solicitacoes-exame/${id}`).then(r => r.data),
  criar: (data: Record<string, unknown>) => api.post('/api/solicitacoes-exame', data).then(r => r.data),
  coletar: (id: string) => api.patch(`/api/solicitacoes-exame/${id}/coletar`).then(r => r.data),
  cancelar: (id: string) => api.patch(`/api/solicitacoes-exame/${id}/cancelar`).then(r => r.data),
  adicionarResultado: (id: string, data: Record<string, unknown>) =>
    api.post(`/api/solicitacoes-exame/${id}/resultado`, data).then(r => r.data),
  obterResultado: (id: string) => api.get<ResultadoExame>(`/api/solicitacoes-exame/${id}/resultado`).then(r => r.data),
}
