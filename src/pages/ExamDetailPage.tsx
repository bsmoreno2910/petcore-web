import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { examesApi } from '@/api/exams.api'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate, formatDateTime } from '@/lib/utils'

export default function ExamDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [showResultForm, setShowResultForm] = useState(false)
  const [resultForm, setResultForm] = useState({
    textoResultado: '',
    conclusao: '',
    valoresReferencia: '',
    observacoes: '',
  })

  const { data: exame, isLoading } = useQuery({
    queryKey: ['exame', id],
    queryFn: () => examesApi.obterPorId(id!),
    enabled: !!id,
  })

  const coletarMutation = useMutation({
    mutationFn: () => examesApi.coletar(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exame', id] })
      toast.success('Coleta registrada!')
    },
    onError: () => toast.error('Erro ao registrar coleta'),
  })

  const cancelarMutation = useMutation({
    mutationFn: () => examesApi.cancelar(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exame', id] })
      toast.success('Exame cancelado!')
    },
    onError: () => toast.error('Erro ao cancelar exame'),
  })

  const addResultMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => examesApi.adicionarResultado(id!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exame', id] })
      setShowResultForm(false)
      setResultForm({ textoResultado: '', conclusao: '', valoresReferencia: '', observacoes: '' })
      toast.success('Resultado adicionado!')
    },
    onError: () => toast.error('Erro ao adicionar resultado'),
  })

  if (isLoading || !exame) return <div className="text-muted-foreground">Carregando...</div>

  return (
    <div>
      <PageHeader
        title={`Exame - ${exame.nomeTipoExame}`}
        description={`Paciente: ${exame.nomePaciente} | Tutor: ${exame.nomeTutor}`}
        actions={
          <button onClick={() => navigate('/exames')} className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm hover:bg-secondary">
            <ArrowLeft size={16} /> Voltar
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dados do exame */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold mb-3">Dados da Solicitacao</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Status:</span>
                <StatusBadge status={exame.status} />
              </div>
              <p><span className="text-muted-foreground">Tipo:</span> {exame.nomeTipoExame}</p>
              {exame.categoriaTipoExame && (
                <p><span className="text-muted-foreground">Categoria:</span> {exame.categoriaTipoExame}</p>
              )}
              <p><span className="text-muted-foreground">Solicitante:</span> {exame.nomeSolicitante}</p>
              {exame.indicacaoClinica && (
                <p><span className="text-muted-foreground">Indicacao Clinica:</span> {exame.indicacaoClinica}</p>
              )}
              {exame.observacoes && (
                <p><span className="text-muted-foreground">Observacoes:</span> {exame.observacoes}</p>
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold mb-3">Datas</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Solicitacao:</span> {formatDateTime(exame.dataSolicitacao)}</p>
              {exame.dataColeta && (
                <p><span className="text-muted-foreground">Coleta:</span> {formatDateTime(exame.dataColeta)}</p>
              )}
              {exame.dataConclusao && (
                <p><span className="text-muted-foreground">Conclusao:</span> {formatDateTime(exame.dataConclusao)}</p>
              )}
            </div>
          </div>

          {/* Acoes */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold mb-3">Acoes</h3>
            <div className="flex flex-wrap gap-2">
              {exame.status === 'Solicitado' && (
                <button
                  onClick={() => coletarMutation.mutate()}
                  disabled={coletarMutation.isPending}
                  className="px-3 py-1.5 bg-indigo-500 text-white rounded text-xs font-medium"
                >
                  {coletarMutation.isPending ? 'Registrando...' : 'Registrar Coleta'}
                </button>
              )}
              {(exame.status === 'AmostraColetada' || exame.status === 'Processando') && !exame.resultado && (
                <button
                  onClick={() => setShowResultForm(true)}
                  className="px-3 py-1.5 bg-green-500 text-white rounded text-xs font-medium"
                >
                  Adicionar Resultado
                </button>
              )}
              {!['Concluido', 'Cancelado'].includes(exame.status) && (
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

        {/* Resultado */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold mb-4">Resultado</h3>

            {exame.resultado ? (
              <div className="space-y-4">
                <div className="text-sm space-y-2">
                  <p><span className="text-muted-foreground">Realizado por:</span> {exame.resultado.nomeRealizadoPor}</p>
                  <p><span className="text-muted-foreground">Data:</span> {formatDateTime(exame.resultado.criadoEm)}</p>
                </div>

                {exame.resultado.textoResultado && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Texto do Resultado</p>
                    <div className="p-3 bg-secondary rounded-lg text-sm whitespace-pre-wrap">
                      {exame.resultado.textoResultado}
                    </div>
                  </div>
                )}

                {exame.resultado.conclusao && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Conclusao</p>
                    <div className="p-3 bg-secondary rounded-lg text-sm whitespace-pre-wrap">
                      {exame.resultado.conclusao}
                    </div>
                  </div>
                )}

                {exame.resultado.valoresReferencia && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Valores de Referencia</p>
                    <div className="p-3 bg-secondary rounded-lg text-sm whitespace-pre-wrap">
                      {exame.resultado.valoresReferencia}
                    </div>
                  </div>
                )}

                {exame.resultado.observacoes && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Observacoes</p>
                    <div className="p-3 bg-secondary rounded-lg text-sm whitespace-pre-wrap">
                      {exame.resultado.observacoes}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Resultado ainda nao disponivel.</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal de resultado */}
      {showResultForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl shadow-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Adicionar Resultado</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                addResultMutation.mutate({
                  textoResultado: resultForm.textoResultado || undefined,
                  conclusao: resultForm.conclusao || undefined,
                  valoresReferencia: resultForm.valoresReferencia || undefined,
                  observacoes: resultForm.observacoes || undefined,
                })
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Texto do Resultado</label>
                <textarea
                  placeholder="Descreva os resultados do exame"
                  value={resultForm.textoResultado}
                  onChange={(e) => setResultForm({ ...resultForm, textoResultado: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-input rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Conclusao</label>
                <textarea
                  placeholder="Conclusao do exame"
                  value={resultForm.conclusao}
                  onChange={(e) => setResultForm({ ...resultForm, conclusao: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-input rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Valores de Referencia</label>
                <textarea
                  placeholder="Valores de referencia"
                  value={resultForm.valoresReferencia}
                  onChange={(e) => setResultForm({ ...resultForm, valoresReferencia: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-input rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Observacoes</label>
                <textarea
                  placeholder="Observacoes adicionais"
                  value={resultForm.observacoes}
                  onChange={(e) => setResultForm({ ...resultForm, observacoes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-input rounded-lg text-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowResultForm(false)} className="px-4 py-2 border border-border rounded-lg text-sm">
                  Cancelar
                </button>
                <button type="submit" disabled={addResultMutation.isPending} className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium disabled:opacity-50">
                  {addResultMutation.isPending ? 'Salvando...' : 'Salvar Resultado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
