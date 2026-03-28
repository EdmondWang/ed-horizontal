import { Game } from './core/Game'
import { SpriteEntity } from './entities/SpriteEntity'

async function main() {
  const game = new Game({
    width: 1280,
    height: 720,
    backgroundColor: 0x1a1a2e
  })

  await game.initialize()

  const renderSystem = game.getSystem('render')
  if (renderSystem) {
    const testEntity = new SpriteEntity({
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      color: 0x667eea
    })
    renderSystem.registerEntity(testEntity)
  }

  game.start()
}

main()
