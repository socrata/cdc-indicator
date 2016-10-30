'use strict';

const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const cssnano = require('cssnano');

const __ENV__ = process.env.NODE_ENV || 'development';
const __PROD__ = 'production' === __ENV__;

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
          presets: ['react', 'es2015']
        }
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: [/\.yml$/, /\.yaml$/],
        loader: 'json!yaml'
      }
    ]
  },
  output: {
    filename: '[name].js',
    path: path.resolve('build')
  },
  // Common plugins
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(__ENV__)
      }
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'src/index.template.html',
      inject: true
    })
  ],
  resolve: {
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
  app: (__PROD__) ?
    ['es6-promise', 'babel-polyfill', 'whatwg-fetch', APP_ENTRY] :
    [APP_ENTRY]
};

/**
 * Plugins
 */
// add optimizations for production
if (__PROD__) {
  webpackConfig.plugins.push(
    // extract CSS modules to a separate file
    new ExtractTextPlugin('[name].css', {
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
const BASE_CSS_LOADER = 'css?sourceMap&-minimize';
const CSS_MODULE = '&modules&localIdentName=[name]__[local]___[hash:base64:5]&importLoaders=0';
const styleLoaders = [
  // process custom css (in src/styles) as CSS modules
  {
    test: /\.css$/,
    include: path.resolve('src/styles'),
    loaders: ['style', `${BASE_CSS_LOADER}${CSS_MODULE}`],
    __cssModules: true
  },
  // process other css (like vendors) normally
  {
    test: /\.css$/,
    exclude: path.resolve('src/styles'),
    loaders: ['style', BASE_CSS_LOADER],
  }
];

// Enable ExtractTextPlugin and postcss on production
if (__PROD__) {
  styleLoaders.forEach((styleLoader) => {
    let [first, ...rest] = styleLoader.loaders;

    // find css-loader so we can add right 'importLoaders' parameter for CSS Modules
    if (styleLoader.__cssModules) {
      rest = [].concat(rest).map((loader) => {
        if (/^css/.test(loader.split('?')[0])) {
          const [name, params] = loader.split('?', 2);
          const newParams = params.split('&').map((param) => {
            if ('importLoaders' === param.split('=')[0]) {
              return `importLoaders=${rest.length}`;
            }
            return param;
          });
          return `${name}?${newParams.join('&')}`;
        }
        return loader;
      });
      delete styleLoader.__cssModules;
    }

    // add postcss loader (joined later)
    rest.push('postcss');

    // enable ExtractTextPlugin
    styleLoader.loader = ExtractTextPlugin.extract(first, rest.join('!'));
    delete styleLoader.loaders;
  });

  webpackConfig.postcss = [
    cssnano({
      autoprefixer : {
        add      : true,
        remove   : true,
        browsers : ['last 2 versions']
      },
      discardComments : {
        removeAll : true
      },
      discardUnused : false,
      mergeIdents   : false,
      reduceIdents  : false,
      safe          : true,
      sourcemap     : true
    })
  ];
}

webpackConfig.module.loaders.push(...styleLoaders);

// Dev only - support hot reloading
if (!__PROD__) {
  webpackConfig.watch = true;
}

module.exports = webpackConfig;
