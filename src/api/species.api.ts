import api from './client'

export interface Especie {
  id: string
  nome: string
  ativo: boolean
  racas: Raca[]
}

export interface Raca {
  id: string
  especieId: string
  nome: string
  ativo: boolean
}

export const especiesApi = {
  listar: () => api.get<Especie[]>('/api/especies').then(r => r.data),
  criar: (nome: string) => api.post('/api/especies', { nome }).then(r => r.data),
  listarRacas: (especieId: string) => api.get<Raca[]>(`/api/especies/${especieId}/racas`).then(r => r.data),
  criarRaca: (especieId: string, nome: string) => api.post(`/api/especies/${especieId}/racas`, { nome }).then(r => r.data),
}
