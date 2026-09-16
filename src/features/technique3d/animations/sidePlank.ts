import type { ExerciseAnimation } from '../types'

// Lying on the side: rotating around Z (not X, like plank's prone/supine poses) tips
// the standing figure over sideways, body lying along the X axis. The bottom arm
// cancels the parent's Z rotation to still reach straight down to the floor; the top
// arm and both legs continue the parent's line (stacked along the body).
const HOLD = {
  torso: { position: [0, 0.35, 0] as [number, number, number], rotation: [0, 0, Math.PI / 2] as [number, number, number] },
  head: { position: [0, 0.25, 0] as [number, number, number] },
  leftShoulder: { rotation: [0, 0, -Math.PI / 2 + 0.15] as [number, number, number] },
  rightShoulder: { rotation: [0, 0, 0.1] as [number, number, number] },
  leftElbow: { rotation: [0, 0, 0] as [number, number, number] },
  rightElbow: { rotation: [0, 0, 0] as [number, number, number] },
  leftHip: { rotation: [0, 0, 0.04] as [number, number, number] },
  rightHip: { rotation: [0, 0, 0.04] as [number, number, number] },
  leftKnee: { rotation: [0, 0, 0] as [number, number, number] },
  rightKnee: { rotation: [0, 0, 0] as [number, number, number] },
  stanceOffset: 0,
}

export const sidePlankAnimation: ExerciseAnimation = {
  exerciseId: 'side-plank',
  exerciseName: 'Бокова планка',
  durationMs: 4000,
  keyframes: [
    { phase: 0, pose: HOLD, activeMuscles: ['obliques', 'abs'] },
    { phase: 1, pose: HOLD, activeMuscles: ['obliques', 'abs'] },
  ],
  cameraTarget: [0, 0.35, 0.2],
  cameraDistanceScale: 2.1,
}
