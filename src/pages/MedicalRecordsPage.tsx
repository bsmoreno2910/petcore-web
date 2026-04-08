import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { medicalRecordsApi, type MedicalRecord } from '@/api/medical-records.api'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { SearchInput } from '@/components/shared/SearchInput'
import { formatDateTime } from '@/lib/utils'

export default function MedicalRecordsPage() {
  const [page, setPage] = useState(1)
  const [patientId, setPatientId] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['medical-records', page, patientId],
    queryFn: () => medicalRecordsApi.list({ page, pageSize: 20, patientId: patientId || undefined }),
  })

  const columns = [
    { key: 'createdAt', header: 'Data', render: (r: MedicalRecord) => formatDateTime(r.createdAt) },
    { key: 'patientName', header: 'Paciente' },
    { key: 'veterinarianName', header: 'Veterinário' },
    { key: 'chiefComplaint', header: 'Queixa Principal', render: (r: MedicalRecord) => r.chiefComplaint || '—' },
    { key: 'diagnosis', header: 'Diagnóstico', render: (r: MedicalRecord) => r.diagnosis || '—' },
    { key: 'prescriptions', header: 'Prescrições', render: (r: MedicalRecord) => r.prescriptions.length, className: 'text-center' },
  ]

  return (
    <div>
      <PageHeader title="Prontuários" description="Registros de atendimento" />
      <div className="mb-4 max-w-sm">
        <SearchInput value={patientId} onChange={setPatientId} placeholder="Filtrar por ID do paciente..." />
      </div>
      <DataTable columns={columns} data={data?.items ?? []} page={page}
        totalPages={data ? Math.ceil(data.totalCount / data.pageSize) : 1}
        onPageChange={setPage} loading={isLoading} />
    </div>
  )
}
