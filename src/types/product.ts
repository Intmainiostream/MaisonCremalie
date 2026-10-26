// Shapes returned by the API (see server/src/routes/).

export interface CategoryRef {
  id: number
  name: string
  slug: string
}

export interface Category extends CategoryRef {
  sortOrder: number
  productCount: number
  createdAt: string
}

export interface Product {
  id: number
  name: string
  slug: string
  description: string
  price: number // in PHP
  imageUrl?: string
  featured: boolean
  available: boolean // false = sold out
  category: CategoryRef
  createdAt: string
  updatedAt: string
}
