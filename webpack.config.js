const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const __ENV__ = process.env.NODE_ENV || 'development';
const __PROD__ = __ENV__ !== 'development';
const __DEV__ = __ENV__ === 'development';
const __REDUX_DEV__ = __DEV__; // && false;

console.log(`NODE_ENV set to ${__ENV__}`);

// common webpack configurations for both build and webpack-dev-server
const webpackConfig = {
  entry: {
    app: ['./src/main.jsx'],
    polyfills: (__PROD__) ? ['es6-promise', 'babel-polyfill', 'whatwg-fetch'] : []
  },
  output: {
    filename: '[name].js',
    path: path.resolve('build'),
    publicPath: '/cdc-indicator',
    jsonpFunction: 'cdcIndicatorApp'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$|\.js$/,
        enforce: 'pre',
        exclude: [
          /node_modules/
        ],
        include: [path.resolve('./src/')],
        loader: 'eslint-loader'
      },
      {
        test: /\.jsx?$|\.js$/,
        include: [path.resolve('./src/')],
        loader: 'babel-loader'
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.yml?$|\.yaml$/,
        loader: ['json-loader', 'yaml-loader']
      },
      {
        // this one doesn't use css modules
        test: /\.css$|\.scss$/,
        include: path.resolve('./src/index.css'),
        // enable ExtractTextPlugin for production
        use: (__PROD__)
          ? ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
              {
                loader: 'css-loader',
                options: {
                  minimize: true,
                  importLoaders: 2
                }
              },
              { loader: 'postcss-loader' },
              {
                loader: 'sass-loader',
                options: {
                  includePaths: ['src/styles']
                }
              }
            ]
          })
          // indentation here is technically wrong, but this is easier to see
          : [
              { loader: 'style-loader' },
              {
                loader: 'css-loader',
                options: {
                  sourceMap: true,
                  importLoaders: 2
                }
              },
              {
                loader: 'postcss-loader',
                options: { sourceMap: true }
              },
              {
                loader: 'sass-loader',
                options: {
                  sourceMap: true,
                  includePaths: ['src/styles']
                }
              }
            ]
      },
      {
        // this one uses css modules
        test: /\.css$|\.scss$/,
        include: path.resolve('./src/styles'),
        exclude: path.resolve('./src/index.css'),
        use: (__PROD__)
          ? ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
              {
                loader: 'css-loader',
                options: {
                  modules: true,
                  minimize: true,
                  importLoaders: 2,
                  localIdentName: '[name]__[local]__[hash:base64:5]'
                }
              },
              { loader: 'postcss-loader' },
              {
                loader: 'sass-loader',
                options: {
                  includePaths: ['src/styles']
                }
              }
            ]
          })
          // in DEV, skip ExtractTextPlugin and enable sourceMap
          : [
              { loader: 'style-loader' },
              {
                loader: 'css-loader',
                options: {
                  sourceMap: true,
                  modules: true,
                  importLoaders: 2,
                  localIdentName: '[name]__[local]__[hash:base64:5]'
                }
              },
              {
                loader: 'postcss-loader',
                options: { sourceMap: true }
              },
              {
                loader: 'sass-loader',
                options: {
                  sourceMap: true,
                  includePaths: ['src/styles']
                }
              }
            ]
      },
      // process vendor CSS w/o CSS Modules or SASS
      {
        test: /\.css$/,
        include: path.resolve('./node_modules'),
        use: (__PROD__)
          ? ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
              { loader: 'css-loader' }
            ]
          })
          : [
              { loader: 'style-loader' },
              { loader: 'css-loader' }
            ]
      }
    ]
  },
  // Common plugins
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(__ENV__)
      },
      __CONFIG__: JSON.stringify(process.env.CONFIG),
      __DEV__: JSON.stringify(__DEV__),
      __REDUX_DEV__: JSON.stringify(__REDUX_DEV__)
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'src/index.template.html',
      inject: true
    })
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: [
      'src',
      'node_modules'
    ],
    alias: {
      react: path.resolve('./node_modules/react')
    }
  },
  stats: {
    children: false, // suppress extract plugin logs
    colors: true
  }
};

// Customizations based on environment

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
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        unused: true,
        dead_code: true,
        drop_console: true,
        warnings: false,
        comparisons: false
      },
      output: {
        comments: false
      }
    })
  );

// add live development support plugins
} else {
  webpackConfig.plugins.push(
    new webpack.NamedModulesPlugin()
    // new webpack.NoErrorsPlugin(),
  );
}

// Set watch to true for hot loading
if (__DEV__) {
  webpackConfig.entry.app.unshift('react-hot-loader/patch');
  webpackConfig.watch = true;
}

module.exports = webpackConfig;
