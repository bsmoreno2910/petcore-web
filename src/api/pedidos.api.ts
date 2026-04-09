import api from './cliente'

export interface Pedido {
  id: string
  clinicaId: string
  codigo: string
  tipo: string
  status: string
  periodo?: string
  observacoes?: string
  justificativa?: string
  criadoPorId: string
  nomeCriadoPor: string
  aprovadoPorId?: string
  nomeAprovadoPor?: string
  dataAprovacao?: string
  criadoEm: string
  itens: ItemPedido[]
}

export interface ItemPedido {
  id: string
  produtoId: string
  nomeProduto: string
  siglaUnidade: string
  quantidadeSolicitada: number
  quantidadeAprovada?: number
  quantidadeRecebida: number
  observacoes?: string
}

export const pedidosApi = {
  listar: () => api.get<Pedido[]>('/api/pedidos').then(r => r.data),
  obterPorId: (id: string) => api.get<Pedido>(`/api/pedidos/${id}`).then(r => r.data),
  criar: (data: Record<string, unknown>) => api.post('/api/pedidos', data).then(r => r.data),
  enviar: (id: string) => api.patch(`/api/pedidos/${id}/enviar`).then(r => r.data),
  aprovar: (id: string) => api.patch(`/api/pedidos/${id}/aprovar`).then(r => r.data),
  receber: (id: string, itens: { itemId: string; quantidadeRecebida: number }[]) =>
    api.patch(`/api/pedidos/${id}/receber`, { itens }).then(r => r.data),
  cancelar: (id: string) => api.patch(`/api/pedidos/${id}/cancelar`).then(r => r.data),
}
