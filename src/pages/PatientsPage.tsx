import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { patientsApi, type Patient } from '@/api/patients.api'
import { speciesApi } from '@/api/species.api'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { SearchInput } from '@/components/shared/SearchInput'
import { formatDate } from '@/lib/utils'

export default function PatientsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [speciesFilter, setSpeciesFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['patients', page, search, speciesFilter],
    queryFn: () => patientsApi.list({ page, pageSize: 20, search: search || undefined, speciesId: speciesFilter || undefined }),
  })

  const { data: speciesList } = useQuery({ queryKey: ['species'], queryFn: speciesApi.list })

  const createMutation = useMutation({
    mutationFn: patientsApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['patients'] }); setShowForm(false); toast.success('Paciente cadastrado!') },
    onError: () => toast.error('Erro ao cadastrar paciente'),
  })

  const [form, setForm] = useState({ name: '', tutorId: '', speciesId: '', breedId: '', sex: 'Unknown' })

  const columns = [
    { key: 'name', header: 'Nome' },
    { key: 'tutorName', header: 'Tutor' },
    { key: 'speciesName', header: 'Espécie' },
    { key: 'breedName', header: 'Raça', render: (p: Patient) => p.breedName || 'SRD' },
    { key: 'sex', header: 'Sexo' },
    { key: 'createdAt', header: 'Cadastro', render: (p: Patient) => formatDate(p.createdAt) },
  ]

  const selectedSpecies = speciesList?.find(s => s.id === form.speciesId)

  return (
    <div>
      <PageHeader
        title="Pacientes"
        description="Cadastro de animais"
        actions={
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:opacity-90">
            <Plus size={16} /> Novo Paciente
          </button>
        }
      />

      <div className="flex gap-3 mb-4">
        <div className="max-w-sm flex-1">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Buscar por nome..." />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl shadow-lg p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-semibold mb-4">Novo Paciente</h3>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form) }} className="space-y-3">
              <input required placeholder="Nome do animal *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
              <input required placeholder="ID do Tutor *" value={form.tutorId} onChange={e => setForm({ ...form, tutorId: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <select required value={form.speciesId} onChange={e => setForm({ ...form, speciesId: e.target.value, breedId: '' })}
                  className="w-full px-3 py-2 border border-input rounded-lg text-sm">
                  <option value="">Espécie *</option>
                  {speciesList?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <select value={form.breedId} onChange={e => setForm({ ...form, breedId: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg text-sm">
                  <option value="">Raça</option>
                  {selectedSpecies?.breeds.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <select value={form.sex} onChange={e => setForm({ ...form, sex: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-lg text-sm">
                <option value="Unknown">Não informado</option>
                <option value="Male">Macho</option>
                <option value="Female">Fêmea</option>
              </select>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-border rounded-lg text-sm">Cancelar</button>
                <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium">
                  {createMutation.isPending ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
