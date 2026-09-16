import { getMedian } from './angles'

export function createRollingBuffer(size: number): number[] {
  return Array.from({ length: size }, () => 0)
}

export function pushRollingValue(buffer: number[], nextValue: number): number[] {
  buffer.shift()
  buffer.push(nextValue)
  return buffer
}

export function stabilizeAngle(buffer: number[], value: number): number {
  const next = pushRollingValue(buffer, value)
  return getMedian(next)
}

export function applyHysteresis(
  currentState: boolean,
  value: number,
  enterThreshold: number,
  exitThreshold: number,
): boolean {
  if (!currentState && value >= enterThreshold) {
    return true
  }

  if (currentState && value <= exitThreshold) {
    return false
  }

  return currentState
}
