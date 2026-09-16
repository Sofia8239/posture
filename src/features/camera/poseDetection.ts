import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision'
import type { PosePoint } from './exercises/types'

export interface PoseDetectionLoopResult {
  points: PosePoint[]
  isFullBodyVisible: boolean
}

const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task'

const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'

export async function createPoseLandmarker(): Promise<PoseLandmarker> {
  const vision = await FilesetResolver.forVisionTasks(WASM_URL)

  return PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: MODEL_URL,
      delegate: 'GPU',
    },
    runningMode: 'VIDEO',
    numPoses: 1,
  })
}

export function mapLandmarksToPoints(
  landmarks: Array<{ x: number; y: number; visibility?: number }> = [],
): PosePoint[] {
  return landmarks.map((point) => ({
    x: point.x,
    y: point.y,
    visibility: point.visibility,
  }))
}

export function isFullBodyVisible(points: PosePoint[]): boolean {
  const hasHead = Boolean(points[0]?.visibility !== 0)
  const hasShoulders = Boolean(points[11]?.visibility !== 0 && points[12]?.visibility !== 0)
  const hasHips = Boolean(points[23]?.visibility !== 0 && points[24]?.visibility !== 0)
  const hasFeet = Boolean(points[27]?.visibility !== 0 && points[28]?.visibility !== 0)

  return hasHead && hasShoulders && hasHips && hasFeet
}

export function getPoseLoopState(
  result: { landmarks?: Array<Array<{ x: number; y: number; visibility?: number }>> } | null,
): PoseDetectionLoopResult {
  const landmarks = result?.landmarks?.[0] ?? []
  const points = mapLandmarksToPoints(landmarks)

  return {
    points,
    isFullBodyVisible: isFullBodyVisible(points),
  }
}
