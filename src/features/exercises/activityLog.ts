const STORAGE_KEY = 'posture-activity-log'
const MAX_ENTRIES = 500

export interface ActivityRecord {
  /** Local calendar date, 'YYYY-MM-DD' — used for streaks/calendar, not UTC-shifted. */
  date: string
  /** Either a camera-tracked ExerciseId or a catalogExercises id — this log doesn't
   * care which, it just tallies completed sessions for streaks/calendar/frequency. */
  exerciseId: string
  exerciseName: string
  durationSeconds: number
  timestamp: number
}

function localDateString(timestamp: number): string {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function readLog(): ActivityRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ActivityRecord[]) : []
  } catch {
    return []
  }
}

/**
 * Coarse, exercise-agnostic completion log — every finished session (static or dynamic)
 * lands here with just enough to drive streaks/calendar/frequency stats. Kept separate
 * from workoutHistory's rich WorkoutReport, which only exists for dynamic (rep-based)
 * exercises and carries real per-issue analysis; this log exists so plank sessions (and
 * any future non-analyzed exercise) still count toward progress.
 */
export function recordActivity(exerciseId: string, exerciseName: string, durationSeconds: number, now = Date.now()): void {
  if (durationSeconds <= 0) {
    return
  }

  const log = readLog()
  log.push({ date: localDateString(now), exerciseId, exerciseName, durationSeconds, timestamp: now })

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(log.slice(-MAX_ENTRIES)))
  } catch {
    // localStorage can throw (quota exceeded, private browsing) — losing the log isn't worth crashing over.
  }
}

export function getActivityLog(): ActivityRecord[] {
  return readLog()
}
