export interface RespostaPaginada<T> {
  itens: T[]
  totalRegistros: number
  pagina: number
  tamanhoPagina: number
  totalPaginas: number
  temPaginaAnterior: boolean
  temProximaPagina: boolean
}

export interface RequisicaoPaginada {
  pagina?: number
  tamanhoPagina?: number
  busca?: string
}
