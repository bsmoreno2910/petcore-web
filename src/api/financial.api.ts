import api from './client'
import type { PagedResponse } from '@/types/common'

export interface FinancialCategory {
  id: string; name: string; type: string; active: boolean
}
export interface Transaction {
  id: string; clinicId: string; type: string; status: string
  financialCategoryId: string; financialCategoryName: string
  description: string; amount: number; discount?: number; amountPaid?: number
  paymentMethod?: string; dueDate: string; paidAt?: string
  tutorId?: string; tutorName?: string; costCenterId?: string; costCenterName?: string
  notes?: string; invoiceNumber?: string
  createdById: string; createdByName: string; createdAt: string
  installments: Installment[]
}
export interface Installment {
  id: string; transactionId: string; installmentNumber: number
  amount: number; dueDate: string; paidAt?: string; status: string
}
export interface CashFlowEntry {
  date: string; revenue: number; expense: number; balance: number
}
export interface FinancialSummary {
  totalRevenue: number; totalExpense: number; balance: number
  totalPending: number; totalOverdue: number; transactionCount: number
}

export const financialApi = {
  categories: () => api.get<FinancialCategory[]>('/api/financial/categories').then(r => r.data),
  createCategory: (data: Record<string, unknown>) => api.post('/api/financial/categories', data).then(r => r.data),
  list: (params: Record<string, unknown>) =>
    api.get<PagedResponse<Transaction>>('/api/financial/transactions', { params }).then(r => r.data),
  get: (id: string) => api.get<Transaction>(`/api/financial/transactions/${id}`).then(r => r.data),
  create: (data: Record<string, unknown>) => api.post('/api/financial/transactions', data).then(r => r.data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/api/financial/transactions/${id}`, data).then(r => r.data),
  pay: (id: string, data: Record<string, unknown>) => api.patch(`/api/financial/transactions/${id}/pay`, data).then(r => r.data),
  cancel: (id: string) => api.patch(`/api/financial/transactions/${id}/cancel`).then(r => r.data),
  cashFlow: (startDate: string, endDate: string) =>
    api.get<CashFlowEntry[]>('/api/financial/cash-flow', { params: { startDate, endDate } }).then(r => r.data),
  summary: () => api.get<FinancialSummary>('/api/financial/summary').then(r => r.data),
  overdue: () => api.get<Transaction[]>('/api/financial/overdue').then(r => r.data),
  payInstallment: (id: string) => api.patch(`/api/financial/installments/${id}/pay`).then(r => r.data),
}
