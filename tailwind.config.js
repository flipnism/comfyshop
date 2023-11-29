/** @type {import('tailwindcss').Config} */
export const content = ['./src/**/*.{js,jsx,ts,tsx}'];
export const theme = {
  fontSize: {
    xxs: '0.5rem',
    xs: '0.55rem',
    sm: '0.6rem',
    title: '0.8rem',
    base: '1rem',
    lg: '1.25rem',
  },
  extend: {
    colors: {
      'box-root': '#1e1e1e',
      'box-child': '#141414',
      'box-main-bg': '#323232',
    },
  },
};
export const plugins = [];
