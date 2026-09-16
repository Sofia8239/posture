import { useCallback } from 'react'

export interface HapticSettings {
  vibrationEnabled: boolean
}

export function useHapticFeedback(settings: HapticSettings) {
  const vibrate = useCallback((pattern: number | number[]) => {
    if (!settings.vibrationEnabled || typeof navigator === 'undefined' || !('vibrate' in navigator)) {
      return
    }

    navigator.vibrate(pattern)
  }, [settings.vibrationEnabled])

  return {
    vibrate,
  }
}
