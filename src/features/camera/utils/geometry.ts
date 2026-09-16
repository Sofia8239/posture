import type { PosePoint } from '../exercises/types'

export function getDistance(a: PosePoint, b: PosePoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export function getAngle(
  a: PosePoint,
  b: PosePoint,
  c: PosePoint,
): number {
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
  const angle = Math.acos(clamped) * (180 / Math.PI)

  return Number(angle.toFixed(1))
}

export function isPointVisible(point?: PosePoint): boolean {
  return Boolean(point && point.visibility !== 0)
}
