import { Suspense, useEffect, useMemo, useRef, useState, type ComponentRef, type RefObject } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Vector3 } from 'three'
import { AnimatedHumanoid } from './AnimatedHumanoid'
import { AnatomicalModel } from './AnatomicalModel'
import { MixamoCharacter } from './MixamoCharacter'
import { activeMusclesAtPhase, currentStepIndex } from './animationUtils'
import { exerciseAnimations } from './animations'
import { exerciseConfigs } from '../exercises/exerciseConfigs'
import { getCatalogExercise } from '../exercises/catalogExercises'
import { ISSUES_BY_EXERCISE } from '../exercises/workoutAnalyzer'
import { ruleCatalog } from '../exercises/analysis/ruleCatalog'
import { muscleZoneLabels } from '../exercises/analysis/muscleZoneLabels'
import type { CorrectionIssue } from '../exercises/voice/sessionContext'
import type { Vec3 } from './types'
import './TechniqueViewer.css'

type ViewAngle = 'front' | 'side' | 'back' | 'top'

const viewLabels: Record<ViewAngle, string> = { front: 'Спереду', side: 'Збоку', back: 'Ззаду', top: 'Зверху' }
const speedOptions = [0.5, 1, 1.5]
// The rig now stands planted on y = 0, so a standing figure's mass centres around
// y ≈ 0.9 — the camera looks there, not at the old floating-figure height.
const DEFAULT_LOOK_TARGET: Vec3 = [0, 0.9, 0]

function cameraPositionFor(view: ViewAngle, distanceScale: number): [number, number, number] {
  const base: Record<ViewAngle, [number, number, number]> = {
    front: [0, 1.05, 2.7],
    side: [2.7, 1.05, 0],
    back: [0, 1.05, -2.7],
    top: [0, 3.1, 0.8],
  }
  const [x, y, z] = base[view]
  return [x * distanceScale, y, z * distanceScale]
}

/** exerciseConfigs (camera-tracked) has a name/instructions/id; catalogExercises has
 * name/steps/id — this reads whichever source actually has the requested id. */
function getDisplayInfo(id: string): { name: string; instructions: string[]; hasCameraTracking: boolean; commonMistakes: string[] } {
  const cameraConfig = exerciseConfigs.find((config) => config.id === id)
  if (cameraConfig) {
    const fromRules = (ISSUES_BY_EXERCISE as Partial<Record<string, CorrectionIssue[]>>)[id] ?? []
    const commonMistakes = fromRules
      .map((issue) => ruleCatalog[issue])
      .filter((entry) => entry.severity !== 'minor')
      .map((entry) => entry.errorTitle)
    return { name: cameraConfig.name, instructions: cameraConfig.instructions, hasCameraTracking: true, commonMistakes }
  }

  const catalogItem = getCatalogExercise(id)
  return {
    name: catalogItem?.name ?? id,
    instructions: catalogItem?.steps ?? [],
    hasCameraTracking: false,
    commonMistakes: catalogItem?.commonMistakes ?? [],
  }
}

const TRANSITION_MS = 650

/** Cubic ease-out — fast start, gentle settle, no overshoot. */
function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3
}

/**
 * Moves the camera on view-angle change. OrbitControls owns the camera's position
 * once mounted — changing <Canvas camera={{ position }}> after the first render is
 * inert, since OrbitControls' own update() just recomputes from wherever the camera
 * already is. This tweens position/target over TRANSITION_MS instead of snapping,
 * then hands control back to OrbitControls for free drag-to-orbit — it only drives
 * the camera for the duration of the transition, never fighting user input.
 */
function CameraRig({
  viewAngle,
  target,
  distanceScale,
  controlsRef,
}: {
  viewAngle: ViewAngle
  target: Vec3
  distanceScale: number
  controlsRef: RefObject<ComponentRef<typeof OrbitControls> | null>
}) {
  const { camera } = useThree()
  const startPos = useRef(new Vector3())
  const startTarget = useRef(new Vector3())
  const endPos = useRef(new Vector3(...cameraPositionFor(viewAngle, distanceScale)))
  const endTarget = useRef(new Vector3(...target))
  const transitionStartedAt = useRef<number | null>(null)

  useEffect(() => {
    const controls = controlsRef.current
    startPos.current.copy(camera.position)
    startTarget.current.copy(controls ? controls.target : new Vector3(...target))
    endPos.current.set(...cameraPositionFor(viewAngle, distanceScale))
    endTarget.current.set(...target)
    transitionStartedAt.current = performance.now()
  }, [viewAngle, distanceScale, target, camera, controlsRef])

  useFrame(() => {
    if (transitionStartedAt.current === null) {
      return
    }

    const elapsed = performance.now() - transitionStartedAt.current
    const t = easeOutCubic(Math.min(1, elapsed / TRANSITION_MS))
    camera.position.lerpVectors(startPos.current, endPos.current, t)

    const controls = controlsRef.current
    if (controls) {
      controls.target.lerpVectors(startTarget.current, endTarget.current, t)
      controls.update()
    }

    if (t >= 1) {
      transitionStartedAt.current = null
    }
  })

  return null
}

