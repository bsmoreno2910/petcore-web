import { Menu, LogOut, User, Sun, Moon, Monitor, Building2, ChevronDown, Check, Settings } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'
import { authApi } from '@/api/auth.api'
import { useNavigate } from 'react-router-dom'
import { Logo } from '@/components/shared/Logo'

export function Header() {
  const { usuario, logout, clinicaAtiva, clinicas, setClinicaAtiva, setTokens } = useAuthStore()
  const { theme, setTheme, toggleCollapsed, sidebarOpen, setSidebarOpen } = useUiStore()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => { setOpen(false); logout(); navigate('/login') }

  const handleTrocarClinica = async (clinica: typeof clinicas[0]) => {
    try {
      const resultado = await authApi.selecionarClinica(clinica.id)
      setTokens(resultado.tokenAcesso, resultado.tokenAtualizacao)
      setClinicaAtiva(clinica)
      setOpen(false)
      window.location.reload()
    } catch { /* silent */ }
  }

  const handleMenuClick = () => {
    // On mobile: toggle the sidebar overlay
    if (window.innerWidth < 768) {
      setSidebarOpen(!sidebarOpen)
    } else {
      // On desktop: toggle sidebar collapse
      toggleCollapsed()
    }
  }

  const temas = [
    { value: 'light' as const, icon: Sun, label: 'Claro' },
    { value: 'dark' as const, icon: Moon, label: 'Escuro' },
    { value: 'system' as const, icon: Monitor, label: 'Sistema' },
  ]

  return (
    <header className="h-14 md:h-16 border-b border-border bg-card flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button onClick={handleMenuClick} className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <Menu size={20} />
        </button>
        {/* Mobile: show logo in header */}
        <div className="md:hidden">
          <Logo size="sm" showText />
        </div>
      </div>

      {/* Keyboard shortcut hint - desktop only */}
      <div className="hidden lg:flex items-center">
        <button
          onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground bg-muted/50 border border-border rounded-lg hover:bg-muted transition-colors"
        >
          <span>Buscar...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-medium bg-muted rounded border border-border">Ctrl+K</kbd>
        </button>
      </div>

      <div className="relative">
        <button onClick={() => setOpen(!open)} className="flex items-center gap-2 md:gap-2.5 px-2 md:px-3 py-2 rounded-lg hover:bg-secondary transition-colors">
          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center"><User size={16} className="text-accent" /></div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium leading-tight">{usuario?.nome}</p>
            <p className="text-xs text-muted-foreground leading-tight">{clinicaAtiva?.nome}</p>
          </div>
          <ChevronDown size={14} className="text-muted-foreground hidden sm:block" />
        </button>

        {open && (<>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-72 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30">
              <p className="text-sm font-semibold">{usuario?.nome}</p>
              <p className="text-xs text-muted-foreground">{usuario?.email}</p>
              {clinicaAtiva && <p className="text-xs text-accent mt-0.5">{clinicaAtiva.perfil}</p>}
            </div>

            {clinicas.length > 1 && (
              <div className="px-3 py-2 border-b border-border">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-1 mb-1">Clinica</p>
                {clinicas.map(c => (
                  <button key={c.id} onClick={() => handleTrocarClinica(c)}
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm hover:bg-secondary transition-colors">
                    <div className="flex items-center gap-2"><Building2 size={14} className="text-muted-foreground" /><span>{c.nome}</span></div>
                    {clinicaAtiva?.id === c.id && <Check size={14} className="text-accent" />}
                  </button>
                ))}
              </div>
            )}

            <div className="px-3 py-2 border-b border-border">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-1 mb-1">Tema</p>
              <div className="flex gap-1">
                {temas.map(t => (
                  <button key={t.value} onClick={() => setTheme(t.value)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs transition-colors ${theme === t.value ? 'bg-accent/10 text-accent font-medium' : 'hover:bg-secondary text-muted-foreground'}`}>
                    <t.icon size={13} />{t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-3 py-2">
              <button onClick={() => { setOpen(false); navigate('/configuracoes') }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-secondary transition-colors text-foreground">
                <Settings size={14} />Configurações
              </button>
              <button onClick={handleLogout}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-destructive/10 transition-colors text-destructive">
                <LogOut size={14} />Sair
              </button>
            </div>
          </div>
        </>)}
      </div>
    </header>
  )
}
