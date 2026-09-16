import type { ExerciseAnimation } from '../types'

const DOWN = {
  torso: { position: [0, 0.12, 0] as [number, number, number], rotation: [Math.PI / 2, 0, 0] as [number, number, number] },
  head: { position: [0, 0.25, 0] as [number, number, number] },
  leftShoulder: { rotation: [0, 0, 0.06] as [number, number, number] },
  rightShoulder: { rotation: [0, 0, -0.06] as [number, number, number] },
  leftElbow: { rotation: [0, 0, 0] as [number, number, number] },
  rightElbow: { rotation: [0, 0, 0] as [number, number, number] },
  leftHip: { rotation: [0, 0, 0.03] as [number, number, number] },
  rightHip: { rotation: [0, 0, -0.03] as [number, number, number] },
  leftKnee: { rotation: [0, 0, 0] as [number, number, number] },
  rightKnee: { rotation: [0, 0, 0] as [number, number, number] },
  stanceOffset: -0.02,
}

export const legRaisesAnimation: ExerciseAnimation = {
  exerciseId: 'leg-raises',
  exerciseName: 'Підйом ніг лежачи',
  durationMs: 3000,
  keyframes: [
    { phase: 0, pose: DOWN, activeMuscles: [] },
    {
      phase: 0.5,
      pose: {
        ...DOWN,
        leftHip: { rotation: [-1.4, 0, 0.03] },
        rightHip: { rotation: [-1.4, 0, -0.03] },
      },
      activeMuscles: ['abs'],
    },
    { phase: 1, pose: DOWN, activeMuscles: [] },
  ],
  cameraTarget: [0, 0.2, 0.22],
  cameraDistanceScale: 2.1,
}
