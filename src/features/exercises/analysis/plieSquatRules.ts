import { getDistance } from './angles'
import { LM } from './landmarks'
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

export interface PlieSquatMetrics extends SquatMetrics {
  /** Average lateral toe offset from the ankle, relative to shin length — a rough proxy for turnout. */
  toeTurnoutRatio: number
}

export const plieSquatCycleThresholds: RepThresholds = squatCycleThresholds

export function extractPlieSquatMetrics(points: PosePoint[]): PlieSquatMetrics | null {
  const base = extractSquatMetrics(points)
  if (!base) {
    return null
  }

  const turnoutFor = (knee: number, ankle: number, toe: number): number | null => {
    if (!points[knee] || !points[ankle] || !points[toe]) {
      return null
    }
    const shinLength = getDistance(points[knee], points[ankle])
    if (shinLength < 0.001) {
      return null
    }
    return Math.abs(points[toe].x - points[ankle].x) / shinLength
  }

  const leftTurnout = turnoutFor(LM.leftKnee, LM.leftAnkle, LM.leftFootIndex)
  const rightTurnout = turnoutFor(LM.rightKnee, LM.rightAnkle, LM.rightFootIndex)
  const turnoutValues = [leftTurnout, rightTurnout].filter((value): value is number => value !== null)
  const toeTurnoutRatio = turnoutValues.length > 0 ? turnoutValues.reduce((a, b) => a + b, 0) / turnoutValues.length : 0

  return { ...base, toeTurnoutRatio }
}

type Candidate = ExerciseFeedback & { issue: CorrectionIssue | null; view: 'front' | 'side' | 'any' }

function checkPlieStance(metrics: PlieSquatMetrics): Candidate | null {
  if (metrics.stanceRatio < 1.5) {
    return { message: 'Недостатньо широка постановка для пліє', tone: 'soft', severity: 45, issue: 'plieNarrowStance', view: 'any' }
  }
  return null
}

function checkToesTurnedOut(metrics: PlieSquatMetrics): Candidate | null {
  if (metrics.toeTurnoutRatio < 0.3) {
    return { message: 'Розверни носки в сторони, це пліє', tone: 'soft', severity: 42, issue: 'plieToesNotTurned', view: 'front' }
  }
  return null
}

function checkPlieVerticality(metrics: PlieSquatMetrics, phase: RepPhase): Candidate | null {
  if (phase === 'bottom' && metrics.torsoAngle >= 130 && metrics.torsoAngle < 150) {
    return { message: 'Тримай корпус вертикальніше', tone: 'soft', severity: 58, issue: 'plieLeaningForward', view: 'side' }
  }
  return null
}

export function evaluatePlieSquatRules(metrics: PlieSquatMetrics, phase: RepPhase, cycleDurationMs = 0, currentView: CameraView | null = null): Candidate {
  return pickWorstCandidate([
    checkSquatDepth(metrics, phase),
    checkKneeValgus(metrics, phase),
    checkTorsoRounding(metrics, phase),
    checkPlieVerticality(metrics, phase),
    checkHeelLift(metrics, phase),
    checkPlieStance(metrics),
    checkToesTurnedOut(metrics),
    checkTempo(cycleDurationMs),
  ], currentView)
}
