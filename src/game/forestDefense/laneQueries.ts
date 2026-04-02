import type { OrcRun } from './types'

/** 该兽人是否占据指定车道（小型占一道，巨兽可占相邻两道）。 */
export function orcOccupiesLane(run: OrcRun, lane: number): boolean {
  return lane >= run.lane && lane < run.lane + run.laneSpan
}

/**
 * 兽人受击/弹道落点在战场列中的 Y（逻辑坐标，与 `laneCenterY` 同空间）。
 * 跨两道时取两道中心连线的中点。
 */
export function orcAnchorWorldY(run: OrcRun, laneHeight: number): number {
  if (run.laneSpan === 2) {
    return (run.lane + 1) * laneHeight
  }
  return (run.lane + 0.5) * laneHeight
}

/**
 * 本车道上战场 X 最靠前（最靠左、最接敌）的兽人，供芽弓锁定。
 * `ex = defendW + run.root.x`（敌线局部坐标换算到战场列）。
 */
export function findFrontmostOrcInLane(
  orcs: readonly OrcRun[],
  lane: number,
  defendW: number
): OrcRun | null {
  let best: OrcRun | null = null
  let bestEnemyX = Number.POSITIVE_INFINITY
  for (const run of orcs) {
    if (!orcOccupiesLane(run, lane)) {
      continue
    }
    const ex = defendW + run.root.x
    if (ex < bestEnemyX) {
      bestEnemyX = ex
      best = run
    }
  }
  return best
}
