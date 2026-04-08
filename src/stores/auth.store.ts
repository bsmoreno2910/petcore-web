import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserInfo, ClinicInfo } from '@/types/auth'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: UserInfo | null
  clinics: ClinicInfo[]
  activeClinic: ClinicInfo | null

  setAuth: (data: {
    accessToken: string
    refreshToken: string
    user: UserInfo
    clinics: ClinicInfo[]
  }) => void
  setActiveClinic: (clinic: ClinicInfo) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  logout: () => void
  isAuthenticated: () => boolean
  getRole: () => string | null
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      clinics: [],
      activeClinic: null,

      setAuth: (data) => {
        const activeClinic = data.clinics.length === 1 ? data.clinics[0] : null
        set({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user,
          clinics: data.clinics,
          activeClinic,
        })
      },

      setActiveClinic: (clinic) => set({ activeClinic: clinic }),

      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),

      logout: () => set({
        accessToken: null,
        refreshToken: null,
        user: null,
        clinics: [],
        activeClinic: null,
      }),

      isAuthenticated: () => !!get().accessToken,

      getRole: () => get().activeClinic?.role ?? null,
    }),
    { name: 'petcore-auth' },
  ),
)
