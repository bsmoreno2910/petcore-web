import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { productsApi, type Product } from '@/api/products.api'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { SearchInput } from '@/components/shared/SearchInput'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ExportButton } from '@/components/shared/ExportButton'
import { formatCurrency } from '@/lib/utils'

export default function ProductsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [stockFilter, setStockFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['products', page, search, categoryFilter, stockFilter],
    queryFn: () => productsApi.list({ page, pageSize: 20, search: search || undefined, categoryId: categoryFilter || undefined, stockStatus: stockFilter || undefined }),
  })

  const { data: categories } = useQuery({ queryKey: ['product-categories'], queryFn: productsApi.categories })
  const { data: units } = useQuery({ queryKey: ['product-units'], queryFn: productsApi.units })

  const [form, setForm] = useState({ name: '', categoryId: '', unitId: '', currentStock: 0, minStock: 0, costPrice: 0, sellingPrice: 0 })

  const createMutation = useMutation({
    mutationFn: productsApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); setShowForm(false); toast.success('Produto cadastrado!') },
    onError: () => toast.error('Erro ao cadastrar produto'),
  })

  const columns = [
    { key: 'name', header: 'Produto' },
    { key: 'categoryName', header: 'Categoria' },
    { key: 'currentStock', header: 'Estoque', className: 'text-center' },
    { key: 'minStock', header: 'Mín.', className: 'text-center' },
    { key: 'costPrice', header: 'Custo', render: (p: Product) => p.costPrice ? formatCurrency(p.costPrice) : '—' },
    { key: 'sellingPrice', header: 'Venda', render: (p: Product) => p.sellingPrice ? formatCurrency(p.sellingPrice) : '—' },
    { key: 'stockStatus', header: 'Status', render: (p: Product) => <StatusBadge status={p.stockStatus} /> },
  ]

  return (
    <div>
      <PageHeader title="Produtos" description="Almoxarifado"
        actions={<div className="flex gap-2">
          <ExportButton url="/api/products/export" filename="PetCore_Produtos.xlsx" />
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:opacity-90">
            <Plus size={16} /> Novo Produto
          </button>
        </div>}
      />

      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="max-w-sm flex-1"><SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Buscar produto..." /></div>
        <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1) }} className="px-3 py-2 border border-input rounded-lg text-sm bg-background">
          <option value="">Todas categorias</option>
          {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={stockFilter} onChange={e => { setStockFilter(e.target.value); setPage(1) }} className="px-3 py-2 border border-input rounded-lg text-sm bg-background">
          <option value="">Todo estoque</option>
          <option value="zero">Zerado</option>
          <option value="low">Baixo</option>
          <option value="ok">Normal</option>
        </select>
      </div>

      <DataTable columns={columns} data={data?.items ?? []} page={page}
        totalPages={data ? Math.ceil(data.totalCount / data.pageSize) : 1}
        onPageChange={setPage} loading={isLoading} />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl shadow-lg p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-semibold mb-4">Novo Produto</h3>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form) }} className="space-y-3">
              <input required placeholder="Nome do produto *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <select required value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} className="w-full px-3 py-2 border border-input rounded-lg text-sm">
                  <option value="">Categoria *</option>
                  {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select required value={form.unitId} onChange={e => setForm({ ...form, unitId: e.target.value })} className="w-full px-3 py-2 border border-input rounded-lg text-sm">
                  <option value="">Unidade *</option>
                  {units?.map(u => <option key={u.id} value={u.id}>{u.name} ({u.abbreviation})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Estoque inicial" value={form.currentStock} onChange={e => setForm({ ...form, currentStock: Number(e.target.value) })} className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
                <input type="number" placeholder="Estoque mínimo" value={form.minStock} onChange={e => setForm({ ...form, minStock: Number(e.target.value) })} className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" step="0.01" placeholder="Preço de custo" value={form.costPrice} onChange={e => setForm({ ...form, costPrice: Number(e.target.value) })} className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
                <input type="number" step="0.01" placeholder="Preço de venda" value={form.sellingPrice} onChange={e => setForm({ ...form, sellingPrice: Number(e.target.value) })} className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
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
