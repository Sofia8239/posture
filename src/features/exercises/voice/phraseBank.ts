import type { CorrectionIssue } from './sessionContext'
import type { ExerciseId } from '../types'

export type VoiceLanguage = 'uk' | 'en'

export interface PhraseEntry {
  uk: string
  en: string
}

export interface IssuePhrases {
  /** First time this problem shows up — full explanation: what's happening, why it matters, how to fix it. */
  first: PhraseEntry[]
  /** It's back after being corrected — a short, plain reminder. */
  repeat: PhraseEntry[]
  /** It's been going on for a while — acknowledge fatigue and suggest a short rest. */
  persistent: PhraseEntry[]
}

export interface RepExercisePraise {
  goodRep: PhraseEntry[]
  milestone: PhraseEntry[]
}

export interface PhraseBank {
  start: PhraseEntry[]
  correction: Record<CorrectionIssue, IssuePhrases>
  praise: Record<'correction' | 'sustained' | 'milestone', PhraseEntry[]>
  special: Record<'countdown' | 'finish' | 'gentle', PhraseEntry[]>
  breathingReminders: PhraseEntry[]
  /** Rep-specific praise for dynamic exercises — plank (a hold, not reps) has no entry here. */
  repPraise: Record<Exclude<ExerciseId, 'plank'>, RepExercisePraise>
}

