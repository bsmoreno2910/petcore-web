import { useState } from 'react'
import { Building2, ChevronDown } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { authApi } from '@/api/auth.api'

export function ClinicSwitcher() {
  const { clinics, activeClinic, setActiveClinic, setTokens } = useAuthStore()
  const [open, setOpen] = useState(false)

  if (clinics.length <= 1) return null

  const handleSelect = async (clinic: typeof clinics[0]) => {
    try {
      const result = await authApi.selectClinic(clinic.id)
      setTokens(result.accessToken, result.refreshToken)
      setActiveClinic(clinic)
      setOpen(false)
      window.location.reload()
    } catch {
      // silently fail
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:bg-secondary transition-colors text-sm"
      >
        <Building2 size={16} />
        <span>{activeClinic?.name ?? 'Selecionar clínica'}</span>
        <ChevronDown size={14} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-64 bg-card border border-border rounded-lg shadow-lg z-50">
          {clinics.map((c) => (
            <button
              key={c.id}
              onClick={() => handleSelect(c)}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-secondary transition-colors first:rounded-t-lg last:rounded-b-lg flex justify-between"
            >
              <span>{c.name}</span>
              <span className="text-muted-foreground text-xs">{c.role}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
