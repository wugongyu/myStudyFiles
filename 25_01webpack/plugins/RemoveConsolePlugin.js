class RemoveConsolePlugin {
  // constructor() {}
  apply(compiler) {
    // 通过compiler获取webpack构建过程中的一些hooks, 
    // emit这个hook的执行时期为：输出asset到output目录之前执行
    compiler.hooks.emit.tapAsync('RemoveConsolePlugin', 
    // compilation能够访问到所有的模块和他们的依赖
    (compilation, callback) => {
      // compilation.assets获取到的是所有被处理过的文件
      Object.keys(compilation.assets).forEach((fileName) => {
        // 仅筛选出js文件
        if(fileName.endsWith('.js')) {
          const asset = compilation.assets[fileName];
          let content = asset.source(); // asset.source() 来获取文件的源代码
          // 使用正则表达式移除整个 console.log 语句
          // 打包压缩后的console.log代码格式：console.log("TOML Example"),console.log(v(1)),
          // 匹配 console.log( 之后的任意字符，直到遇到闭合的括号
          // 使用正则表达式移除整个 console.log 语句
          /*
          【注意】这里的正则并不全面，有些console.log()语句,比如括号有换行的就没法正确匹配出来，
          所以这里不该用正则，用语法树解析完以后 walk 一遍，把 console 调用都删了才是正解
          */ 
          // const consoleLogRegex = new RegExp(
          //   "console\\.log\\(.*?\\)(,|$)",
          //   "g"
          // );
          // const withoutConsoleContent = content.replace(consoleLogRegex, '');
          // compilation.assets[fileName] = {
          //   source: () => withoutConsoleContent,
          //   size: () => Buffer.byteLength(withoutConsoleContent, 'utf8'),
          // }
        }
      });
      callback();
    })
  }
}

module.exports = RemoveConsolePlugin;