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


