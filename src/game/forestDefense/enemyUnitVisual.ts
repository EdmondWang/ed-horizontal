import { Graphics } from 'pixi.js'
import { pixiColors } from '../../utils/pixiColors'
import type { OrcRun } from './types'

/** 灰斧劫掠兵身体（敌线局部）。 */
export function createMeleeOrcBody(): Graphics {
  const body = new Graphics()
  body.roundRect(-28, -18, 56, 36, 4)
  body.fill({ color: pixiColors.game.enemy })
  return body
}

/** 投石蛮卒身体（敌线局部）。 */
export function createRockThrowerBody(): Graphics {
  const body = new Graphics()
  body.roundRect(-24, -16, 48, 32, 4)
  body.fill({ color: 0x78350f })
  body.stroke({ width: 1, color: 0xea580c, alpha: 0.65 })
  return body
}

/** 兽人头顶血条。 */
export function drawOrcHpBar(run: OrcRun): void {
  run.hpBar.clear()
  const ratio = run.hp / run.maxHp
  run.hpBar.rect(-30, -26, 60 * ratio, 5)
  run.hpBar.fill({ color: pixiColors.game.player })
}
