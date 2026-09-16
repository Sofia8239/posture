import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Box3, Group } from 'three'
import { interpolateKeyframes, loadIntensityAtPhase, primarySecondaryMusclesAtPhase } from './animationUtils'
import { muscleColors, type MuscleZone } from '../exercises/analysis/muscleMap'
import type { PoseKeyframe, Vec3 } from './types'

interface Props {
  phase: number
  keyframes: PoseKeyframe[]
}

interface ZoneAppearance {
  color: string
  emissiveIntensity: number
}

const MATERIAL_PROPS = { roughness: 0.55, metalness: 0.08 }
const SKIN_COLOR = '#F2B79B'
const NEUTRAL: ZoneAppearance = { color: muscleColors.base.fill, emissiveIntensity: 0 }

// Segment lengths (metres-ish). The rig is built so that with every joint rotation at
// zero and the pelvis anchor (`pose.torso.position`) at y = LEG_LENGTH, both soles rest
// exactly on y = 0 — see the ground-clamp in AnimatedHumanoid, which re-plants the
// figure every frame regardless of what the keyframe puts in `torso.position.y`.
const HIP_HALF = 0.1
const SHOULDER_HALF = 0.185
const TORSO_H = 0.46
const THIGH_LEN = 0.42
const SHIN_LEN = 0.4
const FOOT_H = 0.06
const UPPERARM_LEN = 0.27
const FOREARM_LEN = 0.24
const LEG_LENGTH = THIGH_LEN + SHIN_LEN + FOOT_H

/**
 * Three-tier appearance: the primary mover glows brightest and throbs with `pulse`
 * (strongest at the exercise's peak-load instant); secondary/stabilizer muscles glow
 * softer and steady; everything else stays neutral so attention lands on what's
 * actually working, per zone-coding rather than a flat on/off highlight.
 */
function zoneAppearance(zones: MuscleZone[], primary: MuscleZone[], secondary: MuscleZone[], pulse: number): ZoneAppearance {
  if (zones.some((zone) => primary.includes(zone))) {
    return { color: muscleColors.active.fill, emissiveIntensity: 0.35 + pulse * 0.55 }
  }
  if (zones.some((zone) => secondary.includes(zone))) {
    return { color: muscleColors.secondary.fill, emissiveIntensity: 0.18 }
  }
  return NEUTRAL
}

function ZoneMaterial({ appearance }: { appearance: ZoneAppearance }) {
  return (
    <meshStandardMaterial
      color={appearance.color}
      emissive={appearance.color}
      emissiveIntensity={appearance.emissiveIntensity}
      {...MATERIAL_PROPS}
    />
  )
}

function SkinMaterial() {
  return <meshStandardMaterial color={SKIN_COLOR} {...MATERIAL_PROPS} />
}

/** Auto-levelled ankle: cancel the summed hip+knee pitch so the sole stays parallel to
 * the pelvis frame's floor plane (i.e. flat on the ground for an upright figure), then
 * add any authored ankle tilt on top (heel raises, lunge toe-off). Assumes leg joints
 * rotate about X only, which every current animation does. */
function ankleRotation(hip: Vec3, knee: Vec3, ankle: Vec3 | undefined): Vec3 {
  return [-(hip[0] + knee[0]) + (ankle?.[0] ?? 0), ankle?.[1] ?? 0, ankle?.[2] ?? 0]
}

