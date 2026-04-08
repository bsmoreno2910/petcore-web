import { useState, useEffect, useRef } from 'react'
import { Search, X, User, UserPlus } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { tutorsApi, type Tutor } from '@/api/tutors.api'
import { TutorForm } from '@/components/tutors/TutorForm'

interface TutorSearchProps {
  value: { id: string; name: string } | null
  onChange: (tutor: { id: string; name: string } | null) => void
  error?: string
  disabled?: boolean
}

export function TutorSearch({ value, onChange, error, disabled }: TutorSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Tutor[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showNewTutor, setShowNewTutor] = useState(false)
  const [creatingTutor, setCreatingTutor] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const qc = useQueryClient()

  useEffect(() => {
    if (query.length < 2) { setResults([]); return }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await tutorsApi.list({ page: 1, pageSize: 8, search: query })
        setResults(data.items)
        setOpen(true)
      } catch { /* ignore */ }
      finally { setLoading(false) }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleCreateTutor = async (data: Record<string, unknown>) => {
    setCreatingTutor(true)
    try {
      const created = await tutorsApi.create(data)
      qc.invalidateQueries({ queryKey: ['tutors'] })
      onChange({ id: created.id, name: created.name })
      setShowNewTutor(false)
      toast.success('Tutor cadastrado e vinculado!')
    } catch {
      toast.error('Erro ao cadastrar tutor')
    } finally {
      setCreatingTutor(false)
    }
  }

  if (value) {
    return (
      <div>
        <label className="block text-sm font-medium mb-1">Tutor <span className="text-destructive">*</span></label>
        <div className={`flex items-center justify-between px-3 py-2.5 border rounded-lg text-sm ${disabled ? 'bg-muted border-muted' : 'border-input bg-accent/5'}`}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center">
              <User size={14} className="text-accent" />
            </div>
            <span className="font-medium">{value.name}</span>
          </div>
          {!disabled && (
            <button type="button" onClick={() => { onChange(null); setQuery('') }}
              className="p-1 rounded hover:bg-secondary transition-colors"><X size={14} /></button>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <div ref={ref} className="relative">
        <label className="block text-sm font-medium mb-1">Tutor <span className="text-destructive">*</span></label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => results.length > 0 && setOpen(true)}
              placeholder="Buscar por nome, CPF, RG ou telefone..."
              className={`w-full pl-9 pr-4 py-2 border rounded-lg text-sm ${error ? 'border-destructive' : 'border-input'}`}
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">buscando...</div>
            )}
          </div>
          <button type="button" onClick={() => setShowNewTutor(true)}
            className="px-3 py-2 bg-accent text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5 text-xs font-medium whitespace-nowrap"
            title="Cadastrar novo tutor">
            <UserPlus size={15} /> Novo
          </button>
        </div>
        {error && <p className="text-xs text-destructive mt-1">{error}</p>}

        {open && results.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {results.map(t => (
              <button key={t.id} type="button"
                onClick={() => { onChange({ id: t.id, name: t.name }); setOpen(false); setQuery('') }}
                className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-secondary transition-colors text-left border-b border-border last:border-0">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mt-0.5">
                  <User size={14} className="text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {[t.cpf, t.phone, t.email].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {open && query.length >= 2 && results.length === 0 && !loading && (
          <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">Nenhum tutor encontrado para "{query}"</p>
            <button type="button" onClick={() => { setOpen(false); setShowNewTutor(true) }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white rounded-md text-xs font-medium hover:opacity-90">
              <UserPlus size={14} /> Cadastrar novo tutor
            </button>
          </div>
        )}
      </div>

      <TutorForm
        open={showNewTutor}
        onClose={() => setShowNewTutor(false)}
        onSubmit={handleCreateTutor}
        loading={creatingTutor}
        initialData={null}
        title="Cadastrar Novo Tutor"
      />
    </>
  )
}
