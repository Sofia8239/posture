import { getMidpoint } from './angles'
import { LM } from './landmarks'
import type { MuscleZone } from './muscleMap'
import type { PosePoint } from '../types'

export interface MuscleShape {
  zone: MuscleZone
  points: string
}

type Pt = { x: number; y: number }

function lerp(a: Pt, b: Pt, t: number): Pt {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
}

/**
 * A tapered "muscle belly" polygon running along the a→b segment: thin at both ends,
 * fullest around the middle, offset sideways by `offsetRatio` (as a fraction of the
 * segment's own length). Every vertex is computed fresh from the segment's actual
 * current position each call — nothing here is a transformed static image — so the
 * shape keeps tracking correctly through a full squat, not just standing upright.
 */
function buildSpindle(a: Pt, b: Pt, maxThicknessRatio: number, offsetRatio: number): string {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const length = Math.hypot(dx, dy) || 0.0001
  const tx = dx / length
  const ty = dy / length
  const nx = -dy / length
  const ny = dx / length
  const ox = nx * length * offsetRatio
  const oy = ny * length * offsetRatio

  // (t, relativeWidth) profile along the segment — 0 at the tendons, fullest at the belly.
  const profile: Array<[number, number]> = [
    [0.05, 0.1],
    [0.22, 0.75],
    [0.5, 1],
    [0.78, 0.72],
    [0.95, 0.12],
  ]

  const centerAt = (t: number): Pt => ({ x: a.x + tx * length * t + ox, y: a.y + ty * length * t + oy })

  const left = profile.map(([t, w]) => {
    const c = centerAt(t)
    const half = (maxThicknessRatio * length * w) / 2
    return { x: c.x - nx * half, y: c.y - ny * half }
  })
  const right = [...profile].reverse().map(([t, w]) => {
    const c = centerAt(t)
    const half = (maxThicknessRatio * length * w) / 2
    return { x: c.x + nx * half, y: c.y + ny * half }
  })

  return [...left, ...right].map((p) => `${p.x},${p.y}`).join(' ')
}

function buildRound(center: Pt, radius: number): string {
  const steps = 10
  const pts: Pt[] = []
  for (let i = 0; i < steps; i += 1) {
    const angle = (i / steps) * Math.PI * 2
    pts.push({ x: center.x + Math.cos(angle) * radius, y: center.y + Math.sin(angle) * radius * 0.85 })
  }
  return pts.map((p) => `${p.x},${p.y}`).join(' ')
}

/** Picks whichever offset direction (+magnitude or -magnitude) lands closer to `targetX` —
 * used so "inner" shapes (adductors, biceps-side) always face the body's midline,
 * regardless of which limb it is or which way the segment happens to point this frame. */
function signTowardTarget(a: Pt, b: Pt, targetX: number, magnitude: number): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const length = Math.hypot(dx, dy) || 0.0001
  const nx = -dy / length
  const plusX = a.x + nx * magnitude
  const minusX = a.x - nx * magnitude
  return Math.abs(plusX - targetX) <= Math.abs(minusX - targetX) ? magnitude : -magnitude
}

const LEG_LANDMARKS = [LM.leftHip, LM.rightHip, LM.leftKnee, LM.rightKnee, LM.leftAnkle, LM.rightAnkle]
const TORSO_LANDMARKS = [LM.leftShoulder, LM.rightShoulder, LM.leftHip, LM.rightHip]
const ARM_LANDMARKS = [LM.leftShoulder, LM.rightShoulder, LM.leftElbow, LM.rightElbow, LM.leftWrist, LM.rightWrist]

/**
 * Builds the live muscle-zone polygons for the current frame's pose, one body segment
 * at a time (torso, each thigh, each calf, each upper arm, each forearm) — matching how
 * a coach actually thinks about the body, rather than one rigid whole-body cutout.
 */
