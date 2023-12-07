# next.js + react project
[Next.js了解篇](https://juejin.cn/post/7206261082452639802)
[Next14](https://juejin.cn/post/7294954501575753743?searchId=20231205165912A0900489C42902404D90)
[Next.js 项目最佳实践](https://juejin.cn/post/7194410416879960125?searchId=2023120515092940DC2F696A9EB0320570)
[studyProject](https://github.com/zidanDirk/nextjs-fullstack-app-template-zn)

## Turbopack
- turbopack--一款通过rust制作的快速打包工具，
  其号称打包速度比webpack快700倍，比vite快10倍。
  turbopack是webpack的继承者。
  在next.js13中，turbopack为默认的打包工具。

- turbopack 的功能和特点
  https://juejin.cn/post/7194970654716723255?searchId=202312051719458533653391D359426E4A
  增量计算和函数级别的缓存。
  按需编译（webpack为全量编译）。
  SWC编译器--SWC 是一款 Rust 编写的 Javascript 代码编译器，官方宣称其编译速度是 Babel 的 20 倍（ Webpack 也可以使用SWC），大部分webpack是使用babel做编译和转换。
  本地持久化。
  imports---Turbopack 支持 CommonJS、ESM， 部分支持 AMD
  原生支持jsx\tsx

  缺点： turbopack生态不够完善，功能也不健全，目前只是服务于react框架

