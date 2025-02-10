/*
  响应系统
*/

/*
  注册副作用函数
*/ 

const bucket = new WeakMap(); // 存储副作用函数的桶

let activeEffect; // 全局变量用于存储被注册了的副作用函数
const effectStack = []; // 新增一个副作用函数栈，解决副作用函数嵌套问题
const ITERATE_KEY = Symbol(); // for...in循环追踪的key
const MAP_KEY_ITERATE_KEY = Symbol(); //  MAP类型的数据循环遍历key值时追踪的key
let shouldTrack = true; // 全局是否追踪标志，默认追踪

const TriggerType = {
  SET: 'SET',
  ADD: 'ADD',
  DELETE: 'DELETE',
}


/*
  effect用于注册副作用函数
  options：
    1. 支持调度器scheduler传参，将控制权交给用户
    2： 支持lazy传参，只有非lazy的时候才执行副作用函数
*/ 
function effect(fn, options = {}) {
  // activeEffect = fn; // 调用effect注册副作用函数时，将fn传值给activeEffect
  // fn();

  // 为解决遗留副作用函数导致的不必要的更新问题，需将与副作用函数相关联的依赖集合收起起来
  const effectFn = () => {
    cleanup(effectFn); // 在副作用函数执行之前，先将收集起来的依赖集合清除
    activeEffect = effectFn;

    effectStack.push(effectFn); // 在副作用函数执行之前将当前副作用函数压入栈
    
    const res = fn(); // fn执行结果

    effectStack.pop(); // 在副作用函数执行完毕之后将当前副作用函数弹出栈
    activeEffect = effectStack[effectStack.length - 1]; // activeEffect始终指向栈顶的副作用函数

    return res; // 将执行结果返回
  }

  effectFn.options = options; // 将options挂载在对应的副作用函数上

  effectFn.deps = []; // effectFn（activeEffect）.deps 用来存储与该副作用函数相关联的依赖集合
  if(!options.lazy) { // 只有非lazy的时候才执行副作用函数
    effectFn(); // 执行
  }
  return effectFn;
}

// 清除副作用函数中的依赖集合
function cleanup(effectFn) {
  for (let index = 0; index < effectFn.deps.length; index++) {
    const deps = effectFn.deps[index];
    deps.delete(effectFn); // 将effectFn从依赖集合中删除
  }
  effectFn.deps.length = 0; // 遍历完毕后重置依赖集合数组
}

// 将副作用函数activeEffect放到存储的bucket桶中（在get拦截函数内调用track函数追踪变化）
// 映射关系 target -> key -> effectFn (数据类型： WeakMap Map Set)
function track(target, key) {
  if(!activeEffect || !shouldTrack) return;
  let depsMap = bucket.get(target);
  if(!depsMap) {
    bucket.set(target, (depsMap = new Map()));
  }
  let deps = depsMap.get(key);
  if(!deps) {
    depsMap.set(key, (deps = new Set()))
  }
  deps.add(activeEffect);
  // deps即为与当前副作用函数存在联系的依赖集合
  activeEffect.deps.push(deps);
}

