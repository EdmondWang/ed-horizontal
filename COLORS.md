# 颜色与主题

设计令牌以 **`src/styles/colors.css`** 为唯一事实来源（CSS 变量）。画布内 Pixi 使用 **`src/utils/pixiColors.ts`** 中与语义对应的 `0xRRGGBB` 常量，避免魔法数散落。

## CSS 变量（页面与 HTML UI）

以下为 `colors.css` 中主要分组；完整列表以仓库内文件为准。

### 品牌与强调

- `--color-primary` / `--color-primary-dark` / `--color-primary-light`
- `--color-secondary` / `--color-secondary-dark` / `--color-secondary-light`
- `--color-accent` / `--color-accent-dark` / `--color-accent-light`

### 背景与文字

- `--color-bg-primary`、`--color-bg-secondary`、`--color-bg-tertiary`、`--color-bg-elevated`
- `--color-text-primary`、`--color-text-secondary`、`--color-text-tertiary`、`--color-text-muted`

### 状态

- `--color-success` / `--color-warning` / `--color-error` / `--color-info`（各含 dark / light 变体）

### 游戏语义（与 Pixi 侧对应）

| CSS | 用途 |
|-----|------|
| `--color-game-player` | 己方 / 植物等 |
| `--color-game-enemy` | 敌方 / 僵尸等 |
| `--color-game-ally` | 友方 |
| `--color-game-neutral` | 中立 |
| `--color-game-health` / `--color-game-energy` / `--color-game-shield` | 条、资源条（按需） |

### 其他常用

- 渐变：`--gradient-primary` 等
- 阴影：`--shadow-sm` … `--shadow-xl`
- 圆角：`--radius-sm` … `--radius-full`
- 过渡：`--transition-fast` / `--transition-base` / `--transition-slow`
- 间距：`--spacing-xs` … `--spacing-2xl`
- 字体与字号：`--font-family-base`、`--font-size-*` 等
- Z-index：`--z-index-dropdown` … `--z-index-tooltip`

## 主题

根节点使用 `data-theme`：

```html
<html lang="zh-CN" data-theme="dark">
```

`[data-theme='dark']` 与 `[data-theme='light']` 在 `colors.css` 中覆盖背景与文字。切换主题时同步更新 `document.documentElement.setAttribute('data-theme', 'light' | 'dark')`。

**注意**：全屏游戏画布背景色在 `Game` 构造参数 `backgroundColor` 中设置（当前与 `pixiColors.bgPrimary` 对齐）。若希望画布与某主题下的 `--color-bg-primary` 完全一致，请在切换主题时同时更新 `Game` 的背景或抽一层「主题 → Pixi 颜色」映射。

## Pixi（画布内）

### 推荐：使用 `pixiColors`

```typescript
import { pixiColors } from '@/utils/pixiColors'

graphics.fill({ color: pixiColors.game.player })
graphics.stroke({ width: 2, color: pixiColors.strokeMuted })
```

### 临时字面量

可直接写 `0xRRGGBB`，但合并进 `pixiColors` 或注明与哪个 CSS 变量对齐，便于后续换肤。

### 从 CSS 字符串转 Pixi（按需）

若将来需要从 `getComputedStyle` 读取 CSS 颜色，可在工具函数中解析为 `0xRRGGBB` 再传给 Pixi；**不要**在热路径上每帧解析 DOM。

## 设计原则

1. **一致性**：优先变量与 `pixiColors`，少写裸十六进制。
2. **语义化**：使用 `game.player` / `--color-game-player` 这类语义，而不是「绿色」「红色」。
3. **单源**：改色时先改 `colors.css`，再同步 `pixiColors`（或后续抽自动生成）。
4. **主题**：页面随 `data-theme`；画布侧在引入完整换肤前保持与默认深色协调即可。
