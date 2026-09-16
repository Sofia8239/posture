import type { CorrectionIssue } from '../voice/sessionContext'

/** Muscle zones the live overlay can draw and color. Legs/glutes/core are the ones any
 * correction issue can actually light up red today; chest/arms are drawn for a complete,
 * recognizable body (and so future upper-body exercises have zones ready to use) but
 * currently only ever show at "base" opacity since no squat/lunge issue implicates them. */
export type MuscleZone =
  | 'quadriceps'
  | 'adductors'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'abs'
  | 'obliques'
  | 'lowerBack'
  | 'chest'
  | 'deltoids'
  | 'biceps'
  | 'triceps'
  | 'forearms'

/** Which muscle zone(s) light up red when a given correction issue is active. */
export const issueToMuscleZones: Partial<Record<CorrectionIssue, MuscleZone[]>> = {
  shallowDepth: ['quadriceps', 'glutes'],
  kneesCollapse: ['adductors', 'glutes'],
  roundedBack: ['lowerBack', 'abs'],
  leaningBack: ['lowerBack'],
  heelsUp: ['calves'],
  stanceNarrow: ['adductors'],
  stanceWide: ['quadriceps'],
  asymmetric: ['quadriceps', 'glutes'],
  forwardLean: ['lowerBack', 'abs'],
  buttWink: ['lowerBack', 'hamstrings'],
  plieNarrowStance: ['adductors'],
  plieToesNotTurned: ['adductors'],
  plieLeaningForward: ['lowerBack', 'abs'],
  narrowSquatTooWide: ['quadriceps'],
  kneeOverToe: ['quadriceps'],
  backKneeTooHigh: ['glutes', 'hamstrings'],
  shortStep: ['quadriceps'],
  lungeLeaningForward: ['lowerBack', 'abs'],
  sideLungeStraightLeg: ['adductors'],
  sideLungeShallow: ['glutes', 'adductors'],
  gluteBridgeInsufficientHeight: ['glutes', 'hamstrings'],
  gluteBridgeHyperextension: ['lowerBack'],
  gluteBridgeAsymmetricHips: ['glutes'],
}

export const muscleColors = {
  base: { fill: '#FFB4A2', opacity: 0.15 },
  /** Secondary movers / stabilizers — lit up alongside the primary target, one step down. */
  secondary: { fill: '#FFA24D', opacity: 0.4 },
  active: { fill: '#D6006E', opacity: 0.35 },
  problem: { fill: '#E63946', opacity: 0.6 },
} as const
