# topical study
## 一. 防抖
  ### 背景
  一些事件会被频繁触发，例如
  1. window 的 resize、scroll
  2. mousedown、mousemove
  3. keyup、keydown
  ...
  ### 解决方案
  1. debounce 防抖
  2. throttle 节流

  ### 防抖实现原理
  防抖的原理就是：尽管触发事件，但是一定是在事件触发 n 秒后才执行，如果在一个事件触发的 n 秒内又触发了这个事件，
  那就以新的事件的时间为准，n 秒后才执行，总之，就是要等触发完事件 n 秒内不再触发事件，才执行。

## 二. 节流
  ### 节流原理
  如果持续触发事件，每隔一段时间，只执行一次事件。
  根据首次是否执行以及结束后是否执行，效果有所不同，实现的方式也有所不同。
  用 leading 代表首次是否执行，trailing 代表结束后是否再执行一次。

  ### 节流的实现方式
    - 使用时间戳
    - 设置定时器

  ### 使用时间戳实现
  使用时间戳，当触发事件的时候，取出当前的时间戳，然后减去之前的时间戳(最一开始值设为 0 )，如果大于设置的时间周期，就执行函数，然后更新时间戳为当前的时间戳，如果小于，就不执行。

  ### 使用定时器实现
  当触发事件的时候，设置一个定时器，再触发事件的时候，如果定时器存在，就不执行，直到定时器执行，然后执行函数，清空定时器，这样就可以设置下个定时器。

  ### 使用时间戳与使用定时器两种方法的区别
  - 是否立即执行
    第一种使用时间戳: 事件会立刻执行，第二种使用定时器: 事件会在 n 秒后第一次执行;
  - 停止触发后事件执行情况
    第一种使用时间戳: 事件停止触发后没有办法再执行事件，第二种使用定时器: 事件停止触发后依然会再执行一次事件;


  ### 防抖与节流
  - 防抖是虽然**事件持续触发**，但只有**等事件停止触发后 n 秒才执行函数**，
  - 节流是**持续触发的时候**，**每 n 秒执行一次函数**。

## 三. 数组去重

## 四. 类型判断
  - Object.prototype.toString
  当 toString 方法被调用的时候，下面的步骤会被执行：
    1. 如果 this 值是 undefined，就返回 [object Undefined]
    2. 如果 this 的值是 null，就返回 [object Null]
    3. 让 O 成为 ToObject(this) 的结果
    4. 让 class 成为 O 的内部属性 [[Class]] 的值
    5. 最后返回由 "[object " 和 class 和 "]" 三个部分组成的字符串

  - 复杂的类型判断
    1. jQuery的plainObject
    用来判断对象是否是纯粹的对象，所谓"纯粹的对象"，就是该对象是通过 "{}" 或 "new Object" 创建的，该对象含有零个或者多个键值对。

    2. jQuery的isEmptyObject
    jQuery提供了 isEmptyObject 方法来判断是否是空对象。

    3. 判断Window对象
    Window 对象作为客户端 JavaScript 的全局对象，它有一个 window 属性指向自身。

    4. jquery的isArrayLike
    判断数组，类数组
    isArrayLike 返回true，至少要满足三个条件之一：
      1. 是数组
      2. 长度为 0
      3. lengths 属性是大于 0 的数组，并且obj[length - 1]必须存在
      （符合条件的类数组对象是一定存在最后一个元素的)
    5. isElement

    isElement 判断是不是 DOM 元素

## 五. 深浅拷贝
  ### 浅拷贝
    利用数组concat，slice等方法实现
    遍历对象，把属性、属性值放在一个新对象里。
  ### 深拷贝
    可以利用json.stringify json.parse、递归等方法实现



