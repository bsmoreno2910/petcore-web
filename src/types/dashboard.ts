export interface DashboardSummary {
  totalPatients: number
  totalTutors: number
  appointmentsToday: number
  activeHospitalizations: number
  pendingExams: number
  lowStockProducts: number
  monthlyRevenue: number
  monthlyExpense: number
}

export interface DashboardAppointment {
  id: string
  patientName: string
  tutorName: string
  veterinarianName?: string
  type: string
  status: string
  scheduledAt: string
}

export interface StockAlert {
  productId: string
  productName: string
  categoryName: string
  currentStock: number
  minStock: number
  alertType: string
  expirationDate?: string
}
