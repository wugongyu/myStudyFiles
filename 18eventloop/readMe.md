# EventLoop（浏览器）

## 进程与线程
  **js为单线程语言**。最早javaScript这门语言单是一门运行在浏览器端的脚本语言，他的目的是为了实现页面上的动态交互。而实现页面交互的核心就是dom操作，这也就决定了他必须使用单线程模型，否则就会出现很复杂的线程同步问题。

  ### 进程
  进程是操作系统中的一个基本概念，它表示正在运行的一个程序的实例。每个进程都有自己独立的地址空间，包括代码、数据、堆栈等，同时还包括了进程所需的一些系统资源，比如文件描述符、信号处理设置等。进程之间一般是相互独立的，彼此不会影响。

  ### 线程
  线程是进程中的一个实体，是 CPU 调度和分派的基本单位。一个进程可以包含多个线程，这些线程共享进程的地址空间和系统资源，但每个线程有自己的调用栈和局部变量。多线程使得程序可以进行并发执行，提高了程序的效率和响应速度。

  ### 关系
  进程是程序的执行实例，包含了程序的代码、数据和系统资源；而线程是进程中的执行单元，多个线程可以共享进程的资源，实现并发执行。

## 同步与异步
  js的单线程是的执行任务时只能按序依次执行，为解决耗时任务阻塞问题，js将任务执行分为同步与异步模式。
  ### 同步
  同步操作是指程序按照顺序依次执行，每个操作都要等待上一个操作完成后才能进行。换句话说，当一个操作在执行时，程序会阻塞，直到该操作完成后才会执行下一个操作。这种执行方式简单直观，但可能会导致程序的响应速度变慢，特别是在处理大量耗时操作时。

  ### 异步
  异步操作是指程序中的操作可以同时进行，不需要等待上一个操作完成才能进行下一个操作。异步操作通常会通过回调函数、Promise 或者 async/await 等机制来处理。这种执行方式可以提高程序的效率和响应速度，特别适合处理大量的I/O操作或网络请求。

## 调用栈与任务队列
  js  在自上而下的执行过程中会涉及到调用栈和任务队列，执行中的代码会放在调用栈中按序执行，而宏任务与微任务会放在任务队列中“等待”执行。

  ### 栈与队列
  栈与队列均为结构化内存，栈遵循LIFO后进先出规则，队列遵循FIFO先进先出规则。
  ### 调用栈(call stack)
  调用栈指的是一种代码的运行方式。

  被调用函数或子例程的返回的地址会被推入执行栈中，当这个过程完成后，返回的地址就会从调用栈中弹出，并且将这种控制调用栈的权利转移给该地址，
  如果调用函数（子例程）中又调用了其他函数（子例程），就又会重复上述操作。

  以函数举例，也就是说，当函数被调用时，它就会进入执行栈，然后执行函数，遇到返回（return）的时候，这个函数就会被弹出栈，如果函数返回的又是一个函数，就会实现一种层层调用。
  ### 任务队列
  javascript是**单线程运行**的，也就是说，所有的任务都是排队执行的，只有一个任务被处理完成后，才会去处理另一个任务。
  如果有的任务处理需要消耗很多时间，就会带来阻塞。
  而javascript的一大特点就是**非阻塞**的，实现非阻塞主要是依靠**任务队列**这一机制。
  
  - 任务进入执行栈中，判断是同步还是异步

  - 若是同步，直接进入主线程按照调用栈的顺序被执行

  - 若是异步，则进行一些处理，再将回调函数推入任务队列

  - 当主线程中的同步任务执行完成后，执行栈为空，开始读取任务队列

  - 任务队列中的任务依次进入执行栈被执行，直到任务队列为空

  - 完成

  ### 宏任务与微任务
    异步任务中，分为宏任务（macro task）与微任务（micro task）

    #### 宏任务（macro task）
    浏览器为了能够使js的内部task(任务)与DOM任务有序的执行，会在前一个task执行完毕后并且在下一个task执行开始前，对页面进行重新渲染（render），这里说的task就是指宏任务。
    宏任务一般包括：
    - script(整体代码)
    - setTimeout
    - setInterval
    - setImmediate（node）
    - I/O（node）
    - UI render


    #### 微任务（micro task）
    微任务通常来说就是在当前task执行结束后立即执行的任务，比如对一系列动作做出反馈，或者是需要异步的执行任务但是又不需要分配一个新的task，这样可以减小一点性能的开销。

    只要执行栈中没有其他JS代码正在执行或者每个宏任务执行完，微任务队列会立即执行。

    如果在微任务执行期间微任务队列中加入了新的微任务，就会把这个新的微任务加入到队列的尾部，之后也会被执行。
    微任务包括：
    - promise
    - async
    - await
    - process.nextTick(node)
    - mutationObserver(html5新特性)

