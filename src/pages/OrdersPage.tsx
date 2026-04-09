import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Send, Check, PackageCheck, X } from 'lucide-react'
import { toast } from 'sonner'
import { pedidosApi, type Pedido } from '@/api/orders.api'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ExportButton } from '@/components/shared/ExportButton'
import { formatDate } from '@/lib/utils'

export default function OrdersPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const qc = useQueryClient()

  const { data: orders, isLoading } = useQuery({ queryKey: ['pedidos'], queryFn: pedidosApi.listar })
  const { data: order } = useQuery({ queryKey: ['pedido', selectedId], queryFn: () => pedidosApi.obterPorId(selectedId!), enabled: !!selectedId })

  const submitMut = useMutation({ mutationFn: pedidosApi.enviar, onSuccess: () => { qc.invalidateQueries({ queryKey: ['pedidos'] }); qc.invalidateQueries({ queryKey: ['pedido'] }); toast.success('Pedido submetido!') } })
  const approveMut = useMutation({ mutationFn: pedidosApi.aprovar, onSuccess: () => { qc.invalidateQueries({ queryKey: ['pedidos'] }); qc.invalidateQueries({ queryKey: ['pedido'] }); toast.success('Pedido aprovado!') } })
  const cancelMut = useMutation({ mutationFn: pedidosApi.cancelar, onSuccess: () => { qc.invalidateQueries({ queryKey: ['pedidos'] }); qc.invalidateQueries({ queryKey: ['pedido'] }); toast.success('Pedido cancelado!') } })

  return (
    <div>
      <PageHeader title="Pedidos" description="Pedidos de reposição de estoque"
        actions={<button className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:opacity-90"><Plus size={16} /> Novo Pedido</button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {isLoading ? <p className="text-muted-foreground">Carregando...</p> : (
            <div className="space-y-2">
              {orders?.map(o => (
                <button key={o.id} onClick={() => setSelectedId(o.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-colors ${selectedId === o.id ? 'border-accent bg-accent/5' : 'border-border bg-card hover:bg-secondary'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono font-medium text-sm">{o.codigo}</span>
                      <span className="text-muted-foreground text-xs ml-2">({o.tipo})</span>
                    </div>
                    <StatusBadge status={o.status} />
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                    <span>{o.nomeCriadoPor}</span>
                    <span>{formatDate(o.criadoEm)}</span>
                  </div>
                </button>
              ))}
              {orders?.length === 0 && <p className="text-muted-foreground text-center py-8">Nenhum pedido encontrado.</p>}
            </div>
          )}
        </div>

        <div>
          {order ? (
            <div className="bg-card border border-border rounded-xl p-5 space-y-4 sticky top-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold font-mono">{order.codigo}</h3>
                <ExportButton url={`/api/pedidos/${order.id}/export`} filename={`Pedido_${order.codigo}.xlsx`} label="Excel" />
              </div>
              <StatusBadge status={order.status} />
              <div className="text-sm space-y-1">
                <p><span className="text-muted-foreground">Tipo:</span> {order.tipo}</p>
                <p><span className="text-muted-foreground">Criado por:</span> {order.nomeCriadoPor}</p>
                {order.nomeAprovadoPor && <p><span className="text-muted-foreground">Aprovado por:</span> {order.nomeAprovadoPor}</p>}
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Itens ({order.itens.length})</h4>
                <div className="space-y-1">
                  {order.itens.map(item => (
                    <div key={item.id} className="flex justify-between text-xs p-2 bg-muted rounded">
                      <span>{item.nomeProduto}</span>
                      <span className="font-mono">{item.quantidadeRecebida}/{item.quantidadeAprovada ?? item.quantidadeSolicitada} {item.siglaUnidade}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {order.status === 'Draft' && (
                  <button onClick={() => submitMut.mutate(order.id)} className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded text-xs"><Send size={12} /> Submeter</button>
                )}
                {order.status === 'Pending' && (
                  <button onClick={() => approveMut.mutate(order.id)} className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded text-xs"><Check size={12} /> Aprovar</button>
                )}
                {(order.status === 'Approved' || order.status === 'PartiallyReceived') && (
                  <button className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-500 text-white rounded text-xs"><PackageCheck size={12} /> Receber</button>
                )}
                {order.status !== 'Received' && order.status !== 'Cancelled' && (
                  <button onClick={() => cancelMut.mutate(order.id)} className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded text-xs"><X size={12} /> Cancelar</button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl p-5 text-center text-muted-foreground text-sm">
              Selecione um pedido para ver detalhes
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
