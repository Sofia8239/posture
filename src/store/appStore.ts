import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserProfile } from './userProfile'

interface AppState {
  userProfile: UserProfile | null
  isOnboardingComplete: boolean
  completeOnboarding: (profile: UserProfile) => void
  skipOnboarding: () => void
  resetOnboarding: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      userProfile: null,
      isOnboardingComplete: false,
      completeOnboarding: (profile) => set({ userProfile: profile, isOnboardingComplete: true }),
      skipOnboarding: () => set({ isOnboardingComplete: true }),
      resetOnboarding: () => set({ userProfile: null, isOnboardingComplete: false }),
    }),
    { name: 'posture-app-state' },
  ),
)
