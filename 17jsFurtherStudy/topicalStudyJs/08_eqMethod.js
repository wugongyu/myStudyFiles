// 相等比较
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