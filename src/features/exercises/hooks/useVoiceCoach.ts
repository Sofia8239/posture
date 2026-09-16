import { useCallback, useEffect, useRef } from 'react'
import type { VoiceAction } from '../voice/decisionRules'
import { VoiceCoachBrain } from '../voice/VoiceCoachBrain'
import type { CoachState } from '../voice/sessionContext'

export interface VoiceSettings {
  voiceEnabled: boolean
  soundsEnabled: boolean
  vibrationEnabled: boolean
  volume: number
  feedbackLevel: 'silent' | 'balanced' | 'full'
}

export const defaultVoiceSettings: VoiceSettings = {
  voiceEnabled: true,
  soundsEnabled: true,
  vibrationEnabled: true,
  volume: 0.8,
  feedbackLevel: 'full',
}

const SAFARI_STUCK_TIMEOUT_MS = 15000

export function useVoiceCoach(settings: VoiceSettings, onAction?: (action: VoiceAction) => void) {
  const lastVoiceRef = useRef(0)
  const lastVoiceTextRef = useRef('')
  const speechReadyAtRef = useRef(0)
  const activeSpeechTextRef = useRef('')
  // Set synchronously the moment we call speak(), so a second speak() call in the same tick
  // can't slip past the check before the browser's own `speaking` flag turns true.
  const isBusyRef = useRef(false)
  const speechStartedAtRef = useRef(0)
  const brainRef = useRef<VoiceCoachBrain | null>(null)

  const cancelSpeech = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return
    }

    window.speechSynthesis.cancel()
    isBusyRef.current = false
    speechStartedAtRef.current = 0
    activeSpeechTextRef.current = ''
  }, [])

  const speak = useCallback(
    (text: string, options?: { force?: boolean; minGapMs?: number }) => {
      if (!settings.voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
        return false
      }

      const now = Date.now()
      const stuckForTooLong = speechStartedAtRef.current > 0 && now - speechStartedAtRef.current > SAFARI_STUCK_TIMEOUT_MS

      if (stuckForTooLong) {
        // Safari occasionally never fires onend/onerror — this is the one legitimate cancel(),
        // a safety valve for a truly stuck engine, not an interruption of live speech.
        window.speechSynthesis.cancel()
        isBusyRef.current = false
        speechStartedAtRef.current = 0
      } else if (isBusyRef.current || window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        return false
      }

      const minGapMs = options?.minGapMs ?? 1800
      if (!options?.force && now - lastVoiceRef.current < minGapMs && lastVoiceTextRef.current === text) {
        return false
      }

      if (now < speechReadyAtRef.current) {
        return false
      }

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'uk-UA'
      utterance.rate = 0.95
      utterance.volume = Math.min(1, Math.max(0, settings.volume))

      const voices = window.speechSynthesis.getVoices()
      const preferredVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith('uk'))
        ?? voices.find((voice) => voice.lang.toLowerCase().startsWith('en'))
        ?? voices[0]

      if (preferredVoice) {
        utterance.voice = preferredVoice
      }

      utterance.onend = () => {
        isBusyRef.current = false
        speechStartedAtRef.current = 0
        speechReadyAtRef.current = Date.now() + 6000
        activeSpeechTextRef.current = ''
      }

      utterance.onerror = () => {
        isBusyRef.current = false
        speechStartedAtRef.current = 0
        speechReadyAtRef.current = Date.now() + 6000
        activeSpeechTextRef.current = ''
      }

      isBusyRef.current = true
      speechStartedAtRef.current = now
      window.speechSynthesis.speak(utterance)
      activeSpeechTextRef.current = text
      lastVoiceRef.current = now
      lastVoiceTextRef.current = text
      return true
    },
    [settings.voiceEnabled, settings.volume],
  )

  const updateCoachState = useCallback(
    (state: CoachState) => {
      if (!brainRef.current) {
        brainRef.current = new VoiceCoachBrain((action) => {
          const didSpeak = speak(action.phrase, { force: action.force, minGapMs: action.minGapMs })
          if (didSpeak) {
            onAction?.(action)
          }
          return didSpeak
        }, () => {
          if (typeof navigator === 'undefined') {
            return 'uk'
          }

          return navigator.language.toLowerCase().startsWith('uk') ? 'uk' : 'en'
        })
      }

      return brainRef.current.update(state)
    },
    [onAction, speak],
  )

  useEffect(() => {
    return () => {
      cancelSpeech()
    }
  }, [cancelSpeech])

  return {
    speak,
    cancelSpeech,
    updateCoachState,
  }
}
