const path = require('path');

module.exports = {
  entry: "./src/app.js",
  output: {
    filename: "./js/app.js"
  },
  watch: true, // Webpack will watch your files and when one of them changes, it will immediately rerun the build and recreate your output file.
  module: {
    preLoaders: [
      {
        test: /\.jsx?$|\.js$/,
        exclude: /node_modules/,
        include: /src/,
        loaders: ['eslint'],
      }
    ],
    loaders: [
      {
        test: [/\.js$/, /\.jsx$/],
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['react', 'es2015']
        }
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      }, {
        test: /\.js$/,
        include: path.resolve('node_modules/mapbox-gl-shaders/index.js'),
        loader: 'transform/cacheable?brfs'
      }],
      postLoaders: [{
        include: /node_modules\/mapbox-gl-shaders/,
        loader: 'transform',
        query: 'brfs'
      }
    ]
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
}