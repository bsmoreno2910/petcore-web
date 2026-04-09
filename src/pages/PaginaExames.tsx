import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { examesApi, type SolicitacaoExame } from '@/api/exames.api'
import { PageHeader } from '@/components/shared/CabecalhoPagina'
import { DataTable } from '@/components/shared/TabelaDados'
import { StatusBadge } from '@/components/shared/BadgeStatus'
import { formatDate } from '@/lib/utilitarios'

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
          <option value="Solicitado">Solicitados</option>
          <option value="AmostraColetada">Coletados</option>
          <option value="Processando">Em processamento</option>
          <option value="Concluido">Concluídos</option>
          <option value="Cancelado">Cancelados</option>
        </select>
      </div>
      <DataTable columns={columns} data={data?.itens ?? []} page={page}
        totalPages={data ? Math.ceil(data.totalRegistros / data.tamanhoPagina) : 1}
        onPageChange={setPage} loading={isLoading} />
    </div>
  )
}
