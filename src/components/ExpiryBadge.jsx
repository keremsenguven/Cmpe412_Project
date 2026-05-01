import './ExpiryBadge.css'

export default function ExpiryBadge({ days }) {
  if (days < 0) return <span className="expiry-badge expired">Expired</span>
  if (days === 0) return <span className="expiry-badge critical">Expires Today!</span>
  if (days <= 2) return <span className="expiry-badge critical">{days} day{days !== 1 ? 's' : ''} left</span>
  if (days <= 5) return <span className="expiry-badge warning">{days} days left</span>
  return <span className="expiry-badge ok">{days} days</span>
}
