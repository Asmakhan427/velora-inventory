import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { suppliersApi } from '@/lib/api/suppliers'
import type { SupplierInput, ListParams } from '@/lib/api/types'

const key = (params: ListParams) => ['suppliers', params] as const

export function useSuppliers(params: ListParams) {
  return useQuery({
    queryKey: key(params),
    queryFn: () => suppliersApi.list(params),
    placeholderData: (prev) => prev,
  })
}

export function useSupplier(id: number | null) {
  return useQuery({
    queryKey: ['suppliers', 'detail', id],
    queryFn: () => suppliersApi.get(id as number),
    enabled: id !== null,
  })
}

export function useCreateSupplier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: SupplierInput) => suppliersApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers'] }),
  })
}

export function useUpdateSupplier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<SupplierInput> }) => suppliersApi.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers'] }),
  })
}

export function useDeleteSupplier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => suppliersApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers'] }),
  })
}

export function useSupplierDeliveries(id: number | null, limit = 10) {
  return useQuery({
    queryKey: ['suppliers', 'deliveries', id, limit],
    queryFn: () => suppliersApi.deliveries(id as number, limit),
    enabled: id !== null,
  })
}
