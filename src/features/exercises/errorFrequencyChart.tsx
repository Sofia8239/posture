import type { ErrorSummary } from './workoutAnalyzer'

interface ErrorFrequencyChartProps {
  errors: ErrorSummary[]
}

export function ErrorFrequencyChart({ errors }: ErrorFrequencyChartProps) {
  if (errors.length === 0) {
    return null
  }

  return (
    <div className="error-frequency-chart">
      {errors.map((error) => (
        <div key={error.issue} className="error-frequency-row">
          <span className="error-frequency-label">{error.errorTitle}</span>
          <div className="error-frequency-bar">
            <div
              className={`error-frequency-bar-fill error-frequency-bar-fill--${error.severity}`}
              style={{ width: `${Math.max(4, error.affectedRepsPercent)}%` }}
            />
          </div>
          <span className="error-frequency-percent">{error.affectedRepsPercent}%</span>
        </div>
      ))}
    </div>
  )
}
