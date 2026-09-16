// Builds public/anatomy/female-{front,back}.svg from the vendored `body-muscles`
// path data (scripts/anatomy-src/*, Apache-2.0 — see scripts/anatomy-src/NOTICE).
//
// What it does:
//   1. Parses the {id, name, path} records out of the two source .ts arrays.
//   2. Renames every source id to the app's own MuscleId vocabulary (ID_MAP).
//   3. Splits non-muscle regions (head, hands, feet, knees, spine…) into a
//      non-interactive <g id="scaffold"> so the body still reads as a body
//      without adding fake "muscles" to the click surface.
//   4. Rounds path coordinates to 3 decimals and keeps only id + d + fill.
//   5. Writes both files on a shared 0 0 35 93 viewBox (the back half of the
//      source art lives at x≥37, so it's shifted left by 37).
//
// Re-run with:  node scripts/build-anatomy-svg.mjs

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = resolve(root, 'scripts/anatomy-src')
const outDir = resolve(root, 'public/anatomy')

/**
 * body-muscles id  ->  our MuscleId
 * Anything not listed here and not in SCAFFOLD is reported as unmapped.
 */
const ID_MAP = {
  // ---- front ----
  'neck-left': 'sternocleidomastoid-left',
  'neck-right': 'sternocleidomastoid-right',
  'shoulder-front-left': 'front-deltoid-left',
  'shoulder-front-right': 'front-deltoid-right',
  'shoulder-side-left': 'middle-deltoid-left',
  'shoulder-side-right': 'middle-deltoid-right',
  'biceps-left': 'biceps-left',
  'biceps-right': 'biceps-right',
  'forearm-left': 'forearm-flexor-left',
  'forearm-right': 'forearm-flexor-right',
  'chest-upper-left': 'pectoralis-upper-left',
  'chest-upper-right': 'pectoralis-upper-right',
  'chest-lower-left': 'pectoralis-lower-left',
  'chest-lower-right': 'pectoralis-lower-right',
  'abs-upper-left': 'rectus-abdominis-upper-left',
  'abs-upper-right': 'rectus-abdominis-upper-right',
  'abs-lower-left': 'rectus-abdominis-lower-left',
  'abs-lower-right': 'rectus-abdominis-lower-right',
  'serratus-anterior-left': 'serratus-left',
  'serratus-anterior-right': 'serratus-right',
  'obliques-left': 'obliques-external-left',
  'obliques-right': 'obliques-external-right',
  'hip-flexor-left': 'hip-flexor-left',
  'hip-flexor-right': 'hip-flexor-right',
  'quads-left': 'quadriceps-left',
  'quads-right': 'quadriceps-right',
  'adductors-left': 'adductors-left',
  'adductors-right': 'adductors-right',
  'tibialis-anterior-left': 'tibialis-anterior-left',
  'tibialis-anterior-right': 'tibialis-anterior-right',
  // ---- back ----
  'traps-upper-left': 'trapezius-upper-left',
  'traps-upper-right': 'trapezius-upper-right',
  'traps-mid-left': 'trapezius-middle-left',
  'traps-mid-right': 'trapezius-middle-right',
  'traps-lower-left': 'trapezius-lower-left',
  'traps-lower-right': 'trapezius-lower-right',
  'deltoid-rear-left': 'rear-deltoid-left',
  'deltoid-rear-right': 'rear-deltoid-right',
  'lats-upper-left': 'latissimus-upper-left',
  'lats-upper-right': 'latissimus-upper-right',
  'lats-mid-left': 'latissimus-mid-left',
  'lats-mid-right': 'latissimus-mid-right',
  'lats-lower-left': 'latissimus-lower-left',
  'lats-lower-right': 'latissimus-lower-right',
  'triceps-long-left': 'triceps-long-left',
  'triceps-long-right': 'triceps-long-right',
  'triceps-lateral-left': 'triceps-lateral-left',
  'triceps-lateral-right': 'triceps-lateral-right',
  'forearm-flexors-left': 'forearm-flexor-left',
  'forearm-flexors-right': 'forearm-flexor-right',
  'forearm-extensors-left': 'forearm-extensor-left',
  'forearm-extensors-right': 'forearm-extensor-right',
  'lower-back-erectors-left': 'erector-spinae-left',
  'lower-back-erectors-right': 'erector-spinae-right',
  'lower-back-ql-left': 'quadratus-lumborum-left',
  'lower-back-ql-right': 'quadratus-lumborum-right',
  'gluteus-medius-left': 'gluteus-medius-left',
  'gluteus-medius-right': 'gluteus-medius-right',
  'gluteus-maximus-left': 'gluteus-maximus-left',
  'gluteus-maximus-right': 'gluteus-maximus-right',
  'hamstrings-medial-left': 'hamstring-medial-left',
  'hamstrings-medial-right': 'hamstring-medial-right',
  'hamstrings-lateral-left': 'hamstring-biceps-femoris-left',
  'hamstrings-lateral-right': 'hamstring-biceps-femoris-right',
  'calves-gastroc-medial-left': 'gastrocnemius-medial-left',
  'calves-gastroc-medial-right': 'gastrocnemius-medial-right',
  'calves-gastroc-lateral-left': 'gastrocnemius-lateral-left',
  'calves-gastroc-lateral-right': 'gastrocnemius-lateral-right',
  'calves-soleus-left': 'soleus-left',
  'calves-soleus-right': 'soleus-right',
}

