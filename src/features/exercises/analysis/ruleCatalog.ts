import type { MuscleZone } from './muscleMap'
import type { CorrectionIssue } from '../voice/sessionContext'

export type SeverityClass = 'critical' | 'moderate' | 'minor'
export type DetectionReliability = 'reliable' | 'partial'

export interface RuleCatalogEntry {
  errorTitle: string
  description: string
  severity: SeverityClass
  /** 'reliable' fires on a clean geometric threshold; 'partial' is a best-effort proxy
   * for something that's genuinely hard to read from one 2D camera (e.g. a pelvis-tilt
   * event inferred from a single joint angle) — the report should hedge these as
   * "ймовірно", not state them as fact. */
  detection: DetectionReliability
  affectedMuscles: MuscleZone[]
  correctionAdvice: string
  /** A positive, nominative-case phrase for the "what went well" section when this
   * issue never fired — deliberately a *different* string from errorTitle, not just
   * that title reused: "Недостатня глибина присіду" (the problem) read as an
   * achievement is backwards and grammatically wrong in a sentence about what went well. */
  strengthLabel: string
}

/**
 * Full metadata for every correction issue the app can actually raise today (~27, across
 * plank + all five squat/lunge variants). This is deliberately *not* a stub for a
 * hand-wavy "200 error taxonomy" — authoring 120+ unique biomechanical detectors with
 * real, tuned thresholds is a multi-week content project on its own, not something to
 * fake with placeholder entries. What's here is complete and wired to the actual
 * detection code in analysis/*.ts; new entries are meant to be added one at a time, as
 * new *Rules.ts checks ship, following this same shape.
 */
