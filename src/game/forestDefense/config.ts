/** 横向防线道数。 */
export const LANE_COUNT = 7

/** 每道防线内的纵向列数（防线区为 LANE_COUNT × COLS_PER_LANE 槽位矩阵）。 */
export const COLS_PER_LANE = 3

/** 槽位总数（7×3）。 */
export const SLOT_COUNT = LANE_COUNT * COLS_PER_LANE

/** 开局林息（统一资源）。 */
export const STARTING_RESOURCE = 3000

/** 本关需消灭的兽人数量（胜利条件）。 */
export const ORCS_TO_WIN = 48

/** 兽人最大生命。 */
export const ORC_MAX_HP = 60

/** 兽人护甲（承受芽弓等远程伤害）。 */
export const ORC_ARMOR = 8

/** 兽人近战攻击强度（打己方单位时参与伤害公式）。 */
export const ORC_MELEE_ATTACK = 8

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

/** 兽人敌线局部 X 小于此值时视为进入接战区，可攻击该车道防线单位。 */
export const ORC_MELEE_RANGE_ENEMY_X = 88

/** 兽人对防线单位近战结算间隔（毫秒，每只兽人独立）。 */
export const ORC_MELEE_INTERVAL_MS = 700

/**
 * 生成兽人时抽到「灰斧劫掠兵」的概率（0～1）。
 * 其余为「投石蛮卒」：`1 - SPAWN_WEIGHT_GREY_AXE`。
 */
export const SPAWN_WEIGHT_GREY_AXE = 0.4

/** 投石蛮卒远程攻击强度（打己方单位参与伤害公式）。 */
export const ROCK_THROWER_ATTACK = 14

/** 投石蛮卒射击间隔（毫秒）。 */
export const ROCK_THROWER_FIRE_INTERVAL_MS = 1100

/** 投石飞行时间（毫秒，右→左直线）。 */
export const ENEMY_ROCK_FLIGHT_MS = 320

/** 护甲减伤刻度 K（`gameDesign.md`）。 */
export const DAMAGE_K = 100

/** 最小伤害 D_min。 */
export const DAMAGE_MIN = 1

/** 苔泉采集芽（资源单位）— 与 `gameDesign.md` 占位表一致。 */
export const UNIT_GATHERER = {
  name: '苔泉采集芽',
  cost: 50,
  maxHp: 80,
  armor: 0,
  attack: 0,
  gatherIntervalMs: 2000,
  gatherAmount: 10
} as const

/** 芽弓巡林者 — 与 `gameDesign.md` 占位表一致。 */
export const UNIT_ARCHER = {
  name: '芽弓巡林者',
  cost: 80,
  maxHp: 120,
  armor: 5,
  attack: 22
} as const

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
