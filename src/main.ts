import { Game } from './core/Game'
import { mountAdaptiveDebugGrid } from './debug/adaptiveDebugGrid'
import { pixiColors } from './utils/pixiColors'

/**
 * 参考格子边长，仅用于从设计分辨率推导「列数、行数」；实际像素边长由当前窗口与列/行数决定。
 */
const DEBUG_GRID_CELL_SIZE = 32

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

  const mount = document.getElementById('game-container')

  mountAdaptiveDebugGrid({
    referenceCellSize: DEBUG_GRID_CELL_SIZE,
    designWidth: game.designWidth,
    designHeight: game.designHeight,
    getRendererSize: () => ({
      width: game.renderer.width,
      height: game.renderer.height
    }),
    stage: game.stage,
    resizeObserveTarget: mount
  })
}

main().catch((err) => {
  console.error(err)
})
