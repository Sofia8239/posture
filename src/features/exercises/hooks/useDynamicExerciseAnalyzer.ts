import { useEffect, useRef, useState } from 'react'
import { RepCounter } from '../repCounter'
import { BottomAngleDriftTracker, evaluateSquatRules, extractSquatMetrics, squatCycleThresholds } from '../analysis/squatRules'
import { evaluatePlieSquatRules, extractPlieSquatMetrics, plieSquatCycleThresholds } from '../analysis/plieSquatRules'
import { evaluateNarrowSquatRules, extractNarrowSquatMetrics, narrowSquatCycleThresholds } from '../analysis/narrowSquatRules'
import {
  LegAlternationTracker,
  evaluateForwardLungeRules,
  extractForwardLungeMetrics,
  forwardLungeCycleThresholds,
} from '../analysis/forwardLungeRules'
import { evaluateSideLungeRules, extractSideLungeMetrics, sideLungeCycleThresholds } from '../analysis/sideLungeRules'
import { evaluateGluteBridgeRules, extractGluteBridgeMetrics, gluteBridgeCycleThresholds } from '../analysis/gluteBridgeRules'
import { detectCameraView, type CameraView } from '../analysis/viewDetection'
import { SessionRecorder } from '../sessionRecorder'
import type { CorrectionIssue } from '../voice/sessionContext'
import type { ExerciseFeedback, ExerciseId, PosePoint } from '../types'

export type DynamicFeedback = ExerciseFeedback & { issue: CorrectionIssue | null }

interface FrameResult {
  feedback: DynamicFeedback
  newRep: boolean
  repCount: number
}

function analyzeFrame(
  exerciseId: ExerciseId,
  points: PosePoint[],
  repCounter: RepCounter,
  legTracker: LegAlternationTracker,
  buttWinkTracker: BottomAngleDriftTracker,
  now: number,
  view: CameraView | null,
): FrameResult | null {
  switch (exerciseId) {
    case 'squat': {
      const metrics = extractSquatMetrics(points)
      if (!metrics) {
        return null
      }
      const cycle = repCounter.update(metrics.kneeAngle, squatCycleThresholds, now)
      const bottomAngleDrift = buttWinkTracker.observe(cycle.phase, metrics.torsoAngle)
      const feedback = evaluateSquatRules(metrics, cycle.phase, cycle.newRep ? cycle.cycleDurationMs ?? 0 : 0, view, bottomAngleDrift)
      return { feedback, newRep: cycle.newRep, repCount: cycle.count }
    }

    case 'plie-squat': {
      const metrics = extractPlieSquatMetrics(points)
      if (!metrics) {
        return null
      }
      const cycle = repCounter.update(metrics.kneeAngle, plieSquatCycleThresholds, now)
      const feedback = evaluatePlieSquatRules(metrics, cycle.phase, cycle.newRep ? cycle.cycleDurationMs ?? 0 : 0, view)
      return { feedback, newRep: cycle.newRep, repCount: cycle.count }
    }

    case 'narrow-squat': {
      const metrics = extractNarrowSquatMetrics(points)
      if (!metrics) {
        return null
      }
      const cycle = repCounter.update(metrics.kneeAngle, narrowSquatCycleThresholds, now)
      const feedback = evaluateNarrowSquatRules(metrics, cycle.phase, cycle.newRep ? cycle.cycleDurationMs ?? 0 : 0, view)
      return { feedback, newRep: cycle.newRep, repCount: cycle.count }
    }

    case 'forward-lunge': {
      const metrics = extractForwardLungeMetrics(points)
      if (!metrics) {
        return null
      }
      const cycle = repCounter.update(metrics.frontKneeAngle, forwardLungeCycleThresholds, now)
      if (cycle.newRep) {
        legTracker.recordRep(metrics.frontLegIsLeft)
      }
      const feedback = evaluateForwardLungeRules(metrics, cycle.phase, legTracker.streak)
      return { feedback, newRep: cycle.newRep, repCount: cycle.count }
    }

    case 'side-lunge': {
      const metrics = extractSideLungeMetrics(points)
      if (!metrics) {
        return null
      }
      const cycle = repCounter.update(metrics.bentKneeAngle, sideLungeCycleThresholds, now)
      const feedback = evaluateSideLungeRules(metrics, cycle.phase)
      return { feedback, newRep: cycle.newRep, repCount: cycle.count }
    }

    case 'glute-bridge': {
      const metrics = extractGluteBridgeMetrics(points)
      if (!metrics) {
        return null
      }
      const cycle = repCounter.update(metrics.hipAngle, gluteBridgeCycleThresholds, now)
      const feedback = evaluateGluteBridgeRules(metrics, cycle.phase, cycle.newRep ? cycle.cycleDurationMs ?? 0 : 0, view)
      return { feedback, newRep: cycle.newRep, repCount: cycle.count }
    }

    case 'plank':
      return null
  }
}

export function useDynamicExerciseAnalyzer(points: PosePoint[], exerciseId: ExerciseId) {
  const [feedback, setFeedback] = useState<DynamicFeedback>({
    message: 'Займи стартову позицію, я тебе подивлюсь',
    tone: 'soft',
    severity: 0,
    issue: null,
  })
  const [reps, setReps] = useState(0)
  const [goodReps, setGoodReps] = useState(0)
  const [badReps, setBadReps] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [view, setView] = useState<CameraView | null>(null)

  const repCounterRef = useRef(new RepCounter())
  const legTrackerRef = useRef(new LegAlternationTracker())
  const buttWinkTrackerRef = useRef(new BottomAngleDriftTracker())
  const sessionRecorderRef = useRef(new SessionRecorder())
  const lastFeedbackAtRef = useRef(0)
  const viewRef = useRef<CameraView | null>(null)

  useEffect(() => {
    if (!isActive) {
      return
    }

    const currentView = detectCameraView(points)
    if (currentView !== viewRef.current) {
      viewRef.current = currentView
      setView(currentView)
    }

    const result = analyzeFrame(exerciseId, points, repCounterRef.current, legTrackerRef.current, buttWinkTrackerRef.current, performance.now(), currentView)
    if (!result) {
      return
    }

    const now = performance.now()
    const wallClockNow = Date.now()
    const shouldUpdate = now - lastFeedbackAtRef.current > 200
    if (shouldUpdate) {
      setFeedback(result.feedback)
      lastFeedbackAtRef.current = now
    }

    sessionRecorderRef.current.recordFrame(reps + 1, result.feedback.issue, result.feedback.severity, wallClockNow)

    if (result.newRep) {
      sessionRecorderRef.current.completeRep(result.repCount, wallClockNow)
      setReps(result.repCount)
      if (result.feedback.tone === 'good') {
        setGoodReps((current) => current + 1)
      } else {
        setBadReps((current) => current + 1)
      }
    }
  }, [exerciseId, isActive, points, reps])

  const resetStats = () => {
    setReps(0)
    setGoodReps(0)
    setBadReps(0)
    repCounterRef.current.reset()
    legTrackerRef.current.reset()
    buttWinkTrackerRef.current.reset()
    sessionRecorderRef.current.reset()
  }

  const getSessionReps = () => sessionRecorderRef.current.getReps()

  return {
    feedback,
    reps,
    goodReps,
    badReps,
    isActive,
    setIsActive,
    resetStats,
    view,
    getSessionReps,
  }
}
