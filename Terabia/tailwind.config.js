/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./screens/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Your design system colors
        primaryGreen: '#2E7D32',
        accentTerracotta: '#D9884B',
        sand: '#F5E9D4',
        sunYellow: '#F2C94C',
        neutral900: '#212121',
        neutral700: '#4A4A4A',
        neutral500: '#757575',
        neutral300: '#BDBDBD',
        neutral100: '#EEEEEE',
        background: '#FFFFFF',
        error: '#D32F2F',
        success: '#388E3C',
        warning: '#F57C00',
        info: '#1976D2',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '32px',
        '3xl': '48px',
        '4xl': '64px',
      },
      fontFamily: {
        inter: ['Inter_400Regular', 'Inter_500Medium', 'Inter_600SemiBold', 'Inter_700Bold'],
        poppins: ['Poppins_400Regular', 'Poppins_500Medium', 'Poppins_600SemiBold', 'Poppins_700Bold'],
      }
    },
  },
  plugins: [],
};

