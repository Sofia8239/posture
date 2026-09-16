import { useCallback, useEffect, useRef } from 'react'

export interface SoundSettings {
  soundsEnabled: boolean
}

export function useSoundEffects(settings: SoundSettings) {
  const audioCacheRef = useRef<Record<string, HTMLAudioElement | null>>({})

  useEffect(() => {
    return () => {
      Object.values(audioCacheRef.current).forEach((audio) => {
        audio?.pause()
      })
    }
  }, [])

  const playSound = useCallback(
    (name: 'chime' | 'warning' | 'tick' | 'success') => {
      if (!settings.soundsEnabled) {
        return
      }

      const audio = audioCacheRef.current[name] ?? new Audio(`/sounds/${name}.mp3`)
      audioCacheRef.current[name] = audio
      audio.currentTime = 0
      void audio.play().catch(() => undefined)
    },
    [settings.soundsEnabled],
  )

  return {
    playSound,
  }
}
