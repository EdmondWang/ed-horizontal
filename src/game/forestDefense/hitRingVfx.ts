import { Graphics } from 'pixi.js'
import { HIT_RING_MS } from './config'
import type { HitRingEntry } from './types'

/** 击中扩散环：随时间扩大并淡出。 */
export function tickHitRings(rings: HitRingEntry[], dMs: number): void {
  for (let i = rings.length - 1; i >= 0; i--) {
    const ring = rings[i]
    ring.ttlMs += dMs
    const u = ring.ttlMs / HIT_RING_MS
    ring.g.clear()
    const r = 10 + ring.ttlMs * 0.35
    ring.g.circle(0, 0, r)
    ring.g.stroke({
      width: 2,
      color: 0xfbbf24,
      alpha: Math.max(0, 1 - u)
    })
    if (ring.ttlMs >= HIT_RING_MS) {
      ring.g.destroy()
      rings.splice(i, 1)
    }
  }
}

/** 在战场层创建新的扩散环节点（由调用方加入 `HitRingEntry` 列表）。 */
export function createHitRingGraphics(): Graphics {
  const g = new Graphics()
  g.eventMode = 'none'
  return g
}
