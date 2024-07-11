# 响应式布局
  合理利用屏幕空间，完成响应式、自适应屏幕设计。
## 目的
  同一套页面代码实现移动端、pc端的页面布局自适应。
## 总结
  用@media，zoom做适配；需要移动端的项目用栅格适配，字体用rem；大屏项目固定宽高比，动态计算scale进行缩放适配。同时可以搭配一些即有的自适应布局的css框架（如tailwindcss）来完成开发。

## css grid网格布局
[CSS Grid 网格布局教程-阮一峰](https://www.ruanyifeng.com/blog/2019/03/grid-layout-tutorial.html)
[学习链接](https://juejin.cn/post/7208484366955085883?searchId=20231116153849D49FB32B2AA2461CFB23)

要使用 CSS Grid，必须用 display: grid 定义一个容器元素为网格，用 grid-template-columns 和 grid-template-rows 设置列和行的大小，然后用 grid-column 和 grid-row 将其子元素放入网格。

- grid-template-columns grid-template-rows
  grid-template-columns属性定义每一列的列宽，grid-template-rows属性定义每一行的行高。
 - 可选的值：

  - <track-size>：可以是一个长度、一个百分比，或者使用 fr 单位表示网格中自由空间的一部分
  - <line-name>：一个你选择的任意的名字

  - fr关键字
    fr为fraction 的缩写，意为"片段"
    fr可用空间,指的是非弹性项目之外的空间，它允许你将轨道的大小设置为网格容器自由空间的一部分。
    如：.container {
        grid-template-columns: 1fr 50px 1fr 1fr;
        grid-template-columns: repeat(3, 33.33%);
      } 
      // 其中fr 单位表示可用的空间指的是除50px之外的空间
  - repeat()
      // repeat()接受两个参数，第一个参数是重复的次数（上例是3），第二个参数是所要重复的值。

## css flex布局
[阮一峰flex布局](https://www.ruanyifeng.com/blog/2015/07/flex-grammar.html)