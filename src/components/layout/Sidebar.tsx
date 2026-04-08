import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, PawPrint, Calendar, FileText, Bed, FlaskConical,
  Package, ArrowLeftRight, ClipboardList, DollarSign, Building2,
  BarChart3, Shield, Settings, UserCircle, Stethoscope,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'
import { hasPermission } from '@/lib/permissions'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/', permission: null },
  { label: 'Tutores', icon: Users, to: '/tutors', permission: 'tutors.manage' },
  { label: 'Pacientes', icon: PawPrint, to: '/patients', permission: 'patients.manage' },
  { label: 'Agenda', icon: Calendar, to: '/agenda', permission: 'agenda.view' },
  { label: 'Prontuários', icon: FileText, to: '/medical-records', permission: 'medical.view' },
  { label: 'Internações', icon: Bed, to: '/hospitalizations', permission: 'hospitalization.manage' },
  { label: 'Exames', icon: FlaskConical, to: '/exams', permission: 'exams.view' },
  { label: 'Produtos', icon: Package, to: '/products', permission: 'stock.view' },
  { label: 'Movimentações', icon: ArrowLeftRight, to: '/movements', permission: 'stock.operate' },
  { label: 'Pedidos', icon: ClipboardList, to: '/orders', permission: 'stock.operate' },
  { label: 'Financeiro', icon: DollarSign, to: '/financial', permission: 'financial.view' },
  { label: 'Centros de Custo', icon: Building2, to: '/cost-centers', permission: 'costs.view' },
  { label: 'Relatórios', icon: BarChart3, to: '/reports', permission: 'reports.export' },
  { label: 'Usuários', icon: UserCircle, to: '/users', permission: 'users.manage' },
  { label: 'Clínicas', icon: Stethoscope, to: '/clinics', permission: 'clinics.manage' },
  { label: 'Auditoria', icon: Shield, to: '/audit', permission: 'audit.view' },
  { label: 'Configurações', icon: Settings, to: '/settings', permission: null },
]

export function Sidebar() {
  const role = useAuthStore((s) => s.getRole())
  const { sidebarCollapsed } = useUiStore()

  return (
    <aside
      className={cn(
        'h-screen bg-sidebar border-r border-border flex flex-col transition-all duration-200',
        sidebarCollapsed ? 'w-16' : 'w-64',
      )}
    >
      <div className="h-16 flex items-center justify-center border-b border-border px-4">
        {!sidebarCollapsed && (
          <span className="text-xl font-bold text-primary">PetCore</span>
        )}
        {sidebarCollapsed && (
          <span className="text-xl font-bold text-primary">P</span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {navItems
          .filter((item) => !item.permission || hasPermission(role, item.permission))
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                  'hover:bg-secondary',
                  isActive
                    ? 'bg-accent/10 text-accent font-medium border-r-2 border-accent'
                    : 'text-sidebar-foreground',
                  sidebarCollapsed && 'justify-center px-2',
                )
              }
            >
              <item.icon size={20} />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
      </nav>
    </aside>
  )
}
