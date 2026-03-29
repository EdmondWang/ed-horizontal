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
    window.location.href = `${import.meta.env.BASE_URL}index.html?debugMode=screen-sweep`
  })

  document.getElementById('debugArchBtnSnow')?.addEventListener('click', () => {
    window.location.href = `${import.meta.env.BASE_URL}index.html?debugMode=snow`
  })
}

main()
