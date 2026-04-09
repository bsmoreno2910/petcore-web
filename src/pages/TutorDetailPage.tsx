import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, PawPrint, Phone, Mail, MapPin, Pencil, FileText, User, CreditCard, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { tutoresApi } from '@/api/tutors.api'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { TutorForm } from '@/components/tutors/TutorForm'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function TutorDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [showEdit, setShowEdit] = useState(false)

  const { data: tutor, isLoading } = useQuery({
    queryKey: ['tutor', id],
    queryFn: () => tutoresApi.obterPorId(id!),
    enabled: !!id,
  })

  const { data: financeiro } = useQuery({
    queryKey: ['tutor-financeiro', id],
    queryFn: () => tutoresApi.resumoFinanceiro(id!),
    enabled: !!id,
  })

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => tutoresApi.atualizar(id!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tutor', id] })
      setShowEdit(false)
      toast.success('Tutor atualizado!')
    },
    onError: (e: Error & { response?: { data?: { error?: string } } }) =>
      toast.error(e.response?.data?.error || 'Erro ao atualizar'),
  })

  if (isLoading || !tutor) return <div className="text-muted-foreground">Carregando...</div>

  const emails = (tutor.email || '').split(';').map((e: string) => e.trim()).filter(Boolean)

  return (
    <div>
      <PageHeader
        title={tutor.nome}
        description={`Tutor — ${tutor.pacientes.length} paciente(s) — Cadastro: ${formatDate(tutor.criadoEm)}`}
        actions={
          <div className="flex gap-2">
            <button onClick={() => setShowEdit(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:opacity-90">
              <Pencil size={16} /> Editar
            </button>
            <button onClick={() => navigate('/tutores')}
              className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm hover:bg-secondary">
              <ArrowLeft size={16} /> Voltar
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><User size={16} /> Dados Pessoais</h3>
            <div className="space-y-2.5 text-sm">
              {tutor.cpf && (
                <div className="flex items-center gap-2">
                  <CreditCard size={14} className="text-muted-foreground" />
                  <span className="text-muted-foreground">CPF:</span>
                  <span className="font-mono">{tutor.cpf}</span>
                </div>
              )}
              {tutor.rg && (
                <div><span className="text-muted-foreground">RG:</span> {tutor.rg}</div>
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Phone size={16} /> Contato</h3>
            <div className="space-y-2.5 text-sm">
              {tutor.telefone && (
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-green-500" />
                  <span>{tutor.telefone}</span>
                  <span className="text-xs text-muted-foreground">(principal)</span>
                </div>
              )}
              {tutor.telefoneSecundario && (
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-muted-foreground" />
                  <span>{tutor.telefoneSecundario}</span>
                  <span className="text-xs text-muted-foreground">(secundário)</span>
                </div>
              )}
              {emails.length > 0 && (
                <div className="space-y-1">
                  {emails.map((email: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Mail size={14} className="text-blue-500" />
                      <span>{email}</span>
                      {idx === 0 && <span className="text-xs text-muted-foreground">(principal)</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {(tutor.rua || tutor.cidade) && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><MapPin size={16} /> Endereço</h3>
              <div className="text-sm space-y-1">
                {tutor.rua && <p>{tutor.rua}{tutor.numero ? `, ${tutor.numero}` : ''}</p>}
                {tutor.complemento && <p>{tutor.complemento}</p>}
                {tutor.bairro && <p>{tutor.bairro}</p>}
                {tutor.cidade && <p>{tutor.cidade}/{tutor.estado} {tutor.cep ? `— CEP: ${tutor.cep}` : ''}</p>}
              </div>
            </div>
          )}

          {financeiro && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><CreditCard size={16} /> Financeiro</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-medium">{formatCurrency(financeiro.totalReceita)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pago</span>
                  <span className="text-green-600 font-medium">{formatCurrency(financeiro.totalPago)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pendente</span>
                  <span className="text-yellow-600 font-medium">{formatCurrency(financeiro.totalPendente)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vencido</span>
                  <span className="text-red-600 font-medium">{formatCurrency(financeiro.totalAtrasado)}</span>
                </div>
              </div>
            </div>
          )}

          {tutor.observacoes && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><FileText size={16} /> Observações</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{tutor.observacoes}</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <PawPrint size={16} /> Pacientes ({tutor.pacientes.length})
              </h3>
              <button onClick={() => navigate(`/pacientes?tutorId=${tutor.id}&tutorName=${encodeURIComponent(tutor.nome)}`)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white rounded-lg text-xs font-medium hover:opacity-90">
                <Plus size={14} /> Novo Paciente
              </button>
            </div>
            {tutor.pacientes.length === 0 ? (
              <div className="text-center py-8">
                <PawPrint size={40} className="text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhum paciente cadastrado.</p>
                <button onClick={() => navigate('/pacientes')}
                  className="mt-3 px-4 py-2 bg-accent text-white rounded-lg text-sm hover:opacity-90">
                  Cadastrar Paciente
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {tutor.pacientes.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => navigate(`/pacientes/${p.id}`)}
                    className="w-full flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-accent/10">
                        <PawPrint size={18} className="text-accent" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{p.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.nomeEspecie}{p.nomeRaca ? ` — ${p.nomeRaca}` : ''}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={p.ativo ? 'Ativo' : 'Inativo'} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <TutorForm
        open={showEdit}
        onClose={() => setShowEdit(false)}
        onSubmit={(data) => updateMutation.mutate(data)}
        loading={updateMutation.isPending}
        initialData={tutor as unknown as import('@/api/tutors.api').Tutor}
        title="Editar Tutor"
      />
    </div>
  )
}
