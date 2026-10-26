interface MascotProps {
  className?: string
  title?: string // leave out when the mascot is purely decorative
}

const CREAM = '#fffaf3'
const CREAM_EDGE = '#f2cdd6'
const BERRY = '#7a2e45'

// Crémi: a stacked cream swirl with a strawberry on top
function Mascot({ className, title }: MascotProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 220"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title && <title>{title}</title>}
      <ellipse cx="100" cy="210" rx="68" ry="7" fill={BERRY} opacity="0.12" />

      {/* Cream tiers, bottom to top */}
      <rect x="26" y="134" width="148" height="68" rx="34" fill={CREAM} stroke={CREAM_EDGE} strokeWidth="2.5" />
      <path d="M44 190Q100 200 156 190" fill="none" stroke={CREAM_EDGE} strokeWidth="3" strokeLinecap="round" />
      <rect x="44" y="96" width="112" height="56" rx="28" fill={CREAM} stroke={CREAM_EDGE} strokeWidth="2.5" />
      <path d="M58 142Q100 150 142 142" fill="none" stroke={CREAM_EDGE} strokeWidth="3" strokeLinecap="round" />
      <rect x="64" y="66" width="72" height="46" rx="23" fill={CREAM} stroke={CREAM_EDGE} strokeWidth="2.5" />

      {/* Strawberry sauce drizzle */}
      <path
        d="M65 86Q64 66 87 66H113Q136 66 135 86Q135 93 129 91Q124 89 122 96Q120 103 116 96Q113 90 107 90Q100 90 98 99Q96 106 92 99Q89 90 82 90Q77 90 75 94Q71 99 68 93Z"
        fill="#f59aae"
      />
      <ellipse cx="86" cy="73" rx="9" ry="3" fill="#fff" opacity="0.45" />

      {/* Strawberry */}
      <path d="M80 47Q100 33 120 47Q124 60 100 76Q76 60 80 47Z" fill="#e8556d" />
      <g fill="#ffe7a6">
        <ellipse cx="91" cy="53" rx="1.5" ry="2.2" />
        <ellipse cx="104" cy="51" rx="1.5" ry="2.2" />
        <ellipse cx="112" cy="58" rx="1.5" ry="2.2" />
        <ellipse cx="96" cy="62" rx="1.5" ry="2.2" />
        <ellipse cx="105" cy="66" rx="1.5" ry="2.2" />
      </g>
      <ellipse cx="88" cy="48" rx="4" ry="2" fill="#fff" opacity="0.5" transform="rotate(-25 88 48)" />
      <path d="M86 44Q93 35 100 42Q107 35 114 44Q107 47 100 44Q93 47 86 44Z" fill="#8fcf9f" />
      <path d="M100 42Q100 35 104 30" fill="none" stroke="#6fb585" strokeWidth="3" strokeLinecap="round" />

      {/* Face */}
      <ellipse cx="80" cy="162" rx="6" ry="8" fill={BERRY} />
      <ellipse cx="120" cy="162" rx="6" ry="8" fill={BERRY} />
      <circle cx="82" cy="159" r="2.2" fill="#fff" />
      <circle cx="122" cy="159" r="2.2" fill="#fff" />
      <ellipse cx="63" cy="176" rx="10" ry="6" fill="#f7a8bb" opacity="0.8" />
      <ellipse cx="137" cy="176" rx="10" ry="6" fill="#f7a8bb" opacity="0.8" />
      <path d="M92 174Q100 183 108 174" fill="none" stroke={BERRY} strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  )
}

export default Mascot
