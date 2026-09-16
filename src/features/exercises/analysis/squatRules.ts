import { getAngle, getAngleFromPointSet, getDistance, getMidpoint } from './angles'
import { LM } from './landmarks'
import type { CameraView } from './viewDetection'
import type { RepThresholds } from '../repCounter'
import type { CorrectionIssue } from '../voice/sessionContext'
import type { ExerciseFeedback, PosePoint, RepPhase } from '../types'

export interface SquatMetrics {
  kneeAngle: number
  leftKneeAngle: number
  rightKneeAngle: number
  /** ankleGap - kneeGap: positive means the knees are narrower than the ankles (caving in). */
  kneeValgus: number
  /** shoulder-hip-knee angle: ~180 = upright torso, smaller = rounding/leaning forward. */
  torsoAngle: number
  /** Degrees the shoulder-hip segment itself has tipped away from vertical — a
   * torso-rounding-independent read on how much the whole trunk is leaning forward. */
  forwardLeanAngle: number
  heelLift: number
  stanceRatio: number
}

export const squatCycleThresholds: RepThresholds = { top: 160, bottom: 100 }

export function extractSquatMetrics(points: PosePoint[]): SquatMetrics | null {
  const required = [
    LM.leftShoulder, LM.rightShoulder, LM.leftHip, LM.rightHip,
    LM.leftKnee, LM.rightKnee, LM.leftAnkle, LM.rightAnkle,
  ]
  if (required.some((index) => !points[index])) {
    return null
  }

  const leftKneeAngle = getAngleFromPointSet(points, LM.leftHip, LM.leftKnee, LM.leftAnkle)
  const rightKneeAngle = getAngleFromPointSet(points, LM.rightHip, LM.rightKnee, LM.rightAnkle)

  const kneeGap = getDistance(points[LM.leftKnee], points[LM.rightKnee])
  const ankleGap = getDistance(points[LM.leftAnkle], points[LM.rightAnkle])
  const shoulderGap = getDistance(points[LM.leftShoulder], points[LM.rightShoulder])

  const shoulderMid = getMidpoint(points[LM.leftShoulder], points[LM.rightShoulder])
  const hipMid = getMidpoint(points[LM.leftHip], points[LM.rightHip])
  const kneeMid = getMidpoint(points[LM.leftKnee], points[LM.rightKnee])
  const torsoAngle = getAngle(shoulderMid, hipMid, kneeMid)

  // How far the shoulder-hip line itself has tipped from vertical (0° = perfectly
  // upright), independent of hip-flexion angle — atan2 of the horizontal vs vertical
  // shoulder-hip offset.
  const forwardLeanAngle = (Math.atan2(Math.abs(shoulderMid.x - hipMid.x), Math.abs(shoulderMid.y - hipMid.y)) * 180) / Math.PI

  const leftHeel = points[LM.leftHeel]
  const rightHeel = points[LM.rightHeel]
  const leftToe = points[LM.leftFootIndex]
  const rightToe = points[LM.rightFootIndex]
  const leftHeelLift = leftHeel && leftToe ? Math.abs(leftHeel.y - leftToe.y) : 0
  const rightHeelLift = rightHeel && rightToe ? Math.abs(rightHeel.y - rightToe.y) : 0

  return {
    kneeAngle: (leftKneeAngle + rightKneeAngle) / 2,
    leftKneeAngle,
    rightKneeAngle,
    kneeValgus: ankleGap - kneeGap,
    torsoAngle,
    forwardLeanAngle,
    heelLift: Math.max(leftHeelLift, rightHeelLift),
    stanceRatio: shoulderGap > 0.001 ? ankleGap / shoulderGap : 1,
  }
}

/** Which camera angle a check needs to be trustworthy — 'any' means both work. */
export type ViewRequirement = 'front' | 'side' | 'any'

type Candidate = ExerciseFeedback & { issue: CorrectionIssue | null; view: ViewRequirement }

// Granular checks shared between the classic squat and the plié/narrow squat variants
// (which have their own, different stance/turnout/verticality rules — see the other
// *SquatRules.ts files). Each one is tagged with the camera view it's reliable from,
// matching how a human coach would trust their own eyes: depth and back-rounding read
// best from the side, knee valgus and left/right symmetry read best from the front.

export function checkSquatDepth(metrics: SquatMetrics, phase: RepPhase): Candidate | null {
  if (phase === 'bottom' && metrics.kneeAngle > 110) {
    return { message: 'Недостатня глибина присіду', tone: 'soft', severity: 55, issue: 'shallowDepth', view: 'side' }
  }
  return null
}

export function checkKneeValgus(metrics: SquatMetrics, phase: RepPhase): Candidate | null {
  if (phase === 'bottom' && metrics.kneeValgus > 0.04) {
    return { message: 'Коліна завалюються всередину', tone: 'warning', severity: 92, issue: 'kneesCollapse', view: 'front' }
  }
  return null
}

export function checkTorsoRounding(metrics: SquatMetrics, phase: RepPhase): Candidate | null {
  if (phase !== 'bottom') {
    return null
  }
  if (metrics.torsoAngle < 130) {
    return { message: 'Спина округлилася', tone: 'warning', severity: 88, issue: 'roundedBack', view: 'side' }
  }
  if (metrics.torsoAngle > 200) {
    return { message: 'Не відкидайся назад', tone: 'warning', severity: 80, issue: 'leaningBack', view: 'side' }
  }
  return null
}

export function checkHeelLift(metrics: SquatMetrics, phase: RepPhase): Candidate | null {
  if ((phase === 'descending' || phase === 'bottom') && metrics.heelLift > 0.03) {
    return { message: 'П’яти відірвались від підлоги', tone: 'warning', severity: 75, issue: 'heelsUp', view: 'any' }
  }
  return null
}

