export const Colors = {
  primary: {
    main: 0x667eea,
    dark: 0x5568d3,
    light: 0x7b8ef0
  },
  secondary: {
    main: 0x764ba2,
    dark: 0x5f3a85,
    light: 0x8c5bb8
  },
  accent: {
    main: 0xf093fb,
    dark: 0xd67ae0,
    light: 0xf4a8fc
  },
  background: {
    primary: 0x1a1a2e,
    secondary: 0x16213e,
    tertiary: 0x0f3460,
    elevated: 0x1f293a
  },
  game: {
    player: 0x22c55e,
    enemy: 0xef4444,
    ally: 0x3b82f6,
    neutral: 0x94a3b8,
    health: 0xef4444,
    energy: 0x3b82f6,
    shield: 0xf59e0b
  },
  status: {
    success: 0x10b981,
    warning: 0xf59e0b,
    error: 0xef4444,
    info: 0x3b82f6
  }
}

export const ThemeColors = {
  dark: {
    background: 0x1a1a2e,
    text: 0xffffff
  },
  light: {
    background: 0xf8fafc,
    text: 0x0f172a
  }
}

export const hexToNumber = (hex: string): number => {
  return parseInt(hex.replace('#', ''), 16)
}

export const numberToHex = (num: number): string => {
  return '#' + num.toString(16).padStart(6, '0')
}

export const getThemeColor = (theme: 'dark' | 'light' = 'dark') => {
  return ThemeColors[theme]
}
