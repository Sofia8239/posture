interface RepProgressProps {
  reps: number
  targetReps: number
}

export function RepProgress({ reps, targetReps }: RepProgressProps) {
  const ratio = targetReps > 0 ? Math.min(1, reps / targetReps) : 0

  return (
    <div className="rep-progress-pill">
      <span className="rep-progress-count">
        {reps}
        <span className="rep-progress-target">/{targetReps}</span>
      </span>
      <div className="rep-progress-bar">
        <div className="rep-progress-bar-fill" style={{ width: `${ratio * 100}%` }} />
      </div>
    </div>
  )
}
