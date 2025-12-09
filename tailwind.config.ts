import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Malaquias Gold Theme
        gold: {
          50: '#fdf9ef',
          100: '#faf0d5',
          200: '#f4deaa',
          300: '#edc875',
          400: '#e5ad43',
          500: '#C9983A', // Main gold
          600: '#B8872E',
          700: '#9a6d24',
          800: '#7d5622',
          900: '#66471f',
          950: '#3a250e',
        },
        dark: {
          50: '#f4f4f6',
          100: '#e5e5ea',
          200: '#cacad4',
          300: '#a8a8b8',
          400: '#7e7e94',
          500: '#636379',
          600: '#4d4d61',
          700: '#3d3d4f',
          800: '#2d2d46',
          900: '#1a1a2e', // Main dark
          950: '#12121f',
        },
        // Legacy mappings
        primary: {
          50: '#fdf9ef',
          100: '#faf0d5',
          200: '#f4deaa',
          300: '#edc875',
          400: '#e5ad43',
          500: '#C9983A',
          600: '#B8872E',
          700: '#9a6d24',
          800: '#7d5622',
          900: '#66471f',
          950: '#3a250e',
        },
        secondary: {
          50: '#f4f4f6',
          100: '#e5e5ea',
          200: '#cacad4',
          300: '#a8a8b8',
          400: '#7e7e94',
          500: '#636379',
          600: '#4d4d61',
          700: '#3d3d4f',
          800: '#2d2d46',
          900: '#1a1a2e',
          950: '#12121f',
        },
        accent: {
          50: '#fdf9ef',
          100: '#faf0d5',
          200: '#f4deaa',
          300: '#edc875',
          400: '#D4A84B', // Light gold accent
          500: '#C9983A',
          600: '#B8872E',
          700: '#9a6d24',
          800: '#7d5622',
          900: '#66471f',
          950: '#3a250e',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'scroll-up': 'scrollUp 15s linear infinite',
        'scroll-down': 'scrollDown 15s linear infinite',
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
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        scrollUp: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-50%)' },
        },
        scrollDown: {
          '0%': { transform: 'translateY(-50%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
