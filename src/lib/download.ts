import { saveAs } from 'file-saver'
import api from '@/api/cliente'

export async function downloadExcel(url: string, filename: string, params?: Record<string, unknown>) {
  const response = await api.get(url, {
    params,
    responseType: 'blob',
  })
  saveAs(new Blob([response.data]), filename)
}
