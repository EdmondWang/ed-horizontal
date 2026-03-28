import { Container } from 'pixi.js'

export interface EntityConfig {
  id?: string
  x?: number
  y?: number
  width?: number
  height?: number
}

export abstract class Entity {
  protected id: string
  protected container: Container
  protected isActive: boolean = true

  constructor(config: EntityConfig) {
    this.id = config.id || this.generateId()
    this.container = new Container()

    if (config.x !== undefined) this.container.x = config.x
    if (config.y !== undefined) this.container.y = config.y
  }

  private generateId(): string {
    return `${this.constructor.name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  abstract update(deltaTime: number): void

  activate(): void {
    this.isActive = true
    this.container.visible = true
  }

  deactivate(): void {
    this.isActive = false
    this.container.visible = false
  }

  destroy(): void {
    this.container.destroy()
  }

  get displayObject(): Container {
    return this.container
  }

  get position(): { x: number; y: number } {
    return { x: this.container.x, y: this.container.y }
  }

  set position(pos: { x: number; y: number }) {
    this.container.x = pos.x
    this.container.y = pos.y
  }

  get active(): boolean {
    return this.isActive
  }
}
