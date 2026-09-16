import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../../App.css'
import { useCalibration } from './hooks/useCalibration'
import { usePlankAnalyzer } from './hooks/usePlankAnalyzer'
import { useDynamicExerciseAnalyzer } from './hooks/useDynamicExerciseAnalyzer'
import { useStanceCalibration } from './hooks/useStanceCalibration'
import { usePoseDetection } from './hooks/usePoseDetection'
import { useSoundEffects } from './hooks/useSoundEffects'
import { useVoiceCoach, defaultVoiceSettings, type VoiceSettings } from './hooks/useVoiceCoach'
import { useHapticFeedback } from './hooks/useHapticFeedback'
import { CameraFeed } from './CameraFeed'
import { CalibrationChecklist } from './CalibrationChecklist'
import { StatusBadge } from './StatusBadge'
import { Timer } from './Timer'
import { RepProgress } from './RepProgress'
import { getExerciseConfig } from './exerciseConfigs'
import { issueToMuscleZones } from './analysis/muscleMap'
import { WorkoutReportScreen } from './WorkoutReportScreen'
import { analyzeWorkout, type WorkoutReport } from './workoutAnalyzer'
import { saveWorkoutReport } from './workoutHistory'
import { recordActivity } from './activityLog'
import type { VoiceAction } from './voice/decisionRules'
import type { CoachState, CorrectionIssue, VoiceIssue } from './voice/sessionContext'
import type { ExerciseId } from './types'

const durationPresets = [30, 60, 120]

/** Short, human summary per issue for the post-session note — dynamic exercises know their
 * issue directly (no message string-matching needed, unlike the plank's legacy path below). */
const issueSummaryLabels: Partial<Record<CorrectionIssue, string>> = {
  shallowDepth: 'глибину присіду',
  kneesCollapse: 'коліна, які завалюються всередину',
  roundedBack: 'округлення спини',
  leaningBack: 'відкидання назад',
  heelsUp: 'п’яти, що відриваються від підлоги',
  stanceNarrow: 'ширину постановки ніг',
  stanceWide: 'ширину постановки ніг',
  asymmetric: 'симетрію між ногами',
  tooFast: 'темп руху',
  forwardLean: 'нахил корпуса вперед',
  buttWink: 'підкручування таза внизу',
  plieNarrowStance: 'ширину постановки для пліє',
  plieToesNotTurned: 'розворот носків',
  plieLeaningForward: 'вертикальність корпусу',
  kneeOverToe: 'переднє коліно за носком',
  backKneeTooHigh: 'глибину випаду',
  shortStep: 'довжину кроку',
  lungeLeaningForward: 'вертикальність корпусу',
  notAlternating: 'чергування ніг',
  sideLungeStraightLeg: 'пряму опорну ногу',
  sideLungeShallow: 'глибину бічного випаду',
  gluteBridgeInsufficientHeight: 'висоту підйому таза',
  gluteBridgeHyperextension: 'прогин у попереку',
  gluteBridgeAsymmetricHips: 'симетрію стегон',
}

function readSettings(): VoiceSettings {
  if (typeof window === 'undefined') {
    return defaultVoiceSettings
  }

  try {
    const saved = window.localStorage.getItem('plankVoiceSettings')
    if (!saved) {
      return defaultVoiceSettings
    }

    return {
      ...defaultVoiceSettings,
      ...JSON.parse(saved),
    }
  } catch {
    return defaultVoiceSettings
  }
}

interface ExerciseTrainerProps {
  exerciseId: ExerciseId
}

