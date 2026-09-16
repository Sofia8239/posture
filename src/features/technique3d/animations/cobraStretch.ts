import type { ExerciseAnimation } from '../types'

const FLAT = {
  torso: { position: [0, 0.12, 0] as [number, number, number], rotation: [-Math.PI / 2, 0, 0] as [number, number, number] },
  head: { position: [0, 0.25, 0] as [number, number, number] },
  leftShoulder: { rotation: [0.4, 0, 0.15] as [number, number, number] },
  rightShoulder: { rotation: [0.4, 0, -0.15] as [number, number, number] },
  leftElbow: { rotation: [0.4, 0, 0] as [number, number, number] },
  rightElbow: { rotation: [0.4, 0, 0] as [number, number, number] },
  leftHip: { rotation: [0, 0, 0.04] as [number, number, number] },
  rightHip: { rotation: [0, 0, -0.04] as [number, number, number] },
  leftKnee: { rotation: [0, 0, 0] as [number, number, number] },
  rightKnee: { rotation: [0, 0, 0] as [number, number, number] },
  stanceOffset: 0,
}

export const cobraStretchAnimation: ExerciseAnimation = {
  exerciseId: 'cobra-stretch',
  exerciseName: 'Кобра',
  durationMs: 3600,
  keyframes: [
    { phase: 0, pose: FLAT, activeMuscles: [] },
    {
      phase: 0.5,
      pose: {
        ...FLAT,
        // Hips stay near the floor; the chest lifts — approximated as the whole
        // torso pitching up partway from horizontal, on straightening arms.
        torso: { position: [0, 0.28, 0.05], rotation: [-1.05, 0, 0] },
        leftShoulder: { rotation: [Math.PI / 2 - 0.3, 0, 0.15] },
        rightShoulder: { rotation: [Math.PI / 2 - 0.3, 0, -0.15] },
        leftElbow: { rotation: [0.15, 0, 0] },
        rightElbow: { rotation: [0.15, 0, 0] },
      },
      activeMuscles: ['abs', 'lowerBack'],
    },
    { phase: 1, pose: FLAT, activeMuscles: [] },
  ],
  cameraTarget: [0, 0.2, 0.18],
  cameraDistanceScale: 2.0,
}
