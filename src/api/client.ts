import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth.store'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor: adiciona token de acesso
api.interceptors.request.use((config) => {
  const { tokenAcesso } = useAuthStore.getState()
  if (tokenAcesso) {
    config.headers.Authorization = `Bearer ${tokenAcesso}`
  }
  return config
})

// Silent refresh token logic
let isRefreshing = false
let failedQueue: { resolve: (token: string) => void; reject: (err: unknown) => void }[] = []

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token!)
  })
  failedQueue = []
}

// Response interceptor: tenta refresh silencioso em 401
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Se não é 401 ou já tentou retry, rejeita
    if (error.response?.status !== 401 || originalRequest._retry) {
      // Se 401 após retry, faz logout
      if (error.response?.status === 401 && originalRequest._retry) {
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }

    // Não tenta refresh em rotas de autenticação
    if (originalRequest.url?.includes('/api/autenticacao/')) {
      return Promise.reject(error)
    }

    // Se já está fazendo refresh, enfileira a requisição
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    const { tokenAtualizacao } = useAuthStore.getState()

    if (!tokenAtualizacao) {
      isRefreshing = false
      useAuthStore.getState().logout()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    try {
      const { data } = await axios.post(
        `${api.defaults.baseURL}/api/autenticacao/refresh`,
        { tokenAtualizacao },
        { headers: { 'Content-Type': 'application/json' } },
      )

      const novoTokenAcesso = data.tokenAcesso
      const novoTokenAtualizacao = data.tokenAtualizacao

      useAuthStore.getState().setTokens(novoTokenAcesso, novoTokenAtualizacao)

      originalRequest.headers.Authorization = `Bearer ${novoTokenAcesso}`
      processQueue(null, novoTokenAcesso)

      return api(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      useAuthStore.getState().logout()
      window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export default api
