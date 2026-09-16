import { getAngle, getDistance, getMidpoint } from './angles'
import { LM } from './landmarks'
import { pickWorstCandidate } from './squatRules'
import type { RepThresholds } from '../repCounter'
import type { CorrectionIssue } from '../voice/sessionContext'
import type { ExerciseFeedback, PosePoint, RepPhase } from '../types'

export interface ForwardLungeMetrics {
  frontKneeAngle: number
  /** |frontKneeX - frontToeX| — how far the front knee has drifted past the toe. */
  kneeOverToeOffset: number
  /** How close the back knee has dropped to the front knee's height (small = good depth). */
  backKneeGap: number
  torsoAngle: number
  stepLength: number
  frontLegIsLeft: boolean
}

export const forwardLungeCycleThresholds: RepThresholds = { top: 160, bottom: 100 }

export function extractForwardLungeMetrics(points: PosePoint[]): ForwardLungeMetrics | null {
  const required = [
    LM.leftShoulder, LM.rightShoulder, LM.leftHip, LM.rightHip,
    LM.leftKnee, LM.rightKnee, LM.leftAnkle, LM.rightAnkle,
  ]
  if (required.some((index) => !points[index])) {
    return null
  }

  const hipMid = getMidpoint(points[LM.leftHip], points[LM.rightHip])

  // The stepped-forward leg's ankle sits noticeably further from the hip midline
  // (in the direction of the step) than the leg that stayed put — this holds
  // regardless of which way the person is facing the camera.
  const leftOffset = Math.abs(points[LM.leftAnkle].x - hipMid.x)
  const rightOffset = Math.abs(points[LM.rightAnkle].x - hipMid.x)
  const frontLegIsLeft = leftOffset >= rightOffset

  const front = frontLegIsLeft
    ? { hip: LM.leftHip, knee: LM.leftKnee, ankle: LM.leftAnkle, toe: LM.leftFootIndex }
    : { hip: LM.rightHip, knee: LM.rightKnee, ankle: LM.rightAnkle, toe: LM.rightFootIndex }
  const back = frontLegIsLeft
    ? { knee: LM.rightKnee }
    : { knee: LM.leftKnee }

  const frontKneeAngle = getAngle(points[front.hip], points[front.knee], points[front.ankle])
  const frontToe = points[front.toe]
  const kneeOverToeOffset = frontToe ? Math.abs(points[front.knee].x - frontToe.x) : 0
  const backKneeGap = Math.abs(points[back.knee].y - points[front.knee].y)

  const shoulderMid = getMidpoint(points[LM.leftShoulder], points[LM.rightShoulder])
  const torsoAngle = getAngle(shoulderMid, hipMid, points[front.knee])

  const stepLength = getDistance(points[LM.leftAnkle], points[LM.rightAnkle])

  return { frontKneeAngle, kneeOverToeOffset, backKneeGap, torsoAngle, stepLength, frontLegIsLeft }
}

/** Tracks which leg led the last few reps so we can nudge the user to alternate. */
export class LegAlternationTracker {
  private consecutiveSameLeg = 0
  private lastFrontLegIsLeft: boolean | null = null

  recordRep(frontLegIsLeft: boolean): void {
    if (this.lastFrontLegIsLeft === frontLegIsLeft) {
      this.consecutiveSameLeg += 1
    } else {
      this.consecutiveSameLeg = 1
    }
    this.lastFrontLegIsLeft = frontLegIsLeft
  }

  get streak(): number {
    return this.consecutiveSameLeg
  }

  reset(): void {
    this.consecutiveSameLeg = 0
    this.lastFrontLegIsLeft = null
  }
}

type Candidate = ExerciseFeedback & { issue: CorrectionIssue | null; view: 'front' | 'side' | 'any' }

export function evaluateForwardLungeRules(
  metrics: ForwardLungeMetrics,
  phase: RepPhase,
  sameLegStreak: number,
): Candidate {
  const candidates: Array<Candidate | null> = []

  if (phase === 'bottom') {
    if (metrics.frontKneeAngle < 70) {
      candidates.push({ message: 'Коліно надто глибоко, тримай 90 градусів', tone: 'warning', severity: 78, issue: 'kneeOverToe', view: 'any' })
    } else if (metrics.frontKneeAngle > 110) {
      candidates.push({ message: 'Не досідаєш, нижче', tone: 'soft', severity: 50, issue: 'shortStep', view: 'any' })
    }

    if (metrics.kneeOverToeOffset > 0.05) {
      candidates.push({ message: 'Коліно виходить за носок, крок довше', tone: 'warning', severity: 85, issue: 'kneeOverToe', view: 'any' })
    }

    if (metrics.backKneeGap > 0.15) {
      candidates.push({ message: 'Опускайся нижче, заднє коліно до підлоги', tone: 'soft', severity: 55, issue: 'backKneeTooHigh', view: 'any' })
    }

    if (metrics.torsoAngle < 150) {
      candidates.push({ message: 'Тримай корпус вертикально', tone: 'soft', severity: 60, issue: 'lungeLeaningForward', view: 'any' })
    }
  }

  if (metrics.stepLength < 0.15) {
    candidates.push({ message: 'Крок довше', tone: 'soft', severity: 42, issue: 'shortStep', view: 'any' })
  }

  if (sameLegStreak > 3) {
    candidates.push({ message: 'Не забувай чергувати ноги', tone: 'soft', severity: 38, issue: 'notAlternating', view: 'any' })
  }

  return pickWorstCandidate(candidates)
}
