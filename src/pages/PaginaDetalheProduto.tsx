import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { produtosApi } from '@/api/produtos.api'
import { PageHeader } from '@/components/shared/CabecalhoPagina'
import { StatusBadge } from '@/components/shared/BadgeStatus'
import { formatDate, formatCurrency } from '@/lib/utilitarios'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: produto, isLoading } = useQuery({
    queryKey: ['produto', id],
    queryFn: () => produtosApi.obterPorId(id!),
    enabled: !!id,
  })

  if (isLoading || !produto) return <div className="text-muted-foreground">Carregando...</div>

  return (
    <div>
      <PageHeader
        title={produto.nome}
        description={`Categoria: ${produto.nomeCategoria} | Unidade: ${produto.siglaUnidade}`}
        actions={
          <button onClick={() => navigate('/produtos')} className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm hover:bg-secondary">
            <ArrowLeft size={16} /> Voltar
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dados gerais */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold mb-3">Informações Gerais</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Nome:</span> {produto.nome}</p>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Categoria:</span>
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                  style={produto.corCategoria ? { backgroundColor: `${produto.corCategoria}20`, color: produto.corCategoria } : undefined}
                >
                  {produto.nomeCategoria}
                </span>
              </div>
              <p><span className="text-muted-foreground">Unidade:</span> {produto.siglaUnidade}</p>
              {produto.apresentacao && (
                <p><span className="text-muted-foreground">Apresentação:</span> {produto.apresentacao}</p>
              )}
              {produto.codigoBarras && (
                <p><span className="text-muted-foreground">Código de Barras:</span> {produto.codigoBarras}</p>
              )}
              {produto.lote && (
                <p><span className="text-muted-foreground">Lote:</span> {produto.lote}</p>
              )}
              {produto.dataValidade && (
                <p><span className="text-muted-foreground">Validade:</span> {formatDate(produto.dataValidade)}</p>
              )}
              {produto.localizacao && (
                <p><span className="text-muted-foreground">Localização:</span> {produto.localizacao}</p>
              )}
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Status:</span>
                <StatusBadge status={produto.ativo ? 'Ativo' : 'Inativo'} />
              </div>
            </div>
          </div>

          {/* Precos */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold mb-3">Preços</h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Preço de Custo:</span>{' '}
                {produto.precoCusto != null ? formatCurrency(produto.precoCusto) : '---'}
              </p>
              <p>
                <span className="text-muted-foreground">Preço de Venda:</span>{' '}
                {produto.precoVenda != null ? formatCurrency(produto.precoVenda) : '---'}
              </p>
              {produto.precoCusto != null && produto.precoVenda != null && produto.precoCusto > 0 && (
                <p>
                  <span className="text-muted-foreground">Margem:</span>{' '}
                  {(((produto.precoVenda - produto.precoCusto) / produto.precoCusto) * 100).toFixed(1)}%
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Estoque */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold mb-4">Estoque</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-secondary rounded-lg text-center">
                <p className="text-2xl font-bold">{produto.estoqueAtual}</p>
                <p className="text-xs text-muted-foreground mt-1">Atual</p>
              </div>
              <div className="p-4 bg-secondary rounded-lg text-center">
                <p className="text-2xl font-bold">{produto.estoqueMinimo}</p>
                <p className="text-xs text-muted-foreground mt-1">Mínimo</p>
              </div>
              <div className="p-4 bg-secondary rounded-lg text-center">
                <p className="text-2xl font-bold">{produto.estoqueMaximo ?? '---'}</p>
                <p className="text-xs text-muted-foreground mt-1">Máximo</p>
              </div>
              <div className="p-4 bg-secondary rounded-lg text-center">
                <StatusBadge status={produto.statusEstoque} />
                <p className="text-xs text-muted-foreground mt-2">Status</p>
              </div>
            </div>

            {/* Barra visual do estoque */}
            {produto.estoqueMaximo && produto.estoqueMaximo > 0 && (
              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>0</span>
                  <span>Min: {produto.estoqueMinimo}</span>
                  <span>Max: {produto.estoqueMaximo}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      produto.statusEstoque === 'Zerado' ? 'bg-red-500' :
                      produto.statusEstoque === 'Baixo' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((produto.estoqueAtual / produto.estoqueMaximo) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {produto.observacoes && (
              <div className="mt-4 text-sm">
                <p className="text-muted-foreground mb-1">Observações</p>
                <p>{produto.observacoes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
