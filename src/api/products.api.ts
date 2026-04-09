import api from './client'
import type { RespostaPaginada } from '@/types/common'

export interface CategoriaProduto {
  id: string
  nome: string
  descricao?: string
  cor?: string
  ativo: boolean
}

export interface UnidadeProduto {
  id: string
  sigla: string
  nome: string
}

export interface Produto {
  id: string
  clinicaId: string
  categoriaId: string
  nomeCategoria: string
  corCategoria?: string
  unidadeId: string
  siglaUnidade: string
  nome: string
  apresentacao?: string
  estoqueAtual: number
  estoqueMinimo: number
  estoqueMaximo?: number
  precoCusto?: number
  precoVenda?: number
  localizacao?: string
  codigoBarras?: string
  lote?: string
  dataValidade?: string
  ativo: boolean
  observacoes?: string
  criadoEm: string
  statusEstoque: string
}

export const produtosApi = {
  listarCategorias: () => api.get<CategoriaProduto[]>('/api/categorias-produto').then(r => r.data),
  criarCategoria: (data: Record<string, unknown>) => api.post('/api/categorias-produto', data).then(r => r.data),
  atualizarCategoria: (id: string, data: Record<string, unknown>) => api.put(`/api/categorias-produto/${id}`, data).then(r => r.data),
  listarUnidades: () => api.get<UnidadeProduto[]>('/api/unidades-produto').then(r => r.data),
  criarUnidade: (data: Record<string, unknown>) => api.post('/api/unidades-produto', data).then(r => r.data),
  listar: (params: Record<string, unknown>) =>
    api.get<RespostaPaginada<Produto>>('/api/produtos', { params }).then(r => r.data),
  obterPorId: (id: string) => api.get<Produto>(`/api/produtos/${id}`).then(r => r.data),
  criar: (data: Record<string, unknown>) => api.post('/api/produtos', data).then(r => r.data),
  atualizar: (id: string, data: Record<string, unknown>) => api.put(`/api/produtos/${id}`, data).then(r => r.data),
  excluir: (id: string) => api.delete(`/api/produtos/${id}`),
  estoqueBaixo: () => api.get<Produto[]>('/api/produtos/estoque-baixo').then(r => r.data),
  estoqueZerado: () => api.get<Produto[]>('/api/produtos/estoque-zerado').then(r => r.data),
  vencimentoProximo: (dias?: number) => api.get<Produto[]>('/api/produtos/vencimento-proximo', { params: { dias } }).then(r => r.data),
}
