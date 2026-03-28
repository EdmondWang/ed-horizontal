import { Entity } from '../entities/Entity'

export abstract class System {
  protected entities: Set<Entity> = new Set()
  protected isActive: boolean = true

  abstract update(deltaTime: number): void

  registerEntity(entity: Entity): void {
    this.entities.add(entity)
  }

  unregisterEntity(entity: Entity): void {
    this.entities.delete(entity)
  }

  activate(): void {
    this.isActive = true
  }

  deactivate(): void {
    this.isActive = false
  }

  get active(): boolean {
    return this.isActive
  }

  get entityCount(): number {
    return this.entities.size
  }

  clear(): void {
    this.entities.clear()
  }
}
