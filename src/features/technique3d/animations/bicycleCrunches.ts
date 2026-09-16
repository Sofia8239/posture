import type { ExerciseAnimation } from '../types'

const DOWN = {
  torso: { position: [0, 0.14, 0] as [number, number, number], rotation: [Math.PI / 2, 0, 0] as [number, number, number] },
  head: { position: [0, 0.25, 0] as [number, number, number] },
  leftShoulder: { rotation: [0, 0, 0.25] as [number, number, number] },
  rightShoulder: { rotation: [0, 0, -0.25] as [number, number, number] },
  leftElbow: { rotation: [1.3, 0, 0] as [number, number, number] },
  rightElbow: { rotation: [1.3, 0, 0] as [number, number, number] },
  leftHip: { rotation: [-1.0, 0, 0.05] as [number, number, number] },
  rightHip: { rotation: [-1.0, 0, -0.05] as [number, number, number] },
  leftKnee: { rotation: [1.3, 0, 0] as [number, number, number] },
  rightKnee: { rotation: [1.3, 0, 0] as [number, number, number] },
  stanceOffset: -0.03,
}

export const bicycleCrunchesAnimation: ExerciseAnimation = {
  exerciseId: 'bicycle-crunches',
  exerciseName: 'Велосипед',
  durationMs: 2200,
  keyframes: [
    {
      phase: 0,
      pose: {
        ...DOWN,
        torso: { position: [0, 0.2, 0], rotation: [1.3, 0, 0.08] },
        leftHip: { rotation: [-1.6, 0, 0.05] },
        rightHip: { rotation: [-0.5, 0, -0.05] },
        rightKnee: { rotation: [0.4, 0, 0] },
      },
      activeMuscles: ['abs', 'obliques'],
    },
    {
      phase: 0.5,
      pose: {
        ...DOWN,
        torso: { position: [0, 0.2, 0], rotation: [1.3, 0, -0.08] },
        rightHip: { rotation: [-1.6, 0, -0.05] },
        leftHip: { rotation: [-0.5, 0, 0.05] },
        leftKnee: { rotation: [0.4, 0, 0] },
      },
      activeMuscles: ['abs', 'obliques'],
    },
    {
      phase: 1,
      pose: {
        ...DOWN,
        torso: { position: [0, 0.2, 0], rotation: [1.3, 0, 0.08] },
        leftHip: { rotation: [-1.6, 0, 0.05] },
        rightHip: { rotation: [-0.5, 0, -0.05] },
        rightKnee: { rotation: [0.4, 0, 0] },
      },
      activeMuscles: ['abs', 'obliques'],
    },
  ],
  cameraTarget: [0, 0.2, 0.18],
  cameraDistanceScale: 2.0,
}
