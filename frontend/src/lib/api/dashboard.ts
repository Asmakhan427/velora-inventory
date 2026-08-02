import { api } from './client'
import type { DashboardSummary, DashboardTrends } from './types'

export const dashboardApi = {
  summary: () => api.get<DashboardSummary>('/dashboard/summary'),
  trends: (days: number) => api.get<DashboardTrends>('/dashboard/trends', { days }),
}
