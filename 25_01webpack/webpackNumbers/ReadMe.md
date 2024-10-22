# package creating by webpack

  [publish npm package](https://docs.npmjs.com/getting-started/publishing-npm-packages)

## webpack 配置注意项

1. 注意webpack打包的输出配置
  对 output.library进行设置

2. 对于外部库进行外部话
  对externals 进行相关设置

## 将包添加为标准模块

```json
{
  ...
  "module": "src/index.js",
  ...
}
```
