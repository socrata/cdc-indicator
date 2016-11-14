'use strict';

const webpack = require('webpack');
const path = require('path');
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const __ENV__ = process.env.NODE_ENV || 'development';
const __PROD__ = __ENV__ === 'production';
const __DEV__ = __ENV__ === 'development';
const __REDUX_DEV__ = false;

console.log(`NODE_ENV set to ${__ENV__}`);

// common webpack configurations for both build and webpack-dev-server
const webpackConfig = {
  module: {
    preLoaders: [
      {
        test: /\.jsx?$|\.js$/,
        exclude: /node_modules/,
        include: /src/,
        loaders: ['eslint'],
      }
    ],
    // add JavaScript/JSON/YAML loaders
    loaders: [
      {
        test: [/\.js$/, /\.jsx$/],
        exclude: path.resolve('node_modules'),
        loader: 'babel-loader',
        query: {
          presets: ['react', 'es2015', 'stage-0']
        }
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: [/\.yml$/, /\.yaml$/],
        loader: 'json!yaml'
      },
      {
        test: [/\.css$/],
        include: path.resolve('./src'),
        exclude: path.resolve('./src/index.css'),
        loaders: [
          'style',
          'css?sourceMap&modules&localIdentName=[name]__[local]___[hash:base64:5]&importLoaders=1',
          'postcss'
        ]
      },
      {
        test: [/\.css$/],
        include: path.resolve('./src/index.css'),
        loaders: [
          'style',
          'css?sourceMap&importLoaders=1',
          'postcss'
        ]
      },
      // process vendor CSS w/o CSS Modules or SASS
      {
        test: /\.css$/,
        include: path.resolve('./node_modules'),
        loaders: [
          'style',
          'css?sourceMap'
        ]
      }
    ]
  },
  output: {
    filename: '[name].js',
    path: path.resolve('build'),
    publicPath: '/'
  },
  // Common plugins
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(__ENV__)
      },
      __DEV__: JSON.stringify(__DEV__),
      __REDUX_DEV__: JSON.stringify(__REDUX_DEV__)
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'src/index.template.html',
      inject: true
    })
  ],
  postcss: [
    autoprefixer({
      browsers: ['last 2 versions']
    })
  ],
  resolve: {
    root: [
      path.resolve('src')
    ],
    extensions: ['', '.js', '.jsx'],
    root: path.resolve('src')
  }
};

// Customizations based on environment

/**
 * Entry Points
 */
const APP_ENTRY = './src/main.jsx';
// add polyfills to production code
webpackConfig.entry = {
  app: [APP_ENTRY]
};

if (__PROD__) {
  webpackConfig.entry.polyfills = ['es6-promise', 'babel-polyfill', 'whatwg-fetch'];
}

/**
 * Plugins
 */
// add optimizations for production
if (__PROD__) {
  webpackConfig.plugins.push(
    // extract CSS modules to a separate file
    new ExtractTextPlugin('_[name].css', {
      allChunks: true
    }),
    // optimize output JS
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        unused    : true,
        dead_code : true,
        warnings  : false
      }
    })
  );

// add live development support plugins
} else {
  webpackConfig.plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  );
}

/**
 * Style Loaders
 */
// Enable ExtractTextPlugin for production
if (__PROD__) {
  // find loaders that contain 'css' loader
  webpackConfig.module.loaders.filter(loader =>
    loader.loaders && loader.loaders.find(name => /^css/.test(name.split('?')[0]))
  ).forEach((loader) => {
    let [first, ...rest] = loader.loaders;
    // enable ExtractTextPlugin and remove 'loaders' key
    loader.loader = ExtractTextPlugin.extract(first, rest.join('!'));
    delete loader.loaders;
  });
}

// Set watch to true for hot loading
if (__DEV__) {
  webpackConfig.watch = true;
}

module.exports = webpackConfig;
