/** @type {import('tailwindcss').Config} */
export default {
  // include all html/js files so tailwind detects classes created in JS
  content: [
    "./index.html",
    "./**/*.{html,js,ts,jsx,tsx}",
  ],
  // safelist classes that are generated dynamically by JS
  safelist: [
    "flex",
    "items-center",
    "space-x-2",
    "w-4",
    "h-4",
    "text-sm",
    "font-medium",
    "cursor-pointer",
    "bg-white",
    "border",
    "border-gray-300",
    "rounded-lg",
    "shadow-lg",
    "p-4",
    "z-40",
    "top-6",
    "top-4",
    "right-4",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
