import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { prontuariosApi, type Prontuario } from '@/api/prontuarios.api'
import { PageHeader } from '@/components/shared/CabecalhoPagina'
import { DataTable } from '@/components/shared/TabelaDados'
import { PacienteSearch } from '@/components/shared/BuscaPaciente'
import { formatDateTime } from '@/lib/utilitarios'

export default function MedicalRecordsPage() {
  const [page, setPage] = useState(1)
  const [pacienteSelecionado, setPacienteSelecionado] = useState<{ id: string; nome: string } | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['prontuarios', page, pacienteSelecionado?.id],
    queryFn: () => prontuariosApi.listar({ pagina: page, tamanhoPagina: 20, pacienteId: pacienteSelecionado?.id || undefined }),
  })

  const columns = [
    { key: 'criadoEm', header: 'Data', render: (r: Prontuario) => formatDateTime(r.criadoEm) },
    { key: 'nomePaciente', header: 'Paciente' },
    { key: 'nomeVeterinario', header: 'Veterinário' },
    { key: 'queixaPrincipal', header: 'Queixa Principal', render: (r: Prontuario) => r.queixaPrincipal || '—' },
    { key: 'diagnostico', header: 'Diagnóstico', render: (r: Prontuario) => r.diagnostico || '—' },
    { key: 'prescricoes', header: 'Prescrições', render: (r: Prontuario) => r.prescricoes.length, className: 'text-center' },
  ]

  return (
    <div>
      <PageHeader title="Prontuários" description="Registros de atendimento" />
      <div className="mb-4 max-w-sm">
        <PacienteSearch value={pacienteSelecionado} onChange={(p) => { setPacienteSelecionado(p); setPage(1) }} />
      </div>
      <DataTable columns={columns} data={data?.itens ?? []} page={page}
        totalPages={data ? Math.ceil(data.totalRegistros / data.tamanhoPagina) : 1}
        onPageChange={setPage} loading={isLoading} />
    </div>
  )
}
