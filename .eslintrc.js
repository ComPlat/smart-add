module.exports = {
  extends: [
    // 'prettier',
    'plugin:tailwindcss/recommended',
    'plugin:promise/recommended',
    'plugin:perfectionist/recommended-natural',
    'plugin:@typescript-eslint/recommended',
    'next/core-web-vitals',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['prettier', 'promise', 'perfectionist', '@typescript-eslint'],
  root: true,
  rules: {
    '@typescript-eslint/no-namespace': 'off',
    'prettier/prettier': 'error',
    'tailwindcss/classnames-order': 'error', // used for Cypress
  },
}
