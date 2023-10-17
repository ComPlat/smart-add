module.exports = {
  extends: [
    'prettier',
    'plugin:tailwindcss/recommended',
    'plugin:promise/recommended',
    'plugin:perfectionist/recommended-natural',
    'plugin:@typescript-eslint/recommended',
    'next/core-web-vitals',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['prettier'],
  root: true,
  rules: {
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
    'tailwindcss/classnames-order': 'error',
  },
  // HINT: Disabled the following rules as they can't be caught or returned in Cypress
  //       environment and cause false positives
  overrides: [
    {
      extends: ['plugin:cypress/recommended'],
      files: ['cypress.config.ts', 'cypress/**/*.ts', 'cypress/**/*.js'],
      parserOptions: {
        project: ['cypress/tsconfig.json'],
      },
      rules: {
        'promise/always-return': 'off',
        'promise/catch-or-return': 'off',
      },
    },
  ],
}
