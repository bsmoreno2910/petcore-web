import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { AuthGuard } from '@/components/layout/AuthGuard'
import { CommandPalette } from '@/components/shared/CommandPalette'

// Lazy loading de todas as páginas
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const SelectClinicPage = lazy(() => import('@/pages/SelectClinicPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const TutorsPage = lazy(() => import('@/pages/TutorsPage'))
const TutorDetailPage = lazy(() => import('@/pages/TutorDetailPage'))
const PatientsPage = lazy(() => import('@/pages/PatientsPage'))
const PatientDetailPage = lazy(() => import('@/pages/PatientDetailPage'))
const AgendaPage = lazy(() => import('@/pages/AgendaPage'))
const MedicalRecordsPage = lazy(() => import('@/pages/MedicalRecordsPage'))
const HospitalizationsPage = lazy(() => import('@/pages/HospitalizationsPage'))
const ExamsPage = lazy(() => import('@/pages/ExamsPage'))
const ProductsPage = lazy(() => import('@/pages/ProductsPage'))
const MovementsPage = lazy(() => import('@/pages/MovementsPage'))
const OrdersPage = lazy(() => import('@/pages/OrdersPage'))
const FinancialPage = lazy(() => import('@/pages/FinancialPage'))
const CostCentersPage = lazy(() => import('@/pages/CostCentersPage'))
const ReportsPage = lazy(() => import('@/pages/ReportsPage'))
const UsersPage = lazy(() => import('@/pages/UsersPage'))
const ClinicsPage = lazy(() => import('@/pages/ClinicsPage'))
const AuditPage = lazy(() => import('@/pages/AuditPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const MedicalRecordDetailPage = lazy(() => import('@/pages/MedicalRecordDetailPage'))
const HospitalizationDetailPage = lazy(() => import('@/pages/HospitalizationDetailPage'))
const ExamDetailPage = lazy(() => import('@/pages/ExamDetailPage'))
const OrderDetailPage = lazy(() => import('@/pages/OrderDetailPage'))
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'))

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
          <Route path="configuracoes" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
