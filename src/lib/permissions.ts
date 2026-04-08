type Role = 'SuperAdmin' | 'Admin' | 'Veterinarian' | 'Receptionist' | 'Operator' | 'Financial' | 'Viewer'

const permissionMap: Record<string, Role[]> = {
  'clinics.manage': ['SuperAdmin'],
  'users.manage': ['SuperAdmin', 'Admin'],
  'tutors.manage': ['SuperAdmin', 'Admin', 'Veterinarian', 'Receptionist'],
  'patients.manage': ['SuperAdmin', 'Admin', 'Veterinarian', 'Receptionist'],
  'agenda.view': ['SuperAdmin', 'Admin', 'Veterinarian', 'Receptionist', 'Viewer'],
  'agenda.manage': ['SuperAdmin', 'Admin', 'Veterinarian', 'Receptionist'],
  'medical.create': ['SuperAdmin', 'Admin', 'Veterinarian'],
  'medical.view': ['SuperAdmin', 'Admin', 'Veterinarian', 'Receptionist'],
  'prescribe': ['SuperAdmin', 'Veterinarian'],
  'hospitalization.manage': ['SuperAdmin', 'Admin', 'Veterinarian'],
  'evolution': ['SuperAdmin', 'Veterinarian'],
  'exams.request': ['SuperAdmin', 'Admin', 'Veterinarian'],
  'exams.view': ['SuperAdmin', 'Admin', 'Veterinarian', 'Receptionist'],
  'stock.view': ['SuperAdmin', 'Admin', 'Veterinarian', 'Operator', 'Viewer'],
  'stock.manage': ['SuperAdmin', 'Admin'],
  'stock.operate': ['SuperAdmin', 'Admin', 'Operator'],
  'financial.view': ['SuperAdmin', 'Admin', 'Financial', 'Viewer'],
  'financial.manage': ['SuperAdmin', 'Admin', 'Financial'],
  'financial.create': ['SuperAdmin', 'Admin', 'Receptionist', 'Financial'],
  'costs.manage': ['SuperAdmin', 'Admin', 'Financial'],
  'costs.view': ['SuperAdmin', 'Admin', 'Financial', 'Viewer'],
  'reports.export': ['SuperAdmin', 'Admin', 'Financial', 'Viewer'],
  'audit.view': ['SuperAdmin', 'Admin'],
}

export function hasPermission(role: string | null, action: string): boolean {
  if (!role) return false
  if (role === 'SuperAdmin') return true
  const allowed = permissionMap[action]
  if (!allowed) return false
  return allowed.includes(role as Role)
}

export function hasAnyRole(role: string | null, roles: string[]): boolean {
  if (!role) return false
  return roles.includes(role)
}
