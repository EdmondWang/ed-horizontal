import type { ArcherRig } from './archerRig'
import type { Container, Graphics, Sprite } from 'pixi.js'

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
  /** 有贴图时为 `Sprite`，否则为 `Graphics` 剪影。 */
  body: Graphics | Sprite
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
  /**
   * 显示主体：`Graphics` / `Sprite`，或芽弓骨架时的 `Container`（内挂 `ArcherRig` 根骨骼）。
   * 对 `Container` / `Sprite` 可设 `tint`。
   */
  body: Graphics | Sprite | Container
  hpBar: Graphics
  hp: number
  maxHp: number
  armor: number
  attack: number
  /** 仅芽弓且使用贴图骨架时存在。 */
  archerRig?: ArcherRig
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
