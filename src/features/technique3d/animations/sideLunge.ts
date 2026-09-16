import type { ExerciseAnimation } from '../types'
import { standingPose } from './_poses'

const STAND = standingPose({ stanceOffset: 0.16 })

export const sideLungeAnimation: ExerciseAnimation = {
  exerciseId: 'side-lunge',
  exerciseName: 'Бічні випади',
  durationMs: 4000,
  keyframes: [
    { phase: 0, pose: STAND, activeMuscles: [] },
    {
      phase: 0.5,
      pose: standingPose({
        root: [0, 0.8, 0],
        torsoRotation: [0.18, 0, 0.06],
        stanceOffset: 0.16,
        joints: {
          // Left leg sits into the lunge: hip flexes and abducts, knee bends.
          leftHip: [-0.9, 0, 0.3],
          leftKnee: [1.35, 0, 0],
          // Right leg stays long, taking the frontal-plane lean.
          rightHip: [0, 0, -0.2],
          rightKnee: [0.05, 0, 0],
          leftShoulder: [-0.6, 0, 0.2],
          rightShoulder: [-0.6, 0, -0.2],
          leftElbow: [0.4, 0, 0],
          rightElbow: [0.4, 0, 0],
        },
      }),
      activeMuscles: ['glutes', 'adductors'],
    },
    { phase: 1, pose: STAND, activeMuscles: [] },
  ],
  cameraTarget: [0, 0.75, 0],
}
