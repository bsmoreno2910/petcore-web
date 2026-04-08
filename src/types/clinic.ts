export interface Clinic {
  id: string
  name: string
  tradeName?: string
  legalName?: string
  cnpj?: string
  phone?: string
  email?: string
  website?: string
  logoUrl?: string
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  zipCode?: string
  active: boolean
  createdAt: string
}

export interface ClinicUser {
  id: string
  userId: string
  userName: string
  userEmail: string
  role: string
  active: boolean
}
