import { Container, Graphics } from 'pixi.js'
import type { Game } from '../../core/game'
import type { MainLayoutColumns } from '../../mainLayout'
import {
  colFromSlotIndex,
  FIRE_INTERVAL_MS,
  laneFromSlotIndex,
  LANE_COUNT,
  ORC_ARMOR,
  ORC_LOSE_LINE_X,
  ORC_MAX_HP,
  ORC_SPEED,
  ORCS_PER_SPAWN,
  ORCS_TO_WIN,
  SLOT_COUNT,
  SPAWN_INTERVAL_MS,
  SPAWN_WEIGHT_GREY_AXE,
  SPAWN_WEIGHT_WAR_BEAST,
  slotIndex,
  STARTING_RESOURCE,
  UNIT_ARCHER,
  UNIT_GATHERER,
  WAR_BEAST_ARMOR,
  WAR_BEAST_MAX_HP,
  WAR_BEAST_SPEED
} from './config'
import { tickEnemyRockProjectiles, tickRockThrowerRanged } from './enemyRockCombat'
import {
  createMeleeOrcBody,
  createRockThrowerBody,
  createWarBeastBody,
  drawOrcHpBar
} from './enemyUnitVisual'
import { createDefendSlotGrid } from './defendSlotGrid'
import { createHitRingGraphics, tickHitRings } from './hitRingVfx'
import { findFrontmostOrcInLane } from './laneQueries'
import { tickOrcMeleeOnDefenders } from './orcMeleeCombat'
import { createPlacedUnit, drawPlacedUnitHpBar } from './placedUnitVisual'
import { createPlayerBulletShape, tickPlayerFlyingBullets } from './playerBulletCombat'
import { mountPoolPanel } from './poolPanel'
import type {
  BlueprintKind,
  EnemyRockProjectile,
  FlyingBullet,
  HitRingEntry,
  OrcRun,
  PlacedUnit
} from './types'

export interface MountForestDefenseOptions {
  game: Game
  layout: MainLayoutColumns
  /** 为 true 时本帧不推进玩法（暂停）。 */
  isPaused?: () => boolean
  /** 分出胜负时回调一次（用于主菜单流程展示结算）。 */
  onMatchEnd?: (result: 'win' | 'lose') => void
}

/**
 * 挂载林缘防线玩法：`gameDesign.md` 中的林息、采集/防御单位、伤害公式与灵苗池等。
 *
 * 每帧子系统顺序（便于排查交互）：周期造敌 → 兽人左移/冲线败北 → 灰斧/巨兽近战 → 投石发射 →
 * 敌投石弹道 → 命中环 → 芽箭弹道 → 采集产林息 → 芽弓射击 → 判胜。
 */
