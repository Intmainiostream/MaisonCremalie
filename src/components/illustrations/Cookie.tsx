interface CookieProps {
  color: string // icing color, e.g. "var(--color-pink)"
  className?: string
}

const DOUGH = '#f1c38b'
const DOUGH_SHADE = '#d9a062'

// Generic fallback for categories without their own illustration
function Cookie({ color, className }: CookieProps) {
  return (
    <svg className={className} viewBox="0 0 120 100" aria-hidden="true" focusable="false">
      <ellipse cx="60" cy="93" rx="38" ry="5" fill="#7a2e45" opacity="0.1" />
      <circle cx="60" cy="50" r="38" fill={DOUGH} stroke={DOUGH_SHADE} strokeWidth="3" />
      {/* Icing */}
      <path
        d="M60 20C78 20 90 32 90 48C90 56 86 58 84 64C82 70 78 74 72 72C66 70 62 78 56 76C50 74 46 70 40 70C33 70 30 62 30 54C30 34 42 20 60 20Z"
        style={{ fill: color }}
      />
      <ellipse cx="48" cy="32" rx="10" ry="3.5" fill="#fff" opacity="0.5" transform="rotate(-20 48 32)" />
      {/* Sprinkles */}
      <g strokeWidth="3.5" strokeLinecap="round">
        <path d="M52 46l5-3" stroke="#fff" />
        <path d="M68 38l3 5" stroke="#e8556d" />
        <path d="M74 54l5 1" stroke="#cdb9f0" />
        <path d="M44 58l4 3" stroke="#f7dfa3" />
        <path d="M62 60l-4 4" stroke="#fff" />
      </g>
    </svg>
  )
}

export default Cookie
