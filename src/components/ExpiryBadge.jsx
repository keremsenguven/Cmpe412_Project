import './ExpiryBadge.css'

export default function ExpiryBadge({ days }) {
  if (days < 0) return <span className="expiry-badge expired">Süresi Doldu</span>
  if (days === 0) return <span className="expiry-badge critical">Bugün Bitiyor!</span>
  if (days <= 2) return <span className="expiry-badge critical">{days} gün kaldı</span>
  if (days <= 5) return <span className="expiry-badge warning">{days} gün kaldı</span>
  return <span className="expiry-badge ok">{days} gün</span>
}
