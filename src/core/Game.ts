import { Application, Container } from 'pixi.js'
import { applyLetterbox } from './Viewport'

export type GameFrameCallback = (deltaSeconds: number) => void

export interface GameConfig {
  /** Fixed logical resolution width (e.g. 1280). */
  designWidth: number
  /** Fixed logical resolution height (e.g. 720). */
  designHeight: number
  backgroundColor?: number
  antialias?: boolean
  /** Defaults to `window.devicePixelRatio`. */
  resolution?: number
}

/**
 * Root runtime: Pixi Application, letterboxed `world` container, and a single
 * ticker-driven frame callback. Use `world` for all gameplay display objects.
 */
export class Game {
  private app: Application | null = null
  private readonly config: Required<Pick<GameConfig, 'designWidth' | 'designHeight'>> &
    Omit<GameConfig, 'designWidth' | 'designHeight'>
  private readonly worldRoot: Container
  private frameCallback: GameFrameCallback | null = null
  private readonly onResize = (): void => this.syncLetterbox()
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

  async init(): Promise<void> {
    if (this.app) return

    const app = new Application()
    await app.init({
      resizeTo: window,
      backgroundColor: this.config.backgroundColor,
      antialias: this.config.antialias,
      resolution: this.config.resolution,
      autoDensity: true
    })

    this.app = app
    app.stage.addChild(this.worldRoot)

    const mount = document.getElementById('game-container')
    if (mount) {
      mount.appendChild(app.canvas)
    } else {
      document.body.appendChild(app.canvas)
    }

    window.addEventListener('resize', this.onResize)
    this.syncLetterbox()

    app.ticker.add(this.onTick)
  }

  /**
   * Re-run letterbox when the renderer size changes (e.g. window resize).
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

  /** Called every frame after `init`; pass `null` to clear. */
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
