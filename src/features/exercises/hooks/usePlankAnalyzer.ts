import { useEffect, useRef, useState } from 'react'
import { getAngleFromPointSet, getDistance } from '../analysis/angles'
import { evaluatePlankRules } from '../analysis/rules'
import { stabilizeAngle } from '../analysis/stabilizer'
import type { CalibrationBaseline, PlankFeedback, PlankMetrics, PosePoint } from '../types'

export function usePlankAnalyzer(points: PosePoint[], baseline: CalibrationBaseline) {
  const [feedback, setFeedback] = useState<PlankFeedback>({
    message: 'Тримай стартову позицію 3 секунди — я запам’ятаю твою форму',
    tone: 'soft',
    severity: 0,
  })
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [goodSeconds, setGoodSeconds] = useState(0)
  const [badSeconds, setBadSeconds] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const lastFeedbackAtRef = useRef(0)
  const holdStartRef = useRef<number | null>(null)
  const angleBufferRef = useRef<number[]>(Array.from({ length: 10 }, () => 170))
  const neckBufferRef = useRef<number[]>(Array.from({ length: 10 }, () => 170))
  const lastSeverityRef = useRef(0)

  useEffect(() => {
    if (!isActive) {
      return
    }

    const timer = window.setInterval(() => {
      setTimerSeconds((current) => current + 1)
      setGoodSeconds((current) => current + (feedback.tone === 'good' ? 1 : 0))
      setBadSeconds((current) => current + (feedback.tone !== 'good' ? 1 : 0))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [feedback.tone, isActive])

  useEffect(() => {
    const leftShoulder = points[11]
    const rightShoulder = points[12]
    const leftHip = points[23]
    const rightHip = points[24]
    const leftAnkle = points[27]
    const rightAnkle = points[28]
    const leftElbow = points[13]
    const rightElbow = points[14]
    const leftEar = points[7]
    const rightEar = points[8]

    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip || !leftAnkle || !rightAnkle || !leftElbow || !rightElbow) {
      return
    }

    const leftHipAngle = getAngleFromPointSet(points, 11, 23, 27)
    const rightHipAngle = getAngleFromPointSet(points, 12, 24, 28)
    const hipAngle = (leftHipAngle + rightHipAngle) / 2
    const neckAngle = getAngleFromPointSet(points, 7, 11, 23)

    const leftShoulderHeightDelta = leftShoulder.y - leftElbow.y
    const rightShoulderHeightDelta = rightShoulder.y - rightElbow.y

    const shoulderSpread = getDistance(leftShoulder, rightShoulder)
    const footSpread = getDistance(leftAnkle, rightAnkle)

    const stabilizedHipAngle = stabilizeAngle(angleBufferRef.current, hipAngle)
    const stabilizedNeckAngle = stabilizeAngle(neckBufferRef.current, neckAngle)

    const metrics: PlankMetrics = {
      hipAngle: stabilizedHipAngle,
      leftShoulderX: leftShoulder.x,
      rightShoulderX: rightShoulder.x,
      leftElbowX: leftElbow.x,
      rightElbowX: rightElbow.x,
      neckAngle: stabilizedNeckAngle,
      leftShoulderHeightDelta,
      rightShoulderHeightDelta,
      footSpread,
      shoulderSpread,
    }

    const nextFeedback = evaluatePlankRules(metrics, baseline)
    const now = performance.now()
    const shouldUpdate = now - lastFeedbackAtRef.current > 250
    const shouldHold = now - lastFeedbackAtRef.current < 1500

    if (nextFeedback.severity >= 90 && shouldUpdate) {
      setFeedback(nextFeedback)
      lastFeedbackAtRef.current = now
      lastSeverityRef.current = nextFeedback.severity
    } else if (nextFeedback.severity < 90 && !shouldHold && shouldUpdate) {
      setFeedback(nextFeedback)
      lastFeedbackAtRef.current = now
    }

    if (nextFeedback.message.includes('Форма правильна')) {
      if (holdStartRef.current === null) {
        holdStartRef.current = performance.now()
      }

      const holdSeconds = Math.floor((performance.now() - holdStartRef.current) / 1000)
      if (holdSeconds >= 30) {
        setIsCompleted(true)
        setIsActive(false)
      }
    } else {
      holdStartRef.current = null
    }

    if (leftEar && rightEar) {
      const neckAngleVector = getAngleFromPointSet(points, 7, 11, 23)
      if (neckAngleVector < 140) {
        setFeedback({
          message: 'Не задирай голову',
          tone: 'warning',
          severity: 82,
        })
      }
    }
  }, [baseline, isActive, points])

  const resetStats = () => {
    setTimerSeconds(0)
    setGoodSeconds(0)
    setBadSeconds(0)
  }

  return {
    feedback,
    timerSeconds,
    goodSeconds,
    badSeconds,
    isActive,
    setIsActive,
    isCompleted,
    setIsCompleted,
    resetStats,
  }
}
