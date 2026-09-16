export type FitnessGoal = 'lose-weight' | 'build-muscle' | 'flexibility' | 'back-health' | 'maintain-form' | 'rehab'
export type ExperienceFrequency = 'first-time' | 'occasional' | 'regular'
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'
export type TrainLocation = 'home' | 'gym' | 'outdoor'
export type Equipment = 'yoga-mat' | 'dumbbells' | 'resistance-bands' | 'pull-up-bar' | 'none'
export type Limitation = 'knees' | 'back' | 'shoulders' | 'pregnancy' | 'hypertension' | 'none'

export interface UserProfile {
  name: string
  age: number | null
  gender: 'female' | 'male' | 'other' | null
  experienceFrequency: ExperienceFrequency
  experienceLevel: ExperienceLevel
  goals: FitnessGoal[]
  minutesPerDay: number
  daysPerWeek: number
  trainLocation: TrainLocation
  equipment: Equipment[]
  limitations: Limitation[]
  completedAt: number
}

export function createEmptyProfileDraft(): Partial<UserProfile> {
  return {
    name: '',
    age: null,
    gender: null,
    experienceFrequency: 'first-time',
    experienceLevel: 'beginner',
    goals: [],
    minutesPerDay: 20,
    daysPerWeek: 3,
    trainLocation: 'home',
    equipment: [],
    limitations: [],
  }
}
