import type { AnimationAction, AnimationMixer } from 'three'

/** AnimationAction/AnimationMixer are Three.js's own imperative, mutable API — scrubbing
 * a clip by an external phase value means setting `.time` every frame, there's no
 * non-mutating equivalent. Shared between AnatomicalModel and MixamoCharacter, which both
 * scrub an embedded clip by the same 0-1 `phase` TechniqueViewer already drives. */
export function startScrubbing(action: AnimationAction | null | undefined): void {
  if (!action) {
    return
  }
  action.reset().play()
  action.paused = true
}

export function stopScrubbing(action: AnimationAction | null | undefined): void {
  action?.stop()
}

export function scrubToPhase(action: AnimationAction | null | undefined, mixer: AnimationMixer, phase: number): void {
  if (!action) {
    return
  }
  action.time = phase * action.getClip().duration
  mixer.update(0)
}
