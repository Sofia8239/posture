import { useEffect, useRef } from 'react'
import { drawPoseOverlay } from './utils/rendering'
import type { PosePoint } from './exercises/types'

interface PoseOverlayProps {
  videoRef: React.RefObject<HTMLVideoElement | null>
  points: PosePoint[]
  visible: boolean
}

export function PoseOverlay({ videoRef, points, visible }: PoseOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const video = videoRef.current

    if (!canvas || !video || !visible) {
      if (canvas) {
        const context = canvas.getContext('2d')
        context?.clearRect(0, 0, canvas.width, canvas.height)
      }
      return
    }

    const context = canvas.getContext('2d')
    if (!context) {
      return
    }

    const width = video.clientWidth || 640
    const height = video.clientHeight || 480
    canvas.width = width
    canvas.height = height

    const normalizedPoints: PosePoint[] = points.map((point) => ({
      x: point.x * width,
      y: point.y * height,
      visibility: point.visibility,
    }))

    drawPoseOverlay(context, normalizedPoints, width, height)
  }, [points, videoRef, visible])

  return <canvas ref={canvasRef} className="camera-overlay" aria-hidden="true" />
}
