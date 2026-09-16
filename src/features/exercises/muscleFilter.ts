import type { ExerciseConfig } from './exerciseConfigs'
import type { MuscleZone } from './analysis/muscleMap'

/**
 * Ranks exercises by relevance to the selected zones: any overlap qualifies (OR, not
 * AND — requiring every selected zone to match a single exercise would empty the list
 * almost immediately), ordered by how many selected zones it hits, then by how large a
 * share of the exercise's own targets those are.
 */
export function rankExercisesByZones(configs: ExerciseConfig[], zones: MuscleZone[]): ExerciseConfig[] {
  if (zones.length === 0) {
    return []
  }

  return configs
    .map((config) => ({
      config,
      matchCount: config.targetMuscles.filter((muscle) => zones.includes(muscle)).length,
    }))
    .filter((item) => item.matchCount > 0)
    .sort((a, b) => {
      if (b.matchCount !== a.matchCount) {
        return b.matchCount - a.matchCount
      }
      const aRatio = a.matchCount / a.config.targetMuscles.length
      const bRatio = b.matchCount / b.config.targetMuscles.length
      return bRatio - aRatio
    })
    .map((item) => item.config)
}
