import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, PawPrint } from 'lucide-react'
import { toast } from 'sonner'
import { tutorsApi, type Tutor } from '@/api/tutors.api'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { SearchInput } from '@/components/shared/SearchInput'
import { TutorForm } from '@/components/tutors/TutorForm'

export default function TutorsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null)
  const [editingTutor, setEditingTutor] = useState<Tutor | null>(null)
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['tutors', page, search],
    queryFn: () => tutorsApi.list({ page, pageSize: 20, search: search || undefined }),
  })

  const createMutation = useMutation({
    mutationFn: tutorsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tutors'] })
      setFormMode(null)
      toast.success('Tutor cadastrado com sucesso!')
    },
    onError: (e: Error & { response?: { data?: { error?: string } } }) =>
      toast.error(e.response?.data?.error || 'Erro ao cadastrar tutor'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      tutorsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tutors'] })
      setFormMode(null)
      setEditingTutor(null)
      toast.success('Tutor atualizado com sucesso!')
    },
    onError: (e: Error & { response?: { data?: { error?: string } } }) =>
      toast.error(e.response?.data?.error || 'Erro ao atualizar tutor'),
  })

  const handleEdit = (tutor: Tutor, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingTutor(tutor)
    setFormMode('edit')
  }

  const handleSubmit = (data: Record<string, unknown>) => {
    if (formMode === 'edit' && editingTutor) {
      updateMutation.mutate({ id: editingTutor.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const columns = [
    { key: 'name', header: 'Nome' },
    { key: 'cpf', header: 'CPF', render: (t: Tutor) => t.cpf || '—' },
    { key: 'phone', header: 'Telefone', render: (t: Tutor) => t.phone || '—' },
    { key: 'email', header: 'E-mail', render: (t: Tutor) => {
      const emails = (t.email || '').split(';').map(e => e.trim()).filter(Boolean)
      return emails.length > 0 ? (
        <div>
          <span>{emails[0]}</span>
          {emails.length > 1 && <span className="text-xs text-muted-foreground ml-1">(+{emails.length - 1})</span>}
        </div>
      ) : '—'
    }},
    { key: 'city', header: 'Cidade', render: (t: Tutor) =>
      t.city ? `${t.city}/${t.state || ''}` : '—'
    },
    { key: 'patientCount', header: 'Pets', className: 'text-center',
      render: (t: Tutor) => (
        <span className="inline-flex items-center gap-1">
          <PawPrint size={14} className="text-muted-foreground" />
          {t.patientCount}
        </span>
      )
    },
    { key: 'actions', header: '', className: 'w-10',
      render: (t: Tutor) => (
        <button onClick={(e) => handleEdit(t, e)}
          className="p-1.5 rounded hover:bg-secondary transition-colors" title="Editar">
          <Pencil size={15} className="text-muted-foreground" />
        </button>
      )
    },
  ]

  return (
    <div>
      <PageHeader
        title="Tutores"
        description="Cadastro de tutores / proprietários"
        actions={
          <button onClick={() => { setEditingTutor(null); setFormMode('create') }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:opacity-90">
            <Plus size={16} /> Novo Tutor
          </button>
        }
      />

      <div className="mb-4 max-w-sm">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Buscar por nome, e-mail ou CPF..." />
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

      <TutorForm
        open={formMode !== null}
        onClose={() => { setFormMode(null); setEditingTutor(null) }}
        onSubmit={handleSubmit}
        loading={createMutation.isPending || updateMutation.isPending}
        initialData={editingTutor}
        title={formMode === 'edit' ? 'Editar Tutor' : 'Novo Tutor'}
      />
    </div>
  )
}
