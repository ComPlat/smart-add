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
    'prettier/prettier': 'error',
    'tailwindcss/classnames-order': 'error',
  },
}
