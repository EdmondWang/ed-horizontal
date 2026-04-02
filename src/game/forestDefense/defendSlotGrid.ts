import { Container, Graphics, Rectangle } from 'pixi.js'
import { drawDashedRectOutline } from '../../utils/pixiDashedRect'
import {
  COLS_PER_LANE,
  LANE_COUNT,
  SLOT_DASH_GAP,
  SLOT_DASH_INSET,
  SLOT_DASH_LEN
} from './config'

export interface DefendSlotGrid {
  slotRoots: Container[]
  cellW: number
  laneHeight: number
}

/**
 * 在 `defendLineCol` 内创建 7×3 虚线槽位，点击回调由外部绑定。
 */
export function createDefendSlotGrid(
  defendLineCol: Container,
  defendW: number,
  designHeight: number,
  onSlotPointerDown: (lane: number, col: number) => void
): DefendSlotGrid {
  const laneHeight = designHeight / LANE_COUNT
  const cellW = defendW / COLS_PER_LANE
  const slotRoots: Container[] = []

  for (let lane = 0; lane < LANE_COUNT; lane++) {
    for (let col = 0; col < COLS_PER_LANE; col++) {
      const slot = new Container()
      slot.x = col * cellW
      slot.y = lane * laneHeight
      slot.label = `defendSlot-${lane}-${col}`
      slot.hitArea = new Rectangle(0, 0, cellW, laneHeight)
      slot.eventMode = 'static'
      slot.cursor = 'pointer'
      slot.on('pointerdown', () => onSlotPointerDown(lane, col))
      const hint = new Graphics()
      hint.eventMode = 'none'
      const hw = cellW - SLOT_DASH_INSET * 2
      const hh = laneHeight - SLOT_DASH_INSET * 2
      drawDashedRectOutline(
        hint,
        SLOT_DASH_INSET,
        SLOT_DASH_INSET,
        hw,
        hh,
        SLOT_DASH_LEN,
        SLOT_DASH_GAP
      )
      hint.stroke({
        width: 2,
        color: 0xe2e8f0,
        alpha: 0.98,
        cap: 'round',
        join: 'round'
      })
      slot.addChild(hint)
      defendLineCol.addChild(slot)
      slotRoots.push(slot)
    }
  }

  return { slotRoots, cellW, laneHeight }
}
