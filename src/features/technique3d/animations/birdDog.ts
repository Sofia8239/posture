import type { ExerciseAnimation } from '../types'

// Quadruped "tabletop": torso horizontal like plank, but supported on hands and knees
// rather than forearms and toes — so unlike plank's legs (which continue the torso's
// line), all four limbs here cancel the parent rotation to point straight down, same
// trick as plank's arms, with knees folded back for the lower legs.
const TABLETOP = {
  torso: { position: [0, 0.5, 0] as [number, number, number], rotation: [-Math.PI / 2, 0, 0] as [number, number, number] },
  head: { position: [0, 0.25, 0] as [number, number, number] },
  leftShoulder: { rotation: [Math.PI / 2, 0, 0.25] as [number, number, number] },
  rightShoulder: { rotation: [Math.PI / 2, 0, -0.25] as [number, number, number] },
  leftElbow: { rotation: [0, 0, 0] as [number, number, number] },
  rightElbow: { rotation: [0, 0, 0] as [number, number, number] },
  leftHip: { rotation: [Math.PI / 2, 0, 0.1] as [number, number, number] },
  rightHip: { rotation: [Math.PI / 2, 0, -0.1] as [number, number, number] },
  leftKnee: { rotation: [-1.4, 0, 0] as [number, number, number] },
  rightKnee: { rotation: [-1.4, 0, 0] as [number, number, number] },
  stanceOffset: 0,
}

export const birdDogAnimation: ExerciseAnimation = {
  exerciseId: 'bird-dog',
  exerciseName: 'Бьорд-дог',
  durationMs: 3600,
  keyframes: [
    { phase: 0, pose: TABLETOP, activeMuscles: [] },
    {
      phase: 0.5,
      pose: {
        ...TABLETOP,
        rightShoulder: { rotation: [Math.PI / 2 - 0.7, 0, 0.15] },
        leftHip: { rotation: [Math.PI / 2 - 0.7, 0, -0.1] },
        leftKnee: { rotation: [-0.15, 0, 0] },
      },
      activeMuscles: ['lowerBack', 'glutes', 'deltoids'],
    },
    { phase: 1, pose: TABLETOP, activeMuscles: [] },
  ],
  cameraTarget: [0, 0.45, 0.22],
  cameraDistanceScale: 2.1,
}
