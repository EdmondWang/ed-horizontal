import { Sprite } from 'pixi.js'
import type { Bone } from '../skeleton/Bone'
import { Skeleton2D } from '../skeleton'
import {
  createTextureForPart,
  getArcherPartDefinitions,
  sortPartsForBuild
} from './archerPartsConfig'
import { slotSpriteBottomCenter, slotTextureCoverBounds } from './slotUnitLayout'

const ALERT_ROT = -0.07
const SHOOT_ROT = 0.18
const SHOOT_HOLD_MS = 200
const ALERT_HEAD_ROT = -0.04
const SHOOT_ARM_ROT = 0.55

/**
 * 芽弓巡林者：多部件切片 + `Skeleton2D`；躯干 / 头 / 拉弓臂可分别摆姿，便于后续加动作关键帧。
 */
export class ArcherRig {
  readonly skeleton: Skeleton2D
  readonly torso: Bone
  private readonly headBone: Bone | null
  private readonly armBowBone: Bone | null
  private readonly partSprites = new Map<string, Sprite>()
  private poseHoldMs = 0
  private alertDesired = false

  constructor(cellW: number, laneHeight: number) {
    const defs = sortPartsForBuild(getArcherPartDefinitions())
    this.skeleton = new Skeleton2D('root')

    for (const def of defs) {
      const bone = this.skeleton.addBone(def.id, def.parent)
      bone.sortableChildren = true
      bone.position.set(def.position.x, def.position.y)

      const tex = createTextureForPart(def)
      const sprite = new Sprite(tex)
      sprite.anchor.set(def.anchor.x, def.anchor.y)
      sprite.zIndex = def.zIndex ?? 0
      bone.addChild(sprite)
      this.partSprites.set(def.id, sprite)
    }

    const torsoBone = this.skeleton.getBone('torso')
    if (!torsoBone) {
      throw new Error('ArcherRig: 缺少躯干骨骼「torso」')
    }
    this.torso = torsoBone
    this.headBone = this.skeleton.getBone('head') ?? null
    this.armBowBone = this.skeleton.getBone('arm_bow') ?? null

    const { maxH } = slotTextureCoverBounds(cellW, laneHeight)
    const torsoSprite = this.partSprites.get('torso')
    const legsSprite = this.partSprites.get('legs')
    const headSprite = this.partSprites.get('head')
    if (!torsoSprite || !legsSprite || !headSprite) {
      throw new Error('ArcherRig: 缺少腿/躯干/头部部件')
    }
    // 与 `archerPartsConfig` 叠放链一致：脚底→腰→颈，总高 = 腿+躯干+头。
    // 若只按躯干高度缩放，整体会远高于槽位 `maxH`，遮罩下只剩脚底一条可见。
    const fullBodyH =
      legsSprite.texture.height +
      torsoSprite.texture.height +
      headSprite.texture.height
    const scale = maxH / Math.max(fullBodyH, 1)
    this.skeleton.root.scale.set(scale)

    const pos = slotSpriteBottomCenter(cellW, laneHeight)
    this.skeleton.root.position.set(pos.x, pos.y)
  }

  get displayRoot(): typeof this.skeleton.root {
    return this.skeleton.root
  }

  setAlert(active: boolean): void {
    this.alertDesired = active
    if (this.poseHoldMs > 0) {
      return
    }
    this.torso.rotation = active ? ALERT_ROT : 0
    if (this.headBone) {
      this.headBone.rotation = active ? ALERT_HEAD_ROT : 0
    }
  }

  triggerShoot(): void {
    this.poseHoldMs = SHOOT_HOLD_MS
    this.torso.rotation = SHOOT_ROT
    if (this.headBone) {
      this.headBone.rotation = 0
    }
    if (this.armBowBone) {
      this.armBowBone.rotation = SHOOT_ARM_ROT
    }
  }

  tick(dMs: number): void {
    if (this.poseHoldMs <= 0) {
      return
    }
    this.poseHoldMs -= dMs
    if (this.poseHoldMs <= 0) {
      this.poseHoldMs = 0
      this.torso.rotation = this.alertDesired ? ALERT_ROT : 0
      if (this.headBone) {
        this.headBone.rotation = this.alertDesired ? ALERT_HEAD_ROT : 0
      }
      if (this.armBowBone) {
        this.armBowBone.rotation = 0
      }
    }
  }

  /** 受击闪白：所有部件子图统一 `tint`。 */
  setBodyTint(color: number): void {
    for (const s of this.partSprites.values()) {
      s.tint = color
    }
  }
}
