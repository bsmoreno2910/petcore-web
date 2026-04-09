import { useState, useEffect, useRef } from 'react'
import { Search, X, Stethoscope } from 'lucide-react'
import { usuariosApi } from '@/api/users.api'
import type { Usuario } from '@/types/user'

interface VeterinarioSearchProps {
  value: { id: string; nome: string } | null
  onChange: (vet: { id: string; nome: string } | null) => void
  error?: string
  disabled?: boolean
  label?: string
}

export function VeterinarioSearch({ value, onChange, error, disabled, label = 'Veterinario' }: VeterinarioSearchProps) {
  const [query, setQuery] = useState('')
  const [allVets, setAllVets] = useState<Usuario[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (loaded) return
    setLoading(true)
    usuariosApi.listar().then(users => {
      const vets = users.filter(u =>
        u.ativo && u.clinicas.some(c =>
          ['Veterinario', 'Admin', 'SuperAdmin'].includes(c.perfil)
        )
      )
      setAllVets(vets)
      setLoaded(true)
    }).catch(() => { /* ignore */ }).finally(() => setLoading(false))
  }, [loaded])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = query.length >= 2
    ? allVets.filter(v =>
        v.nome.toLowerCase().includes(query.toLowerCase()) ||
        v.email.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : []

  if (value) {
    return (
      <div>
        <label className="block text-sm font-medium mb-1">{label}</label>
        <div className={`flex items-center justify-between px-3 py-2.5 border rounded-lg text-sm ${disabled ? 'bg-muted border-muted' : 'border-input bg-accent/5'}`}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center">
              <Stethoscope size={14} className="text-accent" />
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
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); if (e.target.value.length >= 2) setOpen(true) }}
          onFocus={() => filtered.length > 0 && setOpen(true)}
          placeholder="Buscar veterinario por nome ou e-mail..."
          className={`w-full pl-9 pr-4 py-2 border rounded-lg text-sm ${error ? 'border-destructive' : 'border-input'}`}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">carregando...</div>
        )}
      </div>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}

      {open && filtered.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filtered.map(v => (
            <button key={v.id} type="button"
              onClick={() => { onChange({ id: v.id, nome: v.nome }); setOpen(false); setQuery('') }}
              className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-secondary transition-colors text-left border-b border-border last:border-0">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mt-0.5">
                <Stethoscope size={14} className="text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{v.nome}</p>
                <p className="text-xs text-muted-foreground truncate">{v.email}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {open && query.length >= 2 && filtered.length === 0 && !loading && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">Nenhum veterinario encontrado para "{query}"</p>
        </div>
      )}
    </div>
  )
}
