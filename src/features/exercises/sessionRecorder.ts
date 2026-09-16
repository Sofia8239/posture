import type { CorrectionIssue } from './voice/sessionContext'

export interface DetectedErrorRecord {
  issue: CorrectionIssue
  severity: number
  timestamp: number
}

export interface RepRecord {
  repNumber: number
  startTime: number
  endTime: number | null
  errors: DetectedErrorRecord[]
  wasGood: boolean
}

/**
 * Records what happened during each rep of a set — which issues showed up and when —
 * so a full report can be built once the set is over. Lives for the duration of one
 * training phase; the caller (useDynamicExerciseAnalyzer) resets it alongside the rep
 * counter whenever a new session starts.
 */
export class SessionRecorder {
  private reps: RepRecord[] = []
  private inProgressRep: RepRecord | null = null

  /** Call every frame while a rep is in progress — `repInProgressNumber` is `completedReps + 1`. */
  recordFrame(repInProgressNumber: number, issue: CorrectionIssue | null, severity: number, now: number): void {
    if (!this.inProgressRep || this.inProgressRep.repNumber !== repInProgressNumber) {
      this.inProgressRep = { repNumber: repInProgressNumber, startTime: now, endTime: null, errors: [], wasGood: true }
    }

    if (!issue) {
      return
    }

    this.inProgressRep.wasGood = false
    const lastError = this.inProgressRep.errors[this.inProgressRep.errors.length - 1]
    // Collapse consecutive frames of the *same* issue into one entry — we care that
    // "knees collapsed" happened once this rep, not that it was true for 40 frames in a row.
    if (!lastError || lastError.issue !== issue) {
      this.inProgressRep.errors.push({ issue, severity, timestamp: now })
    }
  }

  /** Call the moment a rep completes — `completedRepNumber` matches RepCounter's `count`. */
  completeRep(completedRepNumber: number, now: number): void {
    if (this.inProgressRep && this.inProgressRep.repNumber === completedRepNumber) {
      this.inProgressRep.endTime = now
      this.reps.push(this.inProgressRep)
      this.inProgressRep = null
    }
  }

  getReps(): RepRecord[] {
    return this.reps
  }

  reset(): void {
    this.reps = []
    this.inProgressRep = null
  }
}
