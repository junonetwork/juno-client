/* eslint-disable import/no-extraneous-dependencies */
const webpack             = require('webpack');
const path                = require('path');
const HtmlWebpackPlugin   = require('html-webpack-plugin');
const CopyWebpackPlugin   = require('copy-webpack-plugin');
const childProcess        = require('child_process');


const HOST = 'localhost'; // '0.0.0.0';
const PORT = process.env.PORT || 4000;
const DEV_PROXY = process.env.DEV_PROXY || 'http://localhost';


module.exports = {
  entry: {
    app: [
      'babel-polyfill',
      './app/index.jsx',
    ],
  },

  // output: {
  //   path: path.join(__dirname, 'dist'),
  //   publicPath: '/',
  //   filename: 'index.js',
  // },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: path.join(__dirname, 'app'),
        use: ['babel-loader'],
      },
      {
        test: /\.scss$/,
        include: path.join(__dirname, 'app'),
        loader: 'style-loader!css-loader!sass-loader?sourceMap',
      },
      {
        test: /\.(woff2?|svg)$/,
        loader: 'url-loader?limit=10000',
      },
      {
        test: /\.html$/,
        use: [{ loader: 'html-loader', options: { minimize: true, }, }],
      },
    ],
  },

  plugins: [
    // new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({ template: 'app/index.html', }),
    new CopyWebpackPlugin([{ from: 'app/assets', to: 'assets', }]),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
      'process.env.__GIT_DESCRIPTION__': JSON.stringify(
        childProcess.execSync('git describe --always').toString()
      ),
    }),
    // new webpack.NamedModulesPlugin(),
  ],

  // devtool: 'eval-source-map',

  devServer: {
    contentBase: './dist',
    host: HOST,
    port: PORT,
    historyApiFallback: true,
    hot: true,
    inline: true,
    clientLogLevel: 'none',
    stats: 'errors-only',
    proxy: {
      '/api/*': {
        target: DEV_PROXY,
        secure: false,
        changeOrigin: true,
      },
    },
  },

  resolve: {
    extensions: ['.js', '.jsx', '.json', '.scss'],
  },
};
