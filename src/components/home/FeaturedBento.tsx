import { Link } from 'react-router-dom'
import { useProducts } from '../../hooks/useProducts'
import ErrorState from '../ErrorState'
import ProductCard from '../ProductCard'
import ProductCardSkeleton from '../ProductCardSkeleton'
import Reveal from '../Reveal'
import Heart from '../illustrations/Heart'
import './FeaturedBento.css'

function layoutFor(index: number, count: number) {
  if (index === 0) return 'large'
  if (count > 2 && index === count - 1) return 'wide'
  return 'default'
}

function FeaturedBento() {
  const { data, loading, error, retry } = useProducts({ featured: true })
  const products = data ?? []

  return (
    <section id="flavors" className="section container" aria-labelledby="featured-title">
      <Reveal className="section-head">
        <p className="eyebrow">
          <Heart /> Sweet favorites
        </p>
        <h2 id="featured-title" className="display-title">
          Fresh from the oven
        </h2>
        <p className="section-lead">The little treats our regulars can't stop coming back for.</p>
      </Reveal>

      {error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : (
        <div className="bento" aria-busy={loading}>
          {loading
            ? [0, 1, 2, 3].map((i) => (
                <div key={i} className="bento-item">
                  <ProductCardSkeleton />
                </div>
              ))
            : products.map((product, index) => (
                <Reveal key={product.id} className="bento-item" delay={index * 90}>
                  <ProductCard product={product} layout={layoutFor(index, products.length)} />
                </Reveal>
              ))}
        </div>
      )}

      <div className="featured-more">
        <Link to="/shop" className="btn btn-secondary">
          See all sweets <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  )
}

export default FeaturedBento
