import type { ExerciseAnimation } from '../types'
import { standingPose } from './_poses'

const STAND = standingPose({ joints: { leftShoulder: [0.08, 0, 0.32] } })

export const standingHipAbductionAnimation: ExerciseAnimation = {
  exerciseId: 'standing-hip-abduction',
  exerciseName: 'Відведення ноги стоячи',
  durationMs: 3200,
  keyframes: [
    { phase: 0, pose: STAND, activeMuscles: [] },
    {
      phase: 0.5,
      // Stand tall on the left leg; the right leg sweeps out to the side.
      pose: standingPose({
        torsoRotation: [0, 0, 0.1],
        joints: {
          leftShoulder: [0.08, 0, 0.32],
          rightHip: [0, 0, -0.6],
          rightKnee: [0.05, 0, 0],
        },
      }),
      activeMuscles: ['glutes', 'adductors'],
    },
    { phase: 1, pose: STAND, activeMuscles: [] },
  ],
  cameraTarget: [0, 0.8, 0],
}
