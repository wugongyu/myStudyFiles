const path = require('path');
const toml = require('toml');
const yaml = require('yamljs');
const json5 = require('json5');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: {
    index: './src/index.js',
    // another: './src/another-module.js',
    // 在配置文件中配置 dependOn 选项，以在多个 chunk 之间共享模块
    // index: {
    //   import: './src/index.js',
    //   dependOn: 'shared'
    // },
    // another: {
    //   import: './src/another-module.js',
    //   dependOn: 'shared',
    // },
    // shared: 'lodash',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true, // 构建前清理dist文件夹
  },
  devServer: {
    static: './dist', //  将 dist 目录下的文件作为可访问资源部署在 localhost:8080
  },
  // 想要在一个 HTML 页面上使用多个入口起点，还需设置 optimization.runtimeChunk: 'single'
  // optimization: {
  //   // runtimeChunk: 'single',
  //   // 公共依赖，多入口均单独打包
  //   splitChunks: {
  //     chunks: 'all',
  //   }
  // },
  plugins: [
    new HtmlWebpackPlugin({})
  ],
  module: {
    rules: [
      // 处理css文件
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      // 处理图片文件（包括css引入的图片资源），使用webpack5 内置的 资源模块 
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
}