/*
将副作用函数从存储的桶中取出来并调用（在set拦截函数内调用trigger函数触发变化）
 type：TriggerType --操作类型
 newVal: 触发响应的新值
*/ 
function trigger(target, key, type, newVal) {
  let depsMap = bucket.get(target);
  if(!depsMap) return;
  const effects = depsMap.get(key);

  // effects && effects.forEach(fn => {
  //   fn()
  // }); 
  /*
  注意这里，在调用 forEach 遍历 Set 集合
  时，如果一个值已经被访问过了，但该值被删除并重新添加到集合，
  如果此时 forEach 遍历没有结束，那么该值会重新被访问。因此，上
  面的代码会无限执行。
  */

  // 构造一个新的Set集合再进行遍历
  const effectFnToRun  = new Set();
  effects && effects.forEach(fn => {
    if(fn !== activeEffect) {
      effectFnToRun.add(fn); // 避免无限递归调用：如果trigger触发执行的副作用函数与当前执行的副作用函数相同，则不触发执行。
    }
  });

  /*
    仅添加|删除属性的时候才触发与ITERATE_KEY相关联的副作用函数，以减少性能消耗
    如果操作类型是 SET，并且⽬标对象是 Map 类型的数据，
    也应该触发那些与 ITERATE_KEY 相关联的副作⽤函数重新执⾏
  */ 
  if([TriggerType.ADD, TriggerType.DELETE].includes(type) || 
    (type === TriggerType.SET && Object.prototype.toString.call(target) === '[object Map]')
  ) {
    const iterateEffects = depsMap.get(ITERATE_KEY); // 获取到与ITERATE_KEY相关联的副作用函数
    // 将与ITERATE_KEY相关的副作用函数添加到effectFnToRun中
    iterateEffects && iterateEffects.forEach(fn => {
      if(fn !== activeEffect) {
        effectFnToRun.add(fn);
      }
    })
  }

  /*
    操作类型为ADD|DELETE
    并且数据类型为map
    触发那些与 MAP_KEY_ITERATE_KEY 相关联的副作⽤函数重新执⾏
  */ 
  if([TriggerType.ADD, TriggerType.DELETE].includes(type) && 
    (Object.prototype.toString.call(target) === '[object Map]')
  ) {
    const mapKeyIterateEffects = depsMap.get(MAP_KEY_ITERATE_KEY);// 获取到与MAP_KEY_ITERATE_KEY相关联的副作用函数
    // 将与MAP_KEY_ITERATE_KEY相关的副作用函数添加到effectFnToRun中
    mapKeyIterateEffects && mapKeyIterateEffects.forEach(fn => {
      if(fn !== activeEffect) {
        effectFnToRun.add(fn);
      }
    })
  }

  // 当添加操作且操作对象为数组时
  if(TriggerType.ADD === type && Array.isArray(target)) {
    // 将与数组length相关联的副作用函数取出并添加到effectFnToRun中，待执行
    const lengthEffects = depsMap.get('length');
    lengthEffects && lengthEffects.forEach(fn => {
      if(fn !== activeEffect) {
        effectFnToRun.add(fn);
      }
    })
  }

  /*
  当修改数组 length 属性值时，只有那些索引值⼤于或等于新的 length 属
  性值的元素才需要触发响应。
  */ 

  if(Array.isArray(target) && key === 'length') {
    depsMap.forEach((dEffects, eKey) => {
      if(eKey >= newVal) {
        // 将索引值⼤于或等于新的 length 属性值的元素相关联的副作用函数取出并添加到待执行队列effectFnToRu中
        dEffects.forEach(fn => {
          if(fn !== activeEffect) {
            effectFnToRun.add(fn);
          }
        })
      }
    })
  }


  // 副作用函数的执行
  effectFnToRun && effectFnToRun.forEach((fn =>  {
      if(fn.options.scheduler) {
        fn.options.scheduler(fn); // 存在调度器，则调用调度器并回传当前副作用函数
      } else {
        fn(); // 直接执行副作用函数
      }
    }
    
  ))
}

/*
  计算属性computed与lazy

  计算属性：懒执行的副作用函数
*/ 

function computed(getter) {
  let value; // 缓存值
  let dirty = true; // 是否需要重新计算的标志，为true代表脏数据，需要计算
  const effectFn = effect(getter, {
    lazy: true,
    // 增加调度器，当值发生变化时，重置dirty
    scheduler() {
      if(!dirty) {
        dirty = true;
        trigger(obj, 'value'); // 当计算属性依赖的响应式数据发生变化时，手动调用trigger触发响应
      }
    },
  }); // 把getter作为副作用函数，创建一个lazy的effect
  const obj = {
    get value() {
      if(dirty) {
        value = effectFn()
        dirty = false; // 下一次读取数据时可直接用缓存值
      }
      track(obj, 'value'); // 当读取value时，手动调用track追踪
      return value;
    }
  }
  return obj;
}

/*
  监听属性
  source-响应式数据
  cb-回调函数
  options - 相关配置
  options.immediate --指定回调函数立即执行
  options.flush -- 指定回调函数执行时机  pre|post|sync
*/ 

