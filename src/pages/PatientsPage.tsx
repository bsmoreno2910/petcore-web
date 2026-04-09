import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { pacientesApi, type Paciente } from '@/api/patients.api'
import { especiesApi } from '@/api/species.api'
import { PageHeader } from '@/components/shared/PageHeader'
import { DatePicker } from '@/components/shared/DatePicker'
import { DataTable } from '@/components/shared/DataTable'
import { SearchInput } from '@/components/shared/SearchInput'
import { TutorSearch } from '@/components/shared/TutorSearch'
import { formatDate } from '@/lib/utils'

interface FormDadosPaciente {
  nome: string
  tutor: { id: string; nome: string } | null
  especieId: string
  racaId: string
  sexo: string
  dataNascimento: Date | null
  peso: string
  cor: string
  microchip: string
  castrado: boolean
  alergias: string
  observacoes: string
}

const formVazio: FormDadosPaciente = {
  nome: '', tutor: null, especieId: '', racaId: '', sexo: 'Desconhecido',
  dataNascimento: null, peso: '', cor: '', microchip: '', castrado: false,
  alergias: '', observacoes: '',
}

export default function PatientsPage() {
  const [pagina, setPagina] = useState(1)
  const [busca, setBusca] = useState('')
  const [filtroEspecie, setFiltroEspecie] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormDadosPaciente>(formVazio)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const qc = useQueryClient()

  const presetTutorId = searchParams.get('tutorId')
  const presetTutorName = searchParams.get('tutorName')

  const { data, isLoading } = useQuery({
    queryKey: ['pacientes', pagina, busca, filtroEspecie],
    queryFn: () => pacientesApi.listar({ pagina, tamanhoPagina: 20, busca: busca || undefined, especieId: filtroEspecie || undefined }),
  })

  const { data: listaEspecies } = useQuery({ queryKey: ['especies'], queryFn: especiesApi.listar })

  const createMutation = useMutation({
    mutationFn: pacientesApi.criar,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pacientes'] })
      setShowForm(false)
      setForm(formVazio)
      toast.success('Paciente cadastrado com sucesso!')
    },
    onError: (e: Error & { response?: { data?: { error?: string } } }) =>
      toast.error(e.response?.data?.error || 'Erro ao cadastrar paciente'),
  })

  const openForm = () => {
    const newForm = { ...formVazio }
    if (presetTutorId && presetTutorName) {
      newForm.tutor = { id: presetTutorId, nome: presetTutorName }
    }
    setForm(newForm)
    setErrors({})
    setShowForm(true)
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!form.nome.trim()) errs.nome = 'Nome do animal obrigatório'
    if (!form.tutor) errs.tutor = 'Selecione o tutor'
    if (!form.especieId) errs.especieId = 'Selecione a espécie'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    createMutation.mutate({
      nome: form.nome,
      tutorId: form.tutor!.id,
      especieId: form.especieId,
      racaId: form.racaId || undefined,
      sexo: form.sexo,
      dataNascimento: form.dataNascimento ? form.dataNascimento.toISOString() : undefined,
      peso: form.peso ? Number(form.peso) : undefined,
      cor: form.cor || undefined,
      microchip: form.microchip || undefined,
      castrado: form.castrado,
      alergias: form.alergias || undefined,
      observacoes: form.observacoes || undefined,
    })
  }

  const especieSelecionada = listaEspecies?.find(s => s.id === form.especieId)

  const columns = [
    { key: 'nome', header: 'Nome' },
    { key: 'nomeTutor', header: 'Tutor' },
    { key: 'nomeEspecie', header: 'Espécie' },
    { key: 'nomeRaca', header: 'Raça', render: (p: Paciente) => p.nomeRaca || 'SRD' },
    { key: 'sexo', header: 'Sexo', render: (p: Paciente) =>
      p.sexo === 'Macho' ? 'Macho' : p.sexo === 'Femea' ? 'Fêmea' : '—'
    },
    { key: 'criadoEm', header: 'Cadastro', render: (p: Paciente) => formatDate(p.criadoEm) },
  ]

  return (
    <div>
      <PageHeader title="Pacientes" description="Cadastro de animais"
        actions={
          <button onClick={openForm}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:opacity-90">
            <Plus size={16} /> Novo Paciente
          </button>
        }
      />

      <div className="flex gap-3 mb-4">
        <div className="max-w-sm flex-1">
          <SearchInput value={busca} onChange={(v) => { setBusca(v); setPagina(1) }} placeholder="Buscar por nome do animal ou tutor..." />
        </div>
        <select value={filtroEspecie} onChange={e => { setFiltroEspecie(e.target.value); setPagina(1) }}
          className="px-3 py-2 border border-input rounded-lg text-sm bg-background">
          <option value="">Todas espécies</option>
          {listaEspecies?.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
        </select>
      </div>

      <DataTable columns={columns} data={data?.itens ?? []} page={pagina}
        totalPages={data ? Math.ceil(data.totalRegistros / data.tamanhoPagina) : 1}
        onPageChange={setPagina} loading={isLoading}
        onRowClick={(p) => navigate(`/pacientes/${p.id}`)} />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card rounded-t-xl z-10">
              <h3 className="text-lg font-semibold">Novo Paciente</h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-secondary"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              <fieldset>
                <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tutor / Proprietário</legend>
                <TutorSearch
                  value={form.tutor}
                  onChange={(tutor) => setForm({ ...form, tutor })}
                  error={errors.tutor}
                  disabled={!!(presetTutorId)}
                />
              </fieldset>

              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Dados do Animal</legend>

                <div>
                  <label className="block text-sm font-medium mb-1">Nome <span className="text-destructive">*</span></label>
                  <input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.nome ? 'border-destructive' : 'border-input'}`}
                    placeholder="Nome do animal" />
                  {errors.nome && <p className="text-xs text-destructive mt-1">{errors.nome}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Espécie <span className="text-destructive">*</span></label>
                    <select value={form.especieId} onChange={e => setForm({ ...form, especieId: e.target.value, racaId: '' })}
                      className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.especieId ? 'border-destructive' : 'border-input'}`}>
                      <option value="">Selecione...</option>
                      {listaEspecies?.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                    </select>
                    {errors.especieId && <p className="text-xs text-destructive mt-1">{errors.especieId}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Raça</label>
                    <select value={form.racaId} onChange={e => setForm({ ...form, racaId: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded-lg text-sm" disabled={!form.especieId}>
                      <option value="">SRD / Não informada</option>
                      {especieSelecionada?.racas.map(b => <option key={b.id} value={b.id}>{b.nome}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Sexo</label>
                    <select value={form.sexo} onChange={e => setForm({ ...form, sexo: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded-lg text-sm">
                      <option value="Desconhecido">Não informado</option>
                      <option value="Macho">Macho</option>
                      <option value="Femea">Fêmea</option>
                    </select>
                  </div>
                  <DatePicker
                    label="Nascimento"
                    value={form.dataNascimento}
                    onChange={(date) => setForm({ ...form, dataNascimento: date })}
                    maxDate={new Date()}
                    placeholder="Data de nascimento"
                  />
                  <div>
                    <label className="block text-sm font-medium mb-1">Peso (kg)</label>
                    <input type="number" step="0.1" min="0" value={form.peso}
                      onChange={e => setForm({ ...form, peso: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded-lg text-sm" placeholder="0.0" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Pelagem / Cor</label>
                    <input value={form.cor} onChange={e => setForm({ ...form, cor: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded-lg text-sm" placeholder="Ex: Caramelo" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Microchip</label>
                    <input value={form.microchip} onChange={e => setForm({ ...form, microchip: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded-lg text-sm" placeholder="Número do chip" />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.castrado} onChange={e => setForm({ ...form, castrado: e.target.checked })}
                    className="rounded border-input" />
                  <span className="text-sm">Castrado(a)</span>
                </label>
              </fieldset>

              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Saúde</legend>
                <div>
                  <label className="block text-sm font-medium mb-1">Alergias conhecidas</label>
                  <input value={form.alergias} onChange={e => setForm({ ...form, alergias: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-lg text-sm" placeholder="Descreva alergias conhecidas..." />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Observações</label>
                  <textarea value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-lg text-sm h-16 resize-none"
                    placeholder="Observações gerais sobre o animal..." />
                </div>
              </fieldset>

              <div className="flex justify-end gap-3 pt-2 border-t border-border">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-secondary">Cancelar</button>
                <button type="submit" disabled={createMutation.isPending}
                  className="px-6 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">
                  {createMutation.isPending ? 'Salvando...' : 'Cadastrar Paciente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
