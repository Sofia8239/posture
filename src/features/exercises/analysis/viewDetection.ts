import { LM } from './landmarks'
import type { PosePoint } from '../types'

export type CameraView = 'front' | 'side'

/**
 * Determines whether the camera sees the person face-on or from the side.
 * Deliberately uses only shoulders (torso), never face landmarks — so turning
 * your head to glance at the screen never flips the detected view.
 */
export function detectCameraView(points: PosePoint[]): CameraView | null {
  const leftShoulder = points[LM.leftShoulder]
  const rightShoulder = points[LM.rightShoulder]

  if (!leftShoulder || !rightShoulder) {
    return null
  }

  const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x)
  return shoulderWidth > 0.15 ? 'front' : 'side'
}
