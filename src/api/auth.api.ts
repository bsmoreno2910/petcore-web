import api from './client'

export interface LoginDto {
  email: string
  senha: string
}

export interface LoginResposta {
  tokenAcesso: string
  tokenAtualizacao: string
  usuario: { id: string; nome: string; email: string; telefone?: string; crmv?: string; avatarUrl?: string }
  clinicas: { clinicaId: string; nome: string; nomeFantasia?: string; perfil: string }[]
}

export const authApi = {
  login: (data: LoginDto) =>
    api.post<LoginResposta>('/api/autenticacao/login', data).then(r => r.data),

  refresh: (tokenAtualizacao: string) =>
    api.post('/api/autenticacao/refresh', { tokenAtualizacao }).then(r => r.data),

  logout: () => api.post('/api/autenticacao/logout'),

  me: () => api.get('/api/autenticacao/me').then(r => r.data),

  alterarSenha: (senhaAtual: string, novaSenha: string) =>
    api.patch('/api/autenticacao/alterar-senha', { senhaAtual, novaSenha }).then(r => r.data),

  selecionarClinica: (clinicaId: string) =>
    api.post('/api/autenticacao/selecionar-clinica', { clinicaId }).then(r => r.data),
}
