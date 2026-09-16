import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useAnimations, useGLTF } from '@react-three/drei'
import type { Group } from 'three'
import { scrubToPhase, startScrubbing, stopScrubbing } from './animationScrub'

export const MIXAMO_CHARACTER_URL = '/models/character.glb'

export interface MixamoCharacterProps {
  /** Path to a Mixamo-exported animation-only .glb (Skin: Without Skin), e.g.
   * '/models/animations/squat.glb'. Its embedded clip is retargeted onto the shared
   * character rig and scrubbed by `phase`, the same 0-1 value AnimatedHumanoid/
   * AnatomicalModel already drive from TechniqueViewer's playback loop. */
  animationUrl: string
  phase: number
}

/**
 * Renders the shared Mixamo character (public/models/character.glb) playing a
 * per-exercise animation clip loaded from its own animation-only .glb. Inert until an
 * exercise sets `mixamoAnimationUrl` on its ExerciseAnimation (see types.ts) —
 * TechniqueViewer falls back to the procedural AnimatedHumanoid rig until both files
 * exist, so this component is never invoked without real assets to load.
 *
 * To wire one in, see mixamo_and_camera_prompt.md's "Крок 1-2" for the Mixamo export
 * settings. Short version:
 * 1. Download a Mixamo character in T-pose (Skin: With Skin) as character.glb, drop it
 *    in public/models/.
 * 2. Download that exercise's animation (Skin: Without Skin, In Place: Yes) as its own
 *    .glb, drop it in public/models/animations/.
 * 3. Set `mixamoAnimationUrl` on that exercise's ExerciseAnimation in animations/*.ts.
 * No other wiring needed — TechniqueViewer picks this component up automatically.
 */
export function MixamoCharacter({ animationUrl, phase }: MixamoCharacterProps) {
  // Unlike AnatomicalModel, this doesn't SkeletonUtils.clone the loaded scene: TechniqueViewer
  // only ever mounts one MixamoCharacter at a time (switching exercises unmounts the old one
  // first), so there's no concurrent instance to fight over the cached scene/skeleton.
  const { scene } = useGLTF(MIXAMO_CHARACTER_URL)
  const { animations } = useGLTF(animationUrl)
  const groupRef = useRef<Group>(null)

  const { actions, mixer } = useAnimations(animations, groupRef)
  const clipName = animations[0]?.name

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
  })

  return <primitive ref={groupRef} object={scene} />
}

useGLTF.preload(MIXAMO_CHARACTER_URL)
