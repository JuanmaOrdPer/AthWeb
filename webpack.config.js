const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  mode: isProduction ? 'production' : 'development',
  entry: {
    main: './src/js/main.js'
  },
  output: {
    filename: isProduction ? 'js/[name].[contenthash].js' : 'js/[name].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    clean: true,
    assetModuleFilename: 'assets/[hash][ext][query]'
  },
  
  devtool: isProduction ? 'source-map' : 'eval-source-map',
  
  module: {
    rules: [
      // JavaScript/ES6+
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: {
                  browsers: ['> 1%', 'last 2 versions']
                }
              }]
            ]
          }
        }
      },
      
      // CSS
      {
        test: /\.css$/i,
        use: [
          isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              sourceMap: true
            }
          }
        ]
      },
      
      // Imágenes
      {
        test: /\.(png|jpe?g|gif|svg|webp)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name].[hash][ext]'
        }
      },
      
      // Fuentes
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name].[hash][ext]'
        }
      },
      
      // Otros archivos
      {
        test: /\.(pdf|doc|docx)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/docs/[name].[hash][ext]'
        }
      }
    ]
  },
  
  plugins: [
    // Limpiar directorio de salida
    new CleanWebpackPlugin(),
    
    // Generar HTML
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      inject: 'body',
      minify: isProduction ? {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      } : false
    }),
    
    // Extraer CSS
    new MiniCssExtractPlugin({
      filename: isProduction ? 'styles/[name].[contenthash].css' : 'styles/[name].css',
      chunkFilename: isProduction ? 'styles/[id].[contenthash].css' : 'styles/[id].css'
    }),
    
    // Copiar archivos estáticos
    new CopyPlugin({
      patterns: [
        {
          from: 'public',
          to: '.',
          noErrorOnMissing: true,
          globOptions: {
            ignore: ['**/index.html']
          }
        }
      ]
    })
  ],
  
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.css'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@js': path.resolve(__dirname, 'src/js'),
      '@components': path.resolve(__dirname, 'src/js/components'),
      '@services': path.resolve(__dirname, 'src/js/services'),
      '@utils': path.resolve(__dirname, 'src/js/utils'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@assets': path.resolve(__dirname, 'src/assets')
    },
    modules: ['node_modules']
  },
  
  // Configuración del servidor de desarrollo
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
      publicPath: '/'
    },
    compress: true,
    port: 3000,
    host: 'localhost',
    hot: true,
    open: true,
    historyApiFallback: {
      index: '/index.html',
      disableDotRule: true
    },
    client: {
      logging: 'warn',
      overlay: {
        errors: true,
        warnings: false
      },
      progress: true
    },
    devMiddleware: {
      writeToDisk: false
    }
  },
  
  // Optimización
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 5,
          reuseExistingChunk: true
        }
      }
    },
    runtimeChunk: {
      name: 'runtime'
    }
  },
  
  // Configuración de rendimiento
  performance: {
    hints: isProduction ? 'warning' : false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  },
  
  // Estadísticas
  stats: {
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false
  }
};