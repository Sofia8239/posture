import type { ExerciseAnimation } from '../types'

// Shows one representative lunge (left leg forward) held through the cycle — a real
// set alternates legs, but animating that swap adds complexity without teaching
// anything the mirrored motion doesn't already show.
const STANDING = {
  torso: { position: [0, 1.15, 0] as [number, number, number], rotation: [0, 0, 0] as [number, number, number] },
  head: { position: [0, 0.62, 0] as [number, number, number] },
  leftShoulder: { rotation: [0.1, 0, 0.15] as [number, number, number] },
  rightShoulder: { rotation: [0.1, 0, -0.15] as [number, number, number] },
  leftElbow: { rotation: [0, 0, 0] as [number, number, number] },
  rightElbow: { rotation: [0, 0, 0] as [number, number, number] },
  leftHip: { rotation: [0, 0, 0] as [number, number, number] },
  rightHip: { rotation: [0, 0, 0] as [number, number, number] },
  leftKnee: { rotation: [0, 0, 0] as [number, number, number] },
  rightKnee: { rotation: [0, 0, 0] as [number, number, number] },
  stanceOffset: 0,
}

export const forwardLungeAnimation: ExerciseAnimation = {
  exerciseId: 'forward-lunge',
  exerciseName: 'Передні випади',
  durationMs: 4000,
  keyframes: [
    { phase: 0, pose: STANDING, activeMuscles: [] },
    {
      phase: 0.5,
      pose: {
        torso: { position: [0, 0.78, 0], rotation: [-0.05, 0, 0] },
        head: { position: [0, 0.62, 0] },
        leftShoulder: { rotation: [0.1, 0, 0.15] },
        rightShoulder: { rotation: [0.1, 0, -0.15] },
        leftElbow: { rotation: [0, 0, 0] },
        rightElbow: { rotation: [0, 0, 0] },
        // Left leg forward, knee bent ~90°.
        leftHip: { rotation: [-0.35, 0, 0] },
        leftKnee: { rotation: [1.55, 0, 0] },
        // Right leg trails behind, back knee drops toward the floor.
        rightHip: { rotation: [0.85, 0, 0] },
        rightKnee: { rotation: [1.9, 0, 0] },
        stanceOffset: 0,
      },
      activeMuscles: ['quadriceps', 'glutes', 'hamstrings'],
    },
    { phase: 1, pose: STANDING, activeMuscles: [] },
  ],
}
