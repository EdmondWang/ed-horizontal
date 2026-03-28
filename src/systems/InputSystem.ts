import { System } from './System'

export interface InputState {
  keys: Set<string>
  mouse: {
    x: number
    y: number
    isDown: boolean
  }
}

export class InputSystem extends System {
  private inputState: InputState = {
    keys: new Set(),
    mouse: { x: 0, y: 0, isDown: false }
  }

  constructor() {
    super()
    this.setupEventListeners()
  }

  private setupEventListeners(): void {
    window.addEventListener('keydown', (e) => {
      this.inputState.keys.add(e.key)
    })

    window.addEventListener('keyup', (e) => {
      this.inputState.keys.delete(e.key)
    })

    window.addEventListener('mousemove', (e) => {
      this.inputState.mouse.x = e.clientX
      this.inputState.mouse.y = e.clientY
    })

    window.addEventListener('mousedown', () => {
      this.inputState.mouse.isDown = true
    })

    window.addEventListener('mouseup', () => {
      this.inputState.mouse.isDown = false
    })
  }

  update(_deltaTime: number): void {
  }

  isKeyPressed(key: string): boolean {
    return this.inputState.keys.has(key)
  }

  getMousePosition(): { x: number; y: number } {
    return { x: this.inputState.mouse.x, y: this.inputState.mouse.y }
  }

  isMouseDown(): boolean {
    return this.inputState.mouse.isDown
  }

  getState(): InputState {
    return {
      keys: new Set(this.inputState.keys),
      mouse: { ...this.inputState.mouse }
    }
  }
}
