import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/lib/api/dashboard'

export function useDashboardSummary(options?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: () => dashboardApi.summary(),
    retry: 1,
    ...options,
  })
}

export function useDashboardTrends(days: number) {
  return useQuery({
    queryKey: ['dashboard', 'trends', days],
    queryFn: () => dashboardApi.trends(days),
    placeholderData: (prev) => prev,
    retry: 1,
  })
}
