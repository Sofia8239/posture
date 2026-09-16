import { getAngle, getDistance, getMidpoint } from './angles'
import { LM } from './landmarks'
import { pickWorstCandidate, type ViewRequirement } from './squatRules'
import type { CameraView } from './viewDetection'
import type { RepThresholds } from '../repCounter'
import type { CorrectionIssue } from '../voice/sessionContext'
import type { ExerciseFeedback, PosePoint, RepPhase } from '../types'

export interface GluteBridgeMetrics {
  /** shoulder-hip-knee angle: ~90-120° lying flat at rest (knees bent), ~165-180° fully bridged. */
  hipAngle: number
  /** |leftHip.y - rightHip.y| — only meaningful from a front-on view. */
  hipAsymmetry: number
  /** ankleGap - kneeGap: positive means the knees have drifted inward relative to the ankles. */
  kneeValgus: number
}

/** Mirrors the squat-family thresholds' semantics: 'top' is the fully-extended position
 * (here, hips lifted into the bridge), 'bottom' is the resting position (hips down,
 * knees bent) — same RepCounter direction, just a lying-down movement instead of standing. */
export const gluteBridgeCycleThresholds: RepThresholds = { top: 165, bottom: 120 }

export function extractGluteBridgeMetrics(points: PosePoint[]): GluteBridgeMetrics | null {
  const required = [LM.leftShoulder, LM.rightShoulder, LM.leftHip, LM.rightHip, LM.leftKnee, LM.rightKnee, LM.leftAnkle, LM.rightAnkle]
  if (required.some((index) => !points[index])) {
    return null
  }

  const shoulderMid = getMidpoint(points[LM.leftShoulder], points[LM.rightShoulder])
  const hipMid = getMidpoint(points[LM.leftHip], points[LM.rightHip])
  const kneeMid = getMidpoint(points[LM.leftKnee], points[LM.rightKnee])
  const hipAngle = getAngle(shoulderMid, hipMid, kneeMid)

  const kneeGap = getDistance(points[LM.leftKnee], points[LM.rightKnee])
  const ankleGap = getDistance(points[LM.leftAnkle], points[LM.rightAnkle])

  return {
    hipAngle,
    hipAsymmetry: Math.abs(points[LM.leftHip].y - points[LM.rightHip].y),
    kneeValgus: ankleGap - kneeGap,
  }
}

type Candidate = ExerciseFeedback & { issue: CorrectionIssue | null; view: ViewRequirement }

/** Mirrors checkSquatDepth's shape: the RepCounter already requires hipAngle >= 165 to
 * call this phase 'top' at all, so a tighter inner threshold (175) is what actually
 * catches "reached top late/barely" during the debounce window right at the phase edge. */
function checkInsufficientHeight(metrics: GluteBridgeMetrics, phase: RepPhase): Candidate | null {
  if (phase === 'top' && metrics.hipAngle < 175) {
    return { message: 'Підніми таз вище, до прямої лінії', tone: 'soft', severity: 55, issue: 'gluteBridgeInsufficientHeight', view: 'side' }
  }
  return null
}

function checkHyperextension(metrics: GluteBridgeMetrics, phase: RepPhase): Candidate | null {
  if (phase !== 'top' || metrics.hipAngle <= 190) {
    return null
  }
  return { message: 'Не піднімай таз вище лінії тіла — прогинається поперек', tone: 'warning', severity: 78, issue: 'gluteBridgeHyperextension', view: 'side' }
}

function checkAsymmetricHips(metrics: GluteBridgeMetrics, phase: RepPhase): Candidate | null {
  if (phase !== 'top' || metrics.hipAsymmetry < 0.03) {
    return null
  }
  return { message: 'Одне стегно вище за інше — піднімай таз рівно', tone: 'soft', severity: 60, issue: 'gluteBridgeAsymmetricHips', view: 'front' }
}

function checkKneesCollapse(metrics: GluteBridgeMetrics, phase: RepPhase): Candidate | null {
  if (phase !== 'top' || metrics.kneeValgus <= 0.04) {
    return null
  }
  return { message: 'Коліна завалюються всередину — розведи їх над стопами', tone: 'warning', severity: 88, issue: 'kneesCollapse', view: 'front' }
}

function checkTempo(cycleDurationMs: number): Candidate | null {
  if (cycleDurationMs > 0 && cycleDurationMs < 1500) {
    return { message: 'Занадто швидко, контролюй рух', tone: 'soft', severity: 45, issue: 'tooFast', view: 'any' }
  }
  return null
}

/**
 * Evaluates glute bridge form. `cycleDurationMs` should be the just-completed rep's
 * duration (pass 0 on every other frame). `currentView` filters out checks that aren't
 * reliable from the detected camera angle — height/hyperextension read best from the
 * side (the recommended placement, per the onboarding line), asymmetry/knee valgus need
 * a front-on view and simply stay silent otherwise, same tradeoff the squat rules make.
 */
export function evaluateGluteBridgeRules(
  metrics: GluteBridgeMetrics,
  phase: RepPhase,
  cycleDurationMs = 0,
  currentView: CameraView | null = null,
): Candidate {
  return pickWorstCandidate(
    [
      checkHyperextension(metrics, phase),
      checkKneesCollapse(metrics, phase),
      checkInsufficientHeight(metrics, phase),
      checkAsymmetricHips(metrics, phase),
      checkTempo(cycleDurationMs),
    ],
    currentView,
  )
}
