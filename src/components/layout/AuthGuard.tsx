import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { accessToken, activeClinic, clinics } = useAuthStore()
  const location = useLocation()

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!activeClinic && clinics.length > 1 && location.pathname !== '/select-clinic') {
    return <Navigate to="/select-clinic" replace />
  }

  return <>{children}</>
}
