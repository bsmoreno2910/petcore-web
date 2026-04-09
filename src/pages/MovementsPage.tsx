import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { movimentacoesApi, type Movimentacao } from '@/api/movements.api'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ExportButton } from '@/components/shared/ExportButton'
import { ProdutoSearch } from '@/components/shared/ProdutoSearch'
import { formatDateTime } from '@/lib/utils'

export default function MovementsPage() {
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [moveType, setMoveType] = useState<'entrada' | 'saida' | 'ajuste' | 'perda'>('entrada')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['movimentacoes', page, typeFilter],
    queryFn: () => movimentacoesApi.listar({ pagina: page, tamanhoPagina: 20, tipo: typeFilter || undefined }),
  })

  const [form, setForm] = useState({ produtoId: '', quantidade: 1, motivo: '', observacoes: '' })

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => movimentacoesApi[moveType](data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['movimentacoes'] }); setShowForm(false); toast.success('Movimentação registrada!') },
    onError: (e: Error & { response?: { data?: { error?: string } } }) => toast.error(e.response?.data?.error || 'Erro na movimentação'),
  })

  const columns = [
    { key: 'criadoEm', header: 'Data', render: (m: Movimentacao) => formatDateTime(m.criadoEm) },
    { key: 'nomeProduto', header: 'Produto' },
    { key: 'tipo', header: 'Tipo', render: (m: Movimentacao) => <StatusBadge status={m.tipo} /> },
    { key: 'quantidade', header: 'Qtd', className: 'text-center' },
    { key: 'estoqueAnterior', header: 'Anterior', className: 'text-center' },
    { key: 'novoEstoque', header: 'Novo', className: 'text-center' },
    { key: 'motivo', header: 'Motivo', render: (m: Movimentacao) => m.motivo || '—' },
    { key: 'nomeCriadoPor', header: 'Usuário' },
  ]

  const [produtoSelecionado, setProdutoSelecionado] = useState<{ id: string; nome: string } | null>(null)

  const openForm = (type: typeof moveType) => { setMoveType(type); setForm({ produtoId: '', quantidade: 1, motivo: '', observacoes: '' }); setProdutoSelecionado(null); setShowForm(true) }

  return (
    <div>
      <PageHeader title="Movimentações" description="Entradas, saídas e ajustes de estoque"
        actions={<div className="flex gap-2">
          <ExportButton url="/api/movimentacoes/export" filename="PetCore_Movimentacoes.xlsx" />
          <button onClick={() => openForm('entrada')} className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"><Plus size={14} /> Entrada</button>
          <button onClick={() => openForm('saida')} className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"><Plus size={14} /> Saída</button>
          <button onClick={() => openForm('ajuste')} className="inline-flex items-center gap-2 px-3 py-2 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700"><Plus size={14} /> Ajuste</button>
        </div>}
      />

      <div className="mb-4">
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }} className="px-3 py-2 border border-input rounded-lg text-sm bg-background">
          <option value="">Todos os tipos</option>
          <option value="Entrada">Entrada</option>
          <option value="Saida">Saída</option>
          <option value="Ajuste">Ajuste</option>
          <option value="Perda">Perda</option>
          <option value="Devolucao">Devolução</option>
        </select>
      </div>

      <DataTable columns={columns} data={data?.itens ?? []} page={page}
        totalPages={data ? Math.ceil(data.totalRegistros / data.tamanhoPagina) : 1}
        onPageChange={setPage} loading={isLoading} />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl shadow-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Nova {moveType === 'entrada' ? 'Entrada' : moveType === 'saida' ? 'Saída' : moveType === 'ajuste' ? 'Ajuste' : 'Perda'}</h3>
            <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form) }} className="space-y-3">
              <ProdutoSearch value={produtoSelecionado} onChange={(p) => { setProdutoSelecionado(p); setForm({ ...form, produtoId: p?.id ?? '' }) }} />
              <input required type="number" min={1} placeholder="Quantidade *" value={form.quantidade} onChange={e => setForm({ ...form, quantidade: Number(e.target.value) })} className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
              <input placeholder="Motivo" value={form.motivo} onChange={e => setForm({ ...form, motivo: e.target.value })} className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-border rounded-lg text-sm">Cancelar</button>
                <button type="submit" disabled={mutation.isPending} className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium">{mutation.isPending ? 'Salvando...' : 'Registrar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
