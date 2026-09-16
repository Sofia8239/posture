import { useEffect, useRef, useState } from 'react'
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision'
import type { PosePoint } from '../types'

const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task'

const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'

interface UsePoseDetectionResult {
  videoRef: React.RefObject<HTMLVideoElement | null>
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  isReady: boolean
  points: PosePoint[]
  errorMessage: string
  startCamera: () => Promise<void>
  stopCamera: () => void
}

export function usePoseDetection(): UsePoseDetectionResult {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const landmarkerRef = useRef<PoseLandmarker | null>(null)
  const animationRef = useRef<number | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [points, setPoints] = useState<PosePoint[]>([])
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    return () => {
      stopCamera()
      if (animationRef.current !== null) {
        window.cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    const video = videoRef.current
    if (video) {
      video.srcObject = null
    }

    setIsReady(false)
  }

  const startCamera = async () => {
    try {
      setErrorMessage('')

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new DOMException('Браузер не підтримує доступ до камери.', 'NotSupportedError')
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      })

      streamRef.current = stream

      const waitForVideoElement = async () => {
        for (let attempt = 0; attempt < 10; attempt += 1) {
          const video = videoRef.current
          if (video) {
            return video
          }

          await new Promise((resolve) => window.requestAnimationFrame(() => resolve(undefined)))
        }

        return null
      }

      const video = await waitForVideoElement()
      if (!video) {
        throw new DOMException('Елемент відео ще не відрендерився.', 'NotSupportedError')
      }

      video.srcObject = stream
      video.muted = true
      video.playsInline = true
      await video.play().catch(() => undefined)

      setIsReady(true)

      try {
        const vision = await FilesetResolver.forVisionTasks(WASM_URL)
        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MODEL_URL,
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
        })

        landmarkerRef.current = landmarker

        const loop = (timestamp: number) => {
          const currentVideo = videoRef.current
          if (!currentVideo || currentVideo.readyState < 2) {
            animationRef.current = window.requestAnimationFrame(loop)
            return
          }

          const result = landmarker.detectForVideo(currentVideo, timestamp)
          const nextLandmarks = result.landmarks?.[0] ?? []
          const nextPoints = nextLandmarks.map((point) => ({
            x: point.x,
            y: point.y,
            z: point.z,
            visibility: point.visibility,
          }))

          setPoints(nextPoints)
          animationRef.current = window.requestAnimationFrame(loop)
        }

        animationRef.current = window.requestAnimationFrame(loop)
      } catch {
        try {
          const vision = await FilesetResolver.forVisionTasks(WASM_URL)
          const landmarker = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: MODEL_URL,
              delegate: 'CPU',
            },
            runningMode: 'VIDEO',
            numPoses: 1,
          })

          landmarkerRef.current = landmarker

          const loop = (timestamp: number) => {
            const currentVideo = videoRef.current
            if (!currentVideo || currentVideo.readyState < 2) {
              animationRef.current = window.requestAnimationFrame(loop)
              return
            }

            const result = landmarker.detectForVideo(currentVideo, timestamp)
            const nextLandmarks = result.landmarks?.[0] ?? []
            const nextPoints = nextLandmarks.map((point) => ({
              x: point.x,
              y: point.y,
              z: point.z,
              visibility: point.visibility,
            }))

            setPoints(nextPoints)
            animationRef.current = window.requestAnimationFrame(loop)
          }

          animationRef.current = window.requestAnimationFrame(loop)
        } catch {
          setErrorMessage('Камера працює, але розпізнавання не завантажилося. Перезавантаж сторінку або спробуй ще раз.')
        }
      }
    } catch (caughtError) {
      stopCamera()

      if (caughtError instanceof DOMException) {
        if (caughtError.name === 'NotAllowedError') {
          setErrorMessage('Браузер заблокував доступ до камери. Увімкни дозвіл у адресному рядку.')
        } else if (caughtError.name === 'NotFoundError') {
          setErrorMessage('Камера не знайдена. Підключи вебкамеру або вибери інший пристрій.')
        } else {
          setErrorMessage('Не вдалося увімкнути камеру. Перевір доступ до камери та дозволи браузера.')
        }
      } else {
        setErrorMessage('Не вдалося увімкнути камеру. Перевір доступ до камери та дозволи браузера.')
      }
    }
  }

  return {
    videoRef,
    canvasRef,
    isReady,
    points,
    errorMessage,
    startCamera,
    stopCamera,
  }
}
