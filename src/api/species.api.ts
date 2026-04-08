import api from './client'

export interface Species {
  id: string; name: string; active: boolean; breeds: Breed[]
}
export interface Breed {
  id: string; speciesId: string; name: string; active: boolean
}

export const speciesApi = {
  list: () => api.get<Species[]>('/api/species').then(r => r.data),
  create: (name: string) => api.post('/api/species', { name }).then(r => r.data),
  breeds: (speciesId: string) => api.get<Breed[]>(`/api/species/${speciesId}/breeds`).then(r => r.data),
  createBreed: (speciesId: string, name: string) => api.post(`/api/species/${speciesId}/breeds`, { name }).then(r => r.data),
}
