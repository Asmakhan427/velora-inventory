export interface Meta {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface ApiListResult<T> {
  data: T[]
  meta: Meta
}

export interface Category {
  id: number
  name: string
  description: string | null
  product_count?: number
  stock_value?: number
  low_stock_count?: number
  created_at: string
  updated_at: string
}

export interface Supplier {
  id: number
  name: string
  contact_email: string
  phone: string | null
  address: string | null
  contact_person: string | null
  country: string | null
  website: string | null
  product_count?: number
  created_at: string
  updated_at: string
}

export interface SupplierDelivery {
  id: number
  product_id: number
  product_name: string
  sku: string
  quantity: number
  reason: string | null
  created_at: string
}

export interface SupplierDeliveriesResult {
  deliveries: SupplierDelivery[]
  totalDeliveries: number
  lastDeliveryAt: string | null
}

export interface Product {
  id: number
  name: string
  sku: string
  description: string | null
  unit_price: number
  quantity_in_stock: number
  category_id: number
  supplier_id: number
  category_name?: string
  supplier_name?: string
  created_at: string
  updated_at: string
}

export type StockMovementType = 'IN' | 'OUT'

export interface StockMovement {
  id: number
  product_id: number
  type: StockMovementType
  quantity: number
  reason: string | null
  created_at: string
  running_balance?: number
}

export interface RecentMovement extends StockMovement {
  product_name: string
  sku: string
}

export interface DashboardSummary {
  totalProducts: number
  totalStockValue: number
  totalUnits: number
  outOfStockCount: number
  lowStockCount: number
  categoryCount: number
  supplierCount: number
  byCategory: { category: string; product_count: number; stock_value: number }[]
  bySupplier: { supplier: string; product_count: number; stock_value: number }[]
  recentMovements: RecentMovement[]
}

export interface DashboardTrendPoint {
  date: string
  in_qty: number
  out_qty: number
}

export interface DashboardTrends {
  days: number
  points: DashboardTrendPoint[]
}

export type ProductStatus = 'in_stock' | 'low_stock' | 'out_of_stock'

export interface ProductListParams {
  search?: string
  category?: number | string
  supplier?: number | string
  status?: ProductStatus
  page?: number
  pageSize?: number
  sortBy?: 'name' | 'sku' | 'unit_price' | 'quantity_in_stock' | 'created_at'
  sortDir?: 'asc' | 'desc'
}

export interface ListParams {
  search?: string
  page?: number
  pageSize?: number
}

export interface ProductInput {
  name: string
  sku: string
  description?: string
  unit_price: number
  quantity_in_stock?: number
  category_id: number
  supplier_id: number
}

export interface CategoryInput {
  name: string
  description?: string
}

export interface SupplierInput {
  name: string
  contact_email: string
  phone?: string
  address?: string
  contact_person?: string
  country?: string
  website?: string
}

export interface StockMovementInput {
  type: StockMovementType
  quantity: number
  reason?: string
}

export interface StockMovementResult {
  movement: StockMovement
  product: Product
  newQuantity: number
}

export interface LoginInput {
  username: string
  password: string
}

export interface LoginResult {
  token: string
  user: { id: number; username: string; role: 'ADMIN' | 'STAFF' }
}

export interface ApiErrorBody {
  code: string
  message: string
  details?: Record<string, unknown>
}
