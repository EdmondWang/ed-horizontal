import { Container, Graphics } from 'pixi.js'
import { cellIndexToRowMajor, computeGridLayout } from './gridLayout'
import { pixiColors } from '../utils/pixiColors'

export interface MountGridWalkerTestOptions {
  referenceCellSize: number
  designWidth: number
  designHeight: number
  getRendererSize: () => { width: number; height: number }
  stage: Container
  resizeObserveTarget?: HTMLElement | null
  /** 每走一步后的停顿（毫秒），再进入下一格。 */
  stepPauseMs: number
  /** 精灵填充色，默认为主题绿（与 CSS `--color-game-player` 一致）。 */
  fillColor?: number
}

/**
 * 与自适应调试网格同尺寸的测试块，在屏幕网格上行优先遍历所有格子并循环。
 * 用于对照「物理格（stage）」与后续 `world` 逻辑坐标的衔接调试。
 */
export function mountGridWalkerTest(
  options: MountGridWalkerTestOptions
): { destroy: () => void } {
  const {
    referenceCellSize,
    designWidth,
    designHeight,
    getRendererSize,
    stage,
    resizeObserveTarget,
    stepPauseMs,
    fillColor = pixiColors.game.player
  } = options

  const g = new Graphics()
  g.label = 'grid-walker-test'
  stage.addChild(g)

  let cellIndex = 0

  const redraw = (): void => {
    const { width: W, height: H } = getRendererSize()
    const layout = computeGridLayout(W, H, designWidth, designHeight, referenceCellSize)
    if (!layout) {
      return
    }

    const { col, row } = cellIndexToRowMajor(layout, cellIndex)
    const x = layout.offsetX + col * layout.cellSize
    const y = layout.offsetY + row * layout.cellSize

    g.clear()
    g.position.set(0, 0)
    g.rect(x, y, layout.cellSize, layout.cellSize)
    g.fill({ color: fillColor, alpha: 0.92 })
    g.stroke({ width: 1, color: 0xffffff, alpha: 0.2, alignment: 1 })
  }

  const scheduleRedraw = (): void => {
    requestAnimationFrame(redraw)
  }

  const step = (): void => {
    const { width: W, height: H } = getRendererSize()
    const layout = computeGridLayout(W, H, designWidth, designHeight, referenceCellSize)
    if (!layout) {
      return
    }
    const total = layout.cols * layout.rows
    cellIndex = (cellIndex + 1) % total
    redraw()
  }

  window.addEventListener('resize', scheduleRedraw)

  let resizeObserver: ResizeObserver | null = null
  if (resizeObserveTarget && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(scheduleRedraw)
    resizeObserver.observe(resizeObserveTarget)
  }

  scheduleRedraw()
  redraw()

  const intervalId = window.setInterval(step, stepPauseMs)

  return {
    destroy: (): void => {
      window.clearInterval(intervalId)
      window.removeEventListener('resize', scheduleRedraw)
      resizeObserver?.disconnect()
      resizeObserver = null
      g.removeFromParent()
      g.destroy()
    }
  }
}
