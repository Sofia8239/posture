import {
  checkHeelLift,
  checkKneeValgus,
  checkSquatDepth,
  checkTempo,
  checkTorsoRounding,
  extractSquatMetrics,
  pickWorstCandidate,
  squatCycleThresholds,
  type SquatMetrics,
} from './squatRules'
import type { CameraView } from './viewDetection'
import type { RepThresholds } from '../repCounter'
import type { CorrectionIssue } from '../voice/sessionContext'
import type { ExerciseFeedback, PosePoint, RepPhase } from '../types'

export const narrowSquatCycleThresholds: RepThresholds = squatCycleThresholds

export function extractNarrowSquatMetrics(points: PosePoint[]): SquatMetrics | null {
  return extractSquatMetrics(points)
}

type Candidate = ExerciseFeedback & { issue: CorrectionIssue | null; view: 'front' | 'side' | 'any' }

function checkNarrowStance(metrics: SquatMetrics): Candidate | null {
  // A narrow squat wants feet together or nearly so — this is the opposite bound from
  // the classic squat's "too narrow" check, so it needs its own issue/phrasing.
  if (metrics.stanceRatio > 0.35) {
    return { message: 'Постав ноги ближче — для вузького присіду стопи мають бути майже разом', tone: 'soft', severity: 45, issue: 'narrowSquatTooWide', view: 'any' }
  }
  return null
}

export function evaluateNarrowSquatRules(metrics: SquatMetrics, phase: RepPhase, cycleDurationMs = 0, currentView: CameraView | null = null): Candidate {
  return pickWorstCandidate([
    checkSquatDepth(metrics, phase),
    checkKneeValgus(metrics, phase),
    checkTorsoRounding(metrics, phase),
    checkHeelLift(metrics, phase),
    checkNarrowStance(metrics),
    checkTempo(cycleDurationMs),
  ], currentView)
}
