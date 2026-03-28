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
  }
} as const
