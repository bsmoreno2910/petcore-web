import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/LayoutPrincipal'
import { AuthGuard } from '@/components/layout/GuardaAutenticacao'
import { CommandPalette } from '@/components/shared/PaletaComandos'

// Lazy loading de todas as páginas
const LoginPage = lazy(() => import('@/pages/PaginaLogin'))
const SelectClinicPage = lazy(() => import('@/pages/PaginaSelecionarClinica'))
const DashboardPage = lazy(() => import('@/pages/PaginaDashboard'))
const TutorsPage = lazy(() => import('@/pages/PaginaTutores'))
const TutorDetailPage = lazy(() => import('@/pages/PaginaDetalheTutor'))
const PatientsPage = lazy(() => import('@/pages/PaginaPacientes'))
const PatientDetailPage = lazy(() => import('@/pages/PaginaDetalhePaciente'))
const AgendaPage = lazy(() => import('@/pages/PaginaAgenda'))
const MedicalRecordsPage = lazy(() => import('@/pages/PaginaProntuarios'))
const HospitalizationsPage = lazy(() => import('@/pages/PaginaInternacoes'))
const ExamsPage = lazy(() => import('@/pages/PaginaExames'))
const ProductsPage = lazy(() => import('@/pages/PaginaProdutos'))
const MovementsPage = lazy(() => import('@/pages/PaginaMovimentacoes'))
const OrdersPage = lazy(() => import('@/pages/PaginaPedidos'))
const FinancialPage = lazy(() => import('@/pages/PaginaFinanceiro'))
const CostCentersPage = lazy(() => import('@/pages/PaginaCentrosCusto'))
const ReportsPage = lazy(() => import('@/pages/PaginaRelatorios'))
const UsersPage = lazy(() => import('@/pages/PaginaUsuarios'))
const ClinicsPage = lazy(() => import('@/pages/PaginaClinicas'))
const AuditPage = lazy(() => import('@/pages/PaginaAuditoria'))
const SettingsPage = lazy(() => import('@/pages/PaginaConfiguracoes'))
const PermissionsPage = lazy(() => import('@/pages/PaginaPermissoes'))
const MedicalRecordDetailPage = lazy(() => import('@/pages/PaginaDetalheProntuario'))
const HospitalizationDetailPage = lazy(() => import('@/pages/PaginaDetalheInternacao'))
const ExamDetailPage = lazy(() => import('@/pages/PaginaDetalheExame'))
const OrderDetailPage = lazy(() => import('@/pages/PaginaDetalhePedido'))
const ProductDetailPage = lazy(() => import('@/pages/PaginaDetalheProduto'))

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CommandPalette />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/selecionar-clinica" element={<SelectClinicPage />} />

        <Route element={<AuthGuard><AppLayout /></AuthGuard>}>
          <Route index element={<DashboardPage />} />
          <Route path="tutores" element={<TutorsPage />} />
          <Route path="tutores/:id" element={<TutorDetailPage />} />
          <Route path="pacientes" element={<PatientsPage />} />
          <Route path="pacientes/:id" element={<PatientDetailPage />} />
          <Route path="agenda" element={<AgendaPage />} />
          <Route path="prontuarios" element={<MedicalRecordsPage />} />
          <Route path="prontuarios/:id" element={<MedicalRecordDetailPage />} />
          <Route path="internacoes" element={<HospitalizationsPage />} />
          <Route path="internacoes/:id" element={<HospitalizationDetailPage />} />
          <Route path="exames" element={<ExamsPage />} />
          <Route path="exames/:id" element={<ExamDetailPage />} />
          <Route path="produtos" element={<ProductsPage />} />
          <Route path="produtos/:id" element={<ProductDetailPage />} />
          <Route path="movimentacoes" element={<MovementsPage />} />
          <Route path="pedidos" element={<OrdersPage />} />
          <Route path="pedidos/:id" element={<OrderDetailPage />} />
          <Route path="financeiro" element={<FinancialPage />} />
          <Route path="centros-custo" element={<CostCentersPage />} />
          <Route path="relatorios" element={<ReportsPage />} />
          <Route path="usuarios" element={<UsersPage />} />
          <Route path="clinicas" element={<ClinicsPage />} />
          <Route path="auditoria" element={<AuditPage />} />
          <Route path="permissoes" element={<PermissionsPage />} />
          <Route path="configuracoes" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
