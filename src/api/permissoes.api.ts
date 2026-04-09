import api from './cliente'

export interface Permissao {
  modulo: string
  podeVisualizar: boolean
  podeAdicionar: boolean
  podeEditar: boolean
  podeExcluir: boolean
}

export const permissoesApi = {
  listarPorPerfil: (perfil: string) =>
    api.get<Permissao[]>('/api/permissoes', { params: { perfil } }).then((r) => r.data),

  atualizar: (perfil: string, permissoes: Permissao[]) =>
    api.put('/api/permissoes', { perfil, permissoes }).then((r) => r.data),

  minhasPermissoes: () =>
    api.get<Permissao[]>('/api/permissoes/usuario').then((r) => r.data),
}
