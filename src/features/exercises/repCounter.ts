import type { RepPhase } from './types'

export interface RepThresholds {
  /** Angle (degrees) at/above which the tracked joint counts as fully extended ("top"). */
  top: number
  /** Angle (degrees) at/below which the tracked joint counts as the bottom of the rep. */
  bottom: number
}

export interface RepUpdateResult {
  phase: RepPhase
  /** True only on the single update where the rep count increments. */
  newRep: boolean
  count: number
  /** Time spent from the previous "top" to this "top" — only set when newRep is true. */
  cycleDurationMs: number | null
}

/** Minimum time between recognized phase changes, so pose jitter can't register as movement. */
const MIN_PHASE_CHANGE_GAP_MS = 300

/**
 * Tracks one joint angle through top -> descending -> bottom -> ascending -> top and
 * counts a rep every time it completes a full cycle that actually reached the bottom
 * threshold (so a small wobble near the top never counts as a rep).
 */
export class RepCounter {
  private currentPhase: RepPhase = 'top'
  private repCount = 0
  private lastPhaseChangeAt = 0
  private reachedBottom = false
  private lastTopAt: number | null = null

  update(currentAngle: number, thresholds: RepThresholds, now: number = Date.now()): RepUpdateResult {
    const candidatePhase = this.derivePhase(currentAngle, thresholds)

    if (candidatePhase === this.currentPhase) {
      return { phase: this.currentPhase, newRep: false, count: this.repCount, cycleDurationMs: null }
    }

    if (now - this.lastPhaseChangeAt < MIN_PHASE_CHANGE_GAP_MS) {
      return { phase: this.currentPhase, newRep: false, count: this.repCount, cycleDurationMs: null }
    }

    let newRep = false
    let cycleDurationMs: number | null = null

    if (candidatePhase === 'bottom') {
      this.reachedBottom = true
    }

    if (candidatePhase === 'top' && this.currentPhase === 'ascending' && this.reachedBottom) {
      this.repCount += 1
      this.reachedBottom = false
      newRep = true
      cycleDurationMs = this.lastTopAt !== null ? now - this.lastTopAt : null
      this.lastTopAt = now
    } else if (candidatePhase === 'top' && this.lastTopAt === null) {
      this.lastTopAt = now
    }

    this.currentPhase = candidatePhase
    this.lastPhaseChangeAt = now

    return { phase: this.currentPhase, newRep, count: this.repCount, cycleDurationMs }
  }

  private derivePhase(angle: number, thresholds: RepThresholds): RepPhase {
    if (angle >= thresholds.top) {
      return 'top'
    }

    if (angle <= thresholds.bottom) {
      return 'bottom'
    }

    // Between the two thresholds — direction is whatever we were already doing,
    // since a single angle reading can't tell descending from ascending on its own.
    return this.currentPhase === 'top' || this.currentPhase === 'descending' ? 'descending' : 'ascending'
  }

  reset(): void {
    this.currentPhase = 'top'
    this.repCount = 0
    this.lastPhaseChangeAt = 0
    this.reachedBottom = false
    this.lastTopAt = null
  }

  get phase(): RepPhase {
    return this.currentPhase
  }

  get count(): number {
    return this.repCount
  }
}
