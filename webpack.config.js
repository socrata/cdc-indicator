module.exports = {
  entry: "./src/app.js",
  output: {
    filename: "./js/app.js"
  },
  watch: true, // Webpack will watch your files and when one of them changes, it will immediately rerun the build and recreate your output file.
  module: {
    loaders: [
      {
        test: [/\.js$/, /\.jsx$/],
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['react', 'es2015']
        }
      }
    ]
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
}