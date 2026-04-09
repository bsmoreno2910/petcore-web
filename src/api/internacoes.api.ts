import api from './cliente'
import type { RespostaPaginada } from '@/types/comum'

export interface Internacao {
  id: string
  pacienteId: string
  nomePaciente: string
  nomeTutor: string
  nomeEspecie: string
  veterinarioId: string
  nomeVeterinario: string
  status: string
  motivo?: string
  baia?: string
  dieta?: string
  observacoes?: string
  dataInternacao: string
  dataAlta?: string
  observacoesAlta?: string
  criadoEm: string
  quantidadeEvolucoes: number
}

export interface Evolucao {
  id: string
  internacaoId: string
  veterinarioId: string
  nomeVeterinario: string
  peso?: number
  temperatura?: number
  frequenciaCardiaca?: number
  frequenciaRespiratoria?: number
  descricao?: string
  medicamentos?: string
  alimentacao?: string
  observacoes?: string
  criadoEm: string
}

export const internacoesApi = {
  listar: (params: Record<string, unknown>) =>
    api.get<RespostaPaginada<Internacao>>('/api/internacoes', { params }).then(r => r.data),
  obterPorId: (id: string) =>
    api.get<Internacao>(`/api/internacoes/${id}`).then(r => r.data),
  criar: (data: Record<string, unknown>) =>
    api.post('/api/internacoes', data).then(r => r.data),
  darAlta: (id: string, observacoesAlta?: string) =>
    api.patch(`/api/internacoes/${id}/dar-alta`, { observacoesAlta }).then(r => r.data),
  adicionarEvolucao: (id: string, data: Record<string, unknown>) =>
    api.post(`/api/internacoes/${id}/evolucoes`, data).then(r => r.data),
  listarEvolucoes: (id: string) =>
    api.get<Evolucao[]>(`/api/internacoes/${id}/evolucoes`).then(r => r.data),
}