/** Non-muscle regions — drawn, but not part of the interactive layer. */
const SCAFFOLD = new Set([
  'head', 'face', 'head-back', 'nape', 'spine',
  'elbow-left', 'elbow-right',
  'hand-left', 'hand-right', 'hand-back-left', 'hand-back-right',
  'knee-left', 'knee-right', 'knee-back-left', 'knee-back-right',
  'foot-left', 'foot-right', 'foot-back-left', 'foot-back-right',
])

function parseRecords(file) {
  const text = readFileSync(resolve(srcDir, file), 'utf8')
  const records = []
  // { id: "...", name: "...", view: ..., path: "..." }  (path always last, single-line)
  const re = /id:\s*"([^"]+)"[\s\S]*?path:\s*"([^"]+)"/g
  let m
  while ((m = re.exec(text))) records.push({ id: m[1], d: m[2] })
  return records
}

/** Round every number in a path's `d` to <=3 decimals. Lossless enough at this scale. */
function roundPath(d) {
  return d.replace(/-?\d*\.?\d+(?:e-?\d+)?/gi, (n) => {
    const v = Number(n)
    if (!Number.isFinite(v)) return n
    return String(Math.round(v * 1000) / 1000)
  })
}

function buildSvg(records, { shiftX = 0 } = {}) {
  const muscles = []
  const scaffold = []
  const unmapped = []

  for (const { id, d } of records) {
    if (ID_MAP[id]) {
      muscles.push(`    <path id="${ID_MAP[id]}" d="${roundPath(d)}" fill="currentColor"/>`)
    } else if (SCAFFOLD.has(id)) {
      scaffold.push(`    <path d="${roundPath(d)}" fill="currentColor"/>`)
    } else {
      unmapped.push(id)
    }
  }

  const inner = shiftX ? ` transform="translate(${shiftX})"` : ''
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35 93" role="img">
  <g${inner}>
   <g id="scaffold" fill-opacity="0.35" pointer-events="none">
${scaffold.join('\n')}
   </g>
   <g id="muscles">
${muscles.join('\n')}
   </g>
  </g>
</svg>
`
  return { svg, muscleCount: muscles.length, scaffoldCount: scaffold.length, unmapped }
}

mkdirSync(outDir, { recursive: true })

for (const [srcFile, outFile, opts] of [
  ['muscles.front.ts', 'female-front.svg', {}],
  ['muscles.back.ts', 'female-back.svg', { shiftX: -37 }],
]) {
  const records = parseRecords(srcFile)
  const { svg, muscleCount, scaffoldCount, unmapped } = buildSvg(records, opts)
  writeFileSync(resolve(outDir, outFile), svg)
  const bytes = Buffer.byteLength(svg)
  console.log(
    `${outFile.padEnd(20)} ${muscleCount} muscles, ${scaffoldCount} scaffold, ${bytes} bytes` +
      (unmapped.length ? `\n  UNMAPPED: ${unmapped.join(', ')}` : ''),
  )
}
