type Perfil = 'SuperAdmin' | 'Admin' | 'Veterinario' | 'Recepcionista' | 'Operador' | 'Financeiro' | 'Visualizador'

const mapaPermissoes: Record<string, Perfil[]> = {
  'clinics.manage': ['SuperAdmin'],
  'users.manage': ['SuperAdmin', 'Admin'],
  'tutors.manage': ['SuperAdmin', 'Admin', 'Veterinario', 'Recepcionista'],
  'patients.manage': ['SuperAdmin', 'Admin', 'Veterinario', 'Recepcionista'],
  'agenda.view': ['SuperAdmin', 'Admin', 'Veterinario', 'Recepcionista', 'Visualizador'],
  'agenda.manage': ['SuperAdmin', 'Admin', 'Veterinario', 'Recepcionista'],
  'medical.create': ['SuperAdmin', 'Admin', 'Veterinario'],
  'medical.view': ['SuperAdmin', 'Admin', 'Veterinario', 'Recepcionista'],
  'prescribe': ['SuperAdmin', 'Veterinario'],
  'hospitalization.manage': ['SuperAdmin', 'Admin', 'Veterinario'],
  'evolution': ['SuperAdmin', 'Veterinario'],
  'exams.request': ['SuperAdmin', 'Admin', 'Veterinario'],
  'exams.view': ['SuperAdmin', 'Admin', 'Veterinario', 'Recepcionista'],
  'stock.view': ['SuperAdmin', 'Admin', 'Veterinario', 'Operador', 'Visualizador'],
  'stock.manage': ['SuperAdmin', 'Admin'],
  'stock.operate': ['SuperAdmin', 'Admin', 'Operador'],
  'financial.view': ['SuperAdmin', 'Admin', 'Financeiro', 'Visualizador'],
  'financial.manage': ['SuperAdmin', 'Admin', 'Financeiro'],
  'financial.create': ['SuperAdmin', 'Admin', 'Recepcionista', 'Financeiro'],
  'costs.manage': ['SuperAdmin', 'Admin', 'Financeiro'],
  'costs.view': ['SuperAdmin', 'Admin', 'Financeiro', 'Visualizador'],
  'reports.export': ['SuperAdmin', 'Admin', 'Financeiro', 'Visualizador'],
  'audit.view': ['SuperAdmin', 'Admin'],
}

export function hasPermission(role: string | null, action: string): boolean {
  if (!role) return false
  if (role === 'SuperAdmin') return true
  const allowed = mapaPermissoes[action]
  if (!allowed) return false
  return allowed.includes(role as Perfil)
}

export function hasAnyRole(role: string | null, roles: string[]): boolean {
  if (!role) return false
  return roles.includes(role)
}
