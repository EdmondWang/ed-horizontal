import {
  DEBUG_ARCH_ENABLED_VALUE,
  DEBUG_ARCH_LOCAL_STORAGE_KEY
} from './utils/debugArchGate'

function main(): void {
  const root = document.getElementById('debugArchRoot')
  if (!root) {
    return
  }

  if (localStorage.getItem(DEBUG_ARCH_LOCAL_STORAGE_KEY) !== DEBUG_ARCH_ENABLED_VALUE) {
    root.innerHTML = `
      <div id="debugArchDenied">
        <p>未授权访问调试架构入口。</p>
        <p>请在控制台将下列键设为 <strong>1</strong> 后刷新本页：</p>
        <code>${DEBUG_ARCH_LOCAL_STORAGE_KEY}</code>
      </div>
    `
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
