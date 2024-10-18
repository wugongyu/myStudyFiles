const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
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
      }
    ]
  }
}