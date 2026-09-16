import { getActivityLog } from './activityLog'
import { exerciseConfigs } from './exerciseConfigs'
import { catalogExercises } from './catalogExercises'
import { getAllWorkoutReports } from './workoutHistory'
import { muscleZoneLabels } from './analysis/muscleZoneLabels'
import type { MuscleZone } from './analysis/muscleMap'

export interface DayActivity {
  date: string
  dayLabel: string
  minutes: number
  workoutsCount: number
  isToday: boolean
}

export interface MuscleGroupShare {
  zone: MuscleZone
  label: string
  count: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
}

export interface ProgressStats {
  totalWorkouts: number
  totalMinutes: number
  currentStreak: number
  longestStreak: number
  favoriteExerciseName: string | null
  last7Days: DayActivity[]
  muscleGroupDistribution: MuscleGroupShare[]
  achievements: Achievement[]
}

const dayLabels = ['нд', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']

function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDays(date: Date, delta: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + delta)
  return next
}

function calculateStreaks(activeDates: Set<string>): { current: number; longest: number } {
  if (activeDates.size === 0) {
    return { current: 0, longest: 0 }
  }

  const sorted = Array.from(activeDates).sort()
  let longest = 1
  let run = 1
  for (let i = 1; i < sorted.length; i += 1) {
    const diffDays = Math.round((parseDate(sorted[i]).getTime() - parseDate(sorted[i - 1]).getTime()) / 86_400_000)
    run = diffDays === 1 ? run + 1 : 1
    longest = Math.max(longest, run)
  }

  const today = new Date()
  let cursor = activeDates.has(formatDate(today)) ? today : addDays(today, -1)
  if (!activeDates.has(formatDate(cursor))) {
    return { current: 0, longest }
  }

  let current = 0
  while (activeDates.has(formatDate(cursor))) {
    current += 1
    cursor = addDays(cursor, -1)
  }

  return { current, longest }
}

export function computeProgressStats(): ProgressStats {
  const activityLog = getActivityLog()
  const workoutReports = getAllWorkoutReports()

  const totalWorkouts = activityLog.length
  const totalMinutes = Math.round(activityLog.reduce((sum, entry) => sum + entry.durationSeconds, 0) / 60)

  const activeDates = new Set(activityLog.map((entry) => entry.date))
  const { current: currentStreak, longest: longestStreak } = calculateStreaks(activeDates)

  const exerciseFrequency = new Map<string, number>()
  const exerciseNameById = new Map<string, string>()
  for (const entry of activityLog) {
    exerciseFrequency.set(entry.exerciseId, (exerciseFrequency.get(entry.exerciseId) ?? 0) + 1)
    exerciseNameById.set(entry.exerciseId, entry.exerciseName)
  }
  let favoriteExerciseName: string | null = null
  let favoriteCount = 0
  for (const [id, count] of exerciseFrequency) {
    if (count > favoriteCount) {
      favoriteCount = count
      favoriteExerciseName = exerciseNameById.get(id) ?? null
    }
  }

  const today = new Date()
  const last7Days: DayActivity[] = []
  for (let i = 6; i >= 0; i -= 1) {
    const date = addDays(today, -i)
    const dateStr = formatDate(date)
    const entriesForDay = activityLog.filter((entry) => entry.date === dateStr)
    last7Days.push({
      date: dateStr,
      dayLabel: dayLabels[date.getDay()],
      minutes: Math.round(entriesForDay.reduce((sum, entry) => sum + entry.durationSeconds, 0) / 60),
      workoutsCount: entriesForDay.length,
      isToday: i === 0,
    })
  }

  const muscleTally = new Map<MuscleZone, number>()
  for (const entry of activityLog) {
    const targetMuscles =
      exerciseConfigs.find((item) => item.id === entry.exerciseId)?.targetMuscles ??
      catalogExercises.find((item) => item.id === entry.exerciseId)?.targetMuscles ??
      []
    targetMuscles.forEach((zone) => {
      muscleTally.set(zone, (muscleTally.get(zone) ?? 0) + 1)
    })
  }
  const muscleGroupDistribution: MuscleGroupShare[] = Array.from(muscleTally.entries())
    .map(([zone, count]) => ({ zone, label: muscleZoneLabels[zone], count }))
    .sort((a, b) => b.count - a.count)

  const firstActivityTimestamp = activityLog.length > 0 ? Math.min(...activityLog.map((entry) => entry.timestamp)) : null
  const daysSinceFirstActivity = firstActivityTimestamp ? Math.floor((Date.now() - firstActivityTimestamp) / 86_400_000) : 0
  const hasFlawlessSession = workoutReports.some((stored) => stored.report.totalReps > 0 && stored.report.perfectReps === stored.report.totalReps)
  const triedAllExercises = exerciseConfigs.every((config) => exerciseFrequency.has(config.id))

  const achievements: Achievement[] = [
    { id: 'first-workout', title: 'Перше тренування', description: 'Завершила своє перше тренування в Posture.', icon: '🎉', unlocked: totalWorkouts >= 1 },
    { id: 'week-streak', title: 'Тиждень поспіль', description: '7 днів тренувань підряд.', icon: '🔥', unlocked: longestStreak >= 7 },
    { id: 'month-in-app', title: 'Місяць з Posture', description: '30 днів відтоді, як почала тренуватись тут.', icon: '📅', unlocked: daysSinceFirstActivity >= 30 },
    { id: 'hundred-minutes', title: '100 хвилин тренувань', description: 'Сумарно 100+ хвилин тренувань.', icon: '⏱️', unlocked: totalMinutes >= 100 },
    { id: 'flawless-session', title: 'Бездоганна сесія', description: 'Жодної помилки за все тренування.', icon: '✨', unlocked: hasFlawlessSession },
    { id: 'tried-everything', title: 'Спробувала все', description: 'Виконала кожну базову вправу хоч раз.', icon: '🗺️', unlocked: triedAllExercises },
  ]

  return {
    totalWorkouts,
    totalMinutes,
    currentStreak,
    longestStreak,
    favoriteExerciseName,
    last7Days,
    muscleGroupDistribution,
    achievements,
  }
}