## EventLoop事件循环机制 （浏览器）
  事件循环机制：
  - 首先JavaScript代码从上到下执行，遇到同步代码直接执行；
  - 每遇到定时器等宏任务会将任务放在宏任务队列中；
  - 遇到Promise.then等微任务会将任务放入到微任务队列中。
  - 等到主执行栈中的代码执行完毕，会清空微任务队列，先加入的先执行后加入的后执行；
  - 然后再去检查宏任务队列，将可执行的宏任务拿到执行栈中执行，**每次只取出一个宏任务，执行完毕再次清空微任务队列**，清空完毕再去检查宏任务队列；
  - 以此类推。

  ### 注意
  - new Promise传入的函数是同步代码， 立刻就会被执行
  ```js
  const promise = new Promise((resolve, reject) => {
    console.log(1);
    resolve();
    console.log(2);
  });
  promise.then(() => {
      console.log(3);
  });

  // 1， 2， 3
  ```
  - async await
  async和await就是Promise的语法糖，Promise.then会创建微任务，那么async函数在什么时候会创建微任务呢？

  async函数中的await的函数相当于Promise实例化时传入的那个函数，会立即被执行。await那一行下面的代码会作为微任务放入到微任务队列中。

  我们知道Promise.then需要等到Promise传入的函数执行了resolve或者reject后才会进入执行序列。同理await后面的代码也需要等到await的那个函数执行之后才会进入执行序列。语法糖只是写法不同，原理还是相同的。

  ```js
  async function async1() {
  console.log('async1 start')
  await async2()
  console.log('async1 end')
  }
  
  async function async2() {
    console.log('async2')
  }
  
  console.log('script start')
  setTimeout(function() {
    console.log('setTimeout')
  }, 0)
  
  async1(); 
    
  new Promise( function( resolve ) {
  console.log('promise1')
  resolve();
  }).then( function() {
  console.log('promise2')
  })
 
  // 输出结果
  // script start => async1 start => async2 => promise1 => async1 end => promise2 => setTimeout

  ```