export const phraseBank: PhraseBank = {
  start: [
    { uk: 'Готова? Починаємо. Перші секунди — просто відчуй, як стоїш', en: 'Ready? We start. The first seconds are about feeling your posture.' },
    { uk: 'Починаємо м’яко. Відчуй рівну лінію тіла', en: 'We begin gently. Feel the line of your body.' },
    { uk: 'Тримай спокійно, я стежитиму за формою', en: 'Stay calm, I will watch your form.' },
  ],
  correction: {
    hips_sag: {
      first: [
        {
          uk: 'Твій таз опустився вниз, і поперек прогинається — так навантажується нижня частина спини. Підкрути таз назад, ніби підтягуєш лобкову кістку до себе, і напруж живіт.',
          en: 'Your hips dropped and your lower back is arching — that puts strain on your spine. Tuck your pelvis back, as if pulling your pubic bone toward you, and brace your core.',
        },
        {
          uk: 'Бачу, поперек провисає, ніби гамак. Довго так тримати не варто — свідомо підніми таз до лінії плечей і стисни сідниці.',
          en: 'Your lower back is sagging like a hammock. Don’t hold that for long — lift your hips to shoulder height and squeeze your glutes.',
        },
        {
          uk: 'Зараз твоє тіло прогинається в попереку — це небезпечно для спини. Підніми таз, підтягни живіт, ніби готуєшся до легкого удару.',
          en: 'Your body is arching at the lower back right now — that’s risky for your spine. Lift your hips and brace your core as if bracing for a light tap.',
        },
      ],
      repeat: [
        { uk: 'Таз знову опускається. Підкрути його назад, живіт напружений.', en: 'Hips are dropping again. Tuck them back, keep your core tight.' },
        { uk: 'Поперек провисає — підніми таз до рівної лінії.', en: 'Your lower back is sagging — lift your hips back in line.' },
        { uk: 'Ще раз перевір таз, він поповз вниз.', en: 'Check your hips again, they slipped down.' },
      ],
      persistent: [
        {
          uk: 'Тобі важко тримати таз — це нормально, м’язи кора втомились. Опустись на коліна на кілька секунд і продовжуй.',
          en: 'It’s hard to hold your hips up — that’s normal, your core is tired. Drop to your knees for a few seconds and continue.',
        },
        {
          uk: 'Форма розсипається, поперек ризикує перевантажитись. Відпочинь на колінах і почни знову з рівної лінії.',
          en: 'Your form is breaking down and your lower back risks overload. Rest on your knees and restart with a straight line.',
        },
      ],
    },
    hips_raised: {
      first: [
        {
          uk: 'Твій таз піднявся вгору — тіло утворює трикутник, як будиночок. Це полегшена позиція, м’язи преса майже не працюють. Опусти таз вниз, до лінії плечей і п’ят.',
          en: 'Your hips rose up — your body makes a triangle, like a little roof. That’s an easier position where your core barely works. Lower your hips to shoulder-and-heel height.',
        },
        {
          uk: 'Зараз у тебе майже «собака мордою вниз». Стегна занадто високо. Опусти таз, розтягнись у пряму лінію — одразу відчуєш, як увімкнеться прес.',
          en: 'Right now you’re almost in downward dog. Your hips are too high. Lower them and stretch into a straight line — you’ll feel your core switch on.',
        },
        {
          uk: 'Ти обманюєш свій прес — таз піднятий, тому корпус майже не працює. Опусти таз, щоб тіло стало паралельно підлозі.',
          en: 'You’re cheating your core — hips up means your torso barely works. Lower your hips so your body is parallel to the floor.',
        },
      ],
      repeat: [
        { uk: 'Знову таз догори. Опускай і тягнись у лінію.', en: 'Hips up again. Lower them and stretch into line.' },
        { uk: 'Пам’ятай — не будиночок, а дошка. Опускай таз.', en: 'Remember — a plank, not a roof. Lower your hips.' },
      ],
      persistent: [
        {
          uk: 'Тобі важко тримати лінію без «будиночка» — це означає, що прес слабший за руки. Це нормально для початку. Зупинись, відпочинь, і наступного разу постав ціль коротшу — п’ятнадцять секунд, але в правильній формі.',
          en: 'You’re struggling to hold the line without the roof — that means your core is weaker than your arms right now. That’s normal to start. Stop, rest, and next time aim for a shorter hold — fifteen seconds, but with correct form.',
        },
      ],
    },
    elbows_wide: {
      first: [
        {
          uk: 'Твої лікті з’їхали вбік від плечей. Через це плечові суглоби перевантажуються. Постав лікті точно під плечима, кут між плечем і ліктем — приблизно дев’яносто градусів.',
          en: 'Your elbows have drifted out from under your shoulders, which overloads your shoulder joints. Place your elbows directly under your shoulders, about a ninety-degree angle.',
        },
        {
          uk: 'Лікті поїхали вбік — це створює важіль, який тисне на суглоби. Постав їх строго під плечима, передпліччя паралельно одне одному.',
          en: 'Your elbows moved out to the side, creating leverage that strains your joints. Set them directly under your shoulders, forearms parallel.',
        },
      ],
      repeat: [
        { uk: 'Знову лікті вбік. Постав під плечима.', en: 'Elbows out again. Put them under your shoulders.' },
        { uk: 'Перевір лікті — знову з’їхали.', en: 'Check your elbows — they slipped again.' },
      ],
      persistent: [
        {
          uk: 'Лікті постійно з’їжджають — можливо, слизьке покриття або втома. Зупинись, поправ позицію свідомо.',
          en: 'Your elbows keep sliding — maybe the surface is slippery, or you’re fatigued. Stop and reset your position deliberately.',
        },
      ],
    },
    neck_tilted: {
      first: [
        {
          uk: 'Твоя шия згинається під незручним кутом. Дивись у підлогу приблизно на двадцять сантиметрів перед руками, щоб шия була продовженням хребта.',
          en: 'Your neck is bending at an awkward angle. Look at the floor about twenty centimeters ahead of your hands, so your neck stays in line with your spine.',
        },
        {
          uk: 'Шия перенапружена — голова піднята занадто сильно. Опусти погляд трохи вперед, ніби дивишся на точку між долонями.',
          en: 'Your neck is overstrained — your head is lifted too high. Lower your gaze slightly forward, as if looking at a point between your palms.',
        },
      ],
      repeat: [
        { uk: 'Голова знову не на місці. Погляд трохи вперед і вниз.', en: 'Your head is off again. Look slightly forward and down.' },
        { uk: 'Шия напружена — розслаб і опусти погляд.', en: 'Your neck is tense — relax and lower your gaze.' },
      ],
      persistent: [
        {
          uk: 'Шия весь час у напрузі — це ознака втоми. Спробуй коротшу планку наступного разу і стеж за шиєю з самого початку.',
          en: 'Your neck stays tense the whole time — a sign of fatigue. Try a shorter hold next time and watch your neck from the very start.',
        },
      ],
    },
    shoulders_dropped: {
      first: [
        {
          uk: 'Твої плечі провисають донизу, ніби ти висиш на суглобах, а не тримаєшся м’язами. Відштовхнись від підлоги, розсунь лопатки в боки і витягни шию.',
          en: 'Your shoulders are sinking down, as if you’re hanging on the joints instead of holding with muscle. Press into the floor, spread your shoulder blades apart, and lengthen your neck.',
        },
        {
          uk: 'Плечі провалюються між лопатками — спина втрачає активність. Штовхни підлогу від себе, ніби відсуваєшся назад.',
          en: 'Your shoulders are sinking between your shoulder blades — your back loses activity. Push the floor away, as if scooting yourself backward.',
        },
      ],
      repeat: [
        { uk: 'Плечі знову провисли. Відштовхнись від підлоги.', en: 'Shoulders sagging again. Press into the floor.' },
        { uk: 'Активно тримай плечі, не звисай.', en: 'Keep your shoulders active, don’t hang.' },
      ],
      persistent: [
        {
          uk: 'М’язи спини втомились, плечі не тримають лопатки. Зроби паузу — це важливий сигнал тіла.',
          en: 'Your back muscles are tired and your shoulders aren’t holding your shoulder blades. Take a break — that’s an important signal from your body.',
        },
      ],
    },
    // Shared between the classic squat and the plié squat.
    shallowDepth: {
      first: [
        {
          uk: 'Ти недосідаєш — коліна лише трохи згинаються. Такий присід майже не задіює м’язи. Опускайся нижче, поки стегно не стане паралельно підлозі, ніби сідаєш на низький стілець.',
          en: 'You’re not going deep enough — your knees barely bend. A squat that shallow barely works your muscles. Sink lower until your thigh is parallel to the floor, as if sitting on a low stool.',
        },
        {
          uk: 'Присід виходить неглибокий, кут у коліні надто малий. Спробуй опуститися до кута дев’яносто градусів — це той рівень, де починається справжня робота квадрицепсів і сідниць.',
          en: 'That squat is shallow, the knee angle is too small. Try to reach roughly a ninety-degree bend — that’s where your quads and glutes really start working.',
        },
      ],
      repeat: [
        { uk: 'Знову присід неглибокий. Опускайся нижче.', en: 'Shallow again. Go lower.' },
        { uk: 'Ще нижче — стегно паралельно підлозі.', en: 'Lower still — thigh parallel to the floor.' },
      ],
      persistent: [
        {
          uk: 'Тобі важко опуститись достатньо глибоко — це нормально, гнучкість і сила приходять з часом. Спробуй повільніше, з меншою амплітудою, але контрольовано.',
          en: 'Getting deep enough is hard for you right now — that’s normal, flexibility and strength build over time. Try slower, with a smaller range, but controlled.',
        },
      ],
    },
    kneesCollapse: {
      first: [
        {
          uk: 'Твоє коліно завалюється всередину, до середньої лінії. Це створює ризик на суглоби й може травмувати. Свідомо штовхай коліна назовні, в напрямку носків — ніби розриваєш підлогу.',
          en: 'Your knee is caving inward, toward the midline. That puts strain on the joint and can lead to injury. Actively push your knees outward, toward your toes — as if tearing the floor apart.',
        },
        {
          uk: 'Дивись на коліна: вони йдуть всередину. Так навантаження йде не на м’язи, а на зв’язки. Уяви, що між колінами гумка, і ти розтягуєш її, штовхаючи коліна в сторони.',
          en: 'Watch your knees: they’re drifting inward. That shifts the load off your muscles and onto your ligaments. Imagine a band between your knees, and you’re stretching it by pushing your knees apart.',
        },
      ],
      repeat: [
        { uk: 'Знову коліна всередину. Розводь їх у боки, в напрямку носків.', en: 'Knees inward again. Push them out, toward your toes.' },
        { uk: 'Коліна назовні. Штовхай.', en: 'Knees out. Push.' },
      ],
      persistent: [
        {
          uk: 'Коліна постійно завалюються — це слабкі відвідні м’язи стегна. Спробуй присідати менш глибоко й з чистою постановкою, щоб краще контролювати.',
          en: 'Your knees keep caving in — that points to weak hip abductors. Try squatting a little less deep with a cleaner stance, so you can control it better.',
        },
      ],
    },
    roundedBack: {
      first: [
        {
          uk: 'Твоя спина округлилась — плечі йдуть вперед, поперек прогинається. Це небезпечно для хребта. Тримай грудну клітку розкритою, дивись перед собою, а не в підлогу. Уяви, що на голові стоїть стакан води.',
          en: 'Your back rounded — your shoulders roll forward and your lower back curls under. That’s risky for your spine. Keep your chest open, look ahead rather than at the floor. Imagine balancing a glass of water on your head.',
        },
        {
          uk: 'Спина закруглилась, це навантажує міжхребцеві диски. Розправ плечі, підніми груди, і не нахиляйся сильно вперед. Присід — це рух таза назад, а не корпуса вниз.',
          en: 'Your back has rounded, which loads the discs between your vertebrae. Open your shoulders, lift your chest, and don’t lean too far forward. A squat is your hips moving back, not your torso folding down.',
        },
      ],
      repeat: [
        { uk: 'Спина знову округлилась. Розправ плечі, груди вперед.', en: 'Back rounded again. Open your shoulders, chest forward.' },
        { uk: 'Тримай спину рівно, дивись перед собою.', en: 'Keep your back straight, look ahead.' },
      ],
      persistent: [
        {
          uk: 'Спина постійно округлюється — можливо, не вистачає гнучкості чи сили кора. Спробуй присідати трохи менш глибоко й контролювати корпус з самого початку руху.',
          en: 'Your back keeps rounding — you may be missing some core strength or mobility right now. Try a slightly shallower squat and control your torso from the very start of the movement.',
        },
      ],
    },
    leaningBack: {
      first: [
        {
          uk: 'Ти надто відкидаєшся назад — корпус занадто вертикальний. Так втрачається баланс і навантаження перескакує на поперек. Нахилися трохи вперед, від тазу, зберігаючи спину рівною.',
          en: 'You’re leaning too far back — your torso is too vertical. That throws off your balance and shifts the load onto your lower back. Tilt slightly forward from the hips, keeping your back straight.',
        },
      ],
      repeat: [
        { uk: 'Не відкидайся назад. Нахились злегка вперед.', en: 'Don’t lean back. Tilt slightly forward.' },
      ],
      persistent: [
        {
          uk: 'Ти постійно втрачаєш баланс назад — спробуй тримати вагу ближче до середини стопи, а не на п’ятах.',
          en: 'You keep losing your balance backward — try keeping your weight closer to the middle of your foot instead of your heels.',
        },
      ],
    },
    heelsUp: {
      first: [
        {
          uk: 'Твої п’яти відриваються від підлоги при спуску — вага перескакує на носки. Це підриває стабільність і забирає навантаження зі стегна й сідниць. Свідомо тисни п’ятами в підлогу під час усього руху.',
          en: 'Your heels lift off the floor as you descend — your weight shifts onto your toes. That undermines your stability and takes load off your glutes and thighs. Actively press your heels into the floor through the whole movement.',
        },
        {
          uk: 'П’яти піднімаються — це або жорсткі гомілки, або звичка. Постав ширше ноги й опускайся повільніше, тримай п’яти притиснутими до підлоги.',
          en: 'Your heels are lifting — that’s either tight ankles or habit. Widen your stance a bit and descend more slowly, keeping your heels pressed to the floor.',
        },
      ],
      repeat: [
        { uk: 'П’яти знову відриваються. Тисни ними в підлогу.', en: 'Heels lifting again. Press them into the floor.' },
      ],
      persistent: [
        {
          uk: 'П’яти постійно піднімаються — можливо, у тебе жорсткі литки. Спробуй перед тренуванням розтягнутись або підклади невеликі підставки під п’яти.',
          en: 'Your heels keep lifting — you may have tight calves. Try stretching before training, or put a small wedge under your heels.',
        },
      ],
    },
    tooFast: {
      first: [
        {
          uk: 'Ти рухаєшся занадто швидко — на присіданнях головне контроль, а не швидкість. Опускайся на два-три рахунки, у нижній точці затримайся на мить, і піднімайся плавно. Так м’язи працюють повністю.',
          en: 'You’re moving too fast — control matters more than speed in a squat. Descend over two or three counts, pause briefly at the bottom, and rise smoothly. That way your muscles do the full work.',
        },
      ],
      repeat: [
        { uk: 'Повільніше. Контролюй рух.', en: 'Slower. Control the movement.' },
      ],
      persistent: [
        {
          uk: 'Ти весь час поспішаєш — спробуй рахувати вголос про себе, щоб задати темп: два вниз, пауза, два вгору.',
          en: 'You keep rushing — try counting to yourself to set the pace: two down, pause, two up.',
        },
      ],
    },
    stanceNarrow: {
      first: [
        {
          uk: 'Твої ноги надто вузько — ступні занадто близько одна до одної. Це ускладнює баланс. Постав їх на ширину плечей, носки трохи розверни назовні.',
          en: 'Your feet are too narrow, too close together. That makes balance harder. Set them about shoulder-width apart, toes turned slightly out.',
        },
      ],
      repeat: [
        { uk: 'Ширше ноги, на рівні плечей.', en: 'Wider stance, about shoulder-width.' },
      ],
      persistent: [
        {
          uk: 'Постановка постійно вузька — свідомо перевір ширину ніг перед кожним підходом.',
          en: 'Your stance keeps ending up narrow — deliberately check your foot width before each set.',
        },
      ],
    },
    stanceWide: {
      first: [
        {
          uk: 'Ноги занадто широко для класичного присіду — так більше навантаження йде на внутрішню поверхню стегна, а не на квадрицепс. Постав стопи на ширину плечей.',
          en: 'Your feet are too wide for a classic squat — that shifts load onto your inner thigh instead of your quads. Set your feet about shoulder-width apart.',
        },
      ],
      repeat: [
        { uk: 'Ближче ноги, на ширину плечей.', en: 'Bring your feet in, to shoulder-width.' },
      ],
      persistent: [
        {
          uk: 'Постановка постійно широка — можливо, тобі просто зручніше так, спробуй все ж звузити до ширини плечей і звикнути.',
          en: 'Your stance keeps ending up wide — it may just feel more natural, but try narrowing it to shoulder-width and getting used to it.',
        },
      ],
    },
    narrowSquatTooWide: {
      first: [
        {
          uk: 'Твої ноги розставлені ширше, ніж треба для вузького присіду. Тут акцент на зовнішню частину стегна, тож стопи мають бути майже разом — на відстані п’ять-десять сантиметрів.',
          en: 'Your feet are wider than a narrow squat needs. This variation targets the outer thigh, so your feet should be almost together — five to ten centimeters apart.',
        },
        {
          uk: 'Ноги занадто далеко одна від одної. Звузь стійку — стопи разом або майже разом, це і дає навантаження на зовнішній квадрицепс.',
          en: 'Your feet are too far apart. Narrow your stance — feet together or nearly so, that’s what loads the outer quad.',
        },
      ],
      repeat: [
        { uk: 'Знову широко. Стопи ближче одна до одної.', en: 'Wide again. Bring your feet closer together.' },
      ],
      persistent: [
        {
          uk: 'Стійка постійно ширша за потрібну — можливо, так зручніше тримати баланс. Спробуй свідомо звести стопи разом перед кожним повторенням.',
          en: 'Your stance keeps ending up wider than it should — it may just feel more balanced. Try consciously bringing your feet together before each rep.',
        },
      ],
    },
    asymmetric: {
      first: [
        {
          uk: 'Ти присідаєш нерівномірно — одна нога згинається сильніше за іншу. Це може бути звичка або різна сила ніг. Спробуй опускатися повільно й свідомо контролюй обидві ноги, щоб коліна опускались синхронно.',
          en: 'You’re squatting unevenly — one leg bends more than the other. That could be habit or a strength imbalance. Try descending slowly and consciously controlling both legs so your knees drop in sync.',
        },
      ],
      repeat: [
        { uk: 'Знову перекос. Слідкуй за симетрією.', en: 'Uneven again. Watch your symmetry.' },
      ],
      persistent: [
        {
          uk: 'Перекіс повторюється кожен раз — можливо, одна нога сильніша. Спробуй присідати повільніше перед дзеркалом, щоб краще відчути обидві сторони.',
          en: 'The imbalance shows up every time — one leg may just be stronger. Try squatting slower in front of a mirror to feel both sides better.',
        },
      ],
    },
    forwardLean: {
      first: [
        {
          uk: 'Твій корпус завалюється далеко вперед — присід перетворюється на нахил, ніби тягнеш штангу з підлоги. Тримай груди розкритою й дивись перед собою. Свідомо тягни таз назад, а не корпус униз.',
          en: 'Your torso is tipping far forward — the squat is turning into a hip-hinge, like picking something off the floor. Keep your chest open and look ahead. Actively push your hips back rather than folding your torso down.',
        },
        {
          uk: 'Ти нахиляєшся вперед сильніше, ніж треба. Уяви, що на голові стоїть склянка води, яку не можна пролити. Це одразу випрямляє корпус.',
          en: 'You’re leaning forward more than you should. Imagine balancing a glass of water on your head that can’t spill. That instantly straightens the torso.',
        },
      ],
      repeat: [
        { uk: 'Знову корпус вперед. Груди вгору, погляд перед собою.', en: 'Torso forward again. Chest up, eyes ahead.' },
      ],
      persistent: [
        {
          uk: 'Нахил корпуса повторюється щоразу — можливо, не вистачає рухливості гомілковостопа. Спробуй розім’яти литки перед підходом або тримати менш глибокий присід.',
          en: 'The forward lean keeps showing up — you may be missing some ankle mobility. Try loosening your calves before the set, or keep the squat a bit shallower.',
        },
      ],
    },
    buttWink: {
      first: [
        {
          uk: 'У найнижчій точці твій поперек різко підкручується — таз ніби завертається під себе. Це створює додаткове навантаження на міжхребцеві диски саме в момент найбільшого навантаження. Спробуй не опускатися нижче рівня, де ще тримається нейтральний поперек.',
          en: 'At the very bottom your lower back suddenly tucks under — the pelvis rounds under itself. That loads the spinal discs right when the load is highest. Try not to sink past the point where your lower back stays neutral.',
        },
      ],
      repeat: [
        { uk: 'Поперек знову підкрутився внизу. Трохи менша глибина — і зупинись, де спина ще рівна.', en: 'Lower back tucked under again at the bottom. A touch less depth — stop where your back is still flat.' },
      ],
      persistent: [
        {
          uk: 'Це трапляється щоразу на повній глибині — типово через жорсткість задньої поверхні стегна чи кульшових суглобів. Тимчасово присідай трохи вище цього рівня та попрацюй над розтяжкою окремо.',
          en: 'This happens every time at full depth — usually tight hamstrings or hips. For now, squat to a slightly higher point, and work on that mobility separately.',
        },
      ],
    },
    // Plié squat only — namespaced so these don't collide with the lunge's own "leaning forward" issue.
    plieNarrowStance: {
      first: [
        {
          uk: 'Постав ноги ширше — для пліє ступні мають бути значно ширше за плечі, приблизно в півтора-два рази. Так робота піде на внутрішню поверхню стегна й сідниці.',
          en: 'Set your feet wider — for a plié your feet should be noticeably wider than your shoulders, roughly one and a half to two times. That shifts the work onto your inner thighs and glutes.',
        },
      ],
      repeat: [
        { uk: 'Ширше ноги, це плié.', en: 'Wider stance, this is a plié.' },
      ],
      persistent: [
        {
          uk: 'Постановка постійно вужча за потрібну — свідомо постав ноги значно ширше плечей перед кожним підходом.',
          en: 'Your stance keeps ending up too narrow — deliberately set your feet well past shoulder-width before each set.',
        },
      ],
    },
    plieToesNotTurned: {
      first: [
        {
          uk: 'Розверни носки в сторони — для пліє вони мають дивитись назовні, приблизно на тридцять-сорок п’ять градусів. Це дозволить колінам іти в правильному напрямку.',
          en: 'Turn your toes outward — for a plié they should point out, roughly thirty to forty-five degrees. That lets your knees track in the right direction.',
        },
      ],
      repeat: [
        { uk: 'Розверни носки більше.', en: 'Turn your toes out more.' },
      ],
      persistent: [
        {
          uk: 'Носки постійно дивляться прямо — спробуй розвернути стопи ще на старті, перед першим повторенням.',
          en: 'Your toes keep pointing straight ahead — try turning your feet out right at the start, before the first rep.',
        },
      ],
    },
    plieLeaningForward: {
      first: [
        {
          uk: 'Ти нахиляєшся вперед, як у класичному присіданні. У пліє корпус залишається вертикальним. Уяви, що спина ковзає вздовж стіни — вниз і вгору, без нахилу вперед.',
          en: 'You’re leaning forward, like in a classic squat. In a plié the torso stays vertical. Imagine your back sliding along a wall — down and up, without leaning forward.',
        },
      ],
      repeat: [
        { uk: 'Корпус вертикальніше, не нахиляйся.', en: 'Torso more vertical, don’t lean.' },
      ],
      persistent: [
        {
          uk: 'Ти постійно нахиляєшся вперед — спробуй тренуватись біля стіни, торкаючись її спиною, щоб відчути вертикаль.',
          en: 'You keep leaning forward — try training near a wall, touching it with your back, to feel what vertical actually is.',
        },
      ],
    },
    // Forward lunge
    kneeOverToe: {
      first: [
        {
          uk: 'Твоє переднє коліно виходить далеко за носок. Це тисне на колінний суглоб. Роби чистий крок вперед — так коліно опиниться прямо над щиколоткою, а не попереду неї.',
          en: 'Your front knee is going far past your toe. That strains the knee joint. Take a proper step forward — that way your knee ends up right above your ankle, not ahead of it.',
        },
        {
          uk: 'Дивись на переднє коліно: воно надто далеко попереду. Крок треба довший, тоді при опусканні коліно буде під кутом дев’яносто градусів, а не гострішим.',
          en: 'Watch your front knee: it’s too far forward. The step needs to be longer, so when you lower down the knee sits at about ninety degrees, not sharper.',
        },
      ],
      repeat: [
        { uk: 'Знову коліно за носком. Крок довше.', en: 'Knee past the toe again. Longer step.' },
      ],
      persistent: [
        {
          uk: 'Коліно постійно виходить за носок — спробуй позначити для себе довжину кроку заздалегідь, перед тим як опускатись.',
          en: 'Your knee keeps going past your toe — try setting your step length deliberately before you lower down.',
        },
      ],
    },
    backKneeTooHigh: {
      first: [
        {
          uk: 'Ти опускаєшся неглибоко — заднє коліно залишається високо. У повному випаді воно має майже торкатися підлоги. Опускайся нижче, і одразу відчуєш роботу сідниць.',
          en: 'You’re not going deep enough — your back knee stays high. In a full lunge it should almost touch the floor. Go lower, and you’ll immediately feel your glutes working.',
        },
      ],
      repeat: [
        { uk: 'Нижче, заднє коліно ближче до підлоги.', en: 'Lower, back knee closer to the floor.' },
      ],
      persistent: [
        {
          uk: 'Заднє коліно постійно залишається високо — це нормально для початку, сила прийде. Спробуй тримати рівновагу, тримаючись за щось, поки не звикнеш.',
          en: 'Your back knee keeps staying high — that’s normal to start, the strength will come. Try holding onto something for balance until you get used to it.',
        },
      ],
    },
    shortStep: {
      first: [
        {
          uk: 'Крок надто короткий — при такому випаді коліно виходить за носок. Роби чистий крок вперед, приблизно на дві довжини стопи. Тоді техніка буде безпечнішою.',
          en: 'Your step is too short — a lunge that short pushes the knee past the toe. Take a proper step forward, about two foot-lengths. That makes the technique safer.',
        },
      ],
      repeat: [
        { uk: 'Крок ширше.', en: 'Wider step.' },
      ],
      persistent: [
        {
          uk: 'Крок постійно короткий — спробуй перед першим повторенням свідомо відміряти більшу відстань.',
          en: 'Your step keeps coming out short — try consciously marking out a bigger distance before the first rep.',
        },
      ],
    },
    lungeLeaningForward: {
      first: [
        {
          uk: 'Ти нахиляєшся вперед, ніби готуєшся впасти. Це переносить навантаження на переднє коліно й спину. Тримай корпус вертикальним, дивись перед собою.',
          en: 'You’re leaning forward, as if about to fall. That shifts the load onto your front knee and back. Keep your torso vertical, look straight ahead.',
        },
      ],
      repeat: [
        { uk: 'Корпус вертикальніше.', en: 'Torso more vertical.' },
      ],
      persistent: [
        {
          uk: 'Ти постійно нахиляєшся вперед — спробуй тримати руки на поясі, це допомагає відчути вертикаль корпусу.',
          en: 'You keep leaning forward — try keeping your hands on your hips, it helps you feel where vertical actually is.',
        },
      ],
    },
    notAlternating: {
      first: [
        {
          uk: 'Ти робиш кілька випадів однією ногою поспіль. Для рівномірного навантаження чергуй ноги — ліва, права, ліва. Так обидві сторони отримають однакове тренування.',
          en: 'You’re doing several lunges on the same leg in a row. Alternate legs for even loading — left, right, left. That way both sides get the same amount of work.',
        },
      ],
      repeat: [
        { uk: 'Не забувай чергувати ноги.', en: 'Remember to alternate legs.' },
      ],
      persistent: [
        {
          uk: 'Ти постійно забуваєш чергувати ноги — спробуй вголос називати, яка нога працює наступною.',
          en: 'You keep forgetting to alternate legs — try saying out loud which leg goes next.',
        },
      ],
    },
    // Side lunge
    sideLungeStraightLeg: {
      first: [
        {
          uk: 'У бічному випаді пряма нога має залишатись повністю прямою. У тебе вона трохи згинається, і навантаження розсіюється. Тримай опорну ногу прямою, як струну.',
          en: 'In a side lunge, the straight leg should stay fully straight. Yours is bending a little, and the load gets diluted. Keep your straight leg locked, like a string.',
        },
      ],
      repeat: [
        { uk: 'Опорна нога пряма.', en: 'Straight leg stays straight.' },
      ],
      persistent: [
        {
          uk: 'Пряма нога постійно згинається — можливо, не вистачає гнучкості внутрішньої поверхні стегна. Спробуй менший крок убік.',
          en: 'Your straight leg keeps bending — you may be missing some inner-thigh flexibility. Try a smaller step to the side.',
        },
      ],
    },
    sideLungeShallow: {
      first: [
        {
          uk: 'Ти згинаєш робоче коліно неглибоко. У бічному випаді треба опускатись, поки стегно не стане паралельно підлозі. Відводь таз назад, ніби сідаєш на низький стілець збоку.',
          en: 'You’re not bending your working knee deep enough. In a side lunge you should sink until your thigh is parallel to the floor. Push your hips back, as if sitting on a low stool to the side.',
        },
      ],
      repeat: [
        { uk: 'Нижче, коліно глибше.', en: 'Lower, bend the knee deeper.' },
      ],
      persistent: [
        {
          uk: 'Тобі важко опуститись глибше в бічному випаді — це нормально для початку, головне тримати техніку.',
          en: 'Going deeper in the side lunge is hard for you right now — that’s normal to start, the main thing is keeping your technique clean.',
        },
      ],
    },
    // Glute bridge
    gluteBridgeInsufficientHeight: {
      first: [
        {
          uk: 'Твій таз не піднімається до прямої лінії — сідничні м’язи не отримують повного скорочення. Піднімай вище, поки тіло не утворить пряму лінію від плечей до колін, і затримайся там на мить, стискаючи сідниці.',
          en: 'Your hips aren’t reaching a straight line — your glutes never get a full contraction. Lift higher until your body forms a straight line from shoulders to knees, and hold there a moment while squeezing your glutes.',
        },
      ],
      repeat: [
        { uk: 'Ще трохи вище — до прямої лінії.', en: 'A bit higher still — reach that straight line.' },
      ],
      persistent: [
        {
          uk: 'Тобі важко піднятись повністю — це нормально для початку. Зроби перерву й продовжуй із меншою кількістю повторень, але з повною амплітудою.',
          en: 'Lifting all the way up is hard for you right now — that’s normal to start. Take a break and continue with fewer reps, but full range of motion.',
        },
      ],
    },
    gluteBridgeHyperextension: {
      first: [
        {
          uk: 'Ти піднімаєш таз вище лінії тіла, і поперек різко прогинається — навантаження йде на хребет, а не на сідниці. Зупиняйся, коли тіло стає прямою лінією від плечей до колін.',
          en: 'You’re lifting your hips past the body line, and your lower back arches sharply — the load shifts onto your spine instead of your glutes. Stop once your body forms a straight line from shoulders to knees.',
        },
      ],
      repeat: [
        { uk: 'Трохи менше — зупинись на прямій лінії.', en: 'A touch less — stop at the straight line.' },
      ],
      persistent: [
        {
          uk: 'Ти постійно перерозгинаєш поперек — спробуй свідомо зупинятись раніше й тримати корпус нейтральним.',
          en: 'You keep over-extending your lower back — try consciously stopping earlier and keeping your torso neutral.',
        },
      ],
    },
    gluteBridgeAsymmetricHips: {
      first: [
        {
          uk: 'У верхній точці одне стегно піднято вище за інше — таз перекошений. Піднімай обома сторонами одночасно, з однаковою силою.',
          en: 'At the top, one hip sits higher than the other — your pelvis is tilted. Lift with both sides evenly, with the same effort.',
        },
      ],
      repeat: [
        { uk: 'Таз перекошений — вирівняй стегна.', en: 'Hips are uneven — level them out.' },
      ],
      persistent: [
        {
          uk: 'Перекіс повторюється щоразу — можливо, одна сідниця сильніша. Спробуй повільніше, свідомо контролюючи обидві сторони.',
          en: 'The tilt shows up every time — one glute may just be stronger. Try slower, deliberately controlling both sides.',
        },
      ],
    },
  },
  praise: {
    correction: [
      { uk: 'Отак, значно краще.', en: 'There you go, much better.' },
      { uk: 'Так, це воно. Тримай.', en: 'Yes, that’s it. Hold that.' },
      { uk: 'Ой, тепер лінія рівна. Продовжуй.', en: 'There it is, your line is straight now. Keep going.' },
      { uk: 'Виправила — молодець.', en: 'Fixed it — nice work.' },
      { uk: 'Так, форма повернулась. Так тримай.', en: 'Yes, your form is back. Stay right there.' },
    ],
    sustained: [
      { uk: 'Тримаєш чудово', en: 'You are holding it really well.' },
      { uk: 'Форма гарна, дихай', en: 'Your form is good, keep breathing.' },
      { uk: 'Так тримати', en: 'Keep going like that.' },
      { uk: 'Класно виходить', en: 'You are doing great.' },
    ],
    milestone: [
      { uk: 'Півхвилини вже! Тримайся', en: 'Half a minute already! Keep going.' },
      { uk: 'Хвилина! Це супер', en: 'A full minute! That is excellent.' },
      { uk: 'Ще п’ять секунд, ти майже там', en: 'Five more seconds, you are almost there.' },
    ],
  },
  special: {
    countdown: [
      { uk: 'Ще десять секунд, ти майже там', en: 'Ten more seconds, you are almost there.' },
      { uk: 'П’ять, чотири, три, два, один', en: 'Five, four, three, two, one.' },
    ],
    finish: [
      { uk: 'Молодець, впоралась! Можеш опустити коліна', en: 'You did it! You can lower your knees.' },
      { uk: 'Відмінно. Тепер відпускай', en: 'Excellent. You can relax now.' },
    ],
    gentle: [
      { uk: 'Так, важко сьогодні. Дихай глибше', en: 'It is tough today. Breathe deeper.' },
      { uk: 'Головне — не задирай таз, решта потім', en: 'The main thing is not to lift your hips too much; the rest will follow.' },
    ],
  },
  breathingReminders: [
    { uk: 'Не забувай дихати — вдих носом, видих ротом, живіт при цьому не розслабляй.', en: 'Don’t forget to breathe — inhale through your nose, exhale through your mouth, without releasing your core.' },
    { uk: 'Дихай спокійно, не затримуй повітря — це зменшить втому.', en: 'Breathe calmly, don’t hold your breath — it reduces fatigue.' },
    { uk: 'Слідкуй за диханням: рівно, глибоко, животом, а не плечима.', en: 'Watch your breathing: even, deep, from the belly, not the shoulders.' },
  ],
  repPraise: {
    squat: {
      goodRep: [
        { uk: 'Хороший присід, глибокий і симетричний.', en: 'Good squat, deep and even.' },
        { uk: 'Так, це воно. Ще один.', en: 'Yes, that’s it. One more.' },
        { uk: 'Отак — глибина правильна, коліна на місці.', en: 'There it is — good depth, knees tracking well.' },
        { uk: 'Відмінно, контроль на висоті.', en: 'Excellent, great control.' },
      ],
      milestone: [
        { uk: 'Десять присідань! Половина шляху.', en: 'Ten squats! Halfway there.' },
        { uk: 'П’ятнадцять, ти на фінішній прямій.', en: 'Fifteen, you’re on the home stretch.' },
        { uk: 'Двадцять! Молодець, впоралась.', en: 'Twenty! Nice work, you did it.' },
      ],
    },
    'narrow-squat': {
      goodRep: [
        { uk: 'Хороший вузький присід, стопи разом і стабільно.', en: 'Good narrow squat, feet together and stable.' },
        { uk: 'Так, зовнішня частина стегна працює. Ще один.', en: 'Yes, your outer thigh is working. One more.' },
        { uk: 'Відмінний баланс для такої вузької стійки.', en: 'Great balance for such a narrow stance.' },
      ],
      milestone: [
        { uk: 'Десять вузьких присідань — половина шляху.', en: 'Ten narrow squats — halfway there.' },
        { uk: 'П’ятнадцять, тримай баланс.', en: 'Fifteen, keep your balance.' },
      ],
    },
    'plie-squat': {
      goodRep: [
        { uk: 'Гарне пліє — коліна назовні, корпус рівний.', en: 'Nice plié — knees out, torso upright.' },
        { uk: 'Так, це справжнє пліє. Ще одне.', en: 'Yes, that’s a real plié. One more.' },
        { uk: 'Ідеально, внутрішня поверхня стегна працює.', en: 'Perfect, your inner thighs are doing the work.' },
      ],
      milestone: [
        { uk: 'Десять пліє, половина шляху.', en: 'Ten pliés, halfway there.' },
        { uk: 'П’ятнадцять — тримай темп.', en: 'Fifteen — keep the pace.' },
      ],
    },
    'forward-lunge': {
      goodRep: [
        { uk: 'Красивий випад — коліно прямо над щиколоткою.', en: 'Beautiful lunge — knee right over the ankle.' },
        { uk: 'Так, і ще одна нога тепер.', en: 'Yes, and the other leg now.' },
        { uk: 'Глибокий випад, м’язи працюють.', en: 'Deep lunge, muscles are working.' },
        { uk: 'Ідеально, тримай темп.', en: 'Perfect, keep that pace.' },
      ],
      milestone: [
        { uk: 'Десять на кожну ногу — молодець.', en: 'Ten on each leg — nice work.' },
        { uk: 'П’ятнадцять випадів, продовжуй.', en: 'Fifteen lunges, keep going.' },
      ],
    },
    'side-lunge': {
      goodRep: [
        { uk: 'Гарний випад — коліно прямо над носком.', en: 'Nice lunge — knee right over the toe.' },
        { uk: 'Так, і ще одна сторона тепер.', en: 'Yes, and the other side now.' },
        { uk: 'Глибокий випад, м’язи працюють.', en: 'Deep lunge, muscles are working.' },
      ],
      milestone: [
        { uk: 'Десять на кожну сторону — молодець.', en: 'Ten on each side — nice work.' },
        { uk: 'П’ятнадцять випадів, продовжуй.', en: 'Fifteen lunges, keep going.' },
      ],
    },
    'glute-bridge': {
      goodRep: [
        { uk: 'Гарний міст — пряма лінія, сідниці працюють.', en: 'Nice bridge — straight line, glutes doing the work.' },
        { uk: 'Так, повна амплітуда. Ще один.', en: 'Yes, full range. One more.' },
        { uk: 'Відмінно, таз рівно і стабільно.', en: 'Excellent, hips level and stable.' },
      ],
      milestone: [
        { uk: 'Десять мостів — половина шляху.', en: 'Ten bridges — halfway there.' },
        { uk: 'П’ятнадцять! Молодець, впоралась.', en: 'Fifteen! Nice work, you did it.' },
      ],
    },
  },
}
