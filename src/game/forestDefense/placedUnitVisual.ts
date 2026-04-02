import { Container, Graphics, Sprite, Texture } from 'pixi.js'
import { UNIT_ARCHER, UNIT_GATHERER } from './config'
import { buildArcherSilhouette, buildGathererSilhouette } from './unitSilhouettes'
import type { BlueprintKind, PlacedUnit } from './types'

/** 身体区与槽底虚线框之间的留白。 */
const SLOT_BODY_BOTTOM_PAD = 4
/** 与 Graphics 剪影路径一致的水平内缩（左右各 6）。 */
const SLOT_BODY_H_INSET = 6
/**
 * 贴图槽位水平内缩略小，便于窄列（如 `defendW=128`）下仍够大；
 * 竖向用「铺满槽高」计算缩放，血条盖在上层，可遮住角色头顶一小条。
 */
const SLOT_TEXTURE_H_INSET = 2

/** 贴图用 cover：至少铺满宽或高一维，避免宽图在窄槽里被宽度卡成几像素高。 */
function slotTextureCoverBounds(cellW: number, laneHeight: number): { maxW: number; maxH: number } {
  const maxW = Math.max(8, cellW - SLOT_TEXTURE_H_INSET * 2)
  const maxH = Math.max(8, laneHeight - SLOT_BODY_BOTTOM_PAD)
  return { maxW, maxH }
}

/**
 * 按单位配置创建身体显示：若配置了 `textureUrl` 且已预加载则使用 `Sprite`，否则使用 `Graphics` 剪影。
 */
function createBlueprintBody(
  kind: BlueprintKind,
  cellW: number,
  laneHeight: number
): Graphics | Sprite {
  const def = kind === 'gatherer' ? UNIT_GATHERER : UNIT_ARCHER
  if (
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
    sprite.position.set(cellW * 0.5, laneHeight - SLOT_BODY_BOTTOM_PAD)
    return sprite
  }
  const g =
    kind === 'gatherer'
      ? buildGathererSilhouette(cellW, laneHeight)
      : buildArcherSilhouette(cellW, laneHeight)
  g.position.set(
    SLOT_BODY_H_INSET,
    kind === 'gatherer' ? laneHeight * 0.28 : laneHeight * 0.25
  )
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

  const body = createBlueprintBody(kind, cellW, laneHeight)
  root.addChild(body)

  const hpBar = new Graphics()
  root.addChild(hpBar)

  if (body instanceof Sprite) {
    root.sortableChildren = true
    const clip = new Graphics()
    clip.eventMode = 'none'
    clip.rect(0, 0, cellW, laneHeight)
    clip.fill({ color: 0xffffff })
    clip.zIndex = 0
    body.zIndex = 0
    hpBar.zIndex = 1
    root.addChild(clip)
    root.mask = clip
  }

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
