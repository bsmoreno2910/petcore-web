import api from './cliente'
import type { RespostaPaginada } from '@/types/comum'

export interface Paciente {
  id: string
  clinicaId: string
  tutorId: string
  nomeTutor: string
  especieId: string
  nomeEspecie: string
  racaId?: string
  nomeRaca?: string
  nome: string
  sexo: string
  dataNascimento?: string
  peso?: number
  cor?: string
  microchip?: string
  castrado: boolean
  alergias?: string
  observacoes?: string
  fotoUrl?: string
  ativo: boolean
  obito: boolean
  criadoEm: string
}

export interface PacienteDetalhe extends Paciente {
  telefoneTutor?: string
  emailTutor?: string
  dataObito?: string
}

export interface ItemLinhaTempo {
  tipo: string
  data: string
  id: string
  descricao: string
}

export const pacientesApi = {
  listar: (params: Record<string, unknown>) =>
    api.get<RespostaPaginada<Paciente>>('/api/pacientes', { params }).then(r => r.data),
  obterPorId: (id: string) =>
    api.get<PacienteDetalhe>(`/api/pacientes/${id}`).then(r => r.data),
  criar: (data: Record<string, unknown>) =>
    api.post('/api/pacientes', data).then(r => r.data),
  atualizar: (id: string, data: Record<string, unknown>) =>
    api.put(`/api/pacientes/${id}`, data).then(r => r.data),
  listarProntuarios: (id: string) =>
    api.get(`/api/pacientes/${id}/prontuarios`).then(r => r.data),
  listarExames: (id: string) =>
    api.get(`/api/pacientes/${id}/exames`).then(r => r.data),
  listarInternacoes: (id: string) =>
    api.get(`/api/pacientes/${id}/internacoes`).then(r => r.data),
  linhaTempo: (id: string) =>
    api.get<ItemLinhaTempo[]>(`/api/pacientes/${id}/linha-do-tempo`).then(r => r.data),
}
