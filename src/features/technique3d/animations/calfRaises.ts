import type { ExerciseAnimation } from '../types'
import { standingPose } from './_poses'

const STAND = standingPose()

export const calfRaisesAnimation: ExerciseAnimation = {
  exerciseId: 'calf-raises',
  exerciseName: 'Підйом на носки',
  durationMs: 2600,
  keyframes: [
    { phase: 0, pose: STAND, activeMuscles: [] },
    {
      phase: 0.5,
      // Heels drive up; the ankle plantarflexes and the ground-clamp re-plants the
      // figure on the balls of the feet, lifting the whole body.
      pose: standingPose({
        joints: {
          leftAnkle: [0.5, 0, 0],
          rightAnkle: [0.5, 0, 0],
        },
      }),
      activeMuscles: ['calves'],
    },
    { phase: 1, pose: STAND, activeMuscles: [] },
  ],
  cameraTarget: [0, 0.8, 0],
}
