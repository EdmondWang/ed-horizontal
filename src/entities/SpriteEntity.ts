import { Entity, EntityConfig } from '../entities/Entity'
import { Graphics } from 'pixi.js'

export interface SpriteEntityConfig extends EntityConfig {
  width?: number
  height?: number
  color?: number
}

export class SpriteEntity extends Entity {
  private graphics: Graphics
  private width: number
  private height: number

  constructor(config: SpriteEntityConfig) {
    super(config)
    this.width = config.width || 50
    this.height = config.height || 50

    this.graphics = new Graphics()
    this.drawShape(config.color || 0xffffff)
    this.container.addChild(this.graphics)
  }

  private drawShape(color: number): void {
    this.graphics.clear()
    this.graphics.rect(0, 0, this.width, this.height)
    this.graphics.fill({ color })
  }

  setColor(color: number): void {
    this.drawShape(color)
  }

  update(_deltaTime: number): void {
  }
}
