import type { PosePoint } from '../types'

export function getAngle(a: PosePoint, b: PosePoint, c: PosePoint): number {
  const ab = { x: a.x - b.x, y: a.y - b.y }
  const cb = { x: c.x - b.x, y: c.y - b.y }

  const dot = ab.x * cb.x + ab.y * cb.y
  const abLength = Math.hypot(ab.x, ab.y)
  const cbLength = Math.hypot(cb.x, cb.y)

  if (abLength === 0 || cbLength === 0) {
    return 0
  }

  const cosine = dot / (abLength * cbLength)
  const clamped = Math.max(-1, Math.min(1, cosine))
  return Number((Math.acos(clamped) * (180 / Math.PI)).toFixed(1))
}

export function getMedian(values: number[]): number {
  if (values.length === 0) {
    return 0
  }

  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2
  }

  return sorted[middle]
}

export function getAngleFromPointSet(points: PosePoint[], indexA: number, indexB: number, indexC: number): number {
  const a = points[indexA]
  const b = points[indexB]
  const c = points[indexC]

  if (!a || !b || !c) {
    return 0
  }

  return getAngle(a, b, c)
}

export function getDistance(a: PosePoint, b: PosePoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export function getMidpoint(a: PosePoint, b: PosePoint): PosePoint {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}
