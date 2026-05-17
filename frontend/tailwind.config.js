/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#1D9E75',
        'primary-dark': '#178a64',
        'primary-light': '#e8f7f3',
      },
    },
  },
  plugins: [],
};
