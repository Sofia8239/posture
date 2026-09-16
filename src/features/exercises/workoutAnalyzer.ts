import { ruleCatalog, type DetectionReliability, type SeverityClass } from './analysis/ruleCatalog'
import type { MuscleZone } from './analysis/muscleMap'
import { getGeneralTipsFor } from './generalTips'
import type { RepRecord } from './sessionRecorder'
import type { PhraseEntry } from './voice/phraseBank'
import type { CorrectionIssue } from './voice/sessionContext'
import type { ExerciseId } from './types'

export interface ErrorSummary {
  issue: CorrectionIssue
  errorTitle: string
  description: string
  timesOccurred: number
  affectedRepsPercent: number
  severity: SeverityClass
  detection: DetectionReliability
  correctionAdvice: string
  affectedMuscles: MuscleZone[]
}

export interface WorkoutReport {
  exerciseName: string
  totalReps: number
  perfectReps: number
  minorIssuesReps: number
  moderateIssuesReps: number
  criticalIssuesReps: number
  durationSeconds: number
  errorsSummary: ErrorSummary[]
  strengthAreas: string[]
  personalizedAdvice: string
  nextGoalSuggestion: string
  recoveryTips: PhraseEntry[]
}

/** Which issues each exercise's rule set can actually raise — used to work out "strengths"
 * (checks that were live and simply never fired), not to gate detection itself. */
export const ISSUES_BY_EXERCISE: Record<ExerciseId, CorrectionIssue[]> = {
  plank: ['hips_sag', 'hips_raised', 'elbows_wide', 'neck_tilted', 'shoulders_dropped'],
  squat: ['shallowDepth', 'kneesCollapse', 'roundedBack', 'leaningBack', 'forwardLean', 'buttWink', 'heelsUp', 'stanceNarrow', 'stanceWide', 'asymmetric', 'tooFast'],
  'plie-squat': ['shallowDepth', 'kneesCollapse', 'roundedBack', 'leaningBack', 'plieLeaningForward', 'heelsUp', 'plieNarrowStance', 'plieToesNotTurned', 'tooFast'],
  'narrow-squat': ['shallowDepth', 'kneesCollapse', 'roundedBack', 'leaningBack', 'heelsUp', 'narrowSquatTooWide', 'tooFast'],
  'forward-lunge': ['kneeOverToe', 'backKneeTooHigh', 'shortStep', 'lungeLeaningForward', 'notAlternating'],
  'side-lunge': ['sideLungeShallow', 'sideLungeStraightLeg', 'kneesCollapse'],
  'glute-bridge': ['gluteBridgeInsufficientHeight', 'gluteBridgeHyperextension', 'gluteBridgeAsymmetricHips', 'kneesCollapse', 'tooFast'],
}

const SEVERITY_RANK: Record<SeverityClass, number> = { critical: 3, moderate: 2, minor: 1 }

function humanizeList(items: string[]): string {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  return `${items.slice(0, -1).join(', ')} і ${items[items.length - 1]}`
}

function generatePersonalizedAdvice(topErrors: ErrorSummary[], strengths: string[], perfectReps: number, totalReps: number): string {
  if (totalReps === 0) {
    return 'Цього разу не вийшло зробити жодного повного повторення — не страшно, спробуй ще раз, коли будеш готова, я стежитиму.'
  }

  if (topErrors.length === 0) {
    const streak = perfectReps === totalReps ? 'кожне повторення було бездоганним' : 'форма трималась дуже стабільно'
    return `Вражаюча техніка — ${streak}. Ти справжня майстриня цієї вправи. Спробуй наступного разу трохи збільшити кількість повторень, форма явно готова до цього.`
  }

  const top = topErrors[0]
  if (strengths.length > 0) {
    return `Ти показала гарну базову техніку. Стабільно трималось: ${humanizeList(strengths.slice(0, 2)).toLowerCase()}. Головне, над чим варто попрацювати — ${top.errorTitle.toLowerCase()}. ${top.correctionAdvice}`
  }

  const secondMention = topErrors.length > 1 ? ` Також кілька разів проявилось: ${topErrors[1].errorTitle.toLowerCase()}.` : ''
  return `Головне, над чим варто попрацювати цього разу — ${top.errorTitle.toLowerCase()}. ${top.correctionAdvice}${secondMention} Не поспішай зі збільшенням кількості повторень — краще зробити менше, але з чистою формою.`
}

