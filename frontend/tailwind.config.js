/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        medical: "#244B68",
        sage: "#78A99C",
        "sage-deep": "#3F7568",
        canvas: "#F3F7F6",
        ink: "#263746",
        muted: "#718096",
        accent: "#E6EFEB",
        line: "#E2EAE7",
        success: "#2E9D70",
        warning: "#E9A23B",
        danger: "#DF5B5B"
      },
      boxShadow: {
        card: "0 8px 26px rgba(38, 55, 70, 0.055)",
        lift: "0 16px 38px rgba(36, 75, 104, 0.12)"
      },
      borderRadius: {
        panel: "12px"
      },
      fontFamily: {
        display: ["Inter", "sans-serif"]
      }
    }
  },
  plugins: []
};
