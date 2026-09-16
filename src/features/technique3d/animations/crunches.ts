import type { ExerciseAnimation } from '../types'

// Supine (face-up) — the opposite sign of rotation from plank's prone pose, which
// flips which absolute direction "legs continuing the parent's line" points in.
// Knees bent, feet flat: hips lift the thighs off that line, knees fold the shins back.
const DOWN = {
  torso: { position: [0, 0.12, 0] as [number, number, number], rotation: [Math.PI / 2, 0, 0] as [number, number, number] },
  head: { position: [0, 0.25, 0] as [number, number, number] },
  leftShoulder: { rotation: [0, 0, 0.25] as [number, number, number] },
  rightShoulder: { rotation: [0, 0, -0.25] as [number, number, number] },
  leftElbow: { rotation: [1.3, 0, 0] as [number, number, number] },
  rightElbow: { rotation: [1.3, 0, 0] as [number, number, number] },
  leftHip: { rotation: [-1.3, 0, 0.05] as [number, number, number] },
  rightHip: { rotation: [-1.3, 0, -0.05] as [number, number, number] },
  leftKnee: { rotation: [1.5, 0, 0] as [number, number, number] },
  rightKnee: { rotation: [1.5, 0, 0] as [number, number, number] },
  stanceOffset: -0.03,
}

export const crunchesAnimation: ExerciseAnimation = {
  exerciseId: 'crunches',
  exerciseName: 'Скручування лежачи',
  durationMs: 2400,
  keyframes: [
    { phase: 0, pose: DOWN, activeMuscles: [] },
    {
      phase: 0.5,
      pose: { ...DOWN, torso: { position: [0, 0.22, 0.02], rotation: [1.25, 0, 0] } },
      activeMuscles: ['abs'],
    },
    { phase: 1, pose: DOWN, activeMuscles: [] },
  ],
  cameraTarget: [0, 0.18, 0.16],
  cameraDistanceScale: 2.0,
}
