/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // MÁGICA: Substituindo o "Roxo" pelo "Azul Marinho" da sua logo 3V!
        indigo: {
          50: '#f4f6f8',
          100: '#e4e7eb',
          200: '#cbd2d9',
          300: '#9aa5b1',
          400: '#7b8794',
          500: '#2A3A5A', // Cor mais clara (para bordas)
          600: '#182236', // Cor EXATA do "3" da logo (Botões principais)
          700: '#111928', // Cor dos Textos de Título
          800: '#0b101a', // Cor do botão quando passa o mouse por cima
          900: '#05080d',
        }
      }
    },
  },
  plugins: [],
}