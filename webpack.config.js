const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const version = '0.0.1';
module.exports = (_env, arg) => {
  return {
    entry: './src/index.tsx',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'index.js',
      //libraryTarget: "commonjs2"
    },
    devtool: 'eval',
    externals: {
      uxp: 'commonjs2 uxp',
      photoshop: 'commonjs2 photoshop',
      os: 'commonjs2 os',
      fs: 'commonjs2 fs',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', 'jsx', '.css'],
    },
    module: {
      rules: [
        {
          test: /\.(jsx?|tsx?)$/,
          resolve: {
            extensions: ['.js', 'jsx', '.ts', '.tsx'],
          },

          exclude: /(node_modules)/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                plugins: ['@babel/transform-react-jsx', '@babel/proposal-object-rest-spread', '@babel/plugin-syntax-class-properties'],
              },
            },
          ],
        },
        {
          test: /\.(png|jpe?g|gif|jp2|webp)$/,
          type: 'asset/resource',
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader', 'postcss-loader'],
        },
      ],
    },

    plugins: [
      new CopyPlugin({
        patterns: [
          { from: 'plugin' },
          {
            from: 'plugin/manifest.json',
            transform(content, absoluteFrom) {
              return content.toString().replace(/\"version\".+?\"[0-9].*\"/, `"version": "${version}"`);
            },
          },
        ],
      }),
    ],
  };
};
