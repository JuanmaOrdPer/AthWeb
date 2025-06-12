const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

// Configuración de rutas base
const srcPath = path.resolve(__dirname, 'src');
const jsPath = path.join(srcPath, 'js');

module.exports = {
  entry: './src/js/main.js',
  output: {
    filename: 'js/[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[hash][ext][query]',
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[hash][ext][query]',
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      inject: 'body',
      publicPath: '/',
    }),
    new MiniCssExtractPlugin({
      filename: 'styles/[name].css',
      chunkFilename: 'styles/[id].css',
    }),
    new CopyPlugin({
      patterns: [
        { 
          from: 'src/styles', 
          to: 'styles',
          noErrorOnMissing: true,
          globOptions: {
            ignore: ['**/*.scss'],
          },
        },
        { 
          from: 'src/assets', 
          to: 'assets',
          noErrorOnMissing: true,
        },
        {
          from: 'public',
          to: '.',
          noErrorOnMissing: true,
        }
      ],
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
      publicPath: '/',
    },
    compress: true,
    port: 3000,
    hot: true,
    historyApiFallback: {
      index: '/index.html',
      disableDotRule: true,
    },
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.css'],
    alias: {
      // Usar @/ para rutas absolutas desde src/
      '@': srcPath,
      // Alias específicos para mejor claridad
      '@js': jsPath,
      '@components': path.join(jsPath, 'components'),
      '@services': path.join(jsPath, 'services'),
      '@utils': path.join(jsPath, 'utils'),
      '@styles': path.join(srcPath, 'styles'),
      '@assets': path.join(srcPath, 'assets')
    },
    modules: [
      'node_modules',
      path.resolve(__dirname, 'node_modules')
    ]
  },
};
