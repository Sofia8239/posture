import { useMemo } from 'react'
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { computeProgressStats } from './progressStats'
import './Progress.css'

const CHART_COLOR = '#e63b8f'
const CHART_COLOR_MUTED = 'rgba(230, 59, 143, 0.35)'
const GRID_COLOR = 'rgba(248, 236, 239, 0.1)'
const TEXT_MUTED = '#8a6a73'

function WeeklyTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { dayLabel: string; minutes: number; workoutsCount: number } }> }) {
  if (!active || !payload || payload.length === 0) {
    return null
  }
  const day = payload[0].payload
  return (
    <div className="progress-tooltip">
      <strong>{day.minutes} хв</strong>
      <span>{day.workoutsCount} {day.workoutsCount === 1 ? 'тренування' : 'тренувань'}</span>
    </div>
  )
}

export function ProgressScreen() {
  const stats = useMemo(() => computeProgressStats(), [])
  const hasAnyActivity = stats.totalWorkouts > 0

  return (
    <div className="progress-page">
      <header className="progress-header">
        <p className="eyebrow">Прогрес</p>
        <h1>Твій шлях у Posture</h1>
      </header>

      <section className="progress-streak-row">
        <div className="progress-streak-card">
          <span className="progress-streak-icon" aria-hidden="true">🔥</span>
          <div>
            <strong>{stats.currentStreak} {stats.currentStreak === 1 ? 'день' : 'днів'}</strong>
            <span>поточна серія</span>
          </div>
        </div>
        <div className="progress-streak-card">
          <span className="progress-streak-icon" aria-hidden="true">🏆</span>
          <div>
            <strong>{stats.longestStreak} {stats.longestStreak === 1 ? 'день' : 'днів'}</strong>
            <span>найкраща серія</span>
          </div>
        </div>
      </section>

      {!hasAnyActivity ? (
        <section className="progress-empty">
          <p>Ще немає жодного завершеного тренування — почни, і тут з’явиться твоя статистика.</p>
        </section>
      ) : (
        <>
          <section className="progress-section">
            <h2>Останні 7 днів</h2>
            <div className="progress-chart-card">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={stats.last7Days} margin={{ top: 16, right: 8, left: 8, bottom: 0 }} barCategoryGap="30%">
                  <XAxis
                    dataKey="dayLabel"
                    axisLine={{ stroke: GRID_COLOR }}
                    tickLine={false}
                    tick={{ fill: TEXT_MUTED, fontSize: 12 }}
                  />
                  <Tooltip content={<WeeklyTooltip />} cursor={{ fill: 'rgba(248, 236, 239, 0.04)' }} />
                  <Bar dataKey="minutes" radius={[4, 4, 0, 0]} maxBarSize={24}>
                    {stats.last7Days.map((day) => (
                      <Cell key={day.date} fill={day.isToday ? CHART_COLOR : CHART_COLOR_MUTED} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="progress-stats-grid">
            <div className="progress-stat-card">
              <strong>{stats.totalWorkouts}</strong>
              <span>усього тренувань</span>
            </div>
            <div className="progress-stat-card">
              <strong>{stats.totalMinutes}</strong>
              <span>хвилин загалом</span>
            </div>
            <div className="progress-stat-card">
              <strong>{stats.favoriteExerciseName ?? '—'}</strong>
              <span>улюблена вправа</span>
            </div>
          </section>

          {stats.muscleGroupDistribution.length > 0 && (
            <section className="progress-section">
              <h2>М’язові групи, які тренуєш найчастіше</h2>
              <div className="progress-chart-card">
                <ResponsiveContainer width="100%" height={Math.max(120, stats.muscleGroupDistribution.length * 34)}>
                  <BarChart
                    data={stats.muscleGroupDistribution}
                    layout="vertical"
                    margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="label"
                      width={150}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: TEXT_MUTED, fontSize: 12 }}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(248, 236, 239, 0.04)' }}
                      content={({ active, payload }) => {
                        if (!active || !payload || payload.length === 0) return null
                        const item = payload[0].payload as { label: string; count: number }
                        return (
                          <div className="progress-tooltip">
                            <strong>{item.label}</strong>
                            <span>{item.count} {item.count === 1 ? 'тренування' : 'тренувань'}</span>
                          </div>
                        )
                      }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={18}>
                      {stats.muscleGroupDistribution.map((entry) => (
                        <Cell key={entry.zone} fill={CHART_COLOR} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}
        </>
      )}

      <section className="progress-section">
        <h2>Досягнення</h2>
        <div className="progress-achievements-grid">
          {stats.achievements.map((achievement) => (
            <div key={achievement.id} className={`progress-achievement ${achievement.unlocked ? 'is-unlocked' : 'is-locked'}`}>
              <span className="progress-achievement-icon" aria-hidden="true">{achievement.icon}</span>
              <strong>{achievement.title}</strong>
              <span>{achievement.description}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
