import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { movementsApi, type Movement } from '@/api/movements.api'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ExportButton } from '@/components/shared/ExportButton'
import { formatDateTime } from '@/lib/utils'

export default function MovementsPage() {
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [moveType, setMoveType] = useState<'entry' | 'exit' | 'adjustment' | 'loss'>('entry')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['movements', page, typeFilter],
    queryFn: () => movementsApi.list({ page, pageSize: 20, type: typeFilter || undefined }),
  })

  const [form, setForm] = useState({ productId: '', quantity: 1, reason: '', notes: '' })

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => movementsApi[moveType](data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['movements'] }); setShowForm(false); toast.success('Movimentação registrada!') },
    onError: (e: Error & { response?: { data?: { error?: string } } }) => toast.error(e.response?.data?.error || 'Erro na movimentação'),
  })

  const columns = [
    { key: 'createdAt', header: 'Data', render: (m: Movement) => formatDateTime(m.createdAt) },
    { key: 'productName', header: 'Produto' },
    { key: 'type', header: 'Tipo', render: (m: Movement) => <StatusBadge status={m.type} /> },
    { key: 'quantity', header: 'Qtd', className: 'text-center' },
    { key: 'previousStock', header: 'Anterior', className: 'text-center' },
    { key: 'newStock', header: 'Novo', className: 'text-center' },
    { key: 'reason', header: 'Motivo', render: (m: Movement) => m.reason || '—' },
    { key: 'createdByName', header: 'Usuário' },
  ]

  const openForm = (type: typeof moveType) => { setMoveType(type); setForm({ productId: '', quantity: 1, reason: '', notes: '' }); setShowForm(true) }

  return (
    <div>
      <PageHeader title="Movimentações" description="Entradas, saídas e ajustes de estoque"
        actions={<div className="flex gap-2">
          <ExportButton url="/api/movements/export" filename="PetCore_Movimentacoes.xlsx" />
          <button onClick={() => openForm('entry')} className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"><Plus size={14} /> Entrada</button>
          <button onClick={() => openForm('exit')} className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"><Plus size={14} /> Saída</button>
          <button onClick={() => openForm('adjustment')} className="inline-flex items-center gap-2 px-3 py-2 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700"><Plus size={14} /> Ajuste</button>
        </div>}
      />

      <div className="mb-4">
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }} className="px-3 py-2 border border-input rounded-lg text-sm bg-background">
          <option value="">Todos os tipos</option>
          <option value="Entry">Entrada</option>
          <option value="Exit">Saída</option>
          <option value="Adjustment">Ajuste</option>
          <option value="Loss">Perda</option>
          <option value="Return">Devolução</option>
        </select>
      </div>

      <DataTable columns={columns} data={data?.items ?? []} page={page}
        totalPages={data ? Math.ceil(data.totalCount / data.pageSize) : 1}
        onPageChange={setPage} loading={isLoading} />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl shadow-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Nova {moveType === 'entry' ? 'Entrada' : moveType === 'exit' ? 'Saída' : moveType === 'adjustment' ? 'Ajuste' : 'Perda'}</h3>
            <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form) }} className="space-y-3">
              <input required placeholder="ID do Produto *" value={form.productId} onChange={e => setForm({ ...form, productId: e.target.value })} className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
              <input required type="number" min={1} placeholder="Quantidade *" value={form.quantity} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
              <input placeholder="Motivo" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
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
