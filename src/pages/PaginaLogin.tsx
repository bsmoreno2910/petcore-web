import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { authApi } from '@/api/autenticacao.api'
import { useAuthStore } from '@/stores/autenticacao.store'
import { Logo } from '@/components/shared/Logo'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [carregando, setCarregando] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCarregando(true)

    try {
      const data = await authApi.login({ email, senha })
      const clinicas = data.clinicas.map((c: Record<string, unknown>) => ({
        id: (c.clinicaId || c.id) as string,
        nome: c.nome as string,
        nomeFantasia: c.nomeFantasia as string | undefined,
        perfil: c.perfil as string,
      }))

      setAuth({
        tokenAcesso: data.tokenAcesso,
        tokenAtualizacao: data.tokenAtualizacao,
        usuario: data.usuario,
        clinicas,
      })

      if (data.clinicas.length > 1) {
        navigate('/selecionar-clinica')
      } else {
        navigate('/')
      }
    } catch {
      toast.error('E-mail ou senha inválidos.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-lg p-8">
        <div className="flex flex-col items-center mb-8">
          <Logo size="xl" showText={true} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">E-mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full px-4 py-2.5 border border-input rounded-lg text-sm" placeholder="seu@email.com" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Senha</label>
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required
              className="w-full px-4 py-2.5 border border-input rounded-lg text-sm" placeholder="••••••" />
          </div>
          <button type="submit" disabled={carregando}
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-6">admin@petcore.com / Admin@123</p>
      </div>
    </div>
  )
}
