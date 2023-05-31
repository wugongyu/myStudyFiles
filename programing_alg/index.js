/* 1、旋转数组算法题

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
 * 2、实现一个字符串匹配算法，从长度为 n 的字符串 S 中，查找是否存在字符串 T，T 的长度是 m，若存在返回所在位置
 * */ 
const findIndex = (S, T) => {
  if (S.length < T.length) return -1
  for (let i = 0; i < S.length; i++) {
    if (S.slice(i, i + T.length) === T) return i
  }
  return -1
}

/**
 * 3、随机生成一个长度为 10 的整数类型的数组，
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
 * 4、模拟实现一个 Promise.finally
 * */ 
Promise.prototype.finally = function (callback) {
  let P = this.constructor;
  return this.then(
    value  => P.resolve(callback()).then(() => value),
    reason => P.resolve(callback()).then(() => { throw reason })
  );
};

/**
 * 5、计算给定的两个数组的交集
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
 * 6、要求设计 LazyMan 类，实现以下功能。
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
 * 7、某公司 1 到 12 月份的销售额存在一个对象里面
 * */ 
function changeObjToArr(){
  let obj = {1:222, 2:123, 5:888};
  const result = Array.from({ length: 12 }).map((_, index) => obj[index + 1] || null);
  console.log(result);
  return result;
}

/**
 * 8、实现 (5).add(3).minus(2) 功能
 * */ 
Number.prototype.add = function(n) {
  return this.valueOf() + n;
};
Number.prototype.minus = function(n) {
  return this.valueOf() - n;
};

/**
 * 9、实现一个 sleep 函数，比如 sleep(1000) 意味着等待1000毫秒，可从 Promise、Generator、Async/Await 等角度实现
 * */ 
const sleep = (time) => {
  return new Promise(resolve => setTimeout(resolve, time))
}

sleep(1000).then(() => {
    // 这里写你的骚操作
});

/**
 * 10、使用迭代的方式实现 flatten 函数(数组扁平化操作)
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
 * 11、请把俩个数组 [A1, A2, B1, B2, C1, C2, D1, D2] 和 [A, B, C, D]，
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
 * 12、将数组扁平化并去除其中重复数据，最终得到一个升序且不重复的数组
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
 *13、input 搜索 防抖， 处理中文输入
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


/**
 * 14、promise.all 的实现，入参为promise数组，返回值为promise
 * 仅当入参所有的promise的结果值均为resolved时才返回成功的结果，结果值为所有成功值构成的数组。
 * 倘若有一个入参的promise结果为rejected，即立即返回该失败的结果。
 * */
function myPromiseAll(promises){
  return new Promise((resolve, reject) => {
    if(!Array.isArray(promises)) {
      return reject(new TypeError('argument must bu an array'));
    }
    let countNum = 0;
    let promiseLength = promises.length;
    let resolvedvalue = new Array(promiseLength);
    for (let i = 0; i < promiseLength; i++) {
      Promise.resolve(promises[i]).then((value) => {
        countNum++;
        resolvedvalue[i] = value;
        if(countNum === promiseLength) {
          return resolve(resolvedvalue)
        }
      }, (reason) => {
        return reject(reason);
      })
      
    }
  })
}

let p1=Promise.resolve(1),
p2=Promise.resolve(2),
p3=Promise.reject(3);
myPromiseAll([p1,p2,p3]).then((value) =>{
console.log(value)
}, (reason) => {
  console.log(reason);
})

/**
 * 15、打印出 1 - 10000 之间的所有对称数
  例如：121、1331 等
 * */ 
let matchNumResult = [...Array(10000).keys()].filter(item => {
  return item.toString().length > 1 && item.toString() === item.toString().split('').reverse().join('');
});
console.log(matchNumResult)

/**
 * 16、给定一个数组 nums，编写一个函数将所有 0 移动到数组的末尾，同时保持非零元素的相对顺序。
 * 示例:
  输入: [0,1,0,3,12]
  输出: [1,3,12,0,0]

  说明:
  必须在原数组上操作，不能拷贝额外的数组。
  尽量减少操作次数。
 * */ 

function zeroMoveToLast(arr){
  let len  = arr.length;
  let j = 0; // 记录零元素的数量
  // i < len - j这个条件可以忽略掉末尾添加的零元素
  for (let i = 0; i < len - j; i++) {
    if(arr[i] === 0) {
      arr.push(0); // 往原数组末尾添加一个0
      arr.splice(i, 1); // 删除当前零元素
      j ++;
      i --; // 删除当前零元素后,  索引前移一位，用于处理连续为零的情况
      // （当前元素被删除后，后一个零元素会往前移动，倘若下标不做处理，后一零元素会被忽略掉）
    }
  }
  return arr;
}
console.log(zeroMoveToLast([0, 1, 2, 3, 0, 5, 0, 0,6]))


/**
 * 17、冒泡排序
*/
const bubbleSort = (arr) => {
  let flag;
  for (let i = arr.length - 1; i >= 0;  i--) {
    flag = false;
    for (let j = 0; j < i; j++) {
      if(arr[j] > arr[j + 1]) {
        flag = true;
        // 交换数据位置
        [arr[j], arr[j + 1]] = [arr[j+1], arr[j]];
      }
    }
    // 如果j遍历，从头到尾都没有把swapedFlag置为true，就证明剩下的一段数组，本来就是按顺序的，就不用再遍历了
		if (!flag) {
			break;
		}
    
  }
}

