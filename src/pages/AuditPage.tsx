import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/api/client'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { ExportButton } from '@/components/shared/ExportButton'
import { formatDateTime } from '@/lib/utils'

interface LogAuditoria {
  id: string; usuarioId: string; nomeUsuario: string; acao: string
  entidade: string; entidadeId: string; valorAnterior?: string; valorNovo?: string
  enderecoIp?: string; criadoEm: string
}

export default function AuditPage() {
  const [page, setPage] = useState(1)
  const [entityFilter, setEntityFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['logs-auditoria', page, entityFilter, actionFilter],
    queryFn: () => api.get('/api/logs-auditoria', {
      params: { pagina: page, tamanhoPagina: 50, entidade: entityFilter || undefined, acao: actionFilter || undefined }
    }).then(r => r.data),
  })

  const columns = [
    { key: 'criadoEm', header: 'Data/Hora', render: (l: LogAuditoria) => formatDateTime(l.criadoEm) },
    { key: 'nomeUsuario', header: 'Usuário' },
    { key: 'acao', header: 'Ação' },
    { key: 'entidade', header: 'Entidade' },
    { key: 'entidadeId', header: 'ID', render: (l: LogAuditoria) => <span className="font-mono text-xs">{l.entidadeId.substring(0, 8)}...</span> },
    { key: 'enderecoIp', header: 'IP', render: (l: LogAuditoria) => l.enderecoIp || '—' },
  ]

  return (
    <div>
      <PageHeader title="Auditoria" description="Log completo de ações do sistema"
        actions={<ExportButton url="/api/logs-auditoria/export" filename="PetCore_AuditLogs.xlsx" />}
      />

      <div className="flex gap-3 mb-4">
        <input placeholder="Filtrar por entidade" value={entityFilter} onChange={e => { setEntityFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 border border-input rounded-lg text-sm bg-background" />
        <input placeholder="Filtrar por ação" value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 border border-input rounded-lg text-sm bg-background" />
      </div>

      <DataTable columns={columns} data={data?.itens ?? []} page={page}
        totalPages={data ? Math.ceil(data.totalRegistros / data.tamanhoPagina) : 1}
        onPageChange={setPage} loading={isLoading} />
    </div>
  )
}
