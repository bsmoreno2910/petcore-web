import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Plus, Search, X } from 'lucide-react'
import { toast } from 'sonner'
import { agendamentosApi } from '@/api/appointments.api'
import { pacientesApi } from '@/api/patients.api'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDateTime } from '@/lib/utils'

export default function AgendaPage() {
  const [showForm, setShowForm] = useState(false)
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [motivoCancelamento, setMotivoCancelamento] = useState('')
  const [buscaPaciente, setBuscaPaciente] = useState('')
  const [pacienteSelecionado, setPacienteSelecionado] = useState<{ id: string; nome: string; nomeTutor: string } | null>(null)
  const qc = useQueryClient()

  const { data: events } = useQuery({
    queryKey: ['agendamentos', dateRange.start, dateRange.end],
    queryFn: () => agendamentosApi.calendario(dateRange.start, dateRange.end),
    enabled: !!dateRange.start && !!dateRange.end,
  })

  const { data: appointment } = useQuery({
    queryKey: ['agendamento', selectedEvent],
    queryFn: () => agendamentosApi.obterPorId(selectedEvent!),
    enabled: !!selectedEvent,
  })

  const { data: resultadoBusca } = useQuery({
    queryKey: ['pacientes-busca', buscaPaciente],
    queryFn: () => pacientesApi.listar({ busca: buscaPaciente, tamanhoPagina: 8 }),
    enabled: buscaPaciente.length >= 2,
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) => {
      const actions: Record<string, (id: string) => Promise<unknown>> = {
        confirmar: agendamentosApi.confirmar,
        checkin: agendamentosApi.checkin,
        iniciar: agendamentosApi.iniciar,
        concluir: agendamentosApi.concluir,
        faltou: agendamentosApi.faltou,
      }
      return actions[action](id)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agendamentos'] })
      qc.invalidateQueries({ queryKey: ['agendamento'] })
      toast.success('Status atualizado!')
    },
    onError: () => toast.error('Erro ao atualizar status'),
  })

  const cancelMutation = useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo?: string }) =>
      agendamentosApi.cancelar(id, motivo),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agendamentos'] })
      qc.invalidateQueries({ queryKey: ['agendamento'] })
      setShowCancelModal(false)
      setMotivoCancelamento('')
      toast.success('Agendamento cancelado!')
    },
    onError: () => toast.error('Erro ao cancelar agendamento'),
  })

  const [form, setForm] = useState({
    pacienteId: '',
    veterinarioId: '',
    tipo: 'Consulta',
    dataHoraAgendada: '',
    duracaoMinutos: 30,
    motivo: '',
  })

  const createMutation = useMutation({
    mutationFn: agendamentosApi.criar,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agendamentos'] })
      setShowForm(false)
      resetForm()
      toast.success('Agendamento criado!')
    },
    onError: (e: Error & { response?: { data?: { error?: string } } }) =>
      toast.error(e.response?.data?.error || 'Erro ao agendar'),
  })

  const resetForm = () => {
    setForm({ pacienteId: '', veterinarioId: '', tipo: 'Consulta', dataHoraAgendada: '', duracaoMinutos: 30, motivo: '' })
    setPacienteSelecionado(null)
    setBuscaPaciente('')
  }

  const handleDatesSet = useCallback((arg: { startStr: string; endStr: string }) => {
    setDateRange({ start: arg.startStr, end: arg.endStr })
  }, [])

  const handleSelectPaciente = (p: { id: string; nome: string; nomeTutor: string }) => {
    setPacienteSelecionado(p)
    setForm({ ...form, pacienteId: p.id })
    setBuscaPaciente('')
  }

  return (
    <div>
      <PageHeader
        title="Agenda"
        description="Agendamentos de consultas, cirurgias e procedimentos"
        actions={
          <button
            onClick={() => { resetForm(); setShowForm(true) }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:opacity-90"
          >
            <Plus size={16} /> Novo Agendamento
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-card border border-border rounded-xl p-4">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
            locale="pt-br"
            slotMinTime="07:00:00"
            slotMaxTime="20:00:00"
            allDaySlot={false}
            height="auto"
            events={events?.map(e => ({
              id: e.id,
              title: e.titulo,
              start: e.inicio,
              end: e.fim,
              backgroundColor: e.cor,
              borderColor: e.cor,
            })) ?? []}
            eventClick={(info) => setSelectedEvent(info.event.id)}
            datesSet={handleDatesSet}
          />
        </div>

        <div>
          {appointment ? (
            <div className="bg-card border border-border rounded-xl p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{appointment.nomePaciente}</h3>
                  <p className="text-sm text-muted-foreground">{appointment.nomeTutor}</p>
                </div>
                <button onClick={() => setSelectedEvent(null)} className="text-muted-foreground hover:text-foreground">
                  <X size={16} />
                </button>
              </div>

              <StatusBadge status={appointment.status} />

              <div className="text-sm space-y-1">
                <p><span className="text-muted-foreground">Tipo:</span> {appointment.tipo}</p>
                <p><span className="text-muted-foreground">Vet:</span> {appointment.nomeVeterinario || '---'}</p>
                <p><span className="text-muted-foreground">Data/Hora:</span> {formatDateTime(appointment.dataHoraAgendada)}</p>
                <p><span className="text-muted-foreground">Duracao:</span> {appointment.duracaoMinutos} min</p>
                <p><span className="text-muted-foreground">Motivo:</span> {appointment.motivo || '---'}</p>
                {appointment.observacoes && (
                  <p><span className="text-muted-foreground">Obs:</span> {appointment.observacoes}</p>
                )}
                {appointment.iniciadoEm && (
                  <p><span className="text-muted-foreground">Iniciado em:</span> {formatDateTime(appointment.iniciadoEm)}</p>
                )}
                {appointment.finalizadoEm && (
                  <p><span className="text-muted-foreground">Finalizado em:</span> {formatDateTime(appointment.finalizadoEm)}</p>
                )}
                {appointment.motivoCancelamento && (
                  <p><span className="text-muted-foreground">Motivo cancelamento:</span> {appointment.motivoCancelamento}</p>
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {appointment.status === 'Agendado' && (
                  <button
                    onClick={() => statusMutation.mutate({ id: appointment.id, action: 'confirmar' })}
                    className="px-3 py-1.5 bg-cyan-500 text-white rounded text-xs"
                  >
                    Confirmar
                  </button>
                )}
                {appointment.status === 'Confirmado' && (
                  <button
                    onClick={() => statusMutation.mutate({ id: appointment.id, action: 'checkin' })}
                    className="px-3 py-1.5 bg-indigo-500 text-white rounded text-xs"
                  >
                    Check-in
                  </button>
                )}
                {appointment.status === 'Chegou' && (
                  <button
                    onClick={() => statusMutation.mutate({ id: appointment.id, action: 'iniciar' })}
                    className="px-3 py-1.5 bg-yellow-500 text-white rounded text-xs"
                  >
                    Iniciar
                  </button>
                )}
                {appointment.status === 'EmAndamento' && (
                  <button
                    onClick={() => statusMutation.mutate({ id: appointment.id, action: 'concluir' })}
                    className="px-3 py-1.5 bg-green-500 text-white rounded text-xs"
                  >
                    Concluir
                  </button>
                )}

                {/* Faltou - disponivel para Agendado ou Confirmado */}
                {(appointment.status === 'Agendado' || appointment.status === 'Confirmado') && (
                  <button
                    onClick={() => statusMutation.mutate({ id: appointment.id, action: 'faltou' })}
                    className="px-3 py-1.5 bg-gray-500 text-white rounded text-xs"
                  >
                    Faltou
                  </button>
                )}

                {/* Cancelar - disponivel para qualquer status ativo */}
                {!['Concluido', 'Cancelado', 'Faltou'].includes(appointment.status) && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="px-3 py-1.5 bg-red-500 text-white rounded text-xs"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl p-5 text-center text-muted-foreground text-sm">
              Clique em um evento para ver detalhes
            </div>
          )}
        </div>
      </div>

      {/* Modal de novo agendamento */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl shadow-lg p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-semibold mb-4">Novo Agendamento</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                createMutation.mutate(form)
              }}
              className="space-y-3"
            >
              {/* Busca de paciente */}
              <div className="relative">
                <label className="block text-sm font-medium mb-1">Paciente *</label>
                {pacienteSelecionado ? (
                  <div className="flex items-center gap-2 px-3 py-2 border border-input rounded-lg text-sm bg-secondary">
                    <span className="flex-1">
                      {pacienteSelecionado.nome} <span className="text-muted-foreground">({pacienteSelecionado.nomeTutor})</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => { setPacienteSelecionado(null); setForm({ ...form, pacienteId: '' }) }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      placeholder="Buscar paciente por nome..."
                      value={buscaPaciente}
                      onChange={(e) => setBuscaPaciente(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-input rounded-lg text-sm"
                    />
                    {resultadoBusca && resultadoBusca.itens && resultadoBusca.itens.length > 0 && buscaPaciente.length >= 2 && (
                      <div className="absolute z-10 mt-1 w-full bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {resultadoBusca.itens.map((p: { id: string; nome: string; nomeTutor: string; nomeEspecie: string }) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleSelectPaciente(p)}
                            className="w-full text-left px-3 py-2 hover:bg-secondary text-sm border-b border-border last:border-0"
                          >
                            <span className="font-medium">{p.nome}</span>
                            <span className="text-muted-foreground ml-2">({p.nomeEspecie}) - {p.nomeTutor}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">ID do Veterinario</label>
                <input
                  placeholder="ID do Veterinario (opcional)"
                  value={form.veterinarioId}
                  onChange={(e) => setForm({ ...form, veterinarioId: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tipo</label>
                <select
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg text-sm"
                >
                  <option value="Consulta">Consulta</option>
                  <option value="Retorno">Retorno</option>
                  <option value="Cirurgia">Cirurgia</option>
                  <option value="Exame">Exame</option>
                  <option value="Vacinacao">Vacinacao</option>
                  <option value="BanhoTosa">Banho e Tosa</option>
                  <option value="Emergencia">Emergencia</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Data e Hora *</label>
                <input
                  required
                  type="datetime-local"
                  value={form.dataHoraAgendada}
                  onChange={(e) => setForm({ ...form, dataHoraAgendada: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Duracao (minutos)</label>
                <input
                  type="number"
                  placeholder="Duracao (min)"
                  value={form.duracaoMinutos}
                  onChange={(e) => setForm({ ...form, duracaoMinutos: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-input rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Motivo</label>
                <input
                  placeholder="Motivo da consulta"
                  value={form.motivo}
                  onChange={(e) => setForm({ ...form, motivo: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-border rounded-lg text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || !form.pacienteId}
                  className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Salvando...' : 'Agendar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de cancelamento */}
      {showCancelModal && appointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl shadow-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Cancelar Agendamento</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Deseja realmente cancelar o agendamento de <strong>{appointment.nomePaciente}</strong>?
            </p>
            <textarea
              placeholder="Motivo do cancelamento (opcional)"
              value={motivoCancelamento}
              onChange={(e) => setMotivoCancelamento(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-input rounded-lg text-sm mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setShowCancelModal(false); setMotivoCancelamento('') }}
                className="px-4 py-2 border border-border rounded-lg text-sm"
              >
                Voltar
              </button>
              <button
                onClick={() => cancelMutation.mutate({ id: appointment.id, motivo: motivoCancelamento || undefined })}
                disabled={cancelMutation.isPending}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium"
              >
                {cancelMutation.isPending ? 'Cancelando...' : 'Confirmar Cancelamento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
