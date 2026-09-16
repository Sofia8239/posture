import type { ExerciseAnimation } from '../types'

const RELAXED = {
  torso: { position: [0, 0.14, 0] as [number, number, number], rotation: [-Math.PI / 2, 0, 0] as [number, number, number] },
  head: { position: [0, 0.25, 0] as [number, number, number] },
  // Arms extended forward along the body line, resting — not bent down to the floor
  // like plank's, since superman's arms lift up off the floor with the chest.
  leftShoulder: { rotation: [0.1, 0, 0.12] as [number, number, number] },
  rightShoulder: { rotation: [0.1, 0, -0.12] as [number, number, number] },
  leftElbow: { rotation: [0, 0, 0] as [number, number, number] },
  rightElbow: { rotation: [0, 0, 0] as [number, number, number] },
  leftHip: { rotation: [0, 0, 0.04] as [number, number, number] },
  rightHip: { rotation: [0, 0, -0.04] as [number, number, number] },
  leftKnee: { rotation: [0, 0, 0] as [number, number, number] },
  rightKnee: { rotation: [0, 0, 0] as [number, number, number] },
  stanceOffset: 0,
}

export const supermanAnimation: ExerciseAnimation = {
  exerciseId: 'superman',
  exerciseName: 'Гіперекстензія лежачи',
  durationMs: 3600,
  keyframes: [
    { phase: 0, pose: RELAXED, activeMuscles: [] },
    {
      phase: 0.5,
      pose: {
        ...RELAXED,
        torso: { position: [0, 0.22, 0], rotation: [-Math.PI / 2 - 0.12, 0, 0] },
        leftShoulder: { rotation: [-0.1, 0, 0.12] },
        rightShoulder: { rotation: [-0.1, 0, -0.12] },
        leftHip: { rotation: [-0.15, 0, 0.04] },
        rightHip: { rotation: [-0.15, 0, -0.04] },
      },
      activeMuscles: ['lowerBack', 'glutes'],
    },
    { phase: 1, pose: RELAXED, activeMuscles: [] },
  ],
  cameraTarget: [0, 0.2, 0.2],
  cameraDistanceScale: 2.0,
}
