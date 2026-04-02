import { Graphics } from 'pixi.js'
import { pixiColors } from '../../utils/pixiColors'

/**
 * 无贴图时的单位外观：纯 Graphics 组合（头身、武器/芽叶/弓弦等），便于后续换 Sprite 时整图替换。
 */

/** 灰斧劫掠兵：大头、宽肩、斜举斧。 */
export function buildMeleeOrcSilhouette(): Graphics {
  const g = new Graphics()
  const enemy = pixiColors.game.enemy
  const skin = 0xfca5a5
  const skinDark = enemy
  const strap = 0x44403c

  g.circle(2, -14, 10)
  g.fill({ color: skin })

  g.roundRect(-18, -6, 36, 24, 6)
  g.fill({ color: skinDark })

  g.roundRect(-22, -8, 12, 8, 3)
  g.fill({ color: 0xf87171 })
  g.roundRect(10, -8, 12, 8, 3)
  g.fill({ color: 0xf87171 })

  g.rect(-6, 14, 12, 6)
  g.fill({ color: 0x292524 })

  g.moveTo(16, -4)
  g.lineTo(34, -14)
  g.lineTo(30, 2)
  g.lineTo(14, 4)
  g.closePath()
  g.fill({ color: 0xd6d3d1 })
  g.stroke({ width: 1, color: 0x57534e, alpha: 0.9 })

  g.moveTo(14, 0)
  g.lineTo(22, -6)
  g.stroke({ width: 4, color: 0x44403c, cap: 'round' })

  g.roundRect(8, -2, 4, 14, 1)
  g.fill({ color: strap })

  return g
}

/** 投石蛮卒：躬身、上举石块、背袋。 */
export function buildRockThrowerSilhouette(): Graphics {
  const g = new Graphics()
  const cloth = 0x713f12
  const clothDark = 0x5c2d0a

  g.ellipse(-4, 2, 16, 18)
  g.fill({ color: clothDark })

  g.circle(-6, -10, 8)
  g.fill({ color: 0xc2410c })

  g.moveTo(-10, -4)
  g.lineTo(-18, 8)
  g.stroke({ width: 5, color: cloth, cap: 'round' })

  g.moveTo(4, -6)
  g.lineTo(20, -22)
  g.stroke({ width: 4, color: cloth, cap: 'round' })

  g.circle(22, -24, 7)
  g.fill({ color: 0x57534e })
  g.stroke({ width: 1, color: 0x292524, alpha: 0.6 })

  g.roundRect(-20, 4, 10, 14, 2)
  g.fill({ color: 0x57534e, alpha: 0.85 })

  return g
}

/** 裂皮战争巨兽：中型跨道占位；宽厚躯干、裂皮纹理、獠牙与粗腿。 */
export function buildWarBeastSilhouette(): Graphics {
  const g = new Graphics()
  const hide = 0x7f1d1d
  const hideLight = 0x991b1b
  const crack = 0x1c1917

  g.ellipse(0, 6, 44, 26)
  g.fill({ color: hide })
  g.stroke({ width: 2, color: 0x450a0a, alpha: 0.85 })

  g.ellipse(-32, 2, 22, 18)
  g.fill({ color: hideLight })
  g.circle(-44, -4, 10)
  g.fill({ color: hide })
  g.moveTo(-52, -8)
  g.lineTo(-62, -18)
  g.lineTo(-56, -2)
  g.closePath()
  g.fill({ color: 0x44403c })

  g.moveTo(-8, -18)
  g.lineTo(4, -28)
  g.lineTo(12, -14)
  g.stroke({ width: 3, color: hideLight, cap: 'round' })
  g.moveTo(8, -16)
  g.lineTo(22, -24)
  g.stroke({ width: 3, color: hideLight, cap: 'round' })

  g.moveTo(-20, -2)
  g.lineTo(8, 8)
  g.stroke({ width: 1.5, color: crack, alpha: 0.65 })
  g.moveTo(4, -4)
  g.lineTo(28, 4)
  g.stroke({ width: 1.5, color: crack, alpha: 0.65 })
  g.moveTo(-12, 12)
  g.lineTo(16, 18)
  g.stroke({ width: 1.5, color: crack, alpha: 0.65 })

  const leg = (x: number): void => {
    g.roundRect(x, 22, 10, 18, 2)
    g.fill({ color: 0x292524 })
  }
  leg(-28)
  leg(-8)
  leg(12)
  leg(28)

  g.moveTo(-18, -12)
  g.lineTo(-10, -20)
  g.lineTo(-4, -12)
  g.stroke({ width: 2, color: 0xfbbf24, alpha: 0.5 })

  return g
}

/** 苔泉采集芽：水滴底座 + 双叶新芽。 */
export function buildGathererSilhouette(cellW: number, laneHeight: number): Graphics {
  const g = new Graphics()
  const w = cellW - 12
  const h = laneHeight * 0.44
  const cx = w * 0.5
  const baseY = h * 0.88

  g.ellipse(cx, baseY, w * 0.42, h * 0.14)
  g.fill({ color: 0x2dd4bf, alpha: 0.35 })
  g.stroke({ width: 1, color: 0x5eead4, alpha: 0.5 })

  g.moveTo(cx, baseY - 4)
  g.lineTo(cx, h * 0.35)
  g.stroke({ width: 3, color: 0x14b8a6, cap: 'round' })

  g.ellipse(cx - 10, h * 0.38, 12, 6)
  g.fill({ color: 0x5eead4, alpha: 0.85 })
  g.ellipse(cx + 10, h * 0.38, 12, 6)
  g.fill({ color: 0x5eead4, alpha: 0.85 })

  g.circle(cx, h * 0.22, 7)
  g.fill({ color: 0x99f6e4 })
  g.circle(cx, h * 0.2, 4)
  g.fill({ color: 0xccfbf1, alpha: 0.95 })

  return g
}

/** 芽弓巡林者：侧身、弓弧、搭箭。 */
export function buildArcherSilhouette(cellW: number, laneHeight: number): Graphics {
  const g = new Graphics()
  const w = cellW - 12
  const h = laneHeight * 0.5
  const player = pixiColors.game.player

  g.roundRect(w * 0.12, h * 0.28, w * 0.32, h * 0.44, 5)
  g.fill({ color: player })
  g.stroke({ width: 1, color: 0xffffff, alpha: 0.25 })

  g.circle(w * 0.22, h * 0.22, 8)
  g.fill({ color: 0x4ade80 })

  const bx = w * 0.62
  const by = h * 0.48
  const r = Math.min(h * 0.42, w * 0.28)
  g.arc(bx, by, r, 2.1, 4.0, false)
  g.stroke({ width: 3, color: 0xfbbf24, cap: 'round' })

  g.moveTo(bx - r * 0.95, by - r * 0.15)
  g.lineTo(bx - r * 0.95, by + r * 0.15)
  g.stroke({ width: 1, color: 0xfef3c7, alpha: 0.8 })

  g.moveTo(w * 0.38, h * 0.42)
  g.lineTo(w * 0.88, h * 0.38)
  g.stroke({ width: 2, color: 0xe2e8f0, cap: 'round' })

  g.moveTo(w * 0.88, h * 0.38)
  g.lineTo(w * 0.95, h * 0.34)
  g.lineTo(w * 0.95, h * 0.42)
  g.closePath()
  g.fill({ color: 0x94a3b8 })

  return g
}
