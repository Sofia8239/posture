import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getCatalogExercise } from './catalogExercises'
import { recordActivity } from './activityLog'
import './SimpleMode.css'

function speak(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return
  }
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'uk-UA'
  window.speechSynthesis.speak(utterance)
}

function elapsedSecondsSince(startTime: number | null, fallback: number): number {
  return startTime ? Math.round((Date.now() - startTime) / 1000) : fallback
}

type Phase = 'ready' | 'active' | 'done'
type Rating = 'easy' | 'good' | 'hard'

const ratingLabels: Record<Rating, string> = { easy: 'Легко', good: 'Добре', hard: 'Важко' }

export function SimpleMode() {
  const { exerciseId } = useParams<{ exerciseId: string }>()
  const navigate = useNavigate()
  const exercise = exerciseId ? getCatalogExercise(exerciseId) : undefined
  const isTimed = typeof exercise?.durationSeconds === 'number'

  const [phase, setPhase] = useState<Phase>('ready')
  const [secondsLeft, setSecondsLeft] = useState(exercise?.durationSeconds ?? 0)
  const [repCount, setRepCount] = useState(0)
  const [rating, setRating] = useState<Rating | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const announcedHalfwayRef = useRef(false)

  useEffect(() => {
    if (phase !== 'active' || !isTimed || secondsLeft <= 0) {
      return
    }

    const timeout = window.setTimeout(() => {
      const next = secondsLeft - 1
      const half = Math.floor((exercise?.durationSeconds ?? 0) / 2)
      if (!announcedHalfwayRef.current && next === half && next > 0) {
        announcedHalfwayRef.current = true
        speak('Половина шляху, тримайся')
      }
      setSecondsLeft(next)
      if (next <= 0) {
        speak('Час вийшов. Молодець!')
        setPhase('done')
      }
    }, 1000)

    return () => window.clearTimeout(timeout)
  }, [phase, isTimed, secondsLeft, exercise?.durationSeconds])

  if (!exercise) {
    return (
      <div className="simple-mode-page">
        <p>Вправу не знайдено.</p>
        <button className="secondary-button" type="button" onClick={() => navigate('/catalog')}>
          До каталогу
        </button>
      </div>
    )
  }

  const handleStart = () => {
    setPhase('active')
    startTimeRef.current = Date.now()
    speak(`Почали. ${exercise.name}`)
  }

  const handleFinish = () => {
    setPhase('done')
    speak('Готово. Молодець!')
  }

  const handleRate = (value: Rating) => {
    setRating(value)
    const elapsedSeconds = elapsedSecondsSince(startTimeRef.current, exercise.durationSeconds ?? 0)
    recordActivity(exercise.id, exercise.name, Math.max(elapsedSeconds, 1))
  }

  return (
    <div className="simple-mode-page">
      <header className="simple-mode-header">
        <p className="eyebrow">Без камери</p>
        <h1>{exercise.name}</h1>
      </header>

      {phase === 'ready' && (
        <section className="simple-mode-card">
          <ol>
            {exercise.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p className="simple-mode-breathing">{exercise.breathingPattern}</p>
          <Link to={`/technique/${exercise.id}`} className="simple-mode-technique-link">
            Спочатку подивитись 3D-техніку →
          </Link>
          <button className="primary-button" type="button" onClick={handleStart}>
            Почати
          </button>
        </section>
      )}

      {phase === 'active' && (
        <section className="simple-mode-card simple-mode-active">
          {isTimed ? (
            <div className="simple-mode-timer">{secondsLeft}с</div>
          ) : (
            <>
              <div className="simple-mode-timer">{repCount}</div>
              <p className="simple-mode-target">з {exercise.reps} повторень</p>
              <button className="primary-button" type="button" onClick={() => setRepCount((current) => current + 1)}>
                +1 повторення
              </button>
            </>
          )}
          <button className="secondary-button" type="button" onClick={handleFinish}>
            Завершити
          </button>
        </section>
      )}

      {phase === 'done' && (
        <section className="simple-mode-card">
          <p className="simple-mode-done-text">
            Готово!{' '}
            {isTimed
              ? `Ти протримала ${(exercise.durationSeconds ?? 0) - secondsLeft} секунд.`
              : `Ти зробила ${repCount} повторень.`}
          </p>

          {rating === null ? (
            <>
              <p className="simple-mode-rate-prompt">Як пройшло?</p>
              <div className="simple-mode-rate-options">
                {(Object.keys(ratingLabels) as Rating[]).map((value) => (
                  <button key={value} type="button" className="pill-button" onClick={() => handleRate(value)}>
                    {ratingLabels[value]}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="simple-mode-actions">
              <button className="primary-button" type="button" onClick={() => navigate('/catalog')}>
                До каталогу
              </button>
              <button className="secondary-button" type="button" onClick={() => navigate('/')}>
                На головну
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
