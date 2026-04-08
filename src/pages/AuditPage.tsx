import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/api/client'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { ExportButton } from '@/components/shared/ExportButton'
import { formatDateTime } from '@/lib/utils'

interface AuditLog {
  id: string; userId: string; userName: string; action: string
  entity: string; entityId: string; oldValue?: string; newValue?: string
  ipAddress?: string; createdAt: string
}

export default function AuditPage() {
  const [page, setPage] = useState(1)
  const [entityFilter, setEntityFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page, entityFilter, actionFilter],
    queryFn: () => api.get('/api/audit-logs', {
      params: { page, pageSize: 50, entity: entityFilter || undefined, action: actionFilter || undefined }
    }).then(r => r.data),
  })

  const columns = [
    { key: 'createdAt', header: 'Data/Hora', render: (l: AuditLog) => formatDateTime(l.createdAt) },
    { key: 'userName', header: 'Usuário' },
    { key: 'action', header: 'Ação' },
    { key: 'entity', header: 'Entidade' },
    { key: 'entityId', header: 'ID', render: (l: AuditLog) => <span className="font-mono text-xs">{l.entityId.substring(0, 8)}...</span> },
    { key: 'ipAddress', header: 'IP', render: (l: AuditLog) => l.ipAddress || '—' },
  ]

  return (
    <div>
      <PageHeader title="Auditoria" description="Log completo de ações do sistema"
        actions={<ExportButton url="/api/audit-logs/export" filename="PetCore_AuditLogs.xlsx" />}
      />

      <div className="flex gap-3 mb-4">
        <input placeholder="Filtrar por entidade" value={entityFilter} onChange={e => { setEntityFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 border border-input rounded-lg text-sm bg-background" />
        <input placeholder="Filtrar por ação" value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 border border-input rounded-lg text-sm bg-background" />
      </div>

      <DataTable columns={columns} data={data?.items ?? []} page={page}
        totalPages={data ? Math.ceil(data.totalCount / data.pageSize) : 1}
        onPageChange={setPage} loading={isLoading} />
    </div>
  )
}
