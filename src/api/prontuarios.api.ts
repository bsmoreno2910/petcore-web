import api from './cliente'
import type { RespostaPaginada } from '@/types/comum'

export interface Prontuario {
  id: string
  clinicaId: string
  pacienteId: string
  nomePaciente: string
  veterinarioId: string
  nomeVeterinario: string
  agendamentoId?: string
  queixaPrincipal?: string
  historico?: string
  anamnese?: string
  peso?: number
  temperatura?: number
  frequenciaCardiaca?: number
  frequenciaRespiratoria?: number
  exameFisico?: string
  mucosas?: string
  hidratacao?: string
  linfonodos?: string
  diagnostico?: string
  diagnosticoDiferencial?: string
  tratamento?: string
  observacoes?: string
  notasInternas?: string
  criadoEm: string
  atualizadoEm: string
  prescricoes: Prescricao[]
}

export interface Prescricao {
  id: string
  prontuarioId: string
  nomeMedicamento: string
  dosagem?: string
  frequencia?: string
  duracao?: string
  viaAdministracao?: string
  instrucoes?: string
  quantidade?: number
  criadoEm: string
}

export const prontuariosApi = {
  listar: (params: Record<string, unknown>) =>
    api.get<RespostaPaginada<Prontuario>>('/api/prontuarios', { params }).then(r => r.data),
  obterPorId: (id: string) =>
    api.get<Prontuario>(`/api/prontuarios/${id}`).then(r => r.data),
  criar: (data: Record<string, unknown>) =>
    api.post('/api/prontuarios', data).then(r => r.data),
  adicionarPrescricao: (id: string, data: Record<string, unknown>) =>
    api.post(`/api/prontuarios/${id}/prescricoes`, data).then(r => r.data),
  removerPrescricao: (id: string, prescId: string) =>
    api.delete(`/api/prontuarios/${id}/prescricoes/${prescId}`),
}
