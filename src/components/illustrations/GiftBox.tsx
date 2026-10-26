interface GiftBoxProps {
  className?: string
}

function GiftBox({ className }: GiftBoxProps) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <ellipse cx="50" cy="92" rx="34" ry="4" fill="#7a2e45" opacity="0.1" />
      {/* Box and lid */}
      <rect x="20" y="52" width="60" height="36" rx="8" fill="#f7b8cb" />
      <rect x="14" y="40" width="72" height="18" rx="7" fill="#f59aae" />
      {/* Ribbon */}
      <rect x="45" y="40" width="10" height="48" fill="#fff6e9" />
      <path d="M50 40C40 20 22 28 33 40Z" fill="#e8556d" />
      <path d="M50 40C60 20 78 28 67 40Z" fill="#e8556d" />
      <circle cx="50" cy="40" r="5.5" fill="#c73853" />
      <ellipse cx="30" cy="45" rx="8" ry="2.5" fill="#fff" opacity="0.45" />
    </svg>
  )
}

export default GiftBox