export function buildMuscleShapes(points: PosePoint[]): MuscleShape[] {
  const shapes: MuscleShape[] = []
  const hasTorso = TORSO_LANDMARKS.every((index) => points[index])
  const hasLegs = LEG_LANDMARKS.every((index) => points[index])
  const hasArms = ARM_LANDMARKS.every((index) => points[index])

  if (!hasTorso) {
    return shapes
  }

  const shoulderMid = getMidpoint(points[LM.leftShoulder], points[LM.rightShoulder])
  const hipMid = getMidpoint(points[LM.leftHip], points[LM.rightHip])

  // Torso: chest near the shoulders, abs/obliques in the middle, lower back near the hips.
  const chestEnd = lerp(shoulderMid, hipMid, 0.32)
  shapes.push({ zone: 'chest', points: buildSpindle(shoulderMid, chestEnd, 0.85, 0) })

  const absStart = lerp(shoulderMid, hipMid, 0.3)
  const absEnd = lerp(shoulderMid, hipMid, 0.78)
  shapes.push({ zone: 'abs', points: buildSpindle(absStart, absEnd, 0.4, 0) })

  const obliqueInner = signTowardTarget(shoulderMid, hipMid, shoulderMid.x + 1, 0.28)
  shapes.push({ zone: 'obliques', points: buildSpindle(absStart, absEnd, 0.22, obliqueInner) })
  shapes.push({ zone: 'obliques', points: buildSpindle(absStart, absEnd, 0.22, -obliqueInner) })

  const lowerBackStart = lerp(shoulderMid, hipMid, 0.72)
  const lowerBackEnd = lerp(shoulderMid, hipMid, 1.05)
  shapes.push({ zone: 'lowerBack', points: buildSpindle(lowerBackStart, lowerBackEnd, 0.5, 0) })

  if (hasLegs) {
    const sides = [
      { hip: points[LM.leftHip], knee: points[LM.leftKnee], ankle: points[LM.leftAnkle] },
      { hip: points[LM.rightHip], knee: points[LM.rightKnee], ankle: points[LM.rightAnkle] },
    ]

    for (const side of sides) {
      shapes.push({ zone: 'quadriceps', points: buildSpindle(side.hip, side.knee, 0.55, 0) })

      const innerSign = signTowardTarget(side.hip, side.knee, hipMid.x, 0.34)
      shapes.push({ zone: 'adductors', points: buildSpindle(side.hip, side.knee, 0.24, innerSign) })
      shapes.push({ zone: 'hamstrings', points: buildSpindle(side.hip, side.knee, 0.24, -innerSign) })

      shapes.push({ zone: 'calves', points: buildSpindle(side.knee, side.ankle, 0.42, 0) })

      const gluteCenter = lerp(side.hip, side.knee, -0.15)
      shapes.push({ zone: 'glutes', points: buildRound(gluteCenter, Math.hypot(side.knee.x - side.hip.x, side.knee.y - side.hip.y) * 0.22) })
    }
  }

  if (hasArms) {
    const sides = [
      { shoulder: points[LM.leftShoulder], elbow: points[LM.leftElbow], wrist: points[LM.leftWrist] },
      { shoulder: points[LM.rightShoulder], elbow: points[LM.rightElbow], wrist: points[LM.rightWrist] },
    ]

    for (const side of sides) {
      const deltoidRadius = Math.hypot(side.elbow.x - side.shoulder.x, side.elbow.y - side.shoulder.y) * 0.28
      shapes.push({ zone: 'deltoids', points: buildRound(lerp(side.shoulder, side.elbow, 0.12), deltoidRadius) })

      const frontSign = signTowardTarget(side.shoulder, side.elbow, shoulderMid.x, 0.3)
      shapes.push({ zone: 'biceps', points: buildSpindle(side.shoulder, side.elbow, 0.32, frontSign) })
      shapes.push({ zone: 'triceps', points: buildSpindle(side.shoulder, side.elbow, 0.32, -frontSign) })

      shapes.push({ zone: 'forearms', points: buildSpindle(side.elbow, side.wrist, 0.34, 0) })
    }
  }

  return shapes
}
