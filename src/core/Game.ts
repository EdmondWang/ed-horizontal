import { Application, Container } from 'pixi.js'
import { System } from '../systems/System'
import { RenderSystem } from '../systems/RenderSystem'
import { InputSystem } from '../systems/InputSystem'

export interface GameConfig {
  width: number
  height: number
  backgroundColor?: number
  antialias?: boolean
  resolution?: number
}

export class Game {
  private app: Application | null = null
  private config: GameConfig
  private gameContainer: Container
  private isRunning: boolean = false
  private lastTime: number = 0
  private systems: Map<string, System> = new Map()
  private renderSystem: RenderSystem
  private inputSystem: InputSystem

  constructor(config: GameConfig) {
    this.config = {
      backgroundColor: 0x000000,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      ...config
    }
    this.gameContainer = new Container()
    this.renderSystem = new RenderSystem(this.gameContainer)
    this.inputSystem = new InputSystem()

    this.registerSystem('render', this.renderSystem)
    this.registerSystem('input', this.inputSystem)
  }

  async initialize(): Promise<void> {
    this.app = new Application()

    await this.app.init({
      width: this.config.width,
      height: this.config.height,
      backgroundColor: this.config.backgroundColor,
      antialias: this.config.antialias,
      resolution: this.config.resolution,
      autoDensity: true,
      resizeTo: window
    })

    const container = document.getElementById('game-container')
    if (container) {
      container.appendChild(this.app.canvas)
    }

    this.app.stage.addChild(this.gameContainer)
    this.setupResizeHandler()
  }

  private setupResizeHandler(): void {
    if (!this.app) return

    window.addEventListener('resize', () => {
      if (this.app) {
        const ratio = Math.min(
          window.innerWidth / this.config.width,
          window.innerHeight / this.config.height
        )
        this.gameContainer.scale.set(ratio)
        this.gameContainer.x = (window.innerWidth - this.config.width * ratio) / 2
        this.gameContainer.y = (window.innerHeight - this.config.height * ratio) / 2
      }
    })

    window.dispatchEvent(new Event('resize'))
  }

  start(): void {
    if (this.isRunning) return

    this.isRunning = true
    this.lastTime = performance.now()
    this.gameLoop()
  }

  stop(): void {
    this.isRunning = false
  }

  private gameLoop = (): void => {
    if (!this.isRunning) return

    const currentTime = performance.now()
    const deltaTime = (currentTime - this.lastTime) / 1000
    this.lastTime = currentTime

    this.update(deltaTime)
    this.render()

    requestAnimationFrame(this.gameLoop)
  }

  private update(deltaTime: number): void {
    this.systems.forEach((system) => {
      if (system.active) {
        system.update(deltaTime)
      }
    })
  }

  private render(): void {
  }

  registerSystem(name: string, system: System): void {
    this.systems.set(name, system)
  }

  unregisterSystem(name: string): void {
    const system = this.systems.get(name)
    if (system) {
      system.clear()
      this.systems.delete(name)
    }
  }

  getSystem<T extends System>(name: string): T | undefined {
    return this.systems.get(name) as T
  }

  get container(): Container {
    return this.gameContainer
  }

  get input(): InputSystem {
    return this.inputSystem
  }

  destroy(): void {
    this.stop()
    this.systems.forEach((system) => system.clear())
    if (this.app) {
      this.app.destroy(true)
      this.app = null
    }
  }
}
