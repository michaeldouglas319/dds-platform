import Link from 'next/link'
import './arms-card.css'

export function ArmsCard() {
  return (
    <Link href="/arms" className="arms-card">
      <div className="arms-card__content">
        <h3 className="arms-card__title">Abundance at Arms</h3>
        <p className="arms-card__description">
          Global conflict mapping • Real-time intelligence • Source integration
        </p>
        <div className="arms-card__cta">Explore globe →</div>
      </div>
    </Link>
  )
}
