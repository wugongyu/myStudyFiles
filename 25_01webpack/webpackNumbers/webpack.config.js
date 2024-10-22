const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'webpack-numbers.js',
    library: {
      name: 'webpackNumbers',
      type: 'umd', //webpack 将打包它，使其可以通过 CommonJS、AMD 模块以及脚本标签使用
    }, // output.library 配置项暴露从入口起点导出的内容
  },
  // 外部化lodash：库需要一个名为 lodash 的依赖，这个依赖在开发者环境中必须存在且可用。
  externals: {
    lodash: {
      commonjs: 'lodash',
      commonjs2: 'lodash',
      amd: 'lodash',
      root: '_'
    }
  }
}