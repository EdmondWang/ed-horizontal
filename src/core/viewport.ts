import { Container, Point } from 'pixi.js'

/**
 * 将浏览器指针位置（客户端坐标）映射到 `world` 所表示的
 * 逻辑游戏平面（letterbox 后的设计空间）。
 */
export function clientToWorld(
  clientX: number,
  clientY: number,
  canvas: HTMLCanvasElement,
  world: Container
): Point {
  const rect = canvas.getBoundingClientRect()
  const sx = (clientX - rect.left) * (canvas.width / rect.width)
  const sy = (clientY - rect.top) * (canvas.height / rect.height)
  return world.toLocal(new Point(sx, sy))
}

/**
 * 按设计分辨率与当前屏幕尺寸对 `world` 做等比缩放并居中（contain / letterbox）。
 */
export function applyLetterbox(
  world: Container,
  designWidth: number,
  designHeight: number,
  screenWidth: number,
  screenHeight: number
): void {
  const scale = Math.min(screenWidth / designWidth, screenHeight / designHeight)
  world.scale.set(scale)

  const scaledW = designWidth * scale
  const scaledH = designHeight * scale
  let x = (screenWidth - scaledW) * 0.5
  let y = (screenHeight - scaledH) * 0.5

  // 抵消浮点误差，避免整块画面超出 renderer 一像素而被裁切（底部/侧边看起来像「少一行」）
  x = Math.max(0, Math.min(x, screenWidth - scaledW))
  y = Math.max(0, Math.min(y, screenHeight - scaledH))

  world.position.set(x, y)
}
