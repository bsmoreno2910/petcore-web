import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, PawPrint, Phone, Mail, MapPin, Pencil, FileText, User, CreditCard, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { tutorsApi } from '@/api/tutors.api'
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
    queryFn: () => tutorsApi.get(id!),
    enabled: !!id,
  })

  const { data: financial } = useQuery({
    queryKey: ['tutor-financial', id],
    queryFn: () => tutorsApi.financialSummary(id!),
    enabled: !!id,
  })

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => tutorsApi.update(id!, data),
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
        title={tutor.name}
        description={`Tutor — ${tutor.patients.length} paciente(s) — Cadastro: ${formatDate(tutor.createdAt)}`}
        actions={
          <div className="flex gap-2">
            <button onClick={() => setShowEdit(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:opacity-90">
              <Pencil size={16} /> Editar
            </button>
            <button onClick={() => navigate('/tutors')}
              className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm hover:bg-secondary">
              <ArrowLeft size={16} /> Voltar
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna esquerda — Dados */}
        <div className="lg:col-span-1 space-y-4">
          {/* Dados Pessoais */}
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
                <div>
                  <span className="text-muted-foreground">RG:</span> {tutor.rg}
                </div>
              )}
            </div>
          </div>

          {/* Contato */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Phone size={16} /> Contato</h3>
            <div className="space-y-2.5 text-sm">
              {tutor.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-green-500" />
                  <span>{tutor.phone}</span>
                  <span className="text-xs text-muted-foreground">(principal)</span>
                </div>
              )}
              {tutor.phoneSecondary && (
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-muted-foreground" />
                  <span>{tutor.phoneSecondary}</span>
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

          {/* Endereço */}
          {(tutor.street || tutor.city) && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><MapPin size={16} /> Endereço</h3>
              <div className="text-sm space-y-1">
                {tutor.street && <p>{tutor.street}{tutor.number ? `, ${tutor.number}` : ''}</p>}
                {tutor.complement && <p>{tutor.complement}</p>}
                {tutor.neighborhood && <p>{tutor.neighborhood}</p>}
                {tutor.city && <p>{tutor.city}/{tutor.state} {tutor.zipCode ? `— CEP: ${tutor.zipCode}` : ''}</p>}
              </div>
            </div>
          )}

          {/* Financeiro */}
          {financial && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><CreditCard size={16} /> Financeiro</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-medium">{formatCurrency(financial.totalRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pago</span>
                  <span className="text-green-600 font-medium">{formatCurrency(financial.totalPaid)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pendente</span>
                  <span className="text-yellow-600 font-medium">{formatCurrency(financial.totalPending)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vencido</span>
                  <span className="text-red-600 font-medium">{formatCurrency(financial.totalOverdue)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Observações */}
          {tutor.notes && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><FileText size={16} /> Observações</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{tutor.notes}</p>
            </div>
          )}
        </div>

        {/* Coluna direita — Pacientes */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <PawPrint size={16} /> Pacientes ({tutor.patients.length})
              </h3>
              <button onClick={() => navigate(`/patients?tutorId=${tutor.id}&tutorName=${encodeURIComponent(tutor.name)}`)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white rounded-lg text-xs font-medium hover:opacity-90">
                <Plus size={14} /> Novo Paciente
              </button>
            </div>
            {tutor.patients.length === 0 ? (
              <div className="text-center py-8">
                <PawPrint size={40} className="text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhum paciente cadastrado.</p>
                <button onClick={() => navigate('/patients')}
                  className="mt-3 px-4 py-2 bg-accent text-white rounded-lg text-sm hover:opacity-90">
                  Cadastrar Paciente
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {tutor.patients.map((p: { id: string; name: string; speciesName: string; breedName?: string; active: boolean }) => (
                  <button
                    key={p.id}
                    onClick={() => navigate(`/patients/${p.id}`)}
                    className="w-full flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-accent/10">
                        <PawPrint size={18} className="text-accent" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{p.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.speciesName}{p.breedName ? ` — ${p.breedName}` : ''}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={p.active ? 'Active' : 'Cancelled'} />
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
