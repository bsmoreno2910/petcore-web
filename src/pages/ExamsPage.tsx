import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { examsApi, type ExamRequest } from '@/api/exams.api'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate } from '@/lib/utils'

export default function ExamsPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['exams', page, status],
    queryFn: () => examsApi.list({ page, pageSize: 20, status: status || undefined }),
  })

  const columns = [
    { key: 'requestedAt', header: 'Data', render: (e: ExamRequest) => formatDate(e.requestedAt) },
    { key: 'patientName', header: 'Paciente' },
    { key: 'examTypeName', header: 'Tipo de Exame' },
    { key: 'examTypeCategory', header: 'Categoria', render: (e: ExamRequest) => e.examTypeCategory || '—' },
    { key: 'requestedByName', header: 'Solicitante' },
    { key: 'status', header: 'Status', render: (e: ExamRequest) => <StatusBadge status={e.status} /> },
    { key: 'result', header: 'Resultado', render: (e: ExamRequest) => e.result ? 'Sim' : '—', className: 'text-center' },
  ]

  return (
    <div>
      <PageHeader title="Exames" description="Solicitações de exames" />
      <div className="mb-4">
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}
          className="px-3 py-2 border border-input rounded-lg text-sm bg-background">
          <option value="">Todos os status</option>
          <option value="Requested">Solicitados</option>
          <option value="SampleCollected">Coletados</option>
          <option value="Processing">Em processamento</option>
          <option value="Completed">Concluídos</option>
          <option value="Cancelled">Cancelados</option>
        </select>
      </div>
      <DataTable columns={columns} data={data?.items ?? []} page={page}
        totalPages={data ? Math.ceil(data.totalCount / data.pageSize) : 1}
        onPageChange={setPage} loading={isLoading} />
    </div>
  )
}
