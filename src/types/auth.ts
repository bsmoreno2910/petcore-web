export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: UserInfo
  clinics: ClinicInfo[]
}

export interface UserInfo {
  id: string
  name: string
  email: string
  phone?: string
  crmv?: string
  avatarUrl?: string
}

export interface ClinicInfo {
  id: string
  name: string
  tradeName?: string
  role: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}
