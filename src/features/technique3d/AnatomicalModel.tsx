import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useAnimations, useGLTF } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import type { Group, Mesh, MeshStandardMaterial } from 'three'
import { muscleColors, type MuscleZone } from '../exercises/analysis/muscleMap'
import { loadIntensityAtPhase, primarySecondaryMusclesAtPhase } from './animationUtils'
import { scrubToPhase, startScrubbing, stopScrubbing } from './animationScrub'
import type { PoseKeyframe } from './types'

export interface AnatomicalModelProps {
  /** Path to a rigged anatomical .glb, e.g. served from public/models/. */
  url: string
  phase: number
  keyframes: PoseKeyframe[]
  /** Maps this asset's actual mesh names to the app's MuscleZone vocabulary, e.g.
   * `{ quadriceps_L: 'quadriceps', quadriceps_R: 'quadriceps', gluteus_maximus_L: 'glutes' }`.
   * There's no universal naming convention across anatomical assets, so this is filled
   * in once per model — open the file in a glTF viewer (or log `scene` here once in
   * dev) to read off its real mesh names. */
  meshNameToZone: Record<string, MuscleZone>
  /** Name of the AnimationClip embedded in the .glb to scrub through by phase (0–1),
   * e.g. 'Squat'. Omit if the asset is a static (unrigged) mesh — muscle coloring still
   * works, it just won't move. */
  clipName?: string
}

/**
 * Loads a real anatomical model and colors its named meshes by muscle activation,
 * scrubbing an embedded animation clip by `phase` the same way AnimatedHumanoid does
 * with its procedural pose. Inert until an exercise sets `modelUrl` on its
 * ExerciseAnimation (see types.ts) — TechniqueViewer falls back to the procedural
 * AnimatedHumanoid rig until then, so this component is never invoked without a real
 * asset to load.
 *
 * To wire one in:
 * 1. Get a rigged, per-region-mesh anatomical .glb — not one fused body mesh, since
 *    each muscle group needs its own mesh/material to color independently. Z-Anatomy
 *    (open source, Blender, CC BY-SA — zygotebody-derived) is the strongest free
 *    starting point and already separates major muscle groups; anatomical assets on
 *    Sketchfab/CGTrader vary in whether muscles are split out, so check before buying.
 * 2. Drop the exported .glb in public/models/, e.g. public/models/squat.glb.
 * 3. Fill in `meshNameToZone` for that file's actual mesh names.
 * 4. Set `modelUrl` (and `clipName` if the file has a baked animation clip) on that
 *    exercise's ExerciseAnimation in animations/*.ts. No other wiring needed.
 */
export function AnatomicalModel({ url, phase, keyframes, meshNameToZone, clipName }: AnatomicalModelProps) {
  const { scene, animations } = useGLTF(url)
  const groupRef = useRef<Group>(null)

  // SkeletonUtils.clone (not Object3D.clone) is required for rigged models — a plain
  // clone doesn't rebind SkinnedMesh geometry to its Skeleton, so bones would move but
  // the mesh wouldn't follow. Cloning also keeps this instance's per-frame material
  // mutations (below) from leaking into useGLTF's shared cache.
  const cloned = useMemo(() => SkeletonUtils.clone(scene), [scene])

  const meshesByZone = useMemo(() => {
    const lookup = new Map<MuscleZone, Mesh[]>()
    cloned.traverse((child) => {
      if (!(child as Partial<Mesh>).isMesh) {
        return
      }
      const zone = meshNameToZone[child.name]
      if (!zone) {
        return
      }
      const list = lookup.get(zone) ?? []
      list.push(child as Mesh)
      lookup.set(zone, list)
    })
    return lookup
  }, [cloned, meshNameToZone])

  const { actions, mixer } = useAnimations(animations, groupRef)

  useEffect(() => {
    if (!clipName) {
      return
    }
    const action = actions[clipName]
    startScrubbing(action)
    return () => stopScrubbing(action)
  }, [actions, clipName])

  useFrame(() => {
    if (clipName) {
      scrubToPhase(actions[clipName], mixer, phase)
    }

    const { primary, secondary } = primarySecondaryMusclesAtPhase(keyframes, phase)
    const loadIntensity = loadIntensityAtPhase(keyframes, phase)
    const pulse = loadIntensity * (0.7 + 0.3 * Math.sin(phase * Math.PI * 16))

    meshesByZone.forEach((meshes, zone) => {
      const isPrimary = primary.includes(zone)
      const isSecondary = !isPrimary && secondary.includes(zone)
      const tier = isPrimary ? muscleColors.active : isSecondary ? muscleColors.secondary : muscleColors.base
      const emissiveIntensity = isPrimary ? 0.35 + pulse * 0.55 : isSecondary ? 0.15 : 0

      for (const mesh of meshes) {
        const material = mesh.material as MeshStandardMaterial | undefined
        if (!material?.color) {
          continue
        }
        material.color.set(tier.fill)
        material.emissive?.set(tier.fill)
        material.emissiveIntensity = emissiveIntensity
      }
    })
  })

  return <primitive ref={groupRef} object={cloned} />
}
