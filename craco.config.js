// Arquivo: craco.config.js (VERSÃO FINAL CORRIGIDA)

module.exports = {
  style: {
    postcssOptions: {
      plugins: [
        require('tailwindcss'), // <-- O nome correto do pacote (sem @)
        require('autoprefixer'),
      ],
    },
  },
};