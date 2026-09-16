import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/appStore'
import {
  equipmentOptions,
  experienceFrequencyOptions,
  experienceLevelOptions,
  goalOptions,
  limitationOptions,
  trainLocationOptions,
} from './onboardingOptions'
import './Profile.css'

function labelFor(options: Array<{ value: string; label: string }>, value: string | null | undefined): string {
  return options.find((option) => option.value === value)?.label ?? '—'
}

export function ProfileScreen() {
  const navigate = useNavigate()
  const profile = useAppStore((state) => state.userProfile)
  const resetOnboarding = useAppStore((state) => state.resetOnboarding)

  const handleRetakeQuiz = () => {
    resetOnboarding()
    navigate('/onboarding')
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <header className="profile-header">
          <p className="eyebrow">Профіль</p>
          <h1>Анкета ще не заповнена</h1>
          <p className="profile-hint">Пройди коротку анкету — і ми зможемо підбирати вправи й програми під тебе.</p>
        </header>
        <button className="primary-button" type="button" onClick={() => navigate('/onboarding')}>
          Пройти анкету
        </button>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <header className="profile-header">
        <p className="eyebrow">Профіль</p>
        <h1>{profile.name || 'Твій профіль'}</h1>
      </header>

      <div className="profile-grid">
        <div className="profile-card">
          <span className="profile-card-label">Досвід</span>
          <strong>{labelFor(experienceFrequencyOptions, profile.experienceFrequency)}</strong>
          <span>{labelFor(experienceLevelOptions, profile.experienceLevel)}</span>
        </div>

        <div className="profile-card">
          <span className="profile-card-label">Цілі</span>
          <strong>{profile.goals.length > 0 ? profile.goals.map((goal) => labelFor(goalOptions, goal)).join(', ') : 'не обрано'}</strong>
        </div>

        <div className="profile-card">
          <span className="profile-card-label">Графік</span>
          <strong>{profile.minutesPerDay} хв</strong>
          <span>{profile.daysPerWeek} разів на тиждень · {labelFor(trainLocationOptions, profile.trainLocation)}</span>
        </div>

        <div className="profile-card">
          <span className="profile-card-label">Обладнання</span>
          <strong>
            {profile.equipment.length > 0 ? profile.equipment.map((item) => labelFor(equipmentOptions, item)).join(', ') : 'немає'}
          </strong>
        </div>

        <div className="profile-card">
          <span className="profile-card-label">Обмеження</span>
          <strong>
            {profile.limitations.length > 0
              ? profile.limitations.map((item) => labelFor(limitationOptions, item)).join(', ')
              : 'не вказано'}
          </strong>
        </div>
      </div>

      <button className="secondary-button" type="button" onClick={handleRetakeQuiz}>
        Пройти анкету заново
      </button>
    </div>
  )
}
