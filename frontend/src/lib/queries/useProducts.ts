import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { productsApi } from '@/lib/api/products'
import type { ProductInput, ProductListParams } from '@/lib/api/types'

const key = (params: ProductListParams) => ['products', params] as const

export function useProducts(params: ProductListParams) {
  return useQuery({
    queryKey: key(params),
    queryFn: () => productsApi.list(params),
    placeholderData: (prev) => prev,
  })
}

export function useProduct(id: number | null) {
  return useQuery({
    queryKey: ['products', 'detail', id],
    queryFn: () => productsApi.get(id as number),
    enabled: id !== null,
  })
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: ProductInput) => productsApi.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<ProductInput> }) => productsApi.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => productsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
