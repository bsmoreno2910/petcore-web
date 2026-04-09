import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authApi } from '@/api/autenticacao.api'
import { useAuthStore } from '@/stores/autenticacao.store'
import { PageHeader } from '@/components/shared/CabecalhoPagina'

export default function SettingsPage() {
  const { usuario } = useAuthStore()
  const [passwords, setPasswords] = useState({ senhaAtual: '', novaSenha: '', confirmarSenha: '' })

  const changePwMutation = useMutation({
    mutationFn: () => authApi.alterarSenha(passwords.senhaAtual, passwords.novaSenha),
    onSuccess: () => { toast.success('Senha alterada com sucesso!'); setPasswords({ senhaAtual: '', novaSenha: '', confirmarSenha: '' }) },
    onError: () => toast.error('Erro ao alterar senha. Verifique a senha atual.'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwords.novaSenha !== passwords.confirmarSenha) {
      toast.error('As senhas não coincidem.')
      return
    }
    if (passwords.novaSenha.length < 6) {
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
              <p className="font-medium">{usuario?.nome}</p>
            </div>
            <div>
              <label className="text-muted-foreground">E-mail</label>
              <p className="font-medium">{usuario?.email}</p>
            </div>
            {usuario?.crmv && (
              <div>
                <label className="text-muted-foreground">CRMV</label>
                <p className="font-medium">{usuario.crmv}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4">Alterar Senha</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input type="password" required placeholder="Senha atual *" value={passwords.senhaAtual}
              onChange={e => setPasswords({ ...passwords, senhaAtual: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
            <input type="password" required placeholder="Nova senha *" value={passwords.novaSenha}
              onChange={e => setPasswords({ ...passwords, novaSenha: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-lg text-sm" />
            <input type="password" required placeholder="Confirmar nova senha *" value={passwords.confirmarSenha}
              onChange={e => setPasswords({ ...passwords, confirmarSenha: e.target.value })}
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
