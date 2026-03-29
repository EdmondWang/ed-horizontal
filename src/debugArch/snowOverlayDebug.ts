import type { Container, Ticker } from 'pixi.js'
import { Graphics } from 'pixi.js'

export interface MountSnowOverlayOptions {
  stage: Container
  getRendererSize: () => { width: number; height: number }
  /** 与 Game 共用的 Pixi Ticker，卸载时需 remove 同一回调。 */
  ticker: Ticker
  resizeObserveTarget?: HTMLElement | null
  /** 雪花数量 */
  flakeCount?: number
}

interface Flake {
  x: number
  y: number
  vy: number
  vx: number
  r: number
}

/**
 * 下雪调试层：全屏飘落雪花，与扫屏模式互斥挂载。
 */
export function mountSnowOverlay(options: MountSnowOverlayOptions): { destroy: () => void } {
  const {
    stage,
    getRendererSize,
    ticker,
    resizeObserveTarget,
    flakeCount = 140
  } = options

  const g = new Graphics()
  g.label = 'snow-overlay-debug'
  stage.addChild(g)

  let flakes: Flake[] = []

  const initFlakes = (w: number, h: number): void => {
    flakes = Array.from({ length: flakeCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vy: 0.35 + Math.random() * 1.6,
      vx: -0.35 + Math.random() * 0.7,
      r: 0.6 + Math.random() * 2.4
    }))
  }

  const tick = (): void => {
    const { width: w, height: h } = getRendererSize()
    if (w <= 0 || h <= 0) {
      return
    }
    if (flakes.length === 0) {
      initFlakes(w, h)
    }

    g.clear()
    for (const f of flakes) {
      f.y += f.vy
      f.x += f.vx + Math.sin(f.y * 0.011) * 0.35
      if (f.y > h + 10) {
        f.y = -10
        f.x = Math.random() * w
      }
      if (f.x < -12) {
        f.x = w + 12
      }
      if (f.x > w + 12) {
        f.x = -12
      }
      g.circle(f.x, f.y, f.r)
      g.fill({ color: 0xffffff, alpha: 0.62 })
    }
  }

  const onResize = (): void => {
    const { width: w, height: h } = getRendererSize()
    if (w > 0 && h > 0) {
      initFlakes(w, h)
    }
  }

  const scheduleResizeFlakes = (): void => {
    requestAnimationFrame(onResize)
  }

  window.addEventListener('resize', scheduleResizeFlakes)

  let resizeObserver: ResizeObserver | null = null
  if (resizeObserveTarget && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(scheduleResizeFlakes)
    resizeObserver.observe(resizeObserveTarget)
  }

  ticker.add(tick)
  onResize()

  return {
    destroy: (): void => {
      ticker.remove(tick)
      window.removeEventListener('resize', scheduleResizeFlakes)
      resizeObserver?.disconnect()
      resizeObserver = null
      g.removeFromParent()
      g.destroy()
      flakes = []
    }
  }
}
