const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const combineLoaders = require('webpack-combine-loaders');
const autoprefixer = require('autoprefixer');

module.exports = {
  entry: [
    // 'es6-promise',
    // 'babel-polyfill',
    // 'whatwg-fetch',
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
    }),
    new webpack.DefinePlugin({
      'process.env':{
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new ExtractTextPlugin('app.css')
    // new webpack.optimize.UglifyJsPlugin({
    //   compress:{
    //     warnings: true
    //   }
    // })
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
        exclude: path.resolve('node_modules/'),
        loader: 'babel-loader',
        query: {
          presets: ['react', 'es2015']
        }
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      // {
      //   test: /\.js$/,
      //   include: path.resolve('node_modules/mapbox-gl-shaders/index.js'),
      //   loader: 'transform/cacheable?brfs'
      // },
      {
        test: [/\.yml$/, /\.yaml$/],
        loader: 'json!yaml'
      },
      // process custom css (in src/styles) as CSS modules
      {
        test: /\.css$/,
        include: path.resolve('src/styles'),
        loader: ExtractTextPlugin.extract(
          'style',
          combineLoaders([{
            loader: 'css',
            query: {
              modules: true,
              localIdentName: '[name]__[local]___[hash:base64:5]',
              importLoaders: 1
            }
          }, {
            loader: 'postcss'
          }])
        )
      },
      // process other css (like vendors) normally
      {
        test: /\.css$/,
        exclude: path.resolve('src/styles'),
        loader: ExtractTextPlugin.extract('style', 'css')
      }
    ]
    // postLoaders: [{
    //   include: /node_modules\/mapbox-gl-shaders/,
    //   loader: 'transform',
    //   query: 'brfs'
    // }]
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  postcss() {
    return [
      autoprefixer({ browsers: ['last 2 versions'] })
    ];
  }
};
