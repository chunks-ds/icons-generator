const path = require('path');
const copy = require('copy-webpack-plugin');
const moduleVersion = require('./package.json').version;

function versioned(buffer) {
  const destPackageJson = JSON.parse(buffer.toString());
  destPackageJson.version = moduleVersion;
  return JSON.stringify(destPackageJson, null, 2);
}

module.exports = {
  mode: "production",
  entry: './src/index.ts',
  output: {
    filename: 'ig.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: { "path": false }
  },
  plugins: [
    new copy({
      patterns: [
        {
          from: path.resolve(__dirname, `src/package.json`),
          to: path.resolve(__dirname, `dist/package.json`),
          transform(content, path) {
            return versioned(content);
          }
        },
        {
          from: path.resolve(__dirname, `./LICENSE`),
          to: path.resolve(__dirname, `dist/LICENSE`),
          toType: 'file'
        },
        {
          from: path.resolve(__dirname, `./README.md`),
          to: path.resolve(__dirname, `dist/README.md`),
          toType: 'file'
        },
        {
          from: path.resolve(__dirname, `./.npmrc`),
          to: path.resolve(__dirname, `dist/.npmrc`),
          toType: 'file'
        }
      ]
    })
  ]
};
