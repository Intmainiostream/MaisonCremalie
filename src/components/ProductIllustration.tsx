import Macaron from './illustrations/Macaron'
import CreamPuff from './illustrations/CreamPuff'
import Cookie from './illustrations/Cookie'

interface ProductIllustrationProps {
  categorySlug: string
  color: string
  className?: string
}

// Placeholder art for products without a photo, picked by category
function ProductIllustration({ categorySlug, color, className }: ProductIllustrationProps) {
  if (categorySlug === 'macarons') return <Macaron color={color} className={className} />
  if (categorySlug === 'cream-puffs') return <CreamPuff color={color} className={className} />
  return <Cookie color={color} className={className} />
}

export default ProductIllustration
