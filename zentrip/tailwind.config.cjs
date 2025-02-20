/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx,html,css}',
    '*.{js,ts,jsx,tsx,mdx}',
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        archivo: ['Archivo', 'sans-serif'],
        'dm-serif': ["'DM Serif Display'", 'serif'],
      },
      colors: {
        dark: '#161616',
        pink: {
          600: '#E61C5D',
        },
        gray: {
          800: '#3E3E3E',
        },
        background: {
          DEFAULT: 'white',
          dark: '#161616',
        },
        'background-foreground': {
          DEFAULT: '#000000',
          dark: '#ffffff',
        },
        ring: {
          DEFAULT: '#E61C5D',
          dark: '#E61C5D',
        },
        'ring-foreground': {
          DEFAULT: 'white',
          dark: '#161616',
        },
        primary: {
          DEFAULT: '#E61C5D',
          foreground: 'white',
          dark: '#E61C5D',
        },
        secondary: {
          DEFAULT: '#3E3E3E',
          foreground: 'white',
          dark: '#f3f4f6',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      boxShadow: {
        custom: '0px 12px 40px 0px rgba(0, 0, 0, 0.04)',
        'custom-dark': '0px 12px 40px 0px rgba(0, 0, 0, 0.2)',
      },
      maxWidth: {
        '8xl': '2560px',
      },
      spacing: {
        128: '32rem',
        144: '36rem',
      },
      screens: {
        '3xl': '1920px',
        '4xl': '2560px',
      },
      aspectRatio: {
        illustration: '704/781',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        move: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '50%': { transform: 'translateY(-10%) translateX(10%)' },
        },
        blur: {
          '0%, 100%': { filter: 'blur(10px)' },
          '50%': { filter: 'blur(5px)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        moveGradient: {
          '0%': { backgroundPosition: '0% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glowingBorder: {
          '0%': { strokeDashoffset: '100' },
          '100%': { strokeDashoffset: '0' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 1s ease-in-out',
        move: 'move 5s ease-in-out infinite',
        blur: 'blur 5s ease-in-out infinite',
        moveGradient: 'moveGradient 3s linear infinite',
        'scroll-infinite': 'scroll 30s linear infinite',
        glowingBorder: 'glowingBorder 2s linear infinite',
      },
      backgroundImage: {
        'skeleton-gradient':
          'linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)',
        'skeleton-gradient-dark':
          'linear-gradient(90deg, #1f2937 0%, #374151 50%, #1f2937 100%)',
        'chat-gradient': 'linear-gradient(90deg, #E61C5D, #FDE8EF, #E61C5D)',
        'gradient-radial': 'radial-gradient(circle, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
  safelist: [
    'font-urbanist',
    'text-primary',
    'text-secondary',
    'text-dark',
    'bg-primary',
    'bg-secondary',
    'bg-dark',
    'animate-fadeIn',
    'animate-pulse',
    'animate-spin',
    'animate-shimmer',
    'animate-move',
    'animate-moveGradient',
    'animate-scroll-infinite',
    'animate-glowingBorder',
    'bg-skeleton-gradient',
    'bg-skeleton-gradient-dark',
    'bg-chat-gradient',
    'ring',
    'ring-offset',
    'ring-primary',
    'ring-secondary',
    'focus-visible:ring',
    'focus-visible:ring-offset',
    'dark:bg-background-dark',
    'dark:text-white',
    'dark:ring-offset-dark',
    'dark:shadow-custom-dark',
  ],
};
