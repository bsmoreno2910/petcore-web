import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { pacientesApi, type Paciente } from '@/api/pacientes.api'
import { especiesApi } from '@/api/especies.api'
import { PageHeader } from '@/components/shared/CabecalhoPagina'
import { DatePicker } from '@/components/shared/SeletorData'
import { DataTable } from '@/components/shared/TabelaDados'
import { SearchInput } from '@/components/shared/CampoBusca'
import { TutorSearch } from '@/components/shared/BuscaTutor'
import { formatDate } from '@/lib/utilitarios'

const pacienteSchema = z.object({
  nome: z.string().min(1, 'Nome do animal obrigatorio'),
  tutor: z.object({ id: z.string(), nome: z.string() }).nullable().refine(v => v !== null, { message: 'Selecione o tutor' }),
  especieId: z.string().min(1, 'Selecione a especie'),
  racaId: z.string().optional().default(''),
  sexo: z.string().default('Desconhecido'),
  dataNascimento: z.date().nullable().optional(),
  peso: z.string().optional().default(''),
  cor: z.string().optional().default(''),
  microchip: z.string().optional().default(''),
  castrado: z.boolean().default(false),
  alergias: z.string().optional().default(''),
  observacoes: z.string().optional().default(''),
})

type PacienteFormData = z.infer<typeof pacienteSchema>

const formDefaults: PacienteFormData = {
  nome: '', tutor: null, especieId: '', racaId: '', sexo: 'Desconhecido',
  dataNascimento: null, peso: '', cor: '', microchip: '', castrado: false,
  alergias: '', observacoes: '',
}

