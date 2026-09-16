import { getAngle } from '../utils/geometry'
import type { ExerciseFeedback, PosePoint } from './types'

export interface PlankAnalysis {
  angle: number
  feedback: ExerciseFeedback
  isInPosition: boolean
  holdSeconds: number
}

export function analyzePlank(
  points: PosePoint[],
  holdSeconds: number,
): PlankAnalysis {
  const shoulder = points[11]
  const hip = points[12]
  const ankle = points[14]

  if (!shoulder || !hip || !ankle) {
    return {
      angle: 0,
      isInPosition: false,
      holdSeconds,
      feedback: {
        message: 'Відсунься, будь ласка, щоб я бачив тебе повністю',
        tone: 'warning',
      },
    }
  }

  const angle = getAngle(shoulder, hip, ankle)

  if (angle < 160) {
    return {
      angle,
      isInPosition: false,
      holdSeconds,
      feedback: {
        message: 'Підніми таз',
        tone: 'hint',
      },
    }
  }

  if (angle > 200) {
    return {
      angle,
      isInPosition: false,
      holdSeconds,
      feedback: {
        message: 'Опусти таз',
        tone: 'hint',
      },
    }
  }

  return {
    angle,
    isInPosition: true,
    holdSeconds,
    feedback: {
      message: 'Форма правильна',
      tone: 'good',
    },
  }
}
