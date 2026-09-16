import type { MuscleZone } from './analysis/muscleMap'
import type { Equipment } from '../../store/userProfile'

export type CatalogCategory = 'core' | 'legs-glutes' | 'back' | 'arms-chest' | 'flexibility'
export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export interface CatalogExercise {
  id: string
  name: string
  shortDescription: string
  category: CatalogCategory
  difficulty: Difficulty
  durationSeconds?: number
  reps?: number
  targetMuscles: MuscleZone[]
  equipment: Equipment[]
  steps: string[]
  breathingPattern: string
  commonMistakes: string[]
}

export const categoryLabels: Record<CatalogCategory, string> = {
  core: 'Прес і корпус',
  'legs-glutes': 'Ноги й сідниці',
  back: 'Спина',
  'arms-chest': 'Руки й груди',
  flexibility: 'Гнучкість і розтяжка',
}

export const catalogExercises: CatalogExercise[] = [
  {
    id: 'side-plank',
    name: 'Бокова планка',
    shortDescription: 'Статична вправа на косі м’язи й стабілізатори корпуса',
    category: 'core',
    difficulty: 'intermediate',
    durationSeconds: 30,
    targetMuscles: ['obliques', 'abs'],
    equipment: ['yoga-mat'],
    steps: [
      'Ляж на бік, спираючись на передпліччя, лікоть точно під плечем',
      'Підніми стегна від підлоги, тіло — пряма лінія',
      'Тримай таз нерухомим, не провалюйся вниз',
      'Дихай рівно, тримай позицію',
    ],
    breathingPattern: 'Дихай рівно й неглибоко, не затримуй дихання',
    commonMistakes: ['Таз провисає донизу', 'Плече піднімається до вуха', 'Тіло скручується вперед'],
  },
  {
    id: 'crunches',
    name: 'Скручування лежачи',
    shortDescription: 'Базова вправа на прямий м’яз живота',
    category: 'core',
    difficulty: 'beginner',
    reps: 15,
    targetMuscles: ['abs'],
    equipment: ['yoga-mat'],
    steps: [
      'Ляж на спину, коліна зігнуті, стопи на підлозі',
      'Руки за головою або схрещені на грудях',
      'Підніми лопатки від підлоги, скорочуючи прес',
      'Повільно опустись назад',
    ],
    breathingPattern: 'Видихай на підйомі, вдихай на опусканні',
    commonMistakes: ['Тягнеш себе руками за шию', 'Підборіддя притиснуте до грудей', 'Різкі ривкові рухи'],
  },
  {
    id: 'leg-raises',
    name: 'Підйом ніг лежачи',
    shortDescription: 'Вправа на нижню частину преса',
    category: 'core',
    difficulty: 'intermediate',
    reps: 12,
    targetMuscles: ['abs'],
    equipment: ['yoga-mat'],
    steps: [
      'Ляж на спину, руки вздовж тіла або під тазом',
      'Ноги прямі, підніми їх до кута 90°',
      'Повільно опусти, не торкаючись підлоги',
      'Повтори, тримаючи поперек притиснутим до підлоги',
    ],
    breathingPattern: 'Видихай, піднімаючи ноги; вдихай, опускаючи',
    commonMistakes: ['Поперек відривається від підлоги', 'Ноги опускаються надто швидко', 'Згинання колін замість прямих ніг'],
  },
  {
    id: 'bicycle-crunches',
    name: 'Велосипед',
    shortDescription: 'Динамічна вправа на прямий і косі м’язи живота',
    category: 'core',
    difficulty: 'intermediate',
    reps: 20,
    targetMuscles: ['abs', 'obliques'],
    equipment: [],
    steps: [
      'Ляж на спину, руки за головою',
      'Підніми лопатки й зігнуті коліна від підлоги',
      'Тягни лікоть до протилежного коліна, чергуючи сторони',
      'Рухайся повільно й контрольовано',
    ],
    breathingPattern: 'Видихай на кожному скручуванні',
    commonMistakes: ['Занадто швидкий темп без контролю', 'Тягнеш голову руками', 'Ноги випрямляються повністю без контролю'],
  },
  {
    id: 'plank-leg-lift',
    name: 'Планка з підйомом ноги',
    shortDescription: 'Ускладнена планка з акцентом на сідниці й стабільність тазу',
    category: 'core',
    difficulty: 'advanced',
    durationSeconds: 30,
    targetMuscles: ['abs', 'glutes', 'lowerBack'],
    equipment: ['yoga-mat'],
    steps: [
      'Стань у планку на передпліччях',
      'Тримаючи корпус нерухомим, підніми одну ногу на кілька сантиметрів',
      'Затримайся на секунду, опусти',
      'Повтори іншою ногою',
    ],
    breathingPattern: 'Дихай рівно, не затримуй дихання при підйомі ноги',
    commonMistakes: ['Таз розвертається вбік при підйомі ноги', 'Поперек прогинається', 'Нога піднімається занадто високо за рахунок прогину спини'],
  },
  {
    id: 'calf-raises',
    name: 'Підйом на носки',
    shortDescription: 'Проста вправа на литкові м’язи',
    category: 'legs-glutes',
    difficulty: 'beginner',
    reps: 20,
    targetMuscles: ['calves'],
    equipment: [],
    steps: [
      'Стань прямо, ноги на ширині стегон',
      'Повільно піднімись на носки якомога вище',
      'Затримайся на секунду вгорі',
      'Повільно опустись у вихідне положення',
    ],
    breathingPattern: 'Видихай на підйомі, вдихай на опусканні',
    commonMistakes: ['Занадто швидкий темп', 'Гойдання корпусом для інерції', 'Неповна амплітуда підйому'],
  },
  {
    id: 'standing-hip-abduction',
    name: 'Відведення ноги стоячи',
    shortDescription: 'Ізоляція середнього сідничного м’яза й стабілізаторів стегна',
    category: 'legs-glutes',
    difficulty: 'beginner',
    reps: 15,
    targetMuscles: ['glutes', 'adductors'],
    equipment: [],
    steps: [
      'Стань прямо, тримайся за опору за потреби',
      'Відведи пряму ногу вбік, не нахиляючи корпус',
      'Підніми настільки, наскільки дозволяє контроль',
      'Повільно поверни ногу назад',
    ],
    breathingPattern: 'Видихай, відводячи ногу; вдихай, повертаючи назад',
    commonMistakes: ['Нахил корпуса в протилежний бік замість ізольованого руху ноги', 'Розворот стопи назовні для більшої амплітуди', 'Різкі махові рухи'],
  },
  {
    id: 'superman',
    name: 'Гіперекстензія лежачи',
    shortDescription: 'Зміцнення м’язів-розгиначів спини',
    category: 'back',
    difficulty: 'beginner',
    reps: 12,
    targetMuscles: ['lowerBack', 'glutes'],
    equipment: ['yoga-mat'],
    steps: [
      'Ляж на живіт, руки витягнуті вперед',
      'Одночасно підніми руки, груди й ноги від підлоги',
      'Затримайся на секунду у верхній точці',
      'Повільно опустись назад',
    ],
    breathingPattern: 'Видихай на підйомі, вдихай на опусканні',
    commonMistakes: ['Різкий ривок замість плавного підйому', 'Надмірне закидання голови назад', 'Затримка дихання'],
  },
  {
    id: 'bird-dog',
    name: 'Бьорд-дог',
    shortDescription: 'Вправа на стабільність корпуса й координацію',
    category: 'back',
    difficulty: 'beginner',
    reps: 10,
    targetMuscles: ['lowerBack', 'glutes', 'deltoids'],
    equipment: ['yoga-mat'],
    steps: [
      'Стань на четвереньки, зап’ястя під плечима, коліна під тазом',
      'Витягни праву руку вперед і ліву ногу назад одночасно',
      'Тримай таз і плечі рівно, без перекосу',
      'Поверни у вихідне положення й повтори з іншого боку',
    ],
    breathingPattern: 'Видихай, витягуючи руку й ногу; вдихай, повертаючись',
    commonMistakes: ['Таз розвертається вбік', 'Поперек прогинається донизу', 'Рука чи нога піднімаються вище рівня спини'],
  },
  {
    id: 'push-ups',
    name: 'Віджимання класичні',
    shortDescription: 'Базова вправа на груди, трицепс і плечі',
    category: 'arms-chest',
    difficulty: 'intermediate',
    reps: 10,
    targetMuscles: ['chest', 'triceps', 'deltoids'],
    equipment: [],
    steps: [
      'Обіприся на прямі руки й носки, руки трохи ширше плечей',
      'Тіло — пряма лінія від голови до п’ят',
      'Згинай лікті, опускаючи груди до підлоги',
      'Відштовхнись назад у вихідне положення',
    ],
    breathingPattern: 'Вдихай на опусканні, видихай на підйомі',
    commonMistakes: ['Таз провисає або піднятий занадто високо', 'Лікті розходяться в сторони на 90°', 'Неповна амплітуда руху'],
  },
  {
    id: 'wall-push-ups',
    name: 'Віджимання від стіни',
    shortDescription: 'Полегшена версія для новачків',
    category: 'arms-chest',
    difficulty: 'beginner',
    reps: 15,
    targetMuscles: ['chest', 'triceps'],
    equipment: [],
    steps: [
      'Стань за крок від стіни, обіприся долонями на рівні плечей',
      'Тіло — пряма лінія, п’яти на підлозі',
      'Згинай лікті, наближаючи груди до стіни',
      'Відштовхнись назад у вихідне положення',
    ],
    breathingPattern: 'Вдихай, наближаючись до стіни; видихай, відштовхуючись',
    commonMistakes: ['Занадто близька стійка до стіни', 'Прогин у попереку', 'Лікті розходяться в сторони'],
  },
  {
    id: 'knee-push-ups',
    name: 'Віджимання з колін',
    shortDescription: 'Проміжний варіант між віджиманням від стіни й класичним',
    category: 'arms-chest',
    difficulty: 'beginner',
    reps: 12,
    targetMuscles: ['chest', 'triceps', 'deltoids'],
    equipment: ['yoga-mat'],
    steps: [
      'Стань на коліна, обіприся на прямі руки трохи ширше плечей',
      'Тіло — пряма лінія від голови до колін',
      'Згинай лікті, опускаючи груди до підлоги',
      'Відштовхнись назад у вихідне положення',
    ],
    breathingPattern: 'Вдихай на опусканні, видихай на підйомі',
    commonMistakes: ['Таз піднятий занадто високо', 'Голова опущена вниз', 'Неповна амплітуда'],
  },
  {
    id: 'cobra-stretch',
    name: 'Кобра',
    shortDescription: 'Розтяжка передньої частини тіла й м’яка мобілізація поперека',
    category: 'flexibility',
    difficulty: 'beginner',
    durationSeconds: 20,
    targetMuscles: ['abs', 'lowerBack'],
    equipment: ['yoga-mat'],
    steps: [
      'Ляж на живіт, долоні під плечима',
      'Повільно випрямляй руки, піднімаючи груди від підлоги',
      'Таз і стегна лишаються на підлозі',
      'Тримай позицію, дихаючи глибоко',
    ],
    breathingPattern: 'Дихай глибоко й повільно, розслаблюючи поперек',
    commonMistakes: ['Підняття тазу від підлоги', 'Закидання голови занадто далеко назад', 'Різкий підйом замість поступового'],
  },
  {
    id: 'downward-dog',
    name: 'Собака мордою вниз',
    shortDescription: 'Розтяжка литок, задньої поверхні стегна й плечей',
    category: 'flexibility',
    difficulty: 'beginner',
    durationSeconds: 30,
    targetMuscles: ['calves', 'hamstrings', 'deltoids'],
    equipment: ['yoga-mat'],
    steps: [
      'Стань на четвереньки, підніми таз вгору, випрямляючи ноги й руки',
      'Тіло утворює перевернуту букву V',
      'П’яти тягнуться до підлоги, не обов’язково торкатись',
      'Голова розслаблена між руками',
    ],
    breathingPattern: 'Дихай глибоко й рівномірно',
    commonMistakes: ['Округлена спина замість прямої лінії від рук до тазу', 'Коліна надто зігнуті без потреби', 'Затиснуті плечі біля вух'],
  },
]

export function getCatalogExercise(id: string): CatalogExercise | undefined {
  return catalogExercises.find((exercise) => exercise.id === id)
}
