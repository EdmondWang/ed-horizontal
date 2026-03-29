module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint', 'import'],
  rules: {
    /** 单文件物理行数上限（含空行与注释）。 */
    'max-lines': ['error', { max: 500 }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    /** 优先具名导出（`export const` / `export function` / `export { x }`），避免 `export default`。 */
    'import/no-default-export': 'error'
  },
  overrides: [
    {
      files: ['vite.config.ts', '*.config.ts', '*.config.cjs'],
      rules: {
        'import/no-default-export': 'off'
      }
    }
  ]
}
