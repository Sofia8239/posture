import type { ExerciseId } from '../types'

export type VoiceIssue =
  // plank
  | 'hips_sag'
  | 'hips_raised'
  | 'elbows_wide'
  | 'neck_tilted'
  | 'shoulders_dropped'
  // shared between squat and plié squat
  | 'shallowDepth'
  | 'kneesCollapse'
  | 'roundedBack'
  | 'leaningBack'
  | 'heelsUp'
  | 'tooFast'
  // classic squat only
  | 'stanceNarrow'
  | 'stanceWide'
  | 'asymmetric'
  | 'forwardLean'
  | 'buttWink'
  // plié squat only (namespaced — "leaningForward" would otherwise collide with the lunge issue below)
  | 'plieNarrowStance'
  | 'plieToesNotTurned'
  | 'plieLeaningForward'
  // narrow-stance squat only
  | 'narrowSquatTooWide'
  // forward lunge
  | 'kneeOverToe'
  | 'backKneeTooHigh'
  | 'shortStep'
  | 'lungeLeaningForward'
  | 'notAlternating'
  // side lunge
  | 'sideLungeStraightLeg'
  | 'sideLungeShallow'
  // glute bridge (kneesCollapse and tooFast above are shared with the squat family)
  | 'gluteBridgeInsufficientHeight'
  | 'gluteBridgeHyperextension'
  | 'gluteBridgeAsymmetricHips'
  | 'good'

export type CorrectionIssue = Exclude<VoiceIssue, 'good'>

export type IssueLevel = 'first' | 'repeat' | 'persistent'

export interface SessionContext {
  sessionStartTime: number
  totalElapsedSec: number
  currentIssue: VoiceIssue | null
  currentIssueStartedAt: number | null
  lastSpokenAt: number
  lastSpokenPhrase: string
  lastSpokenIssue: VoiceIssue | null
  totalPhrasesSpoken: number
  issueHistory: Array<{
    issue: VoiceIssue
    startedAt: number
    endedAt: number | null
    resolvedByCorrection: boolean
  }>
  issueOccurrences: Partial<Record<CorrectionIssue, number>>
  /** Last few spoken phrases (any language) — lets decisionRules avoid repeating itself. */
  recentPhrases: string[]
  totalGoodTime: number
  streakOfGoodForm: number
  hasBeenPraisedRecently: boolean
  isStruggling: boolean
  isCrushingIt: boolean
}

export function createSessionContext(now = Date.now()): SessionContext {
  return {
    sessionStartTime: now,
    totalElapsedSec: 0,
    currentIssue: null,
    currentIssueStartedAt: null,
    lastSpokenAt: 0,
    lastSpokenPhrase: '',
    lastSpokenIssue: null,
    totalPhrasesSpoken: 0,
    issueHistory: [],
    issueOccurrences: {},
    recentPhrases: [],
    totalGoodTime: 0,
    streakOfGoodForm: 0,
    hasBeenPraisedRecently: false,
    isStruggling: false,
    isCrushingIt: false,
  }
}

/**
 * A problem is "first" the first time it ever shows up in the session, "persistent" once the
 * coach has already explained it and it is still going after a while (time to suggest a rest —
 * for a held static position that means 8+ continuous seconds; for a dynamic exercise, where
 * an issue only lives for the bottom fraction of one rep, it means the same mistake keeps
 * recurring rep after rep), and "repeat" for the ordinary reminders in between.
 */
export function getIssueLevel(context: SessionContext, issue: CorrectionIssue, now: number): IssueLevel {
  const startedAt = context.currentIssueStartedAt ?? now
  const occurrences = context.issueOccurrences[issue] ?? 1

  if (now - startedAt > 8000 || occurrences >= 3) {
    return 'persistent'
  }

  return occurrences <= 1 ? 'first' : 'repeat'
}

export interface CoachState {
  issue: VoiceIssue | null
  severity: number
  isGood: boolean
  elapsedSec: number
  targetSeconds: number
  phase: 'intro' | 'calibration' | 'training' | 'result'
  justRecovered: boolean
  /** Defaults to 'static' behavior (plank) when omitted. */
  exerciseKind?: 'static' | 'dynamic'
  /** Which exercise this is — needed to pick the right rep-praise bank for dynamic exercises. */
  exerciseId?: ExerciseId
  reps?: number
  targetReps?: number
  /** True for exactly one update() call, the frame a rep is completed. */
  repJustCompleted?: boolean
  /** Whether the just-completed rep had no flagged issue. Only meaningful when repJustCompleted is true. */
  repWasGood?: boolean
}
