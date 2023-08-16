const { join } = require('path');
// -----------plugins-------------
// 1. 配置自动清理插件（在打包的时候，插件就会自动清理 dist(输出文件夹) 中没用的文件）
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// 2、HTML插件（自动把生成的bundle.js文件注入到html页面中（可自定义html模板页面），并且把html文件放在输出文件夹中）
const HtmlWebpackPlugin = require('html-webpack-plugin');
// -----------plugins-------------


// 导出webpack配置对象
module.exports = {
  // 配置的打包模式
  mode: 'development', // development--开发模式，production--生产模式
  // 入口文件
  entry: join(__dirname, 'src', 'index.js'),
  // 出口文件
  output: {
    path: join(__dirname, 'dist'),
    filename: 'js/bundle.js',
    assetModuleFilename: 'images/[hash:8][ext]', // asset资源文件的输出路径
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: join(__dirname, 'public', 'index.html'), // 模板html文件
      filename: 'index.html', // 打包生成的html文件名称
    })
  ],
  devServer: {
    open: true, // 可以让 webpack 监听项目源代码的变化，从而进行自动打包构建，要在package.json的 scripts 中新增一个命令"serve": "webpack serve"
  },
  module: {
    rules: [
      // 处理css文件
      {
        test: /\.css$/, // 匹配的文件类型--css文件
        use: ['style-loader', 'css-loader'], // 调用的loader
      },
      // 处理less文件
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader'],
      },
      // 处理html中img标签引入的图片
      {
        test: /\.html$/,
        use: ['html-loader'],
      },
      // 处理图片资源，例如在js中导入、css中引用的图片
      {
        test: /\.(jpg|png|gif)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 12000, // 图片超过这个大小，使用原图片，否则使用base64字符串
          }
        }
      },
      // js语法转换处理
      {
        test: /\.js$/,
        use: 'babel-loader',
        // .js 文件使用 babel-loader去处理。但是不要处理 node_moduels文件夹中的第三方模块
        exclude: /node_modules/,
      },
    ],
  },
  // source-map 仅限在开发模式中使用
  //（开发中，程序员需要排错，需要准确的定位错误行号）
  devtool: 'source-map',
}