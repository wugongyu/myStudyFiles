var data = {};

export function isObject(val) {
  return typeof val === 'object';
}

export function hasOwn(value, key) {
  if(!isObject(value)) return false;
  // 需检查是否包含原型上的属性，可用 in 检查，只检查自身属性，用Object.hasOwn 或 Object.hasOwnProperty
  return Object.hasOwn(value, key);
}

function remove(arr, item) {
  if(!arr.length) return;
  const index = arr.indexOf(item);
  if(index > -1) {
    arr.splice(index, 1);
  }
}

/**
 * 解析简单路径
 * */ 
const baseReg = /[^\w.$]/
export function parsePath(path) {
  if(baseReg.test(path)) return;
  const segments = path.split('.');
  return function(obj) {
    for (let i = 0; i < segments.length; i++) {
      const element = segments[i];
      if(!obj) return;
      obj = obj[element];
    }
    return obj;
  }
}

/** 
 * 为value创建Observer实例
 * 如果创建成功，直接返回新创建的Observer实例
 * 若已存在Observer实例，则直接返回已创建的实例 
*/
export function observe(value, asRootData) {
  if(!isObject(value)) return;
  let ob;
  if(hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    // 存在__ob__说明数据是响应式的
    ob = value.__ob__;
  } else {
    // 进行响应式数据的转换
    ob = new Observer(value);
  }
  return ob;
}

export function def(obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true,
  })
}


function protoArgument(target, src, keys) {
  target.__proto__ = src;
}

// 在浏览器不支持__proto__时，直接在数组上挂载拦截器中重定义的数组方法
function copyArgument(target, src, keys) {
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    defineReactive(target, key, src[key]);
  }
}
/*******************************key function start***********************************/ 
// 将数据转换为响应式数据
export function defineReactive(data, key, val){
  // 递归属性，转换为响应式
  if(isObject(val)) {
    new Observer(val)
  }
  // var dep = []; // 依赖
  /*
    数组的响应式转换处理，对于数组，在其数据上增加一个__ob__属性，
    通过__ob__可以获取到Observer实例，从而可以获取到数据对应的依赖
  */ 
  let childOb = observe(val); 
  let dep = new Dep();
  // 变化追踪
  Object.defineProperty(data, key, {
    enumerable: true,
    configurable: true,
    get: function() {
      // this.dep.push(window.target); // 收集依赖（假定依赖为window.target的一个函数）
      // this.dep.depend()
      dep.depend(); // 依赖收集
      if(childOb) {
        childOb.dep.depend(); // 收集数组的依赖
      }
      return val;
    },
    set: function(newVal) {
      if(val === newVal) {
        return
      }
      // this.dep.notify();
      // for (let i = 0; i < this.dep.length; i++) {
      //   // this.dep[i](val, newVal); // 触发依赖
      // }
      // data[key] = newVal
      val = newVal;
      dep.notify();// 依赖通知
    }
  })
}

// 依赖管理
export class Dep {
  constructor() {
    this.subs = [];
  }
  addSub(sub) {
    this.subs.push(sub);
  }
  removeSub(sub) {
    remove(this.subs, sub)
  }
  depend() {
    if(window.target) {
      this.addSub(window.target)
    }
  }
  notify() {
    const subs = this.subs.slice();
    for (let i = 0; i < subs.length; i++) {
      subs[i].update();
    }
  }
}

// 变化监测vm.$watch('a.b.c', function(newVal, oldVal){  // do something })
export default class Watcher {
  constructor(vm, expOrFn, callback) {
    this.vm = vm;
    // 执行this.getter，可以读取watcher所依赖的具体数据
    /*
      这里的parsePath方法用于处理传入的
      字符串（vm的data中对应的数据路径），
      将传入的字符串用.分割成数组，
      然后循环数组一层一层读取数据，
      最后拿到的obj就是目标读取数据
    */ 
    this.getter = parsePath(expOrFn); 
    this.callback = callback;
    this.value = this.get();
  }

  get() {
    window.target = this; // 指向了当前的watcher实例
    // 这里获取到目标数据，也就是触发两个getter，从而可以将对应的依赖（指向当前watcher实例）添加到了Dep中
    let value = this.getter.call(this.vm, this.vm);
    window.target = undefined;
    return value;
  }

  update() {
    const oldValue = this.value;
    this.value = this.get();
    this.callback.call(this.vm, this.value, oldValue)
  }
}

/*
递归侦测所有key
Observer类会附加到每一个被侦测的object上，
一旦被附加上，Observer会将object所有属性转换为getter/setter形式
来收集属性的依赖，并且当属性发生变化时会通知这些依赖
*/ 

const arrayProto = Array.prototype;

// 创建一个对象集成数组原型链
export const arrayMethods = Object.create(arrayProto);

;['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].forEach(function(method) {
  const original = arrayProto[method];
  // 使用Object.defineProperty将那些改变数组自身的方法进行封装
  Object.defineProperty(arrayMethods, method, {
    value: function mutator(...args) {
      let inserted; // 新增方法所对应的元素
      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break;
        case 'splice':
          inserted = args.splice(2); // 剔除前面两个参数
          break
        default:
          break;
      }
      // 数组变更时可以通过this访问到__ob__
      const ob = this.__ob__;
      if(inserted) {
        // 存在新增元素
        ob.observeArray(inserted); // 将新增元素转换为响应式的
      }
      // 向依赖发送变更通知
      ob.dep.notify();
      return original.apply(this, args);
    },
    enumerable: false,
    writable: true,
    configurable: true,
  })
})

const hasProto = '__proto__' in {};
const arrayKeys = Object.getOwnPropertyNames(arrayMethods);

export class Observer {
  constructor(value) {
    this.value = value;

    // 新增数组依赖列表
    this.dep = new Dep();
    def(value, '__ob__', this); // 把__ob__绑定在值上，并且指向当前的Observer实例

    if(Array.isArray(value)) {
      // 转换数组数据为响应式数据
      // value.__proto__ = arrayMethods; // 不是所有浏览器都支持属性访问原型
      const argument = hasProto ? protoArgument : copyArgument;
      argument(value, arrayMethods, arrayKeys);
      this.observeArray(value); // 数组子集同样也转换为响应式
    } else {
      this.walk(value)
    }
  }

  /**
   * walk会将每一个属性都转化为getter/setter形式来侦听变化
   * （只有数据类型为Object时被调用）
   * */ 
  walk(obj) {
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      defineReactive(obj, key, obj[key]);
    }
  }

  /**
   * 将数组中的每一项数据转换为响应式数据
   * */ 
  observeArray(items) {
    for (let i = 0; i < items.length; i++) {
      observe(items[i]); // 相当于递归将数组中的每一个元素执行一遍new Observer()
    }
  }
}

/*******************************key function***********************************/ 