import { Container, Graphics } from 'pixi.js'
import { pixiColors } from '../../utils/pixiColors'
import { UNIT_ARCHER, UNIT_GATHERER } from './config'
import type { BlueprintKind, PlacedUnit } from './types'

/** 防线槽内己方单位血条。 */
export function drawPlacedUnitHpBar(u: PlacedUnit, cellW: number): void {
  u.hpBar.clear()
  const ratio = u.hp / u.maxHp
  const barW = cellW - 14
  u.hpBar.rect(7, 7, barW * ratio, 4)
  u.hpBar.fill({ color: 0x34d399 })
}

/**
 * 在指定槽位创建采集芽或芽弓显示对象。
 */
export function createPlacedUnit(
  kind: BlueprintKind,
  slotIdx: number,
  slotRoots: Container[],
  cellW: number,
  laneHeight: number
): PlacedUnit {
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

  slotRoots[slotIdx].addChild(root)
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
  drawPlacedUnitHpBar(unit, cellW)
  return unit
}
