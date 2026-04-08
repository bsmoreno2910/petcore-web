import api from './client'
import type { DashboardSummary, DashboardAppointment, StockAlert } from '@/types/dashboard'

export const dashboardApi = {
  summary: () =>
    api.get<DashboardSummary>('/api/dashboard/summary').then(r => r.data),

  appointmentsToday: () =>
    api.get<DashboardAppointment[]>('/api/dashboard/appointments-today').then(r => r.data),

  financialSummary: () =>
    api.get('/api/dashboard/financial-summary').then(r => r.data),

  stockAlerts: () =>
    api.get<StockAlert[]>('/api/dashboard/stock-alerts').then(r => r.data),

  hospitalizationsActive: () =>
    api.get('/api/dashboard/hospitalizations-active').then(r => r.data),

  topServices: () =>
    api.get('/api/dashboard/top-services').then(r => r.data),

  patientsChart: () =>
    api.get('/api/dashboard/patients-chart').then(r => r.data),
}
