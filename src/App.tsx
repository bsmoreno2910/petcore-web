import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { AuthGuard } from '@/components/layout/AuthGuard'
import LoginPage from '@/pages/LoginPage'
import SelectClinicPage from '@/pages/SelectClinicPage'
import DashboardPage from '@/pages/DashboardPage'

function EmDesenvolvimento({ titulo }: { titulo: string }) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground">{titulo}</h2>
        <p className="text-muted-foreground mt-2">Em desenvolvimento...</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/selecionar-clinica" element={<SelectClinicPage />} />

      <Route element={<AuthGuard><AppLayout /></AuthGuard>}>
        <Route index element={<DashboardPage />} />
        <Route path="tutores" element={<EmDesenvolvimento titulo="Tutores" />} />
        <Route path="tutores/:id" element={<EmDesenvolvimento titulo="Detalhe do Tutor" />} />
        <Route path="pacientes" element={<EmDesenvolvimento titulo="Pacientes" />} />
        <Route path="pacientes/:id" element={<EmDesenvolvimento titulo="Detalhe do Paciente" />} />
        <Route path="agenda" element={<EmDesenvolvimento titulo="Agenda" />} />
        <Route path="prontuarios" element={<EmDesenvolvimento titulo="Prontuários" />} />
        <Route path="internacoes" element={<EmDesenvolvimento titulo="Internações" />} />
        <Route path="exames" element={<EmDesenvolvimento titulo="Exames" />} />
        <Route path="produtos" element={<EmDesenvolvimento titulo="Produtos" />} />
        <Route path="movimentacoes" element={<EmDesenvolvimento titulo="Movimentações" />} />
        <Route path="pedidos" element={<EmDesenvolvimento titulo="Pedidos" />} />
        <Route path="financeiro" element={<EmDesenvolvimento titulo="Financeiro" />} />
        <Route path="centros-custo" element={<EmDesenvolvimento titulo="Centros de Custo" />} />
        <Route path="relatorios" element={<EmDesenvolvimento titulo="Relatórios" />} />
        <Route path="usuarios" element={<EmDesenvolvimento titulo="Usuários" />} />
        <Route path="clinicas" element={<EmDesenvolvimento titulo="Clínicas" />} />
        <Route path="auditoria" element={<EmDesenvolvimento titulo="Auditoria" />} />
        <Route path="configuracoes" element={<EmDesenvolvimento titulo="Configurações" />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
