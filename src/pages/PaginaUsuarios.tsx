import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, ToggleLeft, ToggleRight } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { usuariosApi } from '@/api/usuarios.api'
import type { Usuario } from '@/types/usuario'
import { PageHeader } from '@/components/shared/CabecalhoPagina'
import { DataTable } from '@/components/shared/TabelaDados'
import { StatusBadge } from '@/components/shared/BadgeStatus'
import { maskPhone } from '@/lib/mascaras'
import { formatDate } from '@/lib/utilitarios'

const usuarioSchema = z.object({
  nome: z.string().min(1, 'Nome obrigatorio').max(200),
  email: z.string().email('E-mail invalido'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  telefone: z.string().optional().default(''),
  crmv: z.string().optional().default(''),
})

type UsuarioFormData = z.infer<typeof usuarioSchema>

const formDefaults: UsuarioFormData = { nome: '', email: '', senha: '', telefone: '', crmv: '' }

export default function UsersPage() {
  const [showForm, setShowForm] = useState(false)
  const qc = useQueryClient()

  const { data: users, isLoading } = useQuery({ queryKey: ['usuarios'], queryFn: usuariosApi.listar })

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<UsuarioFormData>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: formDefaults,
  })

  const createMutation = useMutation({
    mutationFn: usuariosApi.criar,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['usuarios'] })
      setShowForm(false)
      reset(formDefaults)
      toast.success('Usuario criado!')
    },
    onError: (e: Error & { response?: { data?: { error?: string } } }) => toast.error(e.response?.data?.error || 'Erro ao criar'),
  })

  const toggleMutation = useMutation({
    mutationFn: usuariosApi.alternarStatus,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['usuarios'] }); toast.success('Status alterado!') },
  })

  const onSubmit = (data: UsuarioFormData) => {
    createMutation.mutate(data)
  }

  const columns = [
    { key: 'nome', header: 'Nome' },
    { key: 'email', header: 'E-mail' },
    { key: 'telefone', header: 'Telefone', render: (u: Usuario) => u.telefone || '---' },
    { key: 'crmv', header: 'CRMV', render: (u: Usuario) => u.crmv || '---' },
    { key: 'clinicas', header: 'Clinicas', render: (u: Usuario) =>
      u.clinicas.map(c => <span key={c.clinicaId} className="inline-block mr-1"><StatusBadge status={c.perfil} /></span>)
    },
    { key: 'ativo', header: 'Ativo', render: (u: Usuario) =>
      <button onClick={(e) => { e.stopPropagation(); toggleMutation.mutate(u.id) }} className="text-muted-foreground hover:text-foreground">
        {u.ativo ? <ToggleRight size={20} className="text-green-500" /> : <ToggleLeft size={20} />}
      </button>
    },
    { key: 'criadoEm', header: 'Cadastro', render: (u: Usuario) => formatDate(u.criadoEm) },
  ]

  return (
    <div>
      <PageHeader title="Usuarios" description="Gerenciamento de usuarios do sistema"
        actions={<button onClick={() => { reset(formDefaults); setShowForm(true) }} className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:opacity-90">
          <Plus size={16} /> Novo Usuario
        </button>}
      />

      <DataTable columns={columns} data={users ?? []} loading={isLoading} />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl shadow-lg p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-semibold mb-4">Novo Usuario</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <input {...register('nome')} placeholder="Nome *"
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.nome ? 'border-destructive' : 'border-input'}`} />
                {errors.nome && <p className="text-xs text-destructive mt-1">{errors.nome.message}</p>}
              </div>
              <div>
                <input {...register('email')} type="email" placeholder="E-mail *"
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.email ? 'border-destructive' : 'border-input'}`} />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <input {...register('senha')} type="password" placeholder="Senha *"
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.senha ? 'border-destructive' : 'border-input'}`} />
                {errors.senha && <p className="text-xs text-destructive mt-1">{errors.senha.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input {...register('telefone')} placeholder="Telefone"
                  onChange={(e) => setValue('telefone', maskPhone(e.target.value))}
                  className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
                <input {...register('crmv')} placeholder="CRMV (veterinarios)"
                  className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
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
