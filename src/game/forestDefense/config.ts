/** 横向防线道数。 */
export const LANE_COUNT = 7

/** 每道防线内的纵向列数（防线区为 LANE_COUNT × COLS_PER_LANE 槽位矩阵）。 */
export const COLS_PER_LANE = 3

/** 槽位总数（7×3）。 */
export const SLOT_COUNT = LANE_COUNT * COLS_PER_LANE

/** 初始可部署「芽弓」次数。 */
export const POOL_START = 42

/** 本关需消灭的兽人数量（胜利条件）。 */
export const ORCS_TO_WIN = 48

/** 兽人生命。 */
export const ORC_HP = 3

/** 兽人生成间隔（毫秒）。 */
export const SPAWN_INTERVAL_MS = 1000

/** 每次生成兽人数量（提高场上同时存在的兽人）。 */
export const ORCS_PER_SPAWN = 2

/** 芽弓射击间隔（毫秒）。 */
export const FIRE_INTERVAL_MS = 700

/** 弹体飞行时间（毫秒）。 */
export const BULLET_FLIGHT_MS = 240

/** 弹道弧高（控制点相对弦中点的上移量，逻辑像素）。 */
export const BULLET_ARC_LIFT = 26

/** 兽人水平速度（逻辑像素/秒）。 */
export const ORC_SPEED = 55

/** 击中扩散环持续时间（毫秒）。 */
export const HIT_RING_MS = 200

/** 兽人受击闪白持续时间（毫秒）。 */
export const HIT_FLASH_MS = 100

/** 兽人冲过敌线左缘的判定 X（敌线列局部坐标，近似）。 */
export const ORC_LOSE_LINE_X = 28

/** 槽位虚线框：内缩、虚线段长、间隙（与 `drawDashedRectOutline` 一致）。 */
export const SLOT_DASH_INSET = 3
export const SLOT_DASH_LEN = 10
export const SLOT_DASH_GAP = 6

export function slotIndex(lane: number, col: number): number {
  return lane * COLS_PER_LANE + col
}

export function laneFromSlotIndex(i: number): number {
  return Math.floor(i / COLS_PER_LANE)
}

export function colFromSlotIndex(i: number): number {
  return i % COLS_PER_LANE
}