export function TechniqueViewer() {
  const { exerciseId } = useParams<{ exerciseId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const validId = exerciseId && exerciseId in exerciseAnimations ? exerciseId : 'squat'
  const animation = exerciseAnimations[validId]
  const display = useMemo(() => getDisplayInfo(validId), [validId])
  const lookTarget = animation.cameraTarget ?? DEFAULT_LOOK_TARGET
  const distanceScale = animation.cameraDistanceScale ?? 1

  // Dev/screenshot hook: `?phase=0.5` freezes the animation at that phase (and `?view=side`
  // picks the camera preset) so scripts/shoot-technique.mjs can capture deterministic frames.
  const frozenPhase = searchParams.has('phase') ? Number(searchParams.get('phase')) : null
  const frozenView = searchParams.get('view') as ViewAngle | null

  const [phase, setPhase] = useState(frozenPhase ?? 0)
  const [isPlaying, setIsPlaying] = useState(frozenPhase === null)
  const [speed, setSpeed] = useState(1)
  const [viewAngle, setViewAngle] = useState<ViewAngle>(
    frozenView && frozenView in viewLabels ? frozenView : 'front',
  )
  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null)
  const lastFrameRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  // Reset the animation to its start whenever the exercise changes — adjusted during
  // render (React's own recommended pattern for "state that depends on a changed prop"),
  // not in an effect, so switching exercises doesn't need an extra render round-trip.
  const [phaseForId, setPhaseForId] = useState(validId)
  if (validId !== phaseForId) {
    setPhaseForId(validId)
    setPhase(frozenPhase ?? 0)
  }

  useEffect(() => {
    if (!isPlaying) {
      lastFrameRef.current = null
      return
    }

    function tick(now: number) {
      if (lastFrameRef.current !== null) {
        const delta = now - lastFrameRef.current
        setPhase((current) => {
          const next = current + (delta * speed) / animation.durationMs
          return next >= 1 ? next % 1 : next
        })
      }
      lastFrameRef.current = now
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [isPlaying, speed, animation.durationMs])

  const activeMuscles = useMemo(() => activeMusclesAtPhase(animation.keyframes, phase), [animation.keyframes, phase])
  const activeStepIndex = useMemo(() => currentStepIndex(phase, display.instructions.length), [phase, display.instructions.length])

  return (
    <div className="technique-viewer">
      <header className="technique-viewer-header">
        <button type="button" className="technique-back" onClick={() => navigate(-1)}>
          ← Назад
        </button>
        <h1>{display.name}</h1>
      </header>

      <div className="technique-canvas-card">
        <Canvas camera={{ position: cameraPositionFor('front', distanceScale), fov: 45 }} shadows>
          <ambientLight intensity={0.7} />
          <directionalLight position={[3, 6, 3]} intensity={0.9} castShadow />
          <directionalLight position={[-3, 3, -2]} intensity={0.25} />
          {/* Suspense guards the two GLTF-loading branches (both suspend while fetching
              their .glb) — inert today since no exercise sets modelUrl/mixamoAnimationUrl
              yet, but keeps the procedural rig on screen instead of an unhandled suspend
              the moment real assets are dropped in. */}
          <Suspense fallback={<AnimatedHumanoid phase={phase} keyframes={animation.keyframes} />}>
            {animation.mixamoAnimationUrl ? (
              <MixamoCharacter animationUrl={animation.mixamoAnimationUrl} phase={phase} />
            ) : animation.modelUrl && animation.meshNameToZone ? (
              <AnatomicalModel
                url={animation.modelUrl}
                meshNameToZone={animation.meshNameToZone}
                clipName={animation.clipName}
                phase={phase}
                keyframes={animation.keyframes}
              />
            ) : (
              <AnimatedHumanoid phase={phase} keyframes={animation.keyframes} />
            )}
          </Suspense>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
            <planeGeometry args={[6, 6]} />
            <meshStandardMaterial color="#2D0A1F" opacity={0.4} transparent />
          </mesh>
          <CameraRig viewAngle={viewAngle} target={lookTarget} distanceScale={distanceScale} controlsRef={controlsRef} />
          <OrbitControls
            ref={controlsRef}
            enablePan={false}
            enableDamping
            dampingFactor={0.08}
            minDistance={1.5}
            maxDistance={5 * distanceScale}
            target={lookTarget}
          />
        </Canvas>
      </div>

      <div className="technique-controls-row">
        <div className="technique-view-controls">
          {(Object.keys(viewLabels) as ViewAngle[]).map((view) => (
            <button key={view} type="button" className={viewAngle === view ? 'active' : ''} onClick={() => setViewAngle(view)}>
              {viewLabels[view]}
            </button>
          ))}
        </div>

        <div className="technique-playback-controls">
          <button type="button" className="technique-play-button" onClick={() => setIsPlaying((current) => !current)}>
            {isPlaying ? '⏸' : '▶'}
          </button>
          {speedOptions.map((value) => (
            <button key={value} type="button" className={speed === value ? 'active' : ''} onClick={() => setSpeed(value)}>
              {value}×
            </button>
          ))}
        </div>
      </div>

      <div className="technique-info-grid">
        <section className="technique-info-card">
          <h2>Крок за кроком</h2>
          <ol>
            {display.instructions.map((step, index) => (
              <li key={step} className={index === activeStepIndex ? 'is-active' : ''}>
                {step}
              </li>
            ))}
          </ol>
        </section>

        <section className="technique-info-card">
          <h2>М’язи, що працюють</h2>
          <ul className="technique-muscle-list">
            {activeMuscles.length > 0 ? (
              activeMuscles.map((zone) => <li key={zone}>{muscleZoneLabels[zone]}</li>)
            ) : (
              <li className="technique-muted">Стартова позиція</li>
            )}
          </ul>
        </section>

        {display.commonMistakes.length > 0 && (
          <section className="technique-info-card">
            <h2>Типові помилки</h2>
            <ul>
              {display.commonMistakes.map((title) => (
                <li key={title}>{title}</li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {display.hasCameraTracking ? (
        <button type="button" className="primary-button technique-start-button" onClick={() => navigate(`/training/${validId}`)}>
          Тренуватись із камерою
        </button>
      ) : (
        <button type="button" className="primary-button technique-start-button" onClick={() => navigate(`/simple/${validId}`)}>
          Почати без камери
        </button>
      )}
    </div>
  )
}
