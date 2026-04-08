export interface PagedResponse<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface PagedRequest {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortDescending?: boolean
}
