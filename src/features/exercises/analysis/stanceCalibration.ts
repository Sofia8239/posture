import { getAngle, getDistance, getMidpoint } from './angles'
import { LM } from './landmarks'
import { extractSquatMetrics } from './squatRules'
import { extractPlieSquatMetrics } from './plieSquatRules'
import { extractGluteBridgeMetrics } from './gluteBridgeRules'
import type { ExerciseId, PosePoint } from '../types'

export type CalibrationStepId = 'visible' | 'stanceWidth' | 'toeTurnout' | 'posture' | 'distance' | 'lyingFlat'

export interface CalibrationStep {
  id: CalibrationStepId
  label: string
  passed: boolean
  /** Spoken once while this step is the thing currently blocking progress. */
  hint: string
}

const REQUIRED_LANDMARKS = [
  LM.leftShoulder, LM.rightShoulder, LM.leftHip, LM.rightHip,
  LM.leftKnee, LM.rightKnee, LM.leftAnkle, LM.rightAnkle,
]

function isVisible(point: PosePoint | undefined): boolean {
  return !!point && (point.visibility ?? 1) > 0.6
}

function checkFullyVisible(points: PosePoint[]): boolean {
  return REQUIRED_LANDMARKS.every((index) => isVisible(points[index]))
}

/** Expected stance-width ratio (ankle spread / shoulder spread) per squat variant. */
const STANCE_RANGES: Partial<Record<ExerciseId, [number, number]>> = {
  squat: [0.85, 1.7],
  'plie-squat': [1.5, 2.4],
  'narrow-squat': [0, 0.35],
}

function checkStanceWidth(points: PosePoint[], exerciseId: ExerciseId): boolean | null {
  const range = STANCE_RANGES[exerciseId]
  if (!range) {
    return null
  }
  const metrics = extractSquatMetrics(points)
  if (!metrics) {
    return false
  }
  return metrics.stanceRatio >= range[0] && metrics.stanceRatio <= range[1]
}

function checkToeTurnout(points: PosePoint[], exerciseId: ExerciseId): boolean | null {
  if (exerciseId !== 'plie-squat') {
    return null
  }
  const metrics = extractPlieSquatMetrics(points)
  return metrics ? metrics.toeTurnoutRatio >= 0.3 : false
}

function checkPosture(points: PosePoint[]): boolean {
  const shoulderMid = points[LM.leftShoulder] && points[LM.rightShoulder] ? getMidpoint(points[LM.leftShoulder], points[LM.rightShoulder]) : null
  const hipMid = points[LM.leftHip] && points[LM.rightHip] ? getMidpoint(points[LM.leftHip], points[LM.rightHip]) : null
  const kneeMid = points[LM.leftKnee] && points[LM.rightKnee] ? getMidpoint(points[LM.leftKnee], points[LM.rightKnee]) : null
  if (!shoulderMid || !hipMid || !kneeMid) {
    return false
  }
  const torsoAngle = getAngle(shoulderMid, hipMid, kneeMid)
  return torsoAngle >= 165 && torsoAngle <= 195
}

function checkDistance(points: PosePoint[]): boolean {
  const shoulderMid = points[LM.leftShoulder] && points[LM.rightShoulder] ? getMidpoint(points[LM.leftShoulder], points[LM.rightShoulder]) : null
  const ankleMid = points[LM.leftAnkle] && points[LM.rightAnkle] ? getMidpoint(points[LM.leftAnkle], points[LM.rightAnkle]) : null
  if (!shoulderMid || !ankleMid) {
    return false
  }
  const bodyHeight = Math.abs(shoulderMid.y - ankleMid.y)
  // Too small = standing too far away to read joint angles reliably; too large = cropped, too close.
  return bodyHeight >= 0.35 && bodyHeight <= 0.9
}

/** Lying-down equivalent of checkDistance: the body's long axis reads along x (shoulder
 * to ankle), not y, once the person is on the floor filmed from the side. */
function checkLyingDistance(points: PosePoint[]): boolean {
  const shoulderMid = points[LM.leftShoulder] && points[LM.rightShoulder] ? getMidpoint(points[LM.leftShoulder], points[LM.rightShoulder]) : null
  const ankleMid = points[LM.leftAnkle] && points[LM.rightAnkle] ? getMidpoint(points[LM.leftAnkle], points[LM.rightAnkle]) : null
  if (!shoulderMid || !ankleMid) {
    return false
  }
  const bodySpan = Math.abs(shoulderMid.x - ankleMid.x)
  return bodySpan >= 0.3 && bodySpan <= 0.9
}

