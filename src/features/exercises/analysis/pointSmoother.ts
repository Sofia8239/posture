import type { PosePoint } from '../types'

const WINDOW = 4

/**
 * Rolling average of the last few frames' landmark positions — used only for the
 * cosmetic muscle-overlay render, to damp per-frame MediaPipe jitter. Pose-rule
 * detection (rep counting, angle checks) stays on raw per-frame points elsewhere so
 * correction feedback isn't delayed by this smoothing.
 */
export class PointSmoother {
  private history: PosePoint[][] = []

  smooth(points: PosePoint[]): PosePoint[] {
    this.history.push(points)
    if (this.history.length > WINDOW) {
      this.history.shift()
    }

    return points.map((point, index) => {
      if (!point) {
        return point
      }
      let sumX = 0
      let sumY = 0
      let count = 0
      for (const frame of this.history) {
        const framePoint = frame[index]
        if (framePoint) {
          sumX += framePoint.x
          sumY += framePoint.y
          count += 1
        }
      }
      return count > 0 ? { ...point, x: sumX / count, y: sumY / count } : point
    })
  }

  reset(): void {
    this.history = []
  }
}
