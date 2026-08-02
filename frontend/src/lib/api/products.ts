import { api } from './client'
import type {
  ApiListResult,
  Product,
  ProductInput,
  ProductListParams,
  StockMovement,
  StockMovementInput,
  StockMovementResult,
} from './types'

export const productsApi = {
  list: (params: ProductListParams): Promise<ApiListResult<Product>> =>
    api.getList<Product>('/products', params as Record<string, string | number>),
  get: (id: number) => api.get<Product>(`/products/${id}`),
  create: (input: ProductInput) => api.post<Product>('/products', input),
  update: (id: number, input: Partial<ProductInput>) => api.put<Product>(`/products/${id}`, input),
  remove: (id: number) => api.delete<null>(`/products/${id}`),
  stockMovements: (id: number, params: { page?: number; pageSize?: number }): Promise<ApiListResult<StockMovement>> =>
    api.getList<StockMovement>(`/products/${id}/stock-movements`, params),
  recordMovement: (id: number, input: StockMovementInput) =>
    api.post<StockMovementResult>(`/products/${id}/stock-movements`, input),
  exportCsvUrl: (params: ProductListParams) => api.buildUrl('/products/export/csv', params as Record<string, string>),
}