export function checkTempo(cycleDurationMs: number): Candidate | null {
  if (cycleDurationMs > 0 && cycleDurationMs < 2000) {
    return { message: 'Занадто швидко, контролюй рух', tone: 'soft', severity: 45, issue: 'tooFast', view: 'any' }
  }
  return null
}

function checkSquatStance(metrics: SquatMetrics): Candidate | null {
  if (metrics.stanceRatio < 0.85) {
    return { message: 'Постав ноги ширше', tone: 'soft', severity: 40, issue: 'stanceNarrow', view: 'any' }
  }
  if (metrics.stanceRatio > 1.7) {
    return { message: 'Занадто широко для класичного присіду', tone: 'soft', severity: 40, issue: 'stanceWide', view: 'any' }
  }
  return null
}

/** Distinct from checkTorsoRounding: that one reads the shoulder-hip-knee angle (how
 * "open" the hip is), this one reads how far the shoulder-hip segment itself has tipped
 * off vertical — catches a squat that's turned into a stiff-legged "good morning" even
 * when the hip-angle-based rounding check doesn't fire. Only meaningful at the bottom,
 * where the lean is most pronounced. */
function checkForwardLean(metrics: SquatMetrics, phase: RepPhase): Candidate | null {
  if (phase !== 'bottom') {
    return null
  }
  if (metrics.forwardLeanAngle <= 30) {
    return null
  }
  const severity = 55 + Math.min(35, ((metrics.forwardLeanAngle - 30) / 30) * 35)
  return { message: 'Надмірний нахил корпуса вперед', tone: metrics.forwardLeanAngle > 45 ? 'warning' : 'soft', severity, issue: 'forwardLean', view: 'side' }
}

/**
 * Tracks how much the torso angle keeps dropping *after* a rep has already reached its
 * bottom phase — a proxy for "butt wink" (the pelvis tucking under right at full depth,
 * rounding the lower back), as opposed to the ordinary hip flexion every squat has on
 * the way down. Marked partial-detection: a real butt wink is a pelvis-tilt event, and
 * reading it off the shoulder-hip-knee angle alone can be fooled by camera angle or a
 * simply very deep (but clean) squat.
 */
export class BottomAngleDriftTracker {
  private bottomEntryAngle: number | null = null
  private wasBottom = false

  /** Returns how many degrees the angle has dropped since entering the bottom phase, or
   * null when not currently in the bottom phase. */
  observe(phase: RepPhase, torsoAngle: number): number | null {
    if (phase !== 'bottom') {
      this.bottomEntryAngle = null
      this.wasBottom = false
      return null
    }

    if (!this.wasBottom) {
      this.bottomEntryAngle = torsoAngle
      this.wasBottom = true
      return 0
    }

    return this.bottomEntryAngle !== null ? this.bottomEntryAngle - torsoAngle : null
  }

  reset(): void {
    this.bottomEntryAngle = null
    this.wasBottom = false
  }
}

function checkButtWink(bottomAngleDrift: number | null): Candidate | null {
  if (bottomAngleDrift === null || bottomAngleDrift <= 12) {
    return null
  }
  return {
    message: 'Поперек підкручується в нижній точці',
    tone: 'warning',
    severity: Math.min(90, 60 + bottomAngleDrift),
    issue: 'buttWink',
    view: 'side',
  }
}

function checkSquatSymmetry(metrics: SquatMetrics, phase: RepPhase): Candidate | null {
  if (phase !== 'top') {
    return null
  }
  const asymmetry = Math.abs(metrics.leftKneeAngle - metrics.rightKneeAngle)
  if (asymmetry > 15) {
    return { message: 'Нерівномірне навантаження на ноги', tone: 'soft', severity: 50, issue: 'asymmetric', view: 'front' }
  }
  return null
}

/**
 * Picks the most severe candidate, but only among checks that are trustworthy from the
 * camera's current angle — e.g. a "knees caving in" reading from a side-view camera is
 * noise, not signal, so it's filtered out rather than risking a wrong correction.
 */
export function pickWorstCandidate(candidates: Array<Candidate | null>, currentView: CameraView | null = null): Candidate {
  const visible = candidates.filter(
    (item): item is Candidate => item !== null && (currentView === null || item.view === 'any' || item.view === currentView),
  )
  const sorted = visible.sort((a, b) => b.severity - a.severity)
  return sorted[0] ?? { message: 'Форма правильна', tone: 'good', severity: 0, issue: null, view: 'any' }
}

/**
 * Evaluates squat form. `cycleDurationMs` should be the just-completed rep's
 * duration (pass 0 on every other frame) — tempo only makes sense to judge
 * once a full cycle has actually happened. `currentView` filters out checks
 * that aren't reliable from the detected camera angle. `bottomAngleDrift` comes from
 * a `BottomAngleDriftTracker` the caller keeps alive across frames (see
 * useDynamicExerciseAnalyzer.ts) — squat-classic only, hence it's optional.
 */
export function evaluateSquatRules(
  metrics: SquatMetrics,
  phase: RepPhase,
  cycleDurationMs = 0,
  currentView: CameraView | null = null,
  bottomAngleDrift: number | null = null,
): Candidate {
  return pickWorstCandidate([
    checkSquatDepth(metrics, phase),
    checkKneeValgus(metrics, phase),
    checkTorsoRounding(metrics, phase),
    checkForwardLean(metrics, phase),
    checkButtWink(bottomAngleDrift),
    checkHeelLift(metrics, phase),
    checkSquatStance(metrics),
    checkSquatSymmetry(metrics, phase),
    checkTempo(cycleDurationMs),
  ], currentView)
}