function Leg({
  side,
  hip,
  knee,
  ankle,
  stanceOffset,
  thighFront,
  thighBack,
  shinAppearance,
}: {
  side: 'left' | 'right'
  hip: Vec3
  knee: Vec3
  ankle: Vec3 | undefined
  stanceOffset: number
  thighFront: ZoneAppearance
  thighBack: ZoneAppearance
  shinAppearance: ZoneAppearance
}) {
  const sign = side === 'left' ? -1 : 1
  return (
    <group position={[sign * (HIP_HALF + stanceOffset), -0.04, 0]} rotation={hip}>
      {/* hip ball */}
      <mesh castShadow>
        <sphereGeometry args={[0.09, 16, 16]} />
        <ZoneMaterial appearance={thighBack} />
      </mesh>
      {/* thigh: front half = quadriceps, back half = hamstrings/glutes */}
      <mesh position={[0, -THIGH_LEN / 2, 0.03]} castShadow receiveShadow>
        <capsuleGeometry args={[0.075, THIGH_LEN - 0.08, 8, 16]} />
        <ZoneMaterial appearance={thighFront} />
      </mesh>
      <mesh position={[0, -THIGH_LEN / 2, -0.035]} castShadow>
        <capsuleGeometry args={[0.06, THIGH_LEN - 0.08, 8, 16]} />
        <ZoneMaterial appearance={thighBack} />
      </mesh>
      <group position={[0, -THIGH_LEN, 0]} rotation={knee}>
        {/* knee */}
        <mesh castShadow>
          <sphereGeometry args={[0.07, 14, 14]} />
          <ZoneMaterial appearance={shinAppearance} />
        </mesh>
        <mesh position={[0, -SHIN_LEN / 2, 0]} castShadow>
          <capsuleGeometry args={[0.065, SHIN_LEN - 0.08, 8, 16]} />
          <ZoneMaterial appearance={shinAppearance} />
        </mesh>
        <group position={[0, -SHIN_LEN, 0]} rotation={ankleRotation(hip, knee, ankle)}>
          <mesh position={[0, -FOOT_H / 2, 0.06]} castShadow receiveShadow>
            <boxGeometry args={[0.09, FOOT_H, 0.2]} />
            <ZoneMaterial appearance={shinAppearance} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

function Arm({
  side,
  shoulder,
  elbow,
  upperArm,
  forearm,
}: {
  side: 'left' | 'right'
  shoulder: Vec3
  elbow: Vec3
  upperArm: ZoneAppearance
  forearm: ZoneAppearance
}) {
  const sign = side === 'left' ? -1 : 1
  return (
    <group position={[sign * SHOULDER_HALF, TORSO_H - 0.03, 0]} rotation={shoulder}>
      <mesh castShadow>
        <sphereGeometry args={[0.075, 16, 16]} />
        <ZoneMaterial appearance={upperArm} />
      </mesh>
      <mesh position={[0, -UPPERARM_LEN / 2, 0]} castShadow>
        <capsuleGeometry args={[0.055, UPPERARM_LEN - 0.06, 8, 16]} />
        <ZoneMaterial appearance={upperArm} />
      </mesh>
      <group position={[0, -UPPERARM_LEN, 0]} rotation={elbow}>
        <mesh castShadow>
          <sphereGeometry args={[0.05, 14, 14]} />
          <ZoneMaterial appearance={forearm} />
        </mesh>
        <mesh position={[0, -FOREARM_LEN / 2, 0]} castShadow>
          <capsuleGeometry args={[0.045, FOREARM_LEN - 0.06, 8, 16]} />
          <ZoneMaterial appearance={forearm} />
        </mesh>
        <mesh position={[0, -FOREARM_LEN - 0.02, 0]} castShadow>
          <sphereGeometry args={[0.05, 12, 12]} />
          <SkinMaterial />
        </mesh>
      </group>
    </group>
  )
}

/**
 * A stylized capsule mannequin. The pelvis anchor sits at `pose.torso.position`; the
 * torso/head chain rises from it and the leg chain (hips on the pelvis line, knee, then
 * an auto-levelled ankle so feet stay flat) drops from it. Every frame the whole rig is
 * re-planted on the ground plane via a bounding-box clamp, so keyframes only have to get
 * the *relative* motion right — vertical placement is automatic and no pose can float or
 * sink through the floor. Not anatomically precise by design; the goal is a silhouette a
 * viewer can read the movement from. See technique3d/AnatomicalModel.tsx for a real mesh.
 */
export function AnimatedHumanoid({ phase, keyframes }: Props) {
  const pose = useMemo(() => interpolateKeyframes(keyframes, phase), [keyframes, phase])
  const { primary, secondary } = useMemo(() => primarySecondaryMusclesAtPhase(keyframes, phase), [keyframes, phase])
  const loadIntensity = useMemo(() => loadIntensityAtPhase(keyframes, phase), [keyframes, phase])
  // Throbs a few times across the "loaded" window; frequency is tied to phase (not a
  // wall-clock timer), so it naturally speeds up or slows down with playback speed.
  const pulse = loadIntensity * (0.7 + 0.3 * Math.sin(phase * Math.PI * 16))

  const torso = zoneAppearance(['abs', 'chest', 'lowerBack', 'obliques'], primary, secondary, pulse)
  const quad = zoneAppearance(['quadriceps', 'adductors'], primary, secondary, pulse)
  const posteriorLeg = zoneAppearance(['hamstrings', 'glutes'], primary, secondary, pulse)
  const calf = zoneAppearance(['calves'], primary, secondary, pulse)
  const upperArm = zoneAppearance(['biceps', 'triceps', 'deltoids'], primary, secondary, pulse)
  const forearm = zoneAppearance(['forearms'], primary, secondary, pulse)

  // Re-plant on the floor every frame: measure the rig's world AABB and lift it so its
  // lowest point rests on y = 0. Runs before the render commits the frame, so there's no
  // visible settle. Keyframes control shape and relative motion; this owns the ground.
  const clampRef = useRef<Group>(null)
  const innerRef = useRef<Group>(null)
  const box = useMemo(() => new Box3(), [])
  useFrame(() => {
    const clamp = clampRef.current
    const inner = innerRef.current
    if (!clamp || !inner) {
      return
    }
    clamp.position.y = 0
    clamp.updateWorldMatrix(true, true)
    box.setFromObject(inner)
    if (Number.isFinite(box.min.y)) {
      clamp.position.y = -box.min.y
    }
  })

  return (
    <group ref={clampRef}>
      <group ref={innerRef} position={pose.torso.position} rotation={pose.torso.rotation}>
        {/* pelvis */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.3, 0.17, 0.19]} />
          <ZoneMaterial appearance={posteriorLeg} />
        </mesh>

        {/* torso */}
        <mesh position={[0, TORSO_H / 2 + 0.03, 0]} castShadow receiveShadow>
          <capsuleGeometry args={[0.155, TORSO_H - 0.16, 8, 16]} />
          <ZoneMaterial appearance={torso} />
        </mesh>

        {/* neck + head, riding on top of the torso */}
        <mesh position={[0, TORSO_H + 0.04, 0]} castShadow>
          <capsuleGeometry args={[0.055, 0.05, 6, 12]} />
          <SkinMaterial />
        </mesh>
        <mesh position={[0, TORSO_H + 0.17, 0.01]} castShadow>
          <sphereGeometry args={[0.115, 20, 20]} />
          <SkinMaterial />
        </mesh>

        <Arm side="left" shoulder={pose.leftShoulder.rotation} elbow={pose.leftElbow.rotation} upperArm={upperArm} forearm={forearm} />
        <Arm side="right" shoulder={pose.rightShoulder.rotation} elbow={pose.rightElbow.rotation} upperArm={upperArm} forearm={forearm} />

        <Leg
          side="left"
          hip={pose.leftHip.rotation}
          knee={pose.leftKnee.rotation}
          ankle={pose.leftAnkle?.rotation}
          stanceOffset={pose.stanceOffset}
          thighFront={quad}
          thighBack={posteriorLeg}
          shinAppearance={calf}
        />
        <Leg
          side="right"
          hip={pose.rightHip.rotation}
          knee={pose.rightKnee.rotation}
          ankle={pose.rightAnkle?.rotation}
          stanceOffset={pose.stanceOffset}
          thighFront={quad}
          thighBack={posteriorLeg}
          shinAppearance={calf}
        />
      </group>
    </group>
  )
}

export { LEG_LENGTH }
