import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/autenticacao.store'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { tokenAcesso, clinicaAtiva, clinicas } = useAuthStore()
  const location = useLocation()

  if (!tokenAcesso) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!clinicaAtiva && clinicas.length > 1 && location.pathname !== '/selecionar-clinica') {
    return <Navigate to="/selecionar-clinica" replace />
  }

  return <>{children}</>
}