function watch(source, cb, options = {}) {
  let getter;
  if(typeof source === 'function') {
    getter = source;
  } else {
    getter = traverse(source);
  }
  let cleanup; // 用来存储用户定义的过期回调
  // 定义onInValidate函数，用来给用户注册过期回调
  function onInValidate(fn) {
    cleanup = fn;
  }
  let newValue, oldValue;

  // 调度器逻辑抽取为独立函数
  const schedulerJob = () => {
    // 在执行回调函数cb之前先调用过期回调
    if(cleanup) {
      cleanup();
    }
    newValue = effectFn(); // 获取新值
    cb(newValue, oldValue, onInValidate);// 数据变化时调用回调函数, 传入onInValidate函数供用户注册过期回调
    oldValue = newValue; // 更新旧值
  }
  const effectFn = effect(
    () => {
      getter()
    }, // 递归的读取响应式数据，确保任意属性变化时能够触发回调函数的执行
    {
      // scheduler() {
      //   newValue = effectFn(); // 获取新值
      //   cb(newValue, oldValue);// 数据变化时调用回调函数
      //   oldValue = newValue; // 更新旧值
      // },
      scheduler: () => {
        if(options.flush === 'post') {
          // 调度函数需要将副作用函数放到微任务里，待DOM更新完毕之后再执行
          const p = Promise.resolve();
          p.then(schedulerJob);
        } else {
          schedulerJob();
        }
      },
      lazy: true,
    }
  );
  if(options.immediate) {
    schedulerJob(); // immediate为true时立即执行调度器函数，从而触发回调执行
  } else {
    oldValue = effectFn(); // 手动调用获取旧值
  }
}


function traverse(value, seen = new Set()) {
  if(typeof value !== 'object' || value === null || seen.has(value)) return; // 原始值数据或已读取过的数据，直接返回
  seen.add(value); // 添加到已遍历数据

  for (const k in value) {
    traverse(value[k], seen); // 使用 for...in 读取对象的每一个值，并递归地调用 traverse 进行处理 
  }
  return value;

}

/*
  重写数组includes| indexOf, lastIndexOf方法，
  解决直接把原始对象obj作为参数传递给
includes ⽅法，返回值为false的问题（原因为this指向代理对象）
*/ 
const arrayInstrumentations = {};

;['includes', 'indexOf', 'lastIndexOf'].forEach(method => {
  const originMethod = Array.prototype[method];
  arrayInstrumentations[method] = function(...args) {
    let res = originMethod.apply(this, args); // this指向的是代理对象，先在代理对象中查找
    if(res === false || res === -1) {
      res = originMethod.apply(this.raw, args); // this.row 为原始对象
    }
    return res;
  }
});

/*
重写数组方法push、pop、shift、unshift 以及 splice ⽅法
调整追踪方式
数组的 push 等⽅法在语义上是修改操作，⽽⾮读取操作，但是会间接读取length
属性，导致length属性与副作用函数之间建立了联系。
解决方法为： 重写对应方法，在调用方法时禁用追踪，调用结束后重启追踪，从而避免
建⽴响应联系所产⽣其他的副作⽤
*/ 
;['push', 'pop', 'shift', 'unshift', 'splice'].forEach(method => {
  const originMethod = Array.prototype[method];
  arrayInstrumentations[method] = function(...args) {
    shouldTrack = false;
    const res = originMethod(this, args); /* 当 push等 ⽅法间接读取
    length 属性值时，由于此时是禁⽌追踪的状态，所以 length 属性
    与副作⽤函数之间不会建⽴响应联系。 */ 
    shouldTrack = true;
    return res;
  }
});

/*
重写map，set数据类型的set, add等方法
*/ 

