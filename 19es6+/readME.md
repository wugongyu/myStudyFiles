# promise、async与await、generator
[studyLink](https://juejin.cn/post/6844904096525189128?searchId=20240902145114A6D043C791C0500681A2)

## promise
  ### promise所解决的问题
    在传统的异步编程中，如果异步之间存在依赖关系，我们就需要通过层层嵌套回调来满足这种依赖，如果嵌套层数过多，可读性和可维护性都变得很差，产生所谓“回调地狱”，而Promise将回调嵌套改为链式调用，增加可读性和可维护性。

  ### promise调用流程
  1. Promise的构造方法接收一个executor()，在new Promise()时就立刻执行这个executor回调
  2. executor()内部的异步任务被放入宏/微任务队列，等待执行
  3. then()被执行，收集成功/失败回调，放入成功/失败队列
  4. executor()的异步任务被执行，触发resolve/reject，从成功/失败队列中取出回调依次执行

    #### 观察者模式
    可以发现promise调用流程应用了观察者模式，这种收集依赖 -> 触发通知 -> 取出依赖执行 的方式，被广泛运用于观察者模式的实现，在Promise里，执行顺序是then收集依赖 -> 异步触发resolve -> resolve执行依赖。

  ### promise A+ 规范
  核心规则：
  - Promise本质是一个状态机，且状态只能为以下三种：Pending（等待态）、Fulfilled（执行态）、Rejected（拒绝态），状态的变更是单向的，只能从Pending -> Fulfilled 或 Pending -> Rejected，状态变更不可逆
  - then方法接收两个可选参数，分别对应状态改变时触发的回调。then方法返回一个promise。then 方法可以被同一个 promise 调用多次。

  ### promise then的链式调用
  1. 显然.then()需要返回一个Promise，这样才能找到then方法，所以我们会把then方法的返回值包装成Promise。
  2. .then()的回调需要拿到上一个.then()的返回值
  3. .then()的回调需要顺序执行，以上面这段代码为例，虽然中间return了一个Promise，但执行顺序仍要保证是1->2->3。我们要等待当前Promise状态变更后，再执行下一个then收集的回调，这就要求我们对then的返回值分类讨论

  ### Promise.prototype.catch()
  catch()方法返回一个Promise，并且处理拒绝的情况。它的行为与调用Promise.prototype.then(undefined, onRejected) 相同。


  ### Promise.prototype.finally()
  finally(callback?)方法返回一个Promise。在promise结束时，无论结果是fulfilled或者是rejected，都会执行指定的回调函数。在finally之后，还可以继续then。并且会将值原封不动的传递给后面的then。

  ### Promise.resolve
  Promise.resolve(value)方法返回一个以给定值解析后的Promise 对象。如果该值为promise，返回这个promise；如果这个值是thenable（即带有"then" 方法)），返回的promise会“跟随”这个thenable的对象，采用它的最终状态；否则返回的promise将以此值完成。此函数将类promise对象的多层嵌套展平。

  ### Promise.reject
  Promise.reject()方法返回一个带有拒绝原因的Promise对象。
  
  ### Promise.race
  Promise.race(iterable)方法返回一个 promise，一旦迭代器中的某个promise解决或拒绝，返回的 promise就会解决或拒绝。

  ### Promise.all
  Promise.all(iterable)方法返回一个 Promise 实例，此实例在 iterable 参数内所有的 promise 都“完成（resolved）”或参数中不包含 promise 时回调完成（resolve）；如果参数中  promise 有一个失败（rejected），此实例回调失败（reject），失败原因的是第一个失败 promise 的结果。

