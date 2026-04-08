import { Menu, LogOut, User, Sun, Moon, Monitor, Building2, ChevronDown, Check, Settings } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'
import { authApi } from '@/api/auth.api'
import { useNavigate } from 'react-router-dom'

export function Header() {
  const { user, logout, activeClinic, clinics, setActiveClinic, setTokens } = useAuthStore()
  const { theme, setTheme, toggleCollapsed } = useUiStore()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    setOpen(false)
    logout()
    navigate('/login')
  }

  const handleSwitchClinic = async (clinic: typeof clinics[0]) => {
    try {
      const result = await authApi.selectClinic(clinic.id)
      setTokens(result.accessToken, result.refreshToken)
      setActiveClinic(clinic)
      setOpen(false)
      window.location.reload()
    } catch { /* silent */ }
  }

  const themes = [
    { value: 'light' as const, icon: Sun, label: 'Claro' },
    { value: 'dark' as const, icon: Moon, label: 'Escuro' },
    { value: 'system' as const, icon: Monitor, label: 'Sistema' },
  ]

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <button onClick={toggleCollapsed} className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <Menu size={20} />
        </button>
      </div>

      <div className="relative">
        <button onClick={() => setOpen(!open)}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-secondary transition-colors">
          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
            <User size={16} className="text-accent" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium leading-tight">{user?.name}</p>
            <p className="text-xs text-muted-foreground leading-tight">{activeClinic?.name}</p>
          </div>
          <ChevronDown size={14} className="text-muted-foreground" />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full mt-1 w-72 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">

              {/* Header do menu */}
              <div className="px-4 py-3 border-b border-border bg-muted/30">
                <p className="text-sm font-semibold">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
                {activeClinic && (
                  <p className="text-xs text-accent mt-0.5">{activeClinic.role}</p>
                )}
              </div>

              {/* Clínica ativa */}
              {clinics.length > 1 && (
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-1 mb-1">
                    Clínica
                  </p>
                  {clinics.map(c => (
                    <button key={c.id} onClick={() => handleSwitchClinic(c)}
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm hover:bg-secondary transition-colors">
                      <div className="flex items-center gap-2">
                        <Building2 size={14} className="text-muted-foreground" />
                        <span>{c.name}</span>
                      </div>
                      {activeClinic?.id === c.id && <Check size={14} className="text-accent" />}
                    </button>
                  ))}
                </div>
              )}

              {/* Tema */}
              <div className="px-3 py-2 border-b border-border">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-1 mb-1">
                  Tema
                </p>
                <div className="flex gap-1">
                  {themes.map(t => (
                    <button key={t.value}
                      onClick={() => setTheme(t.value)}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs transition-colors ${
                        theme === t.value ? 'bg-accent/10 text-accent font-medium' : 'hover:bg-secondary text-muted-foreground'
                      }`}>
                      <t.icon size={13} />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ações */}
              <div className="px-3 py-2">
                <button onClick={() => { setOpen(false); navigate('/settings') }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-secondary transition-colors text-foreground">
                  <Settings size={14} />
                  Configurações
                </button>
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-destructive/10 transition-colors text-destructive">
                  <LogOut size={14} />
                  Sair
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
