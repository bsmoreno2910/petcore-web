export interface ResumoDashboard {
  totalPacientes: number
  totalTutores: number
  agendamentosHoje: number
  internacoesAtivas: number
  examesPendentes: number
  produtosEstoqueBaixo: number
  receitaMensal: number
  despesaMensal: number
}

export interface AlertaEstoque {
  produtoId: string
  nomeProduto: string
  nomeCategoria: string
  estoqueAtual: number
  estoqueMinimo: number
  tipoAlerta: string
  dataValidade?: string
}
