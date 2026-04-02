import type { Container, Graphics } from 'pixi.js'

/** 战场击中环（与 `hitRingVfx` 对应）。 */
export interface HitRingEntry {
  g: Graphics
  ttlMs: number
}

export type BlueprintKind = 'gatherer' | 'archer'

/** 兽人类型：近战劫掠兵 / 远程投石蛮卒。 */
export type EnemyKind = 'melee' | 'rockthrower'

export interface OrcRun {
  root: Container
  body: Graphics
  hpBar: Graphics
  hp: number
  maxHp: number
  armor: number
  lane: number
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
