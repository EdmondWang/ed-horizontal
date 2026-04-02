import { DAMAGE_K, DAMAGE_MIN } from './config'

/**
 * 单次结算伤害：`max(D_min, floor(攻击 × K / (K + 护甲)))`（见 `gameDesign.md`）。
 */
export function computeDamageAgainstArmor(attack: number, targetArmor: number): number {
  if (attack <= 0) {
    return 0
  }
  const raw = (attack * DAMAGE_K) / (DAMAGE_K + Math.max(0, targetArmor))
  return Math.max(DAMAGE_MIN, Math.floor(raw))
}
