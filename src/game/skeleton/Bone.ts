import { Container } from 'pixi.js'

/**
 * 2D 骨骼节点：继承 `Container`，用父子层级表达变换链（位移/旋转/缩放由 Pixi 世界矩阵合成）。
 * 子显示对象挂在骨骼下即可随骨骼运动。
 */
export class Bone extends Container {
  /** 骨骼名（调试、按名查找）。 */
  readonly boneName: string

  constructor(name: string) {
    super()
    this.boneName = name
    this.label = `bone:${name}`
  }
}
