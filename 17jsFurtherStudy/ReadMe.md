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
    1. 参数传递类型
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
  1. bind 方法
  bind() 方法会创建一个新函数。当这个新函数被调用时，bind() 的第一个参数将作为它运行时的 this，之后的一序列参数将会在传递的实参前传入作为它的参数。

  2. bind 方法特点
    1. 返回一个函数
    2. 可以传入参数
    3. 一个绑定函数也能使用new操作符创建对象：这种行为就像把原函数当成构造器。提供的 this 值被忽略，同时调用时的参数被提供给模拟函数。
    即当 bind 返回的函数作为构造函数的时候，bind 时指定的 this 值会失效，但传入的参数依然生效。

## 十二.new
  1. new 运算符
  new 运算符创建一个用户定义的对象类型的实例或具有构造函数的内置对象类型之一。
  创建的实例对象：
    1. 可以访问构造函数里的属性。
    2. 可以访问构造函数原型中的属性。


  2. 几点注意
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


