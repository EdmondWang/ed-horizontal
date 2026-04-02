import type { Container, Graphics } from 'pixi.js'

/** 战场击中环（与 `hitRingVfx` 对应）。 */
export interface HitRingEntry {
  g: Graphics
  ttlMs: number
}

export type BlueprintKind = 'gatherer' | 'archer'

/** 兽人类型：小型近战 / 小型远程 / 中型跨道巨兽。 */
export type EnemyKind = 'melee' | 'rockthrower' | 'warbeast'

export interface OrcRun {
  root: Container
  body: Graphics
  hpBar: Graphics
  hp: number
  maxHp: number
  armor: number
  /** 占据的最小车道索引；`laneSpan === 2` 时同时占据 `lane` 与 `lane + 1`。 */
  lane: number
  /** 1：小型单位占一道；2：裂皮战争巨兽等中型单位跨两道。 */
  laneSpan: 1 | 2
  hitFlashMs: number
  meleeAcc: number
  enemyKind: EnemyKind
  /** 投石蛮卒：远程射击累计（毫秒）。 */
  rangedAcc: number
}

export interface PlacedUnit {
  kind: BlueprintKind
  root: Container
  body: Graphics
  hpBar: Graphics
  hp: number
  maxHp: number
  armor: number
  attack: number
}

export interface FlyingBullet {
  g: Graphics
  elapsedMs: number
  sx: number
  sy: number
  target: OrcRun
  attack: number
}

/** 投石蛮卒投石（战场坐标，自右向左飞向槽位）。 */
export interface EnemyRockProjectile {
  g: Graphics
  elapsedMs: number
  sx: number
  sy: number
  tx: number
  ty: number
  /** 命中槽位索引 `slotIndex(lane,col)`。 */
  targetSlotIdx: number
  attack: number
}
