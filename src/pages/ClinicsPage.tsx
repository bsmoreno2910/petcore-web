import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, ToggleLeft, ToggleRight, Users } from 'lucide-react'
import { toast } from 'sonner'
import { clinicsApi } from '@/api/clinics.api'
import type { Clinic, ClinicUser } from '@/types/clinic'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'

export default function ClinicsPage() {
  const [showForm, setShowForm] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const qc = useQueryClient()

  const { data: clinics, isLoading } = useQuery({ queryKey: ['clinics'], queryFn: clinicsApi.list })
  const { data: clinicUsers } = useQuery({
    queryKey: ['clinic-users', selectedId],
    queryFn: () => clinicsApi.users(selectedId!),
    enabled: !!selectedId,
  })

  const createMutation = useMutation({
    mutationFn: clinicsApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clinics'] }); setShowForm(false); toast.success('Clínica criada!') },
  })

  const toggleMutation = useMutation({
    mutationFn: clinicsApi.toggleActive,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clinics'] }); toast.success('Status alterado!') },
  })

  const [form, setForm] = useState({ name: '', tradeName: '', cnpj: '', phone: '', email: '', city: '', state: '' })

  return (
    <div>
      <PageHeader title="Clínicas" description="Gerenciamento de unidades"
        actions={<button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:opacity-90">
          <Plus size={16} /> Nova Clínica
        </button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {isLoading ? <p className="text-muted-foreground">Carregando...</p> :
            clinics?.map((c: Clinic) => (
              <div key={c.id} onClick={() => setSelectedId(c.id)}
                className={`bg-card border rounded-xl p-5 cursor-pointer transition-colors ${selectedId === c.id ? 'border-accent' : 'border-border hover:bg-secondary'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{c.name}</h3>
                    {c.tradeName && <p className="text-sm text-muted-foreground">{c.tradeName}</p>}
                    <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                      {c.cnpj && <span>CNPJ: {c.cnpj}</span>}
                      {c.city && <span>{c.city}/{c.state}</span>}
                      {c.phone && <span>{c.phone}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={c.active ? 'Active' : 'Cancelled'} />
                    <button onClick={(e) => { e.stopPropagation(); toggleMutation.mutate(c.id) }} className="text-muted-foreground hover:text-foreground">
                      {c.active ? <ToggleRight size={22} className="text-green-500" /> : <ToggleLeft size={22} />}
                    </button>
                  </div>
                </div>
              </div>
            ))
          }
        </div>

        <div>
          {selectedId && clinicUsers ? (
            <div className="bg-card border border-border rounded-xl p-5 sticky top-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Users size={18} /> Usuários da Clínica</h3>
              {clinicUsers.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhum usuário vinculado.</p>
              ) : (
                <div className="space-y-2">
                  {clinicUsers.map((cu: ClinicUser) => (
                    <div key={cu.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div>
                        <p className="text-sm font-medium">{cu.userName}</p>
                        <p className="text-xs text-muted-foreground">{cu.userEmail}</p>
                      </div>
                      <StatusBadge status={cu.role} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl p-5 text-center text-muted-foreground text-sm">
              Selecione uma clínica para ver os usuários
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl shadow-lg p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-semibold mb-4">Nova Clínica</h3>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form) }} className="space-y-3">
              <input required placeholder="Nome da clínica *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
              <input placeholder="Nome fantasia" value={form.tradeName} onChange={e => setForm({ ...form, tradeName: e.target.value })} className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="CNPJ" value={form.cnpj} onChange={e => setForm({ ...form, cnpj: e.target.value })} className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
                <input placeholder="Telefone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
              </div>
              <input placeholder="E-mail" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Cidade" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
                <input placeholder="UF" maxLength={2} value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
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