## async await
  ### async/await的使用意义
  在多个回调依赖的场景中，尽管Promise通过链式调用取代了回调嵌套，但过多的链式调用可读性仍然不佳，流程控制也不方便，ES7 提出的async 函数（async/await暂停执行的机制），终于让 JS 对于异步操作有了终极解决方案，简洁优美地解决了以上两个问题。

  ### async/await 本质 
  async/await实际上是对Generator（生成器）的封装，是一个语法糖。
  #### 深入generator
  > ES6 新引入了 Generator 函数，可以通过 yield 关键字，把函数的执行流挂起，通过next()方法可以切换到下一个状态，为改变执行流程提供了可能，从而为异步编程提供解决方案。
  也可以通过给next()传参, 让yield具有返回值

  ##### 用法
  generator是一个构造器函数，在function后面添加星号（*）可以使函数变成构造器函数，且函数默认返回一个generator对象。

  ##### 返回的generator对象
  在generator对象中分别拿到了value和done。done好理解，代表generator内部是否执行完毕，value拿到的是紧跟在yield后面的值且默认值为undefined。也就是说每当我们调用一次next，就会得到一个新的generator对象，里面有两个键值对，分别代表yield后面的值，以及内部代码是否执行完毕。注意，yield的值会被next传入的参数代替。

  ##### next 方法
  每调用一次next()方法，就是顺序在对应的yield关键字的位置暂停，遵守迭代器协议，返回例如这样形式的对象（generator对象）： {value:”1″,done:false}，直到所有的yield的值消费完为止，再一次调用next()方法生成器函数会返回 {value:undefined,done:true},说明生成器的所有值已消费完。

  ##### return(value)方法
  在生成器里使用return(value)方法，随时终止生成器
  ```js
  function *generator_function(){ 
    yield 1; 
    yield 2; 
    yield 3;
  }
  const generator = generator_function();
  console.log(generator.next().value); //1
  console.log(generator.return(22).value); //22
  console.log(generator.next().done);//true

  ```

  ##### throw(exception)方法
  调用 throw(exception) 进行提前终止生成器
  ```js
  function *generator_function(){ 
    yield 1;
    yield 2;
    yield 3;    
  }
  const generator = generator_function();
  console.log(generator.next());
  try{
      generator.throw("wow");
  }
  catch(err){
      console.log(err);
  }
  finally{
      console.log("clean")
  }
  console.log(generator.next());
  // 输出结果
  // { value: 1, done: false }
  // wow
  // clean
  // { value: undefined, done: true }

  ```

  ##### 还可以在生成器内部插入try…catch进行错误处理: 
  ```js
  function *generator_function(){ 
  try { 
  yield 1; 
  } catch(e) { 
  console.log("1st Exception"); 
  } 
  try { 
  yield 2; 
  } catch(e) { 
  console.log("2nd Exception"); 
  }
  }
  const generator = generator_function();
  console.log(generator.next().value);
  console.log(generator.throw("exception string").value);
  console.log(generator.throw("exception string").done);
  // 输出结果
  // 1
  // 1st Exception
  // 2
  // 2nd Exception
  // true
  ```
  由输出结果可看出，当我们在generator.throw()方法时，被生成器内部上个暂停点的异常处理代码所捕获，同时可以继续返回下个暂停点的值。由此可见在生成器内部使用try…catch可以捕获异常，**并不影响值的下次消费，遇到异常不会终止。**

  ##### 向生成器传递数据
  生成器不但能对外输出数据，同时也可以向生成器内部传递数据。
  ```js
  function *generator_function(){ 
    const a = yield 12;
    const b = yield a + 1;
    const c = yield b + 2; 
    yield c + 3; // Final Line
  }
  const generator = generator_function();
  console.log(generator.next().value);
  console.log(generator.next(5).value);
  console.log(generator.next(11).value);
  console.log(generator.next(78).value);
  console.log(generator.next().done);

  // 执行结果
  // 12
  // 6
  // 13
  // 81
  // true
  ```
  执行过程说明：
  1. 第一次调用generator.next()，调用yield 12，并返回值12，相当启动生成器。并在 yield 12 处暂停。
  2. 第二次调用我们向其进行传值generator.next(5)，前一个yield 12这行暂停点获取传值，并将5赋值给a, 忽略12这个值，然后运行至 yield (a + 1) 这个暂停点，因此是6，并返回给value属性。并在 yield a + 1 这行暂停。
  3. 第三次调用next，同理在第二处暂停进行恢复，把11的值赋值给b，忽略a+1运算，因此在yield b + 2中，返回13，并在此行暂停。
  4. 第四次调用next，函数运行到最后一行，C变量被赋值78，最后一行为加法运算，因此value属性返回81。
  5. 再次运行next()方法，done属性返回true,生成器数值消费完毕。

  从上述步骤说明中，向生成器传递数据，首行的next方法是启动生成器，即使向其传值，也不能进行变量赋值，你可以拿上述例子进行实验，无论你传递什么都是徒劳的，**因为传递数据只能向上个暂停点进行传递，首个暂停点不存在上个暂停点。**

  ### */yield和async/await区别
  - async/await自带执行器，不需要手动调用next()就能自动执行下一步
  - async函数返回值是Promise对象，而Generator返回的是生成器对象
  - await能够返回Promise的resolve/reject的值

  ### generator调用流程分析
  ```js
  // 生成器函数根据yield语句将代码分割为switch-case块，后续通过切换_context.prev和_context.next来分别执行各个case
  function gen$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return 'result1';

        case 2:
          _context.next = 4;
          return 'result2';

        case 4:
          _context.next = 6;
          return 'result3';

        case 6:
        case "end":
          return _context.stop();
      }
    }
  }

  // 低配版context  
  var context = {
    next:0,
    prev: 0,
    done: false,
    stop: function stop () {
      this.done = true
    }
  }

  // 低配版invoke
  let gen = function() {
    return {
      next: function() {
        value = context.done ? undefined: gen$(context)
        done = context.done
        return {
          value,
          done
        }
      }
    }
  } 

  // 测试使用
  var g = gen() 
  g.next()  // {value: "result1", done: false}
  g.next()  // {value: "result2", done: false}
  g.next()  // {value: "result3", done: false}
  g.next()  // {value: undefined, done: true}

  ```
  1. 我们定义的function* 生成器函数进行代码转化
  2. 转化后的代码分为三大块：
    - gen$(_context)由yield分割生成器函数代码而来
    - context对象用于储存函数执行上下文
    - invoke()方法定义next()，用于执行gen$(_context)来跳到下一步
  3. 当我们调用g.next()，就相当于调用invoke()方法，执行gen$(_context)，进入switch语句，switch根据context的标识，执行对应的case块，return对应结果
  4. 当生成器函数运行到末尾（没有下一个yield或已经return），switch匹配不到对应代码块，就会return空值，这时g.next()返回{value: undefined, done: true}

  **Generator实现的核心在于上下文的保存**，函数并没有真的被挂起，每一次yield，其实都执行了一遍传入的生成器函数，只是在这个过程中间用了一个context对象储存上下文，使得每次执行生成器函数的时候，都可以从上一个执行结果开始执行，看起来就像函数被挂起了一样。

