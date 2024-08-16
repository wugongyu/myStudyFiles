# JS further study

## 一. 原型与原型链
  ### 1. 几个等式关系
  ```javascript
    function Person() {

    }
    var person = new Person();
    var relationship1 = person.__proto__ === Person.prototype; // true 实例的原型指向构造函数的原型
    var relationship2 = Person === Person.prototype.constructor; // true   每个构造函数原型都有一个 constructor 属性指向它本身
    var relationship3 = Person.prototype.__proto__ === Object.prototype; // true 构造函数原型实际上是Object的一个实例，所以实例的__proto__指向Object构造函数的原型
    var relationship4 = Object.prototype.__proto__ === null; // true Object 构造函数原型的原型指向null，即Object.prototype 没有原型

    // 注意，当获取 person.constructor 时，其实 person 中并没有 constructor 属性,当不能读取到constructor 属性时，会从 person 的原型也就是 Person.prototype 中读取
    var relationship5 = person.constructor === Person.prototype.constructor; // true
    var relationship6 = person.constructor === Person; // true
  ```



  ### 2. 关系图
  [原型与原型链](./images/prototype.png);

  ### 3. instanceof
  [INSTANCEOF STUDY LINK](https://gitcode.csdn.net/65e7d2e41a836825ed78965e.html?dp_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6Mjc0MjI2NywiZXhwIjoxNzI0Mzk5MTM4LCJpYXQiOjE3MjM3OTQzMzgsInVzZXJuYW1lIjoid2VpeGluXzQzMzUxNjQzIn0.T3IvLVrnP3TcO8Qv-lqW71Bq1AbiTufCGs3KvTlNxbE)
  ```js
  // 定义构造函数
  function C () {}
  function D () {}
  // 实例化一个 o 对象
  var o = new C()
  // true，true --> C.prototype 在 o 的原型链上
  console.log(o instanceof C, o.__proto__ === C.prototype, '此时 o 的 __proto__：', o.__proto__, '此时 C 的 prototype：', C.prototype)
  // false，false --> D.prototype 不在 o 的原型链上
  console.log(o instanceof D, o.__proto__ === D.prototype)
  // true true --> Object.prototype 在 o 的原型链上
  console.log(o instanceof Object, o.__proto__.__proto__ === Object.prototype)
  // 这时我们修改构造函数 C 的原型为一个空对象
  C.prototype = {}
  // 实例化一个 o2 对象
  var o2 = new C()
  // true --> C.prototype 在 o2 的原型链上
  console.log(o2 instanceof C)
  // false，C.prototype 指向了一个空对象,这个空对象不在 o 的原型链上.
  console.log(o instanceof C, '此时 o 的 __proto__：', o.__proto__, '此时 C 的 prototype：', C.prototype)
  console.log('此时 D 的 prototype：', D.prototype);
  // 继承
  D.prototype = new C()
  console.log('此时 D 的 prototype：', D.prototype);
  var o3 = new D()
  // true, true --> 因为 o3 是 构造函数 D new 出来的实例对象，所以 D.prototype 一定在 o3 的原型链上
  console.log(o3 instanceof D, o3.__proto__ === D.prototype)
  // true --> 因为 C.prototype 现在在 o3 的原型链上
  console.log(o3 instanceof C)
  // true,true --> 上面的结果为什么为 true 呢，看如下代码，D.prototype 是 构造函数 C new 出来的实例对象，所以 C.prototype 一定在 D.prototype 的原型链上
  console.log(o3.__proto__ === D.prototype, D.prototype.__proto__ === C.prototype);
  // true 相当于如下代码
  console.log(o3.__proto__.__proto__ === C.prototype);

  ```


## 二. js词法作用域与动态作用域

  ### 1. js词法作用域
  lexical scoping
  js采用的是词法作用域，即静态作用域，**函数的作用域在函数定义的时候就确定**了；
  ```javascript
    var value = 1;
    function foo() {
      console.log(value);
    }

    function bar() {
      var value = 2;
      foo();
    }
    bar(); // 输出值为： 1
  ```
  【注】
  在全局作用域中“定义”一个函数的时候，只会创建包含全局作用域的作用域链。
  只有“执行”该函数的时候，才会复制创建时的作用域，并将当前函数的局部作用域放在作用域链的顶端。

  ### 2. 动态作用域
  与词法作用域相对的即动态作用域，函数的作用域在函数调用的时候才确定。如bash语言文件就是动态作用域。

## 三. js执行上下文栈
  ### 1. js的可执行代码
  js的可执行代码（executable code）类型有：全局代码、函数代码、eval代码。

  当执行到一个函数时，会进行“准备工作”，专业词来说也就是“执行上下文”。

  ### 2. js的执行上下文栈
  执行多个函数，就有多个执行上下文，
  js引擎创建了【执行上下文栈】（Execution context stack）来管理【执行上下文】。

  ### 3. 模拟执行上下文栈行为
  定义执行上下文栈为一个数组
  ```js
    ECStack = [];
  ```

  js执行时，遇到全局代码，创建全局执行上下文（globalContext）, 压入ECStack，整个程序结束之后，ECStack才会被清空。
  ```javascript
    ECStack = [
      globalContext
    ];
  ```
  ```js
    function fn3() {
      console.log('fn3');
    }
    function fn2() {
      fn3();
    }
    function fn1() {
      fn2();
    }
  ```
  当执行一个函数的时候，就会创建一个执行上下文，并且压入执行上下文栈，当函数执行完毕的时候，就会将函数的执行上下文从栈中弹出。
  ```js
    // 伪代码

    // fun1()
    ECStack.push(<fun1> functionContext);

    // fun1中竟然调用了fun2，还要创建fun2的执行上下文
    ECStack.push(<fun2> functionContext);

    // 哎呀，fun2还调用了fun3！
    ECStack.push(<fun3> functionContext);

    // fun3执行完毕
    ECStack.pop();

    // fun2执行完毕
    ECStack.pop();

    // fun1执行完毕
    ECStack.pop();

    // javascript接着执行下面的代码，但是ECStack底层永远有个globalContext
  ```

## 四. 变量对象
  ### 1. 执行上下文重要属性
  对于每一个执行上下文，都有三个重要属性：
  - 变量对象（variable object VO）
  - 作用域链（scope chain）
  - this

  ### 2. 变量对象
  变量对象是与执行上下文相关的数据作用域，存储了在上下文中定义的变量和函数声明。

  ### 3. 全局上下文
  全局上下文中的变量对象即全局对象。

  ### 4. 函数上下文
  在函数上下文中，用活动对象（activation object, AO）表示变量对象。
  当进入一个执行上下文中，执行上下文的变量对象被激活，此时被激活的变量对象（即活动对象）的各种属性才可被访问。

  活动属性是在进入函数上下文时刻被创建的，它通过函数arguments属性进行初始化。

  #### 4.1 VO 与 AO 的关系
  未进入执行阶段之前，变量对象(VO)中的属性都不能访问！但是进入执行阶段之后，变量对象(VO)转变为了活动对象(AO)，里面的属性都能被访问了，然后开始进行执行阶段的操作。

  AO 实际上是包含了 VO 的。因为除了 VO 之外，AO 还包含函数的 parameters，以及 arguments 这个特殊对象。也就是说 AO 的确是在进入到执行阶段的时候被激活，但是激活的除了 VO 之外，还包括函数执行时传入的参数和 arguments 这个特殊对象。
  AO = VO + function parameters + arguments

  ### 6. 变量对象的创建过程【总结】
  1. **全局上下文**的变量对象初始化是全局对象

  2. **函数上下文**的变量对象初始化只包括 Arguments 对象
  调用函数时，会为其创建一个Arguments对象，并自动初始化局部变量arguments，指代该Arguments对象。所有作为参数传入的值都会成为Arguments对象的数组元素。

  3. 在**进入执行上下文**时会给变量对象添加形参、函数声明、变量声明等初始的属性值
  进入执行上下文时，初始化的规则如下，从上到下就是一种顺序：
  - 函数的所有形参 (如果是函数上下文)
  由名称和对应值组成的一个变量对象的属性被创建
  没有实参，属性值设为 undefined

  - 函数声明
  由名称和对应值（函数对象(function-object)）组成一个变量对象的属性被创建
  如果**变量对象已经存在相同名称的属性**，则**完全替换**这个属性

  - 变量声明
  由名称和对应值（undefined）组成一个变量对象的属性被创建；
  如果**变量名称跟已经声明的形式参数或函数相同**，则变量声明**不会干扰已经存在的这类属性**

  4. 在**代码执行阶段**，会再次修改变量对象的属性值


  ### 7. 执行上下文的生命周期
  1. 创建阶段（进入执行上下文）
  在这个阶段中，执行上下文会分别创建变量对象，建立作用域链，以及确定this的指向。

  2. 代码执行阶段
  创建完成之后，就会开始执行代码，这个时候，会完成变量赋值，函数引用，以及执行其他代码。

## 五. 作用域链
  ### 1. 作用域链
  当查找变量的时候，会先从当前上下文的变量对象中查找，如果没有找到，
  就会从父级(词法层面上的父级)执行上下文的变量对象中查找，一直找到全局上下文的变量对象，也就是全局对象。
  这样由多个执行上下文的变量对象构成的链表就叫做作用域链。

  ### 2. 作用域链的创建与变化
  1. 函数创建时期
  **函数的作用域在函数定义的时候就确定了**。函数有一个**内部属性[[scope]]**，
  在**函数创建**的时候，会**保存所有父变量对象到[[scope]]**中，即[[scope]]是所有父变量对象的层级链，但注意[[scope]]不代表完整的作用域链。

  2. 函数激活时期
  当函数激活时，进入函数上下文，创建 VO/AO 后，就会将活动对象添加到作用链的前端。

  这时候执行上下文的作用域链，命名为 Scope：

  ```js

  Scope = [AO].concat([[Scope]]);

  ```

  至此，作用域链创建完毕。

  3. 函数执行上下文中作用域链和变量对象的创建过程：

  ```js
  var scope = "global scope";
  function checkscope(){
      var scope2 = 'local scope';
      return scope2;
  }
  checkscope();
  ```

    执行过程如下：

    - (1)checkscope 函数被创建，保存作用域链到 内部属性[[scope]]

    ```js
    checkscope.[[scope]] = [
        globalContext.VO
    ];
    ```

    - (2)执行 checkscope 函数，创建 checkscope 函数执行上下文，checkscope 函数执行上下文被压入执行上下文栈

    ```js
    ECStack = [
        checkscopeContext,
        globalContext
    ];
    ```

    - (3)checkscope 函数并不立刻执行，开始做准备工作，第一步：复制函数[[scope]]属性创建作用域链

    ```js
    checkscopeContext = {
        Scope: checkscope.[[scope]],
    }
    ```

    - (4)第二步：用 arguments 创建活动对象，随后初始化活动对象，加入形参、函数声明、变量声明

    ```js
    checkscopeContext = {
        AO: {
            arguments: {
                length: 0
            },
            scope2: undefined
        }
    }
    ```

    - (5)第三步：将活动对象压入 checkscope 作用域链顶端

    ```js
    checkscopeContext = {
        AO: {
            arguments: {
                length: 0
            },
            scope2: undefined
        },
        Scope: [AO, [[Scope]]]
    }
    ```

    - (6)准备工作做完，开始执行函数，随着函数的执行，修改 AO 的属性值

    ```js
    checkscopeContext = {
        AO: {
            arguments: {
                length: 0
            },
            scope2: 'local scope'
        },
        Scope: [AO, [[Scope]]]
    }
    ```

    - (7)查找到 scope2 的值，返回后函数执行完毕，函数上下文从执行上下文栈中弹出

    ```js
    ECStack = [
        globalContext
    ];
    ```

## 六. this
  ### 1. types 
    ecmascript类型分为语言类型与规范类型

  - 语言类型
    直接使用ecmascript可以操作的，如Undefined, Null, Boolean,Object等
  - 规范类型
    只存在于规范中的类型，用于描述语言的底层行为逻辑，如Reference等

  ### 2. Reference类型（与 this指向有密切关联）
  Reference 类型就是用来解释诸如 delete、typeof 以及赋值等操作行为的。
  Reference是只存在于规范里的抽象类型，它是为了更好的描述语言的底层行为逻辑而存在的，其并不存在于实际JS代码中。

  ### 3. Reference组成部分
  * base value 
    属性所在的对象或者就是EnvironmentRecord
  * referenced name
    属性的名称。
  * strict reference

  ```js
  var foo = 'foo';
  fooReference = {
    base: EnvironmentRecord,
    name: 'foo',
    strict: false,
  };
  ```

  ### 4. Reference 组成部分的方法
  * GetBase
    返回reference 的base value
  * IsPropertyReference
    如果base value 是一个对象，即返回true
  * GetValue
    返回reference对象的真正的值

  ### 5. 函数调用时this的确定
  5.1.计算 MemberExpression 的结果赋值给 ref

  5.2.判断 ref 是不是一个 Reference 类型

    5.2.1 如果 ref 是 Reference，并且 IsPropertyReference(ref) 是 true, 那么 this 的值为 GetBase(ref)

    5.2.2 如果 ref 是 Reference，并且 base value 值是 Environment Record, 那么this的值为 ImplicitThisValue(ref)

    5.2.3 如果 ref 不是 Reference，那么 this 的值为 undefined

  - MemberExpression
    简单理解 MemberExpression 其实就是()左边的部分。
    ```js
    function foo() {
        console.log(this)
    }

    foo(); // MemberExpression 是 foo

    function foo() {
        return function() {
            console.log(this)
        }
    }

    foo()(); // MemberExpression 是 foo()

    var foo = {
        bar: function () {
            return this;
        }
    }

    foo.bar(); // MemberExpression 是 foo.bar

    ```

  ## 七. 执行上下文
  
  ```js
  var scope = "global scope";
  function checkscope(){
      var scope = "local scope";
      function f(){
          return scope;
      }
      return f;
  }
  checkscope()();
  ``` 
  this 是在函数执行的时候才确定下来的，checkscope 函数 和 f 函数的 this 的值跟作用域链没有关系，具体的取值规则还需要参照上一篇文章《JavaScript深入之从ECMAScript规范解读this》, 两者的 this 其实都是 undefined ，只是在非严格模式下，会转为全局对象。

  ### 1. 代码执行过程分析
  - 1.1 执行全局代码，创建全局执行上下文，全局执行上下文压入执行上下文栈， 并初始化全局执行上下文

  ```js
  ECStack = [
    globalContext,
  ]
  
  globalContext = {
    VO: [global, scope, checkscope],
    Scope: [globalContext.VO],
    this: globalContext.VO
  }
  ```

  - 1.2 初始化的同时，创建checkscope函数，保存作用域链到函数内部属性[[scope]]
  ```js
  checkscope[[scope]] = [
    globalContext.VO
  ]
  ```

  - 1.3 执行checkscope函数，创建checkscope函数执行上下文，将函数上下文压入栈，并且初始化函数执行上下文
  【注】函数上下文初始化过程
    1. 复制函数 [[scope]] 属性创建作用域链，
    2. 用 arguments 创建活动对象，
    3. 初始化活动对象，即加入形参、函数声明、变量声明，
    4. 将活动对象压入 checkscope 作用域链顶端。
  ```js
  ECStack = [
    checkscopeContext,
    globalContext,
  ]
  
  checkscopeContext = {
    AO: {
      arguments: {
        length: 0,
      },
      scope: undefined,
      f: reference to function f() {},
    },
    Scope: [AO, globalContext.VO],
    this: undefined
  }
  ```

    - 同时，f函数被创建，保存作用域链至f函数的内部属性[[scope]]中
    f[[scope]] = [
      checkscopeContext.AO,
      globalContext.VO,
    ]
  
  - 1.4 checkscope执行完毕，将checkscope执行上下文从执行上下文栈中弹出，
  ```js
  ECStack = [
    globalContext,
  ]
  ```

  - 1.5 执行f函数，创建f函数执行上下文，将其压入执行上下文栈，并初始化函数执行上下文（过程同上）
  ```js
  ECStack = [
    fContext,
    globalContext,
  ]
  fContext = {
    AO: {
      arguments: {
        length: 0,
      }
    },
    Scope: [AO, checkscopeContext.AO, globalContext.VO],
    this: undefined,
  }
  ```

  - 1.6 f函数执行，沿着作用域链寻找scope值，返回scope值
  因为 checkscope 函数执行上下文初始化时，f 函数同时被创建，保存作用域链到 f 函数的内部属性[[scope]]，所以即使checkscope函数执行完毕，被弹出执行上下文栈，但是checkscopeContext.AO 依然存在于 f 函数维护的[scope]]

  **闭包**由此产生。

  - 1.7 f函数执行完毕，f函数执行上下文弹出上下文执行栈。
  ```js
  ECStack = [
    globalContext,
  ]
  ```

