import { defineConfig } from 'cypress'

export default defineConfig({
  component: {
    devServer: {
      bundler: 'webpack',
      framework: 'next',
    },
  },

  e2e: {},

  screenshotOnRunFailure: true,
  video: false,
})
