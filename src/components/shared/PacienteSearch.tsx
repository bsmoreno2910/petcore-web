import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { PawPrint } from 'lucide-react'
import { pacientesApi, type Paciente } from '@/api/patients.api'

interface PacienteSearchProps {
  value: { id: string; nome: string } | null
  onChange: (paciente: { id: string; nome: string } | null) => void
  error?: string
  disabled?: boolean
}

export function PacienteSearch({ value, onChange, error, disabled }: PacienteSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Paciente[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.length < 2) { setResults([]); return }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await pacientesApi.listar({ pagina: 1, tamanhoPagina: 8, busca: query })
        setResults(data.itens)
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

  if (value) {
    return (
      <div>
        <label className="block text-sm font-medium mb-1">Paciente <span className="text-destructive">*</span></label>
        <div className={`flex items-center justify-between px-3 py-2.5 border rounded-lg text-sm ${disabled ? 'bg-muted border-muted' : 'border-input bg-accent/5'}`}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center">
              <PawPrint size={14} className="text-accent" />
            </div>
            <span className="font-medium">{value.nome}</span>
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
    <div ref={ref} className="relative">
      <label className="block text-sm font-medium mb-1">Paciente <span className="text-destructive">*</span></label>
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Buscar paciente por nome..."
          className={`w-full pl-9 pr-4 py-2 border rounded-lg text-sm ${error ? 'border-destructive' : 'border-input'}`}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">buscando...</div>
        )}
      </div>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}

      {open && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map(p => (
            <button key={p.id} type="button"
              onClick={() => { onChange({ id: p.id, nome: p.nome }); setOpen(false); setQuery('') }}
              className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-secondary transition-colors text-left border-b border-border last:border-0">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mt-0.5">
                <PawPrint size={14} className="text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{p.nome}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {p.nomeEspecie} - Tutor: {p.nomeTutor}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {open && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">Nenhum paciente encontrado para "{query}"</p>
        </div>
      )}
    </div>
  )
}
