import type { Graphics } from 'pixi.js'

/** 沿直线写入多段虚线（dash + gap），供最后统一 `stroke`。 */
export function dashLineSegments(
  g: Graphics,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  dash: number,
  gap: number
): void {
  const len = Math.hypot(x1 - x0, y1 - y0)
  if (len < 1e-6) {
    return
  }
  const ux = (x1 - x0) / len
  const uy = (y1 - y0) / len
  let d = 0
  while (d < len) {
    const dashEnd = Math.min(d + dash, len)
    g.moveTo(x0 + ux * d, y0 + uy * d)
    g.lineTo(x0 + ux * dashEnd, y0 + uy * dashEnd)
    d = dashEnd + gap
  }
}

/** 矩形四边虚线边框（顺时针）。 */
export function drawDashedRectOutline(
  g: Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
  dash: number,
  gap: number
): void {
  dashLineSegments(g, x, y, x + w, y, dash, gap)
  dashLineSegments(g, x + w, y, x + w, y + h, dash, gap)
  dashLineSegments(g, x + w, y + h, x, y + h, dash, gap)
  dashLineSegments(g, x, y + h, x, y, dash, gap)
}
