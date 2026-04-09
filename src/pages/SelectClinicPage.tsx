import { useNavigate } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { authApi } from '@/api/auth.api'
import { Logo } from '@/components/shared/Logo'

export default function SelectClinicPage() {
  const { clinicas, setClinicaAtiva, setTokens } = useAuthStore()
  const navigate = useNavigate()

  const handleSelect = async (clinica: typeof clinicas[0]) => {
    try {
      const resultado = await authApi.selecionarClinica(clinica.id)
      setTokens(resultado.tokenAcesso, resultado.tokenAtualizacao)
      setClinicaAtiva(clinica)
      navigate('/')
    } catch { /* silent */ }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <div className="w-full max-w-lg bg-card rounded-2xl shadow-lg p-8">
        <div className="flex flex-col items-center mb-8">
          <Logo size="lg" showText={true} className="mb-4" />
          <h2 className="text-lg font-semibold text-foreground">Selecione a Clínica</h2>
          <p className="text-sm text-muted-foreground mt-1">Escolha a unidade que deseja acessar</p>
        </div>

        <div className="space-y-3">
          {clinicas.map((clinica) => (
            <button key={clinica.id} onClick={() => handleSelect(clinica)}
              className="w-full flex items-center gap-4 p-4 border border-border rounded-xl hover:bg-secondary transition-colors text-left">
              <Building2 size={24} className="text-accent" />
              <div>
                <p className="font-medium">{clinica.nome}</p>
                <p className="text-sm text-muted-foreground">{clinica.perfil}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
