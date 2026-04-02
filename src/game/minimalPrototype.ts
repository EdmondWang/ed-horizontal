/**
 * 林缘防线最小原型：实现见 `forestDefense/`。
 *
 * - **`core/`**：与具体关卡无关的引擎壳（`Game`、`Viewport`、letterbox）。
 * - **`game/`**：可替换的玩法与原型（本文件仅作稳定入口 re-export，避免 `main` 随内部结构调整）。
 */
export {
  mountMinimalForestDefensePrototype,
  type MountMinimalPrototypeOptions
} from './forestDefense/mountMinimalForestDefensePrototype'
