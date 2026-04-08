import { downloadExcel } from '@/lib/download'

export const reportsApi = {
  inventory: (params?: Record<string, unknown>) => downloadExcel('/api/reports/inventory', 'PetCore_Inventario.xlsx', params),
  stockMovements: (params?: Record<string, unknown>) => downloadExcel('/api/reports/stock-movements', 'PetCore_Movimentacoes.xlsx', params),
  appointments: (params?: Record<string, unknown>) => downloadExcel('/api/reports/appointments', 'PetCore_Atendimentos.xlsx', params),
  patients: (params?: Record<string, unknown>) => downloadExcel('/api/reports/patients', 'PetCore_Pacientes.xlsx', params),
  tutors: (params?: Record<string, unknown>) => downloadExcel('/api/reports/tutors', 'PetCore_Tutores.xlsx', params),
  hospitalizations: (params?: Record<string, unknown>) => downloadExcel('/api/reports/hospitalizations', 'PetCore_Internacoes.xlsx', params),
  exams: (params?: Record<string, unknown>) => downloadExcel('/api/reports/exams', 'PetCore_Exames.xlsx', params),
  financialRevenue: (params?: Record<string, unknown>) => downloadExcel('/api/reports/financial-revenue', 'PetCore_Receitas.xlsx', params),
  financialExpenses: (params?: Record<string, unknown>) => downloadExcel('/api/reports/financial-expenses', 'PetCore_Despesas.xlsx', params),
  financialCashflow: (params?: Record<string, unknown>) => downloadExcel('/api/reports/financial-cashflow', 'PetCore_FluxoCaixa.xlsx', params),
  financialOverdue: () => downloadExcel('/api/reports/financial-overdue', 'PetCore_Inadimplencia.xlsx'),
  financialByCategory: (params?: Record<string, unknown>) => downloadExcel('/api/reports/financial-by-category', 'PetCore_PorCategoria.xlsx', params),
  financialByTutor: (params?: Record<string, unknown>) => downloadExcel('/api/reports/financial-by-tutor', 'PetCore_PorTutor.xlsx', params),
  costCenters: (params?: Record<string, unknown>) => downloadExcel('/api/reports/cost-centers', 'PetCore_CentrosCusto.xlsx', params),
}
