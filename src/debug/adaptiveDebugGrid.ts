import { Container, Graphics } from 'pixi.js'

export interface MountAdaptiveDebugGridOptions {
  /**
   * 参考单元格边长，仅用于从设计分辨率推导列数、行数；不参与实际像素边长计算。
   */
  referenceCellSize: number
  /** 设计分辨率宽度（列数 = floor(designWidth / referenceCellSize)）。 */
  designWidth: number
  /** 设计分辨率高度（行数 = floor(designHeight / referenceCellSize)）。 */
  designHeight: number
  /** 当前渲染区域尺寸（与 `renderer.width` / `height` 一致，一般为画布 CSS 像素）。 */
  getRendererSize: () => { width: number; height: number }
  /** 挂在 stage 上，使用屏幕/画布坐标（不受 letterbox 的 world 缩放影响）。 */
  stage: Container
  /** 可选：监听容器尺寸（与 Game 的 resizeTo 目标一致），避免仅 window resize 遗漏的布局变化。 */
  resizeObserveTarget?: HTMLElement | null
  lineColor?: number
  lineWidth?: number
  lineAlpha?: number
}

/**
 * 在「当前窗口/画布」内铺满整数格：实际边长 = min(宽/列数, 高/行数)，
 * 整块网格水平、垂直居中，故左右留白相等、上下留白相等，且不会出现半格裁切。
 */
export function mountAdaptiveDebugGrid(
  options: MountAdaptiveDebugGridOptions
): { update: () => void; destroy: () => void } {
  const {
    referenceCellSize,
    designWidth,
    designHeight,
    getRendererSize,
    stage,
    resizeObserveTarget,
    lineColor = 0x5a5a78,
    lineWidth = 1,
    lineAlpha = 0.45
  } = options

  const cols = Math.max(1, Math.floor(designWidth / referenceCellSize))
  const rows = Math.max(1, Math.floor(designHeight / referenceCellSize))

  const g = new Graphics()
  g.label = 'adaptive-debug-grid'
  stage.addChild(g)

  const redraw = (): void => {
    const { width: W, height: H } = getRendererSize()
    if (W <= 0 || H <= 0) {
      return
    }

    const cellSize = Math.min(W / cols, H / rows)
    const gridW = cols * cellSize
    const gridH = rows * cellSize
    const offsetX = (W - gridW) / 2
    const offsetY = (H - gridH) / 2

    g.clear()
    g.position.set(offsetX, offsetY)

    for (let i = 0; i <= cols; i++) {
      const x = i * cellSize
      g.moveTo(x, 0)
      g.lineTo(x, gridH)
    }
    for (let j = 0; j <= rows; j++) {
      const y = j * cellSize
      g.moveTo(0, y)
      g.lineTo(gridW, y)
    }

    g.stroke({
      width: lineWidth,
      color: lineColor,
      alpha: lineAlpha,
      alignment: 1
    })
  }

  const scheduleRedraw = (): void => {
    requestAnimationFrame(redraw)
  }

  window.addEventListener('resize', scheduleRedraw)

  let resizeObserver: ResizeObserver | null = null
  if (resizeObserveTarget && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(scheduleRedraw)
    resizeObserver.observe(resizeObserveTarget)
  }

  scheduleRedraw()

  return {
    update: redraw,
    destroy: (): void => {
      window.removeEventListener('resize', scheduleRedraw)
      resizeObserver?.disconnect()
      resizeObserver = null
      g.removeFromParent()
      g.destroy()
    }
  }
}
