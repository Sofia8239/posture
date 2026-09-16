import { useEffect, useMemo, useRef, useState } from 'react'
import { analyzePlank } from './exercises/plank'
import { analyzeSquat } from './exercises/squat'
import type { ExerciseId, ExerciseFeedback, PosePoint } from './exercises/types'
import { createPoseLandmarker, getPoseLoopState } from './poseDetection'
import { PoseOverlay } from './PoseOverlay'

const EXERCISES: Array<{ id: ExerciseId; label: string }> = [
  { id: 'plank', label: 'Планка' },
  { id: 'squat', label: 'Присідання' },
]

export function CameraView() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const landmarkerRef = useRef<Awaited<ReturnType<typeof createPoseLandmarker>> | null>(null)
  const animationRef = useRef<number | null>(null)
  const lastFrameTimeRef = useRef<number>(0)
  const lastUiUpdateRef = useRef<number>(0)
  const holdStartRef = useRef<number | null>(null)
  const wasInDeepSquatRef = useRef(false)
  const pointsRef = useRef<PosePoint[]>([])

  const [exercise, setExercise] = useState<ExerciseId>('plank')
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [isModelReady, setIsModelReady] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [points, setPoints] = useState<PosePoint[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [statusMessage, setStatusMessage] = useState('Готуємо тренера...')
  const [holdSeconds, setHoldSeconds] = useState(0)
  const [repetitions, setRepetitions] = useState(0)

  const feedback: ExerciseFeedback = useMemo(() => {
    if (exercise === 'plank') {
      return analyzePlank(points, holdSeconds).feedback
    }

    return analyzeSquat(points, repetitions).feedback
  }, [exercise, holdSeconds, points, repetitions])

  useEffect(() => {
    if (!isCameraOn) {
      return
    }

    const startCamera = async () => {
      try {
        setErrorMessage('')
        setStatusMessage('Готуємо тренера...')

        if (!navigator.mediaDevices?.getUserMedia) {
          throw new DOMException('Браузер не підтримує доступ до камери.', 'NotSupportedError')
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        })

        const video = videoRef.current
        if (!video) {
          return
        }

        // Потік камери прив'язується одразу, щоб користувач бачив прев'ю відразу,
        // а завантаження моделі Pose Landmarker відбувається паралельно.
        streamRef.current = stream
        video.srcObject = stream
        void video.play().catch(() => undefined)

        const landmarker = await createPoseLandmarker()
        landmarkerRef.current = landmarker
        setIsModelReady(true)
        setStatusMessage('Камера готова')
      } catch (caughtError) {
        setIsCameraOn(false)

        if (caughtError instanceof DOMException) {
          if (caughtError.name === 'NotAllowedError') {
            setErrorMessage('Браузер заблокував доступ до камери. Увімкни дозвіл у адресному рядку та спробуй ще раз.')
          } else if (caughtError.name === 'NotFoundError') {
            setErrorMessage('Камера не знайдена. Підключи вебкамеру або вибери інший пристрій.')
          } else if (caughtError.name === 'NotReadableError') {
            setErrorMessage('Камеру вже використовує інша програма. Закрий інші вкладки або застосунки й спробуй знову.')
          } else {
            setErrorMessage('Не вдалося увімкнути камеру. Перевір доступ до камери та дозволи браузера.')
          }
        } else {
          setErrorMessage('Не вдалося увімкнути камеру. Перевір доступ до камери та дозволи браузера.')
        }

        console.error(caughtError)
      }
    }

    void startCamera()

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [isCameraOn])

  useEffect(() => {
    const video = videoRef.current
    const landmarker = landmarkerRef.current

    if (!video || !landmarker || !isCameraOn || !isModelReady) {
      return
    }

    const loop = (timestamp: number) => {
      if (isPaused) {
        animationRef.current = window.requestAnimationFrame(loop)
        return
      }

      if (timestamp - lastFrameTimeRef.current < 120) {
        animationRef.current = window.requestAnimationFrame(loop)
        return
      }

      const result = landmarker.detectForVideo(video, timestamp)
      const nextState = getPoseLoopState(result)
      pointsRef.current = nextState.points

      if (timestamp - lastUiUpdateRef.current > 180) {
        setPoints(nextState.points)
        lastUiUpdateRef.current = timestamp
      }

      if (!nextState.isFullBodyVisible) {
        setStatusMessage('Відсунься, будь ласка, щоб я бачив тебе повністю')
      } else if (exercise === 'plank') {
        const analysis = analyzePlank(nextState.points, holdSeconds)
        setStatusMessage(analysis.feedback.message)

        if (analysis.isInPosition && holdStartRef.current === null) {
          holdStartRef.current = performance.now()
        }

        if (!analysis.isInPosition) {
          holdStartRef.current = null
        }

        if (analysis.isInPosition && holdStartRef.current !== null) {
          setHoldSeconds(Math.floor((performance.now() - holdStartRef.current) / 1000))
        }
      } else {
        const analysis = analyzeSquat(nextState.points, repetitions)
        setStatusMessage(analysis.feedback.message)

        const isInDeepSquat = analysis.leftAngle < 90 && analysis.rightAngle < 90

        if (isInDeepSquat && !wasInDeepSquatRef.current) {
          wasInDeepSquatRef.current = true
        }

        if (!isInDeepSquat && wasInDeepSquatRef.current) {
          setRepetitions((current) => current + 1)
          wasInDeepSquatRef.current = false
        }
      }

      lastFrameTimeRef.current = timestamp
      animationRef.current = window.requestAnimationFrame(loop)
    }

    animationRef.current = window.requestAnimationFrame(loop)

    return () => {
      if (animationRef.current !== null) {
        window.cancelAnimationFrame(animationRef.current)
      }
    }
  }, [exercise, holdSeconds, isCameraOn, isModelReady, isPaused, repetitions])

  const toggleCamera = () => {
    if (isCameraOn) {
      setIsCameraOn(false)
      setStatusMessage('Камера вимкнена')
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      return
    }

    setIsCameraOn(true)
  }

  const switchExercise = (nextExercise: ExerciseId) => {
    setExercise(nextExercise)
    setHoldSeconds(0)
    setRepetitions(0)
    holdStartRef.current = null
    wasInDeepSquatRef.current = false
    setStatusMessage(nextExercise === 'plank' ? 'Підтримуй правильну лінію тіла' : 'Починай повторення з верхньої фази')
  }

  const togglePause = () => {
    setIsPaused((current) => !current)
    setStatusMessage(isPaused ? 'Тренування відновлено' : 'Пауза')
  }

  const finishSession = () => {
    setIsCameraOn(false)
    setIsModelReady(false)
    setIsPaused(false)
    setHoldSeconds(0)
    setRepetitions(0)
    setPoints([])
    setStatusMessage('Сеанс завершено')

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }
  }

  const visible = isCameraOn && isModelReady && points.length > 0

  return (
    <div className="camera-screen">
      <header className="camera-header">
        <div>
          <p className="eyebrow">Posture</p>
          <h1>Тренувальний модуль</h1>
        </div>
        <div className="header-actions">
          <span className="timer-pill">{exercise === 'plank' ? `${holdSeconds}s` : `${repetitions} повторів`}</span>
          <button className="ghost-button" type="button" aria-label="Закрити">
            ✕
          </button>
        </div>
      </header>

      <section className="screen-card">
        <div className="exercise-switcher" role="tablist" aria-label="Вибір вправи">
          {EXERCISES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === exercise ? 'pill-button active' : 'pill-button'}
              onClick={() => switchExercise(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className={`status-banner ${feedback.tone === 'good' ? 'good' : feedback.tone === 'hint' ? 'hint' : 'warning'}`}>
          <span>{feedback.tone === 'good' ? '✅' : feedback.tone === 'hint' ? '💡' : '⚠️'}</span>
          <strong>{feedback.message}</strong>
        </div>

        <div className="video-stage">
          {errorMessage ? (
            <div className="empty-state">
              <p>{errorMessage}</p>
            </div>
          ) : !isCameraOn ? (
            <div className="empty-state">
              <p>Камера вимкнена. Натисни «Увімкнути камеру».</p>
            </div>
          ) : (
            <>
              <video ref={videoRef} className="camera-video" playsInline muted />
              {!isModelReady && (
                <div className="loading-badge">
                  <div className="spinner" />
                  <p>{statusMessage}</p>
                </div>
              )}
              {isModelReady && <PoseOverlay videoRef={videoRef} points={points} visible={visible} />}
            </>
          )}
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span>Таймер</span>
            <strong>{exercise === 'plank' ? `${holdSeconds}s` : `${repetitions} разів`}</strong>
          </div>
          <div className="stat-card">
            <span>Статус</span>
            <strong>{statusMessage}</strong>
          </div>
        </div>

        <div className="controls-row">
          <button className="primary-button" type="button" onClick={toggleCamera}>
            {isCameraOn ? 'Вимкнути камеру' : 'Увімкнути камеру'}
          </button>
          <button className="secondary-button" type="button" onClick={togglePause}>
            {isPaused ? 'Відновити' : 'Пауза'}
          </button>
          <button className="secondary-button" type="button" onClick={finishSession}>
            Завершити
          </button>
        </div>
      </section>
    </div>
  )
}
