import { api } from './client'
import type { ApiListResult, Category, CategoryInput, ListParams } from './types'

export const categoriesApi = {
  list: (params: ListParams): Promise<ApiListResult<Category>> => api.getList<Category>('/categories', params as Record<string, string | number>),
  get: (id: number) => api.get<Category>(`/categories/${id}`),
  create: (input: CategoryInput) => api.post<Category>('/categories', input),
  update: (id: number, input: Partial<CategoryInput>) => api.put<Category>(`/categories/${id}`, input),
  remove: (id: number) => api.delete<null>(`/categories/${id}`),
}