const mutableInstrumentations = {
  add(key) {
    const target = this.raw;
    const hadKey = target.has(key);
    const res = target.add(key);
    if(!hadKey) {
      trigger(target, key, TriggerType.ADD); // 值不存在时触发响应追踪
    }
    return res;
  },
  delete(key) {
    const target = this.raw;
    const hadKey = target.has(key);
    const res = target.delete(key)
    if(hadKey) {
      trigger(target, key, TriggerType.DELETE); // 删除成功触发响应追踪
    }
    return res;
  },
  get(key) {
    const target = this.raw;
    const hadKey = target.has(key);
    track(target, key); // 建立追踪依赖
    if(hadKey) {
      const res = target.get(key);
      return typeof res === 'object' ? reactive(res) : res; // 是否进一步包装为响应式数据
    }
  },
  set(key, value) {
    const target = this.raw;
    const hadKey = target.has(key);
    const oldValue = target.get(key);
    // target.set(key, value); // 会造成数据污染
    /*
    解决数据污染：在调⽤ target.set 函数设置值
    之前对值进⾏检查即可：只要发现即将要设置的值是响应式数据，那
    么就通过 raw 属性获取原始数据，再把原始数据设置到 target 上，
    */ 
   const rawValue = value.raw || value;
   target.set(key, rawValue);
    if(!hadKey) {
      trigger(target, key, TriggerType.ADD); // 新增
    } else if(value !== oldValue || (oldValue === oldValue && value === value)) {
      trigger(target, key, TriggerType.SET); // 修改
    }
  },
  forEach(callback, thisArgs) {
    const target = this.raw;
    const wrap = (val) => typeof val === 'object' ? reactive(val) : val;
    track(target, ITERATE_KEY);
    target.forEach((v, k) => {
      callback.call(thisArgs, wrap(v), wrap(k), this)
    })
  },
  /*
  当我们使⽤ for...of 循环迭代⼀个代理对象p时，内
  部会试图从代理对象 p 上读取 p[Symbol.iterator] 属性，这个操
  作会触发 get 拦截函数
  */ 
  [Symbol.iterator]: iterationMethod,
  entries: iterationMethod,
  values: valuesIterationMethod,
  keys: keysIterationMethod,
}


/*
自定义迭代函数
【注意】可迭代协议指的是⼀个对象实现了 Symbol.iterator ⽅法，⽽
迭代器协议指的是⼀个对象实现了 next ⽅法
*/ 

function iterationMethod() {
  const target = this.raw;
  const wrap = (val) => typeof val === 'object' ? reactive(val) : val;
  const itr = target[Symbol.iterator]();
  track(target, ITERATE_KEY)
  return {
    // 迭代器协议
    next() {
      const { value, done } = itr.next();
      return {
        value: value ? [wrap(value[0]), wrap(value[1])] : value,
        done,
      }
    },
    // 可迭代协议
    [Symbol.iterator]() {
      return this;
    }
  }
}

function valuesIterationMethod() {
  const target = this.raw;
  const wrap = (val) => typeof val === 'object' ? reactive(val) : val;
  const itr = target.values();
  track(target, ITERATE_KEY)
  return {
    // 迭代器协议
    next() {
      const { value, done } = itr.next();
      return {
        value: wrap(value),
        done,
      }
    },
    // 可迭代协议
    [Symbol.iterator]() {
      return this;
    }
  }
}

function keysIterationMethod() {
  const target = this.raw;
  const wrap = (val) => typeof val === 'object' ? reactive(val) : val;
  const itr = target.keys();
  /*
  调⽤ track 函数追踪依赖，在副作⽤函数与 MAP_KEY_ITERATE_KEY 之间
  建⽴响应联系，避免不必要的更新
  【注意】当循环遍历target.keys()时，修改了对应键的值时，对应键的副作用函数不应该执行，
  故keys与values\entries等方法区分使用追踪的key
  */ 
  track(target, MAP_KEY_ITERATE_KEY);
  return {
    // 迭代器协议
    next() {
      const { value, done } = itr.next();
      return {
        value: wrap(value),
        done,
      }
    },
    // 可迭代协议
    [Symbol.iterator]() {
      return this;
    }
  }
}


/*
  创建响应式数据
  isShallow -- 是否创建浅响应数据
  isReadonly -- 是否只可读
*/ 

