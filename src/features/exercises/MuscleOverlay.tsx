import { useEffect, useMemo, useRef, useState } from 'react'
import { buildMuscleShapes } from './analysis/muscleOverlayGeometry'
import { muscleColors, type MuscleZone } from './analysis/muscleMap'
import { PointSmoother } from './analysis/pointSmoother'
import type { PosePoint } from './types'

interface MuscleOverlayProps {
  points: PosePoint[]
  /** Muscles this exercise targets — lightly tinted even with correct form. */
  activeMuscles: MuscleZone[]
  /** Muscles implicated by the current correction issue — highlighted red. */
  problemMuscles: MuscleZone[]
}

/**
 * Live anatomical-style overlay that replaces the raw MediaPipe skeleton dots for
 * squat-family exercises. Each muscle shape is recomputed from the current joint
 * positions every frame (see muscleOverlayGeometry.ts) rather than a static image
 * transformed as a whole, so it keeps tracking correctly through the full squat —
 * not just while standing upright.
 */
export function MuscleOverlay({ points, activeMuscles, problemMuscles }: MuscleOverlayProps) {
  const smootherRef = useRef(new PointSmoother())
  const [smoothedPoints, setSmoothedPoints] = useState<PosePoint[]>(points)

  useEffect(() => {
    setSmoothedPoints(smootherRef.current.smooth(points))
  }, [points])

  const shapes = useMemo(() => buildMuscleShapes(smoothedPoints), [smoothedPoints])

  if (shapes.length === 0) {
    return null
  }

  return (
    <svg className="muscle-overlay" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true">
      {shapes.map((shape, index) => {
        const state = problemMuscles.includes(shape.zone) ? 'problem' : activeMuscles.includes(shape.zone) ? 'active' : 'base'
        const color = muscleColors[state]
        return (
          <polygon key={`${shape.zone}-${index}`} className="muscle-shape" points={shape.points} fill={color.fill} opacity={color.opacity} />
        )
      })}
    </svg>
  )
}
