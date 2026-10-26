import { useProducts } from '../hooks/useProducts'
import Sparkle from './illustrations/Sparkle'
import './Marquee.css'

// Shown while products load, or if the API is unreachable
const fallback = ['Macarons', 'Cream puffs', 'Baked fresh daily', 'Made with real cream', 'Gift-ready boxes']

function Marquee() {
  const { data } = useProducts()
  const names = data?.length ? data.map((p) => p.name) : fallback

  return (
    <div className="marquee">
      {/* Two identical lists so the loop looks seamless; the copy is hidden from screen readers */}
      <div className="marquee-track">
        {[0, 1].map((copy) => (
          <ul key={copy} className="marquee-list" aria-hidden={copy === 1 ? true : undefined}>
            {names.map((name) => (
              <li key={name}>
                {name}
                <Sparkle className="marquee-sparkle" />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  )
}

export default Marquee
