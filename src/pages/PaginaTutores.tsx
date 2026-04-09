import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, PawPrint } from 'lucide-react'
import { toast } from 'sonner'
import { tutoresApi, type Tutor } from '@/api/tutores.api'
import { PageHeader } from '@/components/shared/CabecalhoPagina'
import { DataTable } from '@/components/shared/TabelaDados'
import { SearchInput } from '@/components/shared/CampoBusca'
import { TutorForm } from '@/components/tutors/FormularioTutor'

export default function TutorsPage() {
  const [pagina, setPagina] = useState(1)
  const [busca, setBusca] = useState('')
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null)
  const [editingTutor, setEditingTutor] = useState<Tutor | null>(null)
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['tutores', pagina, busca],
    queryFn: () => tutoresApi.listar({ pagina, tamanhoPagina: 20, busca: busca || undefined }),
  })

  const createMutation = useMutation({
    mutationFn: tutoresApi.criar,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tutores'] })
      setFormMode(null)
      toast.success('Tutor cadastrado com sucesso!')
    },
    onError: (e: Error & { response?: { data?: { error?: string } } }) =>
      toast.error(e.response?.data?.error || 'Erro ao cadastrar tutor'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      tutoresApi.atualizar(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tutores'] })
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
    { key: 'nome', header: 'Nome' },
    { key: 'cpf', header: 'CPF', render: (t: Tutor) => t.cpf || '—' },
    { key: 'telefone', header: 'Telefone', render: (t: Tutor) => t.telefone || '—' },
    { key: 'email', header: 'E-mail', render: (t: Tutor) => {
      const emails = (t.email || '').split(';').map(e => e.trim()).filter(Boolean)
      return emails.length > 0 ? (
        <div>
          <span>{emails[0]}</span>
          {emails.length > 1 && <span className="text-xs text-muted-foreground ml-1">(+{emails.length - 1})</span>}
        </div>
      ) : '—'
    }},
    { key: 'cidade', header: 'Cidade', render: (t: Tutor) =>
      t.cidade ? `${t.cidade}/${t.estado || ''}` : '—'
    },
    { key: 'quantidadePacientes', header: 'Pets', className: 'text-center',
      render: (t: Tutor) => (
        <span className="inline-flex items-center gap-1">
          <PawPrint size={14} className="text-muted-foreground" />
          {t.quantidadePacientes}
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
        <SearchInput value={busca} onChange={(v) => { setBusca(v); setPagina(1) }} placeholder="Buscar por nome, e-mail ou CPF..." />
      </div>

      <DataTable
        columns={columns}
        data={data?.itens ?? []}
        page={pagina}
        totalPages={data ? Math.ceil(data.totalRegistros / data.tamanhoPagina) : 1}
        onPageChange={setPagina}
        loading={isLoading}
        onRowClick={(t) => navigate(`/tutores/${t.id}`)}
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
