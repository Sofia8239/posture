import type { ExerciseAnimation } from '../types'

const TOP = {
  torso: { position: [0, 0.42, 0] as [number, number, number], rotation: [-Math.PI / 2, 0, 0] as [number, number, number] },
  head: { position: [0, 0.22, 0] as [number, number, number] },
  leftShoulder: { rotation: [Math.PI / 2, 0, 0.3] as [number, number, number] },
  rightShoulder: { rotation: [Math.PI / 2, 0, -0.3] as [number, number, number] },
  leftElbow: { rotation: [0.1, 0, 0] as [number, number, number] },
  rightElbow: { rotation: [0.1, 0, 0] as [number, number, number] },
  // Knees on the floor: hips cancel the parent rotation (thighs point down), shins
  // bend back — the same "table leg" trick used for the quadruped bird-dog pose.
  leftHip: { rotation: [Math.PI / 2, 0, 0.06] as [number, number, number] },
  rightHip: { rotation: [Math.PI / 2, 0, -0.06] as [number, number, number] },
  leftKnee: { rotation: [-1.3, 0, 0] as [number, number, number] },
  rightKnee: { rotation: [-1.3, 0, 0] as [number, number, number] },
  stanceOffset: -0.04,
}

export const kneePushUpsAnimation: ExerciseAnimation = {
  exerciseId: 'knee-push-ups',
  exerciseName: 'Віджимання з колін',
  durationMs: 3400,
  keyframes: [
    { phase: 0, pose: TOP, activeMuscles: [] },
    {
      phase: 0.5,
      pose: {
        ...TOP,
        torso: { position: [0, 0.28, 0], rotation: [-Math.PI / 2, 0, 0] },
        leftElbow: { rotation: [0.9, 0, 0] },
        rightElbow: { rotation: [0.9, 0, 0] },
      },
      activeMuscles: ['chest', 'triceps', 'deltoids'],
    },
    { phase: 1, pose: TOP, activeMuscles: [] },
  ],
  cameraTarget: [0, 0.32, 0.15],
  cameraDistanceScale: 1.9,
}
