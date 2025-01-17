/*
  响应系统
*/

/*
  注册副作用函数
*/ 

const bucket = new WeakMap(); // 存储副作用函数的桶

let activeEffect; // 全局变量用于存储被注册了的副作用函数
const effectStack = []; // 新增一个副作用函数栈，解决副作用函数嵌套问题

/*
  effect用于注册副作用函数
  options：
    1. 支持调度器scheduler传参，将控制权交给用户
    2： 支持lazy传参，只有非lazy的时候才执行副作用函数
*/ 
function effect(fn, options) {
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
  if(!activeEffect) return;
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

// 将副作用函数从存储的桶中取出来并调用（在set拦截函数内调用trigger函数触发变化）
function trigger(target, key) {
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
  })
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
*/ 

function watch(source, cb) {
  let getter;
  if(typeof source === 'function') {
    getter = source;
  } else {
    getter = traverse(source);
  }
  let newValue, oldValue;
  const effectFn = effect(
    () => {
      getter()
    }, // 递归的读取响应式数据，确保任意属性变化时能够触发回调函数的执行
    {
      scheduler() {
        newValue = effectFn(); // 获取新值
        cb(newValue, oldValue);// 数据变化时调用回调函数
        oldValue = newValue; // 更新旧值
      },
      lazy: true,
    }
  );
  oldValue = effectFn(); // 手动调用获取旧值
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
  应用
*/

let data = { ok: true, text: 'this is reactive test', foo: 1, bar: 2 };

const obj = new Proxy(data, {
  get(target, key) {
    track(target, key);
    return target[key];
  },
  set(target, key, newValue) {
    target[key] = newValue;
    trigger(target, key);
  }
})


function effectFn() {
  // document.body.innerText = obj.text;
  document.body.innerText = obj.ok ? obj.text : 'not';
}

effect(effectFn);

const customEffectFn = effect(() => {
  console.log(obj.text);
}, {
  lazy: true,
});
customEffectFn();

const sumRes = computed(() => {
  return obj.foo + obj.bar
});

effect(() => {
  console.log(sumRes.value)
});

obj.foo ++;

