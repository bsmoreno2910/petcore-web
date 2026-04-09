import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Plus, Heart, Thermometer, Wind, Activity } from 'lucide-react'
import { toast } from 'sonner'
import { internacoesApi } from '@/api/hospitalizations.api'
import type { Evolucao } from '@/api/hospitalizations.api'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate, formatDateTime } from '@/lib/utils'

export default function HospitalizationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [showEvolForm, setShowEvolForm] = useState(false)
  const [showAltaModal, setShowAltaModal] = useState(false)
  const [observacoesAlta, setObservacoesAlta] = useState('')
  const [evolForm, setEvolForm] = useState({
    peso: '' as string | number,
    temperatura: '' as string | number,
    frequenciaCardiaca: '' as string | number,
    frequenciaRespiratoria: '' as string | number,
    descricao: '',
    medicamentos: '',
    alimentacao: '',
    observacoes: '',
  })

  const { data: internacao, isLoading } = useQuery({
    queryKey: ['internacao', id],
    queryFn: () => internacoesApi.obterPorId(id!),
    enabled: !!id,
  })

  const { data: evolucoes } = useQuery({
    queryKey: ['internacao-evolucoes', id],
    queryFn: () => internacoesApi.listarEvolucoes(id!),
    enabled: !!id,
  })

  const addEvolMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => internacoesApi.adicionarEvolucao(id!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['internacao-evolucoes', id] })
      qc.invalidateQueries({ queryKey: ['internacao', id] })
      setShowEvolForm(false)
      setEvolForm({ peso: '', temperatura: '', frequenciaCardiaca: '', frequenciaRespiratoria: '', descricao: '', medicamentos: '', alimentacao: '', observacoes: '' })
      toast.success('Evolucao registrada!')
    },
    onError: () => toast.error('Erro ao registrar evolucao'),
  })

  const altaMutation = useMutation({
    mutationFn: (obs?: string) => internacoesApi.darAlta(id!, obs),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['internacao', id] })
      setShowAltaModal(false)
      setObservacoesAlta('')
      toast.success('Alta registrada com sucesso!')
    },
    onError: () => toast.error('Erro ao dar alta'),
  })

  if (isLoading || !internacao) return <div className="text-muted-foreground">Carregando...</div>

  return (
    <div>
      <PageHeader
        title={`Internacao - ${internacao.nomePaciente}`}
        description={`Tutor: ${internacao.nomeTutor} | Especie: ${internacao.nomeEspecie}`}
        actions={
          <div className="flex items-center gap-2">
            {internacao.status === 'Ativo' && (
              <>
                <button
                  onClick={() => setShowEvolForm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:opacity-90"
                >
                  <Plus size={16} /> Nova Evolucao
                </button>
                <button
                  onClick={() => setShowAltaModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:opacity-90"
                >
                  Dar Alta
                </button>
              </>
            )}
            <button onClick={() => navigate('/internacoes')} className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm hover:bg-secondary">
              <ArrowLeft size={16} /> Voltar
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info da internacao */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold mb-3">Dados da Internacao</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Status:</span>
                <StatusBadge status={internacao.status} />
              </div>
              <p><span className="text-muted-foreground">Veterinario:</span> {internacao.nomeVeterinario}</p>
              <p><span className="text-muted-foreground">Internado em:</span> {formatDateTime(internacao.dataInternacao)}</p>
              {internacao.dataAlta && (
                <p><span className="text-muted-foreground">Alta em:</span> {formatDateTime(internacao.dataAlta)}</p>
              )}
              <p><span className="text-muted-foreground">Motivo:</span> {internacao.motivo || '---'}</p>
              <p><span className="text-muted-foreground">Baia:</span> {internacao.baia || '---'}</p>
              <p><span className="text-muted-foreground">Dieta:</span> {internacao.dieta || '---'}</p>
              {internacao.observacoes && (
                <p><span className="text-muted-foreground">Observacoes:</span> {internacao.observacoes}</p>
              )}
              {internacao.observacoesAlta && (
                <p><span className="text-muted-foreground">Obs. Alta:</span> {internacao.observacoesAlta}</p>
              )}
            </div>
          </div>
        </div>

        {/* Evolucoes */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold mb-4">Evolucoes ({evolucoes?.length ?? 0})</h3>

            {!evolucoes || evolucoes.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhuma evolucao registrada.</p>
            ) : (
              <div className="space-y-4">
                {evolucoes.map((evol: Evolucao) => (
                  <div key={evol.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">{evol.nomeVeterinario}</span>
                      <span className="text-xs text-muted-foreground">{formatDateTime(evol.criadoEm)}</span>
                    </div>

                    {/* Sinais vitais */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                      <div className="flex items-center gap-1.5 text-xs p-2 bg-secondary rounded">
                        <Activity size={12} className="text-blue-500" />
                        <span className="text-muted-foreground">Peso:</span>
                        <span className="font-medium">{evol.peso ? `${evol.peso} kg` : '---'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs p-2 bg-secondary rounded">
                        <Thermometer size={12} className="text-red-500" />
                        <span className="text-muted-foreground">Temp:</span>
                        <span className="font-medium">{evol.temperatura ? `${evol.temperatura} C` : '---'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs p-2 bg-secondary rounded">
                        <Heart size={12} className="text-pink-500" />
                        <span className="text-muted-foreground">FC:</span>
                        <span className="font-medium">{evol.frequenciaCardiaca ? `${evol.frequenciaCardiaca} bpm` : '---'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs p-2 bg-secondary rounded">
                        <Wind size={12} className="text-cyan-500" />
                        <span className="text-muted-foreground">FR:</span>
                        <span className="font-medium">{evol.frequenciaRespiratoria ? `${evol.frequenciaRespiratoria} mpm` : '---'}</span>
                      </div>
                    </div>

                    <div className="text-sm space-y-1">
                      {evol.descricao && <p><span className="text-muted-foreground">Descricao:</span> {evol.descricao}</p>}
                      {evol.medicamentos && <p><span className="text-muted-foreground">Medicamentos:</span> {evol.medicamentos}</p>}
                      {evol.alimentacao && <p><span className="text-muted-foreground">Alimentacao:</span> {evol.alimentacao}</p>}
                      {evol.observacoes && <p><span className="text-muted-foreground">Observacoes:</span> {evol.observacoes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de nova evolucao */}
      {showEvolForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl shadow-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Nova Evolucao</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                addEvolMutation.mutate({
                  peso: evolForm.peso ? Number(evolForm.peso) : undefined,
                  temperatura: evolForm.temperatura ? Number(evolForm.temperatura) : undefined,
                  frequenciaCardiaca: evolForm.frequenciaCardiaca ? Number(evolForm.frequenciaCardiaca) : undefined,
                  frequenciaRespiratoria: evolForm.frequenciaRespiratoria ? Number(evolForm.frequenciaRespiratoria) : undefined,
                  descricao: evolForm.descricao || undefined,
                  medicamentos: evolForm.medicamentos || undefined,
                  alimentacao: evolForm.alimentacao || undefined,
                  observacoes: evolForm.observacoes || undefined,
                })
              }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Peso (kg)</label>
                  <input type="number" step="0.01" placeholder="Peso" value={evolForm.peso} onChange={(e) => setEvolForm({ ...evolForm, peso: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Temperatura (C)</label>
                  <input type="number" step="0.1" placeholder="Temperatura" value={evolForm.temperatura} onChange={(e) => setEvolForm({ ...evolForm, temperatura: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Freq. Cardiaca (bpm)</label>
                  <input type="number" placeholder="FC" value={evolForm.frequenciaCardiaca} onChange={(e) => setEvolForm({ ...evolForm, frequenciaCardiaca: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Freq. Respiratoria (mpm)</label>
                  <input type="number" placeholder="FR" value={evolForm.frequenciaRespiratoria} onChange={(e) => setEvolForm({ ...evolForm, frequenciaRespiratoria: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descricao</label>
                <textarea placeholder="Descricao da evolucao" value={evolForm.descricao} onChange={(e) => setEvolForm({ ...evolForm, descricao: e.target.value })}
                  rows={3} className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Medicamentos</label>
                <textarea placeholder="Medicamentos administrados" value={evolForm.medicamentos} onChange={(e) => setEvolForm({ ...evolForm, medicamentos: e.target.value })}
                  rows={2} className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Alimentacao</label>
                <input placeholder="Alimentacao" value={evolForm.alimentacao} onChange={(e) => setEvolForm({ ...evolForm, alimentacao: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Observacoes</label>
                <textarea placeholder="Observacoes" value={evolForm.observacoes} onChange={(e) => setEvolForm({ ...evolForm, observacoes: e.target.value })}
                  rows={2} className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowEvolForm(false)} className="px-4 py-2 border border-border rounded-lg text-sm">Cancelar</button>
                <button type="submit" disabled={addEvolMutation.isPending} className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium disabled:opacity-50">
                  {addEvolMutation.isPending ? 'Salvando...' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de alta */}
      {showAltaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl shadow-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Dar Alta</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Confirmar alta do paciente <strong>{internacao.nomePaciente}</strong>?
            </p>
            <textarea
              placeholder="Observacoes da alta (opcional)"
              value={observacoesAlta}
              onChange={(e) => setObservacoesAlta(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-input rounded-lg text-sm mb-4"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowAltaModal(false); setObservacoesAlta('') }} className="px-4 py-2 border border-border rounded-lg text-sm">
                Cancelar
              </button>
              <button
                onClick={() => altaMutation.mutate(observacoesAlta || undefined)}
                disabled={altaMutation.isPending}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium"
              >
                {altaMutation.isPending ? 'Processando...' : 'Confirmar Alta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
