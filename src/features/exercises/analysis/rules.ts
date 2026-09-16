import type { CalibrationBaseline, PlankFeedback, PlankMetrics } from '../types'
import { chooseRelevantFeedback } from './priorities'

export function evaluatePlankRules(
  metrics: PlankMetrics,
  baseline: CalibrationBaseline,
): PlankFeedback {
  const feedbacks: PlankFeedback[] = []

  const hipAngle = metrics.hipAngle
  if (hipAngle > 200) {
    feedbacks.push({
      message: 'Підніми таз, не прогинайся в попереку',
      tone: 'warning',
      severity: 100,
    })
  } else if (hipAngle < 160) {
    feedbacks.push({
      message: 'Опусти таз, тримай тіло прямо',
      tone: 'warning',
      severity: 95,
    })
  } else if (hipAngle >= 160 && hipAngle < 170) {
    feedbacks.push({
      message: 'Опусти таз нижче',
      tone: 'soft',
      severity: 70,
    })
  } else if (hipAngle > 190 && hipAngle <= 200) {
    feedbacks.push({
      message: 'Підніми таз',
      tone: 'soft',
      severity: 68,
    })
  } else {
    feedbacks.push({
      message: 'Форма правильна',
      tone: 'good',
      severity: 0,
    })
  }

  const elbowDx = Math.max(Math.abs(metrics.leftElbowX - metrics.leftShoulderX), Math.abs(metrics.rightElbowX - metrics.rightShoulderX))
  if (elbowDx >= 0.1) {
    feedbacks.push({
      message: 'Лікті не під плечима — це навантажує суглоби',
      tone: 'warning',
      severity: 90,
    })
  } else if (elbowDx >= 0.05) {
    feedbacks.push({
      message: 'Постав лікті чітко під плечима',
      tone: 'soft',
      severity: 60,
    })
  }

  if (metrics.neckAngle < 140) {
    feedbacks.push({
      message: 'Не задирай голову',
      tone: 'warning',
      severity: 82,
    })
  } else if (metrics.neckAngle < 160) {
    feedbacks.push({
      message: 'Дивись у підлогу перед собою, шия — продовження хребта',
      tone: 'soft',
      severity: 55,
    })
  }

  const shoulderDeltaLeft = metrics.leftShoulderHeightDelta - baseline.leftShoulderHeightDelta
  const shoulderDeltaRight = metrics.rightShoulderHeightDelta - baseline.rightShoulderHeightDelta

  if (shoulderDeltaLeft < -0.03 || shoulderDeltaRight < -0.03) {
    feedbacks.push({
      message: 'Не провисай у плечах, відштовхуйся від підлоги',
      tone: 'warning',
      severity: 78,
    })
  }

  const footSpreadRatio = metrics.footSpread / Math.max(metrics.shoulderSpread, 0.001)
  if (footSpreadRatio < 0.85) {
    feedbacks.push({
      message: 'Стійка: стопи разом',
      tone: 'good',
      severity: 0,
    })
  } else {
    feedbacks.push({
      message: 'Стійка: стопи на ширині плечей',
      tone: 'good',
      severity: 0,
    })
  }

  return chooseRelevantFeedback(feedbacks)
}
