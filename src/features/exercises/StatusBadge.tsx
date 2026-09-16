import type { PlankFeedback } from './types'

interface StatusBadgeProps {
  feedback: PlankFeedback
}

export function StatusBadge({ feedback }: StatusBadgeProps) {
  return (
    <div className={`status-badge status-badge--${feedback.tone}`}>
      <strong>{feedback.message}</strong>
    </div>
  )
}
