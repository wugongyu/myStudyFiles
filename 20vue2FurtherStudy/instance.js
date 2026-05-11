/**
 * Vue的实例方法
 * */ 

Vue.prototype.$on = function(event, fn) {
  const vm = this;
  if(Array.isArray(event)) {
    for (let i = 0; i < event.length; i++) {
      const currentEvt = event[i];
      vm.$on(currentEvt, fn)
    }
  } else {
    (vm._events[event] || (vw._events[event] = [])).push(fn);
  }
  return vm;
}

Vue.prototype.$off = function(event, fn) {
  const vm = this;
  if(arguments.length === 0) {
    vm._events = Object.create(null);
    return vm;
  }

  if(Array.isArray(event)) {
    for (let i = 0; i < event.length; i++) {
      vm.$off(event, fn);
    }
    return vm;
  }

  const callback = vm._events[event];
  if(!callback) {
    return vm;
  }

  // 移除该事件的所有监听器
  if(arguments.length === 1) {
    vm._events[event] = null;
    return vm;
  }

  // 只移除与fn相同的event的监听器
  if(fn) {
    const targetCallbacks = vm._events[event];
    let cb;
    let i = targetCallbacks.length;
    // 注意这里是从后向前循环，避免移除当前监听器时，后面的监听器向前移动一个位置而导致下一轮循环时跳过一个元素
    while(i--) {
      cb = targetCallbacks[i];
      if(cb === fn || cb.fn === fn) {
        targetCallbacks.splice(i, 1);
        break;
      }
    }
  }

  return vm;
}

Vue.prototype.$once = function(event, fn) {
  const vm = this;

  // 拦截器
  function on() {
    vm.$off(event, fn);
    fn.apply(vm, arguments);
  }

  // 注意这行代码，由于用户传入的函数fn与最终注册的拦截器世界是不相同的，如果没有这行代码，移除操作就会失败
  on.fn = fn;
  vm.$on(event, on);
  return vm;
}

Vue.prototype.$emit = function(event){
  const vm = this;
  let cbs = vm._events[event];
  if(cbs) {
    const args = [...arguments].slice(1)
    for (let i = 0; i < cbs.length; i++) {
      const cb = cbs[i];
      try {
        cb.apply(vm, args);
      } catch (error) {
        console.log(error);
      }
    }
  }
}

Vue.prototype.$forceUpdate = function() {
  const vm = this;
  if(vm._watcher) {
    vm._watcher.update();
  }
}

Vue.prototype.$destroy = function() {
  const vm = this;
  if(vm._isBeingDestroyed) {
    return;
  }
  // 触发钩子函数
  callHook('vm', 'beforeDestroy');
  vm._isBeingDestroyed = true;
}