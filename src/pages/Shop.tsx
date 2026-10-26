import { useSearchParams } from 'react-router-dom'
import ErrorState from '../components/ErrorState'
import FilterChips from '../components/FilterChips'
import ProductCard from '../components/ProductCard'
import ProductCardSkeleton from '../components/ProductCardSkeleton'
import Reveal from '../components/Reveal'
import Macaron from '../components/illustrations/Macaron'
import CreamPuff from '../components/illustrations/CreamPuff'
import Sparkle from '../components/illustrations/Sparkle'
import { useCategories } from '../hooks/useCategories'
import { useProducts } from '../hooks/useProducts'
import './Shop.css'

function Shop() {
  const products = useProducts()
  const categories = useCategories()

  // Like $request->query('category'), but updating it re-renders the page without a reload
  const [searchParams, setSearchParams] = useSearchParams()
  const requested = searchParams.get('category') ?? 'all'
  const known = !categories.data || categories.data.some((c) => c.slug === requested)
  const filter = known ? requested : 'all'

  const options = [
    { value: 'all', label: 'All' },
    ...(categories.data ?? []).map((c) => ({ value: c.slug, label: c.name })),
  ]
  const visible = (products.data ?? []).filter((p) => filter === 'all' || p.category.slug === filter)

  function handleFilter(value: string) {
    setSearchParams(value === 'all' ? {} : { category: value }, { replace: true })
  }

  function retry() {
    products.retry()
    categories.retry()
  }

  function renderProducts() {
    if (products.error) return <ErrorState message={products.error} onRetry={retry} />
    if (products.loading) {
      return (
        <div className="product-grid" role="status">
          <span className="visually-hidden">Loading sweets…</span>
          {Array.from({ length: 8 }, (_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      )
    }
    if (visible.length === 0) return <p className="shop-empty">No sweets here yet. Check back soon!</p>
    return (
      <div className="product-grid">
        {visible.map((product, index) => (
          <Reveal key={product.id} delay={(index % 4) * 70}>
            <ProductCard product={product} />
          </Reveal>
        ))}
      </div>
    )
  }

  return (
    <div className="container shop">
      <div className="shop-hero">
        <Macaron color="var(--tint-lavender)" className="shop-hero-art shop-hero-art--left" />
        <CreamPuff color="var(--tint-rose)" className="shop-hero-art shop-hero-art--right" />
        <div className="shop-hero-copy">
          <p className="eyebrow">
            <Sparkle /> La boutique
          </p>
          <h1 className="display-title">The Sweet Shop</h1>
          <p className="section-lead">
            Pick your favorites from our little case of macarons and cream puffs.
          </p>
        </div>
      </div>

      <section aria-label="Products">
        <div className="shop-toolbar">
          {categories.loading ? (
            <div className="chips-skeleton skeleton-shimmer" aria-hidden="true" />
          ) : (
            <FilterChips options={options} value={filter} onChange={handleFilter} label="Filter sweets" />
          )}
          <p className="shop-count" aria-live="polite">
            {products.data && `${visible.length} ${visible.length === 1 ? 'sweet' : 'sweets'}`}
          </p>
        </div>

        {renderProducts()}
      </section>
    </div>
  )
}

export default Shop
