/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./App.tsx",
    "./index.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}", // Assuming there might be a pages directory
    "./src/**/*.{js,ts,jsx,tsx}"    // Covering common src patterns
  ],
  darkMode: 'class', // or 'media' based on preference
  theme: {
    extend: {
      colors: {
        // Light mode colors (can be namespaced or removed if dark is default)
        'brand-primary-light': '#0A2540',
        'brand-secondary-light': '#0077CC',
        'brand-accent-light': '#635BFF',
        'brand-bg-light': '#F6F9FC',
        'brand-surface-light': '#FFFFFF',
        'brand-text-primary-light': '#334155',
        'brand-text-secondary-light': '#64748B',
        'brand-border-light': '#E5E7EB',

        // Dark mode (primary theme)
        'brand-primary': '#0F172A',      // Header bg
        'brand-secondary': '#38BDF8',    // Links
        'brand-accent': '#818CF8',       // Accent elements
        'brand-bg': '#020617',           // Main background
        'brand-surface': '#1E293B',      // Card/surface background
        'brand-surface-alt': '#334155',  // Alternative surface (e.g., input bg)
        'brand-text-primary': '#E2E8F0', // Primary text
        'brand-text-secondary': '#94A3B8',// Secondary text
        'brand-border': '#334155',       // Borders
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
