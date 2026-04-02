import { Container, Graphics } from 'pixi.js'
import { UNIT_ARCHER, UNIT_GATHERER } from './config'
import { buildArcherSilhouette, buildGathererSilhouette } from './unitSilhouettes'
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

  const body =
    kind === 'gatherer'
      ? buildGathererSilhouette(cellW, laneHeight)
      : buildArcherSilhouette(cellW, laneHeight)
  body.position.set(6, kind === 'gatherer' ? laneHeight * 0.28 : laneHeight * 0.25)
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
