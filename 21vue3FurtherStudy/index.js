// // 存储副作用函数
// const bucket = new Set();

// // 原始数据
// const data = {
//   text: 'hw',
// }
// // 代理数据
// const obj = new Proxy(data, {
//   get: function(target, key) {
//     bucket.add(effect);
//     return target[key]
//   },
//   set: function(target, key, val) {
//     target[key] = val;
//     // 取出副作用函数并执行
//     bucket.forEach(fn => fn())
//     return true;
//   }
// })

// // 副作用函数
// function effect() {
//   document.body.innerText = obj.text;
// }
// effect();
// setTimeout(() => {
//   obj.text = 'change text'
// }, 1000);

var activeEffect; // 定义一个全局变量用于存储副作用函数。
// effect函数用于注册副作用函数
function effect(fn) {
  // 赋值
  activeEffect = fn;
  // 执行副作用函数
  fn();
}

// opt: 在副作用函数与被操作的目标字段之间建立连接关系
const bucket2 = new WeakMap();
const obj2 = new Proxy(data, {
  get(target, key) {
    track(target, key);
    return target[key];
  },
  set(target, key, newVal) {
    target[key] = newVal;
    trigger(target, key);
  }

});

// 在get拦截函数内调用track追踪变化
function track(target, key) {
  if(!activeEffect) return;
  // 根据target获取depsMap，map类型：key -> effect
  const depsMap = bucket2.get(target);
  if(!depsMap) {
    // 不存在depsMap，新建一个map与target关联
    bucket2.set(target, ( depsMap = new Map() ));
  }
  // 根据key获取depsMap中的deps，类型为Set类型，
  // deps中存储所有与key相关的副作用函数effects
  const deps = depsMap.get(key);
  if(!deps) {
    // 不存在时新建一个与key关联的Set类型数据
    depsMap.set(key, (deps = new Set()));
  }
  // 当前激活的副作用函数放入deps桶中
  deps.add(activeEffect);
}


// 在set拦截函数内调用trigger来触发变化
function trigger(target, key) {
  const depsMap = bucket2.get(target);
  if(!depsMap) return;
  const effects = depsMap.get(key);
  effects && effects.forEach(fn => fn()); // 遍历执行副作用函数
}


// 脑子不用就会生锈
