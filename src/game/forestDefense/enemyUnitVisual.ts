import { Graphics } from 'pixi.js'
import { pixiColors } from '../../utils/pixiColors'
import {
  buildMeleeOrcSilhouette,
  buildRockThrowerSilhouette,
  buildWarBeastSilhouette
} from './unitSilhouettes'
import type { OrcRun } from './types'

/** 灰斧劫掠兵身体（敌线局部）。 */
export function createMeleeOrcBody(): Graphics {
  return buildMeleeOrcSilhouette()
}

/** 投石蛮卒身体（敌线局部）。 */
export function createRockThrowerBody(): Graphics {
  return buildRockThrowerSilhouette()
}

/** 裂皮战争巨兽身体（敌线局部，中型跨道）。 */
export function createWarBeastBody(): Graphics {
  return buildWarBeastSilhouette()
}

/** 兽人头顶血条。 */
export function drawOrcHpBar(run: OrcRun): void {
  run.hpBar.clear()
  const ratio = run.hp / run.maxHp
  if (run.enemyKind === 'warbeast') {
    const barW = 100
    const barH = 8
    run.hpBar.rect(-barW / 2, -42, barW * ratio, barH)
  } else {
    run.hpBar.rect(-30, -26, 60 * ratio, 5)
  }
  run.hpBar.fill({ color: pixiColors.game.player })
}
