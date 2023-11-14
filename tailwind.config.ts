import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{html,js,ts,tsx}'],
  plugins: [],
  theme: {
    extend: {
      colors: {
        kit: {
          primary: {
            full: '#4678B2',
            light: 'rgba(0, 118, 255, 0.16)',
            mid: 'rgba(70, 120, 178, 0.10)',
          },
        },
      },
    },
  },
}
export default config
