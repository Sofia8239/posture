import type { Pose, Vec3 } from '../types'

/**
 * Pose presets so each animation file only spells out the joints that actually move.
 *
 * The rig (see AnimatedHumanoid) re-plants the figure on the floor every frame, so
 * `root` position is only about *relative* rise and fall — a squat lowering its hips,
 * a push-up dropping its chest. Vertical placement is automatic; you never have to make
 * the feet touch the ground yourself.
 *
 * Joint rotations are Euler radians. Legs and arms hang straight down at rotation 0.
 * Positive X on a hip/knee swings that segment forward (toward the front camera, +Z).
 * `torso.rotation` orients the whole body: 0 = upright, -PI/2 = lying face-down
 * (plank/push-up), +PI/2 = lying face-up (bridge/crunch).
 */

type JointKey =
  | 'leftShoulder' | 'rightShoulder' | 'leftElbow' | 'rightElbow'
  | 'leftHip' | 'rightHip' | 'leftKnee' | 'rightKnee'
  | 'leftAnkle' | 'rightAnkle'

interface PoseOverrides {
  root?: Vec3
  torsoRotation?: Vec3
  head?: Vec3
  stanceOffset?: number
  joints?: Partial<Record<JointKey, Vec3>>
}

const STANDING_ROOT: Vec3 = [0, 0.92, 0]

/** Build a full Pose from a small set of overrides on top of a neutral base. */
export function makePose(overrides: PoseOverrides = {}): Pose {
  const j = overrides.joints ?? {}
  const zero: Vec3 = [0, 0, 0]
  const pose: Pose = {
    torso: {
      position: overrides.root ?? STANDING_ROOT,
      rotation: overrides.torsoRotation ?? zero,
    },
    head: { position: overrides.head ?? [0, 0.62, 0] },
    leftShoulder: { rotation: j.leftShoulder ?? [0.08, 0, 0.12] },
    rightShoulder: { rotation: j.rightShoulder ?? [0.08, 0, -0.12] },
    leftElbow: { rotation: j.leftElbow ?? zero },
    rightElbow: { rotation: j.rightElbow ?? zero },
    leftHip: { rotation: j.leftHip ?? zero },
    rightHip: { rotation: j.rightHip ?? zero },
    leftKnee: { rotation: j.leftKnee ?? zero },
    rightKnee: { rotation: j.rightKnee ?? zero },
    stanceOffset: overrides.stanceOffset ?? 0.02,
  }
  if (j.leftAnkle) {
    pose.leftAnkle = { rotation: j.leftAnkle }
  }
  if (j.rightAnkle) {
    pose.rightAnkle = { rotation: j.rightAnkle }
  }
  return pose
}

/** Relaxed upright stand — the rest pose most standing exercises start and end on. */
export function standingPose(overrides: PoseOverrides = {}): Pose {
  return makePose(overrides)
}

/**
 * Face-down support on the forearms: torso horizontal (head toward +Z), upper arms
 * dropping straight to the floor, forearms folded forward, legs straight back onto the
 * toes. The ground-clamp rests the forearms and toes on y = 0.
 */
export function frontSupportPose(overrides: PoseOverrides = {}): Pose {
  return makePose({
    root: [0, 0.34, 0],
    torsoRotation: [Math.PI / 2, 0, 0],
    stanceOffset: 0,
    ...overrides,
    joints: {
      leftShoulder: [-Math.PI / 2, 0, 0.14],
      rightShoulder: [-Math.PI / 2, 0, -0.14],
      leftElbow: [-Math.PI / 2, 0, 0],
      rightElbow: [-Math.PI / 2, 0, 0],
      leftAnkle: [-1.9, 0, 0],
      rightAnkle: [-1.9, 0, 0],
      ...overrides.joints,
    },
  })
}

/**
 * Face-up on the floor (head toward -Z): upper back resting down, arms alongside the
 * body. Bends and lifts are layered on top per exercise.
 */
export function supinePose(overrides: PoseOverrides = {}): Pose {
  return makePose({
    root: [0, 0.32, 0],
    torsoRotation: [-Math.PI / 2, 0, 0],
    stanceOffset: 0,
    ...overrides,
    joints: {
      leftShoulder: [0.5, 0, 0.12],
      rightShoulder: [0.5, 0, -0.12],
      ...overrides.joints,
    },
  })
}
