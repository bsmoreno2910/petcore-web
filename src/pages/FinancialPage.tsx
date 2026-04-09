import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, DollarSign, TrendingUp, TrendingDown, Clock, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { financeiroApi, type TransacaoFinanceira } from '@/api/financial.api'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { MoneyDisplay } from '@/components/shared/MoneyDisplay'
import { formatDate, formatCurrency } from '@/lib/utils'

function SummaryCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
      <div className={`p-2.5 rounded-lg ${color}`}><Icon size={18} className="text-white" /></div>
      <div><p className="text-xs text-muted-foreground">{label}</p><p className="text-lg font-bold">{value}</p></div>
    </div>
  )
}

export default function FinancialPage() {
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const qc = useQueryClient()

  const { data: summary } = useQuery({ queryKey: ['financeiro-resumo'], queryFn: financeiroApi.resumo })
  const { data: categories } = useQuery({ queryKey: ['financeiro-categorias'], queryFn: financeiroApi.listarCategorias })

  const { data, isLoading } = useQuery({
    queryKey: ['financeiro', page, typeFilter, statusFilter],
    queryFn: () => financeiroApi.listar({ pagina: page, tamanhoPagina: 20, tipo: typeFilter || undefined, status: statusFilter || undefined }),
  })

  const [form, setForm] = useState({ tipo: 'Revenue', categoriaFinanceiraId: '', descricao: '', valor: 0, dataVencimento: '', tutorId: '', numeroParcelas: 1 })

  const createMutation = useMutation({
    mutationFn: financeiroApi.criar,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['financeiro'] }); qc.invalidateQueries({ queryKey: ['financeiro-resumo'] }); setShowForm(false); toast.success('Transação criada!') },
    onError: () => toast.error('Erro ao criar transação'),
  })

  const payMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => financeiroApi.pagar(id, {}),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['financeiro'] }); qc.invalidateQueries({ queryKey: ['financeiro-resumo'] }); toast.success('Pagamento registrado!') },
  })

  const columns = [
    { key: 'dataVencimento', header: 'Vencimento', render: (t: TransacaoFinanceira) => formatDate(t.dataVencimento) },
    { key: 'descricao', header: 'Descrição' },
    { key: 'tipo', header: 'Tipo', render: (t: TransacaoFinanceira) => <StatusBadge status={t.tipo} /> },
    { key: 'nomeCategoriaFinanceira', header: 'Categoria' },
    { key: 'valor', header: 'Valor', render: (t: TransacaoFinanceira) => <MoneyDisplay value={t.valor} /> },
    { key: 'status', header: 'Status', render: (t: TransacaoFinanceira) => <StatusBadge status={t.status} /> },
    { key: 'actions', header: '', render: (t: TransacaoFinanceira) =>
      t.status === 'Pending' ? (
        <button onClick={(e) => { e.stopPropagation(); payMutation.mutate({ id: t.id }) }}
          className="px-2 py-1 bg-green-500 text-white rounded text-xs">Pagar</button>
      ) : null
    },
  ]

  return (
    <div>
      <PageHeader title="Financeiro" description="Contas a pagar e receber"
        actions={<button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:opacity-90">
          <Plus size={16} /> Nova Transação
        </button>}
      />

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <SummaryCard icon={TrendingUp} label="Receitas" value={formatCurrency(summary.totalReceita)} color="bg-green-500" />
          <SummaryCard icon={TrendingDown} label="Despesas" value={formatCurrency(summary.totalDespesa)} color="bg-red-500" />
          <SummaryCard icon={DollarSign} label="Saldo" value={formatCurrency(summary.saldo)} color="bg-blue-500" />
          <SummaryCard icon={Clock} label="Pendente" value={formatCurrency(summary.totalPendente)} color="bg-yellow-500" />
          <SummaryCard icon={AlertTriangle} label="Vencido" value={formatCurrency(summary.totalAtrasado)} color="bg-orange-500" />
        </div>
      )}

      <div className="flex gap-3 mb-4">
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }} className="px-3 py-2 border border-input rounded-lg text-sm bg-background">
          <option value="">Todos os tipos</option>
          <option value="Revenue">Receitas</option>
          <option value="Expense">Despesas</option>
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className="px-3 py-2 border border-input rounded-lg text-sm bg-background">
          <option value="">Todos os status</option>
          <option value="Pending">Pendente</option>
          <option value="Paid">Pago</option>
          <option value="Overdue">Vencido</option>
          <option value="Cancelled">Cancelado</option>
        </select>
      </div>

      <DataTable columns={columns} data={data?.itens ?? []} page={page}
        totalPages={data ? Math.ceil(data.totalRegistros / data.tamanhoPagina) : 1}
        onPageChange={setPage} loading={isLoading} />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl shadow-lg p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-semibold mb-4">Nova Transação</h3>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate({ ...form, numeroParcelas: form.numeroParcelas > 1 ? form.numeroParcelas : undefined }) }} className="space-y-3">
              <select required value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} className="w-full px-3 py-2 border border-input rounded-lg text-sm">
                <option value="Revenue">Receita</option>
                <option value="Expense">Despesa</option>
              </select>
              <select required value={form.categoriaFinanceiraId} onChange={e => setForm({ ...form, categoriaFinanceiraId: e.target.value })} className="w-full px-3 py-2 border border-input rounded-lg text-sm">
                <option value="">Categoria *</option>
                {categories?.filter(c => c.tipo === form.tipo).map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
              <input required placeholder="Descrição *" value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input required type="number" step="0.01" placeholder="Valor *" value={form.valor} onChange={e => setForm({ ...form, valor: Number(e.target.value) })} className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
                <input required type="date" value={form.dataVencimento} onChange={e => setForm({ ...form, dataVencimento: e.target.value })} className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="ID do Tutor (opcional)" value={form.tutorId} onChange={e => setForm({ ...form, tutorId: e.target.value })} className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
                <input type="number" min={1} placeholder="Parcelas" value={form.numeroParcelas} onChange={e => setForm({ ...form, numeroParcelas: Number(e.target.value) })} className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-border rounded-lg text-sm">Cancelar</button>
                <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium">{createMutation.isPending ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
