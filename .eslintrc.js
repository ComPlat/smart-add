module.exports = {
  extends: [
    'prettier',
    'plugin:tailwindcss/recommended',
    'plugin:promise/recommended',
    'plugin:perfectionist/recommended-natural',
    'plugin:@typescript-eslint/recommended',
    'next/core-web-vitals',
  ],
  overrides: [
    {
      files: ['cypress.config.ts', 'cypress/**/*.ts', 'cypress/**/*.js'],
      rules: {
        'promise/always-return': 'off',
        'promise/catch-or-return': 'off',
      },
    },
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['prettier'],
  root: true,
  rules: {
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
    'tailwindcss/classnames-order': 'error',
  },
}
