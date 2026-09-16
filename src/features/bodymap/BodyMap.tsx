import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Model, { type IExerciseData, type IMuscleStats, type Muscle } from 'react-body-highlighter'
import { createInitialMuscleLevels, getMuscleLabel, progressionLevels, trackedMuscleGroups } from './muscleLabels'
import { musclesToZones } from './muscleZoneMap'
import './BodyMap.css'

type BodyView = 'anterior' | 'posterior'

export function BodyMap() {
  const navigate = useNavigate()
  const [view, setView] = useState<BodyView>('anterior')
  const [selectedMuscles, setSelectedMuscles] = useState<Muscle[]>([])
  const levels = useMemo(() => createInitialMuscleLevels(), [])

  const handleFindExercises = () => {
    navigate('/training', {
      state: {
        zones: musclesToZones(selectedMuscles),
        zoneLabels: selectedMuscles.map(getMuscleLabel),
      },
    })
  }

  const toggleMuscle = (muscle: Muscle) => {
    setSelectedMuscles((current) =>
      current.includes(muscle) ? current.filter((m) => m !== muscle) : [...current, muscle],
    )
  }

  // react-body-highlighter is built for "which muscles did this exercise work" —
  // we repurpose it for selection by feeding it one synthetic "exercise" whose
  // muscles are exactly the ones the user picked. Every selected muscle then
  // gets frequency 1, so a single highlight color paints them all the same way.
  const data: IExerciseData[] = useMemo(() => [{ name: 'selected', muscles: selectedMuscles }], [selectedMuscles])

  // The installed library (v2.0.5) calls onClick with a single { muscle, data }
  // object, not two separate arguments — this reads straight from that shape.
  const handleMuscleClick = (stats: IMuscleStats) => {
    toggleMuscle(stats.muscle)
  }

  return (
    <div className="bodymap-page">
      <header className="bodymap-header">
        <div>
          <p className="eyebrow">Зони тіла</p>
          <h1>Обери, над чим працюємо</h1>
          <p className="bodymap-subtitle">
            Торкнись однієї чи кількох м’язових груп на силуеті, а тоді натисни «Підібрати вправи» — покажемо
            вправи з каталогу під ці зони.
          </p>
        </div>

        <div className="view-toggle">
          <button type="button" className={view === 'anterior' ? 'active' : ''} onClick={() => setView('anterior')}>
            Перед
          </button>
          <button type="button" className={view === 'posterior' ? 'active' : ''} onClick={() => setView('posterior')}>
            Зад
          </button>
        </div>
      </header>

      <div className="bodymap-layout">
        <div className="bodymap-silhouette-card">
          <div className="body-map-container">
            {/* The library paints each muscle via an inline `fill` style, and SVG
                fill accepts `url(#id)` gradients defined anywhere in the document
                — so this single hidden gradient colors every highlighted muscle. */}
            <svg width="0" height="0" aria-hidden="true" focusable="false">
              <defs>
                <linearGradient id="muscle-highlight-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: 'var(--color-primary)' }} />
                  <stop offset="100%" style={{ stopColor: 'var(--color-peach)' }} />
                </linearGradient>
              </defs>
            </svg>

            <Model
              data={data}
              type={view}
              style={{ width: '20rem', maxWidth: '100%', padding: '2rem' }}
              highlightedColors={['url(#muscle-highlight-gradient)']}
              bodyColor="#3a1526"
              onClick={handleMuscleClick}
            />
          </div>
        </div>

        <aside className="bodymap-panel">
          <div className="bodymap-panel-heading">
            <h2>Обрані зони</h2>
            {selectedMuscles.length > 0 && (
              <button type="button" className="bodymap-reset" onClick={() => setSelectedMuscles([])}>
                Скинути все
              </button>
            )}
          </div>

          {selectedMuscles.length === 0 ? (
            <p className="bodymap-empty">Торкнись однієї чи кількох зон на силуеті, щоб підібрати вправи під них.</p>
          ) : (
            <ul className="bodymap-selected-list">
              {selectedMuscles.map((muscle) => (
                <li key={muscle}>
                  <span>{getMuscleLabel(muscle)}</span>
                  <button type="button" onClick={() => toggleMuscle(muscle)} aria-label={`Прибрати ${getMuscleLabel(muscle)}`}>
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}

          <button
            className="primary-button bodymap-cta"
            type="button"
            disabled={selectedMuscles.length === 0}
            onClick={handleFindExercises}
          >
            Підібрати вправи
          </button>

          <div className="bodymap-levels">
            <h3>Прогрес по зонах</h3>
            <ul>
              {trackedMuscleGroups.map((muscle) => (
                <li key={muscle} className={selectedMuscles.includes(muscle) ? 'is-highlighted' : ''}>
                  <span>{getMuscleLabel(muscle)}</span>
                  <span className="bodymap-level-tag">{progressionLevels[levels[muscle]]}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
