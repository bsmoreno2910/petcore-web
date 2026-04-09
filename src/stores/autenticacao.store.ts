import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface InfoUsuario {
  id: string
  nome: string
  email: string
  telefone?: string
  crmv?: string
  avatarUrl?: string
}

export interface InfoClinica {
  id: string
  nome: string
  nomeFantasia?: string
  perfil: string
}

interface AuthState {
  tokenAcesso: string | null
  tokenAtualizacao: string | null
  usuario: InfoUsuario | null
  clinicas: InfoClinica[]
  clinicaAtiva: InfoClinica | null

  setAuth: (data: {
    tokenAcesso: string
    tokenAtualizacao: string
    usuario: InfoUsuario
    clinicas: InfoClinica[]
  }) => void
  setClinicaAtiva: (clinica: InfoClinica) => void
  setTokens: (tokenAcesso: string, tokenAtualizacao: string) => void
  logout: () => void
  estaAutenticado: () => boolean
  getPerfil: () => string | null
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      tokenAcesso: null,
      tokenAtualizacao: null,
      usuario: null,
      clinicas: [],
      clinicaAtiva: null,

      setAuth: (data) => {
        const clinicaAtiva = data.clinicas.length === 1 ? data.clinicas[0] : null
        set({
          tokenAcesso: data.tokenAcesso,
          tokenAtualizacao: data.tokenAtualizacao,
          usuario: data.usuario,
          clinicas: data.clinicas,
          clinicaAtiva,
        })
      },

      setClinicaAtiva: (clinica) => set({ clinicaAtiva: clinica }),

      setTokens: (tokenAcesso, tokenAtualizacao) => set({ tokenAcesso, tokenAtualizacao }),

      logout: () => set({
        tokenAcesso: null,
        tokenAtualizacao: null,
        usuario: null,
        clinicas: [],
        clinicaAtiva: null,
      }),

      estaAutenticado: () => !!get().tokenAcesso,

      getPerfil: () => get().clinicaAtiva?.perfil ?? null,
    }),
    { name: 'petcore-auth' },
  ),
)
