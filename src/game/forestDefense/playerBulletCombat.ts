import { Graphics } from 'pixi.js'
import { quadBezierPoint } from '../../utils/bezier2'
import {
  BULLET_ARC_LIFT,
  BULLET_FLIGHT_MS,
  HIT_FLASH_MS
} from './config'
import { computeDamageAgainstArmor } from './damage'
import type { FlyingBullet, OrcRun } from './types'

export function createPlayerBulletShape(): Graphics {
  const g = new Graphics()
  g.eventMode = 'none'
  g.roundRect(0, -4, 14, 8, 3)
  g.fill({ color: 0xa7f3d0, alpha: 0.95 })
  g.stroke({ width: 1, color: 0xffffff, alpha: 0.65 })
  return g
}

export function tickPlayerFlyingBullets(
  flyingBullets: FlyingBullet[],
  dMs: number,
  ctx: {
    defendW: number
    laneCenterY: (lane: number) => number
    orcs: OrcRun[]
    drawOrcHpBar: (run: OrcRun) => void
    spawnHitRing: (x: number, y: number) => void
  }
): void {
  const { defendW, laneCenterY, orcs, drawOrcHpBar, spawnHitRing } = ctx
  for (let i = flyingBullets.length - 1; i >= 0; i--) {
    const b = flyingBullets[i]
    if (!orcs.includes(b.target) || b.target.hp <= 0) {
      b.g.destroy()
      flyingBullets.splice(i, 1)
      continue
    }
    b.elapsedMs += dMs
    const u = Math.min(1, b.elapsedMs / BULLET_FLIGHT_MS)
    const ex = defendW + b.target.root.x
    const ey = laneCenterY(b.target.lane)
    const midX = (b.sx + ex) * 0.5
    const midY = (b.sy + ey) * 0.5 - BULLET_ARC_LIFT
    const p0 = { x: b.sx, y: b.sy }
    const p1 = { x: midX, y: midY }
    const p2 = { x: ex, y: ey }
    const pos = quadBezierPoint(p0, p1, p2, u)
    const posNext = quadBezierPoint(p0, p1, p2, Math.min(1, u + 0.04))
    b.g.x = pos.x
    b.g.y = pos.y
    b.g.rotation = Math.atan2(posNext.y - pos.y, posNext.x - pos.x)
    if (u >= 1) {
      const t = b.target
      if (orcs.includes(t) && t.hp > 0) {
        const dmg = computeDamageAgainstArmor(b.attack, t.armor)
        t.hp -= dmg
        drawOrcHpBar(t)
        t.hitFlashMs = HIT_FLASH_MS
        spawnHitRing(ex, ey)
        if (t.hp <= 0) {
          t.root.removeFromParent()
          t.root.destroy({ children: true })
          const idx = orcs.indexOf(t)
          if (idx >= 0) {
            orcs.splice(idx, 1)
          }
        }
      }
      b.g.destroy()
      flyingBullets.splice(i, 1)
    }
  }
}
