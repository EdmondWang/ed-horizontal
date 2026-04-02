import { Assets } from 'pixi.js'
import { ENEMY_TEXTURE, UNIT_ARCHER, UNIT_GATHERER } from './config'

/** 收集己方蓝图与敌线配置中的贴图 URL（`public` 下路径）。 */
function collectAllForestDefenseTextureUrls(): string[] {
  const urls = new Set<string>()
  for (const def of [UNIT_GATHERER, UNIT_ARCHER] as const) {
    if (
      'textureUrl' in def &&
      typeof def.textureUrl === 'string' &&
      def.textureUrl.length > 0
    ) {
      urls.add(def.textureUrl)
    }
  }
  for (const u of Object.values(ENEMY_TEXTURE)) {
    urls.add(u)
  }
  return [...urls]
}

/**
 * 预加载林缘防线己方/敌线全部贴图；须在创建单位前完成（例如对局开始前 `await`）。
 */
export async function preloadForestDefenseUnitTextures(): Promise<void> {
  const urls = collectAllForestDefenseTextureUrls()
  if (urls.length === 0) {
    return
  }
  await Assets.load(urls)
}
