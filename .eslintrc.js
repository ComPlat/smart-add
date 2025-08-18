module.exports = {
  extends: [
    'prettier',
    // 'plugin:tailwindcss/recommended',
    // 'plugin:promise/recommended',
    // 'plugin:perfectionist/recommended-natural', 
    'plugin:@typescript-eslint/recommended',
    'next/core-web-vitals',
  ],
  overrides: [
    {
      files: ['cypress.config.ts', 'cypress/**/*.ts', 'cypress/**/*.js'],
      rules: {
        // Promise rules temporarily disabled due to ESLint v9 compatibility
      },
    },
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['prettier'],
  root: true,
  rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/no-explicit-any': 'warn', // Temporary downgrade for upgrade compatibility
  },
}
