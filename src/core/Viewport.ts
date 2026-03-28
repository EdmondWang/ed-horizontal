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
  world.position.set(
    (screenWidth - designWidth * scale) / 2,
    (screenHeight - designHeight * scale) / 2
  )
}
