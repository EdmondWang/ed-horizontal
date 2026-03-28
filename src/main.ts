import { Graphics } from 'pixi.js'
import { Game } from './core/Game'
import { pixiColors } from './utils/pixiColors'

/**
 * Phase 1: bootstrap + letterboxed world + optional dev outline.
 * Next: input pipeline (using clientToWorld), entity/system layers, assets, audio.
 */
async function main() {
  const game = new Game({
    designWidth: 1280,
    designHeight: 720,
    backgroundColor: pixiColors.bgPrimary
  })

  await game.init()

  const outline = new Graphics()
  outline.rect(0, 0, game.designWidth, game.designHeight)
  outline.stroke({ width: 2, color: pixiColors.strokeMuted })
  game.world.addChild(outline)
}

main().catch((err) => {
  console.error(err)
})
