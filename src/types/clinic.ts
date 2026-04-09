export interface Clinica {
  id: string
  nome: string
  nomeFantasia?: string
  razaoSocial?: string
  cnpj?: string
  telefone?: string
  email?: string
  website?: string
  logoUrl?: string
  rua?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
  cep?: string
  ativa: boolean
  criadoEm: string
}

export interface ClinicaUsuario {
  id: string
  usuarioId: string
  nomeUsuario: string
  emailUsuario: string
  perfil: string
  ativo: boolean
}
