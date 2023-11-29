module.exports = {
    presets: ['@babel/preset-env', '@babel/typescript', '@babel/preset-react'],
    env: {
      production: {
        only: ['src'],
      },
    },
  };