import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { pedidosApi } from '@/api/orders.api'
import type { ItemPedido } from '@/api/orders.api'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDateTime } from '@/lib/utils'

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: pedido, isLoading } = useQuery({
    queryKey: ['pedido', id],
    queryFn: () => pedidosApi.obterPorId(id!),
    enabled: !!id,
  })

  const enviarMutation = useMutation({
    mutationFn: () => pedidosApi.enviar(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pedido', id] })
      toast.success('Pedido enviado para aprovacao!')
    },
    onError: () => toast.error('Erro ao enviar pedido'),
  })

  const aprovarMutation = useMutation({
    mutationFn: () => pedidosApi.aprovar(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pedido', id] })
      toast.success('Pedido aprovado!')
    },
    onError: () => toast.error('Erro ao aprovar pedido'),
  })

  const cancelarMutation = useMutation({
    mutationFn: () => pedidosApi.cancelar(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pedido', id] })
      toast.success('Pedido cancelado!')
    },
    onError: () => toast.error('Erro ao cancelar pedido'),
  })

  if (isLoading || !pedido) return <div className="text-muted-foreground">Carregando...</div>

  return (
    <div>
      <PageHeader
        title={`Pedido ${pedido.codigo}`}
        description={`Tipo: ${pedido.tipo} | Criado por: ${pedido.nomeCriadoPor}`}
        actions={
          <button onClick={() => navigate('/pedidos')} className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm hover:bg-secondary">
            <ArrowLeft size={16} /> Voltar
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dados do pedido */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold mb-3">Dados do Pedido</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Status:</span>
                <StatusBadge status={pedido.status} />
              </div>
              <p><span className="text-muted-foreground">Codigo:</span> {pedido.codigo}</p>
              <p><span className="text-muted-foreground">Tipo:</span> {pedido.tipo}</p>
              {pedido.periodo && (
                <p><span className="text-muted-foreground">Periodo:</span> {pedido.periodo}</p>
              )}
              {pedido.justificativa && (
                <p><span className="text-muted-foreground">Justificativa:</span> {pedido.justificativa}</p>
              )}
              {pedido.observacoes && (
                <p><span className="text-muted-foreground">Observacoes:</span> {pedido.observacoes}</p>
              )}
              <p><span className="text-muted-foreground">Criado por:</span> {pedido.nomeCriadoPor}</p>
              <p><span className="text-muted-foreground">Criado em:</span> {formatDateTime(pedido.criadoEm)}</p>
              {pedido.nomeAprovadoPor && (
                <p><span className="text-muted-foreground">Aprovado por:</span> {pedido.nomeAprovadoPor}</p>
              )}
              {pedido.dataAprovacao && (
                <p><span className="text-muted-foreground">Data aprovacao:</span> {formatDateTime(pedido.dataAprovacao)}</p>
              )}
            </div>
          </div>

          {/* Acoes */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold mb-3">Acoes</h3>
            <div className="flex flex-wrap gap-2">
              {pedido.status === 'Rascunho' && (
                <button
                  onClick={() => enviarMutation.mutate()}
                  disabled={enviarMutation.isPending}
                  className="px-3 py-1.5 bg-blue-500 text-white rounded text-xs font-medium"
                >
                  {enviarMutation.isPending ? 'Enviando...' : 'Enviar para Aprovacao'}
                </button>
              )}
              {pedido.status === 'Pendente' && (
                <button
                  onClick={() => aprovarMutation.mutate()}
                  disabled={aprovarMutation.isPending}
                  className="px-3 py-1.5 bg-green-500 text-white rounded text-xs font-medium"
                >
                  {aprovarMutation.isPending ? 'Aprovando...' : 'Aprovar'}
                </button>
              )}
              {!['Cancelado', 'Recebido'].includes(pedido.status) && (
                <button
                  onClick={() => cancelarMutation.mutate()}
                  disabled={cancelarMutation.isPending}
                  className="px-3 py-1.5 bg-red-500 text-white rounded text-xs font-medium"
                >
                  {cancelarMutation.isPending ? 'Cancelando...' : 'Cancelar'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Itens do pedido */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold mb-4">Itens ({pedido.itens.length})</h3>

            {pedido.itens.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhum item neste pedido.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Produto</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Unidade</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">Solicitado</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">Aprovado</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">Recebido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedido.itens.map((item: ItemPedido) => (
                      <tr key={item.id} className="border-b border-border last:border-0">
                        <td className="py-2 px-3">{item.nomeProduto}</td>
                        <td className="py-2 px-3">{item.siglaUnidade}</td>
                        <td className="py-2 px-3 text-right">{item.quantidadeSolicitada}</td>
                        <td className="py-2 px-3 text-right">{item.quantidadeAprovada ?? '---'}</td>
                        <td className="py-2 px-3 text-right">{item.quantidadeRecebida}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
