/** 二次贝塞尔：P0→P1→P2，u∈[0,1]。 */
export function quadBezierPoint(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  u: number
): { x: number; y: number } {
  const o = 1 - u
  return {
    x: o * o * p0.x + 2 * o * u * p1.x + u * u * p2.x,
    y: o * o * p0.y + 2 * o * u * p1.y + u * u * p2.y
  }
}
