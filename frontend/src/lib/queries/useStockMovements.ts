import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { productsApi } from '@/lib/api/products'
import type { StockMovementInput } from '@/lib/api/types'

export function useStockMovements(productId: number | null, page: number, pageSize = 10) {
  return useQuery({
    queryKey: ['stock-movements', productId, page, pageSize],
    queryFn: () => productsApi.stockMovements(productId as number, { page, pageSize }),
    enabled: productId !== null,
  })
}

export function useRecordMovement(productId: number | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: StockMovementInput) => productsApi.recordMovement(productId as number, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock-movements', productId] })
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
