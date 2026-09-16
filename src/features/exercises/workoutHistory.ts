import type { WorkoutReport } from './workoutAnalyzer'

const STORAGE_KEY = 'posture-workout-history'
const MAX_ENTRIES = 100

export interface StoredWorkoutReport {
  id: string
  timestamp: number
  exerciseName: string
  report: WorkoutReport
}

function readHistory(): StoredWorkoutReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as StoredWorkoutReport[]) : []
  } catch {
    return []
  }
}

/** localStorage can throw (quota exceeded, private browsing) — losing history isn't worth crashing the app over. */
export function saveWorkoutReport(report: WorkoutReport): void {
  const history = readHistory()
  history.unshift({
    id: `${Date.now()}`,
    timestamp: Date.now(),
    exerciseName: report.exerciseName,
    report,
  })
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, MAX_ENTRIES)))
  } catch {
    // ignore — see note above
  }
}

export function getRecentWorkoutReports(limit = 10): StoredWorkoutReport[] {
  return readHistory().slice(0, limit)
}

export function getAllWorkoutReports(): StoredWorkoutReport[] {
  return readHistory()
}
