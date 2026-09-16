import { Link, useLocation, useNavigate } from 'react-router-dom'
import { exerciseConfigs } from './exerciseConfigs'
import { rankExercisesByZones } from './muscleFilter'
import type { MuscleZone } from './analysis/muscleMap'
import './ExerciseSelect.css'

interface ExerciseSelectLocationState {
  zones?: MuscleZone[]
  zoneLabels?: string[]
}

export function ExerciseSelect() {
  const navigate = useNavigate()
  const location = useLocation()
  const { zones, zoneLabels } = (location.state as ExerciseSelectLocationState | null) ?? {}
  const hasFilter = !!zones && zones.length > 0

  const visibleExercises = hasFilter ? rankExercisesByZones(exerciseConfigs, zones) : exerciseConfigs

  return (
    <div className="exercise-select-page">
      <header className="exercise-select-header">
        <p className="eyebrow">Тренування</p>
        <h1>Яку вправу робимо сьогодні?</h1>
        {hasFilter ? (
          <p className="exercise-select-subtitle">
            Вправи для: {zoneLabels && zoneLabels.length > 0 ? zoneLabels.join(', ') : 'обраних зон'}.{' '}
            <button type="button" className="exercise-select-clear-filter" onClick={() => navigate('/training')}>
              Показати всі вправи
            </button>
          </p>
        ) : (
          <p className="exercise-select-subtitle">
            Обери вправу — камера підкаже техніку в реальному часі, голосом і текстом.
          </p>
        )}
      </header>

      {hasFilter && visibleExercises.length === 0 ? (
        <p className="exercise-select-empty">
          Для цих зон поки немає вправ у каталозі — ми поступово додаємо нові тренування. А поки що можеш
          {' '}
          <button type="button" className="exercise-select-clear-filter" onClick={() => navigate('/training')}>
            обрати з усього каталогу
          </button>
          .
        </p>
      ) : (
        <div className="exercise-select-grid">
          {visibleExercises.map((config) => (
            <div key={config.id} className="exercise-select-card">
              <Link to={`/training/${config.id}`} className="exercise-select-card-link">
                <span className="exercise-select-kind">{config.kind === 'static' ? 'Утримання' : 'Повторення'}</span>
                <h2>{config.name}</h2>
                <p>{config.description}</p>
              </Link>
              <div className="exercise-select-card-footer">
                <span className="exercise-select-target">
                  {config.kind === 'static' ? `${config.targetSeconds}с` : `${config.targetReps} повт.`}
                </span>
                <Link to={`/technique/${config.id}`} className="exercise-select-technique-link">
                  Переглянути 3D-техніку
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
