import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { exerciseConfigs } from './exerciseConfigs'
import { catalogExercises, categoryLabels, type CatalogCategory, type Difficulty } from './catalogExercises'
import { useAppStore } from '../../store/appStore'
import type { Equipment } from '../../store/userProfile'
import type { ExerciseId } from './types'
import './CatalogScreen.css'

interface UnifiedItem {
  id: string
  name: string
  shortDescription: string
  category: CatalogCategory
  difficulty: Difficulty
  equipment: Equipment[]
  hasCameraTracking: boolean
  has3d: boolean
}

const difficultyLabels: Record<Difficulty, string> = { beginner: 'Новачок', intermediate: 'Середній', advanced: 'Просунутий' }

/** exerciseConfigs (the camera-tracked catalog) has no category/difficulty of its own —
 * this is display-only metadata for browsing, kept local so it doesn't leak into the
 * rules/voice pipeline that actually reads ExerciseConfig. */
const cameraExerciseMeta: Record<ExerciseId, { category: CatalogCategory; difficulty: Difficulty }> = {
  plank: { category: 'core', difficulty: 'beginner' },
  squat: { category: 'legs-glutes', difficulty: 'beginner' },
  'plie-squat': { category: 'legs-glutes', difficulty: 'beginner' },
  'narrow-squat': { category: 'legs-glutes', difficulty: 'intermediate' },
  'forward-lunge': { category: 'legs-glutes', difficulty: 'intermediate' },
  'side-lunge': { category: 'legs-glutes', difficulty: 'intermediate' },
  'glute-bridge': { category: 'legs-glutes', difficulty: 'beginner' },
}

const allItems: UnifiedItem[] = [
  ...exerciseConfigs.map((config) => ({
    id: config.id,
    name: config.name,
    shortDescription: config.description,
    category: cameraExerciseMeta[config.id].category,
    difficulty: cameraExerciseMeta[config.id].difficulty,
    equipment: [] as Equipment[],
    hasCameraTracking: true,
    has3d: true,
  })),
  ...catalogExercises.map((exercise) => ({
    id: exercise.id,
    name: exercise.name,
    shortDescription: exercise.shortDescription,
    category: exercise.category,
    difficulty: exercise.difficulty,
    equipment: exercise.equipment,
    hasCameraTracking: false,
    has3d: true,
  })),
]

const categoryFilters: Array<{ value: CatalogCategory | 'all'; label: string }> = [
  { value: 'all', label: 'Усі' },
  ...(Object.keys(categoryLabels) as CatalogCategory[]).map((value) => ({ value, label: categoryLabels[value] })),
]

export function CatalogScreen() {
  const profile = useAppStore((state) => state.userProfile)
  const [category, setCategory] = useState<CatalogCategory | 'all'>('all')
  const [search, setSearch] = useState('')
  const [onlyMyEquipment, setOnlyMyEquipment] = useState(false)

  const visibleItems = useMemo(() => {
    return allItems.filter((item) => {
      if (category !== 'all' && item.category !== category) {
        return false
      }
      if (search.trim() && !item.name.toLowerCase().includes(search.trim().toLowerCase())) {
        return false
      }
      if (onlyMyEquipment && profile && item.equipment.length > 0) {
        const hasAll = item.equipment.every((eq) => profile.equipment.includes(eq))
        if (!hasAll) {
          return false
        }
      }
      return true
    })
  }, [category, search, onlyMyEquipment, profile])

  return (
    <div className="catalog-page">
      <header className="catalog-header">
        <p className="eyebrow">Каталог</p>
        <h1>Усі вправи в одному місці</h1>
        <p className="catalog-subtitle">{allItems.length} вправ — з камерою й без, для будь-якого рівня.</p>
      </header>

      <div className="catalog-filters">
        <input
          type="text"
          className="catalog-search"
          placeholder="Пошук за назвою"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div className="catalog-category-chips">
          {categoryFilters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              className={category === filter.value ? 'active' : ''}
              onClick={() => setCategory(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {profile && (
          <label className="catalog-equipment-toggle">
            <input type="checkbox" checked={onlyMyEquipment} onChange={(event) => setOnlyMyEquipment(event.target.checked)} />
            Тільки з моїм обладнанням
          </label>
        )}
      </div>

      {visibleItems.length === 0 ? (
        <p className="catalog-empty">Нічого не знайдено — спробуй інший фільтр.</p>
      ) : (
        <div className="catalog-grid">
          {visibleItems.map((item) => (
            <div key={item.id} className="catalog-card">
              <div className="catalog-card-badges">
                {item.hasCameraTracking && <span className="catalog-badge catalog-badge--camera">З камерою</span>}
                {item.has3d && <span className="catalog-badge catalog-badge--3d">3D</span>}
                <span className="catalog-badge">{difficultyLabels[item.difficulty]}</span>
              </div>
              <h2>{item.name}</h2>
              <p>{item.shortDescription}</p>
              <div className="catalog-card-actions">
                {item.hasCameraTracking ? (
                  <>
                    <Link to={`/training/${item.id}`} className="primary-button">
                      Почати з камерою
                    </Link>
                    <Link to={`/technique/${item.id}`} className="catalog-technique-link">
                      3D-техніка
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to={`/simple/${item.id}`} className="primary-button">
                      Почати
                    </Link>
                    <Link to={`/technique/${item.id}`} className="catalog-technique-link">
                      3D-техніка
                    </Link>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
