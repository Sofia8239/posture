import type { ExerciseAnimation } from '../types'
import { standingPose } from './_poses'

const STAND = standingPose({ stanceOffset: -0.05 })

export const narrowSquatAnimation: ExerciseAnimation = {
  exerciseId: 'narrow-squat',
  exerciseName: 'Вузькі присідання',
  durationMs: 4000,
  keyframes: [
    { phase: 0, pose: STAND, activeMuscles: [] },
    {
      phase: 0.5,
      pose: standingPose({
        root: [0, 0.64, 0.02],
        torsoRotation: [0.28, 0, 0],
        stanceOffset: -0.05,
        joints: {
          leftHip: [-1.1, 0, 0],
          rightHip: [-1.1, 0, 0],
          leftKnee: [1.6, 0, 0],
          rightKnee: [1.6, 0, 0],
          leftShoulder: [-1.1, 0, 0.12],
          rightShoulder: [-1.1, 0, -0.12],
          leftElbow: [0.2, 0, 0],
          rightElbow: [0.2, 0, 0],
        },
      }),
      activeMuscles: ['quadriceps', 'calves'],
    },
    { phase: 1, pose: STAND, activeMuscles: [] },
  ],
  cameraTarget: [0, 0.8, 0],
}
