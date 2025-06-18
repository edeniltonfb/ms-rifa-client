/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      spacing: {
        '3/4': '75%'
      },
      screens: {
        'pp': '320px',  // Define o breakpoint para 320px
        'xs': '410px',  // Define o breakpoint para 320px
        /*'sm': '450px',*/  // Define o breakpoint para 450px
      },
      colors: {
        primary: "#0F011F",
        secondary: "#510E43",
        accent: "#F59E0B",
        textLight: "#FFF",
        textDark: "#333",
      },
    },
  },
  plugins: [
    require('tailwindcss-elevation')({
      color: '77,192,181',
      opacityBoost: '0.23'
    })
  ],
};
