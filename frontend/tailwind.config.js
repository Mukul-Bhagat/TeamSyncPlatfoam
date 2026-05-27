/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Sora', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'heading-xl': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'heading-lg': ['2rem', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
        'heading-md': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'heading-sm': ['1.25rem', { lineHeight: '1.4', letterSpacing: '-0.005em' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],
        'body-md': ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        'caption': ['0.75rem', { lineHeight: '1.4' }],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      boxShadow: {
        'soft-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'soft-md': '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        'soft-lg': '0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
        'soft-xl': '0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05)',
        'elevation-sm': 'var(--elevation-sm)',
        'elevation-md': 'var(--elevation-md)',
        'elevation-lg': 'var(--elevation-lg)',
        'elevation-xl': 'var(--elevation-xl)',
        'glass': 'var(--glass-shadow)',
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '200ms',
        'slow': '300ms',
      },
      transitionTimingFunction: {
        'out-cubic': 'var(--ease-out-cubic)',
        'in-out-cubic': 'var(--ease-in-out-cubic)',
        'spring': 'var(--ease-spring)',
      },
      backdropBlur: {
        'glass-sm': 'var(--glass-blur)',
        'glass-md': 'var(--glass-blur)',
        'glass-lg': 'var(--glass-blur)',
      },
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-secondary': 'var(--gradient-secondary)',
        'gradient-subtle': 'var(--gradient-subtle)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s var(--ease-out-cubic)',
        'fade-out': 'fadeOut 0.3s var(--ease-out-cubic)',
        'slide-in-left': 'slideInLeft 0.3s var(--ease-out-cubic)',
        'slide-in-right': 'slideInRight 0.3s var(--ease-out-cubic)',
        'slide-out-left': 'slideOutLeft 0.3s var(--ease-out-cubic)',
        'slide-out-right': 'slideOutRight 0.3s var(--ease-out-cubic)',
        'pulse-subtle': 'pulseSubtle 2s var(--ease-in-out-cubic) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideOutLeft: {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(-100%)', opacity: '0' },
        },
        slideOutRight: {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}
