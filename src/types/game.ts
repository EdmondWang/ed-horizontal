/** 每帧回调，参数为与上一帧的时间间隔（秒）。 */
export type GameFrameCallback = (deltaSeconds: number) => void

export interface GameConfig {
  /** 固定逻辑分辨率宽度（例如 1280）。 */
  designWidth: number
  /** 固定逻辑分辨率高度（例如 720）。 */
  designHeight: number
  backgroundColor?: number
  antialias?: boolean
  /** 默认使用 `window.devicePixelRatio`。 */
  resolution?: number
}
