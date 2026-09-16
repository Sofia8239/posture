import { MuscleType, type Muscle } from 'react-body-highlighter'

/**
 * react-body-highlighter ships only English muscle names — this maps every
 * muscle it knows about to a Ukrainian label for display in the UI.
 */
export const muscleLabelsUA: Record<Muscle, string> = {
  trapezius: 'Трапеції',
  'upper-back': 'Верх спини',
  'lower-back': 'Поперек',
  chest: 'Груди',
  biceps: 'Біцепси',
  triceps: 'Трицепси',
  forearm: 'Передпліччя',
  'back-deltoids': 'Задні дельти',
  'front-deltoids': 'Передні дельти',
  abs: 'Прес',
  obliques: 'Косі м’язи',
  adductor: 'Привідні м’язи',
  hamstring: 'Задня поверхня стегна',
  quadriceps: 'Квадрицепс',
  abductors: 'Відвідні м’язи',
  calves: 'Литки',
  gluteal: 'Сідниці',
  head: 'Голова',
  neck: 'Шия',
  knees: 'Коліна',
  'left-soleus': 'Литка (ліва)',
  'right-soleus': 'Литка (права)',
}

export function getMuscleLabel(muscle: Muscle): string {
  return muscleLabelsUA[muscle] ?? muscle
}

/**
 * Curated subset for the "Прогрес по зонах" panel — the compound groups worth
 * showing progress on, not every individual polygon the silhouette exposes
 * (e.g. we skip knees/head/left-right soleus split here).
 */
export const trackedMuscleGroups: Muscle[] = [
  MuscleType.NECK,
  MuscleType.CHEST,
  MuscleType.FRONT_DELTOIDS,
  MuscleType.BICEPS,
  MuscleType.TRICEPS,
  MuscleType.ABS,
  MuscleType.OBLIQUES,
  MuscleType.UPPER_BACK,
  MuscleType.LOWER_BACK,
  MuscleType.GLUTEAL,
  MuscleType.QUADRICEPS,
  MuscleType.HAMSTRING,
  MuscleType.CALVES,
]

export const progressionLevels = ['Новачок', 'Бронза', 'Срібло', 'Золото', 'Платина', 'Діамант'] as const

export type ProgressionLevel = (typeof progressionLevels)[number]

/** Every tracked muscle starts fresh — real progress will replace this once training history exists. */
export function createInitialMuscleLevels(): Record<Muscle, number> {
  return Object.fromEntries(Object.values(MuscleType).map((muscle) => [muscle, 0])) as Record<Muscle, number>
}