## 八. 闭包
  1. MDN 闭包定义
  闭包指能够访问自由变量的函数。
    - 自由变量
    指能在函数中使用，但既不是函数参数又不是函数的局部变量的变量。

  2. ECMAScript闭包定义
  - 理论角度
    所有函数均为闭包。
    因为它们都在创建的时候就将上层上下文的数据保存起来了。哪怕是简单的全局变量也是如此，因为函数中访问全局变量就相当于是在访问自由变量，这个时候使用最外层的作用域。
  - 实践角度
    以下函数才算是闭包：
      1. 即使创建它的上下文已经销毁，它仍然存在（比如，内部函数从父函数中返回）
      2. 在代码中引用了自由变量

## 九. 参数的按值传递
  - 1.参数传递类型
      1. 按值传递
      把函数外部的值复制给函数内部的参数
      2. 引用传递？
      引用传递，就是传递对象的引用，函数内部对参数的任何改变都会影响该对象的值，因为两者引用的是同一个对象。
      引用传递其实也是按值传递，只是值是指针地址。
      3. 共享传递
      共享传递是指，在传递对象的时候，传递对象的引用的副本。
      【注意】**按引用传递是传递对象的引用，而按共享传递是传递对象的引用的副本！**

  参数如果是基本类型是按值传递，如果是引用类型按共享传递。

  但是因为拷贝副本也是一种值的拷贝。

  **ECMAScript中所有函数的参数都是按值传递的。**

