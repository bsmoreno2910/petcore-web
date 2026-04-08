import api from './client'

export interface Order {
  id: string; clinicId: string; code: string; type: string; status: string
  period?: string; notes?: string; justification?: string
  createdById: string; createdByName: string
  approvedById?: string; approvedByName?: string; approvedAt?: string
  createdAt: string; items: OrderItem[]
}
export interface OrderItem {
  id: string; productId: string; productName: string; unitAbbreviation: string
  quantityRequested: number; quantityApproved?: number; quantityReceived: number; notes?: string
}

export const ordersApi = {
  list: () => api.get<Order[]>('/api/orders').then(r => r.data),
  get: (id: string) => api.get<Order>(`/api/orders/${id}`).then(r => r.data),
  create: (data: Record<string, unknown>) => api.post('/api/orders', data).then(r => r.data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/api/orders/${id}`, data).then(r => r.data),
  submit: (id: string) => api.patch(`/api/orders/${id}/submit`).then(r => r.data),
  approve: (id: string) => api.patch(`/api/orders/${id}/approve`).then(r => r.data),
  receive: (id: string, items: { orderItemId: string; quantityReceived: number }[]) =>
    api.patch(`/api/orders/${id}/receive`, { items }).then(r => r.data),
  cancel: (id: string) => api.patch(`/api/orders/${id}/cancel`).then(r => r.data),
}
