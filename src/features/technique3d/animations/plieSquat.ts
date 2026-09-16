import type { ExerciseAnimation } from '../types'
import { standingPose } from './_poses'

// Wide stance, toes turned out (approximated with an outward hip roll on Z).
const STAND = standingPose({
  stanceOffset: 0.12,
  joints: { leftHip: [0, 0, 0.18], rightHip: [0, 0, -0.18] },
})

export const plieSquatAnimation: ExerciseAnimation = {
  exerciseId: 'plie-squat',
  exerciseName: 'Присідання-пліє',
  durationMs: 4000,
  keyframes: [
    { phase: 0, pose: STAND, activeMuscles: [] },
    {
      phase: 0.5,
      pose: standingPose({
        root: [0, 0.66, 0],
        torsoRotation: [0.06, 0, 0],
        stanceOffset: 0.12,
        joints: {
          // Knees drive out over the toes; torso stays tall.
          leftHip: [-0.85, 0, 0.26],
          rightHip: [-0.85, 0, -0.26],
          leftKnee: [1.35, 0, 0],
          rightKnee: [1.35, 0, 0],
          leftShoulder: [-0.5, 0, 0.15],
          rightShoulder: [-0.5, 0, -0.15],
          leftElbow: [0.7, 0, 0],
          rightElbow: [0.7, 0, 0],
        },
      }),
      activeMuscles: ['adductors', 'glutes'],
    },
    { phase: 1, pose: STAND, activeMuscles: [] },
  ],
  cameraTarget: [0, 0.8, 0],
}
