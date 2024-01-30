import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{html,js,ts,tsx}'],
  plugins: [],
  theme: {
    extend: {
      animation: {
        'emerge-from-lamp': 'emergeFromLamp 0.2s ease-out',
        'fade-in': 'fadeIn 0.1s ease-out',
      },
      colors: {
        kit: {
          primary: {
            full: '#4678B2',
            light: 'rgba(0, 118, 255, 0.16)',
            mid: 'rgba(70, 120, 178, 0.10)',
          },
        },
      },
      keyframes: {
        emergeFromLamp: {
          '0%': {
            opacity: '0',
            transform: 'scaleX(0)',
          },
          '50%': {
            opacity: '0.5',
          },
          '100%': {
            opacity: '1',
            transform: 'scaleX(1)',
          },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      transformOrigin: {
        'left-center': 'left center',
      },
    },
  },
}
export default config
