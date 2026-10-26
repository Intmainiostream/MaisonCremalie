import './ProductCard.css'
import './ProductCardSkeleton.css'

function ProductCardSkeleton() {
  return (
    <div className="product-card skeleton-card" aria-hidden="true">
      <div className="product-card-art skeleton-shimmer" />
      <div className="product-card-body">
        <span className="skeleton-line skeleton-shimmer" style={{ width: '60%', height: '1.4rem' }} />
        <span className="skeleton-line skeleton-shimmer" />
        <span className="skeleton-line skeleton-shimmer" style={{ width: '80%' }} />
        <div className="product-card-footer">
          <span className="skeleton-line skeleton-shimmer" style={{ width: '30%', height: '1.4rem' }} />
          <span className="skeleton-pill skeleton-shimmer" />
        </div>
      </div>
    </div>
  )
}

export default ProductCardSkeleton
