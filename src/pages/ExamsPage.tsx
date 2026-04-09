import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { examesApi, type SolicitacaoExame } from '@/api/exams.api'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate } from '@/lib/utils'

export default function ExamsPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['exames', page, status],
    queryFn: () => examesApi.listar({ pagina: page, tamanhoPagina: 20, status: status || undefined }),
  })

  const columns = [
    { key: 'dataSolicitacao', header: 'Data', render: (e: SolicitacaoExame) => formatDate(e.dataSolicitacao) },
    { key: 'nomePaciente', header: 'Paciente' },
    { key: 'nomeTipoExame', header: 'Tipo de Exame' },
    { key: 'categoriaTipoExame', header: 'Categoria', render: (e: SolicitacaoExame) => e.categoriaTipoExame || '—' },
    { key: 'nomeSolicitante', header: 'Solicitante' },
    { key: 'status', header: 'Status', render: (e: SolicitacaoExame) => <StatusBadge status={e.status} /> },
    { key: 'resultado', header: 'Resultado', render: (e: SolicitacaoExame) => e.resultado ? 'Sim' : '—', className: 'text-center' },
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
      <DataTable columns={columns} data={data?.itens ?? []} page={page}
        totalPages={data ? Math.ceil(data.totalRegistros / data.tamanhoPagina) : 1}
        onPageChange={setPage} loading={isLoading} />
    </div>
  )
}
