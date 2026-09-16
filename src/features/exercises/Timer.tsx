interface TimerProps {
  seconds: number
  targetSeconds?: number
}

export function Timer({ seconds, targetSeconds }: TimerProps) {
  return <div className="timer-pill">{seconds}s{targetSeconds ? ` / ${targetSeconds}s` : ''}</div>
}
