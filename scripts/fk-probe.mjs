// Forward-kinematics probe for the technique3d rig. Mirrors the hierarchy in
// AnimatedHumanoid.tsx exactly (three.js Object3D tree, Euler XYZ) so joint angles for
// the lying/horizontal poses can be chosen deterministically instead of by eyeballing
// screenshots. Prints the world position of every landmark for a given pose.
//
// Usage: node scripts/fk-probe.mjs '<json pose>'
//   pose = { torso:{position:[x,y,z],rotation:[x,y,z]}, leftHip:[x,y,z], leftKnee:..., leftAnkle:..., leftShoulder:..., leftElbow:..., (right* too) }

import { Object3D, Vector3 } from 'three'

const HIP_HALF = 0.1
const SHOULDER_HALF = 0.185
const TORSO_H = 0.46
const THIGH_LEN = 0.42
const SHIN_LEN = 0.4
const FOOT_H = 0.06
const UPPERARM_LEN = 0.27
const FOREARM_LEN = 0.24

const p = JSON.parse(process.argv[2] ?? '{}')
const v = (a, d = [0, 0, 0]) => a ?? d

function node(parent, pos, rot) {
  const o = new Object3D()
  o.position.set(...pos)
  if (rot) o.rotation.set(...rot)
  parent.add(o)
  return o
}

const root = node(new Object3D(), v(p.torso?.position, [0, 0.92, 0]), v(p.torso?.rotation))

// legs
function leg(side) {
  const sign = side === 'left' ? -1 : 1
  const hip = node(root, [sign * HIP_HALF, -0.04, 0], v(p[`${side}Hip`]))
  const knee = node(hip, [0, -THIGH_LEN, 0], v(p[`${side}Knee`]))
  const ankleAuto = [
    -(v(p[`${side}Hip`])[0] + v(p[`${side}Knee`])[0]) + (v(p[`${side}Ankle`])[0] ?? 0),
    v(p[`${side}Ankle`])[1] ?? 0,
    v(p[`${side}Ankle`])[2] ?? 0,
  ]
  const ankle = node(knee, [0, -SHIN_LEN, 0], ankleAuto)
  const sole = node(ankle, [0, -FOOT_H, 0.06], null)
  return { knee, ankle, sole }
}
function arm(side) {
  const sign = side === 'left' ? -1 : 1
  const sh = node(root, [sign * SHOULDER_HALF, TORSO_H - 0.03, 0], v(p[`${side}Shoulder`]))
  const el = node(sh, [0, -UPPERARM_LEN, 0], v(p[`${side}Elbow`]))
  const hand = node(el, [0, -FOREARM_LEN - 0.02, 0], null)
  return { el, hand }
}

const L = leg('left'), R = leg('right'), LA = arm('left'), RA = arm('right')
const head = node(root, [0, TORSO_H + 0.17, 0.01], null)
const chestTop = node(root, [0, TORSO_H + 0.04, 0], null)
const chestFront = node(root, [0, TORSO_H / 2, 0.2], null) // sticks out the front of the chest
const pelvisFront = node(root, [0, 0, 0.2], null)

root.parent.updateMatrixWorld(true)
const w = (o) => { const g = new Vector3(); o.getWorldPosition(g); return [g.x, g.y, g.z].map((n) => +n.toFixed(3)) }

console.log('head      ', w(head))
console.log('chestTop  ', w(chestTop))
console.log('chestFront', w(chestFront), '  (y<chest => face-down)')
console.log('pelvisFrnt', w(pelvisFront))
console.log('L knee    ', w(L.knee), ' R knee', w(R.knee))
console.log('L ankle   ', w(L.ankle), ' R ankle', w(R.ankle))
console.log('L sole    ', w(L.sole), ' R sole', w(R.sole))
console.log('L elbow   ', w(LA.el), ' R elbow', w(RA.el))
console.log('L hand    ', w(LA.hand), ' R hand', w(RA.hand))
const lows = [w(L.sole)[1], w(R.sole)[1], w(LA.hand)[1], w(RA.hand)[1], w(head)[1], w(LA.el)[1]]
console.log('min Y (ground-clamp shift) =', Math.min(...lows).toFixed(3))
