/**
 * 本模块封装 Pixi 的「应用 + 画布 + 游戏世界」。
 *
 * Pixi 最小概念（无基础可先记这几条）：
 * - **Application**：引擎入口，内部持有「渲染器 Renderer」「舞台 Stage」「时钟 Ticker」等；`init()` 会创建真正的 `<canvas>`。
 * - **Stage（舞台）**：根显示节点，坐标系与**整个画布/窗口**对齐（屏幕像素空间）；适合放 HUD、全屏调试层。
 * - **Container（容器）**：可嵌套的节点，像「空文件夹」；本项目的 `world` 就是一个 Container，**所有玩法精灵应挂在 `world` 下**。
 * - **Ticker**：按帧触发（通常与显示器刷新率一致），`deltaMS` 是上一帧到本帧的毫秒数，用于每帧更新逻辑。
 * - **Renderer**：负责把场景画到 canvas；`width`/`height` 是当前绘制区域大小（与 letterbox 计算有关）。
 *
 * 为何单独要 `world`：玩法使用**固定逻辑分辨率**（如 1280×720），通过缩放 + 居中塞进任意窗口叫 letterbox；`world` 被缩放/平移，而 `stage` 不缩放，便于区分「游戏内坐标」和「屏幕像素」。
 */

import { Application, Container, Renderer, Ticker } from 'pixi.js'
import type { GameConfig, GameFrameCallback } from '../types/game'
import { applyLetterbox } from './viewport'

export type { GameConfig, GameFrameCallback }

/**
 * 运行时根对象：Pixi Application、letterbox 下的 `world` 容器，
 * 以及由 ticker 驱动的单路帧回调。
 *
 * ## 代码执行顺序（首次进入游戏）
 *
 * 1. `new Game(options)`：只保存配置、创建空的 `world` Container（**此时还没有 canvas，也没有 Pixi Application**）。
 * 2. `await game.init()`（必须 await）：
 *    2.1 创建 `Application` 并 `await app.init(...)` → 内部完成 WebGL/Canvas、创建 canvas 元素。
 *    2.2 `app.stage.addChild(world)` → 把 `world` 挂到舞台下（之后 letterbox 会改 `world` 的 scale/position）。
 *    2.3 把 `canvas` 插进 DOM（`#game-container` 或 `body`）。
 *    2.4 监听 `window` 的 `resize`，并**立刻调用一次** `onResize` → 下一帧 `syncLetterbox`。
 *    2.5 `app.ticker.add(onTick)` → 之后**每一帧**都会调用 `onTick`。
 * 3. 进入运行态：**每一帧**顺序大致为（Pixi 内部会排序）：
 *    - 处理 resize（若窗口变了）→ ResizePlugin 先更新 renderer 尺寸 → 我们的 `onResize` 用 `requestAnimationFrame` 延后到**下一帧**再 `syncLetterbox`，避免读到旧尺寸。
 *    - `onTick`：调用你通过 `setFrameCallback` 注册的「游戏逻辑回调」（单位：秒）。
 *    - 渲染一帧画面到屏幕。
 * 4. `destroy()`：先解绑 resize、从 ticker 移除 `onTick`，再销毁 Application（含 canvas 与显示对象）。
 */
export class Game {
  private app: Application | null = null
  /** 构造阶段已填入默认值，运行时等价于「全部必填」；入参仍用 `GameConfig`（部分键可选）。 */
  private readonly config: Required<GameConfig>
  private readonly worldRoot: Container
  private frameCallback: GameFrameCallback | null = null

  /**
   * 浏览器窗口尺寸变化时触发。
   * 使用 `requestAnimationFrame` 再调用 `syncLetterbox`：保证排在 Pixi ResizePlugin **之后**执行，此时 `renderer.width/height` 已是新值。
   */
  private readonly onResize = (): void => {
    requestAnimationFrame(() => this.syncLetterbox())
  }

  /**
   * 每一帧在 `app.ticker` 上调用；内部再调用 `frameCallback`（若有）。
   * 传入的 delta 来自 `ticker.deltaMS / 1000`，单位为秒。
   */
  private readonly onTick = (): void => {
    if (!this.app) return
    this.frameCallback?.(this.app.ticker.deltaMS / 1000)
  }

  /**
   * **同步**：仅合并默认配置、创建 `world` 容器。**不创建** Application / canvas。
   * 下一步必须由外部调用 `init()`。
   */
  /** 参数名避免与实例字段 `config` 同名，否则 TS 会报「同名声明修饰符须一致」。 */
  constructor(options: GameConfig) {
    this.config = {
      backgroundColor: 0x000000,
      antialias: true,
      resolution: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
      ...options
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

  /** 初始化后可访问；用于与渲染同帧的叠加效果（如下雪调试层）。 */
  get ticker(): Ticker {
    if (!this.app) {
      throw new Error('Game 尚未 init')
    }
    return this.app.ticker
  }

  /**
   * **异步初始化**：创建 Pixi Application、挂载 canvas、注册 resize 与每帧回调。
   * 调用顺序见类文档「首次进入游戏」。
   */
  async init(): Promise<void> {
    if (this.app) return

    const mount = document.getElementById('game-container')
    /** 与画布挂载的容器一致，避免 innerWidth/innerHeight 与容器 client 尺寸不一致导致 letterbox 与可见区域错位。 */
    const resizeTarget: Window | HTMLElement = mount ?? window

    const app = new Application()
    // 1) 初始化渲染系统；resizeTo 使 canvas 随目标元素（或 window）尺寸变化。
    await app.init({
      resizeTo: resizeTarget,
      backgroundColor: this.config.backgroundColor,
      antialias: this.config.antialias,
      resolution: this.config.resolution,
      autoDensity: true
    })

    this.app = app
    // 2) 舞台在下、玩法在上：先挂 world，后续对 world 做 letterbox 变换。
    app.stage.addChild(this.worldRoot)

    // 3) DOM：把画布放进页面，否则用户看不到。
    if (mount) {
      mount.appendChild(app.canvas)
    } else {
      document.body.appendChild(app.canvas)
    }

    // 4) 窗口变化时更新 world 的缩放与位置；立刻调一次以完成首帧 letterbox。
    window.addEventListener('resize', this.onResize)
    this.onResize()

    // 5) 注册每帧逻辑（在 Pixi 的渲染循环里执行）。
    app.ticker.add(this.onTick)
  }

  /**
   * 按当前 renderer 的宽高，把 `world` 缩放到「包含」设计分辨率并居中（letterbox）。
   * 由 `onResize` 在下一帧调用，避免与 ResizePlugin 抢顺序。
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

  /**
   * 释放资源顺序：先解绑浏览器与 ticker，再销毁 Application（会销毁 canvas 与子节点）。
   */
  destroy(): void {
    if (!this.app) return

    window.removeEventListener('resize', this.onResize)
    this.app.ticker.remove(this.onTick)
    this.frameCallback = null

    this.app.destroy(true, { children: true })
    this.app = null
  }
}