function createReactive(obj, isShallow = false, isReadonly = false) {
  return new Proxy(obj, {
    // 拦截读取操作
    get(target, key, receiver) {
      if(key === 'raw') {
        // 代理对象可以通过raw属性访问原始数据
        return target;
      }

      // 当代理对象的原始对象数据类型为Set或Map时，访问代理对象size属性时会报错，此时需要修正this的指向，使得this指向原始对象
      if(key === 'size') {
        track(target, ITERATE_KEY)
        return Reflect.get(target, key, target);
      }

      // 不应该在副作⽤函数与 Symbol.iterator 这类 symbol值之间建⽴响应联系
      if(!isReadonly && typeof key !== 'symbol') {
        track(target, key);
      }

      // 拦截数组方法
      if(Array.isArray(target) && arrayInstrumentations.hasOwnProperty(key)) {
        return Reflect.get(arrayInstrumentations, key, receiver);
      }

      // 拦截Set与Map数据类型的方法
      if(['[object Map]', '[object Set]'].includes(Object.prototype.toString.call(target))) {
        // 返回定义在 mutableInstrumentations 对象下的⽅法
        console.log('in set map');
        // return Reflect.get(mutableInstrumentations, key, receiver);
        return mutableInstrumentations[key];
      }

      const res = Reflect.get(target, key, receiver);// 更正函数调用中的this指向问题
      if(isShallow) return res; // 浅层响应数据，直接返回
      if(typeof res === 'object' && res !== null) {
        return isReadonly ? readonly(res) : reactive(res); // 包装成只读 | 响应式数据并返回
      }
      // return target[key];
      return res;
    },
    // 拦截in操作符
    has(target, key) {
      track(target, key);
      return  Reflect.has(target, key);
    },
    /*
    拦截for...in循环
    （注意，当为对象添加/删除新属性，会对for...in循环次数产生影响，
    此时则需要触发与ITERATE_KEY相关联的副作用函数重新执行，
    而修改已有属性时，不会对for...in循环的执行次数产生影响
    ）
    */ 
    ownKeys(target) {
      track(target, Array.isArray(target) ? 'length' : ITERATE_KEY); // 建立副作用函数与ITERATE_KEY | length(数组)的联系
      return Reflect.ownKeys(target)
    },
    // 拦截设置操作
    set(target, key, newValue, receiver) {
      if(isReadonly) {
        console.warn(`属性${key}是只读的`); // 只读属性打印信息并返回
        return true;
      }
      const oldValue = target[key];
      let type;
      if(Array.isArray(target)) {
        // 代理目标为数组，检测当前设置的索引是否大于数组长度，是则为新增操作，否则为编辑操作
        type = Number(key) < target.length ? TriggerType.SET : TriggerType.ADD;
      } else {
        type = Object.prototype.hasOwnProperty.call(target, key) ? TriggerType.SET : TriggerType.ADD; // 获取当前设置操作的类型（添加ADD，修改SET）
      }
      // target[key] = newValue;
      const res = Reflect.set(target, key, newValue, receiver);

      if(target === receiver.raw) {
        // 只有当receiver是target 的代理对象时才进行更新，屏蔽由原型引起的重复更新问题

        if(oldValue !== newValue && (oldValue === oldValue || newValue === newValue)) {
          // 只有当新旧值不全等，或新旧值不都为NaN才触发响应（注意 NaN === NaN 结果为false， NaN !== NaN结果为true），减少不必要的更新
          trigger(target, key, type, newValue);
        }
      }
      
      return res;
    },
    // 拦截删除操作
    deleteProperty(target, key) {
      if(isReadonly) {
        console.warn(`属性${key}是只读的`); // 只读属性打印信息并返回
        return true;
      }
      const hadKey = Object.prototype.hasOwnProperty.call(target, key);
      const res = Reflect.deleteProperty(target, key);
      if(hadKey && res) {
        // 仅当删除的是对象自身的属性，并且成功删除时才触发更新
        trigger(target, key, TriggerType.DELETE);
      }
      return res;
    }
  })
}

