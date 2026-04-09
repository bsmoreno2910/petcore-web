export interface InfoUsuario {
  id: string
  nome: string
  email: string
  telefone?: string
  crmv?: string
  avatarUrl?: string
}

export interface InfoClinica {
  clinicaId: string
  nome: string
  nomeFantasia?: string
  perfil: string
}
