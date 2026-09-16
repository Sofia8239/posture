import { getAngle } from '../utils/geometry'
import type { ExerciseFeedback, PosePoint } from './types'

export interface SquatAnalysis {
  leftAngle: number
  rightAngle: number
  reps: number
  feedback: ExerciseFeedback
  isDeepEnough: boolean
  isKneeForward: boolean
}

export function analyzeSquat(
  points: PosePoint[],
  reps: number,
): SquatAnalysis {
  const leftHip = points[23]
  const leftKnee = points[25]
  const leftAnkle = points[27]
  const rightHip = points[24]
  const rightKnee = points[26]
  const rightAnkle = points[28]

  const leftAngle = leftHip && leftKnee && leftAnkle ? getAngle(leftHip, leftKnee, leftAnkle) : 0
  const rightAngle = rightHip && rightKnee && rightAnkle ? getAngle(rightHip, rightKnee, rightAnkle) : 0

  const leftKneeForward = leftKnee && leftAnkle ? leftKnee.x > leftAnkle.x + 0.03 : false
  const rightKneeForward = rightKnee && rightAnkle ? rightKnee.x > rightAnkle.x + 0.03 : false

  const isDeepEnough = leftAngle < 90 && rightAngle < 90
  const isKneeForward = leftKneeForward || rightKneeForward

  const feedback: ExerciseFeedback = isKneeForward
    ? { message: 'Коліна не виходять за носки', tone: 'warning' }
    : isDeepEnough
      ? { message: 'Присідай глибше', tone: 'hint' }
      : { message: 'Форма правильна', tone: 'good' }

  return {
    leftAngle,
    rightAngle,
    reps,
    feedback,
    isDeepEnough,
    isKneeForward,
  }
}
