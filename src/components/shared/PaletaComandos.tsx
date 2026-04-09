import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, PawPrint, Calendar, FileText, Bed, FlaskConical,
  Package, ArrowLeftRight, ClipboardList, DollarSign, Building2,
  BarChart3, Shield, Settings, UserCircle, Stethoscope, Search,
} from 'lucide-react'
import { cn } from '@/lib/utilitarios'

interface CommandItem {
  label: string
  description: string
  icon: React.ElementType
  to: string
}

const commands: CommandItem[] = [
  { label: 'Dashboard', description: 'Visão geral do sistema', icon: LayoutDashboard, to: '/' },
  { label: 'Tutores', description: 'Gerenciar tutores de pacientes', icon: Users, to: '/tutores' },
  { label: 'Pacientes', description: 'Cadastro e consulta de pacientes', icon: PawPrint, to: '/pacientes' },
  { label: 'Agenda', description: 'Agendamentos e consultas', icon: Calendar, to: '/agenda' },
  { label: 'Prontuários', description: 'Prontuários médicos veterinários', icon: FileText, to: '/prontuarios' },
  { label: 'Internações', description: 'Controle de internações', icon: Bed, to: '/internacoes' },
  { label: 'Exames', description: 'Solicitação e resultados de exames', icon: FlaskConical, to: '/exames' },
  { label: 'Produtos', description: 'Catálogo de produtos e insumos', icon: Package, to: '/produtos' },
  { label: 'Movimentações', description: 'Movimentações de estoque', icon: ArrowLeftRight, to: '/movimentacoes' },
  { label: 'Pedidos', description: 'Pedidos de compra e reposição', icon: ClipboardList, to: '/pedidos' },
  { label: 'Financeiro', description: 'Transações e contas a pagar/receber', icon: DollarSign, to: '/financeiro' },
  { label: 'Centros de Custo', description: 'Gerenciar centros de custo', icon: Building2, to: '/centros-custo' },
  { label: 'Relatórios', description: 'Relatórios e exportações', icon: BarChart3, to: '/relatorios' },
  { label: 'Usuários', description: 'Gerenciar usuários do sistema', icon: UserCircle, to: '/usuarios' },
  { label: 'Clínicas', description: 'Gerenciar clínicas cadastradas', icon: Stethoscope, to: '/clinicas' },
  { label: 'Auditoria', description: 'Logs e trilha de auditoria', icon: Shield, to: '/auditoria' },
  { label: 'Configurações', description: 'Configurações do sistema', icon: Settings, to: '/configuracoes' },
]

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    if (!query.trim()) return commands
    const q = query.toLowerCase()
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q),
    )
  }, [query])

  const close = useCallback(() => {
    setIsOpen(false)
    setQuery('')
    setSelectedIndex(0)
  }, [])

  const selectItem = useCallback(
    (item: CommandItem) => {
      navigate(item.to)
      close()
    },
    [navigate, close],
  )

  // Global shortcut listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return
    const items = listRef.current.querySelectorAll('[data-command-item]')
    items[selectedIndex]?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  function handleKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((i) => (i + 1) % filtered.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((i) => (i - 1 + filtered.length) % filtered.length)
        break
      case 'Enter':
        e.preventDefault()
        if (filtered[selectedIndex]) {
          selectItem(filtered[selectedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        close()
        break
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={close}
      />

      {/* Palette */}
      <div
        className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 border-b border-border">
          <Search size={18} className="text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar página ou comando..."
            className="flex-1 py-3.5 text-sm bg-transparent outline-none placeholder:text-muted-foreground text-foreground"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground bg-muted rounded border border-border">
            ESC
          </kbd>
        </div>

        {/* Results list */}
        <div ref={listRef} className="max-h-80 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              Nenhum resultado encontrado.
            </p>
          ) : (
            filtered.map((item, idx) => (
              <button
                key={item.to}
                data-command-item
                onClick={() => selectItem(item)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                  idx === selectedIndex
                    ? 'bg-accent/10 text-accent'
                    : 'text-foreground hover:bg-secondary',
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                    idx === selectedIndex
                      ? 'bg-accent/20 text-accent'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  <item.icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.label}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {item.description}
                  </p>
                </div>
                {idx === selectedIndex && (
                  <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground bg-muted rounded border border-border">
                    Enter
                  </kbd>
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/30">
          <span className="text-[11px] text-muted-foreground">
            {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          </span>
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-muted rounded border border-border text-[10px]">↑↓</kbd>
              navegar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-muted rounded border border-border text-[10px]">Enter</kbd>
              selecionar
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
