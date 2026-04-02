import type { OrcRun } from './types'

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
    if (run.lane !== lane) {
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
