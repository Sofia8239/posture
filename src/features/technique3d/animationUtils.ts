import type { MuscleZone } from '../exercises/analysis/muscleMap'
import type { JointPose, Pose, PoseKeyframe, Vec3 } from './types'

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function lerpVec3(a: Vec3, b: Vec3, t: number): Vec3 {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]
}

/** Cosine ease-in-out. Zero velocity at both endpoints, so back-to-back segments meet
 * without the hard direction-reversal kink a raw linear lerp shows at each keyframe
 * (most visible at the bottom of a squat, where the figure otherwise snaps). */
function easeInOut(t: number): number {
  return 0.5 - Math.cos(Math.PI * Math.max(0, Math.min(1, t))) / 2
}

function lerpOptionalJoint(a: JointPose | undefined, b: JointPose | undefined, t: number): JointPose | undefined {
  if (!a && !b) {
    return undefined
  }
  const az = a?.rotation ?? ZERO_VEC3
  const bz = b?.rotation ?? ZERO_VEC3
  return { rotation: lerpVec3(az, bz, t) }
}

const ZERO_VEC3: Vec3 = [0, 0, 0]

function lerpPose(a: Pose, b: Pose, t: number): Pose {
  return {
    torso: { position: lerpVec3(a.torso.position, b.torso.position, t), rotation: lerpVec3(a.torso.rotation, b.torso.rotation, t) },
    head: { position: lerpVec3(a.head.position, b.head.position, t) },
    leftShoulder: { rotation: lerpVec3(a.leftShoulder.rotation, b.leftShoulder.rotation, t) },
    rightShoulder: { rotation: lerpVec3(a.rightShoulder.rotation, b.rightShoulder.rotation, t) },
    leftElbow: { rotation: lerpVec3(a.leftElbow.rotation, b.leftElbow.rotation, t) },
    rightElbow: { rotation: lerpVec3(a.rightElbow.rotation, b.rightElbow.rotation, t) },
    leftHip: { rotation: lerpVec3(a.leftHip.rotation, b.leftHip.rotation, t) },
    rightHip: { rotation: lerpVec3(a.rightHip.rotation, b.rightHip.rotation, t) },
    leftKnee: { rotation: lerpVec3(a.leftKnee.rotation, b.leftKnee.rotation, t) },
    rightKnee: { rotation: lerpVec3(a.rightKnee.rotation, b.rightKnee.rotation, t) },
    leftAnkle: lerpOptionalJoint(a.leftAnkle, b.leftAnkle, t),
    rightAnkle: lerpOptionalJoint(a.rightAnkle, b.rightAnkle, t),
    stanceOffset: lerp(a.stanceOffset, b.stanceOffset, t),
  }
}

/** Keyframes must be sorted by phase ascending and span [0, 1]. */
export function interpolateKeyframes(keyframes: PoseKeyframe[], phase: number): Pose {
  const clamped = Math.max(0, Math.min(1, phase))

  let lower = keyframes[0]
  let upper = keyframes[keyframes.length - 1]
  for (let i = 0; i < keyframes.length - 1; i += 1) {
    if (clamped >= keyframes[i].phase && clamped <= keyframes[i + 1].phase) {
      lower = keyframes[i]
      upper = keyframes[i + 1]
      break
    }
  }

  const span = upper.phase - lower.phase
  const linearT = span > 0 ? (clamped - lower.phase) / span : 0
  return lerpPose(lower.pose, upper.pose, easeInOut(linearT))
}

/** Muscle highlighting doesn't need smooth blending — snap to the nearest keyframe. */
function nearestKeyframe(keyframes: PoseKeyframe[], phase: number): PoseKeyframe {
  let nearest = keyframes[0]
  let nearestDistance = Math.abs(phase - nearest.phase)
  for (const keyframe of keyframes) {
    const distance = Math.abs(phase - keyframe.phase)
    if (distance < nearestDistance) {
      nearest = keyframe
      nearestDistance = distance
    }
  }
  return nearest
}

export function activeMusclesAtPhase(keyframes: PoseKeyframe[], phase: number): MuscleZone[] {
  return nearestKeyframe(keyframes, phase).activeMuscles
}

/**
 * Splits a keyframe's activeMuscles into a primary mover (first listed — every
 * animation was authored with the prime mover first, e.g. squat's ['quadriceps',
 * 'glutes']) and secondary/stabilizer muscles (the rest), so the rig can light them
 * up as two distinct tiers instead of one flat "active" color.
 */
export function primarySecondaryMusclesAtPhase(
  keyframes: PoseKeyframe[],
  phase: number,
): { primary: MuscleZone[]; secondary: MuscleZone[] } {
  const [primary, ...secondary] = nearestKeyframe(keyframes, phase).activeMuscles
  return { primary: primary ? [primary] : [], secondary }
}

/**
 * How "loaded" the current instant is, 0–1 — peaks at keyframes with active muscles
 * (the exercise's point of peak tension, e.g. bottom of a squat) and fades to 0 at
 * rest keyframes (top/start). Interpolated (eased) between the bracketing keyframes so
 * the emissive highlight swells and fades with the movement instead of snapping on at
 * the segment midpoint.
 */
export function loadIntensityAtPhase(keyframes: PoseKeyframe[], phase: number): number {
  const clamped = Math.max(0, Math.min(1, phase))
  let lower = keyframes[0]
  let upper = keyframes[keyframes.length - 1]
  for (let i = 0; i < keyframes.length - 1; i += 1) {
    if (clamped >= keyframes[i].phase && clamped <= keyframes[i + 1].phase) {
      lower = keyframes[i]
      upper = keyframes[i + 1]
      break
    }
  }
  const span = upper.phase - lower.phase
  const t = easeInOut(span > 0 ? (clamped - lower.phase) / span : 0)
  const lowerLoad = lower.activeMuscles.length > 0 ? 1 : 0
  const upperLoad = upper.activeMuscles.length > 0 ? 1 : 0
  return lerp(lowerLoad, upperLoad, t)
}

/** A "which of the N steps are we on" index for highlighting the instructions list, mirroring phase. */
export function currentStepIndex(phase: number, stepCount: number): number {
  if (stepCount <= 0) {
    return -1
  }
  return Math.min(stepCount - 1, Math.floor(phase * stepCount))
}
