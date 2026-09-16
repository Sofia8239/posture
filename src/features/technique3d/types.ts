import type { MuscleZone } from '../exercises/analysis/muscleMap'

export type Vec3 = [number, number, number]

export interface JointPose {
  rotation: Vec3
}

/**
 * A simplified skeleton — enough joints to make a squat, lunge, or plank hold
 * recognizable, not a biomechanically exact rig. Left/right are independent so
 * asymmetric moves (lunges) can pose each leg differently.
 */
export interface Pose {
  torso: { position: Vec3; rotation: Vec3 }
  head: { position: Vec3 }
  leftShoulder: JointPose
  rightShoulder: JointPose
  leftElbow: JointPose
  rightElbow: JointPose
  leftHip: JointPose
  rightHip: JointPose
  leftKnee: JointPose
  rightKnee: JointPose
  /**
   * Optional extra ankle tilt, added on top of the automatic foot-levelling the rig
   * applies (which keeps the sole flat by cancelling the summed hip+knee pitch). Use
   * it for heel raises (toes stay down, heel lifts), lunge toe-off, or a pointed foot.
   * Omit for a normal flat foot.
   */
  leftAnkle?: JointPose
  rightAnkle?: JointPose
  /** Lateral offset of each leg's hip pivot from center — hints at stance width (plié vs narrow). */
  stanceOffset: number
}

export interface PoseKeyframe {
  /** Position along the movement cycle, 0–1. */
  phase: number
  pose: Pose
  activeMuscles: MuscleZone[]
}

export interface ExerciseAnimation {
  /** Either a camera-tracked ExerciseId or a catalogExercises id. */
  exerciseId: string
  exerciseName: string
  /** Milliseconds for one full phase 0→1 cycle. */
  durationMs: number
  keyframes: PoseKeyframe[]
  /** Where the camera orbits around. Defaults to a standing figure's eye-ish level
   * ([0, 0.6, 0]) — poses with a very different centroid (lying down, bent far over)
   * need their own, or the camera frames empty space instead of the figure. */
  cameraTarget?: Vec3
  /** Multiplies the standard view-preset camera distance. Horizontal poses (plank)
   * need more room than a standing figure to stay in frame. */
  cameraDistanceScale?: number
  /**
   * Path to a real anatomical .glb (e.g. '/models/squat.glb'). When set, TechniqueViewer
   * renders AnatomicalModel instead of the procedural AnimatedHumanoid — see that file's
   * doc comment for how to prepare and wire one in. No exercise sets this yet; the
   * procedural rig remains the default until a real asset exists.
   */
  modelUrl?: string
  /** Required alongside modelUrl — maps that .glb's actual mesh names to MuscleZone. */
  meshNameToZone?: Record<string, MuscleZone>
  /** Name of the embedded AnimationClip to scrub by phase. Omit for a static (posed but unrigged) mesh. */
  clipName?: string
  /**
   * Path to a Mixamo-exported animation-only .glb (e.g. '/models/animations/squat.glb').
   * When set, TechniqueViewer renders MixamoCharacter — the shared, realistic Mixamo
   * rig (public/models/character.glb) playing this clip — instead of the procedural
   * AnimatedHumanoid. Takes priority over modelUrl/meshNameToZone. See
   * MixamoCharacter.tsx's doc comment for how to prepare and wire one in. No exercise
   * sets this yet; the procedural rig remains the default until real assets exist.
   */
  mixamoAnimationUrl?: string
}
