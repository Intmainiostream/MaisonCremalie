import type { CSSProperties } from 'react'
import Drip from '../Drip'
import Reveal from '../Reveal'
import Macaron from '../illustrations/Macaron'
import Mascot from '../illustrations/Mascot'
import GiftBox from '../illustrations/GiftBox'
import Sparkle from '../illustrations/Sparkle'
import './Features.css'

const features = [
  {
    title: 'Baked fresh daily',
    text: 'Every shell and choux is baked at sunrise, so your sweets taste like they just left the oven.',
    tint: 'var(--tint-vanilla)',
    icon: <Macaron color="var(--tint-strawberry)" />,
  },
  {
    title: 'Made with real cream',
    text: 'No shortcuts. Only real whipped cream, real fruit and a whole lot of patience.',
    tint: 'var(--tint-rose)',
    icon: <Mascot />,
  },
  {
    title: 'Gift-ready boxes',
    text: 'Tucked into pastel boxes with a ribbon on top, ready to make someone’s whole day.',
    tint: 'var(--tint-lavender)',
    icon: <GiftBox />,
  },
]

function Features() {
  return (
    <section className="features" aria-labelledby="features-title">
      <Drip variant="scallop" color="var(--color-pink-light)" />
      <div className="features-inner">
        <div className="container">
          <Reveal className="section-head">
            <p className="eyebrow">
              <Sparkle /> Our promise
            </p>
            <h2 id="features-title" className="display-title">
              Why you'll love us
            </h2>
          </Reveal>

          <ul className="features-grid">
            {features.map((feature, index) => (
              <li key={feature.title}>
                <Reveal delay={index * 120}>
                  <div className="feature-card" style={{ '--feature-tint': feature.tint } as CSSProperties}>
                    <div className="feature-icon">{feature.icon}</div>
                    <h3>{feature.title}</h3>
                    <p>{feature.text}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Drip color="var(--color-pink-light)" />
    </section>
  )
}

export default Features
