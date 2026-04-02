import { Container, Graphics, Rectangle, Text } from 'pixi.js'
import type { Game } from '../../core/game'
import type { MainLayoutColumns } from '../../mainLayout'
import { quadBezierPoint } from '../../utils/bezier2'
import { drawDashedRectOutline } from '../../utils/pixiDashedRect'
import { pixiColors } from '../../utils/pixiColors'
import {
  BULLET_ARC_LIFT,
  BULLET_FLIGHT_MS,
  COLS_PER_LANE,
  colFromSlotIndex,
  FIRE_INTERVAL_MS,
  HIT_FLASH_MS,
  HIT_RING_MS,
  laneFromSlotIndex,
  LANE_COUNT,
  ORC_HP,
  ORC_LOSE_LINE_X,
  ORC_SPEED,
  ORCS_PER_SPAWN,
  ORCS_TO_WIN,
  POOL_START,
  SLOT_COUNT,
  SLOT_DASH_GAP,
  SLOT_DASH_INSET,
  SLOT_DASH_LEN,
  SPAWN_INTERVAL_MS,
  slotIndex
} from './config'

export interface MountMinimalPrototypeOptions {
  game: Game
  layout: MainLayoutColumns
}

interface OrcRun {
  root: Container
  body: Graphics
  hpBar: Graphics
  hp: number
  lane: number
  /** 受击闪白剩余时间（毫秒）。 */
  hitFlashMs: number
}

/** 飞行中的短弹体（`battleAreaCol` 局部坐标）。 */
interface FlyingBullet {
  g: Graphics
  elapsedMs: number
  sx: number
  sy: number
  target: OrcRun
}

