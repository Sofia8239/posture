import type { ExerciseAnimation } from '../types'

const HOLD = {
  torso: { position: [0, 0.32, 0] as [number, number, number], rotation: [-Math.PI / 2, 0, 0] as [number, number, number] },
  head: { position: [0, 0.25, 0] as [number, number, number] },
  leftShoulder: { rotation: [Math.PI / 2, 0, 0.2] as [number, number, number] },
  rightShoulder: { rotation: [Math.PI / 2, 0, -0.2] as [number, number, number] },
  leftElbow: { rotation: [0, 0, 0] as [number, number, number] },
  rightElbow: { rotation: [0, 0, 0] as [number, number, number] },
  leftHip: { rotation: [0, 0, 0.04] as [number, number, number] },
  rightHip: { rotation: [0, 0, -0.04] as [number, number, number] },
  leftKnee: { rotation: [0, 0, 0] as [number, number, number] },
  rightKnee: { rotation: [0, 0, 0] as [number, number, number] },
  stanceOffset: 0,
}

export const plankLegLiftAnimation: ExerciseAnimation = {
  exerciseId: 'plank-leg-lift',
  exerciseName: 'Планка з підйомом ноги',
  durationMs: 3600,
  keyframes: [
    { phase: 0, pose: HOLD, activeMuscles: ['abs', 'lowerBack'] },
    {
      phase: 0.5,
      pose: { ...HOLD, leftHip: { rotation: [0.2, 0, 0.04] } },
      activeMuscles: ['abs', 'glutes', 'lowerBack'],
    },
    { phase: 1, pose: HOLD, activeMuscles: ['abs', 'lowerBack'] },
  ],
  cameraTarget: [0, 0.32, 0.28],
  cameraDistanceScale: 2.1,
}
