const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: [
    'whatwg-fetch',
    './src/index.jsx'
  ],
  output: {
    filename: 'app.js',
    path: path.join(__dirname, 'build')
  },
  // Webpack will watch your files and when one of them changes,
  // it will immediately rerun the build and recreate your output file.
  watch: true,
  plugins: [
    // new webpack.HotModuleReplacementPlugin(),
    // new webpack.NoErrorsPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'src/index.template.html',
      inject: true
    })
  ],
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
      },
      {
        test: /\.js$/,
        include: path.resolve('node_modules/mapbox-gl-shaders/index.js'),
        loader: 'transform/cacheable?brfs'
      },
      {
        test: /\.css$/,
        loaders: ['style', 'css']
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
};
