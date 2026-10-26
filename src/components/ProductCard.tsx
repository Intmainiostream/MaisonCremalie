import type { CSSProperties } from 'react'
import type { Product } from '../types/product'
import { formatPrice } from '../lib/format'
import { productTint } from '../lib/tints'
import ProductIllustration from './ProductIllustration'
import './ProductCard.css'

interface ProductCardProps {
  product: Product
  layout?: 'default' | 'large' | 'wide'
}

function ProductCard({ product, layout = 'default' }: ProductCardProps) {
  const tint = productTint(product.slug)
  const soldOut = !product.available

  return (
    <article
      className={`product-card product-card--${layout} ${soldOut ? 'is-sold-out' : ''}`}
      style={{ '--tint': tint } as CSSProperties}
    >
      <div className="product-card-art">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} loading="lazy" />
        ) : (
          <ProductIllustration
            categorySlug={product.category.slug}
            color={tint}
            className="product-card-illustration"
          />
        )}
        <span className="product-card-badge">{product.category.name}</span>
        {soldOut && <span className="product-card-badge product-card-badge--sold-out">Sold out</span>}
      </div>

      <div className="product-card-body">
        <h3 className="product-card-name">{product.name}</h3>
        <p className="product-card-desc">{product.description}</p>
        <div className="product-card-footer">
          <p className="product-card-price">
            <span className="visually-hidden">Price: </span>
            {formatPrice(product.price)}
          </p>
          <button
            type="button"
            className="product-card-add"
            aria-label={soldOut ? `${product.name} is sold out` : `Add ${product.name}`}
            disabled={soldOut}
          >
            <span aria-hidden="true">+</span> Add
          </button>
        </div>
      </div>
    </article>
  )
}

export default ProductCard
