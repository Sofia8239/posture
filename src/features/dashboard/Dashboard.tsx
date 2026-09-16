import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createInitialMuscleLevels, getMuscleLabel, progressionLevels, trackedMuscleGroups } from '../bodymap/muscleLabels'
import { getRecentWorkoutReports, type StoredWorkoutReport } from '../exercises/workoutHistory'
import { computeProgressStats } from '../exercises/progressStats'
import { useAppStore } from '../../store/appStore'
import './Dashboard.css'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Доброго ранку'
  if (hour < 18) return 'Доброго дня'
  return 'Добрий вечір'
}

export function Dashboard() {
  const navigate = useNavigate()
  const isOnboardingComplete = useAppStore((state) => state.isOnboardingComplete)
  const profile = useAppStore((state) => state.userProfile)
  const levels = useMemo(() => createInitialMuscleLevels(), [])
  const [recentWorkouts] = useState<StoredWorkoutReport[]>(() => getRecentWorkoutReports(3))
  const streakDays = useMemo(() => computeProgressStats().currentStreak, [])

  useEffect(() => {
    if (!isOnboardingComplete) {
      navigate('/onboarding', { replace: true })
    }
  }, [isOnboardingComplete, navigate])

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">Posture</p>
          <h1>{getGreeting()}{profile?.name ? `, ${profile.name}` : ''}!</h1>
          <p className="dashboard-hero-text">
            {profile
              ? `Твоя ціль на сьогодні: ${profile.minutesPerDay} хвилин. Обери зону тіла або вправу — і почнемо.`
              : 'Обери зону тіла, отримай персональну добірку вправ і тренуйся з живою корекцією через камеру — без болю в спині й зайвого ризику.'}
          </p>
          <div className="dashboard-hero-actions">
            <Link className="primary-button" to="/body-map">
              Обрати зону і почати
            </Link>
            <Link className="secondary-button" to="/training">
              Тренування з камерою
            </Link>
            <Link className="secondary-button" to="/catalog">
              Каталог вправ
            </Link>
          </div>
        </div>

        <Link className="dashboard-streak-card" to="/progress">
          <span className="dashboard-streak-label">Серія тренувань</span>
          <strong className="dashboard-streak-value">{streakDays} {streakDays === 1 ? 'день' : 'днів'}</strong>
          <span className="dashboard-streak-hint">
            {streakDays === 0 ? 'Почни серію вже сьогодні' : 'Так тримати!'}
          </span>
        </Link>
      </section>

      <section className="dashboard-trial-banner">
        <div>
          <strong>Пробний тиждень активний</strong>
          <p>Повний доступ до камери, прогресії та каталогу вправ — без обмежень.</p>
        </div>
        <Link className="secondary-button" to="/body-map">
          Переглянути можливості
        </Link>
      </section>

      {recentWorkouts.length > 0 && (
        <section className="dashboard-recent">
          <div className="dashboard-section-heading">
            <h2>Останні тренування</h2>
          </div>

          <div className="dashboard-recent-list">
            {recentWorkouts.map(({ id, timestamp, report }) => (
              <div key={id} className="dashboard-recent-card">
                <div>
                  <strong>{report.exerciseName}</strong>
                  <span className="dashboard-recent-date">
                    {new Date(timestamp).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <span className="dashboard-recent-stat">
                  {report.perfectReps} з {report.totalReps} бездоганних
                  {report.errorsSummary[0] ? ` · найчастіше: ${report.errorsSummary[0].errorTitle.toLowerCase()}` : ''}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="dashboard-zones">
        <div className="dashboard-section-heading">
          <h2>Прогрес по зонах</h2>
          <Link to="/body-map">Відкрити карту тіла →</Link>
        </div>

        <div className="dashboard-zones-grid">
          {trackedMuscleGroups.map((muscle) => (
            <Link key={muscle} to="/body-map" className="dashboard-zone-card">
              <span className="dashboard-zone-name">{getMuscleLabel(muscle)}</span>
              <span className="dashboard-zone-level">{progressionLevels[levels[muscle]]}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
