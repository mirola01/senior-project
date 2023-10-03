const path = require('path');

module.exports = {
  mode: 'development',
  entry: './dist/scripts/auth.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
};
