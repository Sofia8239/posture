import type { ExerciseAnimation } from '../types'

// Prone, straight-armed support (unlike plank's bent-elbow forearm support): torso
// rotated flat like plank, but shoulders cancel the parent rotation further out and
// elbows stay near-straight, so the whole body sits higher off the "floor".
const TOP = {
  torso: { position: [0, 0.5, 0] as [number, number, number], rotation: [-Math.PI / 2, 0, 0] as [number, number, number] },
  head: { position: [0, 0.25, 0] as [number, number, number] },
  leftShoulder: { rotation: [Math.PI / 2, 0, 0.3] as [number, number, number] },
  rightShoulder: { rotation: [Math.PI / 2, 0, -0.3] as [number, number, number] },
  leftElbow: { rotation: [0.1, 0, 0] as [number, number, number] },
  rightElbow: { rotation: [0.1, 0, 0] as [number, number, number] },
  leftHip: { rotation: [0, 0, 0.04] as [number, number, number] },
  rightHip: { rotation: [0, 0, -0.04] as [number, number, number] },
  leftKnee: { rotation: [0, 0, 0] as [number, number, number] },
  rightKnee: { rotation: [0, 0, 0] as [number, number, number] },
  stanceOffset: -0.04,
}

export const pushUpsAnimation: ExerciseAnimation = {
  exerciseId: 'push-ups',
  exerciseName: 'Віджимання класичні',
  durationMs: 3400,
  keyframes: [
    { phase: 0, pose: TOP, activeMuscles: [] },
    {
      phase: 0.5,
      pose: {
        ...TOP,
        torso: { position: [0, 0.32, 0], rotation: [-Math.PI / 2, 0, 0] },
        leftElbow: { rotation: [0.95, 0, 0] },
        rightElbow: { rotation: [0.95, 0, 0] },
      },
      activeMuscles: ['chest', 'triceps', 'deltoids'],
    },
    { phase: 1, pose: TOP, activeMuscles: [] },
  ],
  cameraTarget: [0, 0.4, 0.25],
  cameraDistanceScale: 2.1,
}
