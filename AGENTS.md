# 协作者与 AI 助手约定

本文档用于快速对齐本仓库的**架构意图与修改习惯**。更完整的说明见 `README.md`；颜色体系见 `COLORS.md`。

## 项目目标

二维横屏游戏基础框架；长期可演进为植物大战僵尸类游戏。当前代码是**可运行的最小骨架**，不是完整玩法。

## 实现前请先做

1. 阅读 `README.md` 中的「设计约定」与项目结构。
2. 涉及全屏适配、缩放、指针坐标时，阅读并复用 `src/core/Game.ts`、`src/core/Viewport.ts`，**不要**复制 letterbox 或 `clientToWorld` 的平行实现。
3. 涉及颜色时，对照 `src/styles/colors.css` 与 `src/utils/pixiColors.ts`。

## 修改原则

- **优先扩展已有模块**：在 `Game` 上增加生命周期钩子、在 `Viewport` 上增加与坐标相关的纯函数、在 `main.ts` 中串联——优于新建第二套「引擎」类。
- **保持逻辑坐标单一**：游戏内运算使用 `designWidth` × `designHeight` 空间；仅在与 DOM/指针交互时使用 `clientToWorld`。
- **保持增量**：新系统（输入、实体、资源）可单独加文件，但入口与适配层应与现有 `Game` 一致。
- **类型与 Lint**：TypeScript 严格模式；提交前 `npm run lint` 通过。

## 代码风格

- **注释**：`src` 内注释一律使用**中文**（见 `.cursor/rules/ed-horizontal.mdc`）。
- **ESLint 优先于 Prettier**：以 `.eslintrc.cjs` 为准；若两者冲突，调整 `.prettierrc` 以符合 ESLint，而不是反过来关闭 ESLint 规则来迁就 Prettier。
- **模块**：优先 **named export** 与 **named import**（见 ESLint `import/no-default-export`；配置文件等在 `overrides` 中允许 default）。

## 与 Cursor 规则的关系

仓库内 `.cursor/rules/ed-horizontal.mdc` 会提示上述习惯；详细条目仍以本文件与 `README.md` 为准。