function generateNextGoal(topErrors: ErrorSummary[], totalReps: number): string {
  if (totalReps === 0) {
    return 'Постав собі ціль дійти до кінця першого підходу — навіть кілька чистих повторень уже прогрес.'
  }

  if (topErrors.length === 0) {
    return `${totalReps + Math.max(3, Math.round(totalReps * 0.2))} повторень із такою ж якістю техніки.`
  }

  const top = topErrors[0]
  return `${totalReps} повторень без жодного разу з помилкою «${top.errorTitle.toLowerCase()}» (цього разу було ${top.timesOccurred} з ${totalReps} — мета 0).`
}

export function analyzeWorkout(reps: RepRecord[], exerciseId: ExerciseId, exerciseName: string): WorkoutReport {
  const totalReps = reps.length
  const firstStart = reps[0]?.startTime
  const lastEnd = reps[reps.length - 1]?.endTime
  const durationSeconds = firstStart && lastEnd ? Math.max(0, Math.round((lastEnd - firstStart) / 1000)) : 0

  let perfectReps = 0
  let minorIssuesReps = 0
  let moderateIssuesReps = 0
  let criticalIssuesReps = 0

  const errorFrequency = new Map<CorrectionIssue, number>()
  const errorAffectedReps = new Map<CorrectionIssue, Set<number>>()

  for (const rep of reps) {
    if (rep.errors.length === 0) {
      perfectReps += 1
      continue
    }

    let worstSeverity: SeverityClass = 'minor'
    for (const detected of rep.errors) {
      errorFrequency.set(detected.issue, (errorFrequency.get(detected.issue) ?? 0) + 1)
      const repsForIssue = errorAffectedReps.get(detected.issue) ?? new Set<number>()
      repsForIssue.add(rep.repNumber)
      errorAffectedReps.set(detected.issue, repsForIssue)

      const catalogSeverity = ruleCatalog[detected.issue]?.severity ?? 'minor'
      if (SEVERITY_RANK[catalogSeverity] > SEVERITY_RANK[worstSeverity]) {
        worstSeverity = catalogSeverity
      }
    }

    if (worstSeverity === 'critical') criticalIssuesReps += 1
    else if (worstSeverity === 'moderate') moderateIssuesReps += 1
    else minorIssuesReps += 1
  }

  const allErrors: ErrorSummary[] = Array.from(errorAffectedReps.entries()).map(([issue, affectedReps]) => {
    const catalog = ruleCatalog[issue]
    return {
      issue,
      errorTitle: catalog.errorTitle,
      description: catalog.description,
      timesOccurred: errorFrequency.get(issue) ?? 0,
      affectedRepsPercent: totalReps > 0 ? Math.round((affectedReps.size / totalReps) * 100) : 0,
      severity: catalog.severity,
      detection: catalog.detection,
      correctionAdvice: catalog.correctionAdvice,
      affectedMuscles: catalog.affectedMuscles,
    }
  })

  allErrors.sort((a, b) => {
    if (SEVERITY_RANK[b.severity] !== SEVERITY_RANK[a.severity]) {
      return SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity]
    }
    return b.timesOccurred - a.timesOccurred
  })

  const topErrors = allErrors.slice(0, 3)

  const relevantIssues = ISSUES_BY_EXERCISE[exerciseId] ?? []
  const firedIssues = new Set(errorFrequency.keys())
  const strengthAreas = relevantIssues
    .filter((issue) => !firedIssues.has(issue))
    .map((issue) => ruleCatalog[issue])
    .filter((entry) => entry.severity !== 'minor')
    .map((entry) => entry.strengthLabel)

  return {
    exerciseName,
    totalReps,
    perfectReps,
    minorIssuesReps,
    moderateIssuesReps,
    criticalIssuesReps,
    durationSeconds,
    errorsSummary: topErrors,
    strengthAreas,
    personalizedAdvice: generatePersonalizedAdvice(topErrors, strengthAreas, perfectReps, totalReps),
    nextGoalSuggestion: generateNextGoal(topErrors, totalReps),
    recoveryTips: getGeneralTipsFor(exerciseId),
  }
}
