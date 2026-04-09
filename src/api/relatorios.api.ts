import { downloadExcel } from '@/lib/download'

export const reportsApi = {
  inventory: (params?: Record<string, unknown>) => downloadExcel('/api/relatorios/inventario', 'PetCore_Inventario.xlsx', params),
  stockMovements: (params?: Record<string, unknown>) => downloadExcel('/api/relatorios/movimentacoes', 'PetCore_Movimentacoes.xlsx', params),
  appointments: (params?: Record<string, unknown>) => downloadExcel('/api/relatorios/agendamentos', 'PetCore_Atendimentos.xlsx', params),
  patients: (params?: Record<string, unknown>) => downloadExcel('/api/relatorios/pacientes', 'PetCore_Pacientes.xlsx', params),
  tutors: (params?: Record<string, unknown>) => downloadExcel('/api/relatorios/tutores', 'PetCore_Tutores.xlsx', params),
  hospitalizations: (params?: Record<string, unknown>) => downloadExcel('/api/relatorios/internacoes', 'PetCore_Internacoes.xlsx', params),
  exams: (params?: Record<string, unknown>) => downloadExcel('/api/relatorios/exames', 'PetCore_Exames.xlsx', params),
  financialRevenue: (params?: Record<string, unknown>) => downloadExcel('/api/relatorios/receitas', 'PetCore_Receitas.xlsx', params),
  financialExpenses: (params?: Record<string, unknown>) => downloadExcel('/api/relatorios/despesas', 'PetCore_Despesas.xlsx', params),
  financialCashflow: (params?: Record<string, unknown>) => downloadExcel('/api/relatorios/fluxo-caixa', 'PetCore_FluxoCaixa.xlsx', params),
  financialOverdue: () => downloadExcel('/api/relatorios/inadimplencia', 'PetCore_Inadimplencia.xlsx'),
  financialByCategory: (params?: Record<string, unknown>) => downloadExcel('/api/relatorios/por-categoria', 'PetCore_PorCategoria.xlsx', params),
  financialByTutor: (params?: Record<string, unknown>) => downloadExcel('/api/relatorios/por-tutor', 'PetCore_PorTutor.xlsx', params),
  costCenters: (params?: Record<string, unknown>) => downloadExcel('/api/relatorios/centros-custo', 'PetCore_CentrosCusto.xlsx', params),
}
