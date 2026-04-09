import api from './cliente'
import type { ResumoDashboard, AlertaEstoque } from '@/types/painel'

export interface ReceitaDespesaMensal {
  mes: string
  receita: number
  despesa: number
}

export interface AgendamentoPorTipo {
  tipo: string
  quantidade: number
}

export const dashboardApi = {
  resumo: () => api.get<ResumoDashboard>('/api/dashboard/resumo').then(r => r.data),
  alertasEstoque: () => api.get<AlertaEstoque[]>('/api/dashboard/alertas-estoque').then(r => r.data),
  receitaDespesaMensal: () => api.get<ReceitaDespesaMensal[]>('/api/dashboard/receita-despesa-mensal').then(r => r.data),
  agendamentosPorTipo: () => api.get<AgendamentoPorTipo[]>('/api/dashboard/agendamentos-por-tipo').then(r => r.data),
}
