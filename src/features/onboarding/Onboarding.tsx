import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/appStore'
import { createEmptyProfileDraft, type UserProfile } from '../../store/userProfile'
import {
  daysPerWeekOptions,
  equipmentOptions,
  experienceFrequencyOptions,
  experienceLevelOptions,
  goalOptions,
  limitationOptions,
  minutesPerDayOptions,
  toggleInList,
  trainLocationOptions,
} from './onboardingOptions'
import './Onboarding.css'

const TOTAL_STEPS = 7

function goalLabel(value: string): string {
  return goalOptions.find((option) => option.value === value)?.label ?? value
}

export function Onboarding() {
  const navigate = useNavigate()
  const completeOnboarding = useAppStore((state) => state.completeOnboarding)
  const skipOnboarding = useAppStore((state) => state.skipOnboarding)

  const [step, setStep] = useState(1)
  const [draft, setDraft] = useState<Partial<UserProfile>>(() => createEmptyProfileDraft())

  const goNext = () => setStep((current) => Math.min(TOTAL_STEPS, current + 1))
  const goBack = () => setStep((current) => Math.max(1, current - 1))

  const handleSkip = () => {
    skipOnboarding()
    navigate('/', { replace: true })
  }

  const handleFinish = () => {
    const profile: UserProfile = {
      name: draft.name ?? '',
      age: draft.age ?? null,
      gender: draft.gender ?? null,
      experienceFrequency: draft.experienceFrequency ?? 'first-time',
      experienceLevel: draft.experienceLevel ?? 'beginner',
      goals: draft.goals ?? [],
      minutesPerDay: draft.minutesPerDay ?? 20,
      daysPerWeek: draft.daysPerWeek ?? 3,
      trainLocation: draft.trainLocation ?? 'home',
      equipment: draft.equipment ?? [],
      limitations: draft.limitations ?? [],
      completedAt: Date.now(),
    }
    completeOnboarding(profile)
    navigate('/', { replace: true })
  }

  return (
    <div className="onboarding-page">
      <div className="onboarding-progress">
        <div className="onboarding-progress-bar">
          <div className="onboarding-progress-fill" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
        </div>
        <span className="onboarding-progress-label">{step} з {TOTAL_STEPS}</span>
      </div>

      <div className="onboarding-card">
        {step === 1 && (
          <section>
            <h1>Знайомство</h1>
            <p className="onboarding-hint">Це допоможе підібрати правильний тон і акценти у вправах.</p>

            <label className="onboarding-field">
              <span>Ім’я (необов’язково)</span>
              <input
                type="text"
                value={draft.name ?? ''}
                onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                placeholder="Як до тебе звертатись?"
              />
            </label>

            <label className="onboarding-field">
              <span>Вік (необов’язково)</span>
              <input
                type="number"
                min={10}
                max={100}
                value={draft.age ?? ''}
                onChange={(event) => setDraft((current) => ({ ...current, age: event.target.value ? Number(event.target.value) : null }))}
                placeholder="Наприклад, 28"
              />
            </label>

            <div className="onboarding-field">
              <span>Стать (необов’язково)</span>
              <div className="onboarding-options">
                {([
                  ['female', 'Жіноча'],
                  ['male', 'Чоловіча'],
                  ['other', 'Інше'],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={`onboarding-option ${draft.gender === value ? 'is-selected' : ''}`}
                    onClick={() => setDraft((current) => ({ ...current, gender: value }))}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {step === 2 && (
          <section>
            <h1>Досвід</h1>
            <p className="onboarding-hint">Щоб не давати надто складні вправи новачкам і не занижувати планку досвідченим.</p>

            <div className="onboarding-field">
              <span>Як давно ти тренуєшся?</span>
              <div className="onboarding-options">
                {experienceFrequencyOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`onboarding-option ${draft.experienceFrequency === option.value ? 'is-selected' : ''}`}
                    onClick={() => setDraft((current) => ({ ...current, experienceFrequency: option.value }))}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="onboarding-field">
              <span>Твій рівень</span>
              <div className="onboarding-options">
                {experienceLevelOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`onboarding-option ${draft.experienceLevel === option.value ? 'is-selected' : ''}`}
                    onClick={() => setDraft((current) => ({ ...current, experienceLevel: option.value }))}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {step === 3 && (
          <section>
            <h1>Мета</h1>
            <p className="onboarding-hint">Можна обрати кілька.</p>

            <div className="onboarding-options onboarding-options--wrap">
              {goalOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`onboarding-option ${draft.goals?.includes(option.value) ? 'is-selected' : ''}`}
                  onClick={() => setDraft((current) => ({ ...current, goals: toggleInList(current.goals ?? [], option.value) }))}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 4 && (
          <section>
            <h1>Час і місце</h1>

            <div className="onboarding-field">
              <span>Скільки хвилин на день можеш приділити?</span>
              <div className="onboarding-options">
                {minutesPerDayOptions.map((minutes) => (
                  <button
                    key={minutes}
                    type="button"
                    className={`onboarding-option ${draft.minutesPerDay === minutes ? 'is-selected' : ''}`}
                    onClick={() => setDraft((current) => ({ ...current, minutesPerDay: minutes }))}
                  >
                    {minutes} хв
                  </button>
                ))}
              </div>
            </div>

            <div className="onboarding-field">
              <span>Скільки разів на тиждень?</span>
              <div className="onboarding-options">
                {daysPerWeekOptions.map((days) => (
                  <button
                    key={days}
                    type="button"
                    className={`onboarding-option ${draft.daysPerWeek === days ? 'is-selected' : ''}`}
                    onClick={() => setDraft((current) => ({ ...current, daysPerWeek: days }))}
                  >
                    {days}
                  </button>
                ))}
              </div>
            </div>

            <div className="onboarding-field">
              <span>Де тренуватимешся?</span>
              <div className="onboarding-options">
                {trainLocationOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`onboarding-option ${draft.trainLocation === option.value ? 'is-selected' : ''}`}
                    onClick={() => setDraft((current) => ({ ...current, trainLocation: option.value }))}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {step === 5 && (
          <section>
            <h1>Обладнання</h1>
            <p className="onboarding-hint">Можна обрати кілька.</p>

            <div className="onboarding-options onboarding-options--wrap">
              {equipmentOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`onboarding-option ${draft.equipment?.includes(option.value) ? 'is-selected' : ''}`}
                  onClick={() => setDraft((current) => ({ ...current, equipment: toggleInList(current.equipment ?? [], option.value) }))}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 6 && (
          <section>
            <h1>Обмеження й травми</h1>
            <p className="onboarding-hint">Можна обрати кілька — це допоможе виключити протипоказані вправи.</p>

            <div className="onboarding-options onboarding-options--wrap">
              {limitationOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`onboarding-option ${draft.limitations?.includes(option.value) ? 'is-selected' : ''}`}
                  onClick={() => setDraft((current) => ({ ...current, limitations: toggleInList(current.limitations ?? [], option.value) }))}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 7 && (
          <section>
            <h1>Готово{draft.name ? `, ${draft.name}` : ''}!</h1>
            <p className="onboarding-hint">Ось твій профіль:</p>

            <ul className="onboarding-summary">
              <li>Рівень: {experienceLevelOptions.find((o) => o.value === draft.experienceLevel)?.label}</li>
              <li>
                Цілі: {draft.goals && draft.goals.length > 0 ? draft.goals.map(goalLabel).join(', ') : 'не обрано'}
              </li>
              <li>{draft.minutesPerDay} хв, {draft.daysPerWeek} разів на тиждень</li>
              <li>
                Обладнання: {draft.equipment && draft.equipment.length > 0
                  ? draft.equipment.map((value) => equipmentOptions.find((o) => o.value === value)?.label).join(', ')
                  : 'не обрано'}
              </li>
            </ul>
          </section>
        )}

        <div className="onboarding-actions">
          {step > 1 && (
            <button type="button" className="secondary-button" onClick={goBack}>
              Назад
            </button>
          )}
          {step < TOTAL_STEPS && (
            <button type="button" className="primary-button" onClick={goNext}>
              Далі
            </button>
          )}
          {step === TOTAL_STEPS && (
            <button type="button" className="primary-button" onClick={handleFinish}>
              Перейти в застосунок
            </button>
          )}
        </div>

        {step < TOTAL_STEPS && (
          <button type="button" className="onboarding-skip" onClick={handleSkip}>
            Заповню пізніше
          </button>
        )}
      </div>
    </div>
  )
}
