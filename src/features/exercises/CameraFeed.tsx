import { useEffect, useState } from 'react'
import { MuscleOverlay } from './MuscleOverlay'
import { mapPointsToDisplayFrame } from './analysis/videoFraming'
import type { MuscleZone } from './analysis/muscleMap'
import type { PosePoint } from './types'

interface CameraFeedProps {
  videoRef: React.RefObject<HTMLVideoElement | null>
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  points: PosePoint[]
  isReady: boolean
  isCalibrating: boolean
  /** 'muscles' swaps the raw skeleton dots for the live anatomical overlay. Defaults to 'skeleton'. */
  overlayMode?: 'skeleton' | 'muscles'
  activeMuscles?: MuscleZone[]
  problemMuscles?: MuscleZone[]
}

export function CameraFeed({
  videoRef,
  canvasRef,
  points,
  isReady,
  isCalibrating,
  overlayMode = 'skeleton',
  activeMuscles = [],
  problemMuscles = [],
}: CameraFeedProps) {
  const [displayPoints, setDisplayPoints] = useState<PosePoint[]>(points)

  useEffect(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video || !isReady) {
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

    // MediaPipe's normalized coordinates are relative to the camera's native (uncropped)
    // frame, but the video is shown with `object-fit: cover`, which crops it to fill the
    // box. Without this correction every overlay drifts toward the center whenever the
    // native and displayed aspect ratios differ — this re-maps points onto the frame the
    // user actually sees, once, so every consumer below (canvas dots, muscle SVG) draws
    // in the same correct space.
    const nextDisplayPoints = video.videoWidth && video.videoHeight
      ? mapPointsToDisplayFrame(points, video.videoWidth, video.videoHeight, width, height)
      : points
    setDisplayPoints(nextDisplayPoints)

    context.clearRect(0, 0, width, height)

    if (overlayMode !== 'skeleton') {
      return
    }

    context.strokeStyle = isCalibrating ? '#7A6E64' : '#7A9E5F'
    context.lineWidth = 3

    for (let index = 0; index < nextDisplayPoints.length; index += 1) {
      const point = nextDisplayPoints[index]
      if (!point) {
        continue
      }

      context.fillStyle = isCalibrating ? '#7A6E64' : '#D6006E'
      context.beginPath()
      context.arc(point.x * width, point.y * height, 6, 0, Math.PI * 2)
      context.fill()
    }
  }, [canvasRef, isCalibrating, isReady, overlayMode, points, videoRef])

  return (
    <div className="camera-frame">
      <video ref={videoRef} className="camera-video" playsInline muted />
      <canvas ref={canvasRef} className="skeleton-canvas" />
      {overlayMode === 'muscles' && <MuscleOverlay points={displayPoints} activeMuscles={activeMuscles} problemMuscles={problemMuscles} />}
    </div>
  )
}
