# 颜色变量使用指南

## CSS 变量

### 基础颜色
```css
/* 主色调 */
--color-primary: #667eea;
--color-primary-dark: #5568d3;
--color-primary-light: #7b8ef0;

/* 次要色 */
--color-secondary: #764ba2;
--color-secondary-dark: #5f3a85;
--color-secondary-light: #8c5bb8;

/* 强调色 */
--color-accent: #f093fb;
--color-accent-dark: #d67ae0;
--color-accent-light: #f4a8fc;
```

### 背景颜色
```css
--color-bg-primary: #1a1a2e;
--color-bg-secondary: #16213e;
--color-bg-tertiary: #0f3460;
--color-bg-elevated: #1f293a;
```

### 文字颜色
```css
--color-text-primary: #ffffff;
--color-text-secondary: #e2e8f0;
--color-text-tertiary: #94a3b8;
--color-text-muted: #64748b;
```

### 状态颜色
```css
--color-success: #10b981;
--color-warning: #f59e0b;
--color-error: #ef4444;
--color-info: #3b82f6;
```

### 游戏相关颜色
```css
--color-game-player: #22c55e;
--color-game-enemy: #ef4444;
--color-game-ally: #3b82f6;
--color-game-neutral: #94a3b8;
```

### 渐变色
```css
--gradient-primary: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
--gradient-secondary: linear-gradient(135deg, var(--color-secondary) 0%, var(--color-accent) 100%);
--gradient-success: linear-gradient(135deg, var(--color-success) 0%, var(--color-success-light) 100%);
```

### 阴影
```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

### 圆角
```css
--radius-sm: 0.25rem;
--radius-md: 0.5rem;
--radius-lg: 0.75rem;
--radius-xl: 1rem;
--radius-full: 9999px;
```

### 过渡
```css
--transition-fast: 150ms ease-in-out;
--transition-base: 200ms ease-in-out;
--transition-slow: 300ms ease-in-out;
```

### 间距
```css
--spacing-xs: 0.25rem;
--spacing-sm: 0.5rem;
--spacing-md: 1rem;
--spacing-lg: 1.5rem;
--spacing-xl: 2rem;
--spacing-2xl: 3rem;
```

## TypeScript 颜色常量

### 在 Pixi.js 中使用
```typescript
import { Colors } from '@/utils/Colors'

// 创建一个绿色玩家实体
const player = new SpriteEntity({
  color: Colors.game.player
})

// 创建一个红色敌人实体
const enemy = new SpriteEntity({
  color: Colors.game.enemy
})

// 使用主色调
const button = new Graphics()
button.rect(0, 0, 100, 40)
button.fill({ color: Colors.primary.main })
```

### 颜色转换工具
```typescript
import { hexToNumber, numberToHex } from '@/utils/Colors'

// CSS 颜色转 Pixi.js 颜色
const pixiColor = hexToNumber('#667eea') // 0x667eea

// Pixi.js 颜色转 CSS 颜色
const cssColor = numberToHex(0x667eea) // '#667eea'
```

## 主题切换

### HTML 中设置主题
```html
<!-- 深色主题（默认） -->
<html lang="zh-CN" data-theme="dark">

<!-- 浅色主题 -->
<html lang="zh-CN" data-theme="light">
```

### JavaScript 中切换主题
```typescript
function setTheme(theme: 'dark' | 'light') {
  document.documentElement.setAttribute('data-theme', theme)
}

// 切换到浅色主题
setTheme('light')

// 切换到深色主题
setTheme('dark')
```

## 使用示例

### CSS 示例
```css
.button {
  background: var(--gradient-primary);
  color: var(--color-text-primary);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);
}

.button:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.card {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-ui-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
}

.health-bar {
  background: var(--color-game-health);
  border-radius: var(--radius-full);
  height: 8px;
}
```

### TypeScript 示例
```typescript
import { Colors, getThemeColor } from '@/utils/Colors'

// 创建不同类型的实体
class Player extends SpriteEntity {
  constructor() {
    super({
      color: Colors.game.player,
      width: 64,
      height: 64
    })
  }
}

class Enemy extends SpriteEntity {
  constructor() {
    super({
      color: Colors.game.enemy,
      width: 64,
      height: 64
    })
  }
}

// 根据主题设置颜色
function applyTheme(theme: 'dark' | 'light') {
  const colors = getThemeColor(theme)
  game.setBackgroundColor(colors.background)
}
```

## 设计原则

1. **一致性**：始终使用预定义的颜色变量，不要硬编码颜色值
2. **语义化**：使用有意义的颜色名称（如 `--color-game-player` 而不是 `--color-green`）
3. **可维护性**：所有颜色都在一个地方定义，便于统一修改
4. **主题支持**：支持深色和浅色主题切换
5. **可扩展性**：可以轻松添加新的颜色变量

## 注意事项

- CSS 变量用于 UI 元素和 HTML 元素
- TypeScript 常量用于 Pixi.js 游戏元素
- 两种颜色系统保持一致，使用相同的色值
- 新增颜色时，请同时在 CSS 和 TypeScript 中添加对应的定义