/**
 * 18、请实现一个 add 函数，满足以下功能。
 *  add(1); 	// 1
    add(1)(2);  	// 3
    add(1)(2)(3)；  // 6
    add(1)(2, 3);   // 6
    add(1, 2)(3);   // 6
    add(1, 2, 3);   // 6
    高阶函数应用---柯里化
 * */ 

const curryReducer = (fn) => {
  return (...args) => {
    let runned = false; // 标记
    // 定义一个链式调用函数
    const chain = (...args) => {
      if(!args.length) return chain;
      // 记录结果，fn为处理函数，根据处理函数对参数进行操作，例如入参的累加等
      chain.acc = (runned ? [chain.acc] : []).concat(args).reduce(fn);
      // 将标记置为真
      !runned && (runned = true);
      return chain;
    };
    chain.acc = undefined;
    // 打印函数时会自动调用tostring方法
    chain.toString = () => chain.acc;
    return chain(...args);
  }
}

// * ---------------- simple add function

const add = curryReducer((a, e) => a + e);

// console.log('' + add(1, 2, 3)()(4, 5)(6)(7)(8, 9, 10));
// const method = {
//   add: (a, e) => a + e,
//   minus: (a, e) => a - e,
//   times: (a, e) => a * e,
//   devide: (a, e) => a / e,
// };
// Object.values(method).forEach((e) => {
//   console.log('batch test -------------- method is: ', e);
//   const chainFn = curryReducer(e);
//   console.log('' + chainFn());
//   console.log('' + chainFn(6));
//   console.log('' + chainFn(6, 2));
//   console.log('' + chainFn(6)(2));
//   console.log('' + chainFn()(6)(2));
//   console.log('' + chainFn(6, 2, 3));
//   console.log('' + chainFn(6, 2)(3));
//   console.log('' + chainFn(6)(2)(3));
// });

/**
 * 19、给定一个整数数组和一个目标值，找出数组中和为目标值的两个数。
    你可以假设每个输入只对应一种答案，且同样的元素不能被重复利用。
    示例：
    给定 nums = [2, 7, 11, 15], target = 9
    因为 nums[0] + nums[1] = 2 + 7 = 9
    所以返回 [0, 1]
 * */ 

function finTwoSumIndex(nums, target){
  if(!Array.isArray(nums)) {
    return new Error('first param must be an array');
  }
  const maps = {}; // 储存数组下标值
  const len = nums.length;
  for (let i = 0; i < len; i++) {
    let diff = target - nums[i];
    if(maps[diff] > -1) {
      // 在maps中找到对应差值的下标，立即返回两数的下标
      return [maps[diff], i];
    }
    maps[nums[i]] = i;
  }
  return [];
}

/**
 * 20、校验url是否合法
 * */ 
function validURL(url) {
  const reg = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/
  return reg.test(url)
}

/**
 * 21、convert 方法 实现 convert 方法，把原始 list 转换成树形结构，要求尽可能降低时间复杂度
 * 以下数据结构中，id 代表部门编号，name 是部门名称，parentId 是父部门编号，为 0 代表一级部门，现在要求实现一个 convert 方法，把原始 list 转换成树形结构，
 * parentId 为多少就挂载在该 id 的属性 children 数组下
 * */ 
// 原始 list 如下
let list =[
  {id:1,name:'部门A',parentId:0},
  {id:2,name:'部门B',parentId:0},
  {id:3,name:'部门C',parentId:1},
  {id:4,name:'部门D',parentId:1},
  {id:5,name:'部门E',parentId:2},
  {id:6,name:'部门F',parentId:3},
  {id:7,name:'部门G',parentId:2},
  {id:8,name:'部门H',parentId:4},
  {id:9,name:'部门j',parentId:5}
];

function convert(arr) {
  if(!Array.isArray(arr)) return [];
  let parentId = 0;
  return arr.filter(item => {
    const children = arr.filter(subItem => subItem.parentId === item.id);
    item.children = children;
    return item.parentId === parentId;
  })
}
// 利用深度优先算法dfs
function convert2(arr, parentId = 0){
  let trees = [];
  for(let item of arr) {
    if(item.parentId === parentId) {
      let children = convert2(arr, item.id);
      console.log(item, children)
      if(children.length) {
        item.children = children;
      }
      trees.push(item);
    }
  }
  return trees;
}

// console.log('convert', convert(list));
console.log('convert2', convert2(list));

/**
 * 22、promise.race
 * Promise.race(iterable) 方法返回一个 promise，
 * 一旦迭代器中的某个 promise 解决或拒绝，返回的 promise 就会解决或拒绝
 * 注意要判断一下参数是否是可迭代的
 * */ 
function isIterable(data, reject){
  let type = typeof data;
  if(!data[Symbol.iterator]){
    let errMsg = `${type} ${data} is not iterable (cannot read property Symbol(Symbol.iterator))`;
    if(reject) {
      reject(new TypeError(errMsg));
    } else {
      throw new TypeError(errMsg);
    }
  }
}

function _race(promises) {
  return new Promise((resolve, reject) => {
    isIterable(promises, reject);
    let promiseArr = [...promises];
    promiseArr.forEach(p => {
      if(!p instanceof Promise) {
        p = Promise.resolve(p);
      }
      p.then(resolve, reject);
    })
  })
}

const promise1 = new Promise((resolve, reject) => {
  setTimeout(resolve, 500, "one");
});

const promise2 = new Promise((resolve, reject) => {
  setTimeout(reject, 100, "two");
});

_race([promise1, promise2])
  .then((value) => {
    console.log("value", value);
    // Both resolve, but promise2 is faster
  })
  .catch((err) => {
    console.log("err", err);
  });



