import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{html,js,ts,tsx}'],
  plugins: [],
  theme: {
    extend: {
      colors: {
        kit: {
          primary: '#32A189',
        },
      },
    },
  },
}
export default config
