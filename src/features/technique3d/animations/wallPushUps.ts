import type { ExerciseAnimation } from '../types'

const START = {
  torso: { position: [0, 1.15, 0] as [number, number, number], rotation: [-0.35, 0, 0] as [number, number, number] },
  head: { position: [0, 0.62, 0] as [number, number, number] },
  leftShoulder: { rotation: [-1.35, 0, 0.15] as [number, number, number] },
  rightShoulder: { rotation: [-1.35, 0, -0.15] as [number, number, number] },
  leftElbow: { rotation: [0.1, 0, 0] as [number, number, number] },
  rightElbow: { rotation: [0.1, 0, 0] as [number, number, number] },
  leftHip: { rotation: [0, 0, 0] as [number, number, number] },
  rightHip: { rotation: [0, 0, 0] as [number, number, number] },
  leftKnee: { rotation: [0, 0, 0] as [number, number, number] },
  rightKnee: { rotation: [0, 0, 0] as [number, number, number] },
  stanceOffset: -0.02,
}

export const wallPushUpsAnimation: ExerciseAnimation = {
  exerciseId: 'wall-push-ups',
  exerciseName: 'Віджимання від стіни',
  durationMs: 3000,
  keyframes: [
    { phase: 0, pose: START, activeMuscles: [] },
    {
      phase: 0.5,
      pose: {
        ...START,
        torso: { position: [0, 1.1, 0.05], rotation: [-0.55, 0, 0] },
        leftElbow: { rotation: [1.0, 0, 0] },
        rightElbow: { rotation: [1.0, 0, 0] },
      },
      activeMuscles: ['chest', 'triceps'],
    },
    { phase: 1, pose: START, activeMuscles: [] },
  ],
}
