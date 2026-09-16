import type { CalibrationStep } from './analysis/stanceCalibration'

interface CalibrationChecklistProps {
  steps: CalibrationStep[]
}

export function CalibrationChecklist({ steps }: CalibrationChecklistProps) {
  const passedCount = steps.filter((step) => step.passed).length
  const ratio = steps.length > 0 ? passedCount / steps.length : 0
  const currentHint = steps.find((step) => !step.passed)?.hint

  return (
    <div className="calibration-checklist">
      <strong>Налаштовую стійку…</strong>
      {currentHint && <p className="calibration-checklist-hint">{currentHint}</p>}

      <ul>
        {steps.map((step) => (
          <li key={step.id} className={step.passed ? 'is-passed' : ''}>
            <span className="calibration-checklist-mark">{step.passed ? '✓' : '⏳'}</span>
            {step.label}
          </li>
        ))}
      </ul>

      <div className="calibration-checklist-progress">
        <div className="calibration-checklist-progress-fill" style={{ width: `${ratio * 100}%` }} />
      </div>
    </div>
  )
}
