import { Container, Graphics, Rectangle, Text } from 'pixi.js'
import { pixiColors } from '../../utils/pixiColors'
import { DAMAGE_K, UNIT_ARCHER, UNIT_GATHERER } from './config'
import type { BlueprintKind } from './types'

export interface PoolPanelApi {
  syncPoolUi: () => void
  destroy: () => void
}

/** 可负担：偏冷绿底 + 细绿边，表示「林息足够」。 */
const CARD_BG_AFFORD = 0x152a22
const CARD_STROKE_AFFORD = 0x22c55e

/** 不可负担：偏红灰底 + 暗红边，与可负担形成明显对比。 */
const CARD_BG_LOCKED = 0x1f1416
const CARD_STROKE_LOCKED = 0x9f1239

/** 选中待建：高亮描边与光晕（amber）。 */
const SELECT_RING = 0xfbbf24
const SELECT_GLOW = 0xf59e0b

/**
 * 灵苗池：林息、两种单位卡片（花费与 HP/护甲/攻击展示）、选中高亮。
 */
export function mountPoolPanel(
  entityPoolCol: Container,
  poolW: number,
  designHeight: number,
  getResource: () => number,
  getSelectedBlueprint: () => BlueprintKind | null,
  setSelectedBlueprint: (k: BlueprintKind | null) => void
): PoolPanelApi {
  const pad = 6
  const cardW = poolW - pad * 2

  const resourceText = new Text({
    text: '',
    style: {
      fill: pixiColors.game.player,
      fontSize: 14,
      fontFamily: 'system-ui, sans-serif',
      fontWeight: '600'
    }
  })
  resourceText.anchor.set(0.5, 0)
  resourceText.x = poolW / 2
  resourceText.y = 8
  resourceText.eventMode = 'none'
  entityPoolCol.addChild(resourceText)

  function makeBlueprintCard(
    y: number,
    kind: BlueprintKind,
    title: string,
    cost: number,
    hp: number,
    armor: number,
    attackLine: string
  ): {
    root: Container
    paint: (resource: number, selected: BlueprintKind | null) => void
  } {
    const root = new Container()
    root.y = y
    root.eventMode = 'static'
    root.cursor = 'pointer'
    root.hitArea = new Rectangle(0, 0, cardW, 72)

    const glow = new Graphics()
    glow.eventMode = 'none'
    root.addChild(glow)

    const bg = new Graphics()
    root.addChild(bg)

    const border = new Graphics()
    border.eventMode = 'none'

    const t1 = new Text({
      text: `${title}  ·  ${cost} 林息`,
      style: {
        fill: 0xf1f5f9,
        fontSize: 11,
        fontFamily: 'system-ui, sans-serif',
        fontWeight: '600',
        wordWrap: true,
        wordWrapWidth: cardW - 8
      }
    })
    t1.x = 6
    t1.y = 6
    t1.eventMode = 'none'
    root.addChild(t1)

    const t2 = new Text({
      text: `生命 ${hp}  护甲 ${armor}  ${attackLine}`,
      style: {
        fill: 0x94a3b8,
        fontSize: 10,
        fontFamily: 'system-ui, sans-serif',
        wordWrap: true,
        wordWrapWidth: cardW - 8
      }
    })
    t2.x = 6
    t2.y = 28
    t2.eventMode = 'none'
    root.addChild(t2)

    const lockHint = new Text({
      text: '林息不足',
      style: {
        fill: 0xfca5a5,
        fontSize: 9,
        fontFamily: 'system-ui, sans-serif',
        fontWeight: '600'
      }
    })
    lockHint.anchor.set(1, 0)
    lockHint.x = cardW - 6
    lockHint.y = 52
    lockHint.eventMode = 'none'
    root.addChild(lockHint)
    /** 选中金边盖在文字之上，避免被遮挡。 */
    root.addChild(border)

    function paint(resource: number, selected: BlueprintKind | null): void {
      const affordable = resource >= cost
      const isSelected = selected === kind

      bg.clear()
      bg.roundRect(0, 0, cardW, 72, 8)
      if (affordable) {
        bg.fill({ color: CARD_BG_AFFORD, alpha: 0.98 })
        bg.stroke({ width: 2, color: CARD_STROKE_AFFORD, alpha: 0.85 })
      } else {
        bg.fill({ color: CARD_BG_LOCKED, alpha: 0.98 })
        bg.stroke({ width: 2, color: CARD_STROKE_LOCKED, alpha: 0.75 })
      }

      glow.clear()
      border.clear()
      if (isSelected) {
        glow.roundRect(-3, -3, cardW + 6, 78, 10)
        glow.fill({ color: SELECT_GLOW, alpha: 0.35 })
        glow.stroke({ width: 0 })

        border.roundRect(0, 0, cardW, 72, 8)
        border.stroke({ width: 5, color: SELECT_RING, alpha: 1, cap: 'round', join: 'round' })
      }

      if (affordable) {
        t1.style.fill = 0xf8fafc
        t2.style.fill = 0xcbd5e1
      } else {
        t1.style.fill = 0x9ca3af
        t2.style.fill = 0x6b7280
      }
      lockHint.visible = !affordable
      root.alpha = 1
    }

    root.x = pad
    root.on('pointerdown', () => {
      const cur = getSelectedBlueprint()
      setSelectedBlueprint(cur === kind ? null : kind)
      syncPoolUi()
    })
    entityPoolCol.addChild(root)
    return { root, paint }
  }

  const gathererCard = makeBlueprintCard(
    36,
    'gatherer',
    UNIT_GATHERER.name,
    UNIT_GATHERER.cost,
    UNIT_GATHERER.maxHp,
    UNIT_GATHERER.armor,
    `攻击 —（非战斗）  +${UNIT_GATHERER.gatherAmount}林息/${Math.round(UNIT_GATHERER.gatherIntervalMs / 1000)}s`
  )

  const archerCard = makeBlueprintCard(
    114,
    'archer',
    UNIT_ARCHER.name,
    UNIT_ARCHER.cost,
    UNIT_ARCHER.maxHp,
    UNIT_ARCHER.armor,
    `攻击 ${UNIT_ARCHER.attack}  ·  K=${DAMAGE_K} 减伤`
  )

  const titleHint = new Text({
    text: '先点选单位，再点空槽',
    style: {
      fill: 0xe2e8f0,
      fontSize: 11,
      fontFamily: 'system-ui, sans-serif',
      align: 'center',
      wordWrap: true,
      wordWrapWidth: poolW - 8
    }
  })
  titleHint.anchor.set(0.5, 0)
  titleHint.x = poolW / 2
  titleHint.y = designHeight - 56
  titleHint.eventMode = 'none'
  entityPoolCol.addChild(titleHint)

  function syncPoolUi(): void {
    const resource = getResource()
    const selected = getSelectedBlueprint()
    resourceText.text = `林息 ${resource}`
    gathererCard.paint(resource, selected)
    archerCard.paint(resource, selected)
  }

  return {
    syncPoolUi,
    destroy: (): void => {
      resourceText.destroy()
      gathererCard.root.destroy({ children: true })
      archerCard.root.destroy({ children: true })
      titleHint.destroy()
    }
  }
}
