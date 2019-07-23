const path = require('path')

const webpack = require('webpack')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
// const overrideAntdThemeStyle = require('../ant');
const HappyPack = require('happypack')
const os = require('os')
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length })

const YSY = /^YSY_/i

const ysy = process.env.NODE_YSY

const envPath = `.env.${ysy}`

require('dotenv').config({ path: envPath })

const raw = Object.keys(process.env)
  .filter(key => YSY.test(key))
  .reduce(
    (env, key) => {
      env[key] = process.env[key]
      return env
    },
    { NODE_ENV: process.env.NODE_ENV }
  )

const stringified = {
  'process.env': Object.keys(raw).reduce((env, key) => {
    env[key] = JSON.stringify(raw[key])
    return env
  }, {})
}

// console.log(process.env,'process.env')
// return

module.exports = {
  entry: ['./src/index.js'],

  output: {
    // 输出目录
    path: path.resolve(__dirname, '../build'),
    publicPath:process.env.YSY_PUBLIC,
    filename: 'static/js/[name].[contenthash:8].js',
    chunkFilename: 'static/js/[name].[contenthash:8].chunk.js'
  },
  resolve: {
    modules: ['node_modules', path.resolve(__dirname, '../src')],
    extensions: ['.js', '.jsx']
    // alias: {
    //     "@": path.resolve(__dirname, "../src"),
    //     pages: path.resolve(__dirname, "../src/pages"),
    //     router: path.resolve(__dirname, "../src/router")
    // }
  },
  module: {
    rules: [
      {
        // cnpm i babel-loader @babel/core @babel/preset-env -D
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'happypack/loader?id=happyBabel'
        }
      },
      {
        test: /\.(sc|sa|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader', // 编译css
          'postcss-loader', // 使用 postcss 为 css 加上浏览器前缀
          'sass-loader' // 编译scss
        ]
      },
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader', // 编译css
          'postcss-loader', // 使用 postcss 为 css 加上浏览器前缀
          {
            loader: 'less-loader',
            // options: {
            //   modifyVars:overrideAntdThemeStyle,
            //   javascriptEnabled: true
            // }
          }
        ]
      },
      {
        test: /\.(png|jpg|jpeg|gif)/,
        use: {
          loader: 'url-loader',
          options: {
            name: '[name].[contenthash:5].[ext]',
            outputPath: 'static/images/', // 图片输出的路径
            limit: 5 * 1024
          }
        }
      },
      {
        test: /\.(eot|woff2?|ttf|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: '[name]-[contenthash:5].min.[ext]',
              limit: 5000, // fonts file size <= 5KB, use 'base64'; else, output svg file
              outputPath: 'static/fonts/'
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.DefinePlugin(stringified),
    new CopyWebpackPlugin([{
      from:path.resolve(__dirname, '../public/model'),
      to:path.resolve(__dirname, '../build/model')
    }]),
    new HtmlWebpackPlugin({
      filename: 'index.html', // 最终创建的文件名
      // chunksSortMode: 'none',
      template: path.resolve(__dirname, '../public/template.html'), // 指定模板路径
      minify: {
        collapseWhitespace: true // 去除空白
      }
    }),
    // happypack
    new HappyPack({
      //用id来标识 happypack处理那里类文件
      id: 'happyBabel',
      //如何处理  用法和loader 的配置一样
      loaders: [
        {
          loader: 'babel-loader',
          cache: true,
          options: {
            // outputPath:'js/'
          }
        }
      ],
      //共享进程池threadPool: HappyThreadPool 代表共享进程池，即多个 HappyPack 实例都使用同一个共享进程池中的子进程去处理任务，以防止资源占用过多。
      threadPool: happyThreadPool,
      //允许 HappyPack 输出日志
      verbose: true
    }),
    // css单独提取
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].[contenthash:5].css',
      chunkFilename: 'static/css/[name].[contenthash:5].css'
    })
  ],
  performance: false // 关闭性能提示
}
