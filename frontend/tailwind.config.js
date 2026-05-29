/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        dark: "#111110",
        orange: { DEFAULT: "#E8642A", hover: "#C24E18" },
        bg: "#F4F2EE",
        surface: "#FFFFFF",
        border: "#E5E2DC",
        text: { primary: "#111110", secondary: "#5C5A54", hint: "#AAA8A4" }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"]
      },
      borderRadius: { card: "12px" }
    }
  }
}
