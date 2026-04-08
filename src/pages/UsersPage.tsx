import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, ToggleLeft, ToggleRight } from 'lucide-react'
import { toast } from 'sonner'
import { usersApi } from '@/api/users.api'
import type { User } from '@/types/user'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate } from '@/lib/utils'

export default function UsersPage() {
  const [showForm, setShowForm] = useState(false)
  const qc = useQueryClient()

  const { data: users, isLoading } = useQuery({ queryKey: ['users'], queryFn: usersApi.list })

  const createMutation = useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setShowForm(false); toast.success('Usuário criado!') },
    onError: (e: Error & { response?: { data?: { error?: string } } }) => toast.error(e.response?.data?.error || 'Erro ao criar'),
  })

  const toggleMutation = useMutation({
    mutationFn: usersApi.toggleActive,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('Status alterado!') },
  })

  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', crmv: '' })

  const columns = [
    { key: 'name', header: 'Nome' },
    { key: 'email', header: 'E-mail' },
    { key: 'phone', header: 'Telefone', render: (u: User) => u.phone || '—' },
    { key: 'crmv', header: 'CRMV', render: (u: User) => u.crmv || '—' },
    { key: 'clinics', header: 'Clínicas', render: (u: User) =>
      u.clinics.map(c => <span key={c.clinicId} className="inline-block mr-1"><StatusBadge status={c.role} /></span>)
    },
    { key: 'active', header: 'Ativo', render: (u: User) =>
      <button onClick={(e) => { e.stopPropagation(); toggleMutation.mutate(u.id) }} className="text-muted-foreground hover:text-foreground">
        {u.active ? <ToggleRight size={20} className="text-green-500" /> : <ToggleLeft size={20} />}
      </button>
    },
    { key: 'createdAt', header: 'Cadastro', render: (u: User) => formatDate(u.createdAt) },
  ]

  return (
    <div>
      <PageHeader title="Usuários" description="Gerenciamento de usuários do sistema"
        actions={<button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:opacity-90">
          <Plus size={16} /> Novo Usuário
        </button>}
      />

      <DataTable columns={columns} data={users ?? []} loading={isLoading} />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl shadow-lg p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-semibold mb-4">Novo Usuário</h3>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form) }} className="space-y-3">
              <input required placeholder="Nome *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
              <input required type="email" placeholder="E-mail *" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
              <input required type="password" placeholder="Senha *" minLength={6} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Telefone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
                <input placeholder="CRMV (veterinários)" value={form.crmv} onChange={e => setForm({ ...form, crmv: e.target.value })} className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-border rounded-lg text-sm">Cancelar</button>
                <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium">{createMutation.isPending ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