const reactiveMap = new Map(); // 定义一个Map，存储原始对象到代理对象之间的映射


/*
响应式数据
*/ 
function reactive(obj) {
  const existProxy = reactiveMap.get(obj);
  if(existProxy) return existProxy; // 返回已有的代理对象
  const proxy = createReactive(obj);
  reactiveMap.set(obj, proxy);
  return proxy; // 返回新建代理对象
}

/*
  浅响应式数据
*/ 
function shallowReactive(obj) {
  return createReactive(obj, true);
}

/*
  只读响应式数据
*/ 
function readonly(obj) {
  return createReactive(obj, false, true);
}

/*
  只读浅响应式数据
*/ 
function shallowReadonly(obj) {
  return createReactive(obj, true, true);
}


/*
原始值的响应式
*/ 

function ref(val) {
  const wrapper = {
    value: val,
  };
  /*
    在wrapper上定义一个不可枚举的属性，用于区分reactive创建的是原始值还是非原始值响应式数据
  */ 
  Object.defineProperty(wrapper, '__v_isRef', { value: true });
  return reactive(wrapper);
}


/*
对响应式数据做了⼀层包装，或者叫作“访问代
理”
*/ 
function toRef(obj, key) {
  const wrapper = {
    get value() {
      return obj[key];
    },
    set value(val) {
      obj[key] = val;
    }
  }
  Object.defineProperty(wrapper, '__v_isRef', { value: true })
  return reactive(wrapper);
}

function toRefs(obj) {
  const result = {};
  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      result[key] = toRef(obj, key);
    }
  }
  return result;
}

/*
  实现自动脱ref|自动给ref设置值
    ⾃动脱 ref，指的是属
    性的访问⾏为，即如果读取的属性是⼀个 ref，则直接将该 ref 对应
    的 value 属性值返回
*/ 
function proxyRefs(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver);
      return res.__v_isRef ? res.value : res;
    },
    set(target, key, newVal, receiver) {
      const value = target[key];
      if(value.__v_isRef) {
        value.value = value;
        return true;
      }
      return Reflect.set(target, key, newVal, receiver);
    }
  })
}



/*
  应用
*/

let data = { ok: true, text: 'this is reactive test', foo: 1, bar: 2 };

const obj = reactive(data);


// function effectFn() {
//   // document.body.innerText = obj.text;
//   document.body.innerText = obj.ok ? obj.text : 'not';
// }

// effect(effectFn);

// const customEffectFn = effect(() => {
//   console.log(obj.text);
// }, {
//   lazy: true,
// });
// customEffectFn();

const sumRes = computed(() => {
  return obj.foo + obj.bar
});


window.onload = () => {
  effect(() => {
    const box = document.getElementById('text-wrapper');
    if(box) {
      box.innerText = sumRes.value;
    }
    console.log(sumRes.value)
  });
  const btnElement = document.getElementById('btn');
  console.log(btnElement);
  btnElement && btnElement.addEventListener('click', function() {
    obj.foo ++;
  })
}


const arr = reactive(['ts1']);

effect(() => {
  console.log(arr.length, 'arr.length');
  // for (const key in arr) {
  //   console.log(arr[key]);
  // }
  for (const val of arr) {
    console.log(val, 'arr val')
  }
});

arr[1] = 'ts2';

arr.length = 0;

const newObj = {};
const newArr = reactive([newObj]);
console.log(newArr.includes(newArr[0])); // true
console.log(newArr.includes(newObj)); // true

const setData = new Set([1, 2,3]);
const setProxy = reactive(setData);

effect(() => {
  console.log(setProxy.size, 'setProxy.size');
  // setProxy.forEach((val) => {
  //   console.log(val);
  // })
})
setProxy.delete(1);

const mapData = new Map([['key1', 'value1'], ['key2', 'value2']]);
const mapDataProxy = reactive(mapData);
effect(() => {
  for (const key of mapDataProxy.keys()) {
    console.log(key);
  }
})

mapDataProxy.set('key1', 'valuetest'); // 不触发响应
mapDataProxy.set('key3', 'valuetest3'); // 触发响应