export function mountForestDefense(options: MountForestDefenseOptions): { destroy: () => void } {
  const { game, layout, isPaused, onMatchEnd } = options
  const {
    entityPoolCol,
    battleAreaCol,
    defendLineCol,
    enemyLineCol,
    defendW,
    enemyW,
    designHeight
  } = layout

  type Phase = 'playing' | 'win' | 'lose'

  let phase: Phase = 'playing'
  let resource = STARTING_RESOURCE
  let selectedBlueprint: BlueprintKind | null = null
  let orcsSpawned = 0
  let spawnAcc = 0
  const slotActionAcc: number[] = Array.from({ length: SLOT_COUNT }, () => 0)

  const poolW = layout.entityW
  const poolPanel = mountPoolPanel(
    entityPoolCol,
    poolW,
    designHeight,
    () => resource,
    () => selectedBlueprint,
    (k) => {
      selectedBlueprint = k
    }
  )

  const { slotRoots, cellW, laneHeight } = createDefendSlotGrid(
    defendLineCol,
    defendW,
    designHeight,
    tryPlaceUnit
  )

  const flyingBullets: FlyingBullet[] = []
  const enemyRockProjectiles: EnemyRockProjectile[] = []
  const hitRings: HitRingEntry[] = []

  const bulletLayer = new Container()
  bulletLayer.label = 'bulletLayer'
  bulletLayer.eventMode = 'none'
  battleAreaCol.addChild(bulletLayer)

  const orcs: OrcRun[] = []
  const placedUnits: (PlacedUnit | null)[] = Array.from({ length: SLOT_COUNT }, () => null)

  function tryPlaceUnit(lane: number, col: number): void {
    if (phase !== 'playing' || selectedBlueprint === null) {
      return
    }
    const idx = slotIndex(lane, col)
    if (placedUnits[idx] !== null) {
      return
    }
    const def = selectedBlueprint === 'gatherer' ? UNIT_GATHERER : UNIT_ARCHER
    if (resource < def.cost) {
      return
    }
    resource -= def.cost
    const u = createPlacedUnit(selectedBlueprint, idx, slotRoots, cellW, laneHeight)
    placedUnits[idx] = u
    poolPanel.syncPoolUi()
  }

  function removePlacedUnitAt(idx: number): void {
    const u = placedUnits[idx]
    if (!u) {
      return
    }
    u.root.destroy({ children: true })
    placedUnits[idx] = null
  }

  function spawnEnemy(): void {
    if (phase !== 'playing' || orcsSpawned >= ORCS_TO_WIN) {
      return
    }
    orcsSpawned++
    const roll = Math.random()
    const isWarBeast = roll < SPAWN_WEIGHT_WAR_BEAST
    const isGreyAxe = !isWarBeast && Math.random() < SPAWN_WEIGHT_GREY_AXE

    let lane: number
    let laneSpan: 1 | 2
    if (isWarBeast) {
      laneSpan = 2
      lane = Math.floor(Math.random() * (LANE_COUNT - 1))
    } else {
      laneSpan = 1
      lane = Math.floor(Math.random() * LANE_COUNT)
    }

    const root = new Container()
    root.label = isWarBeast ? '裂皮战争巨兽' : isGreyAxe ? '灰斧劫掠兵' : '投石蛮卒'
    root.x = enemyW - 36
    root.y =
      laneSpan === 2 ? (lane + 1) * laneHeight : lane * laneHeight + laneHeight * 0.5

    const body = isWarBeast
      ? createWarBeastBody()
      : isGreyAxe
        ? createMeleeOrcBody()
        : createRockThrowerBody()
    root.addChild(body)

    const hpBar = new Graphics()
    root.addChild(hpBar)

    const run: OrcRun = {
      root,
      body,
      hpBar,
      hp: isWarBeast ? WAR_BEAST_MAX_HP : ORC_MAX_HP,
      maxHp: isWarBeast ? WAR_BEAST_MAX_HP : ORC_MAX_HP,
      armor: isWarBeast ? WAR_BEAST_ARMOR : ORC_ARMOR,
      lane,
      laneSpan,
      hitFlashMs: 0,
      meleeAcc: 0,
      enemyKind: isWarBeast ? 'warbeast' : isGreyAxe ? 'melee' : 'rockthrower',
      rangedAcc: 0
    }
    orcs.push(run)
    drawOrcHpBar(run)
    enemyLineCol.addChild(root)
  }

  function laneCenterY(lane: number): number {
    return lane * laneHeight + laneHeight * 0.5
  }

  function spawnFlyingBullet(sx: number, sy: number, target: OrcRun, attack: number): void {
    const g = createPlayerBulletShape()
    g.x = sx
    g.y = sy
    bulletLayer.addChild(g)
    flyingBullets.push({ g, elapsedMs: 0, sx, sy, target, attack })
  }

  function spawnHitRing(x: number, y: number): void {
    const g = createHitRingGraphics()
    g.x = x
    g.y = y
    bulletLayer.addChild(g)
    hitRings.push({ g, ttlMs: 0 })
  }

  function tickSpawnOrcs(dMs: number): void {
    spawnAcc += dMs
    if (spawnAcc >= SPAWN_INTERVAL_MS && orcsSpawned < ORCS_TO_WIN) {
      spawnAcc = 0
      const n = Math.min(ORCS_PER_SPAWN, ORCS_TO_WIN - orcsSpawned)
      for (let k = 0; k < n; k++) {
        spawnEnemy()
      }
    }
  }

  function tickOrcs(dt: number, dMs: number): boolean {
    for (const run of orcs) {
      if (run.hitFlashMs > 0) {
        run.hitFlashMs -= dMs
        run.body.tint = run.hitFlashMs > 0 ? 0xfff5e6 : 0xffffff
      }
      const moveSpeed = run.enemyKind === 'warbeast' ? WAR_BEAST_SPEED : ORC_SPEED
      run.root.x -= moveSpeed * dt
      if (run.root.x <= ORC_LOSE_LINE_X) {
        phase = 'lose'
        onMatchEnd?.('lose')
        return true
      }
    }
    return false
  }

  function tickGatherers(dMs: number): void {
    for (let i = 0; i < SLOT_COUNT; i++) {
      const u = placedUnits[i]
      if (u === null || u.kind !== 'gatherer') {
        continue
      }
      slotActionAcc[i] += dMs
      if (slotActionAcc[i] < UNIT_GATHERER.gatherIntervalMs) {
        continue
      }
      slotActionAcc[i] = 0
      resource += UNIT_GATHERER.gatherAmount
      poolPanel.syncPoolUi()
    }
  }

  function tickArchersFire(dMs: number): void {
    for (let i = 0; i < SLOT_COUNT; i++) {
      const u = placedUnits[i]
      if (u === null || u.kind !== 'archer') {
        continue
      }
      slotActionAcc[i] += dMs
      if (slotActionAcc[i] < FIRE_INTERVAL_MS) {
        continue
      }
      slotActionAcc[i] = 0

      const lane = laneFromSlotIndex(i)
      const col = colFromSlotIndex(i)
      const muzzleX = (col + 1) * cellW - 6
      const best = findFrontmostOrcInLane(orcs, lane, defendW)
      if (best === null) {
        continue
      }
      const sy = laneCenterY(lane)
      spawnFlyingBullet(muzzleX, sy, best, u.attack)
    }
  }

  function tickWinIfCleared(): void {
    if (orcsSpawned >= ORCS_TO_WIN && orcs.length === 0) {
      phase = 'win'
      onMatchEnd?.('win')
    }
  }

  function tick(): void {
    if (isPaused?.()) {
      return
    }
    if (phase !== 'playing') {
      return
    }

    const dt = game.ticker.deltaMS / 1000
    const dMs = game.ticker.deltaMS
    tickSpawnOrcs(dMs)
    if (tickOrcs(dt, dMs)) {
      return
    }
    tickOrcMeleeOnDefenders(orcs, dMs, placedUnits, removePlacedUnitAt, (u) =>
      drawPlacedUnitHpBar(u, cellW)
    )
    tickRockThrowerRanged(orcs, dMs, {
      defendW,
      laneCenterY,
      cellW,
      placedUnits,
      bulletLayer,
      enemyRockProjectiles
    })
    tickEnemyRockProjectiles(
      enemyRockProjectiles,
      dMs,
      placedUnits,
      removePlacedUnitAt,
      (u) => drawPlacedUnitHpBar(u, cellW),
      spawnHitRing
    )
    tickHitRings(hitRings, dMs)
    tickPlayerFlyingBullets(flyingBullets, dMs, {
      defendW,
      laneHeight,
      orcs,
      drawOrcHpBar,
      spawnHitRing
    })
    tickGatherers(dMs)
    tickArchersFire(dMs)
    tickWinIfCleared()
  }

  poolPanel.syncPoolUi()
  {
    const n = Math.min(ORCS_PER_SPAWN, ORCS_TO_WIN - orcsSpawned)
    for (let k = 0; k < n; k++) {
      spawnEnemy()
    }
  }

  game.ticker.add(tick)

  return {
    destroy: (): void => {
      game.ticker.remove(tick)
      for (const b of flyingBullets) {
        b.g.destroy()
      }
      flyingBullets.length = 0
      for (const p of enemyRockProjectiles) {
        p.g.destroy()
      }
      enemyRockProjectiles.length = 0
      for (const r of hitRings) {
        r.g.destroy()
      }
      hitRings.length = 0
      bulletLayer.removeFromParent()
      bulletLayer.destroy({ children: true })
      poolPanel.destroy()
      for (const slot of slotRoots) {
        slot.removeFromParent()
        slot.destroy({ children: true })
      }
      for (const run of orcs) {
        run.root.destroy({ children: true })
      }
    }
  }
}
