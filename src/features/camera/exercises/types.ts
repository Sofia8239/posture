export type ExerciseId = 'plank' | 'squat'

export interface ExerciseFeedback {
  message: string
  tone: 'good' | 'hint' | 'warning'
}

export interface PosePoint {
  x: number
  y: number
  visibility?: number
}
