var container = document.getElementById('container');
var count = 1;
function getActionCount() {
  container.innerHTML = count++;
}
// container.onmousemove = getActionCount;
// var setUseAction = debounce(getActionCount, 1000, true);
// container.onmousemove = setUseAction;
// document.getElementById('button').addEventListener('click', function() {
//   setUseAction.cancel();
// })

/*防抖*/ 
function debounce(func, wait, immediate) {
  var timeout, result;
  var debounced = function() {
    var context = this;
    var args = arguments;
    if(timeout) clearTimeout(timeout);
    if(immediate) {
      // 如果已经执行过，不再执行。
      var callNow = !timeout;
      timeout = setTimeout(function() {
        timeout = null;
      }, wait);
      if(callNow) {
        result = func.apply(context, args);
      }
    } else {
      timeout = setTimeout(function() {
        func.apply(context, args);
      }, wait)
    }
    return result;
  }
  debounced.cancel = function() {
    clearTimeout(timeout);
    timeout = null;
  }
  return debounced;
}

// var setUseAction = throttle(getActionCount, 3000, {
//   trailing: false
// });
// container.onmousemove = setUseAction;
// document.getElementById('button').addEventListener('click', function() {

// })

/*节流*/ 
// 利用时间戳
function throttle1(func, wait) {
  var context, args;
  var previous = 0;
  return function() {
    var now = +new Date(); // 获取当前时间戳
    args = arguments;
    context = this;
    if(now - previous > wait) {
      func.apply(context, args);
      previous = now;
    }
  }
}

// 设置定时器
function throttle2(func, wait) {
  var context, args;
  var timeout;
  return function() {
    context = this;
    args = arguments;
    if(!timeout) {
      timeout = setTimeout(function(){
        func.apply(context, args);
        timeout = null;
      }, wait)
    }
  }
}

