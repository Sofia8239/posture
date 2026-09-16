import { phraseBank, type PhraseEntry, type VoiceLanguage } from './phraseBank'
import { getIssueLevel, type CoachState, type CorrectionIssue, type SessionContext } from './sessionContext'
import { getGeneralTipsFor } from '../generalTips'

export interface VoiceAction {
  phrase: string
  lang: VoiceLanguage
  tone: 'supportive' | 'neutral' | 'serious'
  minGapMs: number
  force: boolean
  sound?: 'chime' | 'warning' | 'tick' | 'success'
  vibratePattern?: number | number[]
}

function choosePhrase(entries: PhraseEntry[], language: VoiceLanguage) {
  const preferred = entries[Math.floor(Math.random() * entries.length)]
  return preferred[language]
}

/**
 * Picks a phrase that hasn't been said recently, so the coach never sounds like a broken
 * record. If every phrase in `tiers[0]` was already used recently, it tries the next tier
 * (e.g. "repeat" phrasing when "first" is exhausted) before finally falling back to
 * whichever candidate — across every tier — was said longest ago. That last step matters
 * for thin banks: a bank with exactly 5 variants and a 5-slot memory *will* eventually
 * have to repeat something, and picking the least-recently-used one (instead of a random
 * one) guarantees the maximum possible gap — a clean round-robin instead of two repeats
 * landing close together by bad luck.
 */
function choosePhraseAvoidingRepeats(tiers: PhraseEntry[][], language: VoiceLanguage, recentPhrases: string[]): string {
  for (const tier of tiers) {
    const fresh = tier.filter((entry) => !recentPhrases.includes(entry[language]))
    if (fresh.length > 0) {
      return choosePhrase(fresh, language)
    }
  }

  const allCandidates = tiers.flat()
  if (allCandidates.length === 0) {
    return ''
  }

  const leastRecent = allCandidates.reduce((oldest, entry) => {
    const entryIndex = recentPhrases.indexOf(entry[language])
    const oldestIndex = recentPhrases.indexOf(oldest[language])
    if (entryIndex === -1) return entry
    if (oldestIndex === -1) return oldest
    return entryIndex < oldestIndex ? entry : oldest
  })

  return leastRecent[language]
}

function vibrationForSeverity(severity: number): number {
  if (severity >= 90) {
    return 120
  }

  if (severity >= 60) {
    return 90
  }

  return 60
}

export function decideWhatToSay(context: SessionContext, state: CoachState, language: VoiceLanguage): VoiceAction | null {
  if (state.phase === 'result') {
    const phrase = choosePhraseAvoidingRepeats([phraseBank.special.finish], language, context.recentPhrases)
    return { phrase, lang: language, tone: 'supportive', minGapMs: 5000, force: true, sound: 'success', vibratePattern: 500 }
  }

  if (state.phase === 'calibration' && state.elapsedSec < 3) {
    const phrase = choosePhraseAvoidingRepeats([phraseBank.start], language, context.recentPhrases)
    return { phrase, lang: language, tone: 'supportive', minGapMs: 6000, force: true }
  }

  const isDynamic = state.exerciseKind === 'dynamic'

  if (
    !isDynamic &&
    state.phase === 'training' &&
    state.elapsedSec >= state.targetSeconds - 10 &&
    state.elapsedSec < state.targetSeconds
  ) {
    const phrase = choosePhraseAvoidingRepeats([phraseBank.special.countdown], language, context.recentPhrases)
    return { phrase, lang: language, tone: 'neutral', minGapMs: 9000, force: true }
  }

  if (context.isStruggling && !state.isGood) {
    return {
      phrase: choosePhraseAvoidingRepeats([phraseBank.special.gentle], language, context.recentPhrases),
      lang: language,
      tone: 'neutral',
      minGapMs: 7000,
      force: false,
      sound: 'warning',
      vibratePattern: 80,
    }
  }

  if (state.justRecovered) {
    return {
      phrase: choosePhraseAvoidingRepeats([phraseBank.praise.correction], language, context.recentPhrases),
      lang: language,
      tone: 'supportive',
      minGapMs: 2000,
      force: true,
      sound: 'chime',
      vibratePattern: [50, 50, 50],
    }
  }

  if (state.issue) {
    const issue = state.issue as CorrectionIssue
    const bank = phraseBank.correction[issue] ?? phraseBank.correction.hips_sag
    const level = getIssueLevel(context, issue, Date.now())
    const tierOrder: Array<typeof level> = level === 'first' ? ['first', 'repeat', 'persistent'] : level === 'repeat' ? ['repeat', 'persistent', 'first'] : ['persistent', 'repeat', 'first']
    const phrase = choosePhraseAvoidingRepeats(tierOrder.map((tier) => bank[tier]), language, context.recentPhrases)
    const tone = level === 'persistent' ? 'serious' : level === 'first' ? 'supportive' : 'neutral'
    const minGapMs = level === 'first' ? 8000 : 6000

    return {
      phrase,
      lang: language,
      tone,
      minGapMs,
      force: false,
      sound: 'warning',
      vibratePattern: vibrationForSeverity(state.severity),
    }
  }

  if (isDynamic && state.phase === 'training' && state.repJustCompleted && state.reps) {
    const exerciseId = state.exerciseId
    const repBank = exerciseId && exerciseId !== 'plank' ? phraseBank.repPraise[exerciseId] : null

    if (repBank) {
      if (state.reps % 5 === 0) {
        return {
          phrase: choosePhraseAvoidingRepeats([repBank.milestone], language, context.recentPhrases),
          lang: language,
          tone: 'supportive',
          minGapMs: 3000,
          force: true,
          sound: 'chime',
        }
      }

      // Praise good reps, but only sometimes — constant "good job" after every rep gets noisy.
      if (state.repWasGood && !context.hasBeenPraisedRecently && Math.random() < 0.35) {
        return {
          phrase: choosePhraseAvoidingRepeats([repBank.goodRep], language, context.recentPhrases),
          lang: language,
          tone: 'supportive',
          minGapMs: 3000,
          force: false,
          sound: 'chime',
        }
      }
    }
  }

  // Category-B guidance (breathing, muscle activation, warm-up) — the camera can't see any
  // of it, so it never drives a correction. It still needs to reach the user somehow: a
  // periodic reminder here, and — always — a section in the post-workout report.
  if (isDynamic && state.phase === 'training' && state.repJustCompleted && state.reps && state.reps % 7 === 0 && state.exerciseId) {
    const tips = getGeneralTipsFor(state.exerciseId)
    if (tips.length > 0) {
      return {
        phrase: choosePhraseAvoidingRepeats([tips], language, context.recentPhrases),
        lang: language,
        tone: 'neutral',
        minGapMs: 8000,
        force: false,
      }
    }
  }

  if (!isDynamic && context.streakOfGoodForm > 15 && !context.hasBeenPraisedRecently) {
    return {
      phrase: choosePhraseAvoidingRepeats([phraseBank.praise.sustained], language, context.recentPhrases),
      lang: language,
      tone: 'supportive',
      minGapMs: 10000,
      force: false,
      sound: 'chime',
    }
  }

  if (!isDynamic && state.phase === 'training' && state.elapsedSec > 0 && state.elapsedSec % 20 === 0) {
    return {
      phrase: choosePhraseAvoidingRepeats([phraseBank.breathingReminders], language, context.recentPhrases),
      lang: language,
      tone: 'neutral',
      minGapMs: 8000,
      force: false,
    }
  }

  return null
}
