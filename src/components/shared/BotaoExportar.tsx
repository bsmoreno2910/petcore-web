import { useState } from 'react'
import { Download } from 'lucide-react'
import { downloadExcel } from '@/lib/download'

interface ExportButtonProps {
  url: string
  filename: string
  params?: Record<string, unknown>
  label?: string
}

export function ExportButton({ url, filename, params, label = 'Exportar Excel' }: ExportButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      await downloadExcel(url, filename, params)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
    >
      <Download size={16} />
      {loading ? 'Exportando...' : label}
    </button>
  )
}
