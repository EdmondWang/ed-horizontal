import { Sprite } from 'pixi.js'
import type { EnemyKind } from './types'

const BOTTOM_PAD = 4

/**
 * 敌线贴图缩放：cover 铺满可用区；窄敌线列下用 `maxW` 上限避免横向过大。
 * 兽人进攻方向为右→左，立绘须**头朝左**面向防线；坐标系见下。
 * `root` 在单道时为车道竖直中心、双道时为两道几何中心；脚底落在下方车道底边附近。
 */
export function layoutEnemySprite(
  sprite: Sprite,
  kind: EnemyKind,
  laneHeight: number,
  enemyColumnWidth: number,
  laneSpan: 1 | 2
): void {
  const tw = sprite.texture.width
  const th = sprite.texture.height
  const maxH = laneSpan * laneHeight * 0.9
  const maxWCap =
    kind === 'warbeast'
      ? Math.min(enemyColumnWidth * 0.48, laneHeight * laneSpan * 1.05)
      : Math.min(enemyColumnWidth * 0.44, laneHeight * 1.2)
  const scaleW = maxWCap / tw
  const scaleH = maxH / th
  const scale = Math.max(scaleW, scaleH)
  sprite.scale.set(scale)
  sprite.anchor.set(0.5, 1)
  const bottomLocalY = laneSpan * laneHeight * 0.5 - BOTTOM_PAD
  sprite.position.set(0, bottomLocalY)
}
