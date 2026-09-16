import type { ExerciseAnimation } from '../types'
import { frontSupportPose } from './_poses'

// Plank is an isometric hold, not a rep cycle — both keyframes are identical, so
// playback just shows a steady held position. frontSupportPose puts the body in a
// straight face-down line on the forearms; the rig's ground-clamp rests the forearms
// and toes on the floor.
const HOLD = frontSupportPose()

export const plankAnimation: ExerciseAnimation = {
  exerciseId: 'plank',
  exerciseName: 'Планка на ліктях',
  durationMs: 4000,
  keyframes: [
    { phase: 0, pose: HOLD, activeMuscles: ['abs', 'lowerBack'] },
    { phase: 1, pose: HOLD, activeMuscles: ['abs', 'lowerBack'] },
  ],
  // A horizontal body spans head-to-heel along Z; frame it lower and further back.
  cameraTarget: [0, 0.35, 0.15],
  cameraDistanceScale: 2.1,
}
