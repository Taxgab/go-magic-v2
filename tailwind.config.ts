import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6d548c',
          50: '#f5f0fa',
          100: '#ebe3f5',
          200: '#d7c7eb',
          300: '#c3abd9',
          400: '#a888c4',
          500: '#8e6aaf',
          600: '#6d548c',
          700: '#5a4573',
          800: '#4a395c',
          900: '#3c2f4b',
          container: '#dbbdfd',
        },
        secondary: {
          DEFAULT: '#4b664a',
          50: '#edf2ed',
          100: '#dbe6db',
          200: '#b8ccb8',
          300: '#95b395',
          400: '#729972',
          500: '#4b664a',
          600: '#3f553f',
          700: '#354535',
          800: '#2c3a2c',
          900: '#253225',
        },
        tertiary: {
          DEFAULT: '#a53d12',
          50: '#fdf0eb',
          100: '#fbe1d7',
          200: '#f6c3af',
          300: '#f1a587',
          400: '#ec7d54',
          500: '#a53d12',
          600: '#8d340f',
          700: '#752c0d',
          800: '#5e240a',
          900: '#4a1d08',
        },
        surface: {
          DEFAULT: '#fbf9f5',
          lowest: '#ffffff',
          low: '#f5f2ed',
          high: '#efebe6',
          highest: '#e8e4de',
        },
        onSurface: '#31332f',
        outlineVariant: '#b2b2ad',
      },
      fontFamily: {
        serif: ['Noto Serif', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-md': ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'display-sm': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },
      borderRadius: {
        ' DEFAULT': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        full: '9999px',
      },
      boxShadow: {
        ambient: '0 20px 40px rgba(49, 51, 47, 0.06)',
        float: '0 8px 24px rgba(49, 51, 47, 0.08)',
      },
      backgroundImage: {
        'gradient-soul': 'linear-gradient(135deg, #6d548c 0%, #dbbdfd 100%)',
      },
    },
  },
  plugins: [],
}
export default config
