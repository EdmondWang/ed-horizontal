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
