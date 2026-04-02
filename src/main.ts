import { Game } from './core/game'
import { mountMinimalForestDefensePrototype } from './game/minimalPrototype'
import { mountMainTwoColumnLayout } from './mainLayout'
import type { DevOverlayMode } from './types/devOverlay'
import { mountAdaptiveDebugGrid } from './debugArch/adaptiveDebugGrid'
import { mountScreenSweepWalkers } from './debugArch/screenSweepDebug'
import type { ScreenSweepWalkerConfig } from './debugArch/screenSweepDebug'
import { mountSnowOverlay } from './debugArch/snowOverlayDebug'
import { pixiColors } from './utils/pixiColors'

/**
 * 参考格子边长，仅用于从设计分辨率推导「列数、行数」；实际像素边长由当前窗口与列/行数决定。
 */
const DEV_OVERLAY_GRID_CELL_SIZE = 16

/**
 * 10 个扫屏精灵：不同主题色 + 不同步进间隔（毫秒），均行优先遍历全部格子。
 * stepPauseMs 均在 [20, 80] 内错开。
 */
const DEV_OVERLAY_SCREEN_SWEEP_WALKERS: ScreenSweepWalkerConfig[] = [
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

/**
 * 从 URL 读取 `devOverlay`：无参数则不挂载任何开发叠加层。
 * `screen-sweep` / `snow` 用于在主游戏画布上验证网格、性能等。
 */
function getDevOverlayModeFromUrl(): DevOverlayMode | null {
  const raw = new URLSearchParams(window.location.search).get('devOverlay')
  if (raw === 'screen-sweep') {
    return 'screen-sweep'
  }
  if (raw === 'snow') {
    return 'snow'
  }
  return null
}

/**
 * 启动流程与 letterbox 世界；`world` 内挂载主界面布局（entityPoolCol / battleAreaCol 及内嵌 defendLineCol、enemyLineCol）。
 * 开发用叠加层仅在有 `?devOverlay=…` 时挂载（如自 `debugArch.html` 跳转）。
 */
async function main(): Promise<void> {
  const devOverlayMode = getDevOverlayModeFromUrl()

  const game = new Game({
    designWidth: 1280,
    designHeight: 720,
    backgroundColor: pixiColors.bgPrimary
  })

  await game.init()

  const layout = mountMainTwoColumnLayout({
    world: game.world,
    designWidth: game.designWidth,
    designHeight: game.designHeight
  })

  if (layout) {
    mountMinimalForestDefensePrototype({ game, layout })
  }

  const mount = document.getElementById('game-container')
  const getRendererSize = (): { width: number; height: number } => ({
    width: game.renderer.width,
    height: game.renderer.height
  })

  if (devOverlayMode === 'screen-sweep') {
    mountAdaptiveDebugGrid({
      referenceCellSize: DEV_OVERLAY_GRID_CELL_SIZE,
      designWidth: game.designWidth,
      designHeight: game.designHeight,
      getRendererSize,
      stage: game.stage,
      resizeObserveTarget: mount
    })

    mountScreenSweepWalkers({
      referenceCellSize: DEV_OVERLAY_GRID_CELL_SIZE,
      designWidth: game.designWidth,
      designHeight: game.designHeight,
      getRendererSize,
      stage: game.stage,
      resizeObserveTarget: mount,
      ticker: game.ticker,
      walkers: DEV_OVERLAY_SCREEN_SWEEP_WALKERS
    })
  } else if (devOverlayMode === 'snow') {
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
