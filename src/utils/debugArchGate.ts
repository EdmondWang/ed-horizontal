/**
 * 调试架构入口页（debugArch.html）门禁：仅当 localStorage 为该键且值为 "1" 时允许进入。
 * 在控制台执行：`localStorage.setItem('ed_horizontal.debug.arch', '1')` 后刷新调试入口页。
 */
export const DEBUG_ARCH_LOCAL_STORAGE_KEY = 'ed_horizontal.debug.arch'
export const DEBUG_ARCH_ENABLED_VALUE = '1'
