import {
  COLS_PER_LANE,
  ORC_MELEE_ATTACK,
  ORC_MELEE_INTERVAL_MS,
  ORC_MELEE_RANGE_ENEMY_X,
  slotIndex
} from './config'
import { computeDamageAgainstArmor } from './damage'
import type { OrcRun, PlacedUnit } from './types'

export function tickOrcMeleeOnDefenders(
  orcs: readonly OrcRun[],
  dMs: number,
  placedUnits: (PlacedUnit | null)[],
  removePlacedUnitAt: (idx: number) => void,
  drawPlacedUnitHp: (u: PlacedUnit) => void
): void {
  for (const run of orcs) {
    if (run.enemyKind !== 'melee') {
      continue
    }
    if (run.root.x > ORC_MELEE_RANGE_ENEMY_X) {
      continue
    }
    run.meleeAcc += dMs
    if (run.meleeAcc < ORC_MELEE_INTERVAL_MS) {
      continue
    }
    run.meleeAcc = 0
    const lane = run.lane
    for (let col = 0; col < COLS_PER_LANE; col++) {
      const idx = slotIndex(lane, col)
      const u = placedUnits[idx]
      if (u === null) {
        continue
      }
      const dmg = computeDamageAgainstArmor(ORC_MELEE_ATTACK, u.armor)
      u.hp -= dmg
      if (u.hp <= 0) {
        removePlacedUnitAt(idx)
      } else {
        drawPlacedUnitHp(u)
      }
      break
    }
  }
}
