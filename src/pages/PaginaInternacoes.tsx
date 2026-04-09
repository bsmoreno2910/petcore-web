import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { internacoesApi, type Internacao } from '@/api/internacoes.api'
import { PageHeader } from '@/components/shared/CabecalhoPagina'
import { DataTable } from '@/components/shared/TabelaDados'
import { StatusBadge } from '@/components/shared/BadgeStatus'
import { formatDate } from '@/lib/utilitarios'

export default function HospitalizationsPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['internacoes', page, status],
    queryFn: () => internacoesApi.listar({ pagina: page, tamanhoPagina: 20, status: status || undefined }),
  })

  const columns = [
    { key: 'dataInternacao', header: 'Admissão', render: (h: Internacao) => formatDate(h.dataInternacao) },
    { key: 'nomePaciente', header: 'Paciente' },
    { key: 'nomeTutor', header: 'Tutor' },
    { key: 'nomeVeterinario', header: 'Veterinário' },
    { key: 'baia', header: 'Baia', render: (h: Internacao) => h.baia || '—' },
    { key: 'status', header: 'Status', render: (h: Internacao) => <StatusBadge status={h.status} /> },
    { key: 'quantidadeEvolucoes', header: 'Evoluções', className: 'text-center' },
  ]

  return (
    <div>
      <PageHeader title="Internações" description="Controle de internações" />
      <div className="mb-4">
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}
          className="px-3 py-2 border border-input rounded-lg text-sm bg-background">
          <option value="">Todos os status</option>
          <option value="Ativo">Ativas</option>
          <option value="Alta">Alta</option>
          <option value="Transferido">Transferidas</option>
          <option value="Obito">Óbito</option>
        </select>
      </div>
      <DataTable columns={columns} data={data?.itens ?? []} page={page}
        totalPages={data ? Math.ceil(data.totalRegistros / data.tamanhoPagina) : 1}
        onPageChange={setPage} loading={isLoading} />
    </div>
  )
}
