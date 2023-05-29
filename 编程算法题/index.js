/* 旋转数组算法题

给定一个数组，将数组中的元素向右移动 k 个位置，其中 k 是非负数。

输入: [1, 2, 3, 4, 5, 6, 7] 和 k = 3
输出: [5, 6, 7, 1, 2, 3, 4]
解释:
向右旋转 1 步: [7, 1, 2, 3, 4, 5, 6]
向右旋转 2 步: [6, 7, 1, 2, 3, 4, 5]
向右旋转 3 步: [5, 6, 7, 1, 2, 3, 4] */

function rotate(arr, rotateNum){
  var len = arr.length;
  var step = rotateNum % len;
  var newArr = arr.splice(-step).concat(arr)
  return newArr;
}

function rotateArr(arr, rotateNum){
  var len = arr.length;
  var step = rotateNum % len;
  for(let i = 0; i < step; i++) {
    arr.unshift(arr.pop());
  }
  return arr;
}

console.log(rotate([1, 2, 4, 5, 99, 67],5));
console.log(rotateArr([1, 2, 4, 5, 99, 67], 5));

/**
 * 实现一个字符串匹配算法，从长度为 n 的字符串 S 中，查找是否存在字符串 T，T 的长度是 m，若存在返回所在位置
 * */ 
const findIndex = (S, T) => {
  if (S.length < T.length) return -1
  for (let i = 0; i < S.length; i++) {
    if (S.slice(i, i + T.length) === T) return i
  }
  return -1
}

/**
 * 随机生成一个长度为 10 的整数类型的数组，
 * 例如 [2, 10, 3, 4, 5, 11, 10, 11, 20]，
 * 将其排列成一个新数组，要求新数组形式如下，
 * 例如 [[2, 3, 4, 5], [10, 11], [20]]。
 * */ 
// 得到一个两数之间的随机整数，包括两个数在内
function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //含最大值，含最小值 
}
// 随机生成10个整数数组, 排序, 去重
let initArr = Array.from({ length: 10 }, (v) => { return getRandomIntInclusive(0, 99) });
initArr.sort((a,b) => { return a - b });
initArr = [...(new Set(initArr))];

function resetArrOrderList(arr) {
  // 放入hash表
  let obj = {};
  arr.map((i) => {
    const intNum = Math.floor(i/10);
    if (!obj[intNum]) obj[intNum] = [];
    obj[intNum].push(i);
  })

  // 输出结果
  const resArr = [];
  for(let i in obj) {
    resArr.push(obj[i]);
  }
  console.log(resArr);
  return resArr;
}

resetArrOrderList(initArr);


/**
 * 模拟实现一个 Promise.finally
 * */ 
Promise.prototype.finally = function (callback) {
  let P = this.constructor;
  return this.then(
    value  => P.resolve(callback()).then(() => value),
    reason => P.resolve(callback()).then(() => { throw reason })
  );
};

/**
 * 计算给定的两个数组的交集
 * */ 
// 方法1 复杂度 o(m, n)?
const insertSection = (...args) => {
  let [ first, second ] = args
  let res = []
  while (first.length) {
    let item = first.pop()  
    let index = second.indexOf (item)
    if (index > -1) {
      second.splice(index, 1)
      res.push(item)
    }
  }
  return res
}
// 方法2
const myInsertSection = (arr1, arr2) => {
  const newArrShort = arr1.length < arr2.length ? arr1 : arr2;
  const newArrLong = arr1.length > arr2.length ? arr1 : arr2;
  return newArrShort.filter(item => newArrLong.includes(item));
}

/**
 * 要求设计 LazyMan 类，实现以下功能。
LazyMan('Tony');
// Hi I am Tony

LazyMan('Tony').sleep(10).eat('lunch');
// Hi I am Tony
// 等待了10秒...
// I am eating lunch

LazyMan('Tony').eat('lunch').sleep(10).eat('dinner');
// Hi I am Tony
// I am eating lunch
// 等待了10秒...
// I am eating diner

LazyMan('Tony').eat('lunch').eat('dinner').sleepFirst(5).sleep(10).eat('junk food');
// Hi I am Tony
// 等待了5秒...
// I am eating lunch
// I am eating dinner
// 等待了10秒...
// I am eating junk food
 * 
*/
class LazyManClass {
  constructor(name) {
    this.taskList = [];
    this.name = name;
    console.log(`Hi I am ${this.name}`);
    setTimeout(() => {
      this.next();
    }, 0)
  }
  eat(thing) {
    var that = this;
    // 立即执行函数是为了在内部函数还没有执行的时候就
    // 已经为内部函数绑定好了对应参数的值，如果不用立即函数的话也可以用bind方法
    // var fn = function (tName){
    //   console.log(`I am eating ${tName}`)
    //   this.next()
    //  }.bind(null, thing);
    var fn = (function(tName){
      return function() {
        console.log(`I am eating ${tName}`);
        that.next();
      }
    })(thing);
    this.taskList.push(fn);
    return this;
  }
  sleep(time) {
    var that = this;
    var fn = (function(t){
      return function() {
        setTimeout(() => {
          console.log(`等待了${t}秒...`);
          that.next();
        }, t * 1000)
      }
    })(time);
    this.taskList.push(fn);
    return this;
  }
  sleepFirst(time) {
    var that = this;
    var fn = (function(t){
      return function() {
        setTimeout(() => {
          console.log(`等待了${t}秒...`);
          that.next();
        }, t * 1000)
      }
    })(time);
    this.taskList.unshift(fn);
    return this;
  }
  next() {
    var fn = this.taskList.shift();
    fn && fn();
  }
}

