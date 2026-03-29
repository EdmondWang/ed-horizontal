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
  { fillColor: 0xf59e0b, stepPauseMs: 47 },
  { fillColor: 0xa855f7, stepPauseMs: 53 },
  { fillColor: 0x06b6d4, stepPauseMs: 60 },
  { fillColor: 0xec4899, stepPauseMs: 67 },
  { fillColor: 0x84cc16, stepPauseMs: 73 },
  { fillColor: 0xf97316, stepPauseMs: 80 }
]

type DebugMode = 'screen-sweep' | 'snow'

function getDebugModeFromUrl(): DebugMode | null {
  const raw = new URLSearchParams(window.location.search).get('debugMode')
  if (raw === 'screen-sweep' || raw === 'snow') {
    return raw
  }
  return null
}

/**
 * 第一阶段：启动流程、letterbox 世界与可选的开发用边框。
 * 调试叠加层需带 `?debugMode=screen-sweep` 或 `?debugMode=snow`，由 debugArch.html 进入。
 */
async function main(): Promise<void> {
  const debugMode = getDebugModeFromUrl()

  if (debugMode === null) {
    document.body.insertAdjacentHTML(
      'beforeend',
      `<div id="boot-hint" style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center;font-family:var(--font-family-base);color:var(--color-text-secondary);background:var(--color-bg-primary);line-height:1.6;z-index:1;">
        <div style="max-width:420px;">
          <p>请从<strong>调试架构入口</strong>选择模式。</p>
          <p style="margin-top:12px;font-size:0.9em;">打开 <code style="word-break:break-all;">debugArch.html</code>（需 localStorage 门禁）。</p>
        </div>
      </div>`
    )
    return
  }

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
