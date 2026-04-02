import { Container, Graphics, Text } from 'pixi.js'
import type { Game } from '../../core/game'
import type { MainLayoutColumns } from '../../mainLayout'
import { pixiColors } from '../../utils/pixiColors'
import {
  colFromSlotIndex,
  FIRE_INTERVAL_MS,
  HIT_RING_MS,
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
  slotIndex,
  STARTING_RESOURCE,
  UNIT_ARCHER,
  UNIT_GATHERER
} from './config'
import { tickEnemyRockProjectiles, tickRockThrowerRanged } from './enemyRockCombat'
import { createDefendSlotGrid } from './defendSlotGrid'
import { tickOrcMeleeOnDefenders } from './orcMeleeCombat'
import { createPlayerBulletShape, tickPlayerFlyingBullets } from './playerBulletCombat'
import { mountPoolPanel } from './poolPanel'
import type {
  BlueprintKind,
  EnemyRockProjectile,
  FlyingBullet,
  OrcRun,
  PlacedUnit
} from './types'

export interface MountMinimalPrototypeOptions {
  game: Game
  layout: MainLayoutColumns
}

/**
 * 林缘防线原型：`gameDesign.md` 中的林息、采集/防御单位、伤害公式与灵苗池展示。
 */
export function mountMinimalForestDefensePrototype(
  options: MountMinimalPrototypeOptions
): { destroy: () => void } {
  const { game, layout } = options
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
  const hitRings: { g: Graphics; ttlMs: number }[] = []

  const bulletLayer = new Container()
  bulletLayer.label = 'bulletLayer'
  bulletLayer.eventMode = 'none'
  battleAreaCol.addChild(bulletLayer)

  const orcs: OrcRun[] = []
  const placedUnits: (PlacedUnit | null)[] = Array.from({ length: SLOT_COUNT }, () => null)

  const overlay = new Container()
  overlay.label = 'minimal-prototype-overlay'
  overlay.eventMode = 'none'
  game.stage.addChild(overlay)

  const endText = new Text({
    text: '',
    style: {
      fill: 0xffffff,
      fontSize: 28,
      fontFamily: 'system-ui, sans-serif',
      align: 'center',
      stroke: { color: 0x000000, width: 4 }
    }
  })
  endText.anchor.set(0.5)
  endText.x = game.designWidth / 2
  endText.y = game.designHeight / 2
  overlay.addChild(endText)

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
    const u = createPlacedUnit(selectedBlueprint, idx)
    placedUnits[idx] = u
    poolPanel.syncPoolUi()
  }

  function createPlacedUnit(kind: BlueprintKind, idx: number): PlacedUnit {
    const def = kind === 'gatherer' ? UNIT_GATHERER : UNIT_ARCHER
    const root = new Container()
    root.label = def.name

    const body = new Graphics()
    if (kind === 'gatherer') {
      body.roundRect(6, laneHeight * 0.28, cellW - 12, laneHeight * 0.44, 5)
      body.fill({ color: 0x5eead4 })
      body.stroke({ width: 1, color: 0xccfbf1, alpha: 0.55 })
    } else {
      body.roundRect(6, laneHeight * 0.25, cellW - 12, laneHeight * 0.5, 6)
      body.fill({ color: pixiColors.game.player })
      body.stroke({ width: 1, color: 0xffffff, alpha: 0.35 })
    }
    root.addChild(body)

    const hpBar = new Graphics()
    root.addChild(hpBar)

    slotRoots[idx].addChild(root)
    const unit: PlacedUnit = {
      kind,
      root,
      body,
      hpBar,
      hp: def.maxHp,
      maxHp: def.maxHp,
      armor: def.armor,
      attack: def.attack
    }
    drawPlacedUnitHp(unit)
    return unit
  }

  function drawPlacedUnitHp(u: PlacedUnit): void {
    u.hpBar.clear()
    const ratio = u.hp / u.maxHp
    const barW = cellW - 14
    u.hpBar.rect(7, 7, barW * ratio, 4)
    u.hpBar.fill({ color: 0x34d399 })
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
    const lane = Math.floor(Math.random() * LANE_COUNT)
    const isGreyAxe = Math.random() < SPAWN_WEIGHT_GREY_AXE
    const root = new Container()
    root.label = isGreyAxe ? '灰斧劫掠兵' : '投石蛮卒'
    root.x = enemyW - 36
    root.y = lane * laneHeight + laneHeight * 0.5

    const body = new Graphics()
    if (isGreyAxe) {
      body.roundRect(-28, -18, 56, 36, 4)
      body.fill({ color: pixiColors.game.enemy })
    } else {
      body.roundRect(-24, -16, 48, 32, 4)
      body.fill({ color: 0x78350f })
      body.stroke({ width: 1, color: 0xea580c, alpha: 0.65 })
    }
    root.addChild(body)

    const hpBar = new Graphics()
    root.addChild(hpBar)

    const run: OrcRun = {
      root,
      body,
      hpBar,
      hp: ORC_MAX_HP,
      maxHp: ORC_MAX_HP,
      armor: ORC_ARMOR,
      lane,
      hitFlashMs: 0,
      meleeAcc: 0,
      enemyKind: isGreyAxe ? 'melee' : 'rockthrower',
      rangedAcc: 0
    }
    orcs.push(run)
    drawOrcHp(run)
    enemyLineCol.addChild(root)
  }

  function drawOrcHp(run: OrcRun): void {
    run.hpBar.clear()
    const ratio = run.hp / run.maxHp
    run.hpBar.rect(-30, -26, 60 * ratio, 5)
    run.hpBar.fill({ color: pixiColors.game.player })
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
    const g = new Graphics()
    g.eventMode = 'none'
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
      run.root.x -= ORC_SPEED * dt
      if (run.root.x <= ORC_LOSE_LINE_X) {
        phase = 'lose'
        endText.text = '斧痕过线，母树沉默。'
        return true
      }
    }
    return false
  }

  function tickHitRings(dMs: number): void {
    for (let i = hitRings.length - 1; i >= 0; i--) {
      const ring = hitRings[i]
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
        hitRings.splice(i, 1)
      }
    }
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
      let best: OrcRun | null = null
      let bestEnemyX = Number.POSITIVE_INFINITY
      for (const run of orcs) {
        if (run.lane !== lane) {
          continue
        }
        const ex = defendW + run.root.x
        if (ex < bestEnemyX) {
          bestEnemyX = ex
          best = run
        }
      }
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
      endText.text = '林线还在，根脉未断。'
    }
  }

  function tick(): void {
    if (phase !== 'playing') {
      return
    }

    const dt = game.ticker.deltaMS / 1000
    const dMs = game.ticker.deltaMS
    tickSpawnOrcs(dMs)
    if (tickOrcs(dt, dMs)) {
      return
    }
    tickOrcMeleeOnDefenders(orcs, dMs, placedUnits, removePlacedUnitAt, drawPlacedUnitHp)
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
      drawPlacedUnitHp,
      spawnHitRing
    )
    tickHitRings(dMs)
    tickPlayerFlyingBullets(flyingBullets, dMs, {
      defendW,
      laneCenterY,
      orcs,
      drawOrcHp,
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
      overlay.removeFromParent()
      overlay.destroy({ children: true })
      poolPanel.destroy()
      for (const u of placedUnits) {
        u?.root.destroy({ children: true })
      }
      for (const run of orcs) {
        run.root.destroy({ children: true })
      }
    }
  }
}
