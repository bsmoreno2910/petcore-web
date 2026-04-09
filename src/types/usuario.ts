export interface Usuario {
  id: string
  nome: string
  email: string
  telefone?: string
  crmv?: string
  avatarUrl?: string
  ativo: boolean
  criadoEm: string
  clinicas: UsuarioClinica[]
}

export interface UsuarioClinica {
  clinicaId: string
  nomeClinica: string
  perfil: string
}
