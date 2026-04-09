import api from './cliente'
import type { RespostaPaginada } from '@/types/comum'

export interface Tutor {
  id: string
  clinicaId: string
  nome: string
  cpf?: string
  rg?: string
  telefone?: string
  telefoneSecundario?: string
  email?: string
  rua?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
  cep?: string
  observacoes?: string
  ativo: boolean
  criadoEm: string
  quantidadePacientes: number
}

export interface TutorDetalhe extends Tutor {
  pacientes: { id: string; nome: string; nomeEspecie: string; nomeRaca?: string; ativo: boolean }[]
}

export interface ResumoFinanceiroTutor {
  totalReceita: number
  totalPago: number
  totalPendente: number
  totalAtrasado: number
}

export const tutoresApi = {
  listar: (params: Record<string, unknown>) =>
    api.get<RespostaPaginada<Tutor>>('/api/tutores', { params }).then(r => r.data),
  obterPorId: (id: string) =>
    api.get<TutorDetalhe>(`/api/tutores/${id}`).then(r => r.data),
  criar: (data: Record<string, unknown>) =>
    api.post('/api/tutores', data).then(r => r.data),
  atualizar: (id: string, data: Record<string, unknown>) =>
    api.put(`/api/tutores/${id}`, data).then(r => r.data),
  listarPacientes: (id: string) =>
    api.get(`/api/tutores/${id}/pacientes`).then(r => r.data),
  resumoFinanceiro: (id: string) =>
    api.get<ResumoFinanceiroTutor>(`/api/tutores/${id}/resumo-financeiro`).then(r => r.data),
}
