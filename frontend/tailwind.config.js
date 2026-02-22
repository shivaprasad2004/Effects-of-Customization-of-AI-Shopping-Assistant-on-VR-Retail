/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: { DEFAULT: '#1A1A2E', light: '#2D2D4E', dark: '#0D0D1A' },
                secondary: { DEFAULT: '#16213E', light: '#1E2D52', dark: '#0C1526' },
                accent: { DEFAULT: '#0F3460', light: '#1A4A8A', dark: '#0A2445' },
                highlight: { DEFAULT: '#E94560', light: '#FF6B85', dark: '#C72040' },
                glass: { DEFAULT: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                heading: ['Orbitron', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-cyber': 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)',
                'gradient-glow': 'linear-gradient(135deg, #E94560 0%, #0F3460 100%)',
            },
            animation: {
                'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
                'float': 'float 3s ease-in-out infinite',
                'slide-in-up': 'slideInUp 0.4s ease-out',
                'slide-in-right': 'slideInRight 0.4s ease-out',
                'fade-in': 'fadeIn 0.3s ease-out',
                'spin-slow': 'spin 8s linear infinite',
                'bounce-slow': 'bounce 3s infinite',
                'particle': 'particle 4s ease-in-out infinite',
            },
            keyframes: {
                pulseGlow: {
                    '0%, 100%': { boxShadow: '0 0 5px #E94560, 0 0 10px #E94560' },
                    '50%': { boxShadow: '0 0 20px #E94560, 0 0 40px #E94560, 0 0 60px #E94560' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                slideInUp: {
                    from: { transform: 'translateY(20px)', opacity: '0' },
                    to: { transform: 'translateY(0)', opacity: '1' },
                },
                slideInRight: {
                    from: { transform: 'translateX(20px)', opacity: '0' },
                    to: { transform: 'translateX(0)', opacity: '1' },
                },
                fadeIn: {
                    from: { opacity: '0' },
                    to: { opacity: '1' },
                },
                particle: {
                    '0%': { transform: 'scale(0) rotate(0deg)', opacity: '1' },
                    '100%': { transform: 'scale(1.5) rotate(180deg)', opacity: '0' },
                },
            },
            boxShadow: {
                'glow-pink': '0 0 20px rgba(233, 69, 96, 0.5)',
                'glow-blue': '0 0 20px rgba(15, 52, 96, 0.8)',
                'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
                'inner-glow': 'inset 0 0 20px rgba(233, 69, 96, 0.1)',
            },
            backdropBlur: { xs: '2px' },
            borderRadius: { '4xl': '2rem', '5xl': '3rem' },
        },
    },
    plugins: [],
};
