import { Container, Graphics, Rectangle, Text } from 'pixi.js'
import type { Game } from '../core/game'
import type { MainLayoutColumns } from '../mainLayout'
import { mountForestDefense } from './forestDefense'
import { pixiColors } from '../utils/pixiColors'

/** 逻辑分辨率内简易文字按钮（矩形命中区）。 */
function makeTextButton(
  label: string,
  w: number,
  h: number,
  onClick: () => void
): Container {
  const c = new Container()
  c.eventMode = 'static'
  c.cursor = 'pointer'
  c.hitArea = new Rectangle(0, 0, w, h)
  const bg = new Graphics()
  bg.roundRect(0, 0, w, h, 8)
  bg.fill({ color: 0x1e293b, alpha: 0.95 })
  bg.stroke({ width: 2, color: 0x334155, alpha: 0.9 })
  c.addChild(bg)
  const t = new Text({
    text: label,
    style: {
      fill: 0xf1f5f9,
      fontSize: 14,
      fontFamily: 'system-ui, sans-serif',
      fontWeight: '600'
    }
  })
  t.anchor.set(0.5)
  t.x = w / 2
  t.y = h / 2
  c.addChild(t)
  c.on('pointerdown', (e) => {
    e.stopPropagation()
    onClick()
  })
  return c
}

/**
 * 主菜单、对局内暂停与结算；在 `world` 最上层挂载 UI（与 `Game` 设计分辨率对齐）。
 */
