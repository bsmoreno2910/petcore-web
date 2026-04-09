import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Logo } from '@/components/shared/Logo'
import {
  LayoutDashboard, Users, PawPrint, Calendar, FileText, Bed, FlaskConical,
  Package, ArrowLeftRight, ClipboardList, DollarSign, Building2,
  BarChart3, Shield, Settings, UserCircle, Stethoscope, ChevronDown,
  Clipboard, Warehouse, Banknote, Cog, X,
} from 'lucide-react'
import { useAuthStore } from '@/stores/autenticacao.store'
import { useUiStore } from '@/stores/interface.store'
import { hasPermission } from '@/lib/permissoes'
import { cn } from '@/lib/utilitarios'

interface NavItem {
  label: string
  icon: React.ElementType
  to: string
  permission: string | null
}

interface NavGroup {
  label: string
  icon: React.ElementType
  items: NavItem[]
}

type NavEntry = NavItem | NavGroup

function isGroup(entry: NavEntry): entry is NavGroup {
  return 'items' in entry
}

const navigation: NavEntry[] = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/', permission: null },

  {
    label: 'Cadastros',
    icon: Clipboard,
    items: [
      { label: 'Tutores', icon: Users, to: '/tutores', permission: 'tutors.manage' },
      { label: 'Pacientes', icon: PawPrint, to: '/pacientes', permission: 'patients.manage' },
    ],
  },

  {
    label: 'Atendimento',
    icon: Stethoscope,
    items: [
      { label: 'Agenda', icon: Calendar, to: '/agenda', permission: 'agenda.view' },
      { label: 'Prontuários', icon: FileText, to: '/prontuarios', permission: 'medical.view' },
      { label: 'Internações', icon: Bed, to: '/internacoes', permission: 'hospitalization.manage' },
      { label: 'Exames', icon: FlaskConical, to: '/exames', permission: 'exams.view' },
    ],
  },

  {
    label: 'Estoque',
    icon: Warehouse,
    items: [
      { label: 'Produtos', icon: Package, to: '/produtos', permission: 'stock.view' },
      { label: 'Movimentações', icon: ArrowLeftRight, to: '/movimentacoes', permission: 'stock.operate' },
      { label: 'Pedidos', icon: ClipboardList, to: '/pedidos', permission: 'stock.operate' },
    ],
  },

  {
    label: 'Financeiro',
    icon: Banknote,
    items: [
      { label: 'Transações', icon: DollarSign, to: '/financeiro', permission: 'financial.view' },
      { label: 'Centros de Custo', icon: Building2, to: '/centros-custo', permission: 'costs.view' },
      { label: 'Relatórios', icon: BarChart3, to: '/relatorios', permission: 'reports.export' },
    ],
  },

  {
    label: 'Administração',
    icon: Cog,
    items: [
      { label: 'Usuários', icon: UserCircle, to: '/usuarios', permission: 'users.manage' },
      { label: 'Clínicas', icon: Stethoscope, to: '/clinicas', permission: 'clinics.manage' },
      { label: 'Auditoria', icon: Shield, to: '/auditoria', permission: 'audit.view' },
      { label: 'Permissões', icon: Shield, to: '/permissoes', permission: 'users.manage' },
      { label: 'Configurações', icon: Settings, to: '/configuracoes', permission: null },
    ],
  },
]

function SidebarItem({ item, collapsed, onNavigate }: { item: NavItem; collapsed: boolean; onNavigate?: () => void }) {
  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-4 py-2 text-sm transition-colors rounded-md mx-2',
          'hover:bg-secondary',
          isActive
            ? 'bg-accent/10 text-accent font-medium'
            : 'text-sidebar-foreground',
          collapsed && 'justify-center px-2 mx-1',
        )
      }
    >
      <item.icon size={18} />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  )
}

function SidebarGroup({ group, collapsed, role, onNavigate }: { group: NavGroup; collapsed: boolean; role: string | null; onNavigate?: () => void }) {
  const [open, setOpen] = useState(true)

  const visibleItems = group.items.filter(
    (item) => !item.permission || hasPermission(role, item.permission),
  )

  if (visibleItems.length === 0) return null

  if (collapsed) {
    return (
      <div className="py-1">
        {visibleItems.map((item) => (
          <SidebarItem key={item.to} item={item} collapsed onNavigate={onNavigate} />
        ))}
      </div>
    )
  }

  return (
    <div className="py-1">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
      >
        <div className="flex items-center gap-2">
          <group.icon size={14} />
          <span>{group.label}</span>
        </div>
        <ChevronDown
          size={14}
          className={cn('transition-transform', open ? '' : '-rotate-90')}
        />
      </button>

      {open && (
        <div className="space-y-0.5">
          {visibleItems.map((item) => (
            <SidebarItem key={item.to} item={item} collapsed={false} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  )
}

function SidebarContent({ collapsed, role, onNavigate }: { collapsed: boolean; role: string | null; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 overflow-y-auto py-2 space-y-1">
      {navigation.map((entry) => {
        if (isGroup(entry)) {
          return (
            <SidebarGroup
              key={entry.label}
              group={entry}
              collapsed={collapsed}
              role={role}
              onNavigate={onNavigate}
            />
          )
        }

        if (entry.permission && !hasPermission(role, entry.permission)) return null

        return (
          <SidebarItem
            key={entry.to}
            item={entry}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        )
      })}
    </nav>
  )
}

export function Sidebar() {
  const role = useAuthStore((s) => s.getPerfil())
  const { sidebarCollapsed, sidebarOpen, setSidebarOpen } = useUiStore()

  const handleMobileNavigate = () => {
    setSidebarOpen(false)
  }

  return (
    <>
      {/* Desktop sidebar - static in flex layout, always visible on md+ */}
      <aside
        className={cn(
          'hidden md:flex h-screen bg-sidebar border-r border-border flex-col transition-all duration-300 shrink-0',
          sidebarCollapsed ? 'w-16' : 'w-64',
        )}
      >
        <div className="h-16 flex items-center justify-between border-b border-border px-3">
          <Logo size={sidebarCollapsed ? 'sm' : 'md'} showText={!sidebarCollapsed} />
        </div>
        <SidebarContent collapsed={sidebarCollapsed} role={role} />
      </aside>

      {/* Mobile sidebar - fixed overlay, only visible when sidebarOpen */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-border flex flex-col transition-transform duration-300 md:hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="h-16 flex items-center justify-between border-b border-border px-3">
          <Logo size="md" showText />
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <SidebarContent collapsed={false} role={role} onNavigate={handleMobileNavigate} />
      </aside>
    </>
  )
}