## 十.call与apply

  1. call
  call() 方法在使用一个指定的 this 值和若干个指定的参数值的前提下调用某个函数或方法。
  newFun.call(obj, param1, param2, ...otherParams);
  2. apply
  newFun.apply(obj, [param1, param2, ...otherParams]);

## 十一. bind
  - 1.bind 方法
  bind() 方法会创建一个新函数。当这个新函数被调用时，bind() 的第一个参数将作为它运行时的 this，之后的一序列参数将会在传递的实参前传入作为它的参数。

  - 2.bind 方法特点
    1. 返回一个函数
    2. 可以传入参数
    3. 一个绑定函数也能使用new操作符创建对象：这种行为就像把原函数当成构造器。提供的 this 值被忽略，同时调用时的参数被提供给模拟函数。
    即当 bind 返回的函数作为构造函数的时候，bind 时指定的 this 值会失效，但传入的参数依然生效。

## 十二.new
  - 1.new 运算符
  new 运算符创建一个用户定义的对象类型的实例或具有构造函数的内置对象类型之一。
  创建的实例对象：
    1. 可以访问构造函数里的属性。
    2. 可以访问构造函数原型中的属性。


  - 2.几点注意
    1. 在构造函数中返回了一个对象，实例只能访问返回的对象中的属性。
    2. 在构造函数中返回了一个基本类型的值，会当作没有返回值进行处理。

