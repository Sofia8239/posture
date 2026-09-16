import type { ExerciseAnimation } from '../types'
import { standingPose } from './_poses'

const STAND = standingPose()

export const squatAnimation: ExerciseAnimation = {
  exerciseId: 'squat',
  exerciseName: 'Класичне присідання',
  durationMs: 4000,
  keyframes: [
    { phase: 0, pose: STAND, activeMuscles: [] },
    {
      phase: 0.5,
      pose: standingPose({
        root: [0, 0.62, 0.02],
        torsoRotation: [0.32, 0, 0],
        joints: {
          // Hips sink back and down, knees track forward — thighs to about parallel.
          leftHip: [-1.15, 0, 0],
          rightHip: [-1.15, 0, 0],
          leftKnee: [1.6, 0, 0],
          rightKnee: [1.6, 0, 0],
          // Arms reach forward as a counterbalance.
          leftShoulder: [-1.2, 0, 0.12],
          rightShoulder: [-1.2, 0, -0.12],
          leftElbow: [0.2, 0, 0],
          rightElbow: [0.2, 0, 0],
        },
      }),
      activeMuscles: ['quadriceps', 'glutes'],
    },
    { phase: 1, pose: STAND, activeMuscles: [] },
  ],
  cameraTarget: [0, 0.8, 0],
}
