import type { Product } from '../types/product'
import { useApi } from './useApi'

interface ProductFilters {
  category?: string
  featured?: boolean
}

export function useProducts({ category, featured }: ProductFilters = {}) {
  const params = new URLSearchParams()
  if (category) params.set('category', category)
  if (featured !== undefined) params.set('featured', String(featured))
  const query = params.toString()

  return useApi<Product[]>(`/api/products${query ? `?${query}` : ''}`)
}

export function useProduct(slug: string) {
  return useApi<Product>(`/api/products/${encodeURIComponent(slug)}`)
}
