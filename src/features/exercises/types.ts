export type Tone = 'good' | 'soft' | 'warning'

export type LandmarkVisibility = {
  visibility?: number
}

export interface PosePoint {
  x: number
  y: number
  z?: number
  visibility?: number
}

export interface PlankMetrics {
  hipAngle: number
  leftShoulderX: number
  rightShoulderX: number
  leftElbowX: number
  rightElbowX: number
  neckAngle: number
  leftShoulderHeightDelta: number
  rightShoulderHeightDelta: number
  footSpread: number
  shoulderSpread: number
}

export interface PlankFeedback {
  message: string
  tone: Tone
  severity: number
}

export interface CalibrationBaseline {
  shoulderHeightDelta: number
  leftShoulderHeightDelta: number
  rightShoulderHeightDelta: number
}

export type ExerciseId = 'plank' | 'squat' | 'plie-squat' | 'narrow-squat' | 'forward-lunge' | 'side-lunge' | 'glute-bridge'

export type ExerciseKind = 'static' | 'dynamic'

/** Phases of one rep cycle for dynamic exercises: top -> descending -> bottom -> ascending -> top (+1 rep). */
export type RepPhase = 'top' | 'descending' | 'bottom' | 'ascending'

/** Same shape as PlankFeedback — kept as a separate name so new exercise code doesn't read "Plank" everywhere. */
export type ExerciseFeedback = PlankFeedback
