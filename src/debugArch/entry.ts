/**
 * 调试架构门户页（`debugArch.html`）：选择后跳主入口并带上开发用叠加层参数。
 * 与主游戏内 `devOverlay`（扫屏 / 下雪）不同，本页仅负责导航。
 */
function main(): void {
  const root = document.getElementById('debugArchRoot')
  if (!root) {
    return
  }

  root.innerHTML = `
    <h1>调试架构</h1>
    <div class="actions">
      <button type="button" id="debugArchBtnSweep">进入扫屏模式</button>
      <button type="button" id="debugArchBtnSnow">进入下雪模式</button>
    </div>
  `

  document.getElementById('debugArchBtnSweep')?.addEventListener('click', () => {
    window.location.href = `${import.meta.env.BASE_URL}index.html?devOverlay=screen-sweep`
  })

  document.getElementById('debugArchBtnSnow')?.addEventListener('click', () => {
    window.location.href = `${import.meta.env.BASE_URL}index.html?devOverlay=snow`
  })
}

main()
