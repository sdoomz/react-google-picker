var path = require('path');

module.exports = {
  devtool: 'source-map',
  entry: [
    './demo/app'
  ],
  output: {
    path: path.join(__dirname, 'demo'),
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['babel'],
      include: path.join(__dirname, 'demo')
    }]
  }
};
