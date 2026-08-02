import { api } from './client'
import type { ApiListResult, Supplier, SupplierInput, SupplierDeliveriesResult, ListParams } from './types'

export const suppliersApi = {
  list: (params: ListParams): Promise<ApiListResult<Supplier>> => api.getList<Supplier>('/suppliers', params as Record<string, string | number>),
  get: (id: number) => api.get<Supplier>(`/suppliers/${id}`),
  create: (input: SupplierInput) => api.post<Supplier>('/suppliers', input),
  update: (id: number, input: Partial<SupplierInput>) => api.put<Supplier>(`/suppliers/${id}`, input),
  remove: (id: number) => api.delete<null>(`/suppliers/${id}`),
  deliveries: (id: number, limit = 10) => api.get<SupplierDeliveriesResult>(`/suppliers/${id}/deliveries`, { limit }),
}