// 两者结合： 鼠标移入能立刻执行，停止触发的时候还能再执行一次
function throttle3(func, wait) {
  var context, args, timeout;
  var previous = 0;
  var later = function() {
    previous = +new Date();
    timeout = null;
    func.apply(context, args);
  }
  var throttled = function() {
    var now = +new Date();
    context = this;
    args = arguments
    // 下次触发func剩余的时间
    var remaining = wait - (now - previous);
    // 无剩余时间或修改了系统时间
    if(remaining <= 0 || remaining > wait) {
      if(timeout){
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func.apply(context, args);
    } else if(!timeout) {
      timeout = setTimeout(later, remaining);
    }
  }
  return throttled;
}
/*
优化
设置个 options 作为第三个参数，然后根据传的值判断到底哪种效果，约定:
leading：false 表示禁用第一次执行
trailing: false 表示禁用停止触发的回调
*/ 
function throttle(func, wait, options) {
  var context, args, timeout;
  var previous = 0;
  if (!options) options = {};
  var later = function() {
    previous = (options.leading === false) ? 0 : new Date().getTime();
    timeout = null;
    func.apply(context, args);
    if(!timeout) {
      context = args = null;
    }
  }
  var throttled = function() {
    context = this;
    args = arguments;
    var now = +new Date();
    if(!previous && options.leading === false) {
      previous = now;
    }
    var remaining = wait - (now - previous);
    if(remaining <= 0 || remaining > wait) {
      if(timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func.apply(context, args);
      if(!timeout) context = args = null;
    } else if(!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
  }
  throttled.cancel = function() {
    clearTimeout(timeout);
    timeout = null;
    previous = 0;
  }
  return throttled;
}

function throttleFinal(func, wait, options) {
  var context, args, timeout;
  var previous = 0;
  if(!options) options = {};
  var later = function() {
    previous = options.leading === false ? 0 : new Date().getTime();
    timeout = null;
    func.apply(context, args);
    if(!timeout) {
      context = args = null;
    }
  }
  var throttled = function() {
    context = this;
    args = arguments;
    var now = new Date().getTime();
    if(!previous && options.leading === false) previous = now;
    var remaining = wait - (now - previous);
    if(remaining <= 0 || remaining > wait) {
      if(timeout) {
        clearTimeout(timeout);
        timeout = null;
        if(!timeout) context = args = null;
      }
      previous = now;
      func.apply(context, args);
    } else if(!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
  }
  throttled.cancel = function() {
    clearTimeout(timeout);
    timeout = null;
    previous = 0;
  }
}

/*数组去重*/ 
// 兼容性好
function unique1(arr) {
  var res = [];
  for (var i = 0; i < arr.length; i++) {
    for(var j = 0; j < res.length; j++) {
      if(arr[i] === res[j]) break;
    }
    if(j === res.length) {
      res.push(arr[i]);
    }
  }
  return res;
}
var arrData = [1, 1, '1', '1']
console.log(unique1(arrData))


function unique2(arr) {
  var res = [];
  for(var i= 0; i < arr.length; i++) {
    var current = arr[i];
    // indexof简化内层循环
    if(res.indexOf(current) === -1) {
      res.push(current);
    }
  }
  return res;
}

// 排序后再去重
function unique3(arr) {
  var res = [];
  var previous;
  var sortedArr = arr.concat().sort();
  for (var index = 0; index < sortedArr.length; index++) {
    // 第一个 或相邻元素不相同
    if(!index || previous !== sortedArr[index]) {
      res.push(sortedArr[index])
    }
    previous = sortedArr[index];
  }
  return res;
}
console.log(unique3(arrData), 'unique3')


//isSorted - 表示函数传入的数组是否已排过序，如果为 true，将会采用更快的方法进行去重
// iteratee：传入一个函数，可以对每个元素进行重新的计算，然后根据处理的结果进行去重
function unique(arr, isSorted, iteratee) {
  var res = [];
  var previous = [];
  for (let i = 0; i < arr.length; i++) {
    var current = arr[i];
    var currentComputed = iteratee ? iteratee(current) : current;
    if(isSorted) {
      if(!i || previous !== currentComputed) {
        res.push(currentComputed);
        previous = currentComputed;
      }
    } else if(iteratee) {
      if(previous.indexOf(currentComputed) === -1) {
        previous.push(currentComputed);
        res.push(current);
        // 使用迭代函数处理后的元素，去重后，返回以前的元素
      }
    } else if(res.indexOf(current) === -1){
      res.push(current);
    }
  }
  return res;
}
var arrayData2 = [1, 1, 'a', 'A', 2, 2]
console.log(unique(arrayData2, false, function(item){
  return typeof item == 'string' ? item.toLowerCase() : item
}));

// 去重（区分对象）：优化后的键值对方法
function uniqueObjectArr(arr) {
  var obj = {}
  return arr.filter(function(item, index, arr) {
    var uniqueObjName = typeof item + JSON.stringify(item);
    return obj.hasOwnProperty(uniqueObjName) ? false : obj[uniqueObjName] = true;
  })
}

console.log(uniqueObjectArr([{value: 1}, {value: 2}, { value: 1 }]));

var fuzzyArray = [1, 1, '1', '1', null, null, undefined, undefined, new String('1'), new String('1'), /a/, /a/, NaN, NaN];
console.log(uniqueObjectArr(fuzzyArray));

function uniqueByes6(arr) {
  return [...new Set(arr)];
}

/*类型判断*/

var number = 1;          // [object Number]
var string = '123';      // [object String]
var boolean = true;      // [object Boolean]
var und = undefined;     // [object Undefined]
var nul = null;          // [object Null]
var obj = {a: 1}         // [object Object]
var array = [1, 2, 3];   // [object Array]
var date = new Date();   // [object Date]
var error = new Error(); // [object Error]
var reg = /a/g;          // [object RegExp]
var func = function a(){}; // [object Function]

// 类型判断
function checkType() {
  for (let i = 0; i < arguments.length; i++) {
    var type = Object.prototype.toString.call(arguments[i]);
    console.log(type);
  }
}
checkType(number, string, boolean, und, nul, obj, array, date, error,
  reg, func, Math, JSON);
// [object Math]
// [object JSON]
function a() {
  console.log(Object.prototype.toString.call(arguments)); // [object Arguments]
}

var class2Type = {};
"Number String Boolean Object Array Date Error RegExp Function".split(" ").map(function(item, index) {
  class2Type["[object " + item + ']'] = item.toLowerCase();
});
function checkTypeFinal(obj) {
  if(obj == null) {
    return obj + '';
  }
  var basicType = typeof obj;
  return (basicType === 'object' || basicType === 'function') ? 
  class2Type[Object.prototype.toString.call(obj)] || 'object' : basicType;
}

console.log(checkTypeFinal(func));

var toString = class2Type.toString;
var hasOwn = class2Type.hasOwnProperty;
// 判断是否为纯粹的对象（通过{} 和 new Object 创建的对象）
function isPlainObject(obj) {
  var proto, Ctor;
  if(!obj || toString.call(obj) !== '[object Object]') return false;
  proto = Object.getPrototypeOf(obj);
  // 没有原型的对象是纯粹的
  if(!proto) return true;
  Ctor = hasOwn.call(obj, 'constructor') && proto.constructor;
  // 在这里判断 Ctor 构造函数是不是 Object 构造函数，用于区分自定义构造函数和 Object 构造函数
  // hasOwn.toString 调用的其实是 Function.prototype.toString
  // 函数的 toString 方法会返回一个表示函数源代码的字符串。具体来说，包括 function关键字，形参列表，大括号，以及函数体中的内容。
  return typeof Ctor === 'function' && hasOwn.toString.call(Ctor) === hasOwn.toString.call(Object);
}

function isEmptyObject(obj) {
  var name;
  for (name in obj) {
    return false;
  }
  return true;
}

function isWindow(obj) {
  return obj !== null && obj === obj.window;
}

function isArrayLiske(obj) {
  var objLen = !!obj && 'length' in obj && obj.length;
  var objType = checkTypeFinal(obj);
  // 排除function和window对象
  if(objType === 'function' || isWindow(obj)) return false;
  /*
  isArrayLike 返回true，至少要满足三个条件之一：
    1. 是数组
    2. 长度为 0
    3. lengths 属性是大于 0 的数组，并且obj[length - 1]必须存在
  */  
  return objType === 'array' || objLen === 0 || (typeof objLen === 'number' 
  && objLen > 0 && objLen-1 in obj);
}


function isNodeType(obj) {
  return !!(obj && obj.nodeType === 1)
}

/*深浅拷贝*/ 
function shallowCopy(obj) {
  var objType = typeof obj;
  if(obj === null || objType !== 'object') return obj;
  var newObj = obj instanceof Array ? [] : {};
  for (var key in obj) {
    // for in 不仅遍历对象自身属性，还会遍历继承的inumerable 属性，这里只拷贝自身属性，所以需要使用hasOwnProperty判断
    if (Object.hasOwnProperty.call(obj, key)) {
      newObj[k] = obj[key];
      
    }
  }
  return newObj;
}

console.log(shallowCopy(null));

function deepClone(obj) {
  if(obj === null || typeof obj !== 'object') return obj;
  var newObj = obj instanceof Array ? [] : {};
  for (var key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      newObj[key] = (obj === null || typeof obj !== 'object') ? obj[key] : deepClone(obj[key]);
    }
  }
  return newObj;
}

var cloneOriginObj = {
  name: '1',
  value: 16,
  z: null,
  arr: [1, 2,44]
}

var newCloneObj = deepClone(cloneOriginObj);
newCloneObj.arr.push(88);
console.log(newCloneObj, cloneOriginObj);


