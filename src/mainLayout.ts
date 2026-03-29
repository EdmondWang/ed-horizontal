import { Container, Graphics } from 'pixi.js'
import { pixiColors } from './utils/pixiColors'

/** `entityPoolCol` 逻辑宽度。 */
const DEFAULT_ENTITY_POOL_COL_WIDTH = 128

/** `battleAreaCol` 内 `defendLineCol` 的逻辑宽度。 */
const DEFAULT_DEFEND_LINE_COL_WIDTH = 128

export interface MountMainTwoColumnLayoutOptions {
  /** 玩法根节点，坐标系为设计分辨率。 */
  world: Container
  designWidth: number
  designHeight: number
  /** `entityPoolCol` 宽度，默认 128。 */
  entityPoolColWidth?: number
  /** `defendLineCol` 宽度（相对 `battleAreaCol`），默认 128。 */
  defendLineColWidth?: number
}

/**
 * 主界面布局（逻辑像素）：
 * - `entityPoolCol` | `battleAreaCol`
 * - `battleAreaCol` 内：`defendLineCol` | `enemyLineCol`
 *
 * 各列用不同背景色便于核对；子节点通过 `label` 与场景树对应。
 */
export function mountMainTwoColumnLayout(options: MountMainTwoColumnLayoutOptions): void {
  const {
    world,
    designWidth,
    designHeight,
    entityPoolColWidth = DEFAULT_ENTITY_POOL_COL_WIDTH,
    defendLineColWidth = DEFAULT_DEFEND_LINE_COL_WIDTH
  } = options

  const entityW = Math.min(entityPoolColWidth, designWidth)
  const battleW = designWidth - entityW

  const entityPoolCol = new Container()
  entityPoolCol.label = 'entityPoolCol'
  addColumnBackground(entityPoolCol, entityW, designHeight, pixiColors.bgSecondary)
  world.addChild(entityPoolCol)

  if (battleW <= 0) {
    return
  }

  const battleAreaCol = new Container()
  battleAreaCol.label = 'battleAreaCol'
  battleAreaCol.x = entityW

  const defendW = Math.min(defendLineColWidth, battleW)
  const enemyW = battleW - defendW

  const defendLineCol = new Container()
  defendLineCol.label = 'defendLineCol'
  addColumnBackground(defendLineCol, defendW, designHeight, pixiColors.bgTertiary)
  battleAreaCol.addChild(defendLineCol)

  const enemyLineCol = new Container()
  enemyLineCol.label = 'enemyLineCol'
  enemyLineCol.x = defendW
  if (enemyW > 0) {
    addColumnBackground(enemyLineCol, enemyW, designHeight, pixiColors.bgElevated)
  }
  battleAreaCol.addChild(enemyLineCol)

  world.addChild(battleAreaCol)
}

/** 在容器内绘制与列同宽的矩形背景（局部坐标从 0,0 起）。 */
function addColumnBackground(
  parent: Container,
  width: number,
  height: number,
  fillColor: number
): void {
  if (width <= 0) {
    return
  }
  const g = new Graphics()
  g.rect(0, 0, width, height)
  g.fill({ color: fillColor })
  parent.addChild(g)
}
