import { useState } from 'react'
import { ErrorFrequencyChart } from './errorFrequencyChart'
import type { WorkoutReport } from './workoutAnalyzer'

interface WorkoutReportScreenProps {
  report: WorkoutReport
  onRetry: () => void
  onChangeExercise: () => void
  onExit: () => void
}

const severityLabel: Record<string, string> = {
  critical: 'Критично',
  moderate: 'Помітно',
  minor: 'Дрібниця',
}

export function WorkoutReportScreen({ report, onRetry, onChangeExercise, onExit }: WorkoutReportScreenProps) {
  const [tipsOpen, setTipsOpen] = useState(false)
  const now = new Date()
  const dateLabel = now.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' })
  const timeLabel = now.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="workout-report">
      <header className="workout-report-header">
        <p className="eyebrow">Розбір тренування</p>
        <h1>{report.exerciseName}</h1>
        <p className="workout-report-meta">{dateLabel}, {timeLabel}</p>
      </header>

      <section className="workout-report-stats">
        <p className="workout-report-stats-lead">
          Ти зробила {report.totalReps} {report.totalReps === 1 ? 'повторення' : 'повторень'}
          {report.durationSeconds > 0 && ` за ${Math.floor(report.durationSeconds / 60)} хв ${report.durationSeconds % 60} сек`}.
        </p>
        <div className="workout-report-stats-grid">
          <div className="workout-report-stat">
            <strong>{report.perfectReps}</strong>
            <span>бездоганних</span>
          </div>
          <div className="workout-report-stat">
            <strong>{report.minorIssuesReps}</strong>
            <span>з дрібними неточностями</span>
          </div>
          <div className="workout-report-stat">
            <strong>{report.moderateIssuesReps}</strong>
            <span>з помітними помилками</span>
          </div>
          <div className="workout-report-stat workout-report-stat--critical">
            <strong>{report.criticalIssuesReps}</strong>
            <span>з критичною помилкою</span>
          </div>
        </div>
      </section>

      {report.errorsSummary.length > 0 && (
        <section className="workout-report-section">
          <h2>Головні помилки</h2>
          <ErrorFrequencyChart errors={report.errorsSummary} />

          <div className="workout-report-error-cards">
            {report.errorsSummary.map((error) => (
              <article key={error.issue} className={`workout-report-error-card workout-report-error-card--${error.severity}`}>
                <header>
                  <h3>{error.errorTitle}</h3>
                  <span className="workout-report-error-badge">{severityLabel[error.severity]}</span>
                </header>
                <p className="workout-report-error-frequency">
                  Було в {error.timesOccurred} {error.timesOccurred === 1 ? 'повторенні' : 'повтореннях'} з {report.totalReps} ({error.affectedRepsPercent}%)
                  {error.detection === 'partial' && ' — імовірно'}
                </p>
                <p className="workout-report-error-why"><strong>Чому важливо:</strong> {error.description}</p>
                <p className="workout-report-error-advice"><strong>Як виправити:</strong> {error.correctionAdvice}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {report.strengthAreas.length > 0 && (
        <section className="workout-report-section">
          <h2>Що вдалось добре</h2>
          <ul className="workout-report-strengths">
            {report.strengthAreas.map((strength) => (
              <li key={strength}>
                <span className="workout-report-check">✓</span>
                {strength}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="workout-report-advice">
        <strong>Порада від тренера</strong>
        <p>{report.personalizedAdvice}</p>
      </section>

      <section className="workout-report-goal">
        <p className="workout-report-goal-label">Ціль на наступне тренування</p>
        <p className="workout-report-goal-text">{report.nextGoalSuggestion}</p>
      </section>

      {report.recoveryTips.length > 0 && (
        <section className="workout-report-section">
          <button type="button" className="workout-report-tips-toggle" onClick={() => setTipsOpen((current) => !current)}>
            {tipsOpen ? 'Сховати загальні поради' : 'Загальні поради на майбутнє'}
          </button>
          {tipsOpen && (
            <ul className="workout-report-tips-list">
              {report.recoveryTips.map((tip) => (
                <li key={tip.uk}>{tip.uk}</li>
              ))}
            </ul>
          )}
        </section>
      )}

      <div className="workout-report-actions">
        <button className="primary-button" type="button" onClick={onRetry}>
          Ще одне тренування
        </button>
        <button className="secondary-button" type="button" onClick={onChangeExercise}>
          Обрати іншу вправу
        </button>
        <button className="secondary-button" type="button" onClick={onExit}>
          Зберегти й вийти
        </button>
      </div>
    </div>
  )
}
