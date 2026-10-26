import './Drip.css'

interface DripProps {
  color: string
  variant?: 'drip' | 'scallop' // drip hangs below a section, scallop sits on top of one
  className?: string
}

const WIDTH = 1440
const BASE = 24

// [x position, drip length]
const drips: [number, number][] = [
  [90, 38], [260, 62], [430, 30], [610, 54], [800, 34], [990, 66], [1170, 40], [1340, 52],
]

const DRIP_PATH =
  `M0,0 L0,${BASE}` +
  drips
    .map(([x, len]) => {
      const w = 30
      const y = BASE + len
      return ` L${x - w},${BASE} C${x - w * 0.4},${BASE} ${x - w * 0.7},${y} ${x},${y} C${x + w * 0.7},${y} ${x + w * 0.4},${BASE} ${x + w},${BASE}`
    })
    .join('') +
  ` L${WIDTH},${BASE} L${WIDTH},0 Z`

const STEP = 120
const SCALLOP_PATH =
  'M0,90 L0,56' +
  Array.from({ length: WIDTH / STEP }, (_, i) => {
    const x = i * STEP
    return ` C${x},16 ${x + STEP},16 ${x + STEP},56`
  }).join('') +
  ` L${WIDTH},90 Z`

function Drip({ color, variant = 'drip', className = '' }: DripProps) {
  return (
    <svg
      className={`drip drip--${variant} ${className}`}
      viewBox={`0 0 ${WIDTH} 90`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d={variant === 'drip' ? DRIP_PATH : SCALLOP_PATH} style={{ fill: color }} />
    </svg>
  )
}

export default Drip