export function ExerciseTrainer({ exerciseId }: ExerciseTrainerProps) {
  const navigate = useNavigate()
  const config = useMemo(() => getExerciseConfig(exerciseId), [exerciseId])
  const isDynamic = config.kind === 'dynamic'
  const targetReps = config.targetReps ?? 20

  const { videoRef, canvasRef, isReady, points, errorMessage, startCamera, stopCamera } = usePoseDetection()
  const { isCalibrating, baseline, startCalibration, finishCalibration } = useCalibration(points)

  // Both analyzers are always mounted (Rules of Hooks) — only the one matching this
  // exercise's kind ever gets `setIsActive(true)`, so the other stays fully dormant.
  const staticAnalyzer = usePlankAnalyzer(points, baseline)
  const dynamicAnalyzer = useDynamicExerciseAnalyzer(points, exerciseId)

  const [phase, setPhase] = useState<'intro' | 'calibration' | 'training' | 'result'>('intro')
  // Dynamic exercises get an active stance checklist instead of a blind countdown —
  // only ever "active" while we're actually in the calibration phase for one of them.
  const stanceCalibration = useStanceCalibration(points, exerciseId, isDynamic && phase === 'calibration')
  const wasCalibrationReadyRef = useRef(false)
  const [countdown, setCountdown] = useState(3)
  const [isPaused, setIsPaused] = useState(false)
  const [targetSeconds, setTargetSeconds] = useState(config.targetSeconds ?? 60)
  const [customDuration, setCustomDuration] = useState('')
  const [settings, setSettings] = useState<VoiceSettings>(readSettings)
  const [showSettings, setShowSettings] = useState(false)
  const previousVoiceIssueRef = useRef<VoiceIssue | null>(null)
  const previousRepsRef = useRef(0)
  const previousDynamicIssueRef = useRef<VoiceIssue | null>(null)
  const [workoutReport, setWorkoutReport] = useState<WorkoutReport | null>(null)
  const workoutReportComputedRef = useRef(false)

  const { playSound } = useSoundEffects(settings)
  const { vibrate } = useHapticFeedback(settings)

  const handleCoachAction = useCallback(
    (action: VoiceAction) => {
      if (action.sound) {
        window.setTimeout(() => {
          playSound(action.sound!)
        }, 300)
      }

      if (action.vibratePattern) {
        window.setTimeout(() => {
          vibrate(action.vibratePattern!)
        }, 300)
      }
    },
    [playSound, vibrate],
  )

  const { speak, cancelSpeech, updateCoachState } = useVoiceCoach(settings, handleCoachAction)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('plankVoiceSettings', JSON.stringify(settings))
    }
  }, [settings])

  const stopActiveAnalyzer = useCallback(() => {
    staticAnalyzer.setIsActive(false)
    dynamicAnalyzer.setIsActive(false)
  }, [dynamicAnalyzer, staticAnalyzer])

  const resetStats = useCallback(() => {
    staticAnalyzer.resetStats()
    dynamicAnalyzer.resetStats()
  }, [dynamicAnalyzer, staticAnalyzer])

  const finishSession = useCallback(() => {
    stopCamera()
    setPhase('result')
    stopActiveAnalyzer()
    setIsPaused(false)
  }, [stopActiveAnalyzer, stopCamera])

  // Static exercises (plank): the original blind 3-2-1 countdown, unchanged.
  useEffect(() => {
    if (phase !== 'calibration' || isDynamic) {
      return
    }

    if (countdown === 0) {
      finishCalibration()
      setPhase('training')
      staticAnalyzer.setIsActive(true)
      speak('Почали! Тримай правильну форму', { force: true, minGapMs: 1000 })
      playSound('chime')
      return
    }

    const timeout = window.setTimeout(() => {
      setCountdown((current) => current - 1)
    }, 1000)

    return () => window.clearTimeout(timeout)
  }, [countdown, finishCalibration, isDynamic, phase, playSound, speak, staticAnalyzer])

  // Dynamic exercises: an active checklist replaces the blind countdown — the coach
  // keeps naming what's still wrong with the stance, and only starts once every check
  // has held true for a couple of seconds in a row.
  useEffect(() => {
    if (phase !== 'calibration' || !isDynamic) {
      return
    }

    if (stanceCalibration.isReady) {
      if (!wasCalibrationReadyRef.current) {
        wasCalibrationReadyRef.current = true
        finishCalibration()
        setPhase('training')
        dynamicAnalyzer.setIsActive(true)
        speak('Гарна стійка. Починаємо!', { force: true, minGapMs: 1000 })
        playSound('chime')
      }
      return
    }

    wasCalibrationReadyRef.current = false

    if (stanceCalibration.firstFailingStep) {
      speak(stanceCalibration.firstFailingStep.hint, { minGapMs: 5000 })
    }
  }, [dynamicAnalyzer, finishCalibration, isDynamic, phase, playSound, speak, stanceCalibration.firstFailingStep, stanceCalibration.isReady])

  const currentTarget = useMemo(() => {
    const parsedCustom = Number(customDuration)
    if (parsedCustom > 0) {
      return parsedCustom
    }

    return targetSeconds
  }, [customDuration, targetSeconds])

  useEffect(() => {
    if (phase !== 'training') {
      return
    }

    if (isDynamic) {
      if (dynamicAnalyzer.reps >= targetReps) {
        finishSession()
      }
      return
    }

    if (staticAnalyzer.timerSeconds >= currentTarget) {
      finishSession()
    }
  }, [currentTarget, dynamicAnalyzer.reps, finishSession, isDynamic, phase, staticAnalyzer.timerSeconds, targetReps])

  const deriveVoiceIssue = useCallback((message: string): VoiceIssue | null => {
    if (!message) {
      return null
    }

    if (message.includes('таз') && message.includes('опусти')) {
      return 'hips_raised'
    }

    if (message.includes('таз') || message.includes('попереку')) {
      return 'hips_sag'
    }

    if (message.includes('лікті')) {
      return 'elbows_wide'
    }

    if (message.includes('голова') || message.includes('шия')) {
      return 'neck_tilted'
    }

    if (message.includes('плечах')) {
      return 'shoulders_dropped'
    }

    return null
  }, [])

  useEffect(() => {
    if (phase !== 'training') {
      return
    }

    if (isDynamic) {
      const repsNow = dynamicAnalyzer.reps
      const repJustCompleted = repsNow > previousRepsRef.current
      previousRepsRef.current = repsNow

      const currentIssue = dynamicAnalyzer.feedback.issue
      const justRecovered = previousDynamicIssueRef.current !== null && currentIssue === null
      previousDynamicIssueRef.current = currentIssue

      const coachState: CoachState = {
        issue: currentIssue,
        severity: dynamicAnalyzer.feedback.severity,
        isGood: dynamicAnalyzer.feedback.tone === 'good',
        elapsedSec: 0,
        targetSeconds: 0,
        phase,
        justRecovered,
        exerciseKind: 'dynamic',
        exerciseId,
        reps: repsNow,
        targetReps,
        repJustCompleted,
        repWasGood: dynamicAnalyzer.feedback.tone === 'good',
      }

      updateCoachState(coachState)
      return
    }

    const issue = deriveVoiceIssue(staticAnalyzer.feedback.message)
    const justRecovered = previousVoiceIssueRef.current !== null && issue === null && staticAnalyzer.feedback.tone !== 'warning'

    const coachState: CoachState = {
      issue,
      severity: staticAnalyzer.feedback.severity,
      isGood: staticAnalyzer.feedback.tone === 'good',
      elapsedSec: staticAnalyzer.timerSeconds,
      targetSeconds: currentTarget,
      phase,
      justRecovered,
      exerciseKind: 'static',
    }

    updateCoachState(coachState)
    previousVoiceIssueRef.current = issue
  }, [currentTarget, deriveVoiceIssue, dynamicAnalyzer.feedback, dynamicAnalyzer.reps, exerciseId, isDynamic, phase, staticAnalyzer.feedback, staticAnalyzer.timerSeconds, targetReps, updateCoachState])

  useEffect(() => {
    if (phase !== 'result') {
      return
    }

    const completedSomething = isDynamic ? dynamicAnalyzer.reps > 0 : staticAnalyzer.timerSeconds > 0
    if (!completedSomething) {
      return
    }

    speak('Молодець! Ти впоралась', { force: true, minGapMs: 5000 })
    playSound('success')
    vibrate(500)

    // Dynamic sessions log activity alongside the richer WorkoutReport below (which has
    // its own, more accurate duration from rep timestamps) — only log static here.
    if (!isDynamic) {
      recordActivity(exerciseId, config.name, staticAnalyzer.timerSeconds)
    }
    // Only fire once per session — result phase doesn't change reps/timerSeconds further.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // Dynamic exercises get the full workout report instead of the plain result card.
  // Computed once per session (guarded, not on every render) the moment we land on 'result'.
  useEffect(() => {
    if (phase !== 'result' || !isDynamic) {
      workoutReportComputedRef.current = false
      return
    }

    if (workoutReportComputedRef.current) {
      return
    }

    workoutReportComputedRef.current = true
    const report = analyzeWorkout(dynamicAnalyzer.getSessionReps(), exerciseId, config.name)
    setWorkoutReport(report)
    saveWorkoutReport(report)
    recordActivity(exerciseId, config.name, report.durationSeconds)
  }, [config.name, dynamicAnalyzer, exerciseId, isDynamic, phase])

  const feedback = isDynamic ? dynamicAnalyzer.feedback : staticAnalyzer.feedback
  const goodUnits = isDynamic ? dynamicAnalyzer.goodReps : staticAnalyzer.goodSeconds
  const badUnits = isDynamic ? dynamicAnalyzer.badReps : staticAnalyzer.badSeconds
  const totalUnits = isDynamic ? dynamicAnalyzer.reps : staticAnalyzer.timerSeconds

  // Dynamic exercises get the live muscle overlay instead of raw skeleton dots — the
  // problem zone lights up red the moment the correction issue names one.
  const problemMuscles = useMemo(() => {
    if (!isDynamic || !dynamicAnalyzer.feedback.issue) {
      return []
    }
    return issueToMuscleZones[dynamicAnalyzer.feedback.issue] ?? []
  }, [dynamicAnalyzer.feedback.issue, isDynamic])

  const stageLabel = useMemo(() => {
    if (phase === 'intro') {
      return config.name
    }

    if (phase === 'calibration') {
      return 'Калібрування'
    }

    return 'Тренування'
  }, [config.name, phase])

  const correctRatio = useMemo(() => {
    if (totalUnits <= 0) {
      return 0
    }

    return Math.round((goodUnits / totalUnits) * 100)
  }, [goodUnits, totalUnits])

  const incorrectRatio = 100 - correctRatio

  const stageTone = feedback.tone === 'warning' ? 'warning' : feedback.tone === 'soft' ? 'soft' : 'good'

  const coachSummary = useMemo(() => {
    if (isDynamic) {
      if (dynamicAnalyzer.reps <= 0) {
        return 'Тренер ще не розпочав сесію, але ти вже готова.'
      }

      if (correctRatio >= 85) {
        return `Ти зробила ${dynamicAnalyzer.reps} повторень. З них ${dynamicAnalyzer.goodReps} у чудовій формі. Це дуже добре — так тримати.`
      }

      const issueLabel = dynamicAnalyzer.feedback.issue ? issueSummaryLabels[dynamicAnalyzer.feedback.issue] : null
      if (issueLabel) {
        return `Ти зробила ${dynamicAnalyzer.reps} повторень. Головне, над чим варто попрацювати — ${issueLabel}. Наступного разу зверни на це увагу з перших повторень.`
      }

      return `Ти зробила ${dynamicAnalyzer.reps} повторень. З них ${dynamicAnalyzer.goodReps} у чудовій формі. Рухайся спокійно й контролюй техніку.`
    }

    if (staticAnalyzer.timerSeconds <= 0) {
      return 'Тренер ще не розпочав сесію, але ти вже готова.'
    }

    if (correctRatio >= 85) {
      return `Ти протримала ${staticAnalyzer.timerSeconds} секунд. З них ${staticAnalyzer.goodSeconds} у чудовій формі. Це дуже добре — тримай спину рівно й дихай.`
    }

    if (deriveVoiceIssue(staticAnalyzer.feedback.message) === 'hips_sag') {
      return `Ти протримала ${staticAnalyzer.timerSeconds} секунд. Головне, над чим працювати — таз. Уяви пружинку між лопатками і тримай його піднятим.`
    }

    if (deriveVoiceIssue(staticAnalyzer.feedback.message) === 'neck_tilted') {
      return `Ти протримала ${staticAnalyzer.timerSeconds} секунд. Шия працює краще, коли вона продовжує хребет. Дивись у підлогу перед собою.`
    }

    return `Ти протримала ${staticAnalyzer.timerSeconds} секунд. З них ${staticAnalyzer.goodSeconds} у чудовій формі. Рухайся спокійно й не поспішай.`
  }, [correctRatio, deriveVoiceIssue, dynamicAnalyzer.feedback.issue, dynamicAnalyzer.goodReps, dynamicAnalyzer.reps, isDynamic, staticAnalyzer.feedback.message, staticAnalyzer.goodSeconds, staticAnalyzer.timerSeconds])

  const startSession = async () => {
    resetStats()
    previousVoiceIssueRef.current = null
    previousRepsRef.current = 0
    previousDynamicIssueRef.current = null
    wasCalibrationReadyRef.current = false
    workoutReportComputedRef.current = false
    setWorkoutReport(null)
    stanceCalibration.reset()
    setCountdown(3)
    startCalibration()
    setPhase('calibration')
    speak(config.onboardingVoiceLine, { force: true, minGapMs: 1000 })

    await startCamera()
  }

  const pauseSession = () => {
    const nextPaused = !isPaused
    setIsPaused(nextPaused)

    if (isDynamic) {
      dynamicAnalyzer.setIsActive(!nextPaused)
    } else {
      staticAnalyzer.setIsActive(!nextPaused)
    }

    if (nextPaused) {
      speak('Пауза', { force: true, minGapMs: 500 })
    } else {
      speak('Продовжуємо', { force: true, minGapMs: 500 })
    }
  }

  const stopSession = () => {
    cancelSpeech()
    stopCamera()
    setPhase('intro')
    stopActiveAnalyzer()
    setIsPaused(false)
    resetStats()
    speak('Сесія зупинена', { force: true, minGapMs: 500 })
  }

  const bigDisplayValue = phase === 'training' ? totalUnits : countdown
  const bigDisplaySuffix = phase === 'training' && !isDynamic ? 's' : phase === 'calibration' ? 's' : ''

  const resultHeading = isDynamic
    ? `Ти зробила ${config.name.toLowerCase()} — ${dynamicAnalyzer.reps} повторень.`
    : `Ти протримала ${config.name.toLowerCase()} ${staticAnalyzer.timerSeconds} секунд.`

  const goodUnitLabel = isDynamic ? `${goodUnits}` : `${goodUnits}s`
  const badUnitLabel = isDynamic ? `${badUnits}` : `${badUnits}s`

  if (workoutReport) {
    return (
      <WorkoutReportScreen
        report={workoutReport}
        onRetry={() => setPhase('intro')}
        onChangeExercise={() => navigate('/training')}
        onExit={() => navigate('/')}
      />
    )
  }

  return (
    <div className="trainer-shell">
      <header className="trainer-header">
        <div>
          <p className="eyebrow">Posture</p>
          <h1>{stageLabel}</h1>
        </div>
        {isDynamic ? <RepProgress reps={totalUnits} targetReps={targetReps} /> : <Timer seconds={totalUnits} targetSeconds={currentTarget} />}
      </header>

      {phase === 'intro' && (
        <section className="intro-card">
          <h2>{config.name}</h2>
          <Link to={`/technique/${exerciseId}`} className="intro-technique-link">
            Спочатку подивитись 3D-техніку →
          </Link>
          <ul>
            {config.instructions.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>

          {isDynamic ? (
            <p className="target-note">Ціль: {targetReps} повторень у правильній формі.</p>
          ) : (
            <div className="duration-selector">
              <span>Тривалість:</span>
              <div className="duration-buttons">
                {durationPresets.map((preset) => (
                  <button
                    key={preset}
                    className={`pill-button ${targetSeconds === preset ? 'active' : ''}`}
                    type="button"
                    onClick={() => {
                      setTargetSeconds(preset)
                      setCustomDuration('')
                    }}
                  >
                    {preset / 60 === 1 ? '1 хв' : preset / 60 === 2 ? '2 хв' : `${preset}с`}
                  </button>
                ))}
              </div>
              <label className="custom-duration">
                <span>Довільний час</span>
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={customDuration}
                  placeholder="Наприклад 45"
                  onChange={(event) => setCustomDuration(event.target.value)}
                />
              </label>
            </div>
          )}

          <div className="settings-card">
            <button className="secondary-button" type="button" onClick={() => setShowSettings((current) => !current)}>
              {showSettings ? 'Сховати налаштування' : 'Налаштування голосу'}
            </button>
            {showSettings && (
              <div className="settings-panel">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.voiceEnabled}
                    onChange={() => setSettings((current) => ({ ...current, voiceEnabled: !current.voiceEnabled }))}
                  />
                  Голос
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={settings.soundsEnabled}
                    onChange={() => setSettings((current) => ({ ...current, soundsEnabled: !current.soundsEnabled }))}
                  />
                  Звуки
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={settings.vibrationEnabled}
                    onChange={() => setSettings((current) => ({ ...current, vibrationEnabled: !current.vibrationEnabled }))}
                  />
                  Вібрація
                </label>
                <label className="volume-row">
                  <span>Гучність</span>
                  <input
                    type="range"
                    min="0.3"
                    max="1"
                    step="0.1"
                    value={settings.volume}
                    onChange={(event) => setSettings((current) => ({ ...current, volume: Number(event.target.value) }))}
                  />
                </label>
              </div>
            )}
          </div>

          <button className="primary-button" type="button" onClick={startSession}>
            Почати
          </button>
        </section>
      )}

      {(phase === 'calibration' || phase === 'training') && (
        <section className={`trainer-stage trainer-stage--${stageTone}`}>
          {errorMessage ? (
            <div className="message-card">{errorMessage}</div>
          ) : (
            <>
              {phase === 'calibration' && isDynamic && <CalibrationChecklist steps={stanceCalibration.steps} />}

              {phase === 'calibration' && !isDynamic && (
                <div className="calibration-overlay">
                  <strong>Тримай стартову позицію</strong>
                  <span>{countdown}</span>
                </div>
              )}

              <CameraFeed
                videoRef={videoRef}
                canvasRef={canvasRef}
                points={points}
                isReady={isReady}
                isCalibrating={isCalibrating}
                overlayMode={isDynamic ? 'muscles' : 'skeleton'}
                activeMuscles={config.targetMuscles}
                problemMuscles={problemMuscles}
              />
              {!(phase === 'calibration' && isDynamic) && (
                <div className="big-timer">
                  {bigDisplayValue}
                  {bigDisplaySuffix}
                </div>
              )}
              <StatusBadge feedback={feedback} />

              <div className="controls-row">
                <button className="secondary-button" type="button" onClick={pauseSession}>
                  {isPaused ? 'Продовжити' : 'Пауза'}
                </button>
                <button className="primary-button" type="button" onClick={stopSession}>
                  Стоп
                </button>
              </div>

              {isPaused && (
                <div className="summary-card">
                  <h3>Аналіз після паузи</h3>
                  <div className="summary-chart" aria-label="Порівняння правильної і неправильної техніки">
                    <span className="chart-segment chart-good" style={{ width: `${correctRatio}%` }} />
                    <span className="chart-segment chart-bad" style={{ width: `${incorrectRatio}%` }} />
                  </div>
                  <div className="summary-grid">
                    <div>
                      <span>Правильно</span>
                      <strong>{goodUnitLabel}</strong>
                    </div>
                    <div>
                      <span>Неправильно</span>
                      <strong>{badUnitLabel}</strong>
                    </div>
                    <div>
                      <span>Точність</span>
                      <strong>{correctRatio}%</strong>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {phase === 'result' && (
        <section className="result-card">
          <h2>{resultHeading}</h2>
          <div className="summary-chart" aria-label="Порівняння правильної і неправильної техніки">
            <span className="chart-segment chart-good" style={{ width: `${correctRatio}%` }} />
            <span className="chart-segment chart-bad" style={{ width: `${incorrectRatio}%` }} />
          </div>
          <div className="summary-grid">
            <div>
              <span>Правильно</span>
              <strong>{goodUnitLabel}</strong>
            </div>
            <div>
              <span>Неправильно</span>
              <strong>{badUnitLabel}</strong>
            </div>
            <div>
              <span>Точність</span>
              <strong>{correctRatio}%</strong>
            </div>
          </div>
          <div className="coach-note">
            <strong>Порада від тренера</strong>
            <p>{coachSummary}</p>
          </div>
          <button className="primary-button" type="button" onClick={() => setPhase('intro')}>
            Ще раз
          </button>
          <button className="secondary-button" type="button" onClick={() => navigate('/training')}>
            До вибору вправи
          </button>
        </section>
      )}
    </div>
  )
}
