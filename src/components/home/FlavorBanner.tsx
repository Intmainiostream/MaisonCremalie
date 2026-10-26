import { Link } from 'react-router-dom'
import { useProduct } from '../../hooks/useProducts'
import { formatPrice } from '../../lib/format'
import { productTint } from '../../lib/tints'
import Reveal from '../Reveal'
import CreamPuff from '../illustrations/CreamPuff'
import Sparkle from '../illustrations/Sparkle'
import Heart from '../illustrations/Heart'
import './FlavorBanner.css'

const FLAVOR_OF_THE_MONTH = 'chou-fraise-eternelle'

function FlavorBanner() {
  const { data: flavor } = useProduct(FLAVOR_OF_THE_MONTH)

  // The banner is a bonus: skip it while loading or if the product is gone
  if (!flavor) return null

  return (
    <section className="section container" aria-labelledby="fotm-title">
      <Reveal>
        <div className="fotm">
          <div className="fotm-copy">
            <p className="fotm-eyebrow">
              <Sparkle /> Flavor of the month
            </p>
            <h2 id="fotm-title" className="fotm-title">
              {flavor.name}
            </h2>
            <p className="fotm-text">
              {flavor.description} Here for a little while only, so grab one before it floats away.
            </p>
            <Link to={`/shop?category=${flavor.category.slug}`} className="btn btn-light fotm-btn">
              Get yours · {formatPrice(flavor.price)}
            </Link>
          </div>

          <div className="fotm-art" aria-hidden="true">
            <span className="fotm-ring" />
            <CreamPuff color={productTint(flavor.slug)} className="fotm-puff" />
            <Sparkle className="fotm-deco fotm-deco--1" />
            <Sparkle className="fotm-deco fotm-deco--2" />
            <Heart className="fotm-deco fotm-deco--3" />
          </div>
        </div>
      </Reveal>
    </section>
  )
}

export default FlavorBanner
