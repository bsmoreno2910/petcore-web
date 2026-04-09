import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { produtosApi, type Produto } from '@/api/produtos.api'
import { PageHeader } from '@/components/shared/CabecalhoPagina'
import { DataTable } from '@/components/shared/TabelaDados'
import { SearchInput } from '@/components/shared/CampoBusca'
import { StatusBadge } from '@/components/shared/BadgeStatus'
import { ExportButton } from '@/components/shared/BotaoExportar'
import { formatCurrency } from '@/lib/utilitarios'

export default function ProductsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [stockFilter, setStockFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['produtos', page, search, categoryFilter, stockFilter],
    queryFn: () => produtosApi.listar({ pagina: page, tamanhoPagina: 20, busca: search || undefined, categoriaId: categoryFilter || undefined, statusEstoque: stockFilter || undefined }),
  })

  const { data: categories } = useQuery({ queryKey: ['categorias-produto'], queryFn: produtosApi.listarCategorias })
  const { data: units } = useQuery({ queryKey: ['unidades-produto'], queryFn: produtosApi.listarUnidades })

  const [form, setForm] = useState({ nome: '', categoriaId: '', unidadeId: '', estoqueAtual: 0, estoqueMinimo: 0, precoCusto: 0, precoVenda: 0 })

  const createMutation = useMutation({
    mutationFn: produtosApi.criar,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['produtos'] }); setShowForm(false); toast.success('Produto cadastrado!') },
    onError: () => toast.error('Erro ao cadastrar produto'),
  })

  const columns = [
    { key: 'nome', header: 'Produto' },
    { key: 'nomeCategoria', header: 'Categoria' },
    { key: 'estoqueAtual', header: 'Estoque', className: 'text-center' },
    { key: 'estoqueMinimo', header: 'Mín.', className: 'text-center' },
    { key: 'precoCusto', header: 'Custo', render: (p: Produto) => p.precoCusto ? formatCurrency(p.precoCusto) : '—' },
    { key: 'precoVenda', header: 'Venda', render: (p: Produto) => p.precoVenda ? formatCurrency(p.precoVenda) : '—' },
    { key: 'statusEstoque', header: 'Status', render: (p: Produto) => <StatusBadge status={p.statusEstoque} /> },
  ]

  return (
    <div>
      <PageHeader title="Produtos" description="Almoxarifado"
        actions={<div className="flex gap-2">
          <ExportButton url="/api/produtos/export" filename="PetCore_Produtos.xlsx" />
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:opacity-90">
            <Plus size={16} /> Novo Produto
          </button>
        </div>}
      />

      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="max-w-sm flex-1"><SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Buscar produto..." /></div>
        <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1) }} className="px-3 py-2 border border-input rounded-lg text-sm bg-background">
          <option value="">Todas categorias</option>
          {categories?.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
        <select value={stockFilter} onChange={e => { setStockFilter(e.target.value); setPage(1) }} className="px-3 py-2 border border-input rounded-lg text-sm bg-background">
          <option value="">Todo estoque</option>
          <option value="zerado">Zerado</option>
          <option value="baixo">Baixo</option>
          <option value="ok">Normal</option>
        </select>
      </div>

      <DataTable columns={columns} data={data?.itens ?? []} page={page}
        totalPages={data ? Math.ceil(data.totalRegistros / data.tamanhoPagina) : 1}
        onPageChange={setPage} loading={isLoading} />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl shadow-lg p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-semibold mb-4">Novo Produto</h3>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form) }} className="space-y-3">
              <input required placeholder="Nome do produto *" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <select required value={form.categoriaId} onChange={e => setForm({ ...form, categoriaId: e.target.value })} className="w-full px-3 py-2 border border-input rounded-lg text-sm">
                  <option value="">Categoria *</option>
                  {categories?.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
                <select required value={form.unidadeId} onChange={e => setForm({ ...form, unidadeId: e.target.value })} className="w-full px-3 py-2 border border-input rounded-lg text-sm">
                  <option value="">Unidade *</option>
                  {units?.map(u => <option key={u.id} value={u.id}>{u.nome} ({u.sigla})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Estoque inicial" value={form.estoqueAtual} onChange={e => setForm({ ...form, estoqueAtual: Number(e.target.value) })} className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
                <input type="number" placeholder="Estoque mínimo" value={form.estoqueMinimo} onChange={e => setForm({ ...form, estoqueMinimo: Number(e.target.value) })} className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" step="0.01" placeholder="Preço de custo" value={form.precoCusto} onChange={e => setForm({ ...form, precoCusto: Number(e.target.value) })} className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
                <input type="number" step="0.01" placeholder="Preço de venda" value={form.precoVenda} onChange={e => setForm({ ...form, precoVenda: Number(e.target.value) })} className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
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
