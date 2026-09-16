import type { PosePoint } from '../exercises/types'

const POSE_CONNECTIONS: Array<[number, number]> = [
  [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8],
  [9, 10], [11, 12], [11, 13], [13, 15], [15, 17], [17, 19], [19, 21],
  [12, 14], [14, 16], [16, 18], [18, 20], [20, 22], [11, 23], [12, 24],
  [23, 24], [23, 25], [24, 26], [25, 27], [26, 28], [27, 29], [28, 30],
  [29, 31], [30, 32], [31, 32], [27, 28], [25, 26],
]

export function drawPoseOverlay(
  ctx: CanvasRenderingContext2D,
  points: PosePoint[],
  width: number,
  height: number,
): void {
  ctx.clearRect(0, 0, width, height)

  ctx.strokeStyle = '#FFB4A2'
  ctx.lineWidth = 2
  ctx.lineCap = 'round'

  for (const [startIndex, endIndex] of POSE_CONNECTIONS) {
    const start = points[startIndex]
    const end = points[endIndex]

    if (!start || !end) {
      continue
    }

    ctx.beginPath()
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(end.x, end.y)
    ctx.stroke()
  }

  for (const point of points) {
    if (!point) {
      continue
    }

    ctx.fillStyle = '#D6006E'
    ctx.beginPath()
    ctx.arc(point.x, point.y, 3.5, 0, Math.PI * 2)
    ctx.fill()
  }
}
