module.exports = {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        fontFamily: {
          'ultra': ['Ultra', 'serif'],
        },
        colors: {
          'brand-red': '#ad3032',
        }
      },
      extend: {
        inset: {
          "2.5%": "2.5%",
          "5%": "5%",
          "10%": "10%",
          "1/5": "20%",
          "2/5": "40%",
          "3/5": "60%",
        }
      },
    },
    plugins: [],
  }