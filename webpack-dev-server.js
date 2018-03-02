const config = require('./webpack.config.js');

config.devServer = {
  host: '0.0.0.0',
  port: 8080,
  disableHostCheck: true,
  historyApiFallback: true,
  compress: true,
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000
  }
};

module.exports = config;
