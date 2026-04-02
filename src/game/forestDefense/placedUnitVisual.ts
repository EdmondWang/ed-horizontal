import { Container, Graphics, Sprite, Texture } from 'pixi.js'
import { UNIT_ARCHER, UNIT_GATHERER } from './config'
import { ArcherRig } from './archerRig'
import { buildArcherSilhouette, buildGathererSilhouette } from './unitSilhouettes'
import { slotSpriteBottomCenter, slotTextureCoverBounds } from './slotUnitLayout'
import type { BlueprintKind, PlacedUnit } from './types'

/**
 * 按单位配置创建身体显示：若配置了 `textureUrl` 且已预加载则使用 `Sprite`；
 * **芽弓**在贴图模式下使用 `ArcherRig` 骨架 + 躯干摆姿；否则使用 `Graphics` 剪影。
 */
function createBlueprintBody(
  kind: BlueprintKind,
  cellW: number,
  laneHeight: number
): Graphics | Sprite {
  const def = kind === 'gatherer' ? UNIT_GATHERER : UNIT_ARCHER
  if (
    kind === 'gatherer' &&
    'textureUrl' in def &&
    typeof def.textureUrl === 'string' &&
    def.textureUrl.length > 0
  ) {
    const sprite = new Sprite(Texture.from(def.textureUrl))
    const { maxW, maxH } = slotTextureCoverBounds(cellW, laneHeight)
    const tw = sprite.texture.width
    const th = sprite.texture.height
    const scaleW = maxW / tw
    const scaleH = maxH / th
    const scale = Math.max(scaleW, scaleH)
    sprite.scale.set(scale)
    sprite.anchor.set(0.5, 1)
    const pos = slotSpriteBottomCenter(cellW, laneHeight)
    sprite.position.set(pos.x, pos.y)
    return sprite
  }
  if (kind === 'archer') {
    const g = buildArcherSilhouette(cellW, laneHeight)
    g.position.set(6, laneHeight * 0.25)
    return g
  }
  const g = buildGathererSilhouette(cellW, laneHeight)
  g.position.set(6, laneHeight * 0.28)
  return g
}

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

  let body: Graphics | Sprite | Container
  let archerRig: ArcherRig | undefined

  const archerHasTexture =
    kind === 'archer' &&
    'textureUrl' in def &&
    typeof def.textureUrl === 'string' &&
    def.textureUrl.length > 0

  if (archerHasTexture) {
    archerRig = new ArcherRig(cellW, laneHeight)
    body = new Container()
    body.label = 'body'
    body.addChild(archerRig.displayRoot)
  } else {
    body = createBlueprintBody(kind, cellW, laneHeight)
    archerRig = undefined
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
    attack: def.attack,
    archerRig
  }
  drawPlacedUnitHpBar(unit, cellW)
  return unit
}
