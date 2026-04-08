import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { hospitalizationsApi, type Hospitalization } from '@/api/hospitalizations.api'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate } from '@/lib/utils'

export default function HospitalizationsPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['hospitalizations', page, status],
    queryFn: () => hospitalizationsApi.list({ page, pageSize: 20, status: status || undefined }),
  })

  const columns = [
    { key: 'admittedAt', header: 'Admissão', render: (h: Hospitalization) => formatDate(h.admittedAt) },
    { key: 'patientName', header: 'Paciente' },
    { key: 'tutorName', header: 'Tutor' },
    { key: 'veterinarianName', header: 'Veterinário' },
    { key: 'cage', header: 'Baia', render: (h: Hospitalization) => h.cage || '—' },
    { key: 'status', header: 'Status', render: (h: Hospitalization) => <StatusBadge status={h.status} /> },
    { key: 'evolutionCount', header: 'Evoluções', className: 'text-center' },
  ]

  return (
    <div>
      <PageHeader title="Internações" description="Controle de internações" />
      <div className="mb-4">
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}
          className="px-3 py-2 border border-input rounded-lg text-sm bg-background">
          <option value="">Todos os status</option>
          <option value="Active">Ativas</option>
          <option value="Discharged">Alta</option>
          <option value="Transferred">Transferidas</option>
          <option value="Deceased">Óbito</option>
        </select>
      </div>
      <DataTable columns={columns} data={data?.items ?? []} page={page}
        totalPages={data ? Math.ceil(data.totalCount / data.pageSize) : 1}
        onPageChange={setPage} loading={isLoading} />
    </div>
  )
}
