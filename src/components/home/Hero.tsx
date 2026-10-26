import { Link } from 'react-router-dom'
import Mascot from '../illustrations/Mascot'
import Macaron from '../illustrations/Macaron'
import CreamPuff from '../illustrations/CreamPuff'
import Sparkle from '../illustrations/Sparkle'
import Heart from '../illustrations/Heart'
import './Hero.css'

function Hero() {
  return (
    <section className="hero container" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow">
          <Sparkle /> Pâtisserie of sweet dreams
        </p>
        <h1 id="hero-title" className="hero-title">
          <span>Maison</span> <span>Crémalie</span>
        </h1>
        <p className="hero-tagline">
          Cloud-soft cream puffs and dreamy macarons, whipped fresh every morning and topped with a
          little strawberry magic.
        </p>
        <div className="hero-actions">
          <Link to="/shop" className="btn btn-primary">
            Shop now
          </Link>
          <a href="#flavors" className="btn btn-secondary">
            See flavors
          </a>
        </div>
      </div>

      <div className="hero-art">
        <div className="hero-glow" aria-hidden="true" />
        <Mascot className="hero-mascot" title="Crémi, our cream swirl mascot, smiling with a strawberry on top" />
        <Macaron color="var(--tint-rose)" className="hero-float hero-float--1" />
        <CreamPuff color="var(--tint-strawberry)" className="hero-float hero-float--2" />
        <Macaron color="var(--tint-lavender)" className="hero-float hero-float--3" />
        <Sparkle className="hero-sparkle hero-sparkle--1" />
        <Sparkle className="hero-sparkle hero-sparkle--2" />
        <Heart className="hero-sparkle hero-sparkle--3" />
      </div>
    </section>
  )
}

export default Hero
