import { Game } from './core/Game'
import { mountAdaptiveDebugGrid } from './debug/adaptiveDebugGrid'
import { mountGridWalkerTest } from './debug/mountGridWalkerTest'
import { pixiColors } from './utils/pixiColors'

/**
 * 参考格子边长，仅用于从设计分辨率推导「列数、行数」；实际像素边长由当前窗口与列/行数决定。
 */
const DEBUG_GRID_CELL_SIZE = 32

/** 测试精灵沿网格每走一步后的停顿（秒 → 毫秒）。 */
const DEBUG_WALK_STEP_PAUSE_MS = 500

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

  const getRendererSize = (): { width: number; height: number } => ({
    width: game.renderer.width,
    height: game.renderer.height
  })

  mountAdaptiveDebugGrid({
    referenceCellSize: DEBUG_GRID_CELL_SIZE,
    designWidth: game.designWidth,
    designHeight: game.designHeight,
    getRendererSize,
    stage: game.stage,
    resizeObserveTarget: mount
  })

  /** 后挂载，画在网格线之上；与网格共用 `computeGridLayout` 几何。 */
  mountGridWalkerTest({
    referenceCellSize: DEBUG_GRID_CELL_SIZE,
    designWidth: game.designWidth,
    designHeight: game.designHeight,
    getRendererSize,
    stage: game.stage,
    resizeObserveTarget: mount,
    stepPauseMs: DEBUG_WALK_STEP_PAUSE_MS
  })
}

main().catch((err) => {
  console.error(err)
})
