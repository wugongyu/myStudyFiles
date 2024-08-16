var container = document.getElementById('container');
var count = 1;
var _ = {};
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

function isArrayLike(obj) {
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

function extend1() {
  var target = arguments[0];
  for (var i = 1; i < arguments.length; i++) {
    var currentItem = arguments[i];
    if(currentItem != null) {
      for (var name in currentItem) {
        var copyItem = currentItem[name];
        if(copyItem !== undefined) {
          target[name] = copyItem;
        }
      }
    }
  }
  return target;
}
var extendObj1 = {
  a: 1,
  b: { b1: 1, b2: 2 }
};

var extendObj2 = {
  b: { b1: 3, b3: 4 },
  c: 3
};

var extendObj3 = {
  d: 4
}
// var copyExtendObj = extend1(extendObj1, extendObj2, extendObj3)
// copyExtendObj.b.b1 = 55
// console.log(copyExtendObj, extendObj2);

function extend2() {
  var deep = false; // 是否深克隆，默认否
  var target = arguments[0] || {};
  var copyIsArray;
  var i = 1;
  if(typeof target === 'boolean') {
    deep = target;
    target = arguments[i] || {};
    i++;
  }
  // 非对象，非函数，target设置为{}
  if(typeof target !== 'object' && checkTypeFinal(target) !== 'function') {
    target = {};
  }
  for (; i < arguments.length; i++) {
    var currentItem = arguments[i];
    if(currentItem != null) {
      for (var name in currentItem) {
        var srcItem = target[name];
        var copyItem = currentItem[name];
        var tempSrcItem;
        // 解决循环引用：判断要复制的对象属性是否等于 target，如果等于，则跳过此次循环
        if(copyItem === target) {
          continue;
        }
        /*
        判断目标属性值跟要复制的对象的属性值类型是否一致:
          如果待复制对象属性值类型为数组，目标属性值类型不为数组的话，目标属性值就设为 []
          如果待复制对象属性值类型为对象，目标属性值类型不为对象的话，目标属性值就设为 {}
        */ 
        if(deep && copyItem && (isPlainObject(copyItem) || 
          (copyIsArray = Array.isArray(copyItem)))) {
          if(copyIsArray) {
            copyIsArray = false;
            tempSrcItem = srcItem && Array.isArray(srcItem) ? srcItem : []; 
          } else {
            tempSrcItem = srcItem && isPlainObject(srcItem) ? srcItem : {};
          }
          target[name] = extend2(deep, tempSrcItem, copyItem);
        } else if(copyItem !== undefined) {
          target[name] = copyItem;
        }
      }
    } 
  }
  return target;
}

var copyExtendObj1 = extend2(true, extendObj1, extendObj2, extendObj3)
copyExtendObj1.b.b1 = 55
console.log(copyExtendObj1, extendObj2);



var a = extend2(true, [4, 5, 6, 7, 8, 9], [1, 2, 3]);
console.log(a)

var obj1 = {
  value: {
      3: 1
  }
}

var obj2 = {
  value: [5, 6, 7],

}

var b = extend2(true, obj1, obj2)
console.log(obj1); // 此时obj1已经被改变
var c = extend2(true, obj2, obj1)
// console.log(b);
console.log(c);

// 数组扁平化
function flatten(arr) {
  var result = [];
  for (var i = 0; i < arr.length; i++) {
    if(Array.isArray(arr[i])) {
      result = result.concat(flatten(arr[i]))
    } else {
      result.push(arr[i]);
    }
  }
  return result;
}

var arr = [1, [2, [3, 4]]];
console.log(flatten(arr));

function flatten2(arr) {
  return arr.reduce(function(prev, current) {
    return prev.concat(Array.isArray(current) ? flatten2(current) : current)
  }, [])
}
console.log(flatten2(arr));

function flatten3(arr) {
  while(arr.some(function(item) {
    return Array.isArray(item)
  })) {
    arr = [].concat(...arr);
  }
  return arr;
}


console.log(flatten3(arr));

/*
 * @param  {Array} input   要处理的数组
 * @param  {boolean} shallow 是否只扁平一层
 * @param  {boolean} strict  是否严格处理元素
 * 当遍历数组元素时，如果元素不是数组，就会对 strict 取反的结果进行判断，
 * 如果设置 strict 为 true，就会跳过不进行任何处理，这意味着可以过滤非数组的元素
 * @param  {Array} output  这是为了方便递归而传递的参数
*/ 
function flattenFinal(input, shallow, strict, output) {
  output = output || [];
  var idIndex = output.length;
  for (var i = 0; i < input.length; i++) {
    var current = input[i];
    if(Array.isArray(current)) {
      if(shallow) {
        var j = 0;
        while (j < current.length) {
          output[idIndex++] = current[j++];
        }
      } else {
        flattenFinal(current, shallow, strict, output);
        idIndex = output.length;
      }
    } else if(!strict){
      output[idIndex++] = current;
    }
  }
  return output
}

console.log(flattenFinal([1, 2, [3, 4]], true, true)); // [3, 4]

_.flatten = function(array, shallow) {
  return flattenFinal(array, shallow, false);
}
// 传入多个数组，然后返回传入的数组的并集（跳过传入的非数组参数）
_.union = function() {
  var result = flattenFinal(arguments, true, true); // 扁平化数组, 跳过传入的非数组参数
  return Array.from(new Set(result)); // 数组去重
}

console.log(_.union([1, 2, 3], [101, 2, 1, 10], 4, 5));

// 取出来自 array 数组，并且不存在于多个 other 数组的元素（跳过传入的非数组参数）



_.difference = function(array, ...rest) {
  rest = flattenFinal(rest, true, true);
  return array.filter(function(item) {
    return rest.indexOf(item) === -1;
  })
}

/*元素查找*/ 
function createIndexFinder1(dir) {
  return function(array, indicator, context) {
    var i = dir > 0 ? 0 : array.length - 1
    for (; i >= 0 && i < array.length; i += dir) {
      if(indicator.call(context, array[i], i, array)) return i;
    }
    return -1;
  }
}
var findIndex = createIndexFinder1(1);
var findLastIndex = createIndexFinder1(-1);

console.log(findIndex([10, 20, 20, 30, 40, 50], function(item) {
  return item === 20
})); // 1

// 有序数组使用二分查找法插入相应元素，返回插入位置下标
function sortedIndex(array, obj) {
  var low = 0;
  var high = array.length;
  while(low < high) {
    var mid = Math.floor((low + high) / 2);
    if(array[mid] < obj) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  return high;
}

function contextBind(fn, context) {
  return function(obj) {
    return fn ? fn.call(context, obj) : obj;
  }
}

// iteratee对数组的每一个元素进行处理 context-指定的上下文
function sortedIndexFinal(array, obj, iteratee, context) {
  iteratee = contextBind(iteratee, context);
  var low = 0, high = array.length;
  while(low < high) {
    var mid = Math.floor((low + high) / 2);
    if(iteratee(array[mid]) < iteratee(obj)) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  return high;
}

console.log(sortedIndexFinal([10, 20, 30, 40, 50], 35)) // 3

/*
创建indexOf，lastIndexOf
@param dir 正数--创建indexOf，负数--创建lastIndexOf
return function
function 参数：
  @param array查询数组
  @param item 查询项
  @param idIndex 开始查找位置

数组的 indexOf 参数 fromIndex：
设定开始查找的位置。如果该索引值大于或等于数组长度，
意味着不会在数组里查找，返回 -1。
如果参数中提供的索引值是一个负值，则将其作为数组末尾的一个抵消，即 -1 表示从最后一个元素开始查找，
-2 表示从倒数第二个元素开始查找 ，以此类推。 
注意：如果参数中提供的索引值是一个负值，仍然从前向后查询数组。
如果抵消后的索引值仍小于 0，则整个数组都将会被查询。其默认值为 0。

lastIndexOf 的 fromIndex：
从此位置开始逆向查找。默认为数组的长度减 1，即整个数组都被查找。
如果该值大于或等于数组的长度，则整个数组会被查找。
如果为负值，将其视为从数组末尾向前的偏移。
即使该值为负，数组仍然会被从后向前查找。
如果该值为负时，其绝对值大于数组长度，则方法返回 -1，即数组不会被查找。
*/
function createIndexOfFinder1(dir) {
  return function(array, item, idIndex) {
    var length = array.length;
    var i = 0;
    if(typeof dir === 'number') {
      if(dir > 0) {
        i = idIndex >= 0 ? idIndex : Math.max(idIndex + length, 0);
      } else {
        length = idIndex >= 0 ? Math.min(idIndex + 1, length) : (idIndex + length + 1);
      }
    }
    for (idIndex = (dir > 0 ? i : length -1); idIndex >= 0 && idIndex < length; idIndex += dir) {
      if(array[idIndex] === item) return;
    }
    return -1;
  }
}

// var indexOf = createIndexOfFinder1(1);
// var lastIndexOf = createIndexOfFinder1(-1);

/*
优化：
1. 支持查找NaN
2. 支持有序数组二分法查找
*/ 
function createIndexOfFinderFinal(dir, indicate, sortedIndex) {
  return function (array, findItem, idIndex) {
    var i = 0, length = array.length;
    if(typeof dir === 'number') {
      if(dir > 0) {
        // 确定正向起始位置
        i = idIndex >= 0 ? idIndex : Math.max(length + idIndex, 0);
      } else {
        // 确定逆向起始位置
        length = idIndex >= 0 ? Math.min(idIndex + 1, length) : (idIndex + length + 1);
      }
    } else if(sortedIndex && idIndex && length) {
      // 第三个参数idIndex不传开始搜索的下标值，而是一个布尔值 true，就认为数组是一个排好序的数组，这时候，就会采用更快的二分法进行查找
      idIndex = sortedIndexFinal(array, findItem);
      // 如果该插入的位置的值正好等于元素的值，说明是第一个符合要求的值
      return array[idIndex] === findItem ? idIndex : -1;
    }
    if(findItem !== findItem) {
      // 判断查找元素是否NaN
      idIndex = indicate(array.slice(i, length), isNaN);
      return idIndex >= 0 ? idIndex + i : -1;
    }
    for (idIndex = (dir > 0 ? i : length - 1); idIndex >= 0 && idIndex < length; idIndex += dir) {
      if(array[idIndex] === findItem) return idIndex;
    }
    return -1;
  }
}

var indexOf = createIndexOfFinderFinal(1, findIndex, sortedIndexFinal);
var lastIndexOf = createIndexOfFinder1(-1, findLastIndex, sortedIndexFinal);


/*
each的实现
*/ 
function eachWithCall(obj, callback) {
  var i = 0, length;
  if(isArrayLike(obj)) {
    length = obj.length;
    for (; i < length; i++) {
      if(callback.call(obj[i], i, obj[i]) === false) {
        break;
      }
    }
  } else {
    for (i in obj) {
      if (Object.hasOwnProperty.call(obj, i)) {
        if(callback.call(obj[i], i, obj[i])=== false) {
          break;
        }
      }
    }
  }
  return obj;
}

function eachNormal(obj, callback) {
  var i = 0, length;
  if(isArrayLike(obj)){
    length = obj.length;
    for (; i < length; i++) {
      callback(i, obj[i]);
    }
  } else {
    for (i in obj) {
      if (Object.hasOwnProperty.call(obj, i)) {
        callback(i, obj[i]);
      }
    }
  }
  return obj;
}

var testArr = Array.from({length: 1000000}, (v, i) => i);


console.time('for loop');
var forLoopResult = 0;
for (let index = 0; index < testArr.length; index++) {
  forLoopResult += testArr[index];
}
console.timeEnd('for loop');

console.time('eachNormal loop');
var eachNormalLoopResult = 0;
eachNormal(testArr, function(i, item) {
  eachNormalLoopResult += item;
})
console.timeEnd('eachNormal loop');

console.time('eachWithCall loop');
var eachWithCallResult = 0;
eachWithCall(testArr, function(i, item) {
  eachWithCallResult += item;
})
console.timeEnd('eachWithCall loop');

/*
for loop: 13.4189453125 ms
eachNormal loop: 11.755126953125 ms
eachWithCall loop: 29.492919921875 ms
通过时长对比，由此可以推测出，call 会导致性能损失，但也正是 call 的存在，才能将 this 指向循环中当前的元素。
有利有弊。
*/ 

function eq(a, b, aStack, bStack) {
  // a === b为true时，正确区分正负零
  if(a === b) return a !== 0 || (1 / a === 1 / b);
  /*
  typeOf null 结果为object，提早结束以免干扰后续判断。
  （这里判断的情况为a,b其一为null值，另一个不为null值，它们===比较的结果一定为false）
  【注意】null== undefined 结果 true
  */ 
  if(a == null || b == null) return false;
  // 判断NaN(利用 NaN 不等于自身的特性)
  if(a !== a) return b !== b;

  var typeA = typeof a;
  if(typeA !== 'function' && typeA !== 'object' && typeof b !== 'object') return false;
  // 复杂的数据进行深层次的判断
  return deepEq(a, b, aStack, bStack);
}
// aStack 和 bStack，用来储存 a 和 b 递归比较过程中的 a 和 b 的值
function deepEq(a, b, aStack, bStack) {
  // 复杂的对象类型，比如String、Boolean、Number、RegExp、Date等，则根据a与b toString 的class结果进行判断
  var toString = Object.prototype.toString;
  function isFunction(params) {
    return toString.call(params) === '[object Function]';
  }
  var classNameA = toString.call(a);
  var classNameB = toString.call(b);
  if(classNameA !== classNameB) return false;
  switch(classNameA) {
    case '[object RegExp]':
    case '[object String]':
      return ('' + a) === ('' + b);
    case 'object Number':
      if(+a !== +a) return +b !== +b;
      return +a === 0 ? (1 / a === 1 / b) : (+a === +b);
    case '[object Date]':
    case '[object Boolean]':
      return +a === +b;
  }
  var areArrays = classNameA === '[object Array]';
  // 不同构造函数创建的实例对象（判断两个不是同一个构造函数的实例对象是不相等的）
  if(!areArrays) {
    // 过滤非对象情况，即a, b为函数
    if(typeof a !== 'object' || typeof b !== 'object') return false;
    var aConstructor = a.constructor;
    var bConstructor = b.constructor;
    // aConstructor 和 bConstructor 必须都存在并且都不是 Object 构造函数的情况下，aConstructor 不等于 bConstructor， 那这两个对象就真的不相等
    // 如果 aConstructor 是函数，并且 aConstructor instanceof aConstructor 就说明 aConstructor 是 Object 函数
    if(
      aConstructor !== bConstructor 
      && !(isFunction(aConstructor) && aConstructor instanceof aConstructor
      && isFunction(bConstructor) && bConstructor instanceof bConstructor)
      && ('constructor' in  a && 'constructor' in b)
    ) {
      return false;
    }
  }
  var length;
  aStack = aStack || [];
  bStack = bStack || [];
  length = aStack.length;
  while(length--) {
    if(aStack[length] === a) {
      return bStack[length] === b;
    }
  }
  aStack.push(a);
  bStack.push(b);
  if(areArrays) {
    // 数组判断
    length = a.length;
    if(length !== b.length) return false;
    while(length--) {
      if(!eq(a[length], b[length], aStack, bStack)) return false;
    }
  } else {
    // 对象判断
    var keys = Object.keys(a), key;
    length = keys.length;
    if(length !== Object.keys(b).length) return false;
    while(length--) {
      key = keys[length];
      if(!(b.hasOwnProperty(key) && eq(a[key], b[key], aStack, bStack))) return false
    }
  }
  aStack.pop();
  bStack.pop();
  return true;
}

console.log(eq(0, 0)); // true
console.log(eq(-0, 0)); // false
console.log(eq(NaN, NaN)); // true
var a, b;

a = { foo: { b: { foo: { c: { foo: null } } } } };
b = { foo: { b: { foo: { c: { foo: null } } } } };
a.foo.b.foo.c.foo = a;
b.foo.b.foo.c.foo = b;

console.log(eq(a, b)) // true

console.log(eq(1, Number(1))); // true
console.log(eq('marry', new  String('marry'))); // true
console.log(eq(Number(NaN), Number(NaN))); // true

console.log(eq([1], [1])); // true
console.log(eq({ value: 1 }, { value: 1 })); // true
console.log(Object.prototype.toString.call(new String('hello')));








