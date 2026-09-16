import { decideWhatToSay, type VoiceAction } from './decisionRules'
import { createSessionContext, type CoachState, type CorrectionIssue, type SessionContext } from './sessionContext'

export class VoiceCoachBrain {
  private context: SessionContext
  private recentPhrases: string[] = []
  private readonly speaker: (action: VoiceAction) => boolean
  private readonly getLanguage: () => 'uk' | 'en'

  constructor(speaker: (action: VoiceAction) => boolean, getLanguage?: () => 'uk' | 'en') {
    this.context = createSessionContext()
    this.speaker = speaker
    this.getLanguage = getLanguage ?? (() => {
      if (typeof navigator === 'undefined') {
        return 'uk'
      }

      return navigator.language.toLowerCase().startsWith('uk') ? 'uk' : 'en'
    })
  }

  public update(state: CoachState): VoiceAction | null {
    const now = Date.now()
    const language = this.getLanguage()

    this.context.totalElapsedSec = state.elapsedSec

    if (state.issue && this.context.currentIssue !== state.issue) {
      this.context.currentIssue = state.issue
      this.context.currentIssueStartedAt = now
      this.context.issueHistory.push({ issue: state.issue, startedAt: now, endedAt: null, resolvedByCorrection: false })

      const issue = state.issue as CorrectionIssue
      this.context.issueOccurrences[issue] = (this.context.issueOccurrences[issue] ?? 0) + 1
    } else if (!state.issue && this.context.currentIssue) {
      const currentIssue = this.context.currentIssue
      const record = this.context.issueHistory[this.context.issueHistory.length - 1]
      if (record && record.issue === currentIssue) {
        record.endedAt = now
        record.resolvedByCorrection = state.justRecovered
      }
      this.context.currentIssue = null
      this.context.currentIssueStartedAt = null
    }

    if (state.isGood) {
      this.context.totalGoodTime += 1
      this.context.streakOfGoodForm += 1
    } else {
      this.context.streakOfGoodForm = 0
    }

    this.context.hasBeenPraisedRecently = now - this.context.lastSpokenAt < 15000
    // Gated by elapsed time so a rough first few seconds (still settling into position) doesn't
    // immediately read as "struggling" — the phrase bank's struggling tier assumes a real pattern.
    const openIssueCount = this.context.issueHistory.filter((entry) => entry.endedAt === null).length
    this.context.isStruggling = this.context.totalElapsedSec > 30 && openIssueCount >= 3
    this.context.isCrushingIt = this.context.streakOfGoodForm >= 20

    const action = decideWhatToSay(this.context, state, language)
    if (action) {
      this.speak(action)
    }

    return action
  }

  private speak(action: VoiceAction) {
    const recent = this.recentPhrases.at(-1)
    if (recent === action.phrase) {
      return
    }

    const didSpeak = this.speaker(action)
    if (!didSpeak) {
      return
    }

    this.context.lastSpokenAt = Date.now()
    this.context.lastSpokenPhrase = action.phrase
    this.context.lastSpokenIssue = this.context.currentIssue
    this.context.totalPhrasesSpoken += 1
    this.recentPhrases.push(action.phrase)

    if (this.recentPhrases.length > 5) {
      this.recentPhrases.shift()
    }

    this.context.recentPhrases = this.recentPhrases
  }
}
