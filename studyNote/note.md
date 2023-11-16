## 策略模式

1. 概念
  策略模式是一种行为型设计模式，它允许在运行时根据不同的情况选择算法的行为。
  定义一系列算法，把它们一个个封装起来，并且使它们可以相互替换。
  简而言之，即在使用if-else的时候，使用key-value数组/对象来替代。

2. 设计策略模式需考虑的几方面

    - 可扩展性
      使用class的工厂模式，内部通过缓存 key value 数组和添加 类似于 addfunction这类的方法动态的添加function。
    - 复杂逻辑处理
      常规的策略模式，使用的key通常是字符串格式，如果遇到复杂情况的时候，可能需要做很多前置判断，
      因此可将一个对象作为key值，通过对 对象的等值判断来对复杂逻辑进行处理。
    - 默认情况、特殊情况的处理
      使用发布、订阅者模式，在内部向外界传递一个事件，从而可自定义特殊事件。

## next.js 与nuxt.js、nest.js、fastify.js

[学习链接](https://huaweicloud.csdn.net/63a0048bdacf622b8df911b5.html?spm=1001.2101.3001.6650.1&utm_medium=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromBaidu%7Eactivity-1-121600881-blog-128405354.235%5Ev38%5Epc_relevant_sort&depth_1-utm_source=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromBaidu%7Eactivity-1-121600881-blog-128405354.235%5Ev38%5Epc_relevant_sort&utm_relevant_index=2)

1. next与nuxt
    - 均为服务端渲染框架。
    - 两个框架的重心均在web部分，对ui呈现的代码组织方式、服务端渲染功能提供了完善的支持。
    - 区别在于next是基于react构建的，
    而nuxt是基于vue构建的。
    - 两者均支持typescript。

2. nest.js
  是“Angular 的服务端实现”，基于装饰器。可以使用任何兼容的 http 提供程序，如 Express、Fastify 替换底层内核。

3. Fastify
  一个使用插件模式组织代码且支持并基于 schema 做了运行效率提升的比较纯粹的偏底层的 web 框架。
