export interface CoverFrame {
  scale: number
  offsetX: number
  offsetY: number
}

/**
 * `object-fit: cover` scales the native camera frame until it fully fills the display
 * box, then crops whatever overflows on one axis. MediaPipe's normalized landmark
 * coordinates are relative to the *native* (uncropped) frame — mapping them straight
 * onto the displayed box without correcting for this crop is why an overlay drifts
 * off the body whenever the camera's aspect ratio doesn't match the container's (e.g.
 * a 4:3 webcam inside a taller card): everything gets pulled toward the center by
 * however much got cropped away.
 */
export function getCoverFrame(nativeWidth: number, nativeHeight: number, containerWidth: number, containerHeight: number): CoverFrame {
  if (nativeWidth <= 0 || nativeHeight <= 0 || containerWidth <= 0 || containerHeight <= 0) {
    return { scale: 1, offsetX: 0, offsetY: 0 }
  }

  const scale = Math.max(containerWidth / nativeWidth, containerHeight / nativeHeight)
  const offsetX = (nativeWidth * scale - containerWidth) / 2
  const offsetY = (nativeHeight * scale - containerHeight) / 2

  return { scale, offsetX, offsetY }
}

/**
 * Maps one landmark (normalized 0-1 against the native camera frame) to a coordinate
 * normalized 0-1 against the displayed, cropped container — i.e. where it actually
 * needs to be drawn to land on the body the user sees.
 */
export function mapPointToDisplayFrame(
  point: { x: number; y: number },
  frame: CoverFrame,
  nativeWidth: number,
  nativeHeight: number,
  containerWidth: number,
  containerHeight: number,
): { x: number; y: number } {
  const screenX = point.x * nativeWidth * frame.scale - frame.offsetX
  const screenY = point.y * nativeHeight * frame.scale - frame.offsetY
  return { x: screenX / containerWidth, y: screenY / containerHeight }
}

export function mapPointsToDisplayFrame<T extends { x: number; y: number }>(
  points: T[],
  nativeWidth: number,
  nativeHeight: number,
  containerWidth: number,
  containerHeight: number,
): T[] {
  if (nativeWidth <= 0 || nativeHeight <= 0 || containerWidth <= 0 || containerHeight <= 0) {
    return points
  }

  const frame = getCoverFrame(nativeWidth, nativeHeight, containerWidth, containerHeight)

  return points.map((point) => {
    if (!point) {
      return point
    }
    const mapped = mapPointToDisplayFrame(point, frame, nativeWidth, nativeHeight, containerWidth, containerHeight)
    return { ...point, x: mapped.x, y: mapped.y }
  })
}
