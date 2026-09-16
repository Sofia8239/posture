import { useEffect, useRef, useState } from 'react'
import { evaluateCalibrationSteps, type CalibrationStep } from '../analysis/stanceCalibration'
import type { ExerciseId, PosePoint } from '../types'

/** How long every check has to hold true in a row before we trust the stance and start counting reps. */
const HOLD_STABLE_MS = 1500

/**
 * Active calibration for dynamic (rep-based) exercises: instead of a blind 3-second
 * countdown, this keeps checking stance/posture/distance every frame and only signals
 * "ready" once everything has held steady for HOLD_STABLE_MS.
 */
export function useStanceCalibration(points: PosePoint[], exerciseId: ExerciseId, isActive: boolean) {
  const [steps, setSteps] = useState<CalibrationStep[]>([])
  const [isReady, setIsReady] = useState(false)
  const allPassedSinceRef = useRef<number | null>(null)
  const isReadyRef = useRef(false)
  const stepsSignatureRef = useRef('')

  const applyReady = (next: boolean) => {
    if (isReadyRef.current !== next) {
      isReadyRef.current = next
      setIsReady(next)
    }
  }

  const applySteps = (next: CalibrationStep[]) => {
    const signature = next.map((step) => `${step.id}:${step.passed}`).join(',')
    if (stepsSignatureRef.current !== signature) {
      stepsSignatureRef.current = signature
      setSteps(next)
    }
  }

  useEffect(() => {
    if (!isActive) {
      allPassedSinceRef.current = null
      applyReady(false)
      return
    }

    const nextSteps = evaluateCalibrationSteps(points, exerciseId)
    applySteps(nextSteps)

    const allPassed = nextSteps.length > 0 && nextSteps.every((step) => step.passed)
    const now = performance.now()

    if (!allPassed) {
      allPassedSinceRef.current = null
      applyReady(false)
      return
    }

    if (allPassedSinceRef.current === null) {
      allPassedSinceRef.current = now
    }

    applyReady(now - allPassedSinceRef.current >= HOLD_STABLE_MS)
  }, [exerciseId, isActive, points])

  const reset = () => {
    allPassedSinceRef.current = null
    isReadyRef.current = false
    stepsSignatureRef.current = ''
    setIsReady(false)
    setSteps([])
  }

  const firstFailingStep = steps.find((step) => !step.passed) ?? null

  return { steps, isReady, reset, firstFailingStep }
}
