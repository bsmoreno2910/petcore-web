import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Plus, Trash2, Heart, Thermometer, Activity, Wind, Printer } from 'lucide-react'
import { toast } from 'sonner'
import { prontuariosApi } from '@/api/prontuarios.api'
import type { Prescricao } from '@/api/prontuarios.api'
import { PageHeader } from '@/components/shared/CabecalhoPagina'
import { ConfirmDialog } from '@/components/shared/ModalConfirmacao'
import { formatDate, formatDateTime } from '@/lib/utilitarios'

export default function MedicalRecordDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [showPrescForm, setShowPrescForm] = useState(false)
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null)
  const [prescForm, setPrescForm] = useState({
    nomeMedicamento: '',
    dosagem: '',
    frequencia: '',
    duracao: '',
    viaAdministracao: '',
    instrucoes: '',
    quantidade: '' as string | number,
  })

  const { data: prontuario, isLoading } = useQuery({
    queryKey: ['prontuario', id],
    queryFn: () => prontuariosApi.obterPorId(id!),
    enabled: !!id,
  })

  const addPrescMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => prontuariosApi.adicionarPrescricao(id!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['prontuario', id] })
      setShowPrescForm(false)
      setPrescForm({ nomeMedicamento: '', dosagem: '', frequencia: '', duracao: '', viaAdministracao: '', instrucoes: '', quantidade: '' })
      toast.success('Prescricao adicionada!')
    },
    onError: () => toast.error('Erro ao adicionar prescricao'),
  })

  const removePrescMutation = useMutation({
    mutationFn: (prescId: string) => prontuariosApi.removerPrescricao(id!, prescId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['prontuario', id] })
      toast.success('Prescricao removida!')
    },
    onError: () => toast.error('Erro ao remover prescricao'),
  })

  if (isLoading || !prontuario) return <div className="text-muted-foreground">Carregando...</div>

  return (
    <div>
      <PageHeader
        title="Prontuário"
        description={`Paciente: ${prontuario.nomePaciente} | Veterinário: ${prontuario.nomeVeterinario}`}
        actions={
          <div className="no-print flex items-center gap-2">
            <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm hover:bg-secondary">
              <Printer size={16} /> Imprimir
            </button>
            <button onClick={() => navigate('/prontuarios')} className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm hover:bg-secondary">
              <ArrowLeft size={16} /> Voltar
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna esquerda - Dados clinicos */}
        <div className="lg:col-span-2 space-y-4">
          {/* Queixa e diagnostico */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="font-semibold">Dados Clínicos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Queixa Principal</p>
                <p>{prontuario.queixaPrincipal || '---'}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Diagnóstico</p>
                <p>{prontuario.diagnostico || '---'}</p>
              </div>
              {prontuario.diagnosticoDiferencial && (
                <div>
                  <p className="text-muted-foreground mb-1">Diagnóstico Diferencial</p>
                  <p>{prontuario.diagnosticoDiferencial}</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground mb-1">Tratamento</p>
                <p>{prontuario.tratamento || '---'}</p>
              </div>
            </div>

            {prontuario.historico && (
              <div className="text-sm">
                <p className="text-muted-foreground mb-1">Histórico</p>
                <p>{prontuario.historico}</p>
              </div>
            )}

            {prontuario.anamnese && (
              <div className="text-sm">
                <p className="text-muted-foreground mb-1">Anamnese</p>
                <p>{prontuario.anamnese}</p>
              </div>
            )}

            {prontuario.exameFisico && (
              <div className="text-sm">
                <p className="text-muted-foreground mb-1">Exame Físico</p>
                <p>{prontuario.exameFisico}</p>
              </div>
            )}

            {prontuario.observacoes && (
              <div className="text-sm">
                <p className="text-muted-foreground mb-1">Observações</p>
                <p>{prontuario.observacoes}</p>
              </div>
            )}
          </div>

          {/* Prescricoes */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Prescrições</h3>
              <button
                onClick={() => setShowPrescForm(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent text-accent-foreground rounded-lg text-xs font-medium hover:opacity-90"
              >
                <Plus size={14} /> Adicionar
              </button>
            </div>

            {prontuario.prescricoes.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhuma prescrição registrada.</p>
            ) : (
              <div className="space-y-3">
                {prontuario.prescricoes.map((presc: Prescricao) => (
                  <div key={presc.id} className="flex items-start justify-between p-3 border border-border rounded-lg">
                    <div className="text-sm space-y-1">
                      <p className="font-medium">{presc.nomeMedicamento}</p>
                      {presc.dosagem && <p><span className="text-muted-foreground">Dosagem:</span> {presc.dosagem}</p>}
                      {presc.frequencia && <p><span className="text-muted-foreground">Frequência:</span> {presc.frequencia}</p>}
                      {presc.duracao && <p><span className="text-muted-foreground">Duração:</span> {presc.duracao}</p>}
                      {presc.viaAdministracao && <p><span className="text-muted-foreground">Via:</span> {presc.viaAdministracao}</p>}
                      {presc.quantidade && <p><span className="text-muted-foreground">Quantidade:</span> {presc.quantidade}</p>}
                      {presc.instrucoes && <p><span className="text-muted-foreground">Instruções:</span> {presc.instrucoes}</p>}
                    </div>
                    <button
                      onClick={() => setConfirmAction(() => () => removePrescMutation.mutate(presc.id))}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Remover prescrição"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Coluna direita - Sinais vitais e info */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold mb-3">Sinais Vitais</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                <Activity size={16} className="text-blue-500" />
                <div className="text-sm">
                  <p className="text-muted-foreground">Peso</p>
                  <p className="font-medium">{prontuario.peso ? `${prontuario.peso} kg` : '---'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                <Thermometer size={16} className="text-red-500" />
                <div className="text-sm">
                  <p className="text-muted-foreground">Temperatura</p>
                  <p className="font-medium">{prontuario.temperatura ? `${prontuario.temperatura} C` : '---'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                <Heart size={16} className="text-pink-500" />
                <div className="text-sm">
                  <p className="text-muted-foreground">FC</p>
                  <p className="font-medium">{prontuario.frequenciaCardiaca ? `${prontuario.frequenciaCardiaca} bpm` : '---'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                <Wind size={16} className="text-cyan-500" />
                <div className="text-sm">
                  <p className="text-muted-foreground">FR</p>
                  <p className="font-medium">{prontuario.frequenciaRespiratoria ? `${prontuario.frequenciaRespiratoria} mpm` : '---'}</p>
                </div>
              </div>
            </div>

            {(prontuario.mucosas || prontuario.hidratacao || prontuario.linfonodos) && (
              <div className="mt-4 space-y-2 text-sm">
                {prontuario.mucosas && <p><span className="text-muted-foreground">Mucosas:</span> {prontuario.mucosas}</p>}
                {prontuario.hidratacao && <p><span className="text-muted-foreground">Hidratação:</span> {prontuario.hidratacao}</p>}
                {prontuario.linfonodos && <p><span className="text-muted-foreground">Linfonodos:</span> {prontuario.linfonodos}</p>}
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold mb-3">Informações</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Criado em:</span> {formatDateTime(prontuario.criadoEm)}</p>
              <p><span className="text-muted-foreground">Atualizado em:</span> {formatDateTime(prontuario.atualizadoEm)}</p>
              {prontuario.agendamentoId && (
                <p><span className="text-muted-foreground">Agendamento vinculado:</span> Sim</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de nova prescricao */}
      {showPrescForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl shadow-lg p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-semibold mb-4">Nova Prescrição</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                addPrescMutation.mutate({
                  ...prescForm,
                  quantidade: prescForm.quantidade ? Number(prescForm.quantidade) : undefined,
                })
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Medicamento *</label>
                <input
                  required
                  placeholder="Nome do medicamento"
                  value={prescForm.nomeMedicamento}
                  onChange={(e) => setPrescForm({ ...prescForm, nomeMedicamento: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Dosagem</label>
                  <input
                    placeholder="Ex: 10mg/kg"
                    value={prescForm.dosagem}
                    onChange={(e) => setPrescForm({ ...prescForm, dosagem: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Frequência</label>
                  <input
                    placeholder="Ex: 2x ao dia"
                    value={prescForm.frequencia}
                    onChange={(e) => setPrescForm({ ...prescForm, frequencia: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Duração</label>
                  <input
                    placeholder="Ex: 7 dias"
                    value={prescForm.duracao}
                    onChange={(e) => setPrescForm({ ...prescForm, duracao: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Via de Administração</label>
                  <input
                    placeholder="Ex: Oral, IV"
                    value={prescForm.viaAdministracao}
                    onChange={(e) => setPrescForm({ ...prescForm, viaAdministracao: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Quantidade</label>
                  <input
                    type="number"
                    placeholder="Quantidade"
                    value={prescForm.quantidade}
                    onChange={(e) => setPrescForm({ ...prescForm, quantidade: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Instruções</label>
                <textarea
                  placeholder="Instruções adicionais"
                  value={prescForm.instrucoes}
                  onChange={(e) => setPrescForm({ ...prescForm, instrucoes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-input rounded-lg text-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowPrescForm(false)} className="px-4 py-2 border border-border rounded-lg text-sm">
                  Cancelar
                </button>
                <button type="submit" disabled={addPrescMutation.isPending} className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium disabled:opacity-50">
                  {addPrescMutation.isPending ? 'Salvando...' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmAction}
        title="Remover prescricão"
        message="Tem certeza que deseja remover esta prescricão? Esta ação não pode ser desfeita."
        confirmLabel="Remover"
        destructive
        onConfirm={() => { confirmAction?.(); setConfirmAction(null) }}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  )
}
