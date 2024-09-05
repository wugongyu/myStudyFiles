const PENDING = 'pending';
const RESOLVED = 'resolved';
const REJECTED = 'rejected';
class MyPromise {
  constructor(executor) {
    _status = PENDING; // promise状态
    _value = undefined; // promise值
    _onResolvedCallbackQueue = [];
    _onRejectedCallbackQueue = [];
    let _resolve = (val) => {
      let run = () => {
        if(this._status !== PENDING) return; // 状态只能由pending到fulfilled或rejected
        this._status = RESOLVED; 
        this._value = val;
        // 这里之所以使用一个队列来储存回调,是为了实现规范要求的 "then 方法可以被同一个 promise 调用多次"
        // 如果使用一个变量而非队列来储存回调,那么即使多次p1.then()也只会执行一次回调
        while(this._onResolvedCallbackQueue.length) {
          const callback = this._onResolvedCallbackQueue.shift(); // 队列先进先出
          callback(val);
        }
      }
      setTimeout(run); // 将回调放进宏任务列表中
    }
    let _reject = (reason) => {
      let run = () => {
        if(this._status !== PENDING) return;
        this._status = REJECTED;
        this._value = reason;
        while(this._onRejectedCallbackQueue.length) {
          const callback = this._onRejectedCallbackQueue.shift();
          callback(reason);
        }
      }
      setTimeout(run); // 将回调放进宏任务列表中
    }
    executor(_resolve, _reject); // 立即调用执行器
  }
  then(resolveFn, rejectFn) {
    // 根据规范，如果then的参数不是function，则我们需要忽略它, 让链式调用继续往下执行
    typeof resolveFn !== 'function' ? resolveFn = (value) => value : null;
    typeof rejectFn !== 'function' ? rejectFn = (reason) => {throw new Error(reason instanceof Error ? reason.message : reason)} : null;
    // 返回一个新的Promise
    return new MyPromise((resolve, reject) => {
      let newResolveFn = (value) => {
        try {
          // 执行第一个(当前的)Promise的成功回调,并获取返回值
          let v = resolveFn(value)
          // 分类讨论返回值,如果是Promise,那么等待Promise状态变更,否则直接resolve
          v instanceof MyPromise ? v.then(resolve, reject) : resolve(v);
        } catch (error) {
          reject(error)
        }
      }
      let newRejectFn = (reason) => {
        try {
          let r = rejectFn(reason);
          r instanceof MyPromise ? r.then(resolve, reject) : resolve(r)
        } catch (error) {
          reject(error)
        }
      }
      switch (this._status) {
        case PENDING:
          this._onResolvedCallbackQueue.push(newResolveFn);
          this._onRejectedCallbackQueue.push(newRejectFn);
          break;
        case RESOLVED:
          newResolveFn(this._value);
        case REJECTED:
          newRejectFn(this._value);
        default:
          break;
      }
    })
  }
  catch(rejectFn) {
    return this.then(undefined, rejectFn);
  }
  finally(callback) {
    return this.then(
      value => MyPromise.resolve(callback()).then(() => value),
      reason => MyPromise.resolve(callback()).then(() => { throw reason })
    )
  }
  static resolve(value) {
    if(value instanceof MyPromise) return value;
    return new MyPromise((resolve) => resolve(value))
  }
  static reject(reason) {
    return new MyPromise((resolve, reject) => reject(reason))
  }
  static all(promiseArr) {
    let index = 0;
    let result = []
    return new MyPromise((resolve, reject) => {
      promiseArr.forEach((p, i) => {
        //Promise.resolve(p)用于处理传入值不为Promise的情况
        MyPromise.resolve(p).then((value) => {
          index++;
          result[i] = value;
          // 所有then执行后resolve结果
          if(index === promiseArr.length) {
            resolve(result);
          }
        },
        //有一个Promise被reject时，MyPromise的状态变为reject
        (reason) => reject(reason)
        )
      });
    })
  }
  static race(promiseArr) {
    return new MyPromise((resolve, reject)=> {
      for (let p in promiseArr) {
        MyPromise.resolve(p).then(
          (value) => resolve(value), 
          reason => reject(reason)
        )
      }
    })
  }
}