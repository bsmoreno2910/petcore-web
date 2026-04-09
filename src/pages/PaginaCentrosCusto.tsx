import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { centrosCustoApi, type ResumoCentroCusto } from '@/api/centros-custo.api'
import { PageHeader } from '@/components/shared/CabecalhoPagina'
import { MoneyDisplay } from '@/components/shared/ExibicaoMonetaria'
import { ExportButton } from '@/components/shared/BotaoExportar'

export default function CostCentersPage() {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nome: '', descricao: '' })
  const qc = useQueryClient()

  const { data: report, isLoading } = useQuery({ queryKey: ['centros-custo-relatorio'], queryFn: centrosCustoApi.relatorio })

  const createMutation = useMutation({
    mutationFn: centrosCustoApi.criar,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['centros-custo'] }); setShowForm(false); toast.success('Centro de custo criado!') },
  })

  return (
    <div>
      <PageHeader title="Centros de Custo" description="Controle de custos por setor"
        actions={<div className="flex gap-2">
          <ExportButton url="/api/relatorios/centros-custo" filename="PetCore_CentrosCusto.xlsx" />
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:opacity-90">
            <Plus size={16} /> Novo Centro
          </button>
        </div>}
      />

      {isLoading ? <p className="text-muted-foreground">Carregando...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {report?.map((cc: ResumoCentroCusto) => (
            <div key={cc.centroCustoId} className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold mb-3">{cc.nomeCentroCusto}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Receitas</span>
                  <MoneyDisplay value={cc.totalReceita} colorize />
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Despesas</span>
                  <MoneyDisplay value={-cc.totalDespesa} colorize />
                </div>
                <div className="flex justify-between border-t border-border pt-2 font-medium">
                  <span>Saldo</span>
                  <MoneyDisplay value={cc.saldo} colorize />
                </div>
                <p className="text-xs text-muted-foreground">{cc.totalTransacoes} transações</p>
              </div>
            </div>
          ))}
          {report?.length === 0 && <p className="text-muted-foreground col-span-full text-center py-8">Nenhum centro de custo cadastrado.</p>}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl shadow-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Novo Centro de Custo</h3>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form) }} className="space-y-3">
              <input required placeholder="Nome *" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
              <input placeholder="Descrição" value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
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
