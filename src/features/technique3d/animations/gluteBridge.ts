import type { ExerciseAnimation } from '../types'
import { supinePose } from './_poses'

// Lie face-up, knees bent with feet flat, then drive the hips up until the body forms
// a straight ramp from shoulders through hips to knees.
const ARMS = { leftShoulder: [0.15, 0, 0.5] as [number, number, number], rightShoulder: [0.15, 0, -0.5] as [number, number, number] }

const DOWN = supinePose({
  joints: {
    ...ARMS,
    leftHip: [-0.6, 0, 0.04],
    rightHip: [-0.6, 0, -0.04],
    leftKnee: [2.0, 0, 0],
    rightKnee: [2.0, 0, 0],
  },
})

const UP = supinePose({
  root: [0, 0.45, 0],
  torsoRotation: [-2.17, 0, 0],
  joints: {
    ...ARMS,
    leftHip: [1.4, 0, 0.04],
    rightHip: [1.4, 0, -0.04],
    leftKnee: [2.2, 0, 0],
    rightKnee: [2.2, 0, 0],
  },
})

export const gluteBridgeAnimation: ExerciseAnimation = {
  exerciseId: 'glute-bridge',
  exerciseName: 'Сідничний міст',
  durationMs: 2800,
  keyframes: [
    { phase: 0, pose: DOWN, activeMuscles: [] },
    { phase: 0.5, pose: UP, activeMuscles: ['glutes', 'hamstrings', 'lowerBack'] },
    { phase: 1, pose: DOWN, activeMuscles: [] },
  ],
  cameraTarget: [0, 0.22, 0],
  cameraDistanceScale: 2.3,
}
