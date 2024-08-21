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