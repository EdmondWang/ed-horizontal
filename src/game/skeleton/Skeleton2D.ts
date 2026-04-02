import { Bone } from './Bone'

/**
 * 轻量 2D 骨架：根骨骼 + 按名增删子骨骼，无蒙皮权重（适合切片 / 单图绕枢轴摆姿）。
 */
export class Skeleton2D {
  readonly root: Bone
  private readonly bones = new Map<string, Bone>()

  constructor(rootName = 'root') {
    this.root = new Bone(rootName)
    this.bones.set(rootName, this.root)
  }

  /** 在指定父骨骼下创建子骨骼并加入场景树。 */
  addBone(name: string, parentName: string): Bone {
    const parent = this.bones.get(parentName)
    if (!parent) {
      throw new Error(`Skeleton2D: 父骨骼不存在「${parentName}」`)
    }
    if (this.bones.has(name)) {
      throw new Error(`Skeleton2D: 骨骼已存在「${name}」`)
    }
    const bone = new Bone(name)
    parent.addChild(bone)
    this.bones.set(name, bone)
    return bone
  }

  getBone(name: string): Bone | undefined {
    return this.bones.get(name)
  }
}