/** Confirms the resting start position — lying down, hips on the floor, knees bent —
 * before counting reps. Replaces checkPosture (which expects a standing torso line and
 * would never pass while lying with bent knees). */
function checkLyingFlat(points: PosePoint[]): boolean {
  const metrics = extractGluteBridgeMetrics(points)
  return metrics !== null && metrics.hipAngle <= 130
}

/** Feet roughly hip-width apart — ankleGap close to hipGap, unlike the squat family's
 * ankle-vs-shoulder ratio (shoulders aren't a useful reference while lying down). */
function checkGluteBridgeStance(points: PosePoint[]): boolean {
  const hip = points[LM.leftHip] && points[LM.rightHip] ? getDistance(points[LM.leftHip], points[LM.rightHip]) : null
  const ankle = points[LM.leftAnkle] && points[LM.rightAnkle] ? getDistance(points[LM.leftAnkle], points[LM.rightAnkle]) : null
  if (!hip || !ankle || hip < 0.001) {
    return false
  }
  const ratio = ankle / hip
  return ratio >= 0.7 && ratio <= 1.6
}

/**
 * Runs the full pre-set checklist a squat-family exercise needs before counting reps.
 * Each step is independent so the UI can show a live checklist, and voice guidance can
 * name exactly what's still wrong instead of a generic "hold still, please".
 */
export function evaluateCalibrationSteps(points: PosePoint[], exerciseId: ExerciseId): CalibrationStep[] {
  if (exerciseId === 'glute-bridge') {
    return [
      {
        id: 'visible',
        label: 'Тебе повністю видно',
        passed: checkFullyVisible(points),
        hint: 'Ляж боком до камери на відстані півтора-два метри, щоб я бачила тебе повністю — від плечей до стоп.',
      },
      {
        id: 'distance',
        label: 'Відстань до камери',
        passed: checkLyingDistance(points),
        hint: 'Трохи скоригуй відстань, щоб тіло займало більшу частину кадру вздовж екрана.',
      },
      {
        id: 'lyingFlat',
        label: 'Стартова позиція',
        passed: checkLyingFlat(points),
        hint: 'Ляж на спину, зігни коліна, стопи постав на підлогу — таз поки на підлозі.',
      },
      {
        id: 'stanceWidth',
        label: 'Ширина ніг',
        passed: checkGluteBridgeStance(points),
        hint: 'Постав стопи на ширину стегон.',
      },
    ]
  }

  const steps: CalibrationStep[] = [
    {
      id: 'visible',
      label: 'Тебе повністю видно',
      passed: checkFullyVisible(points),
      hint: 'Стань перед камерою на відстані двох-трьох метрів, щоб я бачила тебе повністю — від голови до стоп.',
    },
    {
      id: 'distance',
      label: 'Відстань до камери',
      passed: checkDistance(points),
      hint: 'Трохи скоригуй відстань — відійди або підійди ближче, щоб тіло займало більшу частину кадру.',
    },
    {
      id: 'posture',
      label: 'Постава корпусу',
      passed: checkPosture(points),
      hint: 'Розправ плечі й стань рівно, як струна — плечі над стегнами, без нахилу.',
    },
  ]

  const stanceWidth = checkStanceWidth(points, exerciseId)
  if (stanceWidth !== null) {
    steps.push({
      id: 'stanceWidth',
      label: 'Ширина ніг',
      passed: stanceWidth,
      hint:
        exerciseId === 'plie-squat'
          ? 'Постав ноги значно ширше за плечі, приблизно в півтора-два рази.'
          : exerciseId === 'narrow-squat'
            ? 'Постав ноги майже разом, на відстані п’ять-десять сантиметрів.'
            : 'Постав ноги на ширину плечей.',
    })
  }

  const toeTurnout = checkToeTurnout(points, exerciseId)
  if (toeTurnout !== null) {
    steps.push({
      id: 'toeTurnout',
      label: 'Розворот носків',
      passed: toeTurnout,
      hint: 'Розверни носки в сторони, приблизно на тридцять-сорок п’ять градусів.',
    })
  }

  return steps
}
