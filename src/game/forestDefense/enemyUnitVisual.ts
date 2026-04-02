import { Graphics, Sprite, Texture } from 'pixi.js'
import { pixiColors } from '../../utils/pixiColors'
import { ENEMY_TEXTURE } from './config'
import { layoutEnemySprite } from './enemySpriteLayout'
import {
  buildMeleeOrcSilhouette,
  buildRockThrowerSilhouette,
  buildWarBeastSilhouette
} from './unitSilhouettes'
import type { EnemyKind, OrcRun } from './types'

function textureUrlForEnemy(kind: EnemyKind): string | undefined {
  switch (kind) {
    case 'melee':
      return ENEMY_TEXTURE.melee
    case 'rockthrower':
      return ENEMY_TEXTURE.rockthrower
    case 'warbeast':
      return ENEMY_TEXTURE.warbeast
    default:
      return undefined
  }
}

function buildFallbackBody(kind: EnemyKind): Graphics {
  switch (kind) {
    case 'melee':
      return buildMeleeOrcSilhouette()
    case 'rockthrower':
      return buildRockThrowerSilhouette()
    case 'warbeast':
      return buildWarBeastSilhouette()
    default:
      return buildMeleeOrcSilhouette()
  }
}

/**
 * 敌线单位身体：配置中有贴图则 `Sprite`（按车道高度与敌线宽度缩放），否则 Graphics 剪影。
 */
export function createEnemyBody(
  kind: EnemyKind,
  laneHeight: number,
  enemyColumnWidth: number,
  laneSpan: 1 | 2
): Graphics | Sprite {
  const url = textureUrlForEnemy(kind)
  if (url) {
    const sprite = new Sprite(Texture.from(url))
    layoutEnemySprite(sprite, kind, laneHeight, enemyColumnWidth, laneSpan)
    return sprite
  }
  return buildFallbackBody(kind)
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