export const ruleCatalog: Record<CorrectionIssue, RuleCatalogEntry> = {
  // Plank
  hips_sag: {
    errorTitle: 'Провисання попереку',
    description: 'Таз опускається нижче лінії плечей і п’ят, поперек прогинається донизу.',
    severity: 'critical',
    detection: 'reliable',
    affectedMuscles: ['abs', 'lowerBack'],
    correctionAdvice: 'Підкрути таз назад, підтягни лобкову кістку до себе і напруж живіт, ніби готуєшся до легкого удару.',
    strengthLabel: 'рівний поперек у планці',
  },
  hips_raised: {
    errorTitle: 'Таз піднятий занадто високо',
    description: 'Тіло утворює трикутник — таз вище лінії плечей і п’ят, прес майже не працює.',
    severity: 'moderate',
    detection: 'reliable',
    affectedMuscles: ['abs'],
    correctionAdvice: 'Опусти таз, щоб тіло стало прямою лінією від голови до п’ят.',
    strengthLabel: 'таз на одній лінії з тілом',
  },
  elbows_wide: {
    errorTitle: 'Лікті не під плечима',
    description: 'Лікті з’їхали вбік від плечей, що перевантажує плечові суглоби.',
    severity: 'moderate',
    detection: 'reliable',
    affectedMuscles: ['deltoids', 'triceps'],
    correctionAdvice: 'Постав лікті точно під плечима, передпліччя паралельно одне одному.',
    strengthLabel: 'лікті точно під плечима',
  },
  neck_tilted: {
    errorTitle: 'Неправильне положення шиї',
    description: 'Голова опущена або задерта, шия згинається під незручним кутом.',
    severity: 'minor',
    detection: 'reliable',
    affectedMuscles: [],
    correctionAdvice: 'Дивись у підлогу трохи попереду рук, щоб шия була продовженням хребта.',
    strengthLabel: 'нейтральне положення шиї',
  },
  shoulders_dropped: {
    errorTitle: 'Плечі провисають',
    description: 'Плечі просідають до підлоги замість активної опори через м’язи.',
    severity: 'moderate',
    detection: 'reliable',
    affectedMuscles: ['deltoids', 'chest'],
    correctionAdvice: 'Відштовхнись від підлоги, розсунь лопатки в боки і витягни шию.',
    strengthLabel: 'активна опора через плечі',
  },

  // Shared across squat variants
  shallowDepth: {
    errorTitle: 'Недостатня глибина присіду',
    description: 'Коліна згинаються лише трохи — стегно не доходить до паралелі з підлогою.',
    severity: 'moderate',
    detection: 'reliable',
    affectedMuscles: ['quadriceps', 'glutes'],
    correctionAdvice: 'Опускайся нижче, поки стегно не стане паралельно підлозі.',
    strengthLabel: 'достатня глибина присіду',
  },
  kneesCollapse: {
    errorTitle: 'Коліна завалюються всередину (вальгус)',
    description: 'Коліна зміщуються до середньої лінії замість того, щоб іти в напрямку носків — типова причина травм колін у тих, хто тренується самостійно.',
    severity: 'critical',
    detection: 'reliable',
    affectedMuscles: ['adductors', 'glutes'],
    correctionAdvice: 'Свідомо штовхай коліна назовні в напрямку носків, ніби розриваєш невидиму гумку між ними. Це активує середні сідничні м’язи.',
    strengthLabel: 'стабільне положення колін',
  },
  roundedBack: {
    errorTitle: 'Округлення спини',
    description: 'Плечі йдуть вперед, грудний відділ округлюється під навантаженням.',
    severity: 'critical',
    detection: 'reliable',
    affectedMuscles: ['lowerBack', 'abs'],
    correctionAdvice: 'Тримай груди розкритою, дивись перед собою. Уяви склянку води на голові, яку не можна пролити.',
    strengthLabel: 'рівна спина',
  },
  leaningBack: {
    errorTitle: 'Відкидання назад',
    description: 'Корпус занадто вертикальний, баланс зміщується на п’яти.',
    severity: 'moderate',
    detection: 'reliable',
    affectedMuscles: ['lowerBack'],
    correctionAdvice: 'Нахились злегка вперед від тазу, зберігаючи спину рівною.',
    strengthLabel: 'збалансований нахил корпуса',
  },
  heelsUp: {
    errorTitle: 'П’яти відриваються від підлоги',
    description: 'Вага перекочується з середини стопи на носки під час опускання.',
    severity: 'moderate',
    detection: 'reliable',
    affectedMuscles: ['calves'],
    correctionAdvice: 'Свідомо тисни п’ятами в підлогу під час усього руху. Якщо не виходить — можливо, потрібно розтягнути литки.',
    strengthLabel: 'п’яти стабільно на підлозі',
  },
  tooFast: {
    errorTitle: 'Занадто швидкий темп',
    description: 'Повторення виконується менш ніж за 2 секунди — контроль руху втрачається.',
    severity: 'minor',
    detection: 'reliable',
    affectedMuscles: [],
    correctionAdvice: 'Опускайся на два-три рахунки, тримай мить унизу, піднімайся плавно.',
    strengthLabel: 'контрольований темп руху',
  },
  stanceNarrow: {
    errorTitle: 'Занадто вузька постановка ніг',
    description: 'Стопи ближче, ніж ширина плечей — ускладнює баланс у класичному присіді.',
    severity: 'minor',
    detection: 'reliable',
    affectedMuscles: ['adductors'],
    correctionAdvice: 'Постав ноги на ширину плечей.',
    strengthLabel: 'ноги на комфортній ширині плечей',
  },
  stanceWide: {
    errorTitle: 'Занадто широка постановка ніг',
    description: 'Стопи ширші за плечі — навантаження зміщується з квадрицепса на привідні м’язи.',
    severity: 'minor',
    detection: 'reliable',
    affectedMuscles: ['quadriceps'],
    correctionAdvice: 'Постав стопи на ширину плечей.',
    strengthLabel: 'стабільна постановка ніг без зайвої ширини',
  },
  asymmetric: {
    errorTitle: 'Асиметричне навантаження ніг',
    description: 'Одна нога згинається помітно сильніше за іншу.',
    severity: 'moderate',
    detection: 'partial',
    affectedMuscles: ['quadriceps', 'glutes'],
    correctionAdvice: 'Опускайся повільніше й свідомо контролюй обидві ноги, щоб коліна опускались синхронно.',
    strengthLabel: 'симетричне навантаження обох ніг',
  },
  forwardLean: {
    errorTitle: 'Надмірний нахил корпуса вперед',
    description: 'Плечі йдуть далеко вперед відносно тазу — присід перетворюється на нахил уперед.',
    severity: 'moderate',
    detection: 'reliable',
    affectedMuscles: ['lowerBack', 'abs'],
    correctionAdvice: 'Тримай груди розкритою й тягни таз назад, а не корпус донизу.',
    strengthLabel: 'стабільне положення корпуса',
  },
  buttWink: {
    errorTitle: 'Підкручування таза внизу (butt wink)',
    description: 'У найнижчій точці поперек різко округлюється — таз підкручується під себе понад звичайне згинання стегна.',
    severity: 'critical',
    detection: 'partial',
    affectedMuscles: ['lowerBack', 'hamstrings'],
    correctionAdvice: 'Не опускайся нижче рівня, де поперек ще залишається нейтральним. Причина зазвичай — жорсткість задньої поверхні стегна.',
    strengthLabel: 'нейтральний поперек унизу присіду',
  },

  // Plié squat only
  plieNarrowStance: {
    errorTitle: 'Недостатньо широка стійка для пліє',
    description: 'Ноги недостатньо ширші за плечі для акценту на внутрішню поверхню стегна.',
    severity: 'minor',
    detection: 'reliable',
    affectedMuscles: ['adductors'],
    correctionAdvice: 'Постав ноги значно ширше плечей, приблизно в півтора-два рази.',
    strengthLabel: 'достатньо широка стійка для пліє',
  },
  plieToesNotTurned: {
    errorTitle: 'Носки не розвернуті',
    description: 'Стопи дивляться прямо замість розвороту назовні, потрібного для пліє.',
    severity: 'minor',
    detection: 'partial',
    affectedMuscles: ['adductors'],
    correctionAdvice: 'Розверни носки в сторони, приблизно на тридцять-сорок п’ять градусів.',
    strengthLabel: 'правильний розворот носків',
  },
  plieLeaningForward: {
    errorTitle: 'Корпус нахилений уперед (пліє)',
    description: 'У пліє корпус має залишатись вертикальним — надмірний нахил перетворює вправу на класичний присід.',
    severity: 'moderate',
    detection: 'reliable',
    affectedMuscles: ['lowerBack', 'abs'],
    correctionAdvice: 'Тримай корпус вертикальним, ніби ковзаєш спиною вздовж стіни вниз і вгору.',
    strengthLabel: 'вертикальний корпус у пліє',
  },

  // Narrow squat only
  narrowSquatTooWide: {
    errorTitle: 'Стійка занадто широка для вузьких присідань',
    description: 'Стопи мають бути майже разом — ширша постановка знімає акцент із зовнішньої частини стегна.',
    severity: 'minor',
    detection: 'reliable',
    affectedMuscles: ['quadriceps'],
    correctionAdvice: 'Постав стопи майже разом, на відстані п’ять-десять сантиметрів.',
    strengthLabel: 'правильно вузька стійка',
  },

  // Forward lunge
  kneeOverToe: {
    errorTitle: 'Переднє коліно виходить за носок',
    description: 'Коліно передньої ноги йде далеко попереду носка, навантажуючи колінний суглоб.',
    severity: 'critical',
    detection: 'reliable',
    affectedMuscles: ['quadriceps'],
    correctionAdvice: 'Роби довший крок вперед — тоді коліно опиниться прямо над щиколоткою.',
    strengthLabel: 'коліно не виходить за носок',
  },
  backKneeTooHigh: {
    errorTitle: 'Недостатня глибина випаду',
    description: 'Заднє коліно залишається високо замість того, щоб майже торкатись підлоги.',
    severity: 'minor',
    detection: 'reliable',
    affectedMuscles: ['glutes', 'hamstrings'],
    correctionAdvice: 'Опускайся нижче, поки заднє коліно не наблизиться до підлоги.',
    strengthLabel: 'достатня глибина випаду',
  },
  shortStep: {
    errorTitle: 'Занадто короткий крок',
    description: 'Крок вперед недостатньо довгий, через що коліно легко виходить за носок.',
    severity: 'minor',
    detection: 'reliable',
    affectedMuscles: ['quadriceps'],
    correctionAdvice: 'Роби чистий крок вперед, приблизно на дві довжини стопи.',
    strengthLabel: 'правильна довжина кроку',
  },
  lungeLeaningForward: {
    errorTitle: 'Корпус нахилений уперед (випад)',
    description: 'Корпус завалюється вперед, ніби людина от-от впаде.',
    severity: 'moderate',
    detection: 'reliable',
    affectedMuscles: ['lowerBack', 'abs'],
    correctionAdvice: 'Тримай корпус вертикальним, дивись перед собою.',
    strengthLabel: 'вертикальний корпус у випаді',
  },
  notAlternating: {
    errorTitle: 'Немає чергування ніг',
    description: 'Кілька випадів поспіль виконуються однією й тією ж ногою.',
    severity: 'minor',
    detection: 'reliable',
    affectedMuscles: [],
    correctionAdvice: 'Чергуй ноги — ліва, права, ліва — для рівномірного навантаження.',
    strengthLabel: 'рівномірне чергування ніг',
  },

  // Side lunge
  sideLungeStraightLeg: {
    errorTitle: 'Опорна нога згинається',
    description: 'Пряма (неробоча) нога в бічному випаді трохи згинається замість того, щоб лишатись прямою.',
    severity: 'moderate',
    detection: 'reliable',
    affectedMuscles: ['adductors'],
    correctionAdvice: 'Тримай опорну ногу прямою, як струну.',
    strengthLabel: 'пряма опорна нога',
  },
  sideLungeShallow: {
    errorTitle: 'Недостатня глибина бічного випаду',
    description: 'Робоче коліно згинається неглибоко — стегно не доходить до паралелі з підлогою.',
    severity: 'minor',
    detection: 'reliable',
    affectedMuscles: ['glutes', 'adductors'],
    correctionAdvice: 'Відводь таз назад і опускайся, поки стегно не стане паралельно підлозі.',
    strengthLabel: 'достатня глибина бічного випаду',
  },

  // Glute bridge (kneesCollapse and tooFast above are shared with the squat family)
  gluteBridgeInsufficientHeight: {
    errorTitle: 'Недостатня висота підйому таза',
    description: 'Таз не піднімається до прямої лінії від плечей до колін — сідничні м’язи не отримують повного скорочення.',
    severity: 'moderate',
    detection: 'reliable',
    affectedMuscles: ['glutes', 'hamstrings'],
    correctionAdvice: 'Піднімай таз вище, поки тіло не утворить пряму лінію від плечей до колін. У верхній точці свідомо стисни сідниці на секунду.',
    strengthLabel: 'повна висота підйому таза',
  },
  gluteBridgeHyperextension: {
    errorTitle: 'Прогин у попереку',
    description: 'Таз піднятий вище лінії тіла, і поперек різко прогинається — навантаження йде на хребет, а не на сідниці.',
    severity: 'moderate',
    detection: 'reliable',
    affectedMuscles: ['lowerBack'],
    correctionAdvice: 'Не піднімай таз вище лінії плечей і колін. Зупиняйся, коли тіло стає прямим — далі йде вже прогин попереку.',
    strengthLabel: 'нейтральний поперек у верхній точці',
  },
  gluteBridgeAsymmetricHips: {
    errorTitle: 'Одне стегно вище за інше',
    description: 'У верхній точці таз перекошений — одне стегно піднято вище за інше.',
    severity: 'minor',
    detection: 'partial',
    affectedMuscles: ['glutes'],
    correctionAdvice: 'Піднімай таз обома сторонами одночасно, з однаковою силою.',
    strengthLabel: 'симетричний підйом таза',
  },
}
