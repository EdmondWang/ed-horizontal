# 二维横版PVE对战游戏

基于 Pixi.js + TypeScript + Vite 的通用游戏引擎框架

## 技术栈

- **Pixi.js v8** - 高性能2D WebGL渲染引擎
- **TypeScript** - 类型安全的开发语言
- **Vite** - 现代化构建工具
- **Zustand** - 轻量级状态管理

## 项目结构

```
src/
├── core/           # 核心游戏引擎
│   └── Game.ts     # 游戏主类
├── entities/       # 游戏实体
│   ├── Entity.ts   # 实体基类
│   └── SpriteEntity.ts  # 精灵实体
├── systems/        # 游戏系统
│   ├── System.ts   # 系统基类
│   ├── RenderSystem.ts  # 渲染系统
│   └── InputSystem.ts   # 输入系统
├── stores/         # 状态管理
│   └── gameStore.ts
├── utils/          # 工具类
│   ├── Vector2.ts
│   └── Rectangle.ts
└── main.ts         # 入口文件
```

## 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview

# 代码检查
npm run lint

# 代码格式化
npm run format
```

## 核心功能

### 游戏引擎 (Game)
- 游戏循环管理
- 系统注册与管理
- 响应式窗口适配

### 实体系统 (Entity)
- 基础实体类
- 生命周期管理
- 激活/停用控制

### 系统架构 (System)
- 渲染系统
- 输入系统
- 可扩展的系统框架

### 工具类
- Vector2 - 向量运算
- Rectangle - 矩形碰撞检测

## 开发说明

- 所有代码注释使用中文
- 遵循 TypeScript 严格模式
- 使用 ESLint 进行代码检查
- 使用 Prettier 进行代码格式化
