export interface User {
  id: string
  name: string
  email: string
  phone?: string
  crmv?: string
  avatarUrl?: string
  active: boolean
  createdAt: string
  clinics: UserClinic[]
}

export interface UserClinic {
  clinicId: string
  clinicName: string
  role: string
}
