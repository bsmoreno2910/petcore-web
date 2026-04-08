import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Heart, Thermometer, Activity } from 'lucide-react'
import { patientsApi } from '@/api/patients.api'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate } from '@/lib/utils'

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: patient, isLoading } = useQuery({
    queryKey: ['patient', id],
    queryFn: () => patientsApi.get(id!),
    enabled: !!id,
  })

  const { data: timeline } = useQuery({
    queryKey: ['patient-timeline', id],
    queryFn: () => patientsApi.timeline(id!),
    enabled: !!id,
  })

  if (isLoading || !patient) return <div className="text-muted-foreground">Carregando...</div>

  return (
    <div>
      <PageHeader
        title={patient.name}
        description={`${patient.speciesName}${patient.breedName ? ` — ${patient.breedName}` : ''} | Tutor: ${patient.tutorName}`}
        actions={
          <button onClick={() => navigate('/patients')} className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm hover:bg-secondary">
            <ArrowLeft size={16} /> Voltar
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold mb-3">Dados do Paciente</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Sexo:</span> {patient.sex}</p>
              <p><span className="text-muted-foreground">Nascimento:</span> {patient.birthDate ? formatDate(patient.birthDate) : '—'}</p>
              <p><span className="text-muted-foreground">Peso:</span> {patient.weight ? `${patient.weight} kg` : '—'}</p>
              <p><span className="text-muted-foreground">Cor:</span> {patient.color || '—'}</p>
              <p><span className="text-muted-foreground">Microchip:</span> {patient.microchip || '—'}</p>
              <p><span className="text-muted-foreground">Castrado:</span> {patient.neutered ? 'Sim' : 'Não'}</p>
              {patient.allergies && <p><span className="text-muted-foreground">Alergias:</span> {patient.allergies}</p>}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold mb-3">Tutor</h3>
            <div className="space-y-1 text-sm">
              <p className="font-medium">{patient.tutorName}</p>
              {patient.tutorPhone && <p className="text-muted-foreground">{patient.tutorPhone}</p>}
              {patient.tutorEmail && <p className="text-muted-foreground">{patient.tutorEmail}</p>}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold mb-4">Timeline</h3>
            {!timeline || timeline.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhum registro encontrado.</p>
            ) : (
              <div className="space-y-3">
                {(timeline as Array<{ id: string; type: string; date: string; description: string }>).map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg border border-border">
                    <div className="mt-0.5">
                      {item.type === 'medical-record' && <Heart size={16} className="text-blue-500" />}
                      {item.type === 'exam' && <Thermometer size={16} className="text-purple-500" />}
                      {item.type === 'hospitalization' && <Activity size={16} className="text-red-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={item.type === 'medical-record' ? 'Prontuário' : item.type === 'exam' ? 'Exame' : 'Internação'} />
                        <span className="text-xs text-muted-foreground">{formatDate(item.date)}</span>
                      </div>
                      <p className="text-sm mt-1">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
