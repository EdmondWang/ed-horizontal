import { Graphics } from 'pixi.js'
import { Game } from './core/Game'
import { pixiColors } from './utils/pixiColors'

/**
 * 第一阶段：启动流程、letterbox 世界与可选的开发用边框。
 * 后续：输入管线（配合 clientToWorld）、实体/系统、资源与音频等。
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