## 十三. 类数组对象与arguments
  1. 类数组对象
    拥有一个length属性和若干索引属性的对象。
    类数组无法直接调用数组方法，如需要调用，可以通过Array.prototype[方法名].call(arrayLike)

  2. Arguments对象
  Arguments对象就是类数组对象。

  arguments对象只定义在函数体中，包括函数的参数和其他属性，在函数体中，arguments对象指代Arguments对象
  - length属性
    表示实参的长度
  - callee属性
    通过callee可以调用函数自身
  - arguments和对应参数的绑定
    传入的参数，实参和 arguments 的值会共享，当没有传入时，实参与 arguments 值不会共享
    除此之外，以上是在非严格模式下，如果是在严格模式下，实参和 arguments 是不会共享的。

  - 使用es6三点运算符（...）能将arguments转成数组

  ## 十四. 创建对象方式
  1. 工厂模式
  2. 构建函数模式
  3. 原型模式
  4. 组合模式
  5. 动态原型模式
  6. 寄生构造函数模式
  7. 稳妥构造函数模式

  ## 十五. 继承

  1. 原型链继承
  2. 经典继承（借用构造函数继承）
  3. 组合继承
    结合原型链继承以及经典继承的优点。
  4. 原型式继承
    即Object.create的模拟实现，将传入的对象作为创作的对象的原型
  5. 寄生式继承
  6. 寄生组合式继承


  ## 十六. 浮点数精度
    `
    0.1 + 0.2 !== 0.3;
    `

  1. 浮点数的存储
    【注意】0.1转为二进制时是一个无限循环的数
    ecmascript使用64位存储浮点数。
    存储标准为，一个浮点数可以这样表示：
    Value = sign * exponent * fraction
    在这个标准下：
    **会用 1 位存储 S，0 表示正数，1 表示负数。**
    **用 11 位存储 E + bias**，对于 11 位来说，bias 的值是 2^(11-1) - 1，也就是 1023。
    **用 52 位存储 Fraction。**
    举个例子，就拿 0.1 来看，对应二进制是 1 * 1.1001100110011…… * 2^-4， Sign 是 0，E + bias 是 -4 + 1023 = 1019，1019 用二进制表示是 1111111011，Fraction 是 1001100110011……
    【结论】当0.1、0.2在存储的时候已经发生了精度丢失了

  2. 浮点数的计算
    关于浮点数的运算，一般由以下五个步骤完成：对阶、尾数运算、规格化、舍入处理、溢出判断。
    【结论】两次存储时的精度丢失加上一次计算时的精度丢失，导致 0.1 + 0.2 !== 0.3

  ## 十七. 类型转换
  - 1.原始值转布尔
  使用Boolean函数将类型转换为布尔类型。
    - Boolean函数不传参时，返回false
    - 除了传入以下六种数据会返回false，其余情况返回true
      null undefined false 0 NaN ''

  - 2.原始值转数字
    - 使用Number函数将类型转换为数字，传入参数不可转换时返回NaN。
      Number函数若有参数，则会调用底层规范方法（不直接暴露）ToNumber方法来进行转换处理。
      ToNumber结果对应表：
      参数类型  | 结果
      :---:|:---:
      不传参 | +0
      undefined | NaN
      null|+0
      boolean|false返回0，true返回1
      number|返回与之对应的值
      string|Number函数试图将传入的string类型的值转换为整型或浮点型，且忽略所有前导0，若有一个不是数字，则返回NaN
    - 还可使用parseInt（整数） parseFloat（整数、浮点数）进行转换
      parseInt可将前缀为0x|oX的转换为十六进制数。
      parseInt parseFloat会跳过任意数量的前导空格，
      如果字符串第一个字符为非法的数字字面量，返回NaN。

  - 3.原始值转字符串
    使用String函数进行类型转换。
    传有参数时，会调用ToString(value)方法进行转换

    ToString结果对应表：

    参数类型 | 结果
    :----:|:----------------:
    不传参| 返回空字符串
    undefined | undefined
    null | null
    boolean | 传入true 返回 'true'，传入false 返回 'false'
    string | 返回与之对应的值
    number | 复杂情况看下面的例子
    | - | console.log(String(-0)); // 0 
    | - | console.log(String(0)); // 0
    | - | console.log(String(Infinity)); // Infinity
    | - | console.log(String(-Infinity)); // -Infinity
    | - | console.log(String(122244)); // 122244
    | - | console.log(String(NaN)); // NaN

  - 4.原始值转对象
  原始值通过调用 String()、Number() 或者 Boolean() 构造函数，转换为它们各自的包装对象。
  null 与 undefined例外。

  - 5.对象转布尔值
  所有对象（包括函数，数组）转为布尔值结果都为true。

  - 6.对象转字符串和数字
    对象转换为字符串，对象转换为数字都是通过调用待转换对象的一个方法来实现的。JavaScript 对象有两个不同的方法来执行转换，一个是 toString，一个是 valueOf，它们与前面的ToString和ToNumber方法不同的是，它们是暴露出来的方法。
    - **toString方法**
      1. 数组的 toString 方法将每个数组元素转换成一个字符串，并在元素之间添加逗号后合并成结果字符串。
      2. 函数的 toString 方法返回源代码字符串。
      3. 日期的 toString 方法返回一个可读的日期和时间字符串。
      4. RegExp 的 toString 方法返回一个表示正则表达式直接量的字符串。


    - **valueOf方法**
      valueOf，表示对象的原始值。默认的 valueOf 方法返回这个对象本身，数组、函数、正则简单的继承了这个默认方法，也会返回对象本身。日期是一个例外，它会返回它的一个内容表示: 1970 年 1 月 1 日以来的毫秒数。
  
  - 7.对象转字符串和数字（ ToPrimitive）
    - 总结
      **当用 String|Number 方法转化一个值的时候，如果是基本类型，就参照 “原始值转字符” | “原始值转数字” 这一节的对应表，如果不是基本类型，会将调用一个 ToPrimitive 方法，将其转为基本类型，然后再参照“原始值转字符” | “原始值转数字” 这一节的对应表进行转换**。
      |参数类型|结果|
      |:---:|:------:|
      |Object| 1.primValue = ToPrimitive(input, String); 2.返回ToString(primValue)|
      |Object| 1.primValue = ToPrimitive(input, Number); 2.返回ToNumber(primValue)|
    - ToPrimitive函数语法
      `
      ToPrimitive(input[, PreferredType])
      `
    - 具体参数
      1. 第一个参数是 input，表示要处理的输入值。

      2. 第二个参数是 PreferredType，非必填，表示希望转换成的类型，有两个值可以选，Number 或者 String。
        当不传入 PreferredType 时，如果 input 是日期类型，相当于传入 String，否则，都相当于传入 Number。

        如果传入的 input 是 Undefined、Null、Boolean、Number、String 类型，直接返回该值。

    - ToPrimitive(obj, Number)，处理步骤如下：

      1. 如果 obj 为 基本类型，直接返回
      2. 否则，调用 valueOf 方法，如果返回一个原始值，则 JavaScript 将其返回。
      3. 否则，调用 toString 方法，如果返回一个原始值，则 JavaScript 将其返回。
      4. 否则，JavaScript 抛出一个类型错误异常。
    - 如果是 ToPrimitive(obj, String)，处理步骤如下：

      1. 如果 obj为 基本类型，直接返回
      2. 否则，调用 toString 方法，如果返回一个原始值，则 JavaScript 将其返回。
      3. 否则，调用 valueOf 方法，如果返回一个原始值，则 JavaScript 将其返回。
      4. 否则，JavaScript 抛出一个类型错误异常。

  - 8.总结
    - 对象转字符串
      1. 如果对象具有 toString 方法，则调用这个方法。如果他返回一个原始值，JavaScript 将这个值转换为字符串，并返回这个字符串结果。
      2. 如果对象没有 toString 方法，或者这个方法并不返回一个原始值，那么 JavaScript 会调用 valueOf 方法。如果存在这个方法，则 JavaScript 调用它。如果返回值是原始值，JavaScript 将这个值转换为字符串，并返回这个字符串的结果。
      3. 否则，JavaScript 无法从 toString 或者 valueOf 获得一个原始值，这时它将抛出一个类型错误异常。
    - 对象转数字
      1. 如果对象具有 valueOf 方法，且返回一个原始值，则 JavaScript 将这个原始值转换为数字并返回这个数字
      2. 否则，如果对象具有 toString 方法，且返回一个原始值，则 JavaScript 将其转换并返回。
      3. 否则，JavaScript 抛出一个类型错误异常。

  - 9.JSON.stringify
    JSON.stringify() 方法可以将一个 JavaScript 值转换为一个 JSON 字符串，实现上也是调用了 toString 方法，也算是一种类型转换的方法
    1. 处理基本类型时，与使用toString基本相同，结果都是字符串，除了 undefined
    2. 布尔值、数字、字符串的包装对象在序列化过程中会自动转换成对应的原始值
    3. undefined、任意的函数以及 symbol 值，在序列化过程中会被忽略（出现在非数组对象的属性值中时）或者被转换成 null（出现在数组中时）。
    4. JSON.stringify 有第二个参数 replacer，它可以是数组或者函数，用来指定对象序列化过程中哪些属性应该被处理，哪些应该被排除。
    5. 如果一个被序列化的对象拥有 toJSON 方法，那么该 toJSON 方法就会覆盖该对象默认的序列化行为：不是那个对象被序列化，而是调用 toJSON 方法后的返回值会被序列化。

  - 10.一元操作符+
    **当 + 运算符作为一元操作符的时候，会调用 ToNumber 处理该值。**
    调用 ToNumber 方法，当输入的值是对象的时候，先调用 ToPrimitive(input,  Number) 方法，执行的步骤是：
    1. 如果 obj 为基本类型，直接返回
    2. 否则，调用 valueOf 方法，如果返回一个原始值，则 JavaScript 将其返回。
    3. 否则，调用 toString 方法，如果返回一个原始值，则JavaScript 将其返回。
    4. 否则，JavaScript 抛出一个类型错误异常。

  - 11.二元操作符+
    当计算 value1 + value2时：
    1. lprim = ToPrimitive(value1)
    2. rprim = ToPrimitive(value2)
    3. 如果 lprim 是字符串或者 rprim 是字符串，那么返回 ToString(lprim) 和 ToString(rprim)的拼接结果
    4. 否则，返回 ToNumber(lprim) 和 ToNumber(rprim)的运算结果

  - 12.==相等
  "==" 用于比较两个值是否相等，当要比较的两个值类型不一样的时候，就会发生类型的转换。
  【注意】全等运算符（===）需要类型且值均相等时才会返回true
  当执行x == y 时：
  1. 如果x与y是同一类型：
      1. x是Undefined，返回true
      2. x是Null，返回true
      3. x是数字：
            1. x是NaN，返回false
            2. y是NaN，返回false
            3. x与y相等，返回true
            4. x是+0，y是-0，返回true
            5. x是-0，y是+0，返回true
            6. 返回false
      4. x是字符串，完全相等返回true,否则返回false
      5. x是布尔值，x和y都是true或者false，返回true，否则返回false
      6. x和y指向同一个对象，返回true，否则返回false
  2. x是null并且y是undefined，返回true
  3. x是undefined并且y是null，返回true
  4. x是数字，y是字符串，判断x == ToNumber(y)
  5. x是字符串，y是数字，判断ToNumber(x) == y
  6. x是布尔值，判断ToNumber(x) == y
  7. y是布尔值，判断x ==ToNumber(y)
  8. x是字符串或者数字，y是对象，判断x == ToPrimitive(y)
  9. x是对象，y是字符串或者数字，判断ToPrimitive(x) == y
  10. 返回false

