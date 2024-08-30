function Promise(executor) {
  var self = this;
  self.status = 'pending' // Promise当前的状态
  self.data = undefined  // Promise的值
  self.onResolvedCallback = [] // Promise resolve时的回调函数集，因为在Promise结束之前有可能有多个回调添加到它上面
  self.onRejectedCallback = [] // Promise reject时的回调函数集，因为在Promise结束之前有可能有多个回调添加到它上面
  function resolve(value) {
    // 异步执行所有回调
    setTimeout(function() {
      if(self.status === 'pending') {
        self.status = 'resolved';
        self.data = value;
        for (var i = 0; i < self.onResolvedCallback.length; i++) {
          self.onResolvedCallback(value);
        }
      }
    })
  }
  function reject(reason) {
    // 异步执行所有回调
    setTimeout(function() {
      if(self.status === 'pending') {
        self.status = 'rejected';
        self.data = reason;
        for (var i = 0; i < self.onRejectedCallback.length; i++) {
          self.onRejectedCallback(reason);
        }
      }
    })
  }
  // 利用try catch捕捉执行executor过程中可能出现的错误
  try {
    executor(resolve, reject);// 执行executor并传入相应的参数
  } catch (error) {
    reject(error);
  }
}

// 不同的Promise之间能够交互 交互规则-- https://promisesaplus.com/#point-46
/*
resolvePromise函数即为根据x的值来决定promise2的状态的函数
也即标准中的[Promise Resolution Procedure](https://promisesaplus.com/#point-47)
x为`promise2 = promise1.then(onResolved, onRejected)`里`onResolved/onRejected`的返回值
`resolve`和`reject`实际上是`promise2`的`executor`的两个实参，因为很难挂在其它的地方，所以一并传进来。
相信各位一定可以对照标准把标准转换成代码，这里就只标出代码在标准中对应的位置，只在必要的地方做一些解释
*/
function resolvePromise(promise2, x, resolve, reject) {
  var then
  var thenCalledOrThrow = false

  if (promise2 === x) { // 对应标准2.3.1节
    return reject(new TypeError('Chaining cycle detected for promise!'))
  }

  if (x instanceof Promise) { // 对应标准2.3.2节
    // 如果x的状态还没有确定，那么它是有可能被一个thenable决定最终状态和值的
    // 所以这里需要做一下处理，而不能一概的以为它会被一个“正常”的值resolve
    if (x.status === 'pending') {
      x.then(function(value) {
        resolvePromise(promise2, value, resolve, reject)
      }, reject)
    } else { // 但如果这个Promise的状态已经确定了，那么它肯定有一个“正常”的值，而不是一个thenable，所以这里直接取它的状态
      x.then(resolve, reject)
    }
    return
  }

  if ((x !== null) && ((typeof x === 'object') || (typeof x === 'function'))) { // 2.3.3
    try {

      // 2.3.3.1 因为x.then有可能是一个getter，这种情况下多次读取就有可能产生副作用
      // 即要判断它的类型，又要调用它，这就是两次读取
      then = x.then 
      if (typeof then === 'function') { // 2.3.3.3
        then.call(x, function rs(y) { // 2.3.3.3.1
          if (thenCalledOrThrow) return // 2.3.3.3.3 即这三处谁选执行就以谁的结果为准
          thenCalledOrThrow = true
          return resolvePromise(promise2, y, resolve, reject) // 2.3.3.3.1
        }, function rj(r) { // 2.3.3.3.2
          if (thenCalledOrThrow) return // 2.3.3.3.3 即这三处谁选执行就以谁的结果为准
          thenCalledOrThrow = true
          return reject(r)
        })
      } else { // 2.3.3.4
        resolve(x)
      }
    } catch (e) { // 2.3.3.2
      if (thenCalledOrThrow) return // 2.3.3.3.3 即这三处谁选执行就以谁的结果为准
      thenCalledOrThrow = true
      return reject(e)
    }
  } else { // 2.3.4
    resolve(x)
  }
}

