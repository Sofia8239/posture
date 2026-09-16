import type {
  Equipment,
  ExperienceFrequency,
  ExperienceLevel,
  FitnessGoal,
  Limitation,
  TrainLocation,
} from '../../store/userProfile'

export const experienceFrequencyOptions: Array<{ value: ExperienceFrequency; label: string }> = [
  { value: 'first-time', label: 'Перший раз' },
  { value: 'occasional', label: 'Тренуюсь зрідка' },
  { value: 'regular', label: 'Регулярно, вже деякий час' },
]

export const experienceLevelOptions: Array<{ value: ExperienceLevel; label: string }> = [
  { value: 'beginner', label: 'Новачок' },
  { value: 'intermediate', label: 'Середній рівень' },
  { value: 'advanced', label: 'Просунутий' },
]

export const goalOptions: Array<{ value: FitnessGoal; label: string }> = [
  { value: 'lose-weight', label: 'Схуднути' },
  { value: 'build-muscle', label: 'Набрати м’язову масу' },
  { value: 'flexibility', label: 'Покращити гнучкість' },
  { value: 'back-health', label: 'Зміцнити спину / прибрати біль' },
  { value: 'maintain-form', label: 'Тримати форму' },
  { value: 'rehab', label: 'Реабілітація після травми' },
]

export const minutesPerDayOptions = [10, 20, 30, 45]

export const daysPerWeekOptions = [2, 3, 4, 5]

export const trainLocationOptions: Array<{ value: TrainLocation; label: string }> = [
  { value: 'home', label: 'Вдома' },
  { value: 'gym', label: 'У залі' },
  { value: 'outdoor', label: 'Надворі' },
]

export const equipmentOptions: Array<{ value: Equipment; label: string }> = [
  { value: 'yoga-mat', label: 'Килимок для йоги' },
  { value: 'dumbbells', label: 'Гантелі' },
  { value: 'resistance-bands', label: 'Гумки для фітнесу' },
  { value: 'pull-up-bar', label: 'Турнік / брусся' },
  { value: 'none', label: 'Нічого немає' },
]

export const limitationOptions: Array<{ value: Limitation; label: string }> = [
  { value: 'knees', label: 'Проблеми з колінами' },
  { value: 'back', label: 'Проблеми зі спиною / попереком' },
  { value: 'shoulders', label: 'Проблеми з плечима' },
  { value: 'pregnancy', label: 'Вагітність' },
  { value: 'hypertension', label: 'Гіпертонія' },
  { value: 'none', label: 'Немає обмежень' },
]

export function toggleInList<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}
