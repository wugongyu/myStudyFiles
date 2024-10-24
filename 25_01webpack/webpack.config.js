const path = require('path');
const toml = require('toml');
const yaml = require('yamljs');
const json5 = require('json5');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin'); // 可以打包压缩js文件
const RemoveConsolePlugin = require('./plugins/RemoveConsolePlugin'); // 自定义去除console.log插件

module.exports = (env) => {
  console.log('env', env);
  return {
    mode: env.production ? 'production' : 'development',
    entry: {
      index: './src/index.js',
    },
    output: {
      filename: '[name].[contenthash].js', // [contenthash] 将根据资源内容创建唯一哈希值。当资源内容发生变化时，[contenthash] 也会发生变化
      path: path.resolve(__dirname, 'dist'),
      clean: true, // 构建前清理dist文件夹
    },
    devServer: {
      static: './dist', //  将 dist 目录下的文件作为可访问资源部署在 localhost:8080
    },
    // 想要在一个 HTML 页面上使用多个入口起点，还需设置 optimization.runtimeChunk: 'single'
    optimization: {
      runtimeChunk: 'single', // 它还会将 runtime 代码拆分为一个单独的 chunk
      // 将第三方库提取到单独的 vendor chunk
      splitChunks: {
        // chunks: 'all', // 公共依赖，多入口均单独打包
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          }
        }
      },
      minimize: !!env.production, // 生产环境压缩代码
      minimizer: [
        // 利用插件压缩代码，去除console
        new TerserWebpackPlugin({
          terserOptions: {
            compress: {
              drop_console: true, // 删除console
            }
          }
        })
      ]
    },
    plugins: [
      // new RemoveConsolePlugin(),
      new HtmlWebpackPlugin({}),
    ],
    module: {
      rules: [
        // 处理css文件
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        },
        // 处理图片文件（包括css引入的图片资源）--使用webpack5 内置的 资源模块 
        {
          test: /\.(png|jpg|jpeg|svg|gif)$/i,
          type: 'asset/resource',
        },
        // 处理字体文件
        {
          test: /\.(woff|woff2|eto|ttf|otf)$/i,
          type: 'asset/resource',
        },
        {
          test: /\.(csv|tsv)$/i,
          use: ['csv-loader'],
        },
        {
          test: /\.xml$/i,
          use: ['xml-loader'],
        },
        // 自定义处理json模块（将任何 toml、yaml 或 json5 文件作为 JSON 模块导入）
        {
          test: /\.toml$/i,
          type: 'json',
          parser: {
            parse: toml.parse,
          },
        },
        {
          test: /\.yaml$/i,
          type: 'json',
          parser: {
            parse: yaml.parse,
          }
        },
        {
          test: /\.json5$/i,
          type: 'json',
          parser: {
            parse: json5.parse,
          }
        }
      ]
    }
  };
}