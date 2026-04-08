import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, PawPrint, Phone, Mail, MapPin } from 'lucide-react'
import { tutorsApi } from '@/api/tutors.api'
import { PageHeader } from '@/components/shared/PageHeader'
import { formatCurrency } from '@/lib/utils'

export default function TutorDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

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

  if (isLoading || !tutor) return <div className="text-muted-foreground">Carregando...</div>

  return (
    <div>
      <PageHeader
        title={tutor.name}
        description={`Tutor — ${tutor.patients.length} paciente(s)`}
        actions={
          <button onClick={() => navigate('/tutors')} className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm hover:bg-secondary">
            <ArrowLeft size={16} /> Voltar
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold mb-3">Contato</h3>
            <div className="space-y-2 text-sm">
              {tutor.phone && <p className="flex items-center gap-2"><Phone size={14} className="text-muted-foreground" /> {tutor.phone}</p>}
              {tutor.email && <p className="flex items-center gap-2"><Mail size={14} className="text-muted-foreground" /> {tutor.email}</p>}
              {tutor.city && <p className="flex items-center gap-2"><MapPin size={14} className="text-muted-foreground" /> {tutor.city}/{tutor.state}</p>}
              {tutor.cpf && <p><span className="text-muted-foreground">CPF:</span> {tutor.cpf}</p>}
            </div>
          </div>

          {financial && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold mb-3">Financeiro</h3>
              <div className="space-y-1 text-sm">
                <p>Total: <span className="font-medium">{formatCurrency(financial.totalRevenue)}</span></p>
                <p>Pago: <span className="text-green-600">{formatCurrency(financial.totalPaid)}</span></p>
                <p>Pendente: <span className="text-yellow-600">{formatCurrency(financial.totalPending)}</span></p>
                <p>Vencido: <span className="text-red-600">{formatCurrency(financial.totalOverdue)}</span></p>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold mb-4">Pacientes</h3>
            {tutor.patients.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhum paciente cadastrado.</p>
            ) : (
              <div className="space-y-2">
                {tutor.patients.map(p => (
                  <button
                    key={p.id}
                    onClick={() => navigate(`/patients/${p.id}`)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary transition-colors text-left"
                  >
                    <PawPrint size={18} className="text-accent" />
                    <div>
                      <p className="font-medium text-sm">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.speciesName}{p.breedName ? ` — ${p.breedName}` : ''}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