export default function PatientsPage() {
  const [pagina, setPagina] = useState(1)
  const [busca, setBusca] = useState('')
  const [filtroEspecie, setFiltroEspecie] = useState('')
  const [showForm, setShowForm] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const qc = useQueryClient()

  const presetTutorId = searchParams.get('tutorId')
  const presetTutorName = searchParams.get('tutorName')

  const { data, isLoading } = useQuery({
    queryKey: ['pacientes', pagina, busca, filtroEspecie],
    queryFn: () => pacientesApi.listar({ pagina, tamanhoPagina: 20, busca: busca || undefined, especieId: filtroEspecie || undefined }),
  })

  const { data: listaEspecies } = useQuery({ queryKey: ['especies'], queryFn: especiesApi.listar })

  const { register, handleSubmit, control, watch, reset, setValue, formState: { errors } } = useForm<PacienteFormData>({
    resolver: zodResolver(pacienteSchema),
    defaultValues: formDefaults,
  })

  const createMutation = useMutation({
    mutationFn: pacientesApi.criar,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pacientes'] })
      setShowForm(false)
      reset(formDefaults)
      toast.success('Paciente cadastrado com sucesso!')
    },
    onError: (e: Error & { response?: { data?: { error?: string } } }) =>
      toast.error(e.response?.data?.error || 'Erro ao cadastrar paciente'),
  })

  const openForm = () => {
    const defaults = { ...formDefaults }
    if (presetTutorId && presetTutorName) {
      defaults.tutor = { id: presetTutorId, nome: presetTutorName }
    }
    reset(defaults)
    setShowForm(true)
  }

  const onSubmit = (data: PacienteFormData) => {
    createMutation.mutate({
      nome: data.nome,
      tutorId: data.tutor!.id,
      especieId: data.especieId,
      racaId: data.racaId || undefined,
      sexo: data.sexo,
      dataNascimento: data.dataNascimento ? data.dataNascimento.toISOString() : undefined,
      peso: data.peso ? Number(data.peso) : undefined,
      cor: data.cor || undefined,
      microchip: data.microchip || undefined,
      castrado: data.castrado,
      alergias: data.alergias || undefined,
      observacoes: data.observacoes || undefined,
    })
  }

  const watchEspecieId = watch('especieId')
  const especieSelecionada = listaEspecies?.find(s => s.id === watchEspecieId)

  const columns = [
    { key: 'nome', header: 'Nome' },
    { key: 'nomeTutor', header: 'Tutor' },
    { key: 'nomeEspecie', header: 'Especie' },
    { key: 'nomeRaca', header: 'Raca', render: (p: Paciente) => p.nomeRaca || 'SRD' },
    { key: 'sexo', header: 'Sexo', render: (p: Paciente) =>
      p.sexo === 'Macho' ? 'Macho' : p.sexo === 'Femea' ? 'Femea' : '---'
    },
    { key: 'criadoEm', header: 'Cadastro', render: (p: Paciente) => formatDate(p.criadoEm) },
  ]

  return (
    <div>
      <PageHeader title="Pacientes" description="Cadastro de animais"
        actions={
          <button onClick={openForm}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:opacity-90">
            <Plus size={16} /> Novo Paciente
          </button>
        }
      />

      <div className="flex gap-3 mb-4">
        <div className="max-w-sm flex-1">
          <SearchInput value={busca} onChange={(v) => { setBusca(v); setPagina(1) }} placeholder="Buscar por nome do animal ou tutor..." />
        </div>
        <select value={filtroEspecie} onChange={e => { setFiltroEspecie(e.target.value); setPagina(1) }}
          className="px-3 py-2 border border-input rounded-lg text-sm bg-background">
          <option value="">Todas especies</option>
          {listaEspecies?.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
        </select>
      </div>

      <DataTable columns={columns} data={data?.itens ?? []} page={pagina}
        totalPages={data ? Math.ceil(data.totalRegistros / data.tamanhoPagina) : 1}
        onPageChange={setPagina} loading={isLoading}
        onRowClick={(p) => navigate(`/pacientes/${p.id}`)} />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card rounded-t-xl z-10">
              <h3 className="text-lg font-semibold">Novo Paciente</h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-secondary"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-5">
              <fieldset>
                <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tutor / Proprietario</legend>
                <Controller
                  name="tutor"
                  control={control}
                  render={({ field }) => (
                    <TutorSearch
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.tutor?.message}
                      disabled={!!(presetTutorId)}
                    />
                  )}
                />
              </fieldset>

              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Dados do Animal</legend>

                <div>
                  <label className="block text-sm font-medium mb-1">Nome <span className="text-destructive">*</span></label>
                  <input {...register('nome')}
                    className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.nome ? 'border-destructive' : 'border-input'}`}
                    placeholder="Nome do animal" />
                  {errors.nome && <p className="text-xs text-destructive mt-1">{errors.nome.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Especie <span className="text-destructive">*</span></label>
                    <select {...register('especieId', { onChange: () => setValue('racaId', '') })}
                      className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.especieId ? 'border-destructive' : 'border-input'}`}>
                      <option value="">Selecione...</option>
                      {listaEspecies?.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                    </select>
                    {errors.especieId && <p className="text-xs text-destructive mt-1">{errors.especieId.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Raca</label>
                    <select {...register('racaId')}
                      className="w-full px-3 py-2 border border-input rounded-lg text-sm" disabled={!watchEspecieId}>
                      <option value="">SRD / Nao informada</option>
                      {especieSelecionada?.racas.map(b => <option key={b.id} value={b.id}>{b.nome}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Sexo</label>
                    <select {...register('sexo')}
                      className="w-full px-3 py-2 border border-input rounded-lg text-sm">
                      <option value="Desconhecido">Nao informado</option>
                      <option value="Macho">Macho</option>
                      <option value="Femea">Femea</option>
                    </select>
                  </div>
                  <Controller
                    name="dataNascimento"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        label="Nascimento"
                        value={field.value ?? null}
                        onChange={field.onChange}
                        maxDate={new Date()}
                        placeholder="Data de nascimento"
                      />
                    )}
                  />
                  <div>
                    <label className="block text-sm font-medium mb-1">Peso (kg)</label>
                    <input type="number" step="0.1" min="0" {...register('peso')}
                      className="w-full px-3 py-2 border border-input rounded-lg text-sm" placeholder="0.0" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Pelagem / Cor</label>
                    <input {...register('cor')}
                      className="w-full px-3 py-2 border border-input rounded-lg text-sm" placeholder="Ex: Caramelo" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Microchip</label>
                    <input {...register('microchip')}
                      className="w-full px-3 py-2 border border-input rounded-lg text-sm" placeholder="Numero do chip" />
                  </div>
                </div>

                <Controller
                  name="castrado"
                  control={control}
                  render={({ field }) => (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={field.value} onChange={field.onChange}
                        className="rounded border-input" />
                      <span className="text-sm">Castrado(a)</span>
                    </label>
                  )}
                />
              </fieldset>

              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Saude</legend>
                <div>
                  <label className="block text-sm font-medium mb-1">Alergias conhecidas</label>
                  <input {...register('alergias')}
                    className="w-full px-3 py-2 border border-input rounded-lg text-sm" placeholder="Descreva alergias conhecidas..." />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Observacoes</label>
                  <textarea {...register('observacoes')}
                    className="w-full px-3 py-2 border border-input rounded-lg text-sm h-16 resize-none"
                    placeholder="Observacoes gerais sobre o animal..." />
                </div>
              </fieldset>

              <div className="flex justify-end gap-3 pt-2 border-t border-border">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-secondary">Cancelar</button>
                <button type="submit" disabled={createMutation.isPending}
                  className="px-6 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">
                  {createMutation.isPending ? 'Salvando...' : 'Cadastrar Paciente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
