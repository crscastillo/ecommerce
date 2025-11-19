export { CustomerStatsCards } from './customer-stats-cards'
export { CustomerFilters } from './customer-filters'
export { CustomersTable } from './customers-table'
export { CustomerDetailsModal } from './customer-details-modal'

// Types
export interface CustomerStats {
  total: number
  withOrders: number
  totalSpent: number
  averageOrderValue: number
}