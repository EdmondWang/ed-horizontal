/** 身体区与槽底虚线框之间的留白（与 `placedUnitVisual` 一致）。 */
export const SLOT_BODY_BOTTOM_PAD = 4
/** 贴图槽位水平内缩（左右各一）。 */
export const SLOT_TEXTURE_H_INSET = 2

/** 槽内贴图 cover 用的最大宽高（逻辑像素）。 */
export function slotTextureCoverBounds(
  cellW: number,
  laneHeight: number
): { maxW: number; maxH: number } {
  const maxW = Math.max(8, cellW - SLOT_TEXTURE_H_INSET * 2)
  const maxH = Math.max(8, laneHeight - SLOT_BODY_BOTTOM_PAD)
  return { maxW, maxH }
}

/** 贴图脚底对齐点（槽局部坐标，底中）。 */
export function slotSpriteBottomCenter(
  cellW: number,
  laneHeight: number
): { x: number; y: number } {
  return { x: cellW * 0.5, y: laneHeight - SLOT_BODY_BOTTOM_PAD }
}
