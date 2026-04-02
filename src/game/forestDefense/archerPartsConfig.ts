import { Rectangle, Texture } from 'pixi.js'
import { UNIT_ARCHER } from './config'

/**
 * 芽弓切片部件：每个部件对应一根骨骼 + 一张子图（或同图 `frame` 切区）。
 * 后续加动作可增部件、换图或改 `frame`，再在 `ArcherRig` 里绑关键帧。
 */
export interface ArcherPartDef {
  id: string
  parent: string
  textureUrl: string
  anchor: { x: number; y: number }
  position: { x: number; y: number }
  frame?: { x: number; y: number; w: number; h: number }
  zIndex?: number
}

/**
 * `true`：使用 `public/assets/sprites/archer/*.png` 独立部件（占位可同图，正式替换为切片）。
 * `false`：从主立绘 `UNIT_ARCHER.textureUrl` 切出头 / 躯干 + 手臂与弓用独立文件。
 */
export const ARCHER_USE_FILE_SLICES = true

/** 与 `scripts/slice_archer_sprite.py` 导出尺寸一致，用于骨骼相对位移（逻辑像素，再经 ArcherRig 根缩放）。 */
const ARCHER_SLICE_LEGS_H = 340
const ARCHER_SLICE_TORSO_H = 237

/**
 * 不透明包围盒宽度（与 `slice_archer_sprite.py` 中 archer-ranger 一致），用于锚点换算。
 * 躯干切图宽为 `ARCHER_TORSO_W_RATIO * bboxW`，左缘与 bbox 左缘对齐；全身竖直中线在 bbox 半宽处，
 * 故躯干锚点 x = (bboxW/2) / (bboxW*0.72) = 1/(2*0.72)，不能用 0.5（否则头与躯干水平错位）。
 */
const ARCHER_BBOX_W = 1238
const ARCHER_TORSO_W_RATIO = 0.72
const ARCHER_TORSO_ANCHOR_X = 1 / (2 * ARCHER_TORSO_W_RATIO)
/** 手臂切图左缘在 bbox 的 50% 处 = 全身中线，纹理局部 x=0 即中线，拉弓枢轴再靠 `position` 微调。 */
const ARCHER_ARM_BOW_ANCHOR_X = 0
/** 弓切图左缘在 bbox 的 60% 处；中线在弓图局部 x = -0.1*bboxW（与当前 bow.png 宽 496 配套）。 */
const ARCHER_BOW_TEXTURE_W = 496
const ARCHER_BOW_ANCHOR_X = (-0.1 * ARCHER_BBOX_W) / ARCHER_BOW_TEXTURE_W

/**
 * 纯文件切片（`public/assets/sprites/archer/*.png`）。
 * 层级：腿在 root 脚底 → 躯干在腰 → 头 / 拉弓臂在躯干上，与切图「腰/脚」分界一致。
 */
export function createArcherPartDefinitionsFromFiles(): ArcherPartDef[] {
  const base = '/assets/sprites/archer'
  return [
    {
      id: 'legs',
      parent: 'root',
      textureUrl: `${base}/legs.png`,
      anchor: { x: 0.5, y: 1 },
      position: { x: 0, y: 0 },
      zIndex: 0
    },
    {
      id: 'torso',
      parent: 'legs',
      textureUrl: `${base}/torso.png`,
      anchor: { x: ARCHER_TORSO_ANCHOR_X, y: 1 },
      position: { x: 0, y: -ARCHER_SLICE_LEGS_H },
      zIndex: 1
    },
    {
      id: 'head',
      parent: 'torso',
      textureUrl: `${base}/head.png`,
      anchor: { x: 0.5, y: 1 },
      position: { x: 0, y: -ARCHER_SLICE_TORSO_H },
      zIndex: 3
    },
    {
      id: 'arm_bow',
      parent: 'torso',
      textureUrl: `${base}/arm-bow.png`,
      anchor: { x: ARCHER_ARM_BOW_ANCHOR_X, y: 0.52 },
      position: { x: 0, y: -95 },
      zIndex: 4
    },
    {
      id: 'bow',
      parent: 'arm_bow',
      textureUrl: `${base}/bow.png`,
      anchor: { x: ARCHER_BOW_ANCHOR_X, y: 0.48 },
      position: { x: 36, y: -8 },
      zIndex: 0
    }
  ]
}

/**
 * 从主立绘动态切帧：躯干（无头）+ 头 + 手臂与弓文件。
 */
export function createArcherPartDefinitionsFromBaseTexture(
  baseTextureUrl: string = UNIT_ARCHER.textureUrl
): ArcherPartDef[] {
  const base = Texture.from(baseTextureUrl)
  const W = base.width
  const H = base.height
  const headH = H * 0.26
  const torsoH = H - headH
  return [
    {
      id: 'torso',
      parent: 'root',
      textureUrl: baseTextureUrl,
      frame: { x: 0, y: headH, w: W, h: torsoH },
      anchor: { x: 0.5, y: 1 },
      position: { x: 0, y: 0 },
      zIndex: 1
    },
    {
      id: 'head',
      parent: 'torso',
      textureUrl: baseTextureUrl,
      frame: { x: 0, y: 0, w: W, h: headH },
      anchor: { x: 0.5, y: 1 },
      position: { x: 0, y: -torsoH },
      zIndex: 2
    },
    {
      id: 'arm_bow',
      parent: 'torso',
      textureUrl: '/assets/sprites/archer/arm-bow.png',
      anchor: { x: 0.15, y: 0.55 },
      position: { x: 38, y: -torsoH * 0.45 },
      zIndex: 3
    },
    {
      id: 'bow',
      parent: 'arm_bow',
      textureUrl: '/assets/sprites/archer/bow.png',
      anchor: { x: 0.2, y: 0.5 },
      position: { x: 42, y: -8 },
      zIndex: 0
    }
  ]
}

export function getArcherPartDefinitions(): ArcherPartDef[] {
  return ARCHER_USE_FILE_SLICES
    ? createArcherPartDefinitionsFromFiles()
    : createArcherPartDefinitionsFromBaseTexture()
}

export function collectArcherPartTextureUrls(): string[] {
  const defs = getArcherPartDefinitions()
  const set = new Set<string>()
  for (const d of defs) {
    set.add(d.textureUrl)
  }
  if (!ARCHER_USE_FILE_SLICES) {
    set.add(UNIT_ARCHER.textureUrl)
  }
  return [...set]
}

export function createTextureForPart(def: ArcherPartDef): Texture {
  const base = Texture.from(def.textureUrl)
  if (!def.frame) {
    return base
  }
  const { x, y, w, h } = def.frame
  return new Texture({
    source: base.source,
    frame: new Rectangle(x, y, w, h)
  })
}

export function sortPartsForBuild(parts: ArcherPartDef[]): ArcherPartDef[] {
  const byId = new Map(parts.map((p) => [p.id, p]))
  const sorted: ArcherPartDef[] = []
  const visiting = new Set<string>()

  function visit(id: string): void {
    if (visiting.has(id)) {
      throw new Error(`archerPartsConfig: 骨骼成环「${id}」`)
    }
    if (sorted.some((p) => p.id === id)) {
      return
    }
    const p = byId.get(id)
    if (!p) {
      throw new Error(`archerPartsConfig: 未知部件「${id}」`)
    }
    visiting.add(id)
    if (p.parent !== 'root') {
      visit(p.parent)
    }
    visiting.delete(id)
    sorted.push(p)
  }

  for (const p of parts) {
    visit(p.id)
  }
  return sorted
}
