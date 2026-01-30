import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 心情颜色
        mood: {
          happy: '#FFD93D',
          calm: '#6BCB77',
          sad: '#4D96FF',
          energetic: '#FF6B6B',
          healing: '#C9B1FF',
        },
        // 品牌色
        brand: {
          primary: '#FF9A8B',
          secondary: '#A18CD1',
        },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #FF9A8B 0%, #FF6A88 55%, #A18CD1 100%)',
        'gradient-soft': 'linear-gradient(135deg, #FFF5F5 0%, #F5F0FF 100%)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}

export default config
