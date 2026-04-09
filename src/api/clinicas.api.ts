import api from './cliente'
import type { Clinica, ClinicaUsuario } from '@/types/clinica'

export const clinicasApi = {
  listar: () => api.get<Clinica[]>('/api/clinicas').then(r => r.data),
  obterPorId: (id: string) => api.get<Clinica>(`/api/clinicas/${id}`).then(r => r.data),
  criar: (data: Record<string, unknown>) => api.post('/api/clinicas', data).then(r => r.data),
  atualizar: (id: string, data: Record<string, unknown>) => api.put(`/api/clinicas/${id}`, data).then(r => r.data),
  alternarStatus: (id: string) => api.patch(`/api/clinicas/${id}/alternar-status`).then(r => r.data),
  listarUsuarios: (id: string) => api.get<ClinicaUsuario[]>(`/api/clinicas/${id}/usuarios`).then(r => r.data),
  adicionarUsuario: (id: string, data: { usuarioId: string; perfil: string }) => api.post(`/api/clinicas/${id}/usuarios`, data).then(r => r.data),
  removerUsuario: (id: string, usuarioId: string) => api.delete(`/api/clinicas/${id}/usuarios/${usuarioId}`),
}
