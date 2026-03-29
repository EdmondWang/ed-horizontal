/**
 * Pixi 使用的 0xRRGGBB 颜色，与 `src/styles/colors.css` 中的语义变量对齐。
 * 画布/UI 换色时优先改 CSS，再同步此处或抽一层生成逻辑。
 */
export const pixiColors = {
  bgPrimary: 0x1a1a2e,
  strokeMuted: 0x3d3d5c,
  game: {
    player: 0x22c55e,
    enemy: 0xef4444,
    ally: 0x3b82f6,
    neutral: 0x94a3b8
  },
  /** 与 `colors.css` 中状态/强调色一致或同系，供画布内非「游戏阵营」语义使用。 */
  semantic: {
    /** 与 `--color-warning` 一致 */
    warning: 0xf59e0b,
    violet: 0xa855f7,
    cyan: 0x06b6d4,
    fuchsia: 0xec4899,
    lime: 0x84cc16,
    orange: 0xf97316
  }
} as const
