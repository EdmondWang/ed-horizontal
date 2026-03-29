import { Game } from './core/game'
import { mountAdaptiveDebugGrid } from './debug/adaptiveDebugGrid'
import { mountScreenSweepWalkers } from './debug/screenSweepDebug'
import type { ScreenSweepWalkerConfig } from './debug/screenSweepDebug'
import { mountSnowOverlay } from './debug/snowOverlayDebug'
import { pixiColors } from './utils/pixiColors'

/**
 * 参考格子边长，仅用于从设计分辨率推导「列数、行数」；实际像素边长由当前窗口与列/行数决定。
 */
const DEBUG_GRID_CELL_SIZE = 16

/**
 * 10 个扫屏精灵：不同主题色 + 不同步进间隔（毫秒），均行优先遍历全部格子。
 * stepPauseMs 均在 [20, 80] 内错开。
 */
const DEBUG_SCREEN_SWEEP_WALKERS: ScreenSweepWalkerConfig[] = [
  { fillColor: pixiColors.game.player, stepPauseMs: 20 },
  { fillColor: pixiColors.game.enemy, stepPauseMs: 27 },
  { fillColor: pixiColors.game.ally, stepPauseMs: 33 },
  { fillColor: pixiColors.game.neutral, stepPauseMs: 40 },
  { fillColor: pixiColors.semantic.warning, stepPauseMs: 47 },
  { fillColor: pixiColors.semantic.violet, stepPauseMs: 53 },
  { fillColor: pixiColors.semantic.cyan, stepPauseMs: 60 },
  { fillColor: pixiColors.semantic.fuchsia, stepPauseMs: 67 },
  { fillColor: pixiColors.semantic.lime, stepPauseMs: 73 },
  { fillColor: pixiColors.semantic.orange, stepPauseMs: 80 }
]

type DebugMode = 'screen-sweep' | 'snow'

/** 无查询参数时默认扫屏模式；`?debugMode=snow` 为下雪叠加层。 */
function getDebugModeFromUrl(): DebugMode {
  const raw = new URLSearchParams(window.location.search).get('debugMode')
  if (raw === 'snow') {
    return 'snow'
  }
  return 'screen-sweep'
}

/**
 * 启动流程、letterbox 世界与调试叠加层。
 * 默认扫屏调试；`debugArch.html` 可跳转 `?debugMode=snow`。
 */
async function main(): Promise<void> {
  const debugMode = getDebugModeFromUrl()

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

  if (debugMode === 'screen-sweep') {
    mountAdaptiveDebugGrid({
      referenceCellSize: DEBUG_GRID_CELL_SIZE,
      designWidth: game.designWidth,
      designHeight: game.designHeight,
      getRendererSize,
      stage: game.stage,
      resizeObserveTarget: mount
    })

    mountScreenSweepWalkers({
      referenceCellSize: DEBUG_GRID_CELL_SIZE,
      designWidth: game.designWidth,
      designHeight: game.designHeight,
      getRendererSize,
      stage: game.stage,
      resizeObserveTarget: mount,
      ticker: game.ticker,
      walkers: DEBUG_SCREEN_SWEEP_WALKERS
    })
  } else {
    mountSnowOverlay({
      stage: game.stage,
      getRendererSize,
      ticker: game.ticker,
      resizeObserveTarget: mount
    })
  }
}

main().catch((err) => {
  console.error(err)
})
