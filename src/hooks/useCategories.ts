import type { Category } from '../types/product'
import { useApi } from './useApi'

export function useCategories() {
  return useApi<Category[]>('/api/categories')
}
