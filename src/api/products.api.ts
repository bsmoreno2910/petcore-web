import api from './client'
import type { PagedResponse } from '@/types/common'

export interface ProductCategory {
  id: string; name: string; description?: string; color?: string; active: boolean
}
export interface ProductUnit {
  id: string; abbreviation: string; name: string
}
export interface Product {
  id: string; clinicId: string; categoryId: string; categoryName: string; categoryColor?: string
  unitId: string; unitAbbreviation: string; name: string; presentation?: string
  currentStock: number; minStock: number; maxStock?: number
  costPrice?: number; sellingPrice?: number; location?: string
  barcode?: string; batch?: string; expirationDate?: string
  active: boolean; notes?: string; createdAt: string; stockStatus: string
}

export const productsApi = {
  categories: () => api.get<ProductCategory[]>('/api/product-categories').then(r => r.data),
  createCategory: (data: Record<string, unknown>) => api.post('/api/product-categories', data).then(r => r.data),
  units: () => api.get<ProductUnit[]>('/api/product-units').then(r => r.data),
  list: (params: Record<string, unknown>) =>
    api.get<PagedResponse<Product>>('/api/products', { params }).then(r => r.data),
  get: (id: string) => api.get<Product>(`/api/products/${id}`).then(r => r.data),
  create: (data: Record<string, unknown>) => api.post('/api/products', data).then(r => r.data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/api/products/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/api/products/${id}`),
  lowStock: () => api.get<Product[]>('/api/products/low-stock').then(r => r.data),
  zeroStock: () => api.get<Product[]>('/api/products/zero-stock').then(r => r.data),
  expiring: (days?: number) => api.get<Product[]>('/api/products/expiring', { params: { daysAhead: days } }).then(r => r.data),
}