// then方法返回一个新的Promise
Promise.prototype.then = function(onResolved, onRejected) {
  var self = this;
  var promise2;

  // 未传参时，自定义函数需将参数返回/抛出错误以实现then方法的值的穿透
  onResolved = typeof onResolved === 'function' ? onResolved : function(value) { return value }; 
  onRejected = typeof onRejected === 'function' ? onRejected : function(reason) { throw reason };
  if(self.status !== 'pending') {
    return promise2 = new Promise(function(resolve, reject) {
      // 异步执行onResolved|onRejected
      setTimeout(function() {
        try {
          var x = self.status === 'resolved' ? onResolved(self.data) : onRejected(self.data);
          resolvePromise(promise2, x, resolve, reject);
          // if(x instanceof Promise) {
          //   x.then(resolve, reject); //  如果onResolved的返回值是一个Promise对象，直接取它的结果做为promise2的结果
          // }
          // resolve(x); // 否则以它的返回值作为promise2的结果
        } catch (error) {
          reject(error); // 如果出错，以捕获到的错误做为promise2的结果
        }
      })
    })
  }
  // if(self.status === 'rejected') {
  //   return promise2 = new Promise(function(resolve, reject) {
  //     // 异步执行onRejected
  //     setTimeout(function() {
  //       try {
  //         var x = onRejected(self.data);
  //         resolvePromise(promise2, x, resolve, reject);
  //         // if(x instanceof Promise) {
  //         //   x.then(resolve, reject);
  //         // }
  //       } catch (error) {
  //         reject(error);
  //       }
  //     })
  //   })
  // }
  // 如果当前的Promise还处于pending状态，并不能确定调用onResolved还是onRejected，
  // 只能等到Promise的状态确定后，才能确定如何处理。
  // 所以需要把**两种情况**的处理逻辑作为callback放入promise1(此处即this/self)的回调数组里
  // 逻辑本身跟第一个if块内的几乎一致，此处不做过多解释
  if(self.status === 'pending') {
    return promise2 = new Promise(function(resolve, reject) {
      // 这里之所以没有异步执行，是因为这些函数必然会被resolve或reject调用，而resolve或reject函数里的内容已是异步执行，构造函数里的定义
      self.onResolvedCallback.push(function(value) {
        try {
          var x = onResolved(value);
          resolvePromise(promise2, x, resolve, reject);
          // if(x instanceof Promise) {
          //   x.then(resolve, reject);
          // }
        } catch (error) {
          reject(error);
        }
      });
      self.onRejectedCallback.push(function(reason) {
        try {
          var x = onRejected(reason);
          resolvePromise(promise2, x, resolve, reject);
          // if(x instanceof Promise) {
          //   x.then(resolve, reject);
          // }
        } catch (error) {
          reject(error)
        }
      })
    })
  }
}
Promise.prototype.catch = function(onRejected) {
  return this.then(null, onRejected);
}

// Promise的延时对象deferred|defer
/*
deferred 主要是用于内部，用于维护异步模型的状态；Promise 则作用于外部，通过 then() 方法暴露给外部以添加自定义逻辑
*/ 
Promise.deferred = Promise.defer = function() {
  var dfd = {};
  dfd.promise = new Promise(function(resolve, reject) {
    dfd.resolve = resolve;
    dfd.reject = reject;
  });
  return dfd;
}

// 停止promise链
/*
传入的executor函数什么也不做，
这就意味着这个Promise将永远处于pending状态，
由于then返回的Promise会直接取这个永远处于pending状态的Promise的状态，
于是返回的这个Promise也将一直处于pending状态，后面的代码也就一直不会执行了，从而实现promise链的中止
【问题】链式调用后面的所有回调函数都无法被垃圾回收器回收
*/ 
Promise.cancel = Promise.stop = function() {
  return new Promise(function() {

  })
}


var x = new Promise(function(resolve, reject) {
  // resolve(1);
});
// var x2 = x.then(function() {
//   return 
// })
// console.log(x.then());
new Promise(resolve=>resolve(8))
  .then()
  .then()
  .then(function(value) {
    console.log(value)
  })
