import { getAngleFromPointSet, getDistance } from './angles'
import { LM } from './landmarks'
import { pickWorstCandidate } from './squatRules'
import type { RepThresholds } from '../repCounter'
import type { CorrectionIssue } from '../voice/sessionContext'
import type { ExerciseFeedback, PosePoint, RepPhase } from '../types'

export interface SideLungeMetrics {
  /** Knee angle of the leg that is bending this rep (whichever knee angle is smaller). */
  bentKneeAngle: number
  /** Knee angle of the other leg, which should stay close to straight. */
  straightLegAngle: number
  /** ankleGap - kneeGap: positive means the knees have drifted inward relative to the ankles. */
  kneeValgus: number
}

export const sideLungeCycleThresholds: RepThresholds = { top: 160, bottom: 105 }

export function extractSideLungeMetrics(points: PosePoint[]): SideLungeMetrics | null {
  const required = [LM.leftHip, LM.rightHip, LM.leftKnee, LM.rightKnee, LM.leftAnkle, LM.rightAnkle]
  if (required.some((index) => !points[index])) {
    return null
  }

  const leftKneeAngle = getAngleFromPointSet(points, LM.leftHip, LM.leftKnee, LM.leftAnkle)
  const rightKneeAngle = getAngleFromPointSet(points, LM.rightHip, LM.rightKnee, LM.rightAnkle)

  const kneeGap = getDistance(points[LM.leftKnee], points[LM.rightKnee])
  const ankleGap = getDistance(points[LM.leftAnkle], points[LM.rightAnkle])

  return {
    bentKneeAngle: Math.min(leftKneeAngle, rightKneeAngle),
    straightLegAngle: Math.max(leftKneeAngle, rightKneeAngle),
    kneeValgus: ankleGap - kneeGap,
  }
}

type Candidate = ExerciseFeedback & { issue: CorrectionIssue | null; view: 'front' | 'side' | 'any' }

export function evaluateSideLungeRules(metrics: SideLungeMetrics, phase: RepPhase): Candidate {
  const candidates: Array<Candidate | null> = []

  if (phase === 'bottom') {
    if (metrics.bentKneeAngle > 120) {
      candidates.push({ message: 'Згинай робочу ногу глибше', tone: 'soft', severity: 55, issue: 'sideLungeShallow', view: 'any' })
    }

    if (metrics.straightLegAngle < 160) {
      candidates.push({ message: 'Тримай іншу ногу прямою', tone: 'warning', severity: 70, issue: 'sideLungeStraightLeg', view: 'any' })
    }

    if (metrics.kneeValgus > 0.04) {
      candidates.push({ message: 'Коліно завалюється всередину', tone: 'warning', severity: 88, issue: 'kneesCollapse', view: 'any' })
    }
  }

  return pickWorstCandidate(candidates)
}
