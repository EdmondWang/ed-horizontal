import { System } from './System'
import { Entity } from '../entities/Entity'
import { Container } from 'pixi.js'

export class RenderSystem extends System {
  private container: Container

  constructor(container: Container) {
    super()
    this.container = container
  }

  update(_deltaTime: number): void {
    this.entities.forEach((entity) => {
      if (entity.active) {
        const displayObject = entity.displayObject
        if (!this.container.children.includes(displayObject)) {
          this.container.addChild(displayObject)
        }
      }
    })
  }

  registerEntity(entity: Entity): void {
    super.registerEntity(entity)
    this.container.addChild(entity.displayObject)
  }

  unregisterEntity(entity: Entity): void {
    super.unregisterEntity(entity)
    const displayObject = entity.displayObject
    if (this.container.children.includes(displayObject)) {
      this.container.removeChild(displayObject)
    }
  }
}
