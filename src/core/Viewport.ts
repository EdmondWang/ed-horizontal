import { Container, Point } from 'pixi.js'

/**
 * Maps pointer position from the browser (client coordinates) into the
 * logical game plane defined by `world` (letterboxed design space).
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
