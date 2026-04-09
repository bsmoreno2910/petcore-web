import { useState } from 'react'
import {
  Package, ArrowLeftRight, Calendar, PawPrint, Users, Bed, FlaskConical,
  TrendingUp, TrendingDown, DollarSign, AlertTriangle, PieChart, UserCircle, Building2,
} from 'lucide-react'
import { reportsApi } from '@/api/reports.api'
import { PageHeader } from '@/components/shared/PageHeader'

interface CartaoRelatorio {
  title: string
  description: string
  icon: React.ElementType
  color: string
  action: (params: Record<string, unknown>) => Promise<void>
  filters?: { key: string; label: string; type: 'date' | 'text' }[]
}

const relatorios: CartaoRelatorio[] = [
  { title: 'Inventário Atual', description: 'Estoque completo com resumo por categoria', icon: Package, color: 'bg-blue-500', action: reportsApi.inventory },
  { title: 'Movimentações de Estoque', description: 'Entradas, saídas e ajustes por período', icon: ArrowLeftRight, color: 'bg-indigo-500', action: reportsApi.stockMovements,
    filters: [{ key: 'dataInicio', label: 'Data início', type: 'date' }, { key: 'dataFim', label: 'Data fim', type: 'date' }] },
  { title: 'Atendimentos', description: 'Consultas e procedimentos realizados', icon: Calendar, color: 'bg-cyan-500', action: reportsApi.appointments,
    filters: [{ key: 'dataInicio', label: 'Data início', type: 'date' }, { key: 'dataFim', label: 'Data fim', type: 'date' }] },
  { title: 'Pacientes', description: 'Cadastro completo de animais', icon: PawPrint, color: 'bg-green-500', action: reportsApi.patients },
  { title: 'Tutores', description: 'Cadastro de proprietários', icon: Users, color: 'bg-teal-500', action: reportsApi.tutors },
  { title: 'Internações', description: 'Internações por período e status', icon: Bed, color: 'bg-yellow-500', action: reportsApi.hospitalizations,
    filters: [{ key: 'dataInicio', label: 'Data início', type: 'date' }, { key: 'dataFim', label: 'Data fim', type: 'date' }] },
  { title: 'Exames', description: 'Solicitações e resultados de exames', icon: FlaskConical, color: 'bg-purple-500', action: reportsApi.exams,
    filters: [{ key: 'dataInicio', label: 'Data início', type: 'date' }, { key: 'dataFim', label: 'Data fim', type: 'date' }] },
  { title: 'Receitas', description: 'Receitas por período e categoria', icon: TrendingUp, color: 'bg-green-600', action: reportsApi.financialRevenue,
    filters: [{ key: 'dataInicio', label: 'Data início', type: 'date' }, { key: 'dataFim', label: 'Data fim', type: 'date' }] },
  { title: 'Despesas', description: 'Despesas por período e categoria', icon: TrendingDown, color: 'bg-red-500', action: reportsApi.financialExpenses,
    filters: [{ key: 'dataInicio', label: 'Data início', type: 'date' }, { key: 'dataFim', label: 'Data fim', type: 'date' }] },
  { title: 'Fluxo de Caixa', description: 'Receitas x Despesas diárias com saldo', icon: DollarSign, color: 'bg-blue-600', action: reportsApi.financialCashflow,
    filters: [{ key: 'dataInicio', label: 'Data início', type: 'date' }, { key: 'dataFim', label: 'Data fim', type: 'date' }] },
  { title: 'Inadimplência', description: 'Contas vencidas e devedores', icon: AlertTriangle, color: 'bg-orange-500', action: reportsApi.financialOverdue },
  { title: 'Por Categoria Financeira', description: 'Receitas e despesas agrupadas', icon: PieChart, color: 'bg-pink-500', action: reportsApi.financialByCategory,
    filters: [{ key: 'dataInicio', label: 'Data início', type: 'date' }, { key: 'dataFim', label: 'Data fim', type: 'date' }] },
  { title: 'Por Tutor', description: 'Faturamento por proprietário', icon: UserCircle, color: 'bg-violet-500', action: reportsApi.financialByTutor,
    filters: [{ key: 'dataInicio', label: 'Data início', type: 'date' }, { key: 'dataFim', label: 'Data fim', type: 'date' }] },
  { title: 'Centros de Custo', description: 'Custos comparativos por setor', icon: Building2, color: 'bg-slate-600', action: reportsApi.costCenters,
    filters: [{ key: 'dataInicio', label: 'Data início', type: 'date' }, { key: 'dataFim', label: 'Data fim', type: 'date' }] },
]

function CartaoRelatorioComponent({ report }: { report: CartaoRelatorio }) {
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<Record<string, string>>({})

  const handleExport = async () => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(filters)) { if (v) params[k] = v }
      await report.action(params)
    } catch { /* silent */ }
    finally { setLoading(false); setShowFilters(false) }
  }

  const Icon = report.icon

  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col">
      <div className="flex items-start gap-3 mb-3">
        <div className={`p-2.5 rounded-lg ${report.color}`}>
          <Icon size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm">{report.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{report.description}</p>
        </div>
      </div>

      {showFilters && report.filters && (
        <div className="space-y-2 mb-3">
          {report.filters.map(f => (
            <input key={f.key} type={f.type} placeholder={f.label}
              value={filters[f.key] || ''} onChange={e => setFilters({ ...filters, [f.key]: e.target.value })}
              className="w-full px-3 py-1.5 border border-input rounded-lg text-xs bg-background" />
          ))}
        </div>
      )}

      <div className="mt-auto flex gap-2">
        {report.filters && (
          <button onClick={() => setShowFilters(!showFilters)}
            className="px-3 py-1.5 border border-border rounded-lg text-xs hover:bg-secondary transition-colors">
            Filtros
          </button>
        )}
        <button onClick={handleExport} disabled={loading}
          className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 disabled:opacity-50 transition-colors">
          {loading ? 'Gerando...' : 'Exportar Excel'}
        </button>
      </div>
    </div>
  )
}

export default function ReportsPage() {
  return (
    <div>
      <PageHeader title="Relatórios" description="Exportações em Excel (.xlsx) com formatação profissional" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {relatorios.map(r => <CartaoRelatorioComponent key={r.title} report={r} />)}
      </div>
    </div>
  )
}
