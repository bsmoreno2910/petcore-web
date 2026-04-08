import { Menu, LogOut, User } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'
import { ClinicSwitcher } from './ClinicSwitcher'
import { useNavigate } from 'react-router-dom'

export function Header() {
  const { user, logout } = useAuthStore()
  const { toggleCollapsed } = useUiStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
      <button onClick={toggleCollapsed} className="p-2 rounded-lg hover:bg-secondary transition-colors">
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-4">
        <ClinicSwitcher />

        <div className="flex items-center gap-2 text-sm">
          <User size={16} className="text-muted-foreground" />
          <span>{user?.name}</span>
        </div>

        <button
          onClick={handleLogout}
          className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
          title="Sair"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
