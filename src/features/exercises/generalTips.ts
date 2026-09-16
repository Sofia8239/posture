import type { PhraseEntry } from './voice/phraseBank'
import type { ExerciseId } from './types'

/**
 * Category-B content: things a real coach would mention that the camera fundamentally
 * can't see — breathing pattern, deliberately squeezing a muscle, warming up beforehand.
 * These never drive a correction (there's nothing to "detect"), so they're delivered
 * two other ways instead: a short periodic reminder during training (see decisionRules.ts),
 * and — always — a dedicated section in the post-workout report, per the spec's
 * requirement that this content isn't optional to surface somewhere.
 */
export const generalTips: Record<'squat' | 'lunge' | 'gluteBridge', PhraseEntry[]> = {
  squat: [
    {
      uk: 'Дихання: вдихай перед тим, як опускатися, видихай із зусиллям на підйомі. Не затримуй дихання довше ніж на секунду-дві.',
      en: 'Breathing: inhale before you descend, exhale with effort on the way up. Never hold your breath longer than a second or two.',
    },
    {
      uk: 'Свідомо стискай сідниці у верхній точці кожного повторення — це "будить" великий сідничний м’яз, якого камера не бачить.',
      en: 'Consciously squeeze your glutes at the top of every rep — that wakes up the glute muscle in a way the camera can’t see.',
    },
    {
      uk: 'Перед серйозним тренуванням присідань зроби 5 хвилин легкої рухливості для кульшових і гомілковостопних суглобів.',
      en: 'Before a serious squat session, spend five minutes on light hip and ankle mobility.',
    },
    {
      uk: 'Якщо відчуваєш, що в нижній точці м’язи ніби "провисають" — свідомо напруж їх. Тонус м’язів камера не бачить, лише ти сама.',
      en: 'If your muscles feel like they’re going slack at the bottom, actively tense them. Muscle tone isn’t something the camera can see — only you can feel it.',
    },
  ],
  lunge: [
    {
      uk: 'Дихання: вдихай на опусканні, видихай на підйомі. Спокійне дихання допомагає тримати баланс.',
      en: 'Breathing: inhale as you lower, exhale as you rise. Calm breathing helps with balance.',
    },
    {
      uk: 'Відчуй вагу рівномірно на всій стопі передньої ноги — не тільки на п’яті чи носку. Це камера побачити не може, лише ти.',
      en: 'Feel your weight spread evenly across the front foot — not just the heel or the toes. That’s something only you can feel, not the camera.',
    },
    {
      uk: 'Якщо хитаєшся — це нормально на початку. Тримайся за стілець чи стіну, поки не відчуєш стабільність.',
      en: 'If you wobble, that’s normal when you’re starting out. Hold onto a chair or wall until you feel stable.',
    },
    {
      uk: 'Перед випадами розігрій кульшові суглоби — кілька махів ногою в кожен бік.',
      en: 'Before lunges, warm up your hips — a few leg swings in each direction.',
    },
  ],
  gluteBridge: [
    {
      uk: 'Дихання: видихай на підйомі таза, вдихай на опусканні. Не затримуй дихання у верхній точці.',
      en: 'Breathing: exhale as you lift your hips, inhale as you lower. Don’t hold your breath at the top.',
    },
    {
      uk: 'Свідомо стискай сідниці у верхній точці на секунду — це "будить" великий сідничний м’яз, якого камера не бачить.',
      en: 'Consciously squeeze your glutes for a second at the top — that wakes up the glute muscle in a way the camera can’t see.',
    },
    {
      uk: 'Якщо відчуваєш роботу переважно в попереку, а не в сідницях — трохи підкрути таз перед підйомом.',
      en: 'If you feel the work mostly in your lower back instead of your glutes, tuck your pelvis slightly before lifting.',
    },
  ],
}

export function getGeneralTipsFor(exerciseId: ExerciseId): PhraseEntry[] {
  if (exerciseId === 'forward-lunge' || exerciseId === 'side-lunge') {
    return generalTips.lunge
  }
  if (exerciseId === 'squat' || exerciseId === 'plie-squat' || exerciseId === 'narrow-squat') {
    return generalTips.squat
  }
  if (exerciseId === 'glute-bridge') {
    return generalTips.gluteBridge
  }
  return []
}
