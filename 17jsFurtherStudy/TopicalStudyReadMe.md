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

## 六. 数组扁平化

## 七. 在数组中查找指定元素
findIndex, findLastIndex, indexOf, lastIndexOf
- indexOf 参数 fromIndex：
  >设定开始查找的位置。如果该索引值大于或等于数组长度，意味着不会在数组里查找，返回 -1。如果参数中提供的索引值是一个负值，则将其作为数组末尾的一个抵消，即 -1 表示从最后一个元素开始查找，-2 表示从倒数第二个元素开始查找 ，以此类推。 注意：如果参数中提供的索引值是一个负值，仍然从前向后查询数组。如果抵消后的索引值仍小于 0，则整个数组都将会被查询。其默认值为 0。

- lastIndexOf 的 fromIndex：
  >从此位置开始逆向查找。默认为数组的长度减 1，即整个数组都被查找。如果该值大于或等于数组的长度，则整个数组会被查找。如果为负值，将其视为从数组末尾向前的偏移。即使该值为负，数组仍然会被从后向前查找。如果该值为负时，其绝对值大于数组长度，则方法返回 -1，即数组不会被查找。



## 八. each实现
利用for循环、for in 循环，注意区分是对象还是数组（类数组），数组（类数组）使用for循环，对象使用for in 循环。

## 九. 判断对象相等与否
- 相等
  我们认为：

  1. NaN 和 NaN 是相等
  2. [1] 和 [1] 是相等
  3. {value: 1} 和 {value: 1} 是相等

  不仅仅是这些长得一样的，还有

  1. 1 和 new Number(1) 是相等
  2. 'Curly' 和 new String('Curly') 是相等
  3. true 和 new Boolean(true) 是相等
- 注意点
  1. 注意区分+0 和 -0
    ```js
    console.log(+0 === -0) // true
    ``` 
    注意+0 和 -0实际上是有区别的：
    > 因为 JavaScript 采用了IEEE_754 浮点数表示法(几乎所有现代编程语言所采用)，这是一种二进制表示法，按照这个标准，最高位是符号位(0 代表正，1 代表负)，剩下的用于表示大小。而对于零这个边界值 ，1000(-0) 和 0000(0)都是表示 0 ，这才有了正负零的区别。
    
    判断方法:
    ```js
    function eq(a,b) {
      return a===b ? a !== 0 || (a/1 === b/1)
    }
    ```
  2. NaN
    ```js
    console.log(NaN === NaN) // false
    ```

    判断方法：
    利用NaN !== NaN特性来进行判断
    ```js
    function eq(a,b) {
      if(a !== a) return b !== b
    }
    ```
  3. 复杂的对象类型比较
    比如字符串'hel'以及经过new String()生成的包装对象new String('hel')

    判断方法：
    通过Object.prototype.toString.call方法获取对应值的类名，若类名相等，
    再通过类型转换进行判断两值是否相等
    ```js
    console.log('a' === '' + new String('a')); // true
    var a = /a/i;
    var b = new RegExp(/a/i);
    console.log('' + a === '' + b) // true
    ```

  4. 构造函数生成的实例对象
  获取对象对应的构造器，若两者构造器不一致，则两者不等

  5. 对象、数组相等的判定
  递归遍历，长度不等或对应值不等，则两者不等。
  
  6. 对象中存在循环引用的判断
  判断a, b是否相等 的时候，多传递两个参数为 aStack 和 bStack，用来储存 a 和 b 递归比较过程中的 a 和 b 的值。
  ```js
  // ...前面一些判断
  aStack = aStack || [];
  bStack = bStack || [];

  var length = aStack.length;
  // 判断是否有循环引用（本质上，就是将递归的值存储到stack中，如果相等，那么直接return回去，避免递归爆栈问题）
  while (length--) {
      if (aStack[length] === a) {
            return bStack[length] === b;
      }
  }
  // 对象入栈
  aStack.push(a);
  bStack.push(b);
  // ... 数组、对象相等与否的判断

  // 对象出栈
  aStack.push();
  bStack.push();
  ```


  7. **补充**
  ```js
  console.log(Function instanceof Function); // true
  //这里是因为Function.prototype === Function.__proto__
  console.log(Object instanceof Object);   // true
  //这里是因为Object.prototype === Object.__proto__.__proto__
  console.log(Array instanceof Array); // false 
  //这里是因为Array.prototype !== Array.__proto__(注：Array.__proto__  === Function.prototype)且Array.prototype !== Array.__proto__.__proto__(注：Array.__proto__.__proto__  === Object.prototype)且Array.prototype !== Array.__proto__.__proto__.__proto__(注：Array.__proto__.__proto__.__proto__  === null)
  ```

## 十. 函数柯里化
  ### 定义
  函数柯里化是一种将使用多个参数的函数转换成一系列使用一个参数的函数的技术。

  ### 柯里化用途
  实现参数复用，本质上是降低通用性，提高复用性。

  ### 函数柯里化的实现
  用闭包把参数（实参）保存起来，当参数（实参）的数量足够执行函数了（即实参的长度等于函数形参的长度），
  就开始执行函数，否则递归利用闭包实现参数累积保存。
  ```js
  function curry(fn, args) {
    return function() {
      var combinedArgs = [...args, ...arguments];
      if(combinedArgs.length < fn.length) {
        return curry.apply(this, fn, combinedArgs)
      } else {
        fn.apply(this, combinedArgs);
      }
    }
  }
  ```

## 十一. 偏函数（局部应用(Partial application)）
  ### 局部应用
  在计算机科学中，局部应用是指固定一个函数的一些参数，然后产生另一个更小元的函数。
  什么是元？元是指函数参数的个数，比如一个带有两个参数的函数被称为二元函数。

  ### 局部应用与柯里化
  柯里化是将一个多参数函数转换成多个单参数函数，也就是将一个 n 元函数转换成 n 个一元函数。

  局部应用则是固定一个函数的一个或者多个参数，也就是将一个 n 元函数转换成一个 n - x 元函数。
  
## 十二. 惰性函数
  ### 使用场景
  当每次都需要进行条件判断，其实只需要判断一次，接下来的使用方式都不会发生改变的时候，想想是否可以考虑使用惰性函数。
  ### 定义
  惰性函数就是解决每次都要进行判断的这个问题，解决原理很简单，重写函数。
## 十三. compose函数组合
  ### 函数组合
  利用 一个函数方法（例如自定义一个compose方法） 将两个函数组合成一个函数，
  让代码从右向左运行，而不是由内而外运行，可读性大大提升。这便是函数组合。

  ### pointFree
  pointfree 指的是函数无须提及将要操作的数据是什么样的。