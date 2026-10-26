interface CreamPuffProps {
  color: string // cream filling color, e.g. "var(--tint-strawberry)"
  className?: string
}

const CHOUX = '#f1c38b'
const CHOUX_SHADE = '#d9a062'
const creamDollops = [22, 37, 52, 67, 82, 97]

function CreamPuff({ color, className }: CreamPuffProps) {
  return (
    <svg className={className} viewBox="0 0 120 100" aria-hidden="true" focusable="false">
      <ellipse cx="60" cy="93" rx="44" ry="5" fill="#7a2e45" opacity="0.1" />
      {/* Bottom choux */}
      <path d="M16 60Q16 89 60 89Q104 89 104 60Z" fill={CHOUX} />
      <path d="M26 76Q60 92 94 76" fill="none" stroke={CHOUX_SHADE} strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      {/* Cream */}
      {creamDollops.map((x) => (
        <circle key={x} cx={x} cy="60" r="10" style={{ fill: color }} />
      ))}
      {/* Top cap with craquelin cracks */}
      <path d="M18 54C18 14 102 14 102 54Q102 58 98 58H22Q18 58 18 54Z" fill={CHOUX} />
      <path
        d="M32 44q7-6 14 0M54 34q7-6 14 0M72 46q7-6 14 0M44 52q6-5 12 0M62 22q5-4 10 0M38 30q5-4 10 0"
        fill="none"
        stroke={CHOUX_SHADE}
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <ellipse cx="44" cy="30" rx="12" ry="4" fill="#fff" opacity="0.4" transform="rotate(-14 44 30)" />
      {/* Powdered sugar */}
      <g fill="#fff" opacity="0.9">
        <circle cx="56" cy="26" r="1.6" />
        <circle cx="70" cy="30" r="1.3" />
        <circle cx="48" cy="40" r="1.4" />
        <circle cx="82" cy="38" r="1.6" />
        <circle cx="64" cy="42" r="1.2" />
      </g>
    </svg>
  )
}

export default CreamPuff
