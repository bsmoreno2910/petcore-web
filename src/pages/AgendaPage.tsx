import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { appointmentsApi } from '@/api/appointments.api'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'

export default function AgendaPage() {
  const [showForm, setShowForm] = useState(false)
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)
  const qc = useQueryClient()

  const { data: events } = useQuery({
    queryKey: ['calendar', dateRange.start, dateRange.end],
    queryFn: () => appointmentsApi.calendar(dateRange.start, dateRange.end),
    enabled: !!dateRange.start && !!dateRange.end,
  })

  const { data: appointment } = useQuery({
    queryKey: ['appointment', selectedEvent],
    queryFn: () => appointmentsApi.get(selectedEvent!),
    enabled: !!selectedEvent,
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) => {
      const actions: Record<string, (id: string) => Promise<unknown>> = {
        confirm: appointmentsApi.confirm, checkIn: appointmentsApi.checkIn,
        start: appointmentsApi.start, complete: appointmentsApi.complete,
        noShow: appointmentsApi.noShow,
      }
      return actions[action](id)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['calendar'] }); qc.invalidateQueries({ queryKey: ['appointment'] }); toast.success('Status atualizado!') },
  })

  const [form, setForm] = useState({ patientId: '', veterinarianId: '', type: 'Consultation', scheduledAt: '', durationMinutes: 30, reason: '' })

  const createMutation = useMutation({
    mutationFn: appointmentsApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['calendar'] }); setShowForm(false); toast.success('Agendamento criado!') },
    onError: (e: Error & { response?: { data?: { error?: string } } }) => toast.error(e.response?.data?.error || 'Erro ao agendar'),
  })

  const handleDatesSet = useCallback((arg: { startStr: string; endStr: string }) => {
    setDateRange({ start: arg.startStr, end: arg.endStr })
  }, [])

  return (
    <div>
      <PageHeader
        title="Agenda"
        description="Agendamentos de consultas, cirurgias e procedimentos"
        actions={
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:opacity-90">
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
            events={events?.map(e => ({ id: e.id, title: e.title, start: e.start, end: e.end, backgroundColor: e.color, borderColor: e.color })) ?? []}
            eventClick={(info) => setSelectedEvent(info.event.id)}
            datesSet={handleDatesSet}
          />
        </div>

        <div>
          {appointment ? (
            <div className="bg-card border border-border rounded-xl p-5 space-y-3">
              <h3 className="font-semibold">{appointment.patientName}</h3>
              <p className="text-sm text-muted-foreground">{appointment.tutorName}</p>
              <StatusBadge status={appointment.status} />
              <div className="text-sm space-y-1">
                <p><span className="text-muted-foreground">Tipo:</span> {appointment.type}</p>
                <p><span className="text-muted-foreground">Vet:</span> {appointment.veterinarianName || '—'}</p>
                <p><span className="text-muted-foreground">Motivo:</span> {appointment.reason || '—'}</p>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {appointment.status === 'Scheduled' && (
                  <button onClick={() => statusMutation.mutate({ id: appointment.id, action: 'confirm' })} className="px-3 py-1.5 bg-cyan-500 text-white rounded text-xs">Confirmar</button>
                )}
                {appointment.status === 'Confirmed' && (
                  <button onClick={() => statusMutation.mutate({ id: appointment.id, action: 'checkIn' })} className="px-3 py-1.5 bg-indigo-500 text-white rounded text-xs">Check-in</button>
                )}
                {appointment.status === 'CheckedIn' && (
                  <button onClick={() => statusMutation.mutate({ id: appointment.id, action: 'start' })} className="px-3 py-1.5 bg-yellow-500 text-white rounded text-xs">Iniciar</button>
                )}
                {appointment.status === 'InProgress' && (
                  <button onClick={() => statusMutation.mutate({ id: appointment.id, action: 'complete' })} className="px-3 py-1.5 bg-green-500 text-white rounded text-xs">Concluir</button>
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

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl shadow-lg p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-semibold mb-4">Novo Agendamento</h3>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form) }} className="space-y-3">
              <input required placeholder="ID do Paciente *" value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
              <input placeholder="ID do Veterinário" value={form.veterinarianId} onChange={e => setForm({ ...form, veterinarianId: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-lg text-sm">
                <option value="Consultation">Consulta</option>
                <option value="Return">Retorno</option>
                <option value="Surgery">Cirurgia</option>
                <option value="Exam">Exame</option>
                <option value="Vaccination">Vacinação</option>
                <option value="GroomingBath">Banho e Tosa</option>
                <option value="Emergency">Emergência</option>
              </select>
              <input required type="datetime-local" value={form.scheduledAt} onChange={e => setForm({ ...form, scheduledAt: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
              <input type="number" placeholder="Duração (min)" value={form.durationMinutes} onChange={e => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
              <input placeholder="Motivo" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-border rounded-lg text-sm">Cancelar</button>
                <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium">
                  {createMutation.isPending ? 'Salvando...' : 'Agendar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
