import api from './client'
import type { Usuario } from '@/types/user'

export const usuariosApi = {
  listar: () => api.get<Usuario[]>('/api/usuarios').then(r => r.data),
  obterPorId: (id: string) => api.get<Usuario>(`/api/usuarios/${id}`).then(r => r.data),
  criar: (data: Record<string, unknown>) => api.post('/api/usuarios', data).then(r => r.data),
  atualizar: (id: string, data: Record<string, unknown>) => api.put(`/api/usuarios/${id}`, data).then(r => r.data),
  alternarStatus: (id: string) => api.patch(`/api/usuarios/${id}/alternar-status`).then(r => r.data),
}
