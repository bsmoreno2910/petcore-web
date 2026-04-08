import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { patientsApi, type Patient } from '@/api/patients.api'
import { speciesApi } from '@/api/species.api'
import { PageHeader } from '@/components/shared/PageHeader'
import { DatePicker } from '@/components/shared/DatePicker'
import { DataTable } from '@/components/shared/DataTable'
import { SearchInput } from '@/components/shared/SearchInput'
import { TutorSearch } from '@/components/shared/TutorSearch'
import { formatDate } from '@/lib/utils'

interface PatientFormData {
  name: string
  tutor: { id: string; name: string } | null
  speciesId: string
  breedId: string
  sex: string
  birthDate: Date | null
  weight: string
  color: string
  microchip: string
  neutered: boolean
  allergies: string
  notes: string
}

const emptyForm: PatientFormData = {
  name: '', tutor: null, speciesId: '', breedId: '', sex: 'Unknown',
  birthDate: null, weight: '', color: '', microchip: '', neutered: false,
  allergies: '', notes: '',
}

export default function PatientsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [speciesFilter, setSpeciesFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<PatientFormData>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const qc = useQueryClient()

  const presetTutorId = searchParams.get('tutorId')
  const presetTutorName = searchParams.get('tutorName')

  const { data, isLoading } = useQuery({
    queryKey: ['patients', page, search, speciesFilter],
    queryFn: () => patientsApi.list({ page, pageSize: 20, search: search || undefined, speciesId: speciesFilter || undefined }),
  })

  const { data: speciesList } = useQuery({ queryKey: ['species'], queryFn: speciesApi.list })

  const createMutation = useMutation({
    mutationFn: patientsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patients'] })
      setShowForm(false)
      setForm(emptyForm)
      toast.success('Paciente cadastrado com sucesso!')
    },
    onError: (e: Error & { response?: { data?: { error?: string } } }) =>
      toast.error(e.response?.data?.error || 'Erro ao cadastrar paciente'),
  })

  const openForm = () => {
    const newForm = { ...emptyForm }
    if (presetTutorId && presetTutorName) {
      newForm.tutor = { id: presetTutorId, name: presetTutorName }
    }
    setForm(newForm)
    setErrors({})
    setShowForm(true)
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Nome do animal obrigatório'
    if (!form.tutor) errs.tutor = 'Selecione o tutor'
    if (!form.speciesId) errs.speciesId = 'Selecione a espécie'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    createMutation.mutate({
      name: form.name,
      tutorId: form.tutor!.id,
      speciesId: form.speciesId,
      breedId: form.breedId || undefined,
      sex: form.sex,
      birthDate: form.birthDate ? form.birthDate.toISOString() : undefined,
      weight: form.weight ? Number(form.weight) : undefined,
      color: form.color || undefined,
      microchip: form.microchip || undefined,
      neutered: form.neutered,
      allergies: form.allergies || undefined,
      notes: form.notes || undefined,
    })
  }

  const selectedSpecies = speciesList?.find(s => s.id === form.speciesId)

  const columns = [
    { key: 'name', header: 'Nome' },
    { key: 'tutorName', header: 'Tutor' },
    { key: 'speciesName', header: 'Espécie' },
    { key: 'breedName', header: 'Raça', render: (p: Patient) => p.breedName || 'SRD' },
    { key: 'sex', header: 'Sexo', render: (p: Patient) =>
      p.sex === 'Male' ? 'Macho' : p.sex === 'Female' ? 'Fêmea' : '—'
    },
    { key: 'createdAt', header: 'Cadastro', render: (p: Patient) => formatDate(p.createdAt) },
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
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Buscar por nome do animal ou tutor..." />
        </div>
        <select value={speciesFilter} onChange={e => { setSpeciesFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 border border-input rounded-lg text-sm bg-background">
          <option value="">Todas espécies</option>
          {speciesList?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <DataTable columns={columns} data={data?.items ?? []} page={page}
        totalPages={data ? Math.ceil(data.totalCount / data.pageSize) : 1}
        onPageChange={setPage} loading={isLoading}
        onRowClick={(p) => navigate(`/patients/${p.id}`)} />

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
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.name ? 'border-destructive' : 'border-input'}`}
                    placeholder="Nome do animal" />
                  {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Espécie <span className="text-destructive">*</span></label>
                    <select value={form.speciesId} onChange={e => setForm({ ...form, speciesId: e.target.value, breedId: '' })}
                      className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.speciesId ? 'border-destructive' : 'border-input'}`}>
                      <option value="">Selecione...</option>
                      {speciesList?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    {errors.speciesId && <p className="text-xs text-destructive mt-1">{errors.speciesId}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Raça</label>
                    <select value={form.breedId} onChange={e => setForm({ ...form, breedId: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded-lg text-sm" disabled={!form.speciesId}>
                      <option value="">SRD / Não informada</option>
                      {selectedSpecies?.breeds.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Sexo</label>
                    <select value={form.sex} onChange={e => setForm({ ...form, sex: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded-lg text-sm">
                      <option value="Unknown">Não informado</option>
                      <option value="Male">Macho</option>
                      <option value="Female">Fêmea</option>
                    </select>
                  </div>
                  <DatePicker
                    label="Nascimento"
                    value={form.birthDate}
                    onChange={(date) => setForm({ ...form, birthDate: date })}
                    maxDate={new Date()}
                    placeholder="Data de nascimento"
                  />
                  <div>
                    <label className="block text-sm font-medium mb-1">Peso (kg)</label>
                    <input type="number" step="0.1" min="0" value={form.weight}
                      onChange={e => setForm({ ...form, weight: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded-lg text-sm" placeholder="0.0" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Pelagem / Cor</label>
                    <input value={form.color} onChange={e => setForm({ ...form, color: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded-lg text-sm" placeholder="Ex: Caramelo" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Microchip</label>
                    <input value={form.microchip} onChange={e => setForm({ ...form, microchip: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded-lg text-sm" placeholder="Número do chip" />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.neutered} onChange={e => setForm({ ...form, neutered: e.target.checked })}
                    className="rounded border-input" />
                  <span className="text-sm">Castrado(a)</span>
                </label>
              </fieldset>

              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Saúde</legend>
                <div>
                  <label className="block text-sm font-medium mb-1">Alergias conhecidas</label>
                  <input value={form.allergies} onChange={e => setForm({ ...form, allergies: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-lg text-sm" placeholder="Descreva alergias conhecidas..." />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Observações</label>
                  <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
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
