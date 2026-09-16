import { useEffect, useRef, useState } from 'react'
import type { CalibrationBaseline, PosePoint } from '../types'

export function useCalibration(points: PosePoint[]) {
  const [isCalibrating, setIsCalibrating] = useState(false)
  const [baseline, setBaseline] = useState<CalibrationBaseline>({
    shoulderHeightDelta: 0,
    leftShoulderHeightDelta: 0,
    rightShoulderHeightDelta: 0,
  })
  const snapshotRef = useRef<number[]>([])

  useEffect(() => {
    if (!isCalibrating) {
      return
    }

    const sample = () => {
      const leftShoulder = points[11]
      const leftElbow = points[13]
      const rightShoulder = points[12]
      const rightElbow = points[14]

      if (!leftShoulder || !leftElbow || !rightShoulder || !rightElbow) {
        return
      }

      snapshotRef.current.push(leftShoulder.y - leftElbow.y)
      snapshotRef.current.push(rightShoulder.y - rightElbow.y)

      if (snapshotRef.current.length > 90) {
        snapshotRef.current.shift()
      }
    }

    const interval = window.setInterval(sample, 33)
    return () => window.clearInterval(interval)
  }, [isCalibrating, points])

  const startCalibration = () => {
    snapshotRef.current = []
    setIsCalibrating(true)
  }

  const finishCalibration = () => {
    setIsCalibrating(false)

    const values = snapshotRef.current
    const median = values.length > 0
      ? values.sort((a, b) => a - b)[Math.floor(values.length / 2)]
      : 0

    setBaseline({
      shoulderHeightDelta: median,
      leftShoulderHeightDelta: median,
      rightShoulderHeightDelta: median,
    })
  }

  return {
    isCalibrating,
    baseline,
    startCalibration,
    finishCalibration,
  }
}
