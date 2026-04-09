import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/api/painel.api'
import { PageHeader } from '@/components/shared/CabecalhoPagina'
import { formatCurrency } from '@/lib/utilitarios'
import {
  PawPrint, Users, Calendar, Bed, FlaskConical,
  Package, TrendingUp, TrendingDown,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'

const PIE_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316']

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: string | number; color: string
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${color}`}><Icon size={22} className="text-white" /></div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { data: resumo, isLoading } = useQuery({
    queryKey: ['dashboard-resumo'],
    queryFn: dashboardApi.resumo,
  })

  const { data: receitaDespesa } = useQuery({
    queryKey: ['dashboard-receita-despesa'],
    queryFn: dashboardApi.receitaDespesaMensal,
  })

  const { data: agendamentosTipo } = useQuery({
    queryKey: ['dashboard-agendamentos-tipo'],
    queryFn: dashboardApi.agendamentosPorTipo,
  })

  if (isLoading || !resumo) return <div className="text-muted-foreground">Carregando dashboard...</div>

  return (
    <div>
      <PageHeader title="Dashboard" description="Visao geral da clinica" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={PawPrint} label="Pacientes" value={resumo.totalPacientes} color="bg-blue-500" />
        <StatCard icon={Users} label="Tutores" value={resumo.totalTutores} color="bg-indigo-500" />
        <StatCard icon={Calendar} label="Agenda Hoje" value={resumo.agendamentosHoje} color="bg-cyan-500" />
        <StatCard icon={Bed} label="Internados" value={resumo.internacoesAtivas} color="bg-yellow-500" />
        <StatCard icon={FlaskConical} label="Exames Pendentes" value={resumo.examesPendentes} color="bg-purple-500" />
        <StatCard icon={Package} label="Estoque Baixo" value={resumo.produtosEstoqueBaixo} color="bg-red-500" />
        <StatCard icon={TrendingUp} label="Receita do Mes" value={formatCurrency(resumo.receitaMensal)} color="bg-green-500" />
        <StatCard icon={TrendingDown} label="Despesa do Mes" value={formatCurrency(resumo.despesaMensal)} color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Revenue vs Expenses */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold mb-4">Receitas x Despesas</h3>
          {receitaDespesa && receitaDespesa.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={receitaDespesa}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
                <YAxis tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" tickFormatter={(v) => `R$${v.toLocaleString('pt-BR')}`} />
                <Tooltip formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '']} />
                <Legend />
                <Bar dataKey="receita" name="Receita" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="despesa" name="Despesa" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm">Sem dados de transacoes para exibir.</p>
          )}
        </div>

        {/* Chart 2: Appointments by type */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold mb-4">Agendamentos por Tipo</h3>
          {agendamentosTipo && agendamentosTipo.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={agendamentosTipo}
                  dataKey="quantidade"
                  nameKey="tipo"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ tipo, quantidade }) => `${tipo}: ${quantidade}`}
                >
                  {agendamentosTipo.map((_entry, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number, name: string) => [value, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm">Sem agendamentos nos ultimos 30 dias.</p>
          )}
        </div>
      </div>
    </div>
  )
}
