import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { tutorsApi, type Tutor } from '@/api/tutors.api'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { SearchInput } from '@/components/shared/SearchInput'

export default function TutorsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['tutors', page, search],
    queryFn: () => tutorsApi.list({ page, pageSize: 20, search: search || undefined }),
  })

  const createMutation = useMutation({
    mutationFn: tutorsApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tutors'] }); setShowForm(false); toast.success('Tutor cadastrado!') },
    onError: () => toast.error('Erro ao cadastrar tutor'),
  })

  const [form, setForm] = useState({ name: '', cpf: '', phone: '', email: '', city: '', state: '' })

  const columns = [
    { key: 'name', header: 'Nome' },
    { key: 'cpf', header: 'CPF', render: (t: Tutor) => t.cpf || '—' },
    { key: 'phone', header: 'Telefone', render: (t: Tutor) => t.phone || '—' },
    { key: 'email', header: 'E-mail', render: (t: Tutor) => t.email || '—' },
    { key: 'patientCount', header: 'Pacientes', className: 'text-center' },
  ]

  return (
    <div>
      <PageHeader
        title="Tutores"
        description="Cadastro de tutores / proprietários"
        actions={
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:opacity-90">
            <Plus size={16} /> Novo Tutor
          </button>
        }
      />

      <div className="mb-4 max-w-sm">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Buscar por nome ou e-mail..." />
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        page={page}
        totalPages={data ? Math.ceil(data.totalCount / data.pageSize) : 1}
        onPageChange={setPage}
        loading={isLoading}
        onRowClick={(t) => navigate(`/tutors/${t.id}`)}
      />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl shadow-lg p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-semibold mb-4">Novo Tutor</h3>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form) }} className="space-y-3">
              <input required placeholder="Nome *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="CPF" value={form.cpf} onChange={e => setForm({ ...form, cpf: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
                <input placeholder="Telefone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
              </div>
              <input placeholder="E-mail" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Cidade" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
                <input placeholder="UF" maxLength={2} value={form.state} onChange={e => setForm({ ...form, state: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
              </div>
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
