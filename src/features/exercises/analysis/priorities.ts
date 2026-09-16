import type { PlankFeedback } from '../types'

const priorityOrder = [
  'tilt_hard',
  'tilt_raised',
  'elbows',
  'neck',
  'shoulders',
  'tilt_soft',
  'neck_soft',
  'elbows_soft',
]

function pickByPriority(feedback: PlankFeedback[], fallback: PlankFeedback): PlankFeedback {
  const sorted = [...feedback].sort((left, right) => right.severity - left.severity)
  const first = sorted[0]
  return first ?? fallback
}

export function chooseRelevantFeedback(feedbacks: PlankFeedback[]): PlankFeedback {
  const fallback: PlankFeedback = {
    message: 'Форма правильна',
    tone: 'good',
    severity: 0,
  }

  const ordered = feedbacks.filter((item) => item.message.trim().length > 0)
  return pickByPriority(ordered, fallback)
}

export function getPriorityKey(message: string): string {
  const normalized = message.toLowerCase().trim()

  if (normalized.includes('підніми таз') || normalized.includes('не прогинайся')) {
    return 'tilt_hard'
  }

  if (normalized.includes('опусти таз')) {
    return 'tilt_raised'
  }

  if (normalized.includes('лікті')) {
    return 'elbows'
  }

  if (normalized.includes('голова') || normalized.includes('шия')) {
    return 'neck'
  }

  if (normalized.includes('плечах')) {
    return 'shoulders'
  }

  return 'good'
}

export function getPriorityRank(message: string): number {
  const key = getPriorityKey(message)
  return priorityOrder.indexOf(key) + 1
}
