import Vue from "vue";

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

/**判断所传入的值是否为一个有效的数组索引
 * 一个有效的数组索引是一个在 0 到 2^32 - 2（即 4294967294）之间的整数，
 * 且作为字符串属性名时，其规范化形式与自身严格相等
 * （即不能有前导零、正负号、空格、小数点或其他非数字字符）
*/
const MAX_ARR_INDEX_VALUE = 4294967294;
function isValidArrayIndex(val) {
  if(typeof val === 'number') {
    return Number.isInteger(val) && val >=0 && val <= MAX_ARR_INDEX_VALUE;
  }
  if(typeof val === 'string') {
    const num = Number(val);
    // 这里num.toString() === val的全等判断会自动排除前导零、空格、正负号、小数点、科学计数法等非法格式
    return Number.isInteger(num) && num >=0 && num <= MAX_ARR_INDEX_VALUE && num.toString() === val;
  }
  // 其他类型（布尔值、对象、函数、undefined、null、BigInt 等）均不是有效索引
  return false;
}

/*******************************core function start***********************************/ 
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

let uid = 0;
// 依赖管理
export class Dep {
  constructor() {
    this.id = uid++;
    this.subs = [];
  }
  addSub(sub) {
    this.subs.push(sub);
  }
  removeSub(sub) {
    const index = this.subs.indexOf(sub);
    if(index > -1) {
      return this.subs.splice(index, 1);
    }
  }
  depend() {
    if(window.target) {
      // this.addSub(window.target)
      window.target.addDep(this); // 
    }
  }
  notify() {
    const subs = this.subs.slice();
    for (let i = 0; i < subs.length; i++) {
      subs[i].update();
    }
  }
}

const seenObjects = new Set(); // 记录已监听数据对象，保证不会重复收集依赖
/*
递归实现数据的深度监听
*/ 
export function traverse(val) {
  _traverse(val, seenObjects);
  seenObjects.clear();
} 

function _traverse(val, seen) {
  let i, keys;
  const isArr = Array.isArray(val);
  if((!isArr && !isObject(val)) || Object.isFrozen(val)) return;
  if(val.__ob__) {
    const depId = val.__ob__.dep.id;
    if(seen.has(depId)) return;
    seen.add(depId);
  }
  if(isArr) {
    i = val.length;
    while(i--) _traverse(val[i], seen);
  } else {
    keys = Object.keys(val);
    i = keys.length;
    while(i--) _traverse(val[keys[i]], seen);
  }
}

// 变化监测vm.$watch('a.b.c', function(newVal, oldVal){  // do something })
export default class Watcher {
  constructor(vm, expOrFn, callback, options) {
    this.vm = vm;

    if(options) {
      this.deep = options.deep;
    }

    this.deps = []; 
    this.depIds = new Set();
    // 执行this.getter，可以读取watcher所依赖的具体数据
    // expOrFn支持传入函数
    if(typeof expOrFn === 'function') {
      this.getter = expOrFn
    } else {
      /*
        这里的parsePath方法用于处理传入的
        字符串（vm的data中对应的数据路径），
        将传入的字符串用.分割成数组，
        然后循环数组一层一层读取数据，
        最后拿到的obj就是目标读取数据
      */ 
      this.getter = parsePath(expOrFn); 
    }
    this.callback = callback;
    this.value = this.get();
  }

  get() {
    window.target = this; // 指向了当前的watcher实例
    // 这里获取到目标数据，也就是触发两个getter，从而可以将对应的依赖（指向当前watcher实例）添加到了Dep中
    let value = this.getter.call(this.vm, this.vm);
    if(this.deep) {
      // 使用traverse函数递归value的所有子值来触发收集依赖的功能
      traverse(value);
    }
    window.target = undefined;
    return value;
  }

  update() {
    const oldValue = this.value;
    this.value = this.get();
    this.callback.call(this.vm, this.value, oldValue)
  }

  /**
   * 在watcher中需要记录自己订阅了谁，及watcher实例被收集进了那些dep里
   * addDep即记录watcher实例所订阅的dep
   * */ 
  addDep(dep) {
    const id = dep.id;
    this.depIds.add(id);
    this.deps.push(dep);
    dep.addSub(this);
  }

  /**
   * 将自身从依赖列表中移除掉
   * */ 
  teardown() {
    let i = this.deps.length;
    while(i--) {
      this.deps[i].removeSub(this);
    } 
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

Vue.prototype.$watch = function(expOrFn, cb, options) {
  const vm = this;
  options = options || {};
  const watcher = new Watcher(vm, expOrFn, cb, options);
  if(options.immediate) {
    cb.call(vm, watcher.value);
  }
  return function unwatch() {
    watcher.teardown();
  }
}

Vue.prototype.$set = function(target, key, val) {
  if(Array.isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key);
    target.splice(key, 1, val);
    return val;
  }
  // 已存在于对象中的值
  if(key in target && !(key in target.prototype)) {
    target[key] = val;
    return val;
  }

  // 新增属性
  const ob = target.__ob__;
  if(target._isVue || (ob && ob.vmCount)) {
    // 注意target不能是vue.js实例或vue.js实例的跟数据对象
    process.env.NODE_ENV !== 'production' && warn(
      'avoid adding reactive properties to a Vue instance or its root $data ' +
      'at runtime - declare it upfront in the data option'
    );
    return val;
  }
  if(!ob) {
    // 原对象非响应式数据，直接返回
    target[key] = val;
    return val
  }
  // 将数据转化为响应式数据并进行视图通知
  defineReactive(target, key, val);
  ob.dep.notify();
  return val;
}

Vue.prototype.$delete = function(target, key) {
  if(Array.isArray(target) && isValidArrayIndex(key)) {
    target.splice(key, 1); // 数组使用splice方法，数组拦截器会自动向依赖发送通知
    return
  }
  const ob = target.__ob__;
  // 注意target不能是vue.js实例或vue.js实例的跟数据对象
  if(target._isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid deleting properties on a Vue instance or its root $data ' +
      '- just set it to null.'
    )
    return;
  }
  if(!hasOwn(target, key)) return; // 删除的为非自身对象
  delete target[key];
  if(!ob) return; // target为非响应式数据
  ob.dep.notify();
}

/*******************************core function end***********************************/ 