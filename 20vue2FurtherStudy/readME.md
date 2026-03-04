# VUE2

## 对象的变化检测

### 使用**Object.defineProperty()**进行数据变化追踪，同时收集依赖，即在getter中收集依赖，在setter中触发依赖。

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

### 在完成依赖收集之后，依赖触发这个任务则交由watcher完成

  watcher相当于一个中介角色，数据变化时通知到它，它在通知其他地方。

### 对于依赖的收集，该如何处理？

  首先考虑的是一个数组dep，在getter中将依赖收集至dep中，在setter中循环dep触发依赖。纯数组收集依赖会存在耦合情况，因此**创建Dep类来实现依赖的管理**，包括收集依赖、删除依赖、向依赖发送通知等。

### 依赖是什么？

  所谓的收集依赖，就是当属性发生变化后，需要通知的地方。
  要通知用到数据的地方可能会有很多，而且类型不同，其所用之处可能是模板，也可能是用户所写的一个监听属性，因此**watcher由此产生——即抽象出来的一个可以集中处理不同情况的类，当数据变化时，直接通知该watcher，再由watcher通知到其他地方**。

  **Watcher的原理是**：先把自己设置到全局唯一的指定位置（例如window.target），然后读取数据，因为读取了数据，即触发数据的getter，在getter中就会从全局唯一指定位置读取当前正在读取数据的Watcher，并把这个Watcher收集到Dep中去。通过这样的方式，Watcher可以主动去订阅任意一个数据的变化。

### 递归侦测数据中所有属性

  **Observer类递归侦测所有key**。
  Observer类会附加到每一个被侦测的object上，
  一旦被附加上，Observer会将object所有属性转换为getter/setter形式
  来收集属性的依赖，并且当属性发生变化时会通知这些依赖。

### 关于无法监听Object类型数据变化的问题

  **Vue.js通过Object.defineProperty来将对象的key转换成getter/setter的形式来追踪变化，但getter/setter只能追踪一个数据是否被修改，无法追踪新增属性和删除属性**，所以会导致在对象上直接新增属性、删除属性时无法侦测到变化。为解决这个问题vue.js提供了vm.$set与vm.$delete两个api。

### Data、Observer、Dep和Watcher之间的关系

  Data通过Observer转换成了getter/setter的形式来追踪变化。当外界通过Watcher读取数据时，会触发getter从而将Watcher添加到依赖中。当数据发生变化时，会触发setter，从而向Dep中的依赖（Watcher）发送通知。Watcher接收到通知后，会向外界发送通知，变化通知到外界后可能会触发视图更新，也有可能触发用户的某个回调函数等。


## 数组的变化检测

### 数组的不同的变化侦测方式

  由于Object数据的侦测方式是通过getter/setter实现的，所以通过Array原型上的方法来改变数组的内容时，Object的侦测方式显然时行不通的。

  所以对于数组，使用**拦截器覆盖Array原型，将拦截器方法挂载到数组属性上，从而实现侦听**。

### 数组的拦截器

  拦截器其实就是一个和Array.prototype一样的Object，里面包含的属性一模一样，但这个Object中**某些可以改变数组自身内容的方法是经过处理的**（Observer）。

### 数组的依赖收集

  创建拦截器即得到了一种能力：当数组的内容发生变化时得到通知的能力。
  当该通知谁？即通知Dep中的依赖（Watcher）。
  因此，需要对数组的依赖进行收集。

  Array的依赖也和Object一样，在定义响应式数据（defineReactive）中收集。

  Array也是在getter中收集依赖，在拦截器中触发依赖。

  【注意】数组的依赖列表存放在Observer中。（依赖必须在getter和拦截器中都可以访问到）。在将数据进行响应式转换之前通过__ob__属性判断数据是否已转换为响应式数据，若没转换，则使用Observer进行数据转换，并且新增一个__ob__属性。

### 数组中的元素的变化侦测

  所有响应式的子数据都需要侦测（在Observer新定义一个转换方法observeArray将数组子集转换为响应式）。而且数组新增的元素也需要转换为响应式（在拦截器中，收集不同的方法所操作的新增元素，然后同样调用observeArray将元素转换为响应式的）。

### 数据的变化检测实现方式所带来的问题

- 通过下标修改元素时无法监测到数组的变化
- 通过修改数组长度操作数组时无法监测到数组的变化

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

## vue的生命周期

- 初始化阶段
  初始化事件和属性，触发生命周期钩子函数beforeCreate；
  然后初始化provide/inject 和状态（props, methods, data, computed, watch），触发声明周期钩子函数created。

  - 初始化事件
  v-on 写在组件标签上，事件会注册在子组件Vue.js的事件系统中，写在平台标签上（如div等），事件会注册到浏览器事件中。

  - 初始化provide/inject
    provide/inject主要为高阶插件、组件库提供用例，不推荐直接在程序代码中应用。

    祖先组件通过provide注入内容，子孙组件通过inject获取祖先组件注入的内容。

    【注意顺序】： 先初始化inject，在初始化状态，然后才初始化provide
  - 初始化状态
    【初始化顺序】： 先初始化props，接着methods，然后data，computed, 最后watch。注意，以上各个属性是存在才进行数据初始化。
- 模板编译阶段
- 挂载阶段
  beforeMount, mounted beforeUpdate updated
- 卸载阶段
  beforeDestroy destroyed
