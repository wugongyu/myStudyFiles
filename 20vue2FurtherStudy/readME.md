# VUE2
## 对象的变化检测
  - 使用Object.defineProperty()进行数据变化追踪，同时收集依赖，即在getter中收集依赖，在setter中触发依赖。

  ```js
  var data = {};
  function defineReactive(data, key, val){
    var dep = []; // 依赖
    // 变化追踪
    Object.defineProperty(data, key, {
      enumerable: true,
      configurable: true,
      get: function() {
        this.dep.push(window.target); // 收集依赖（假定依赖为window.target的一个函数）
        return data[key];
      },
      set: function(newVal) {
        if(val === newVal) {
          return
        }
        for (let i = 0; i < dep.length; i++) {
          dep[i](val, newVal); // 触发依赖
          
        }
        data[key] = newVal
      }
    })
  }
  ```

  - 在完成依赖收集之后，依赖触发这个任务则交由watcher完成
    watcher相当于一个中介角色，数据变化时通知到它，它在通知其他地方。


## 数组的变化检测
  使用拦截器覆盖Array原型，将拦截器方法挂载到数组属性上。

## 变化检测相关api
  vm.$watch
  vm.$set
  vm.$delete

## 虚拟DOM
  虚拟DOM是将状态映射为视图的一种解决方案，它的运作原理是使用状态生成虚拟节点，再由虚拟节点渲染出视图。

  虚拟DOM在vue.js中的作用是：生成vnode，对比新旧vnode，并通过对比结果，只对需要更新的部分来操作DOM从而更新视图。

## VNode
  VNode是一个类，可以生成不同类型的vnode实例，不同类型的vnode代表不同类型的真实DOM。

## patch
  将vnode渲染成真实DOM。
  通过patch算法计算出真正需要更新的DOM节点，最大限度地减少DOM操作，从而提高性能。

## 模板编译原理

  渲染函数是创建HTML最原始的方法。模板最终会通过编译转换为渲染函数，渲染函数执行后会得到一份vnode用于虚拟DOM的渲染。

  ### vue 的模板语法
  vue.js的模板语法声明式的描述数据状态与DOM之间的绑定关系，然后通过模板生成真实DOM以展示在用户页面。

  ### vue的模板编译过程
  - 模板解析为AST（抽象语法树）--解析器
  - 遍历AST标记静态内容 -- 优化器
  - 使用AST生成渲染函数 -- 代码生成器

  模板 =》 解析器 =》 优化器 =》 代码生成器 =》 渲染函数

  AST使用js对象来描述节点，一个对象代表一个节点，对象中的属性用来保存节点中所需的各种数据。

    #### 解析器
    解析器作用是通过模板获取到AST。
    生成AST需要借助到HTML解析器。

    HTML解析器触发不同的钩子函数以构建不同的节点。
    通过栈获取当前构建节点的父节点，并将当前构建节点添加到父节点的后面，html解析完毕后，会获得一个具有DOM层级关系的AST。

    - HTML解析器内部原理
    解析器会一小段一小段的截取模板字符串，然后每截取一小段字符串，根据它的类型来调用不同的钩子函数，直至模板字符串为空停止解析。

    文本类型分为带变量，不带变量的文本，带变量文本需用文本解析器进行二次加工。

    #### 优化器
    优化器的作用是在AST中标记静态子树。
    标记静态子树好处：
    - 每次重新渲染的时候，无需为静态子树创建新节点
    - 在虚拟DOM中的打补丁（patching）过程可以跳过。

    标记过程（均采用递归方式从上向下标记）：
    - 先标记所有静态节点
    - 再标记所有静态根节点

    #### 代码生成器

    生成代码字符串是一个递归的过程，从顶向下依次遍历每个AST节点。
    节点有三种类型，分别对应三种不同的创建方法与别名。
    - 文本节点 -- createTextNode _v
    - 元素节点 -- createElement _c
    - 注释节点 -- createEmptyNode _e

  ## vue 的实例方法与全局API
  Vue 的实例方法是放在Vue.prototype上的，例如vm.$nextTick（Vue.prototype.$nextTick）
  ，而全局API是在vue.js中，例如Vue.nextTick