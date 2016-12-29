var path = require('path');
var webpack = require('webpack');
var express = require('express');
var config = require('./webpack.config');

var app = express();
var compiler = webpack(config);

app.use(require('webpack-dev-middleware')(compiler, {
  publicPath: config.output.publicPath
}));

app.use(express.static('demo'))

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'demo/index.html'));
});

app.listen(8080, function(err) {
  if (err) {
    return console.error(err);
  }

  console.log('Listening at http://localhost:8080/');
});
