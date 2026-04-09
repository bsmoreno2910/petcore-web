import api from './cliente'
import type { RespostaPaginada } from '@/types/comum'

export interface Agendamento {
  id: string
  clinicaId: string
  pacienteId: string
  nomePaciente: string
  nomeTutor: string
  telefoneTutor?: string
  nomeEspecie: string
  veterinarioId?: string
  nomeVeterinario?: string
  tipo: string
  status: string
  dataHoraAgendada: string
  duracaoMinutos: number
  iniciadoEm?: string
  finalizadoEm?: string
  motivo?: string
  observacoes?: string
  motivoCancelamento?: string
  criadoEm: string
}

export interface EventoCalendario {
  id: string
  titulo: string
  inicio: string
  fim: string
  cor?: string
  tipo: string
  status: string
  pacienteId: string
  veterinarioId?: string
}

export interface HorarioDisponivel {
  inicio: string
  fim: string
}

export const agendamentosApi = {
  listar: (params: Record<string, unknown>) =>
    api.get<RespostaPaginada<Agendamento>>('/api/agendamentos', { params }).then(r => r.data),
  calendario: (dataInicio: string, dataFim: string) =>
    api.get<EventoCalendario[]>('/api/agendamentos/calendario', { params: { dataInicio, dataFim } }).then(r => r.data),
  obterPorId: (id: string) =>
    api.get<Agendamento>(`/api/agendamentos/${id}`).then(r => r.data),
  criar: (data: Record<string, unknown>) =>
    api.post('/api/agendamentos', data).then(r => r.data),
  atualizar: (id: string, data: Record<string, unknown>) =>
    api.put(`/api/agendamentos/${id}`, data).then(r => r.data),
  confirmar: (id: string) => api.patch(`/api/agendamentos/${id}/confirmar`).then(r => r.data),
  checkin: (id: string) => api.patch(`/api/agendamentos/${id}/checkin`).then(r => r.data),
  iniciar: (id: string) => api.patch(`/api/agendamentos/${id}/iniciar`).then(r => r.data),
  concluir: (id: string) => api.patch(`/api/agendamentos/${id}/concluir`).then(r => r.data),
  cancelar: (id: string, motivoCancelamento?: string) =>
    api.patch(`/api/agendamentos/${id}/cancelar`, { motivoCancelamento }).then(r => r.data),
  faltou: (id: string) => api.patch(`/api/agendamentos/${id}/faltou`).then(r => r.data),
  horariosDisponiveis: (veterinarioId: string, data: string, duracao?: number) =>
    api.get<HorarioDisponivel[]>('/api/agendamentos/horarios-disponiveis', { params: { veterinarioId, data, duracao } }).then(r => r.data),
}
