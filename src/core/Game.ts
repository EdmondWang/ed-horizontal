import { Application, Container, Renderer } from 'pixi.js'
import { applyLetterbox } from './Viewport'

/** 每帧回调，参数为与上一帧的时间间隔（秒）。 */
export type GameFrameCallback = (deltaSeconds: number) => void

export interface GameConfig {
  /** 固定逻辑分辨率宽度（例如 1280）。 */
  designWidth: number
  /** 固定逻辑分辨率高度（例如 720）。 */
  designHeight: number
  backgroundColor?: number
  antialias?: boolean
  /** 默认使用 `window.devicePixelRatio`。 */
  resolution?: number
}

/**
 * 运行时根对象：Pixi Application、letterbox 下的 `world` 容器，
 * 以及由 ticker 驱动的单路帧回调。所有玩法相关的显示对象应挂在 `world` 下。
 */
export class Game {
  private app: Application | null = null
  private readonly config: Required<Pick<GameConfig, 'designWidth' | 'designHeight'>> &
    Omit<GameConfig, 'designWidth' | 'designHeight'>
  private readonly worldRoot: Container
  private frameCallback: GameFrameCallback | null = null
  /** 放在下一帧执行，确保排在 Pixi ResizePlugin 的 resize 之后，使用最新 renderer 尺寸。 */
  private readonly onResize = (): void => {
    requestAnimationFrame(() => this.syncLetterbox())
  }
  private readonly onTick = (): void => {
    if (!this.app) return
    this.frameCallback?.(this.app.ticker.deltaMS / 1000)
  }

  constructor(config: GameConfig) {
    this.config = {
      backgroundColor: 0x000000,
      antialias: true,
      resolution: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
      ...config
    }
    this.worldRoot = new Container()
    this.worldRoot.label = 'world'
  }

  get world(): Container {
    return this.worldRoot
  }

  get designWidth(): number {
    return this.config.designWidth
  }

  get designHeight(): number {
    return this.config.designHeight
  }

  /** 初始化后可访问，用于屏幕空间叠加层（如自适应调试网格）。 */
  get renderer(): Renderer {
    if (!this.app) {
      throw new Error('Game 尚未 init')
    }
    return this.app.renderer
  }

  /** 初始化后可访问；`world` 为其子节点，用于 letterbox 内玩法坐标。 */
  get stage(): Container {
    if (!this.app) {
      throw new Error('Game 尚未 init')
    }
    return this.app.stage
  }

  async init(): Promise<void> {
    if (this.app) return

    const mount = document.getElementById('game-container')
    /** 与画布挂载的容器一致，避免 innerWidth/innerHeight 与容器 client 尺寸不一致导致 letterbox 与可见区域错位。 */
    const resizeTarget: Window | HTMLElement = mount ?? window

    const app = new Application()
    await app.init({
      resizeTo: resizeTarget,
      backgroundColor: this.config.backgroundColor,
      antialias: this.config.antialias,
      resolution: this.config.resolution,
      autoDensity: true
    })

    this.app = app
    app.stage.addChild(this.worldRoot)

    if (mount) {
      mount.appendChild(app.canvas)
    } else {
      document.body.appendChild(app.canvas)
    }

    window.addEventListener('resize', this.onResize)
    this.onResize()

    app.ticker.add(this.onTick)
  }

  /**
   * 当渲染尺寸变化时（例如窗口 resize）重新计算 letterbox。
   */
  private syncLetterbox(): void {
    if (!this.app) return
    const { width, height } = this.app.renderer
    applyLetterbox(
      this.worldRoot,
      this.config.designWidth,
      this.config.designHeight,
      width,
      height
    )
  }

  /** 在 `init` 之后每帧调用；传入 `null` 可清除回调。 */
  setFrameCallback(fn: GameFrameCallback | null): void {
    this.frameCallback = fn
  }

  getCanvas(): HTMLCanvasElement | null {
    return this.app?.canvas ?? null
  }

  destroy(): void {
    if (!this.app) return

    window.removeEventListener('resize', this.onResize)
    this.app.ticker.remove(this.onTick)
    this.frameCallback = null

    this.app.destroy(true, { children: true })
    this.app = null
  }
}
