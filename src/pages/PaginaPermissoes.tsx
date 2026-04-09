import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Save } from 'lucide-react'
import { toast } from 'sonner'
import { permissoesApi, type Permissao } from '@/api/permissoes.api'
import { PageHeader } from '@/components/shared/CabecalhoPagina'

const perfis = ['Admin', 'Veterinario', 'Recepcionista', 'Operador', 'Financeiro', 'Visualizador']

const moduloLabels: Record<string, string> = {
  Tutores: 'Tutores',
  Pacientes: 'Pacientes',
  Agenda: 'Agenda',
  Prontuarios: 'Prontuarios',
  Internacoes: 'Internacoes',
  Exames: 'Exames',
  Produtos: 'Produtos',
  Movimentacoes: 'Movimentacoes',
  Pedidos: 'Pedidos',
  Financeiro: 'Financeiro',
  CentrosCusto: 'Centros de Custo',
  Relatorios: 'Relatorios',
  Usuarios: 'Usuarios',
  Clinicas: 'Clinicas',
  Auditoria: 'Auditoria',
}

const colunas: { key: keyof Pick<Permissao, 'podeVisualizar' | 'podeAdicionar' | 'podeEditar' | 'podeExcluir'>; label: string }[] = [
  { key: 'podeVisualizar', label: 'Visualizar' },
  { key: 'podeAdicionar', label: 'Adicionar' },
  { key: 'podeEditar', label: 'Editar' },
  { key: 'podeExcluir', label: 'Excluir' },
]

export default function PermissionsPage() {
  const [perfilSelecionado, setPerfilSelecionado] = useState(perfis[0])
  const [permissoes, setPermissoes] = useState<Permissao[]>([])
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['permissoes', perfilSelecionado],
    queryFn: () => permissoesApi.listarPorPerfil(perfilSelecionado),
  })

  useEffect(() => {
    if (data) setPermissoes(data)
  }, [data])

  const salvarMutation = useMutation({
    mutationFn: () => permissoesApi.atualizar(perfilSelecionado, permissoes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['permissoes', perfilSelecionado] })
      toast.success('Permissoes salvas com sucesso!')
    },
    onError: () => toast.error('Erro ao salvar permissoes.'),
  })

  const togglePermissao = (modulo: string, campo: keyof Permissao) => {
    setPermissoes((prev) =>
      prev.map((p) =>
        p.modulo === modulo ? { ...p, [campo]: !p[campo] } : p,
      ),
    )
  }

  const toggleColuna = (campo: keyof Pick<Permissao, 'podeVisualizar' | 'podeAdicionar' | 'podeEditar' | 'podeExcluir'>) => {
    const todosAtivos = permissoes.every((p) => p[campo])
    setPermissoes((prev) =>
      prev.map((p) => ({ ...p, [campo]: !todosAtivos })),
    )
  }

  const toggleLinha = (modulo: string) => {
    const perm = permissoes.find((p) => p.modulo === modulo)
    if (!perm) return
    const todosAtivos = perm.podeVisualizar && perm.podeAdicionar && perm.podeEditar && perm.podeExcluir
    setPermissoes((prev) =>
      prev.map((p) =>
        p.modulo === modulo
          ? { ...p, podeVisualizar: !todosAtivos, podeAdicionar: !todosAtivos, podeEditar: !todosAtivos, podeExcluir: !todosAtivos }
          : p,
      ),
    )
  }

  return (
    <div>
      <PageHeader
        title="Permissoes"
        description="Gerencie as permissoes de acesso por perfil de usuario"
        actions={
          <button
            onClick={() => salvarMutation.mutate()}
            disabled={salvarMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            <Save size={16} />
            {salvarMutation.isPending ? 'Salvando...' : 'Salvar'}
          </button>
        }
      />

      <div className="mb-6">
        <label className="block text-sm font-medium text-muted-foreground mb-2">Perfil</label>
        <select
          value={perfilSelecionado}
          onChange={(e) => setPerfilSelecionado(e.target.value)}
          className="px-3 py-2 border border-input rounded-lg text-sm bg-card"
        >
          {perfis.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent" />
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Modulo</th>
                {colunas.map((col) => (
                  <th key={col.key} className="text-center px-4 py-3 font-medium text-muted-foreground">
                    <button
                      onClick={() => toggleColuna(col.key)}
                      className="hover:text-foreground transition-colors"
                      title={`Alternar todos - ${col.label}`}
                    >
                      {col.label}
                    </button>
                  </th>
                ))}
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Todos</th>
              </tr>
            </thead>
            <tbody>
              {permissoes.map((perm) => (
                <tr key={perm.modulo} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{moduloLabels[perm.modulo] ?? perm.modulo}</td>
                  {colunas.map((col) => (
                    <td key={col.key} className="text-center px-4 py-3">
                      <input
                        type="checkbox"
                        checked={perm[col.key] as boolean}
                        onChange={() => togglePermissao(perm.modulo, col.key)}
                        className="h-4 w-4 rounded border-input text-accent focus:ring-accent cursor-pointer"
                      />
                    </td>
                  ))}
                  <td className="text-center px-4 py-3">
                    <input
                      type="checkbox"
                      checked={perm.podeVisualizar && perm.podeAdicionar && perm.podeEditar && perm.podeExcluir}
                      onChange={() => toggleLinha(perm.modulo)}
                      className="h-4 w-4 rounded border-input text-accent focus:ring-accent cursor-pointer"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