function LazyMan(name) {
  return new LazyManClass(name);
}
LazyMan('Tony').eat('lunch').eat('dinner').sleepFirst(5).sleep(4).eat('junk food');

/**
 * 某公司 1 到 12 月份的销售额存在一个对象里面
 * */ 
function changeObjToArr(){
  let obj = {1:222, 2:123, 5:888};
  const result = Array.from({ length: 12 }).map((_, index) => obj[index + 1] || null);
  console.log(result);
  return result;
}

/**
 * 实现 (5).add(3).minus(2) 功能
 * */ 
Number.prototype.add = function(n) {
  return this.valueOf() + n;
};
Number.prototype.minus = function(n) {
  return this.valueOf() - n;
};

/**
 * 实现一个 sleep 函数，比如 sleep(1000) 意味着等待1000毫秒，可从 Promise、Generator、Async/Await 等角度实现
 * */ 
const sleep = (time) => {
  return new Promise(resolve => setTimeout(resolve, time))
}

sleep(1000).then(() => {
    // 这里写你的骚操作
});

/**
 * 使用迭代的方式实现 flatten 函数(数组扁平化操作)
 * 注意递归与迭代的区别
 * */ 
let arr = [1, 2, [3, 4, 5, [6, 7], 8], 9, 10, [11, [12, 13]]]

const flatten = function (arr) {
    while (arr.some(item => Array.isArray(item))) {
        arr = [].concat(...arr)
    }
    return arr
}

console.log(flatten(arr));

/**
 * 请把俩个数组 [A1, A2, B1, B2, C1, C2, D1, D2] 和 [A, B, C, D]，
 * 合并为 [A1, A2, A, B1, B2, B, C1, C2, C, D1, D2, D]。
 * */ 
function concatArrs() {
  let leaderArr =["A1", "A2", "B1", "B2", "C1", "C2", "D1", "D2"];
  let  dependArr = ["A", "B", "C", "D"];
  const res = dependArr.reduce(
    (memo, item) => {
      const tmp = [...memo].reverse();
      const idx = memo.length - tmp.findIndex(i => i.startsWith(item)) - 1;
  
      return [...memo.slice(0, idx + 1), item, ...memo.slice(idx + 1)];
    },
    leaderArr
  );
  return res;
}

/**
 * 将数组扁平化并去除其中重复数据，最终得到一个升序且不重复的数组
 * */ 
function arrFlatternAndUnique() {
  Array.prototype.flat= function() {
    return [].concat(...this.map(item => (Array.isArray(item) ? item.flat() : [item])));
  }
  Array.prototype.unique = function() {
    return [...new Set(this)]
  }
  const sort = (a, b) => a - b;
  var arr = [ [1, 2, 2], [3, 4, 5, 5], [6, 7, 8, 9, [11, 12, [12, 13, [14] ] ] ], 10];
  const newArr = arr.flat().unique().sort(sort)
  console.log(newArr); // [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14 ]
}

/**
 * input 搜索如何防抖，如何处理中文输入
*/
var throttleInputEle = document.getElementById('throttle-input');
function myThrottle(timeout) {
  var timer;
  return function(e){
    if(e.target.composing) return;
    if(timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      console.log(e.target.value);
      timer = null;
    }, timeout);
  }
}

function onCompositionStart(e){
  e.target.composing = true;
  console.log('onCompositionStart')
}

function onCompositionEnd(e){
  e.target.composing = false;
  console.log('onCompositionEnd')
  var event = document.createEvent('HTMLEvents');
  event.initEvent('input');
  e.target.dispatchEvent(event);
}
console.log(throttleInputEle, document)
throttleInputEle.addEventListener('input', myThrottle(1000))
throttleInputEle.addEventListener('compositionstart', onCompositionStart);
throttleInputEle.addEventListener('compositionend', onCompositionEnd);




