const path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'development',
  entry: path.join(__dirname, '../demo/main.js'),

  devtool: 'cheap-module-eval-source-map',

  resolve: {
    extensions: ['.js', '.vue'],
    alias: {
      '@': path.join(__dirname, '../src')
    }
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env'
              ]
            ],
            plugins: [
              ['@babel/plugin-transform-runtime'],
              ['@babel/plugin-transform-modules-umd']
            ]
          }
        }
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          {
            loader: 'css-loader',
            options: {
              esModule: false
            }
          }
        ]
      },
      {
        test: /\.scss$/,
        use: [
          'vue-style-loader',
          {
            loader: 'css-loader',
            options: {
              esModule: false
            }
          },
          {
            loader: 'sass-loader',
            options: {

            }
          }
        ]
      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '../demo/index.html')
    }),
    new VueLoaderPlugin()
  ],

  devServer: {
    hot: true,
    open: true,
    allowedHosts: ['csb.app'],
    disableHostCheck: true
  },

  optimization: {
    minimize: false
  }
}
