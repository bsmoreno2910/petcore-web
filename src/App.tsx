import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { AuthGuard } from '@/components/layout/AuthGuard'
import LoginPage from '@/pages/LoginPage'
import SelectClinicPage from '@/pages/SelectClinicPage'
import DashboardPage from '@/pages/DashboardPage'
import TutorsPage from '@/pages/TutorsPage'
import TutorDetailPage from '@/pages/TutorDetailPage'
import PatientsPage from '@/pages/PatientsPage'
import PatientDetailPage from '@/pages/PatientDetailPage'
import AgendaPage from '@/pages/AgendaPage'
import MedicalRecordsPage from '@/pages/MedicalRecordsPage'
import HospitalizationsPage from '@/pages/HospitalizationsPage'
import ExamsPage from '@/pages/ExamsPage'
import ProductsPage from '@/pages/ProductsPage'
import MovementsPage from '@/pages/MovementsPage'
import OrdersPage from '@/pages/OrdersPage'
import FinancialPage from '@/pages/FinancialPage'
import CostCentersPage from '@/pages/CostCentersPage'
import ReportsPage from '@/pages/ReportsPage'
import UsersPage from '@/pages/UsersPage'
import ClinicsPage from '@/pages/ClinicsPage'
import AuditPage from '@/pages/AuditPage'
import SettingsPage from '@/pages/SettingsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/select-clinic" element={<SelectClinicPage />} />

      <Route
        element={
          <AuthGuard>
            <AppLayout />
          </AuthGuard>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="tutors" element={<TutorsPage />} />
        <Route path="tutors/:id" element={<TutorDetailPage />} />
        <Route path="patients" element={<PatientsPage />} />
        <Route path="patients/:id" element={<PatientDetailPage />} />
        <Route path="agenda" element={<AgendaPage />} />
        <Route path="medical-records" element={<MedicalRecordsPage />} />
        <Route path="hospitalizations" element={<HospitalizationsPage />} />
        <Route path="exams" element={<ExamsPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="movements" element={<MovementsPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="financial" element={<FinancialPage />} />
        <Route path="cost-centers" element={<CostCentersPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="clinics" element={<ClinicsPage />} />
        <Route path="audit" element={<AuditPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