/**
 * 最小可玩原型（`gameDesign.md`）：灵苗池点选 → 七纵三列防线槽位部署芽弓；
 * 基础远程仅在**本道防线**锁定同车道兽人；**短弹体**沿二次贝塞尔弧飞向目标，命中后扣血、受击闪白 + 扩散环。
 * 兽人冲过敌线左缘则败；消灭足够数量则胜。
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
  let poolRemaining = POOL_START
  let orcsSpawned = 0
  let spawnAcc = 0
  const fireAcc: number[] = Array.from({ length: SLOT_COUNT }, () => 0)

  const laneHeight = designHeight / LANE_COUNT
  const cellW = defendW / COLS_PER_LANE

  const flyingBullets: FlyingBullet[] = []
  const hitRings: { g: Graphics; ttlMs: number }[] = []

  const bulletLayer = new Container()
  bulletLayer.label = 'bulletLayer'
  bulletLayer.eventMode = 'none'
  battleAreaCol.addChild(bulletLayer)

  const orcs: OrcRun[] = []
  const defenders: (Graphics | null)[] = Array.from({ length: SLOT_COUNT }, () => null)

  /** 槽位占位（空槽可点部署），索引 `slotIndex(lane, col)`。 */
  const slotRoots: Container[] = []
  for (let lane = 0; lane < LANE_COUNT; lane++) {
    for (let col = 0; col < COLS_PER_LANE; col++) {
      const slot = new Container()
      slot.x = col * cellW
      slot.y = lane * laneHeight
      slot.label = `defendSlot-${lane}-${col}`
      /** 仅 stroke 时命中区极窄，几乎点不到；用整块矩形作为 hitArea。 */
      slot.hitArea = new Rectangle(0, 0, cellW, laneHeight)
      slot.eventMode = 'static'
      slot.cursor = 'pointer'
      slot.on('pointerdown', () => tryPlaceDefender(lane, col))
      const hint = new Graphics()
      hint.eventMode = 'none'
      const hw = cellW - SLOT_DASH_INSET * 2
      const hh = laneHeight - SLOT_DASH_INSET * 2
      drawDashedRectOutline(
        hint,
        SLOT_DASH_INSET,
        SLOT_DASH_INSET,
        hw,
        hh,
        SLOT_DASH_LEN,
        SLOT_DASH_GAP
      )
      hint.stroke({
        width: 2,
        color: 0xe2e8f0,
        alpha: 0.98,
        cap: 'round',
        join: 'round'
      })
      slot.addChild(hint)
      defendLineCol.addChild(slot)
      slotRoots.push(slot)
    }
  }

  const poolHint = new Text({
    text: '',
    style: {
      fill: pixiColors.game.player,
      fontSize: 14,
      fontFamily: 'system-ui, sans-serif',
      wordWrap: true,
      wordWrapWidth: layout.entityW - 8
    }
  })
  poolHint.anchor.set(0.5, 0)
  poolHint.x = layout.entityW / 2
  poolHint.y = 12
  poolHint.eventMode = 'none'
  entityPoolCol.addChild(poolHint)

  const titleHint = new Text({
    text: '青林誓环\n点防线空槽部署',
    style: {
      fill: 0xe2e8f0,
      fontSize: 12,
      fontFamily: 'system-ui, sans-serif',
      align: 'center',
      wordWrap: true,
      wordWrapWidth: layout.entityW - 8
    }
  })
  titleHint.anchor.set(0.5, 0)
  titleHint.x = layout.entityW / 2
  titleHint.y = designHeight - 72
  titleHint.eventMode = 'none'
  entityPoolCol.addChild(titleHint)

  const overlay = new Container()
  overlay.label = 'minimal-prototype-overlay'
  /** 不挡下方 `world` 内点击；胜负文案仅展示。 */
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

  function syncPoolText(): void {
    poolHint.text = `芽弓 ×${poolRemaining}\n（点防线空槽）`
  }

  function tryPlaceDefender(lane: number, col: number): void {
    if (phase !== 'playing') {
      return
    }
    const idx = slotIndex(lane, col)
    if (poolRemaining <= 0 || defenders[idx] !== null) {
      return
    }
    poolRemaining--
    const g = new Graphics()
    g.label = '芽弓巡林者'
    g.roundRect(8, laneHeight * 0.25, cellW - 16, laneHeight * 0.5, 6)
    g.fill({ color: pixiColors.game.player })
    g.stroke({ width: 1, color: 0xffffff, alpha: 0.35 })
    slotRoots[idx].addChild(g)
    defenders[idx] = g
    syncPoolText()
  }

  function spawnOrc(): void {
    if (phase !== 'playing' || orcsSpawned >= ORCS_TO_WIN) {
      return
    }
    orcsSpawned++
    const lane = Math.floor(Math.random() * LANE_COUNT)
    const root = new Container()
    root.label = '灰斧劫掠兵'
    root.x = enemyW - 36
    root.y = lane * laneHeight + laneHeight * 0.5

    const body = new Graphics()
    body.roundRect(-28, -18, 56, 36, 4)
    body.fill({ color: pixiColors.game.enemy })
    root.addChild(body)

    const hpBar = new Graphics()
    root.addChild(hpBar)

    const run: OrcRun = { root, body, hpBar, hp: ORC_HP, lane, hitFlashMs: 0 }
    orcs.push(run)
    drawOrcHp(run)
    enemyLineCol.addChild(root)
  }

  function drawOrcHp(run: OrcRun): void {
    run.hpBar.clear()
    const ratio = run.hp / ORC_HP
    run.hpBar.rect(-30, -26, 60 * ratio, 5)
    run.hpBar.fill({ color: pixiColors.game.player })
  }

  /** 本道防线中心 Y（`battleAreaCol` 局部）。 */
  function laneCenterY(lane: number): number {
    return lane * laneHeight + laneHeight * 0.5
  }

  /** 短弹体精灵（芽箭），锚点约在尖端。 */
  function createBulletShape(): Graphics {
    const g = new Graphics()
    g.eventMode = 'none'
    g.roundRect(0, -4, 14, 8, 3)
    g.fill({ color: 0xa7f3d0, alpha: 0.95 })
    g.stroke({ width: 1, color: 0xffffff, alpha: 0.65 })
    return g
  }

  function spawnFlyingBullet(sx: number, sy: number, target: OrcRun): void {
    const g = createBulletShape()
    g.x = sx
    g.y = sy
    bulletLayer.addChild(g)
    flyingBullets.push({ g, elapsedMs: 0, sx, sy, target })
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
        spawnOrc()
      }
    }
  }

  /** 兽人移动、受击闪白衰减、败北判定。 */
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

  function tickFlyingBullets(dMs: number): void {
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
          t.hp -= 1
          drawOrcHp(t)
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

  function tickDefendersFire(dMs: number): void {
    for (let i = 0; i < SLOT_COUNT; i++) {
      if (defenders[i] === null) {
        continue
      }
      fireAcc[i] += dMs
      if (fireAcc[i] < FIRE_INTERVAL_MS) {
        continue
      }
      fireAcc[i] = 0

      const lane = laneFromSlotIndex(i)
      const col = colFromSlotIndex(i)
      /** 芽弓从该槽位靠敌线一侧射出，仅攻击**本车道**兽人。 */
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
      spawnFlyingBullet(muzzleX, sy, best)
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
    tickHitRings(dMs)
    tickFlyingBullets(dMs)
    tickDefendersFire(dMs)
    tickWinIfCleared()
  }

  syncPoolText()
  {
    const n = Math.min(ORCS_PER_SPAWN, ORCS_TO_WIN - orcsSpawned)
    for (let k = 0; k < n; k++) {
      spawnOrc()
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
      for (const r of hitRings) {
        r.g.destroy()
      }
      hitRings.length = 0
      bulletLayer.removeFromParent()
      bulletLayer.destroy({ children: true })
      overlay.removeFromParent()
      overlay.destroy({ children: true })
      for (const d of defenders) {
        d?.destroy()
      }
      for (const run of orcs) {
        run.root.destroy({ children: true })
      }
    }
  }
}
