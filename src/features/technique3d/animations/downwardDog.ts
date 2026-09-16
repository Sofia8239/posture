import type { ExerciseAnimation } from '../types'

// Inverted V: a partial pike (not the full 90° of plank/bird-dog) — hips are the
// highest point, arms and legs both angle down to the floor on either side.
const HOLD = {
  torso: { position: [0, 0.62, 0] as [number, number, number], rotation: [-1.0, 0, 0] as [number, number, number] },
  head: { position: [0, 0.25, 0] as [number, number, number] },
  leftShoulder: { rotation: [Math.PI / 2 - 0.35, 0, 0.25] as [number, number, number] },
  rightShoulder: { rotation: [Math.PI / 2 - 0.35, 0, -0.25] as [number, number, number] },
  leftElbow: { rotation: [0, 0, 0] as [number, number, number] },
  rightElbow: { rotation: [0, 0, 0] as [number, number, number] },
  leftHip: { rotation: [Math.PI / 2 - 0.35, 0, 0.08] as [number, number, number] },
  rightHip: { rotation: [Math.PI / 2 - 0.35, 0, -0.08] as [number, number, number] },
  leftKnee: { rotation: [0.15, 0, 0] as [number, number, number] },
  rightKnee: { rotation: [0.15, 0, 0] as [number, number, number] },
  stanceOffset: 0,
}

export const downwardDogAnimation: ExerciseAnimation = {
  exerciseId: 'downward-dog',
  exerciseName: 'Собака мордою вниз',
  durationMs: 4000,
  keyframes: [
    { phase: 0, pose: HOLD, activeMuscles: ['calves', 'hamstrings', 'deltoids'] },
    { phase: 1, pose: HOLD, activeMuscles: ['calves', 'hamstrings', 'deltoids'] },
  ],
  cameraTarget: [0, 0.45, 0.16],
  cameraDistanceScale: 2.1,
}