export function mountGameFlow(options: {
  game: Game
  layout: MainLayoutColumns
}): { destroy: () => void } {
  const { game, layout } = options
  const { designWidth, designHeight } = game
  const world = game.world
  world.sortableChildren = true

  const uiLayer = new Container()
  uiLayer.label = 'game-flow-ui'
  uiLayer.zIndex = 10000
  world.addChild(uiLayer)

  let paused = false
  let prototypeDestroy: (() => void) | null = null

  /** 主菜单（全屏）。 */
  const mainMenu = new Container()
  mainMenu.eventMode = 'static'
  const menuBg = new Graphics()
  menuBg.rect(0, 0, designWidth, designHeight)
  menuBg.fill({ color: pixiColors.bgPrimary, alpha: 0.92 })
  mainMenu.addChild(menuBg)

  const menuTitle = new Text({
    text: '青林誓环',
    style: {
      fill: pixiColors.game.player,
      fontSize: 42,
      fontFamily: 'system-ui, sans-serif',
      fontWeight: '700',
      align: 'center'
    }
  })
  menuTitle.anchor.set(0.5, 0)
  menuTitle.x = designWidth / 2
  menuTitle.y = designHeight * 0.28
  mainMenu.addChild(menuTitle)

  const menuSub = new Text({
    text: '脉心林带 · 防线',
    style: {
      fill: 0x94a3b8,
      fontSize: 16,
      fontFamily: 'system-ui, sans-serif',
      align: 'center'
    }
  })
  menuSub.anchor.set(0.5, 0)
  menuSub.x = designWidth / 2
  menuSub.y = designHeight * 0.28 + 52
  mainMenu.addChild(menuSub)

  const startBtn = makeTextButton('开始游戏', 200, 48, () => startNewRun())
  startBtn.x = designWidth / 2 - 100
  startBtn.y = designHeight * 0.5
  mainMenu.addChild(startBtn)
  uiLayer.addChild(mainMenu)

  /** 对局中暂停（右上角）。 */
  const pauseBtn = makeTextButton('暂停', 72, 36, () => openPause())
  pauseBtn.x = designWidth - 88
  pauseBtn.y = 16
  pauseBtn.visible = false
  uiLayer.addChild(pauseBtn)

  /** 暂停弹层：半透明遮罩 + 面板。 */
  const pauseModal = new Container()
  pauseModal.visible = false
  pauseModal.eventMode = 'static'
  const pauseDim = new Graphics()
  pauseDim.rect(0, 0, designWidth, designHeight)
  pauseDim.fill({ color: 0x0f172a, alpha: 0.55 })
  pauseDim.eventMode = 'static'
  pauseDim.on('pointerdown', () => {})
  pauseModal.addChild(pauseDim)

  const pausePanelW = 360
  const pausePanelH = 200
  const pausePanel = new Container()
  pausePanel.x = (designWidth - pausePanelW) / 2
  pausePanel.y = (designHeight - pausePanelH) / 2
  const pausePanelBg = new Graphics()
  pausePanelBg.roundRect(0, 0, pausePanelW, pausePanelH, 12)
  pausePanelBg.fill({ color: 0x1e293b, alpha: 0.98 })
  pausePanelBg.stroke({ width: 2, color: 0x475569, alpha: 0.95 })
  pausePanel.addChild(pausePanelBg)

  const pauseTitle = new Text({
    text: '游戏已暂停',
    style: {
      fill: 0xf8fafc,
      fontSize: 22,
      fontFamily: 'system-ui, sans-serif',
      fontWeight: '600'
    }
  })
  pauseTitle.anchor.set(0.5, 0)
  pauseTitle.x = pausePanelW / 2
  pauseTitle.y = 24
  pausePanel.addChild(pauseTitle)

  const resumeBtn = makeTextButton('恢复游戏', 140, 40, () => closePause())
  resumeBtn.x = 40
  resumeBtn.y = 120
  pausePanel.addChild(resumeBtn)

  const toMenuFromPauseBtn = makeTextButton('回主菜单', 140, 40, () => goToMainMenuFromPause())
  toMenuFromPauseBtn.x = pausePanelW - 140 - 40
  toMenuFromPauseBtn.y = 120
  pausePanel.addChild(toMenuFromPauseBtn)

  pauseModal.addChild(pausePanel)
  uiLayer.addChild(pauseModal)

  /** 结算画面（胜/负）。 */
  const resultModal = new Container()
  resultModal.visible = false
  resultModal.eventMode = 'static'
  const resultDim = new Graphics()
  resultDim.rect(0, 0, designWidth, designHeight)
  resultDim.fill({ color: 0x0f172a, alpha: 0.6 })
  resultDim.eventMode = 'static'
  resultModal.addChild(resultDim)

  const resultPanelW = 520
  const resultPanelH = 280
  const resultPanel = new Container()
  resultPanel.x = (designWidth - resultPanelW) / 2
  resultPanel.y = (designHeight - resultPanelH) / 2
  const resultPanelBg = new Graphics()
  resultPanelBg.roundRect(0, 0, resultPanelW, resultPanelH, 14)
  resultPanelBg.fill({ color: 0x1e293b, alpha: 0.98 })
  resultPanelBg.stroke({ width: 2, color: 0x22c55e, alpha: 0.45 })
  resultPanel.addChild(resultPanelBg)

  const resultTitle = new Text({
    text: '游戏结算',
    style: {
      fill: 0xf8fafc,
      fontSize: 26,
      fontFamily: 'system-ui, sans-serif',
      fontWeight: '700'
    }
  })
  resultTitle.anchor.set(0.5, 0)
  resultTitle.x = resultPanelW / 2
  resultTitle.y = 28
  resultPanel.addChild(resultTitle)

  const resultBody = new Text({
    text: '',
    style: {
      fill: 0xe2e8f0,
      fontSize: 20,
      fontFamily: 'system-ui, sans-serif',
      align: 'center',
      wordWrap: true,
      wordWrapWidth: resultPanelW - 48
    }
  })
  resultBody.anchor.set(0.5, 0)
  resultBody.x = resultPanelW / 2
  resultBody.y = 88
  resultPanel.addChild(resultBody)

  const resultToMenuBtn = makeTextButton('回到游戏主菜单', 220, 44, () => goToMainMenuFromResult())
  resultToMenuBtn.x = (resultPanelW - 220) / 2
  resultToMenuBtn.y = resultPanelH - 60
  resultPanel.addChild(resultToMenuBtn)

  resultModal.addChild(resultPanel)
  uiLayer.addChild(resultModal)

  function startNewRun(): void {
    prototypeDestroy?.()
    prototypeDestroy = null
    paused = false
    pauseModal.visible = false
    resultModal.visible = false
    mainMenu.visible = false
    pauseBtn.visible = true

    const run = mountForestDefense({
      game,
      layout,
      isPaused: () => paused,
      onMatchEnd: (result) => {
        pauseBtn.visible = false
        if (result === 'win') {
          resultBody.text = '胜利\n林线还在，根脉未断。'
        } else {
          resultBody.text = '失败\n斧痕过线，母树沉默。'
        }
        resultModal.visible = true
      }
    })
    prototypeDestroy = (): void => {
      run.destroy()
    }
  }

  function openPause(): void {
    paused = true
    pauseModal.visible = true
  }

  function closePause(): void {
    paused = false
    pauseModal.visible = false
  }

  function goToMainMenuFromPause(): void {
    paused = false
    pauseModal.visible = false
    prototypeDestroy?.()
    prototypeDestroy = null
    pauseBtn.visible = false
    mainMenu.visible = true
  }

  function goToMainMenuFromResult(): void {
    resultModal.visible = false
    prototypeDestroy?.()
    prototypeDestroy = null
    pauseBtn.visible = false
    mainMenu.visible = true
  }

  return {
    destroy: (): void => {
      prototypeDestroy?.()
      prototypeDestroy = null
      uiLayer.removeFromParent()
      uiLayer.destroy({ children: true })
    }
  }
}
