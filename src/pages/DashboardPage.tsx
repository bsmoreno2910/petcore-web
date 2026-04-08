import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/api/dashboard.api'
import { PageHeader } from '@/components/shared/PageHeader'
import { formatCurrency } from '@/lib/utils'
import {
  PawPrint, Users, Calendar, Bed, FlaskConical,
  Package, TrendingUp, TrendingDown,
} from 'lucide-react'

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: string | number; color: string
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: dashboardApi.summary,
  })

  if (isLoading || !summary) {
    return <div className="text-muted-foreground">Carregando dashboard...</div>
  }

  return (
    <div>
      <PageHeader title="Dashboard" description="Visão geral da clínica" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={PawPrint} label="Pacientes" value={summary.totalPatients} color="bg-blue-500" />
        <StatCard icon={Users} label="Tutores" value={summary.totalTutors} color="bg-indigo-500" />
        <StatCard icon={Calendar} label="Agenda Hoje" value={summary.appointmentsToday} color="bg-cyan-500" />
        <StatCard icon={Bed} label="Internados" value={summary.activeHospitalizations} color="bg-yellow-500" />
        <StatCard icon={FlaskConical} label="Exames Pendentes" value={summary.pendingExams} color="bg-purple-500" />
        <StatCard icon={Package} label="Estoque Baixo" value={summary.lowStockProducts} color="bg-red-500" />
        <StatCard icon={TrendingUp} label="Receita do Mês" value={formatCurrency(summary.monthlyRevenue)} color="bg-green-500" />
        <StatCard icon={TrendingDown} label="Despesa do Mês" value={formatCurrency(summary.monthlyExpense)} color="bg-orange-500" />
      </div>
    </div>
  )
}
