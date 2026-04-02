import { type Container, Graphics } from 'pixi.js'
import {
  COLS_PER_LANE,
  ENEMY_ROCK_FLIGHT_MS,
  ROCK_THROWER_ATTACK,
  ROCK_THROWER_FIRE_INTERVAL_MS,
  colFromSlotIndex,
  slotIndex
} from './config'
import { computeDamageAgainstArmor } from './damage'
import type { EnemyRockProjectile, OrcRun, PlacedUnit } from './types'


/** 投石蛮卒石块精灵（自右向左）。 */
export function createEnemyRockShape(): Graphics {
  const g = new Graphics()
  g.eventMode = 'none'
  g.ellipse(0, 0, 9, 7)
  g.fill({ color: 0x57534e, alpha: 0.98 })
  g.stroke({ width: 1, color: 0x1c1917, alpha: 0.5 })
  return g
}

export function findRightmostUnitSlotInLane(
  placedUnits: (PlacedUnit | null)[],
  lane: number
): number | null {
  for (let col = COLS_PER_LANE - 1; col >= 0; col--) {
    const idx = slotIndex(lane, col)
    if (placedUnits[idx] !== null) {
      return idx
    }
  }
  return null
}

export function tickRockThrowerRanged(
  orcs: readonly OrcRun[],
  dMs: number,
  ctx: {
    defendW: number
    laneCenterY: (lane: number) => number
    cellW: number
    placedUnits: (PlacedUnit | null)[]
    bulletLayer: Container
    enemyRockProjectiles: EnemyRockProjectile[]
  }
): void {
  const { defendW, laneCenterY, cellW, placedUnits, bulletLayer, enemyRockProjectiles } = ctx
  for (const run of orcs) {
    if (run.enemyKind !== 'rockthrower') {
      continue
    }
    run.rangedAcc += dMs
    if (run.rangedAcc < ROCK_THROWER_FIRE_INTERVAL_MS) {
      continue
    }
    run.rangedAcc = 0
    const idx = findRightmostUnitSlotInLane(placedUnits, run.lane)
    if (idx === null) {
      continue
    }
    const col = colFromSlotIndex(idx)
    const sx = defendW + run.root.x
    const sy = laneCenterY(run.lane)
    const tx = col * cellW + cellW * 0.5
    const ty = laneCenterY(run.lane)
    const g = createEnemyRockShape()
    g.rotation = Math.atan2(ty - sy, tx - sx)
    g.x = sx
    g.y = sy
    bulletLayer.addChild(g)
    enemyRockProjectiles.push({
      g,
      elapsedMs: 0,
      sx,
      sy,
      tx,
      ty,
      targetSlotIdx: idx,
      attack: ROCK_THROWER_ATTACK
    })
  }
}

export function tickEnemyRockProjectiles(
  projectiles: EnemyRockProjectile[],
  dMs: number,
  placedUnits: (PlacedUnit | null)[],
  removePlacedUnitAt: (idx: number) => void,
  drawPlacedUnitHp: (u: PlacedUnit) => void,
  spawnHitRing: (x: number, y: number) => void
): void {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i]
    p.elapsedMs += dMs
    const u = Math.min(1, p.elapsedMs / ENEMY_ROCK_FLIGHT_MS)
    const x = p.sx + (p.tx - p.sx) * u
    const y = p.sy + (p.ty - p.sy) * u
    p.g.x = x
    p.g.y = y
    if (u >= 1) {
      const target = placedUnits[p.targetSlotIdx]
      if (target !== null) {
        const dmg = computeDamageAgainstArmor(p.attack, target.armor)
        target.hp -= dmg
        if (target.hp <= 0) {
          removePlacedUnitAt(p.targetSlotIdx)
        } else {
          drawPlacedUnitHp(target)
        }
      }
      spawnHitRing(p.tx, p.ty)
      p.g.destroy()
      projectiles.splice(i, 1)
    }
  }
}
