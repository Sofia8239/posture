// Renders deterministic frames of the 3D technique viewer for visual review.
//
// Usage:
//   node scripts/shoot-technique.mjs                      # a curated sweep of all exercises
//   node scripts/shoot-technique.mjs squat                # one exercise, default phases/views
//   node scripts/shoot-technique.mjs squat 0,0.5 front,side
//   BASE=http://localhost:5173 OUT=./shots node scripts/shoot-technique.mjs
//
// Relies on TechniqueViewer's `?phase=` / `?view=` freeze hooks. The dev server
// (npm run dev) must already be running.

import { chromium } from 'playwright'
import { mkdir, rm } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const BASE = process.env.BASE ?? 'http://localhost:5173'
const OUT = resolve(process.env.OUT ?? `${HERE}/../.shots`)

const ALL_EXERCISES = [
  'plank', 'squat', 'plie-squat', 'narrow-squat', 'forward-lunge', 'side-lunge',
  'calf-raises', 'standing-hip-abduction', 'push-ups', 'knee-push-ups', 'wall-push-ups',
  'superman', 'cobra-stretch', 'crunches', 'leg-raises', 'bicycle-crunches',
  'glute-bridge', 'bird-dog', 'side-plank', 'downward-dog', 'plank-leg-lift',
]

const [, , idsArg, phasesArg, viewsArg] = process.argv
const ids = !idsArg || idsArg === 'all' ? ALL_EXERCISES : idsArg.split(',')
const phases = (phasesArg ?? '0,0.5').split(',').map(Number)
const views = (viewsArg ?? 'front,side').split(',')

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 })

await rm(OUT, { recursive: true, force: true })
await mkdir(OUT, { recursive: true })

let shot = 0
for (const id of ids) {
  for (const view of views) {
    for (const phase of phases) {
      const url = `${BASE}/technique/${id}?phase=${phase}&view=${view}`
      await page.goto(url, { waitUntil: 'networkidle' })
      const canvas = page.locator('.technique-canvas-card')
      await canvas.waitFor({ state: 'visible' })
      // Let the WebGL frame settle (camera rig tween + first render).
      await page.waitForTimeout(900)
      const file = `${OUT}/${id}__${view}__p${phase}.png`
      await canvas.screenshot({ path: file })
      shot += 1
      process.stdout.write(`\r${shot} shots — ${id} ${view} p${phase}            `)
    }
  }
}

await browser.close()
console.log(`\nDone. ${shot} images in ${OUT}`)
