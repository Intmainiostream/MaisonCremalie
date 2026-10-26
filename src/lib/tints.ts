// Pastel illustration color per product slug. Values match the --tint-* variables in variables.css.
const tintsBySlug: Record<string, string> = {
  'fraise-chantilly': 'strawberry',
  'rose-poudree': 'rose',
  'petale-de-lune': 'vanilla',
  'framboise-reveuse': 'raspberry',
  'lavande-douce': 'lavender',
  'litchi-soleil': 'lychee',
  'chou-nuage': 'vanilla',
  'petit-chou-rose': 'rose',
  'chou-fraise-eternelle': 'strawberry',
  'chou-vanille-etoilee': 'vanilla',
}

export function productTint(slug: string): string {
  const tint = tintsBySlug[slug]
  return tint ? `var(--tint-${tint})` : 'var(--color-pink)'
}
