import { plankAnimation } from './plank'
import { squatAnimation } from './squat'
import { plieSquatAnimation } from './plieSquat'
import { narrowSquatAnimation } from './narrowSquat'
import { forwardLungeAnimation } from './forwardLunge'
import { sideLungeAnimation } from './sideLunge'
import { calfRaisesAnimation } from './calfRaises'
import { standingHipAbductionAnimation } from './standingHipAbduction'
import { pushUpsAnimation } from './pushUps'
import { kneePushUpsAnimation } from './kneePushUps'
import { wallPushUpsAnimation } from './wallPushUps'
import { supermanAnimation } from './superman'
import { cobraStretchAnimation } from './cobraStretch'
import { crunchesAnimation } from './crunches'
import { legRaisesAnimation } from './legRaises'
import { bicycleCrunchesAnimation } from './bicycleCrunches'
import { gluteBridgeAnimation } from './gluteBridge'
import { birdDogAnimation } from './birdDog'
import { sidePlankAnimation } from './sidePlank'
import { downwardDogAnimation } from './downwardDog'
import { plankLegLiftAnimation } from './plankLegLift'
import type { ExerciseAnimation } from '../types'

export const exerciseAnimations: Record<string, ExerciseAnimation> = {
  plank: plankAnimation,
  squat: squatAnimation,
  'plie-squat': plieSquatAnimation,
  'narrow-squat': narrowSquatAnimation,
  'forward-lunge': forwardLungeAnimation,
  'side-lunge': sideLungeAnimation,
  'calf-raises': calfRaisesAnimation,
  'standing-hip-abduction': standingHipAbductionAnimation,
  'push-ups': pushUpsAnimation,
  'knee-push-ups': kneePushUpsAnimation,
  'wall-push-ups': wallPushUpsAnimation,
  superman: supermanAnimation,
  'cobra-stretch': cobraStretchAnimation,
  crunches: crunchesAnimation,
  'leg-raises': legRaisesAnimation,
  'bicycle-crunches': bicycleCrunchesAnimation,
  'glute-bridge': gluteBridgeAnimation,
  'bird-dog': birdDogAnimation,
  'side-plank': sidePlankAnimation,
  'downward-dog': downwardDogAnimation,
  'plank-leg-lift': plankLegLiftAnimation,
}
