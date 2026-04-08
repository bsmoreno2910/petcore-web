import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authApi } from '@/api/auth.api'
import { useAuthStore } from '@/stores/auth.store'
import { PageHeader } from '@/components/shared/PageHeader'

export default function SettingsPage() {
  const { user } = useAuthStore()
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

  const changePwMutation = useMutation({
    mutationFn: () => authApi.changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword }),
    onSuccess: () => { toast.success('Senha alterada com sucesso!'); setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' }) },
    onError: () => toast.error('Erro ao alterar senha. Verifique a senha atual.'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('As senhas não coincidem.')
      return
    }
    if (passwords.newPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres.')
      return
    }
    changePwMutation.mutate()
  }

  return (
    <div>
      <PageHeader title="Configurações" description="Perfil e preferências" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4">Perfil</h3>
          <div className="space-y-3 text-sm">
            <div>
              <label className="text-muted-foreground">Nome</label>
              <p className="font-medium">{user?.name}</p>
            </div>
            <div>
              <label className="text-muted-foreground">E-mail</label>
              <p className="font-medium">{user?.email}</p>
            </div>
            {user?.crmv && (
              <div>
                <label className="text-muted-foreground">CRMV</label>
                <p className="font-medium">{user.crmv}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4">Alterar Senha</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input type="password" required placeholder="Senha atual *" value={passwords.currentPassword}
              onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
            <input type="password" required placeholder="Nova senha *" value={passwords.newPassword}
              onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
            <input type="password" required placeholder="Confirmar nova senha *" value={passwords.confirmPassword}
              onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
            <button type="submit" disabled={changePwMutation.isPending}
              className="w-full py-2 bg-accent text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">
              {changePwMutation.isPending ? 'Alterando...' : 'Alterar Senha'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
