import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Heart, Thermometer, Activity } from 'lucide-react'
import { pacientesApi } from '@/api/pacientes.api'
import { PageHeader } from '@/components/shared/CabecalhoPagina'
import { StatusBadge } from '@/components/shared/BadgeStatus'
import { formatDate } from '@/lib/utilitarios'

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: paciente, isLoading } = useQuery({
    queryKey: ['paciente', id],
    queryFn: () => pacientesApi.obterPorId(id!),
    enabled: !!id,
  })

  const { data: linhaTempo } = useQuery({
    queryKey: ['paciente-timeline', id],
    queryFn: () => pacientesApi.linhaTempo(id!),
    enabled: !!id,
  })

  if (isLoading || !paciente) return <div className="text-muted-foreground">Carregando...</div>

  return (
    <div>
      <PageHeader
        title={paciente.nome}
        description={`${paciente.nomeEspecie}${paciente.nomeRaca ? ` — ${paciente.nomeRaca}` : ''} | Tutor: ${paciente.nomeTutor}`}
        actions={
          <button onClick={() => navigate('/pacientes')} className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm hover:bg-secondary">
            <ArrowLeft size={16} /> Voltar
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold mb-3">Dados do Paciente</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Sexo:</span> {paciente.sexo}</p>
              <p><span className="text-muted-foreground">Nascimento:</span> {paciente.dataNascimento ? formatDate(paciente.dataNascimento) : '—'}</p>
              <p><span className="text-muted-foreground">Peso:</span> {paciente.peso ? `${paciente.peso} kg` : '—'}</p>
              <p><span className="text-muted-foreground">Cor:</span> {paciente.cor || '—'}</p>
              <p><span className="text-muted-foreground">Microchip:</span> {paciente.microchip || '—'}</p>
              <p><span className="text-muted-foreground">Castrado:</span> {paciente.castrado ? 'Sim' : 'Não'}</p>
              {paciente.alergias && <p><span className="text-muted-foreground">Alergias:</span> {paciente.alergias}</p>}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold mb-3">Tutor</h3>
            <div className="space-y-1 text-sm">
              <p className="font-medium">{paciente.nomeTutor}</p>
              {paciente.telefoneTutor && <p className="text-muted-foreground">{paciente.telefoneTutor}</p>}
              {paciente.emailTutor && <p className="text-muted-foreground">{paciente.emailTutor}</p>}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold mb-4">Linha do Tempo</h3>
            {!linhaTempo || linhaTempo.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhum registro encontrado.</p>
            ) : (
              <div className="space-y-3">
                {linhaTempo.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg border border-border">
                    <div className="mt-0.5">
                      {item.tipo === 'prontuario' && <Heart size={16} className="text-blue-500" />}
                      {item.tipo === 'exame' && <Thermometer size={16} className="text-purple-500" />}
                      {item.tipo === 'internacao' && <Activity size={16} className="text-red-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={item.tipo === 'prontuario' ? 'Prontuário' : item.tipo === 'exame' ? 'Exame' : 'Internação'} />
                        <span className="text-xs text-muted-foreground">{formatDate(item.data)}</span>
                      </div>
                      <p className="text-sm mt-1">{item.descricao}</p>
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
