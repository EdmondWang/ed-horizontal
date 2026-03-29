/**
 * 屏幕空间自适应网格：与 `mountAdaptiveDebugGrid` / 行走测试精灵共用同一套几何。
 * 物理坐标：Pixi stage / renderer 的 CSS 像素；与 letterbox 内 `world` 逻辑坐标相互独立。
 */

export interface GridLayout {
  cols: number
  rows: number
  /** 当前窗口下每格边长（屏幕像素）。 */
  cellSize: number
  /** 网格左上角在 stage 中的 x（屏幕像素）。 */
  offsetX: number
  offsetY: number
  gridW: number
  gridH: number
}

/**
 * 由设计分辨率与参考格长推导列、行数，再按当前画布尺寸算出居中、等比格宽。
 */
export function computeGridLayout(
  screenWidth: number,
  screenHeight: number,
  designWidth: number,
  designHeight: number,
  referenceCellSize: number
): GridLayout | null {
  if (screenWidth <= 0 || screenHeight <= 0 || referenceCellSize <= 0) {
    return null
  }

  const cols = Math.max(1, Math.floor(designWidth / referenceCellSize))
  const rows = Math.max(1, Math.floor(designHeight / referenceCellSize))
  const cellSize = Math.min(screenWidth / cols, screenHeight / rows)
  const gridW = cols * cellSize
  const gridH = rows * cellSize
  const offsetX = (screenWidth - gridW) / 2
  const offsetY = (screenHeight - gridH) / 2

  return { cols, rows, cellSize, offsetX, offsetY, gridW, gridH }
}

/** 行优先：先走完第 0 行，再第 1 行……索引 0 对应左上角格。 */
export function cellIndexToRowMajor(
  layout: GridLayout,
  index: number
): { col: number; row: number } {
  const total = layout.cols * layout.rows
  const safe = ((index % total) + total) % total
  return {
    col: safe % layout.cols,
    row: Math.floor(safe / layout.cols)
  }
}
