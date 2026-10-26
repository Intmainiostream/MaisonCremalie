interface MacaronProps {
  color: string // any CSS color, e.g. "var(--tint-rose)"
  className?: string
}

function Macaron({ color, className }: MacaronProps) {
  return (
    <svg className={className} viewBox="0 0 120 100" aria-hidden="true" focusable="false">
      <ellipse cx="60" cy="92" rx="42" ry="5" fill="#7a2e45" opacity="0.1" />
      {/* Bottom shell */}
      <rect x="14" y="56" width="92" height="28" rx="14" style={{ fill: color }} />
      <ellipse cx="60" cy="77" rx="40" ry="5" fill="#7a2e45" opacity="0.08" />
      {/* Cream filling */}
      <rect x="17" y="46" width="86" height="15" rx="7.5" fill="#fffaf2" />
      {/* Top shell */}
      <path d="M12 48C12 20 108 20 108 48Q108 52 104 52H16Q12 52 12 48Z" style={{ fill: color }} />
      {/* Ruffled feet */}
      <path
        d="M16 50H104"
        stroke="#7a2e45"
        strokeOpacity="0.15"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="0.1 6"
      />
      <ellipse cx="42" cy="33" rx="15" ry="4.5" fill="#fff" opacity="0.5" transform="rotate(-8 42 33)" />
      <ellipse cx="40" cy="64" rx="8" ry="2.5" fill="#fff" opacity="0.35" />
    </svg>
  )
}

export default Macaron
