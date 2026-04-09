import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { prontuariosApi, type Prontuario } from '@/api/medical-records.api'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { SearchInput } from '@/components/shared/SearchInput'
import { formatDateTime } from '@/lib/utils'

export default function MedicalRecordsPage() {
  const [page, setPage] = useState(1)
  const [patientId, setPatientId] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['prontuarios', page, patientId],
    queryFn: () => prontuariosApi.listar({ pagina: page, tamanhoPagina: 20, pacienteId: patientId || undefined }),
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
        <SearchInput value={patientId} onChange={setPatientId} placeholder="Filtrar por ID do paciente..." />
      </div>
      <DataTable columns={columns} data={data?.itens ?? []} page={page}
        totalPages={data ? Math.ceil(data.totalRegistros / data.tamanhoPagina) : 1}
        onPageChange={setPage} loading={isLoading} />
    </div>
  )
}
