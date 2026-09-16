import type { Muscle } from 'react-body-highlighter'
import type { MuscleZone } from '../exercises/analysis/muscleMap'

/**
 * react-body-highlighter's muscle vocabulary and the app's own `MuscleZone` vocabulary
 * (used by exerciseConfigs' targetMuscles) were built independently and don't share
 * naming. This bridges the two so a BodyMap selection can filter the exercise catalog.
 * Entries that map to `[]` are anatomically real zones the silhouette exposes but that
 * no exercise in the catalog currently targets (upper back, chest, arms, shoulders,
 * head/neck/knees) — selecting only those is expected to yield an empty result today.
 */
export const muscleToZones: Record<Muscle, MuscleZone[]> = {
  trapezius: [],
  'upper-back': [],
  'lower-back': ['lowerBack'],
  chest: ['chest'],
  biceps: ['biceps'],
  triceps: ['triceps'],
  forearm: ['forearms'],
  'back-deltoids': ['deltoids'],
  'front-deltoids': ['deltoids'],
  abs: ['abs'],
  obliques: ['obliques'],
  adductor: ['adductors'],
  hamstring: ['hamstrings'],
  quadriceps: ['quadriceps'],
  abductors: ['glutes'],
  calves: ['calves'],
  gluteal: ['glutes'],
  head: [],
  neck: [],
  knees: [],
  'left-soleus': ['calves'],
  'right-soleus': ['calves'],
}

export function musclesToZones(muscles: Muscle[]): MuscleZone[] {
  const zones = new Set<MuscleZone>()
  muscles.forEach((muscle) => {
    muscleToZones[muscle].forEach((zone) => zones.add(zone))
  })
  return Array.from(zones)
}
