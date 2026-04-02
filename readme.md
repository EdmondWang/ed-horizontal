# ed-horizontal

二维横屏游戏基础框架（长期目标：植物大战僵尸类游戏）。当前为 **可扩展雏形**：固定逻辑分辨率、letterbox 适配、Pixi 主循环与视口坐标工具。

## 技术栈

| 层级 | 选型 | 说明 |
|------|------|------|
| 渲染 | **Pixi.js v8** | WebGL/Canvas，适合大量 2D 精灵与 UI |
| 语言 | **TypeScript**（严格模式） | 类型与重构友好 |
| 构建 | **Vite** | 开发与生产构建 |

全局 UI 状态（如菜单、设置）若将来用 React，可再引入 **Zustand**；游戏内状态优先放在 `Game` 与后续系统层，避免双源。

## 项目结构

```
src/
├── core/            # 引擎壳：与「玩哪一关、什么单位」无关，可复用于其他横屏项目
│   ├── game.ts      # Application、letterbox 根节点 `world`、ticker 回调、resize 清理
│   └── viewport.ts  # applyLetterbox、clientToWorld（屏幕 → 逻辑坐标）
├── game/            # 具体玩法 / 关卡原型（依赖 `core` + `mainLayout`，可整体替换或并行加新模式）
│   ├── forestDefense/  # 示例：林缘防线原型（配置、挂载逻辑）
│   └── minimalPrototype.ts  # 稳定入口 re-export，便于 `main` 引用路径不变
├── utils/
│   ├── pixiColors.ts    # 与 colors.css 对齐的 Pixi 十六进制色值
│   ├── pixiDashedRect.ts # 虚线矩形/线段（画布装饰）
│   └── bezier2.ts       # 二次贝塞尔点（弹道等）
├── styles/
│   └── colors.css   # 页面/UI 用 CSS 变量
└── main.ts          # 入口：创建 Game、挂载布局与玩法
```

**为何分 `core` 与 `game`**：`core` 只负责「画布、逻辑分辨率、缩放、时钟」；`game` 负责「规则、实体、UI 文案」。这样换关卡、加第二个 demo 时不必复制引擎代码，也符合「单一逻辑坐标系在 `Game`，玩法在 `world` 子树」的约定。

## 设计约定（实现新功能前请先读）

- **逻辑分辨率**：在 `Game` 构造参数中设定 `designWidth` / `designHeight`（如 1280×720）。所有游戏内坐标、布局在此空间内计算。
- **屏幕适配**：由 `Viewport.applyLetterbox` 与 `Game` 内 `resize` 处理；**不要**在项目其他地方重复写一套缩放/居中公式。
- **指针坐标**：使用 `clientToWorld(clientX, clientY, canvas, game.world)` 得到逻辑坐标，再去做格子命中等逻辑。
- **颜色**：页面用 `colors.css`；画布内用 `pixiColors` 或局部字面量，并与 CSS 语义保持一致（见 `colors.md`）。
- **演进方式**：在现有 `Game` / `Viewport` / `pixiColors` 上**增量扩展**，避免平行实现第二套引擎层。
- **代码风格**：`src` 内注释使用中文；遵守 ESLint（优先于 Prettier）；优先 named export / named import。详见 `agents.md`。

## 开发命令

```bash
npm install
npm run dev
npm run build
npm run preview
npm run lint
npm run format
```

## 文档

- `colors.md` — CSS 变量与 Pixi 颜色对照、主题说明。
- `agents.md` — 给协作者与 AI 助手的项目约定摘要。

## 后续迭代（按需）

1. 输入层（指针/键盘 + `clientToWorld`）
2. 实体 / 系统或轻量 update 列表
3. 资源加载与图集
4. 音频、存档、国际化
