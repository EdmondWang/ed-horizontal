import type { Container, Ticker } from 'pixi.js'
import { Graphics } from 'pixi.js'
import { cellIndexToRowMajor, computeGridLayout } from './gridLayout'

/** 单个扫屏精灵：颜色与步进间隔（毫秒）互不相同。 */
export interface ScreenSweepWalkerConfig {
  fillColor: number
  stepPauseMs: number
}

export interface MountScreenSweepWalkersOptions {
  referenceCellSize: number
  designWidth: number
  designHeight: number
  getRendererSize: () => { width: number; height: number }
  stage: Container
  resizeObserveTarget?: HTMLElement | null
  /** 与 Game 共用的 Pixi Ticker；单回调内对各精灵做时间累积。 */
  ticker: Ticker
  /** 每个精灵独立颜色与停顿；均行优先遍历全部格子并循环。 */
  walkers: ScreenSweepWalkerConfig[]
}

interface WalkerState {
  g: Graphics
  cellIndex: number
  fillColor: number
  stepPauseMs: number
  /** 距离上次前进一格已累计的毫秒数（单 ticker 内累积）。 */
  accumulatedMs: number
}

/**
 * Screen sweep：多个与格子同尺寸的色块，各自以不同间隔在屏幕网格上行优先遍历所有格子并循环。
 * 使用单 Ticker 时间累积，避免多 setInterval 与渲染帧错位。
 */
export function mountScreenSweepWalkers(
  options: MountScreenSweepWalkersOptions
): { destroy: () => void } {
  const {
    referenceCellSize,
    designWidth,
    designHeight,
    getRendererSize,
    stage,
    resizeObserveTarget,
    ticker,
    walkers
  } = options

  if (walkers.length === 0) {
    return { destroy: (): void => {} }
  }

  const states: WalkerState[] = []

  const redrawOne = (state: WalkerState): void => {
    const { width: W, height: H } = getRendererSize()
    const layout = computeGridLayout(W, H, designWidth, designHeight, referenceCellSize)
    if (!layout) {
      return
    }

    const { col, row } = cellIndexToRowMajor(layout, state.cellIndex)
    const x = layout.offsetX + col * layout.cellSize
    const y = layout.offsetY + row * layout.cellSize
    const { g, fillColor } = state

    g.clear()
    g.position.set(0, 0)
    g.rect(x, y, layout.cellSize, layout.cellSize)
    g.fill({ color: fillColor, alpha: 0.88 })
    g.stroke({ width: 1, color: 0xffffff, alpha: 0.18, alignment: 1 })
  }

  const redrawAll = (): void => {
    for (const s of states) {
      redrawOne(s)
    }
  }

  const scheduleRedraw = (): void => {
    requestAnimationFrame(redrawAll)
  }

  window.addEventListener('resize', scheduleRedraw)

  let resizeObserver: ResizeObserver | null = null
  if (resizeObserveTarget && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(scheduleRedraw)
    resizeObserver.observe(resizeObserveTarget)
  }

  for (let i = 0; i < walkers.length; i++) {
    const { fillColor, stepPauseMs } = walkers[i]
    const g = new Graphics()
    g.label = `screen-sweep-${i}`
    stage.addChild(g)

    states.push({
      g,
      cellIndex: 0,
      fillColor,
      stepPauseMs,
      accumulatedMs: 0
    })
  }

  const tick = (): void => {
    const { width: W, height: H } = getRendererSize()
    const layout = computeGridLayout(W, H, designWidth, designHeight, referenceCellSize)
    if (!layout) {
      return
    }
    const total = layout.cols * layout.rows
    const dt = ticker.deltaMS
    let changed = false

    for (const s of states) {
      s.accumulatedMs += dt
      while (s.accumulatedMs >= s.stepPauseMs) {
        s.accumulatedMs -= s.stepPauseMs
        s.cellIndex = (s.cellIndex + 1) % total
        changed = true
      }
    }

    if (changed) {
      redrawAll()
    }
  }

  ticker.add(tick)
  redrawAll()

  return {
    destroy: (): void => {
      ticker.remove(tick)
      for (const s of states) {
        s.g.removeFromParent()
        s.g.destroy()
      }
      states.length = 0
      window.removeEventListener('resize', scheduleRedraw)
      resizeObserver?.disconnect()
      resizeObserver = null
    }
  }
}