# EventLoop（nodeJS）
  ## node.js相对于浏览器而言不同的异步任务API
  ### 微任务（micro task）
  - Process.nextTick
    Process.nextTick 的执行时机即是在同步任务执行完毕后，即将将 微任务 推入栈中时优先会将 Process.nextTick 推入栈中进行执行。
    Process.nextTick 简单来说就是表示当前调用栈清空后立即执行的逻辑，其实完全可以将它理解成一个 micro （虽然官方并不将它认为是 EventLoop 中的一部分）。

  ### 宏任务（macro task）
  - setImmediate
    setImmediate是 NodeJs 中的 API
    当要异步地（但要尽可能快）执行某些代码时，使用 setImmediate() 函数。
  - I/O操作
    NodeJs 是 JavaScript 脱离了浏览器 V8 的执行环境下的另一个 Runtime，这也就意味着利用 NodeJS 我们可以进行 I/O 操作（比如从网络读取、访问数据库或文件系统）。
    关于 I/O 操作，它产生的 callback 会放在宏任务队列来处理。

  ## node.js的事件循环机制
    其实 NodeJs 中的事件循环机制主要就是基于以下几个阶段，但是对于我们比较重要的来说仅仅只有 timers、poll 和 check 阶段，因为这三个阶段影响着我们代码书写的执行顺序。
    至于 pending callbacks、idle, prepare 、close callbacks 其实对于我们代码的执行顺序并不存在什么强耦合，甚至有些时候我们完全不必在意他们。

    - timers 阶段【重要】
      在 timers 阶段会执行已经被 setTimeout() 和 setInterval() 的调度回调函数。

    - pending callbacks 阶段。
      上一次循环队列中，还未执行完毕的会在这个阶段进行执行。比如延迟到下一个 Loop 之中的 I/O 操作。

    - idle, prepare
      其实这一步无需过多关注，它仅仅是在 NodeJs 内部调用。我们无法进行操作这一步，所以仅仅了解存在 idle prepare 这一层即可。

    - poll【重要】
      这一阶段被称为轮询阶段，它主要会检测新的 I/O 相关的回调，需要注意的是这一阶段会存在阻塞（也就意味着这之后的阶段可能不会被执行）。

    - check【重要】
      check 阶段会检测 setImmediate() 回调函数在这个阶段进行执行。

    - close callbacks
      这个阶段会执行一系列关闭的回调函数，比如如：socket.on('close', ...)。

  ## nodeJS的EventLoop整体流程
    [图]('./eventloop.png')
    注意，图中的Loop是从 timer 阶段之后开始的 Loop 。
    - 按序执行同步代码，主调用栈执行结束
    - 优先处理 process.nextTick 以及之前产生的所有微任务（process.nextTick 可以理解为拥有最高优先级的微任务）
    - 进入宏任务处理阶段
      - 进入timers 定时器 回调处理阶段
        进入 timers 阶段时，会检查 timers 中是否存在满足条件的定时器任务。当存在时，**会依次取出对应的 timer （定时器产生的回调）推入 stack （JS执行栈）中进行执行**。
        **每次任务执行完毕会清空随之产生的 Process.nextTick以及微任务**。
      - poll阶段
        此后，在清空队列中所有的 timer 后，Loop 进入 poll 阶段进行轮询，此阶段首先会检查是否存在对应 I/O 的回调。
        如果**存在 I/O 相关 回调，那么推入对应 JS 调用栈进行执行，同样每次任务执行完毕会伴随清空随之产生的 Process.nextTick 以及 微任务**。
        当然，如果本次阶段即使产生了 timer 也并不会在本次 Loop 中执行，因为此时 EventLoop 已经到达 poll 阶段了。
        需要额外注意的是在 poll 轮询阶段，会发生以下情况：
          - 如果 轮询 队列 不是空的 ，事件循环将循环访问回调队列并同步执行它们，直到队列已用尽，或者达到了与系统相关的硬性限制。


          - 如果 轮询 队列 是空的 ，还有两件事发生：
            - 如果脚本被 setImmediate() 调度，则事件循环将结束 poll(轮询) 阶段，并继续 check(检查) 阶段以执行那些被调度的脚本。
            - 如果脚本 未被 setImmediate()调度，则事件循环将等待回调被添加到队列中，然后立即执行。
    ```js
    setImmediate(() => {
      console.log('immediate1 开始')
      Promise.resolve().then(() => console.log('immediate' + 1, '微任务执行'));
      Promise.resolve().then(() => console.log('immediate' + 2, '微任务执行'));
      console.log('immediate1 结束');
    });

    setImmediate(() => {
      console.log('immediate2 开始');
      Promise.resolve().then(() => console.log('immediate' + 3, '微任务执行'));
      Promise.resolve().then(() => console.log('immediate' + 4, '微任务执行'));
      console.log('immediate2 结束');
    });
    /*  log
        immediate1 开始
        immediate1 结束
        immediate1 微任务执行
        immediate2 微任务执行
        immediate2 开始
        immediate2 结束
        immediate3 微任务执行
        immediate4 微任务执行 */

    ```

# nodeJs与浏览器的事件循环
  在分别了解了不同环境下的 EventLoop 执行机制后，会发现其实浏览器中和 Node 中的事件循环 EventLoop 本质上执行机制是完全相同的，都是执行完一个宏(macro)任务后清空本次队列中的微(micro)任务，然后再执行下一个宏任务。
  只不过唯一不同的就是 NodeJs 中针对于 EventLoop 实现一些自定义的额外队列，它是基于Libuv 中自己实现的事件机制。
