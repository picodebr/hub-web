/* eslint-disable no-undef */
/** @type {import('postcss').Config} */
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {}, // <--- O nome novo entra aqui
    autoprefixer: {},
  },
}